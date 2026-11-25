#!/usr/bin/env python3
"""Baut aus dem Thorsten-Voice-Datensatz (CC0) je ~14 s Referenz pro Emotion: neutral, amused, surprised, whisper."""
import os, subprocess, sys
import pyarrow.parquet as pq
D = sys.argv[1]; os.makedirs(f"{D}/refs", exist_ok=True)

def pick(f, style, n, mind=2.2, maxd=5.0):
    t = pq.read_table(f).to_pandas()
    if style: t = t[t["style"].str.startswith(style)]
    t = t[(t.durationSeconds > mind) & (t.durationSeconds < maxd)].head(n)
    ps = []
    for i, r in enumerate(t.itertuples()):
        p = f"{D}/refs/_{style or 'neutral'}_{i}.wav"; open(p, "wb").write(r.audio["bytes"]); ps.append(p)
    return ps

sets = {"neutral": pick(f"{D}/neutral2022_0.parquet", None, 4, 3, 5), "amused": pick(f"{D}/emotional0.parquet", "amused", 4),
        "surprised": pick(f"{D}/emotional0.parquet", "surprised", 4), "whisper": pick(f"{D}/emotional0.parquet", "whisper", 4)}
for k, ps in sets.items():
    inp = sum([["-i", p] for p in ps], [])
    fc = "".join(f"[{i}]aresample=24000,silenceremove=start_periods=1:start_threshold=-45dB:stop_periods=-1:stop_threshold=-45dB:stop_duration=0.3,apad=pad_dur=0.25[a{i}];" for i in range(len(ps)))
    fc += "".join(f"[a{i}]" for i in range(len(ps))) + f"concat=n={len(ps)}:v=0:a=1,loudnorm=I=-20[o]"
    subprocess.run(["ffmpeg", "-v", "error", "-y", *inp, "-filter_complex", fc, "-map", "[o]", "-ar", "24000", "-ac", "1", f"{D}/refs/{k}.wav"], check=True)
    print("Referenz:", k)
