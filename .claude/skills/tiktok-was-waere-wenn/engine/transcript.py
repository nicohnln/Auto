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
        try:
            sc = json.load(open(os.path.join(proj, "script.json"), encoding="utf-8"))
        except Exception:
            sc = {}
        if "text" in e:
            card = f"{e['text']} – {e.get('sub', '')}"
        else:  # Mono-Serienkarte
            card = f"{sc.get('series', 'Was wäre wenn').upper()} · Nr. {sc.get('nr', '')} – {sc.get('tagline', '')}"
        txt.append(f"[{ts(e['start'])} – {ts(t['duration'])}] (Einblendung ohne Sprache) {card}")
    open(os.path.join(proj, "transkript.txt"), "w", encoding="utf-8").write("\n".join(txt) + "\n")
    # Voice-over-Skript als Text – wird bei jedem Video mitgeschickt.
    # Format des Creators: Abschnitte [HOOK – 0–5 Sek.] / [HAUPTTEIL – …] / [WENDEPUNKT – …] / [ABSCHLUSS – …],
    # darunter die Sätze als eigene Absätze. Zeiten = echte Zeiten im fertigen Video.
    out, cur_sec, buf = [], None, []
    def flush():
        if cur_sec is not None:
            out.append(f"[{cur_sec[0]} – {round(cur_sec[1])}–{round(cur_sec[2])} Sek.]\n\n" + "\n\n".join(buf))
    for s in t["segments"]:
        sec = s.get("section")
        if sec is None:
            buf.append(s["text"]); continue
        if cur_sec is None or cur_sec[0] != sec:
            flush(); cur_sec = [sec, s["start"], s["end"]]; buf = []
        cur_sec[2] = s["end"]; buf.append(s["text"])
    if cur_sec is not None:
        flush(); vo = "\n\n".join(out)
    else:
        vo = "\n\n".join(buf)
    open(os.path.join(proj, "voiceover.txt"), "w", encoding="utf-8").write(vo + "\n")
    open(os.path.join(proj, "transkript.srt"), "w", encoding="utf-8").write("\n".join(srt))
    print("\n".join(txt))


if __name__ == "__main__":
    main(sys.argv[1])
