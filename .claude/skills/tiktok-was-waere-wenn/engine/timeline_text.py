#!/usr/bin/env python3
"""Zeitleiste ohne Voice-over: schätzt Wortzeiten aus dem Skripttext (Standard ~165 Wörter/min wie die Referenzen).
Für Videos mit "voiceover": false. Die Szenen laufen dann im Tempo einer gesprochenen Fassung,
sodass der Creator später auch selbst darüber sprechen kann (Zeiten stehen in transkript.txt).

Aufruf:  python3 timeline_text.py <projektordner>
Schreibt build/timeline.json und eine stille build/voice.wav (für den Mix).
"""
import json, os, re, sys, wave

SR = 48000


def norm(s):
    return re.sub(r"[^0-9a-zäöüß]", "", s.lower())


def main(proj):
    sc = json.load(open(os.path.join(proj, "script.json"), encoding="utf-8"))
    wpm = sc.get("wpm", 165)
    per_char = 60 / wpm / 6.0          # mittlere Wortlänge ~6 Zeichen
    cur = sc.get("lead_in", 0.3)
    segs = []
    for seg in sc["segments"]:
        words, start = [], cur
        for tok in seg["text"].split():
            n = norm(tok)
            if not n:
                if words: words[-1]["text"] += " " + tok
                continue
            dur = max(0.16, len(n) * per_char)
            words.append({"text": tok, "n": n, "t": cur, "e": cur + dur})
            cur += dur + 0.05
            if tok.rstrip("“”\"'")[-1:] in ".?!:…":
                cur += 0.35 if tok.endswith("…") else 0.25
        cur += seg.get("gap_after", sc.get("gap", 0.3)) + seg.get("hold", 0)  # "hold": Szene länger stehen lassen
        segs.append({**{k: v for k, v in seg.items() if k not in ("text", "say")}, "text": seg["text"],
                     "start": start, "end": cur, "words": words})
    tl = {"segments": segs, "fps": 30}
    end = sc.get("end_card")
    if end:
        tl["end_card"] = {**end, "start": cur}
        cur += end.get("dur", 2.5)
    tl["duration"] = cur
    b = os.path.join(proj, "build"); os.makedirs(b, exist_ok=True)
    json.dump(tl, open(os.path.join(b, "timeline.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    with wave.open(os.path.join(b, "voice.wav"), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(b"\x00\x00" * int(cur * SR))
    print(f"Zeitleiste ohne Voice-over: {cur:.1f} s, {len(segs)} Segmente")


if __name__ == "__main__":
    main(sys.argv[1])
