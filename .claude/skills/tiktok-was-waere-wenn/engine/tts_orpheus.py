#!/usr/bin/env python3
"""Stufe 1 (Standard): Voice-over mit deutschem Orpheus (Canopy Labs, Apache-2.0), lokal auf CPU.
Vom Creator im Casting gewählt: Stimme "thomas".

Aufruf (im tts-venv):  python tts_orpheus.py <projektordner>
Schreibt build/voice.wav + build/timeline.json (gleiches Format wie tts.py).

script.json:  "tts": "orpheus", "voice": "thomas"
Im Text erlaubt (werden gesprochen, aber nicht untertitelt): <laugh> <chuckle> <sigh> <gasp> <groan> <yawn> <sniffle>
Jedes Segment wird am Stück gesprochen (natürlicher Fluss), dann von Whisper geprüft:
fehlende/falsche Wörter, Wiederholungen oder gedehnte Wörter -> neuer Versuch (max. 4, der beste gewinnt).
"""
import difflib, hashlib, json, os, re, sys, wave

import numpy as np
import librosa
import soundfile as sf

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import orpheus_de as O  # noqa: E402

SR = 48000
WHISPER_DIR = os.environ.get("WHISPER_DIR", "/home/user/models/whisper-small")
TAG = re.compile(r"\s*<(laugh|chuckle|sigh|gasp|groan|yawn|cough|sniffle)>\s*")


def norm(s):
    return re.sub(r"[^0-9a-zäöüß]", "", s.lower())


def caption_text(t):
    return re.sub(r"\s+", " ", TAG.sub(" ", t)).strip()


def score(target, words):
    a = [norm(w) for w in target.split() if norm(w)]
    b = [norm(w["w"]) for w in words if norm(w["w"])]
    a = [x for x in a if not x.isdigit()]  # Ziffern im Untertitel (gesprochen als Wort) nicht werten
    if any(x.isdigit() for x in b):
        b = [x for x in b if not x.isdigit()]
        a = [x for x in a if not re.search(r"(hundert|tausend|zehn|zig|zwölf|elf|drei|vier|fünf|sechs|sieben|acht|neun|zwei|eins)$", x)]
    sm = difflib.SequenceMatcher(a=a, b=b, autojunk=False)
    cr = difflib.SequenceMatcher(a="".join(a), b="".join(b), autojunk=False).ratio()
    return max(sm.ratio(), cr if cr > 0.9 else 0)


def stretched(words):
    for w in words:
        n = len(norm(w["w"]))
        if n and (w["e"] - w["t"]) > max(1.0, 0.13 * n + 0.45):
            return True
    return False


def squeeze(y, words, max_gap):
    iv = librosa.effects.split(y, top_db=38, frame_length=1024, hop_length=256)
    cuts = []
    for (_, a1), (b0, _) in zip(iv, iv[1:]):
        gap = (b0 - a1) / SR
        if gap > max_gap:
            c0 = a1 / SR + max_gap / 2; cuts.append((c0, c0 + gap - max_gap))
    if not cuts:
        return y, words
    keep, pos = [], 0
    for c0, c1 in cuts:
        keep.append(y[pos:int(c0 * SR)]); pos = int(c1 * SR)
    keep.append(y[pos:])
    shift = lambda t: t - sum(min(c1, t) - c0 for c0, c1 in cuts if t > c0)
    return np.concatenate(keep), [{**w, "t": shift(w["t"]), "e": shift(w["e"])} for w in words]


def map_words(text, wwords, offset):
    toks = text.split(); tn = [norm(t) for t in toks]; wn = [norm(w["w"]) for w in wwords]
    sm = difflib.SequenceMatcher(a=tn, b=wn, autojunk=False)
    times = [None] * len(toks)
    for blk in sm.get_matching_blocks():
        for k in range(blk.size):
            w = wwords[blk.b + k]; times[blk.a + k] = (w["t"], w["e"])
    known = [i for i, t in enumerate(times) if t]
    for i in range(len(toks)):
        if times[i]: continue
        p = max([k for k in known if k < i], default=None); n = min([k for k in known if k > i], default=None)
        t0 = times[p][1] if p is not None else (times[n][0] - 0.3 if n is not None else 0)
        t1 = times[n][0] if n is not None else t0 + 0.35
        span = [j for j in range(i, n if n is not None else len(toks)) if not times[j]]
        L = max(1, len(span)); k = span.index(i) if i in span else 0
        times[i] = (t0 + (t1 - t0) * k / L, t0 + (t1 - t0) * (k + 1) / L)
    out = []
    for tok, n, (a, b) in zip(toks, tn, times):
        if not n:
            if out: out[-1]["text"] += " " + tok
            continue
        out.append({"text": tok, "n": n, "t": a + offset, "e": b + offset})
    return out


