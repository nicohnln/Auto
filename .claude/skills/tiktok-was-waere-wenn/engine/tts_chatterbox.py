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
    if s.endswith("…"): return 0.5
    if s.endswith("?"): return 0.32
    if s.endswith("!"): return 0.26
    return 0.28


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
    return sm.ratio()


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

    lead = sc.get("lead_in", 0.3)
    pcm = [np.zeros(int(lead * SR), np.float32)]; cur = lead
    timeline = {"segments": [], "fps": 30}
    for si, seg in enumerate(sc["segments"]):
        emo = seg.get("emotion", sc.get("emotion", "neutral"))
        ex, cfg = seg.get("ex", sc.get("ex", 0.55)), seg.get("cfg", sc.get("cfg", 0.45))
        ref = os.path.join(refs, f"{emo}.wav")
        seg_start, words = cur, []
        sentences = split_sentences(seg["text"])
        for k, sent in enumerate(sentences):
            key = hashlib.md5(f"cb|{emo}|{ex}|{cfg}|{sent}".encode()).hexdigest()[:10]
            wav_p, js_p = (os.path.join(cache, f"{seg['id']}_{k}_{key}.{x}") for x in ("wav", "json"))
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
                    q = sc_ - (0 if ok_rate else 0.3)
                    print(f"  {seg['id']}[{k}] Versuch {attempt + 1}: Genauigkeit {sc_:.2f}, {rate:.1f} W/s, {dur:.1f}s")
                    if best is None or q > best[0]:
                        best = (q, y, ww)
                    if sc_ >= 0.92 and ok_rate:
                        break
                q, y, ww = best
                torchaudio.save(wav_p, torch.tensor(y).unsqueeze(0), SR)
                json.dump({"words": ww, "score": q}, open(js_p, "w"), ensure_ascii=False)
            y, _ = librosa.load(wav_p, sr=SR)
            ww = json.load(open(js_p))["words"]
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
    timeline["duration"] = cur
    y = np.concatenate(pcm); y = y / (np.max(np.abs(y)) + 1e-9) * 0.89
    out = os.path.join(proj, "build")
    with wave.open(os.path.join(out, "voice.wav"), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((y * 32767).astype(np.int16).tobytes())
    json.dump(timeline, open(os.path.join(out, "timeline.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"Voice-over: {cur:.1f} s, {len(timeline['segments'])} Segmente")


if __name__ == "__main__":
    main(sys.argv[1])
