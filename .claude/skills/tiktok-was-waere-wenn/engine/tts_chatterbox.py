#!/usr/bin/env python3
"""Stufe 1 (Alternative, menschlicher): Voice-over mit Chatterbox Multilingual (Open Source, MIT, lokal, kostenlos)
und einer echten menschlichen Referenzstimme (Thorsten-Voice, CC0) in mehreren Emotionen.

Aufruf (im tts-venv):  python tts_chatterbox.py <projektordner>
Schreibt dieselben Dateien wie tts.py: build/voice.wav + build/timeline.json

script.json:
  "tts": "chatterbox",
  "refs_dir": "/home/user/models/thorsten/refs",     (neutral.wav, amused.wav, surprised.wav, whisper.wav)
  pro Segment: "emotion": "neutral|amused|surprised|whisper", "ex": 0.25–1.0 (Emotionsstärke), "cfg": 0.3–0.6
  (niedriger = ruhiger, bedachter), optional "fx": "radio", "gap_after".
Qualitätskontrolle: Jeder Satz wird mit Whisper nachgehört. Bei fehlenden/falschen Wörtern oder
Halluzinationen wird mit neuem Seed neu erzeugt (bis zu 4 Versuche, der beste gewinnt).
Wort-Zeitstempel kommen aus Whisper (word_timestamps) und werden auf die Untertitel-Tokens gemappt.
"""
import difflib, hashlib, json, os, re, subprocess, sys, wave

import numpy as np
import librosa
import torch
import torchaudio

SR = 48000
MODEL_DIR = os.environ.get("CHATTERBOX_DIR", "/home/user/models/chatterbox")
WHISPER_DIR = os.environ.get("WHISPER_DIR", "/home/user/models/whisper-small")


def norm(s):
    return re.sub(r"[^0-9a-zäöüß]", "", s.lower())


def split_sentences(text):
    out = []
    for p in re.split(r"(?<=[.?!…])\s+", text.strip()):
        if out and (not norm(p) or len([w for w in p.split() if norm(w)]) <= 1):
            out[-1] += " " + p  # Satzzeichen oder Ein-Wort-Satz an vorigen Satz hängen (Modell braucht Kontext)
        elif p:
            out.append(p)
    return out


def pause_after(s):
    s = s.rstrip("“”\"' ")
    if s.endswith("…"): return 0.42
    if s.endswith("?"): return 0.28
    if s.endswith("!"): return 0.26
    return 0.24


def trim(y, sr, top_db=38, pad=0.05):
    idx = librosa.effects.split(y, top_db=top_db)
    if len(idx) == 0:
        return y, 0.0
    a = max(0, idx[0][0] - int(pad * sr)); b = min(len(y), idx[-1][1] + int(pad * sr))
    return y[a:b], a / sr


def score(target, words):
    """Wortgenauigkeit 0..1 zwischen Skripttext und Whisper-Transkript."""
    a = [norm(w) for w in target.split() if norm(w)]
    b = [norm(w["w"]) for w in words if norm(w["w"])]
    if any(x.isdigit() for x in b):  # Whisper schreibt Zahlwörter als Ziffern -> nicht als Fehler zählen
        b = [x for x in b if not x.isdigit()]
        a = [x for x in a if not re.search(r"(hundert|tausend|zehn|zig|zwölf|elf)$", x)]
    sm = difflib.SequenceMatcher(a=a, b=b, autojunk=False)
    # zusätzlich zeichenweise vergleichen (Bindestrich-/Getrenntschreibung wie "Science Fiction" ist kein Fehler)
    cr = difflib.SequenceMatcher(a="".join(a), b="".join(b), autojunk=False).ratio()
    return max(sm.ratio(), cr if cr > 0.9 else 0)


def stretched(words):
    """Erkennt versteckte Wiederholungen/Gestammel: Whisper packt sie oft in ein einziges, viel zu langes Wort."""
    for w in words:
        n = len(norm(w["w"]))
        if n and (w["e"] - w["t"]) > max(0.95, 0.12 * n + 0.4):
            return True
    return False


