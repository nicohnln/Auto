#!/usr/bin/env python3
"""Stufe 2: Musikteppich + Soundeffekte synthetisieren und mit dem Voice-over mischen.

Aufruf:  python3 audio.py <projektordner>
Braucht  build/voice.wav, build/timeline.json (aus tts.py)
Schreibt build/music.wav, build/sfx.wav, build/mix.wav (-14 LUFS)
Alles wird lokal erzeugt (keine Lizenzprobleme)."""
import json, os, subprocess, sys

import numpy as np
from scipy import signal
from scipy.io import wavfile

SR = 48000
rnd = np.random.default_rng(3)


def t_arr(d):
    return np.arange(int(d * SR)) / SR


def env(n, a=0.01, r=0.2):
    e = np.ones(n)
    na, nr = max(1, int(a * SR)), max(1, int(r * SR))
    e[:na] = np.linspace(0, 1, na)
    e[-nr:] *= np.linspace(1, 0, nr)
    return e


def lp(x, f, order=2):
    b, a = signal.butter(order, f / (SR / 2), "low")
    return signal.lfilter(b, a, x)


def hp(x, f, order=2):
    b, a = signal.butter(order, f / (SR / 2), "high")
    return signal.lfilter(b, a, x)


def bp(x, f1, f2):
    b, a = signal.butter(2, [f1 / (SR / 2), f2 / (SR / 2)], "band")
    return signal.lfilter(b, a, x)


def saw(f, t):
    return 2 * ((f * t) % 1) - 1


def midi(n):
    return 440 * 2 ** ((n - 69) / 12)


def reverb(x, decay=1.2, mix=0.25):
    n = int(decay * SR)
    ir = rnd.standard_normal(n) * np.exp(-np.linspace(0, 6, n))
    ir = lp(ir, 5000)
    wet = signal.fftconvolve(x, ir)[: len(x)]
    wet /= (np.max(np.abs(wet)) + 1e-9)
    return x * (1 - mix) + wet * mix * np.max(np.abs(x))


# ---------------- Soundeffekte ----------------
def sfx_whoosh():
    d = 0.42; n = int(d * SR); t = t_arr(d)
    noise = rnd.standard_normal(n)
    out = np.zeros(n)
    for i, f in enumerate(np.geomspace(400, 4000, 8)):
        seg = slice(int(i * n / 8), int((i + 1) * n / 8))
        out[seg] = bp(noise, f * 0.7, min(f * 1.4, 20000))[seg]
    return out * np.sin(np.pi * t / d) ** 2 * 0.5


def sfx_pop():
    d = 0.09; t = t_arr(d); f = np.linspace(900, 380, len(t))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 45) * 0.6


def sfx_ding():
    d = 0.9; t = t_arr(d)
    return (np.sin(2 * np.pi * 1318 * t) + 0.5 * np.sin(2 * np.pi * 1976 * t) + 0.25 * np.sin(2 * np.pi * 2637 * t)) * np.exp(-t * 6) * 0.35


def sfx_impact():
    d = 1.6; t = t_arr(d); f = np.linspace(75, 32, len(t))
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.6)
    nz = lp(rnd.standard_normal(len(t)), 900) * np.exp(-t * 14) * 0.6
    return reverb(sub * 0.9 + nz, 1.4, 0.3) * 0.9


def sfx_hit():
    x = sfx_impact()
    t = t_arr(len(x) / SR)
    return x + np.sin(2 * np.pi * 110 * t) * np.exp(-t * 3) * 0.25


def sfx_glitch():
    d = 0.32; n = int(d * SR); out = np.zeros(n); i = 0
    while i < n:
        L = int(rnd.uniform(0.012, 0.04) * SR); f = rnd.choice([180, 360, 720, 1440, 95])
        tt = np.arange(min(L, n - i)) / SR
        out[i:i + len(tt)] = np.sign(np.sin(2 * np.pi * f * tt)) * rnd.uniform(0.2, 0.5)
        i += L
    return lp(out, 6000) * 0.45


def sfx_error():
    out = []
    for _ in range(2):
        t = t_arr(0.13); out += [np.sign(np.sin(2 * np.pi * 220 * t)) * 0.25 * env(len(t), 0.005, 0.02), np.zeros(int(0.06 * SR))]
    return lp(np.concatenate(out), 3000)


def sfx_buzz():
    t = t_arr(0.4)
    return lp(np.sign(np.sin(2 * np.pi * 110 * t)) * 0.3 * env(len(t), 0.005, 0.05), 2500)


