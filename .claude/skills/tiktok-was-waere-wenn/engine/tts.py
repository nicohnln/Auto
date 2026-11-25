#!/usr/bin/env python3
"""Stufe 1: Voice-over erzeugen (edge-tts, Microsoft Neural, kostenlos) + wortgenaue Timeline.

Aufruf:  python3 tts.py <projektordner>
Liest   <projekt>/script.json
Schreibt <projekt>/build/voice.wav, <projekt>/build/timeline.json

Humanisierung ("humanize": true, Standard):
- jeder Satz wird einzeln gesprochen, mit leicht variiertem Tempo/Tonhöhe (keine Monotonie)
- Pausen je nach Satzzeichen (… lang, . mittel, ? / , kurz) statt fester Lücken
- leise Atemgeräusche vor neuen Gedanken ("breath": true/false pro Segment, sonst automatisch)
Pro Segment optional: "voice" (andere Stimme), "rate", "pitch", "fx": "radio" (Funkgeräte-Klang),
"max_pause" (längste erlaubte Pause innerhalb eines Satzes).
"""
import asyncio, hashlib, json, os, re, subprocess, sys, wave

import edge_tts
import numpy as np
from scipy import signal

SR = 48000


def norm(s):
    return re.sub(r"[^0-9a-zäöüß]", "", s.lower())


def pct(s):
    return int(re.sub(r"[^-0-9]", "", s) or 0)


async def synth(text, voice, rate, pitch, mp3_path):
    proxy = os.environ.get("HTTPS_PROXY") or os.environ.get("https_proxy")
    kw = dict(boundary="WordBoundary", rate=rate, pitch=pitch)
    if proxy:
        kw["proxy"] = proxy
    for attempt in range(4):
        try:
            words, audio = [], bytearray()
            async for ch in edge_tts.Communicate(text, voice, **kw).stream():
                if ch["type"] == "audio":
                    audio.extend(ch["data"])
                elif ch["type"] == "WordBoundary":
                    words.append({"t": ch["offset"] / 1e7, "d": ch["duration"] / 1e7, "w": ch["text"]})
            open(mp3_path, "wb").write(audio)
            return words
        except Exception as e:  # Netzwerk-Wackler: erneut versuchen
            print("  TTS-Fehler, neuer Versuch:", e)
            await asyncio.sleep(2 * (attempt + 1))
    raise RuntimeError("TTS fehlgeschlagen")


def to_pcm(mp3, wav, fx=None):
    af = []
    if fx == "radio":  # Funkgerät / Telefon: Bandpass + leichte Verzerrung
        af = ["-af", "highpass=f=450,lowpass=f=3200,acompressor=threshold=-25dB:ratio=6:makeup=6,"
                     "asoftclip=type=tanh,volume=0.8"]
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", mp3, *af, "-ac", "1", "-ar", str(SR), "-sample_fmt", "s16", wav], check=True)
    with wave.open(wav) as w:
        return np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32)


def tighten(x, bw, max_pause):
    """Kürzt Pausen zwischen Wörtern auf max_pause. Gibt Audio + verschobene Wortzeiten zurück."""
    bw = [dict(b) for b in bw]
    cuts = []
    for a, b in zip(bw, bw[1:]):
        gap = b["t"] - (a["t"] + a["d"])
        if gap > max_pause:
            c0 = a["t"] + a["d"] + max_pause / 2
            cuts.append((c0, c0 + gap - max_pause))
    if not cuts:
        return x, bw
    keep, pos = [], 0
    for c0, c1 in cuts:
        keep.append(x[pos:int(c0 * SR)]); pos = int(c1 * SR)
    keep.append(x[pos:])
    for b in bw:
        b["t"] -= sum(c1 - c0 for c0, c1 in cuts if c1 <= b["t"] + 1e-6)
    return np.concatenate(keep), bw


def breath(seed, dur=0.32, level=0.018):
    """Leises, natürliches Einatmen (gefiltertes Rauschen mit Atem-Hüllkurve)."""
    r = np.random.default_rng(seed)
    n = int(dur * SR); t = np.arange(n) / n
    x = r.standard_normal(n)
    b, a = signal.butter(2, [350 / (SR / 2), 2200 / (SR / 2)], "band"); x = signal.lfilter(b, a, x)
    b, a = signal.butter(2, [900 / (SR / 2), 1500 / (SR / 2)], "band"); x = x + 0.6 * signal.lfilter(b, a, r.standard_normal(n))
    e = np.sin(np.pi * np.clip(t * 1.15, 0, 1)) ** 1.5
    x = x / (np.max(np.abs(x)) + 1e-9) * e
    return x * level * 32767


def split_sentences(text):
    out = []
    for p in re.split(r"(?<=[.?!…])\s+", text.strip()):
        if out and not norm(p):  # reines Satzzeichen ("…") an vorigen Satz hängen
            out[-1] += " " + p
        elif p:
            out.append(p)
    return out


def pause_after(sentence):
    s = sentence.rstrip("“”\"' ")
    if s.endswith("…"): return 0.45
    if s.endswith("?"): return 0.28
    if s.endswith("!"): return 0.24
    return 0.25