def map_words(text, wwords, offset):
    """Untertitel-Tokens (Skript) bekommen Zeiten aus Whisper-Wörtern (fuzzy, Reihenfolge erhalten)."""
    toks = text.split()
    tn = [norm(t) for t in toks]
    wn = [norm(w["w"]) for w in wwords]
    sm = difflib.SequenceMatcher(a=tn, b=wn, autojunk=False)
    times = [None] * len(toks)
    for blk in sm.get_matching_blocks():
        for k in range(blk.size):
            w = wwords[blk.b + k]; times[blk.a + k] = (w["t"], w["e"])
    # nicht gematchte Tokens: zwischen Nachbarn interpolieren, nach Zeichenlänge gewichtet
    known = [i for i, t in enumerate(times) if t]
    if not known:
        T = wwords[-1]["e"] if wwords else 1.0
        tot = sum(len(t) for t in toks) or 1; c = 0
        for i, t in enumerate(toks):
            times[i] = (c / tot * T, (c + len(t)) / tot * T); c += len(t)
    else:
        for i in range(len(toks)):
            if times[i]: continue
            p = max([k for k in known if k < i], default=None); n = min([k for k in known if k > i], default=None)
            t0 = times[p][1] if p is not None else (times[n][0] - 0.3 if n is not None else 0)
            t1 = times[n][0] if n is not None else t0 + 0.35
            span = [j for j in range(i, (n if n is not None else len(toks))) if not times[j]]
            L = max(1, len(span)); k = span.index(i) if i in span else 0
            times[i] = (t0 + (t1 - t0) * k / L, t0 + (t1 - t0) * (k + 1) / L)
    out = []
    for tok, n, (a, b) in zip(toks, tn, times):
        if not n:
            if out: out[-1]["text"] += " " + tok
            continue
        out.append({"text": tok, "n": n, "t": a + offset, "e": b + offset})
    return out


def squeeze(y, words, max_gap=0.3, top_db=35):
    """Kürzt Stillen innerhalb eines Satzes auf max_gap; verschiebt die Wortzeiten entsprechend."""
    iv = librosa.effects.split(y, top_db=top_db, frame_length=1024, hop_length=256)
    cuts = []
    for (a0, a1), (b0, b1) in zip(iv, iv[1:]):
        gap = (b0 - a1) / SR
        if gap > max_gap:
            c0 = a1 / SR + max_gap / 2; cuts.append((c0, c0 + gap - max_gap))
    if not cuts:
        return y, words
    keep, pos = [], 0
    for c0, c1 in cuts:
        keep.append(y[pos:int(c0 * SR)]); pos = int(c1 * SR)
    keep.append(y[pos:])
    def shift(t):
        return t - sum(min(c1, t) - c0 for c0, c1 in cuts if t > c0)
    words = [{**w, "t": shift(w["t"]), "e": shift(w["e"])} for w in words]
    return np.concatenate(keep), words


def tempo(y, f):
    """Tonhöhenerhaltende Tempoänderung (ffmpeg atempo, WSOLA)."""
    if abs(f - 1) < 1e-3:
        return y
    a, b = "/tmp/_cb_t_in.wav", "/tmp/_cb_t_out.wav"
    torchaudio.save(a, torch.tensor(y).unsqueeze(0), SR)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", a, "-af", f"atempo={f}", b], check=True)
    z, _ = librosa.load(b, sr=SR)
    return z


def radio(y):
    tmp_in, tmp_out = "/tmp/_cb_in.wav", "/tmp/_cb_out.wav"
    torchaudio.save(tmp_in, torch.tensor(y).unsqueeze(0), SR)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", tmp_in, "-af", "highpass=f=450,lowpass=f=3200,acompressor=threshold=-25dB:ratio=6:makeup=6,asoftclip=type=tanh,volume=0.8", tmp_out], check=True)
    z, _ = librosa.load(tmp_out, sr=SR)
    return z