def sfx_stamp():
    t = t_arr(0.5); f = np.linspace(160, 50, len(t))
    thump = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 14)
    click = hp(rnd.standard_normal(len(t)), 1500) * np.exp(-t * 60) * 0.5
    return reverb(thump + click, 0.6, 0.2) * 0.9


def sfx_chime():
    out = np.zeros(int(1.4 * SR))
    for k, n in enumerate([84, 88, 91, 96]):
        t = t_arr(1.4 - k * 0.07); s = int(k * 0.07 * SR)
        out[s:s + len(t)] += np.sin(2 * np.pi * midi(n) * t) * np.exp(-t * 4) * 0.18
    return reverb(out, 1.0, 0.3)


def sfx_beep():
    t = t_arr(0.11)
    return np.sin(2 * np.pi * 1850 * t) * env(len(t), 0.003, 0.02) * 0.3


def sfx_crowd(d=3.2):
    n = int(d * SR); t = t_arr(d)
    x = np.cumsum(rnd.standard_normal(n)); x = hp(x, 120); x = bp(x, 180, 1400)
    x /= np.max(np.abs(x)) + 1e-9
    am = 0.6 + 0.4 * np.sin(2 * np.pi * 7 * t + np.sin(2 * np.pi * 1.3 * t) * 3)
    steps = np.zeros(n)
    for s in rnd.uniform(0, d, 60):
        i = int(s * SR); L = min(int(0.05 * SR), n - i); steps[i:i + L] += np.exp(-np.arange(L) / SR * 60) * rnd.uniform(0.2, 0.5)
    return (x * am * 0.45 + lp(steps, 400)) * np.sin(np.pi * t / d) ** 0.6


def sfx_tick(d=4.0):
    n = int(d * SR); out = np.zeros(n)
    for k, s in enumerate(np.arange(0, d, 0.5)):
        i = int(s * SR); L = int(0.03 * SR)
        if i + L < n:
            out[i:i + L] += hp(rnd.standard_normal(L), 2500 if k % 2 else 1800) * np.exp(-np.arange(L) / SR * 180) * 0.35
    return out


def sfx_net(d=2.5):
    n = int(d * SR); out = np.zeros(n)
    for k, s in enumerate(np.arange(0, d - 0.1, 0.18)):
        t = t_arr(0.07); i = int(s * SR)
        out[i:i + len(t)] += np.sin(2 * np.pi * midi(rnd.choice([81, 84, 88, 93])) * t) * np.exp(-t * 50) * 0.15
    return out


def sfx_vinyl(d=5.0):
    n = int(d * SR); out = hp(rnd.standard_normal(n), 3000) * 0.012
    for s in rnd.uniform(0, d, int(d * 25)):
        i = int(s * SR); out[i:i + 30] += rnd.uniform(-0.3, 0.3) * np.exp(-np.arange(min(30, n - i)) / 6)
    return lp(out, 7000)


def sfx_coin():
    t = t_arr(1.2)
    x = sum(np.sin(2 * np.pi * f * t) * np.exp(-t * k) * a for f, k, a in [(2450, 4, .3), (3680, 6, .22), (5120, 8, .15), (6900, 10, .1)])
    x += sfx_chime()[: len(t)] * 0.6
    return x


def sfx_heartbeat(d=2.6):
    n = int(d * SR); out = np.zeros(n)
    for s in np.arange(0, d - 0.3, 0.78):
        for off, a in [(0, 1.0), (0.2, 0.7)]:
            t = t_arr(0.18); i = int((s + off) * SR); f = np.linspace(70, 40, len(t))
            if i + len(t) < n:
                out[i:i + len(t)] += np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 20) * a
    return out * 0.9


def sfx_riser_short():
    d = 1.6; t = t_arr(d); f = np.geomspace(160, 900, len(t))
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.12
    nz = bp(rnd.standard_normal(len(t)), 800, 6000) * 0.12
    return (tone + nz) * (t / d) ** 2


def sfx_static(d=2.0):
    """Funkgeräte-Rauschen mit Knacksern."""
    n = int(d * SR); t = t_arr(d)
    x = bp(rnd.standard_normal(n), 600, 4500) * 0.16
    x *= 0.6 + 0.4 * np.abs(np.sin(2 * np.pi * 3.1 * t + np.sin(2 * np.pi * 0.7 * t) * 2))
    for s in rnd.uniform(0, d, int(d * 9)):
        i = int(s * SR); L = min(int(0.02 * SR), n - i); x[i:i + L] += rnd.uniform(-0.6, 0.6) * np.exp(-np.arange(L) / SR * 300)
    return x * np.minimum(1, t / 0.05) * np.minimum(1, (d - t) / 0.3)


SFX = {k[4:]: v for k, v in globals().items() if k.startswith("sfx_")}
DUR_SFX = {"crowd", "tick", "net", "vinyl", "heartbeat", "static"}  # Länge = Segmentdauer