def align(text, bwords):
    """Ordnet jedem Untertitel-Token (Wort aus dem Skript) die Zeit aus den TTS-Wortgrenzen zu."""
    out, j = [], 0
    for tok in text.split():
        n = norm(tok)
        if not n:  # reines Satzzeichen (–, …) an vorheriges Token hängen
            if out: out[-1]["text"] += " " + tok
            continue
        hit = None
        for k in range(j, min(j + 4, len(bwords))):
            b = norm(bwords[k]["w"])
            if b == n or (b and (n.startswith(b) or b.startswith(n))):
                hit = k; break
        if hit is None and j < len(bwords):
            hit = j
        if hit is not None:
            b = bwords[hit]
            out.append({"text": tok, "n": n, "t": b["t"], "e": b["t"] + b["d"]}); j = hit + 1
        else:
            t = out[-1]["e"] if out else 0
            out.append({"text": tok, "n": n, "t": t, "e": t + 0.3})
    return out


def main(proj):
    sc = json.load(open(os.path.join(proj, "script.json"), encoding="utf-8"))
    build = os.path.join(proj, "build", "tts"); os.makedirs(build, exist_ok=True)
    voice0, rate0, pitch0 = sc.get("voice", "de-DE-FlorianMultilingualNeural"), sc.get("rate", "+0%"), sc.get("pitch", "+0Hz")
    gap, lead, human = sc.get("gap", 0.3), sc.get("lead_in", 0.3), sc.get("humanize", True)

    pcm = [np.zeros(int(lead * SR), np.float32)]
    cur = lead
    timeline = {"segments": [], "fps": 30}
    for si, seg in enumerate(sc["segments"]):
        voice = seg.get("voice", voice0)
        r_base, p_base = pct(seg.get("rate", rate0)), pct(seg.get("pitch", pitch0))
        maxp = seg.get("max_pause", sc.get("max_pause", 0.42))
        sentences = split_sentences(seg["text"]) if human else [seg["text"]]
        seg_start = cur
        bw_all = []
        # Atemzug vor dem Segment (in die Lücke davor gelegt, endet kurz vor dem ersten Wort)
        want_breath = seg.get("breath", human and si > 0 and (si % 3 == 0 or seg["text"][:1] in "AU") and not seg.get("fx"))
        for k, sent in enumerate(sentences):
            # deterministische, kleine Variation pro Satz
            hsh = int(hashlib.md5(sent.encode()).hexdigest()[:6], 16)
            dr = ((hsh % 7) - 3) if human else 0            # -3..+3 %
            dp = (((hsh >> 4) % 5) - 2) if human else 0     # -2..+2 Hz
            if human and sent.rstrip().endswith("?"): dp += 2
            if human and len(sent.split()) <= 3: dr -= 2   # kurze Einwürfe ruhiger, mit Gewicht
            rate, pitch = f"{r_base + dr:+d}%", f"{p_base + dp:+d}Hz"
            key = hashlib.md5(f"{voice}|{rate}|{pitch}|{sent}".encode()).hexdigest()[:10]
            mp3, wav, js = (os.path.join(build, f"{seg['id']}_{k}_{key}.{x}") for x in ("mp3", "wav", "json"))
            if not os.path.exists(js):
                print("TTS:", seg["id"], k, rate, pitch)
                json.dump(asyncio.run(synth(sent, voice, rate, pitch, mp3)), open(js, "w"))
            bw = json.load(open(js))
            x = to_pcm(mp3, wav, seg.get("fx"))
            if bw:  # Stille vorn/hinten trimmen
                s0 = max(0, bw[0]["t"] - 0.06); e0 = min(len(x) / SR, bw[-1]["t"] + bw[-1]["d"] + 0.14)
                x = x[int(s0 * SR):int(e0 * SR)]
                for b in bw: b["t"] -= s0
            x, bw = tighten(x, bw, maxp)
            if k == 0 and want_breath:
                br = breath(hsh, level=seg.get("breath_level", sc.get("breath_level", 0.05)))
                # Atem in die vorige Lücke legen (überlappt mit Stille davor)
                prev = pcm[-1]; L = min(len(br), len(prev))
                if L > 0: prev[-L:] += br[-L:]
            for b in bw: b["t"] += cur
            bw_all.append((sent, bw))
            pcm.append(x.copy()); cur += len(x) / SR
            if k < len(sentences) - 1:
                p = pause_after(sent) + ((hsh % 5) - 2) * 0.02
                pcm.append(np.zeros(int(p * SR), np.float32)); cur += p
        words = []
        for sent, bw in bw_all:
            words += align(sent, bw)
        g = seg.get("gap_after", pause_after(sentences[-1]) if human else gap)
        pcm.append(np.zeros(int(g * SR), np.float32)); cur += g
        timeline["segments"].append({**{k: v for k, v in seg.items() if k != "text"}, "text": seg["text"],
                                     "start": seg_start, "end": cur, "words": words})
    end = sc.get("end_card")
    if end:
        timeline["end_card"] = {**end, "start": cur}
        pcm.append(np.zeros(int(end.get("dur", 2.5) * SR), np.float32)); cur += end.get("dur", 2.5)
    timeline["duration"] = cur
    out = os.path.join(proj, "build")
    data = np.clip(np.concatenate(pcm), -32768, 32767).astype(np.int16)
    with wave.open(os.path.join(out, "voice.wav"), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(data.tobytes())
    json.dump(timeline, open(os.path.join(out, "timeline.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"Voice-over: {cur:.1f} s, {len(timeline['segments'])} Segmente")


if __name__ == "__main__":
    main(sys.argv[1])