def main(proj):
    from chatterbox.mtl_tts import ChatterboxMultilingualTTS
    from faster_whisper import WhisperModel
    sc = json.load(open(os.path.join(proj, "script.json"), encoding="utf-8"))
    refs = sc.get("refs_dir", "/home/user/models/thorsten/refs")
    cache = os.path.join(proj, "build", "tts_cb"); os.makedirs(cache, exist_ok=True)
    torch.set_num_threads(os.cpu_count() or 4)
    model = None
    wm = WhisperModel(WHISPER_DIR, device="cpu", compute_type="int8")

    def transcribe(y16):
        segs, _ = wm.transcribe(y16, language="de", word_timestamps=True, beam_size=5, vad_filter=False)
        return [{"w": w.word.strip(), "t": w.start, "e": w.end} for s in segs for w in (s.words or [])]

    # Stimmstil "doku" = wie die Referenzvideos: tiefe (~100 Hz), ruhige, schnelle Erzählerstimme
    style = sc.get("voice_style", "doku")
    STY = {"doku": {"suffix": "_d4", "ex_scale": 0.72, "cfg": 0.5, "tempo": 1.10, "pitch": -2.0},
           "emotional": {"suffix": "", "ex_scale": 1.0, "cfg": 0.45, "tempo": 1.06, "pitch": 0.0}}[style]
    suffix = sc.get("ref_suffix", STY["suffix"])
    sc.setdefault("tempo", STY["tempo"])
    lead = sc.get("lead_in", 0.3)
    pcm = [np.zeros(int(lead * SR), np.float32)]; cur = lead
    timeline = {"segments": [], "fps": 30}
    for si, seg in enumerate(sc["segments"]):
        emo = seg.get("emotion", sc.get("emotion", "neutral"))
        ex = round(seg.get("ex", sc.get("ex", 0.55)) * STY["ex_scale"], 3)
        cfg = seg.get("cfg", sc.get("cfg", STY["cfg"])) if style != "doku" else max(seg.get("cfg", 0.5), STY["cfg"])
        ref = os.path.join(refs, f"{emo}{suffix}.wav")
        if not os.path.exists(ref):
            base = os.path.join(refs, f"{emo}.wav")
            subprocess.run(["rubberband", "-q", "--fine", "-F", "-p", "-4", base, ref], check=True)
        seg_start, words = cur, []
        sentences = split_sentences(seg["text"])
        for k, sent in enumerate(sentences):
            key = hashlib.md5(f"cb|{emo}{suffix}|{ex}|{cfg}|{sent}".encode()).hexdigest()[:10]
            wav_p, js_p = (os.path.join(cache, f"{seg['id']}_{k}_{key}.{x}") for x in ("wav", "json"))
            if os.path.exists(js_p) and stretched(json.load(open(js_p))["words"]):
                print(f"  {seg['id']}[{k}] Cache verdächtig (gedehntes Wort) -> neu erzeugen")
                os.remove(js_p)
            if not os.path.exists(js_p):
                if model is None:
                    print("Lade Chatterbox …"); model = ChatterboxMultilingualTTS.from_local(MODEL_DIR, "cpu")
                best = None
                n_words = len([w for w in sent.split() if norm(w)])
                for attempt in range(4):
                    seed = int(key, 16) % 100000 + attempt * 7919
                    torch.manual_seed(seed); np.random.seed(seed % 2**32)
                    w = model.generate(sent, language_id="de", audio_prompt_path=ref, exaggeration=ex, cfg_weight=cfg)
                    y = librosa.resample(w.squeeze(0).numpy(), orig_sr=model.sr, target_sr=SR)
                    y, _ = trim(y, SR)
                    ww = transcribe(librosa.resample(y, orig_sr=SR, target_sr=16000))
                    sc_ = score(sent, ww)
                    dur = len(y) / SR
                    # Halluzinations-/Abbruchcheck: plausible Sprechdauer (ca. 1.6–4.5 Wörter/s)
                    rate = n_words / max(dur, 0.1)
                    ok_rate = 1.3 < rate < 4.8 or n_words <= 2
                    sus = stretched(ww)
                    q = sc_ - (0 if ok_rate else 0.3) - (0.4 if sus else 0)
                    print(f"  {seg['id']}[{k}] Versuch {attempt + 1}: Genauigkeit {sc_:.2f}, {rate:.1f} W/s, {dur:.1f}s" + (" (gedehntes Wort!)" if sus else ""))
                    if best is None or q > best[0]:
                        best = (q, y, ww)
                    if sc_ >= 0.92 and ok_rate and not sus:
                        break
                q, y, ww = best
                torchaudio.save(wav_p, torch.tensor(y).unsqueeze(0), SR)
                json.dump({"words": ww, "score": q}, open(js_p, "w"), ensure_ascii=False)
            y, _ = librosa.load(wav_p, sr=SR)
            ww = json.load(open(js_p))["words"]
            if ww:  # Nachgeräusche/Artefakte nach dem letzten Wort (und vor dem ersten) abschneiden
                a = max(0.0, ww[0]["t"] - 0.08); b = min(len(y) / SR, ww[-1]["e"] + 0.2)
                y = y[int(a * SR):int(b * SR)]
                ww = [{**w, "t": w["t"] - a, "e": w["e"] - a} for w in ww]
                fade = int(0.04 * SR); y[-fade:] *= np.linspace(1, 0, fade)
            y, ww = squeeze(y, ww, seg.get("max_pause", sc.get("max_pause", 0.3)))
            if seg.get("fx") == "radio":
                y = radio(y)
            words += map_words(sent, ww, cur)
            pcm.append(y.astype(np.float32)); cur += len(y) / SR
            if k < len(sentences) - 1:
                p = pause_after(sent); pcm.append(np.zeros(int(p * SR), np.float32)); cur += p
        g = seg.get("gap_after", pause_after(sentences[-1]))
        pcm.append(np.zeros(int(g * SR), np.float32)); cur += g
        timeline["segments"].append({**{k: v for k, v in seg.items() if k != "text"}, "text": seg["text"],
                                     "start": seg_start, "end": cur, "words": words})
    end = sc.get("end_card")
    if end:
        timeline["end_card"] = {**end, "start": cur}
        pcm.append(np.zeros(int(end.get("dur", 2.5) * SR), np.float32)); cur += end.get("dur", 2.5)
    y = np.concatenate(pcm)
    f = sc.get("tempo", 1.0)  # z. B. 1.07 = 7 % schneller, Tonhöhe bleibt
    if abs(f - 1) > 1e-3:
        y = tempo(y, f)
        for s in timeline["segments"]:
            s["start"] /= f; s["end"] /= f
            for w in s["words"]: w["t"] /= f; w["e"] /= f
        if end: timeline["end_card"]["start"] /= f
        cur = len(y) / SR
    timeline["duration"] = cur
    ps = sc.get("voice_pitch", STY["pitch"])  # Feinabsenkung in Halbtönen, Formanten/Timing bleiben erhalten
    if abs(ps) > 0.01:
        a, b = "/tmp/_cb_p_in.wav", "/tmp/_cb_p_out.wav"
        torchaudio.save(a, torch.tensor(y).unsqueeze(0), SR)
        subprocess.run(["rubberband", "-q", "--fine", "-F", "-p", str(ps), a, b], check=True)
        z, _ = librosa.load(b, sr=SR); y = np.pad(z, (0, max(0, len(y) - len(z))))[:len(y)]
    y = y / (np.max(np.abs(y)) + 1e-9) * 0.89
    out = os.path.join(proj, "build")
    with wave.open(os.path.join(out, "voice.wav"), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((y * 32767).astype(np.int16).tobytes())
    json.dump(timeline, open(os.path.join(out, "timeline.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"Voice-over: {cur:.1f} s, {len(timeline['segments'])} Segmente")


if __name__ == "__main__":
    main(sys.argv[1])