# ---------------- Musik ----------------
def music(total, segs, bpm=84):
    n = int(total * SR); t = np.arange(n) / SR
    beat = 60 / bpm; bar = beat * 4
    prog = [(57, [57, 60, 64]), (53, [53, 57, 60]), (50, [50, 53, 57]), (52, [52, 56, 59])]  # Am F Dm E
    pad = np.zeros(n); bass = np.zeros(n); arp = np.zeros(n); kick = np.zeros(n)
    chord_len = bar * 2
    for ci in range(int(total / chord_len) + 1):
        root, notes = prog[ci % 4]
        s0 = ci * chord_len; i0 = int(s0 * SR); L = int((chord_len + 0.6) * SR)
        if i0 >= n: break
        L = min(L, n - i0); tt = np.arange(L) / SR
        e = np.minimum(1, tt / 0.8) * np.minimum(1, (chord_len + 0.6 - tt) / 0.8)
        for nt in notes + [notes[0] + 12]:
            for det in (-0.08, 0.0, 0.09):
                pad[i0:i0 + L] += saw(midi(nt) * (1 + det / 100 * 6), tt + det) * e * 0.05
        # Bass-Pulse (Achtel)
        for k in range(int(chord_len / (beat / 2))):
            j = i0 + int(k * beat / 2 * SR); Lb = int(0.22 * SR)
            if j + Lb >= n: break
            tb = np.arange(Lb) / SR
            bass[j:j + Lb] += (np.sin(2 * np.pi * midi(root - 12) * tb) + 0.3 * saw(midi(root - 12), tb)) * np.exp(-tb * 9) * 0.35
        # Arpeggio (Achtel, Akkordtöne hoch)
        seq = [notes[0] + 12, notes[1] + 12, notes[2] + 12, notes[1] + 12, notes[0] + 24, notes[2] + 12, notes[1] + 12, notes[2] + 12]
        for k in range(int(chord_len / (beat / 2))):
            j = i0 + int(k * beat / 2 * SR); La = int(0.35 * SR)
            if j + La >= n: break
            ta = np.arange(La) / SR; f = midi(seq[k % 8])
            arp[j:j + La] += (np.sin(2 * np.pi * f * ta) + 0.25 * np.sin(4 * np.pi * f * ta)) * np.exp(-ta * 10) * 0.12
        for k in range(int(chord_len / beat)):
            j = i0 + int(k * beat * SR); Lk = int(0.3 * SR)
            if j + Lk >= n: break
            tk = np.arange(Lk) / SR; fk = np.linspace(95, 40, Lk)
            kick[j:j + Lk] += np.sin(2 * np.pi * np.cumsum(fk) / SR) * np.exp(-tk * 12) * (0.55 if k % 2 == 0 else 0.3)
    pad = lp(pad, 1400)
    arp = reverb(lp(arp, 5000), 1.0, 0.3)
    # Dynamik je nach Segment (Intensitätskurve)
    level = {"pad": np.full(n, 0.9), "bass": np.zeros(n), "arp": np.zeros(n), "kick": np.zeros(n)}
    inten = {"bed": (1, 0, 0, 0), "news": (1, .6, 0, 0), "globe": (1, 1, 0, .6), "bank": (1, 1, .5, .7), "debt": (1, 1, .6, .7),
             "happy": (1, 1, 1, .8), "market": (1, 1, .7, .8), "rush": (1, 1, 1, 1), "cashier": (1, .5, .4, 0), "city": (1, 1, .6, .8),
             "swap": (1, .8, 1, .6), "baker": (1, .9, .6, .7), "cigs": (1, 1, 1, 1), "network": (1, 1, 1, 1), "history": (.8, 0, .3, 0),
             "coin": (1, 1, 1, .9), "promise": (1, .6, 1, .3), "question": (1, 1, 0, 1)}
    for s in segs:
        a, b = int(s["start"] * SR), int(s["end"] * SR)
        p, ba, ar, ki = s.get("music", inten.get(s["scene"], (1, 1, .6, .7)))
        level["pad"][a:b], level["bass"][a:b], level["arp"][a:b], level["kick"][a:b] = p, ba, ar, ki
    sm = lambda x: lp(x, 3)  # weiche Übergänge
    mix = pad * sm(level["pad"]) + bass * sm(level["bass"]) + arp * sm(level["arp"]) + kick * sm(level["kick"])
    mix *= np.minimum(1, t / 1.0)
    return mix