def main(proj):
    from faster_whisper import WhisperModel
    sc = json.load(open(os.path.join(proj, "script.json"), encoding="utf-8"))
    voice = sc.get("voice", "thomas")
    if voice.startswith("de-DE"):
        voice = "thomas"
    cache = os.path.join(proj, "build", "tts_or"); os.makedirs(cache, exist_ok=True)
    wm = WhisperModel(WHISPER_DIR, device="cpu", compute_type="int8")

    def transcribe(y48):
        segs, _ = wm.transcribe(librosa.resample(y48, orig_sr=SR, target_sr=16000), language="de", word_timestamps=True, beam_size=5)
        return [{"w": w.word.strip(), "t": w.start, "e": w.end} for s in segs for w in (s.words or [])]

    lead, max_gap = sc.get("lead_in", 0.3), sc.get("max_pause", 0.55)
    pcm = [np.zeros(int(lead * SR), np.float32)]; cur = lead
    timeline = {"segments": [], "fps": 30}
    for seg in sc["segments"]:
        spoken = seg.get("say", seg["text"])           # darf Emotions-Tags enthalten
        cap = caption_text(seg["text"])                 # Untertitel ohne Tags
        v = seg.get("voice", voice)
        if v.startswith("de-DE"): v = voice
        temp = seg.get("temp", sc.get("temp", 0.6))
        key = hashlib.md5(f"or|{v}|{temp}|{spoken}".encode()).hexdigest()[:10]
        wav_p, js_p = (os.path.join(cache, f"{seg['id']}_{key}.{x}") for x in ("wav", "json"))
        if not os.path.exists(js_p):
            best = None; nw = len([w for w in cap.split() if norm(w)])
            for attempt in range(4):
                y = O.synth(spoken, v, temp=temp, seed=int(key, 16) % 100000 + attempt * 7919)
                y = librosa.resample(y, orig_sr=O.SR, target_sr=SR)
                iv = librosa.effects.split(y, top_db=40)
                if len(iv): y = y[max(0, iv[0][0] - int(0.04 * SR)):iv[-1][1] + int(0.12 * SR)]
                ww = transcribe(y)
                s_ = score(cap, ww)
                heard = len([w for w in ww if norm(w["w"]) and not norm(w["w"]).isdigit()])
                rep = heard > nw + 2 and heard > nw * 1.2
                sus = stretched(ww)
                q = s_ - (0.6 if rep else 0) - (0.4 if sus else 0)
                flag = " (Wiederholung!)" if rep else (" (gedehntes Wort!)" if sus else "")
                print(f"  {seg['id']} Versuch {attempt + 1}: Genauigkeit {s_:.2f}, {len(y)/SR:.1f}s{flag}", flush=True)
                if best is None or q > best[0]:
                    best = (q, y, ww)
                if s_ >= 0.93 and not rep and not sus:
                    break
            q, y, ww = best
            sf.write(wav_p, y, SR); json.dump({"words": ww, "score": q}, open(js_p, "w"), ensure_ascii=False)
        y, _ = librosa.load(wav_p, sr=SR); ww = json.load(open(js_p))["words"]
        y, ww = squeeze(y, ww, seg.get("max_pause", max_gap))
        fade = int(0.03 * SR); y[-fade:] *= np.linspace(1, 0, fade)
        start = cur
        words = map_words(cap, ww, cur)
        pcm.append(y.astype(np.float32)); cur += len(y) / SR
        g = seg.get("gap_after", sc.get("gap", 0.22))
        pcm.append(np.zeros(int(g * SR), np.float32)); cur += g
        timeline["segments"].append({**{k: vv for k, vv in seg.items() if k not in ("text", "say")}, "text": cap,
                                     "start": start, "end": cur, "words": words})
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
