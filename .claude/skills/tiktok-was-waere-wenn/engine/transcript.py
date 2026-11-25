#!/usr/bin/env python3
"""Transkript mit Zeitstempeln als Klartext (transkript.txt) und Untertiteldatei (transkript.srt).
Aufruf: python3 transcript.py <projektordner>"""
import json, os, sys


def ts(x, srt=False):
    m, s = divmod(x, 60); h, m = divmod(int(m), 60)
    return f"{h:02d}:{m:02d}:{s:06.3f}".replace(".", ",") if srt else f"{int(m):02d}:{s:05.2f}"


def main(proj):
    t = json.load(open(os.path.join(proj, "build", "timeline.json"), encoding="utf-8"))
    txt, srt = [], []
    for i, s in enumerate(t["segments"], 1):
        a, b = s["words"][0]["t"], s["words"][-1]["e"]
        who = " (Funkstimme)" if s.get("fx") == "radio" else ""
        txt.append(f"[{ts(a)} – {ts(b)}]{who} {s['text']}")
        srt.append(f"{i}\n{ts(a, 1)} --> {ts(b, 1)}\n{s['text']}\n")
    e = t.get("end_card")
    if e:
        txt.append(f"[{ts(e['start'])} – {ts(t['duration'])}] (Einblendung ohne Sprache) {e['text']} – {e.get('sub', '')}")
    open(os.path.join(proj, "transkript.txt"), "w", encoding="utf-8").write("\n".join(txt) + "\n")
    open(os.path.join(proj, "transkript.srt"), "w", encoding="utf-8").write("\n".join(srt))
    print("\n".join(txt))


if __name__ == "__main__":
    main(sys.argv[1])