def main(proj):
    b = os.path.join(proj, "build")
    tl = json.load(open(os.path.join(b, "timeline.json"), encoding="utf-8"))
    sc = json.load(open(os.path.join(proj, "script.json"), encoding="utf-8"))
    total = tl["duration"]; n = int(total * SR)
    segs = tl["segments"]
    m = music(total, segs, sc.get("music", {}).get("bpm", 84))
    endc = tl.get("end_card")
    if endc:  # Musik beim Abspann abreißen lassen
        i = int(endc["start"] * SR); m[i:] *= np.exp(-np.arange(n - i) / SR * 6)
    sfx = np.zeros(n + SR * 3)

    def put(x, at, gain=1.0):
        i = int(max(0, at) * SR); L = min(len(x), len(sfx) - i)
        sfx[i:i + L] += x[:L] * gain

    for k, s in enumerate(segs):
        if k > 0 and s["scene"] != segs[k - 1]["scene"]:
            put(SFX["whoosh"](), s["start"] - 0.12, 0.55)
        for at, name in s.get("sfx", []):
            if at == "start": tt = s["start"]
            elif at == "end": tt = s["end"] - 0.3
            else:
                key = at[2:].lower(); tt = next((w["t"] for w in s["words"] if w["n"] == key or w["n"].startswith(key)), s["start"])
            fn = SFX[name]
            x = fn(s["end"] - tt + 0.3) if name in DUR_SFX else fn()
            put(x, tt - (0.03 if name in ("impact", "hit", "stamp") else 0), 1.0)
    if endc:
        put(SFX["hit"](), endc["start"], 1.0)
    sfx = sfx[:n]
    norm = lambda x: x / (np.max(np.abs(x)) + 1e-9)
    wavfile.write(os.path.join(b, "music.wav"), SR, (norm(m) * 0.8 * 32767).astype(np.int16))
    wavfile.write(os.path.join(b, "sfx.wav"), SR, (norm(sfx) * 0.8 * 32767).astype(np.int16))
    # Mix: Stimme aufbereiten, Musik unter Stimme ducken, Lautheit auf -14 LUFS
    # Stimme "menschlich" machen: Nahbesprechungs-Wärme, weniger digitale Schärfe, kleiner Raum statt steriler Studio-Luft
    if sc.get("tts") == "orpheus":
        # Orpheus klingt schon natürlich: nur sanft säubern und präsent machen, keine Effekte
        room = sc.get("voice_room", 0.0)
        vchain = ("highpass=f=70,equalizer=f=3000:t=q:w=1.2:g=1.5,deesser=i=0.3,"
                  "acompressor=threshold=-20dB:ratio=2.5:attack=10:release=150:makeup=2")
    elif sc.get("voice_style", "doku" if sc.get("tts") == "chatterbox" else "edge") == "doku":
        # Doku-Erzähler wie in den Referenzen: trocken, präsent, hell, kräftig komprimiert
        room = sc.get("voice_room", 0.0)
        vchain = ("highpass=f=80,equalizer=f=250:t=q:w=1.2:g=-2.5,equalizer=f=3500:t=q:w=1.0:g=4,"
                  "highshelf=f=8000:g=3,deesser=i=0.5,"
                  "acompressor=threshold=-24dB:ratio=4:attack=5:release=100:makeup=4")
    else:
        room = sc.get("voice_room", 0.10)
        vchain = ("highpass=f=75,equalizer=f=200:t=q:w=1:g=2.5,equalizer=f=3000:t=q:w=1.2:g=1.5,"
                  "equalizer=f=7500:t=q:w=1.5:g=-3,deesser=i=0.4,"
                  "acompressor=threshold=-22dB:ratio=3:attack=8:release=150:makeup=3")
    if room > 0:
        vchain += f",aecho=0.9:0.9:23|37|53:{room:.2f}|{room*0.7:.2f}|{room*0.45:.2f}"
    fc = (f"[0:a]{vchain},asplit=2[v][key];"
          "[1:a]volume=0.72[mus];[mus][key]sidechaincompress=threshold=0.04:ratio=4:attack=20:release=350[duck];"
          "[2:a]volume=0.7[fx];"
          "[v][duck][fx]amix=inputs=3:normalize=0:duration=longest,loudnorm=I=-14:TP=-1:LRA=9,aformat=sample_rates=48000:channel_layouts=stereo[out]")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", os.path.join(b, "voice.wav"), "-i", os.path.join(b, "music.wav"),
                    "-i", os.path.join(b, "sfx.wav"), "-filter_complex", fc, "-map", "[out]", "-t", f"{total:.3f}",
                    os.path.join(b, "mix.wav")], check=True)
    print("Audio-Mix ->", os.path.join(b, "mix.wav"))


if __name__ == "__main__":
    main(sys.argv[1])
