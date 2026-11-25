#!/usr/bin/env python3
"""Stufe 1: Voice-over erzeugen (edge-tts, Microsoft Neural) + wortgenaue Timeline.

Aufruf:  python3 tts.py <projektordner>
Liest   <projekt>/script.json
Schreibt <projekt>/build/voice.wav, <projekt>/build/timeline.json
"""
import asyncio, hashlib, json, os, re, subprocess, sys, wave

import edge_tts

SR = 48000


def norm(s):
    return re.sub(r"[^0-9a-zäöüß]", "", s.lower())


async def synth(text, voice, rate, pitch, mp3_path):
    proxy = os.environ.get("HTTPS_PROXY") or os.environ.get("https_proxy")
    kw = dict(boundary="WordBoundary", rate=rate, pitch=pitch)
    if proxy:
        kw["proxy"] = proxy
    for attempt in range(4):
        try:
            words, audio = [], bytearray()
            c = edge_tts.Communicate(text, voice, **kw)
            async for ch in c.stream():
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


def to_pcm(mp3, wav):
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", mp3, "-ac", "1", "-ar", str(SR), "-sample_fmt", "s16", wav], check=True)
    with wave.open(wav) as w:
        return w.readframes(w.getnframes())


def tighten(data, bw, max_pause):
    """Kürzt Sprechpausen zwischen Wörtern auf max_pause (TikTok-Tempo). Gibt Audio + verschobene Wortzeiten zurück."""
    bw = [dict(b) for b in bw]
    cuts = []  # (start_s, end_s) zu entfernen, aus der stillen Mitte der Pause
    for a, b in zip(bw, bw[1:]):
        gap = b["t"] - (a["t"] + a["d"])
        if gap > max_pause:
            mid0 = a["t"] + a["d"] + max_pause / 2
            cuts.append((mid0, mid0 + gap - max_pause))
    if not cuts:
        return data, bw, len(data) / 2 / SR
    out, pos = bytearray(), 0
    for c0, c1 in cuts:
        i0, i1 = int(c0 * SR) * 2, int(c1 * SR) * 2
        chunk = bytearray(data[pos:i0])
        out.extend(chunk)
        pos = i1
    out.extend(data[pos:])
    for b in bw:
        shift = sum(c1 - c0 for c0, c1 in cuts if c1 <= b["t"] + 1e-6)
        b["t"] -= shift
    return bytes(out), bw, len(out) / 2 / SR


def align(text, bwords):
    """Ordnet jedem Untertitel-Token (Wort aus dem Skript) die Zeit aus den TTS-Wortgrenzen zu."""
    tokens = text.split()
    out, j = [], 0
    for tok in tokens:
        n = norm(tok)
        if not n:  # reines Satzzeichen (–, …) an vorheriges Token hängen
            if out:
                out[-1]["text"] += " " + tok
            continue
        hit = None
        for k in range(j, min(j + 4, len(bwords))):
            b = norm(bwords[k]["w"])
            if b == n or (b and (n.startswith(b) or b.startswith(n))):
                hit = k
                break
        if hit is None and j < len(bwords):
            hit = j
        if hit is not None:
            b = bwords[hit]
            out.append({"text": tok, "n": n, "t": b["t"], "e": b["t"] + b["d"]})
            j = hit + 1
        else:  # Fallback: hinter das letzte Wort setzen
            t = out[-1]["e"] if out else 0
            out.append({"text": tok, "n": n, "t": t, "e": t + 0.3})
    return out


def main(proj):
    sc = json.load(open(os.path.join(proj, "script.json"), encoding="utf-8"))
    build = os.path.join(proj, "build", "tts")
    os.makedirs(build, exist_ok=True)
    voice, rate, pitch = sc.get("voice", "de-DE-FlorianMultilingualNeural"), sc.get("rate", "+0%"), sc.get("pitch", "+0Hz")
    gap, lead = sc.get("gap", 0.3), sc.get("lead_in", 0.3)

    pcm = bytearray(b"\x00\x00" * int(lead * SR))
    timeline = {"segments": [], "fps": 30}
    for seg in sc["segments"]:
        r, p = seg.get("rate", rate), seg.get("pitch", pitch)
        key = hashlib.md5(f"{voice}|{r}|{p}|{seg['text']}".encode()).hexdigest()[:10]
        mp3, wav, js = (os.path.join(build, f"{seg['id']}_{key}.{x}") for x in ("mp3", "wav", "json"))
        if not os.path.exists(js):
            print("TTS:", seg["id"])
            bw = asyncio.run(synth(seg["text"], voice, r, p, mp3))
            json.dump(bw, open(js, "w"))
        bw = json.load(open(js))
        data = to_pcm(mp3, wav)
        start = len(pcm) / 2 / SR
        dur = len(data) / 2 / SR
        # Stille am Ende der TTS-Datei kürzen (endet ~0.15 s nach letztem Wort)
        if bw:
            last = bw[-1]["t"] + bw[-1]["d"] + 0.18
            if last < dur:
                data = data[: int(last * SR) * 2]
                dur = last
        data, bw, dur = tighten(data, bw, seg.get("max_pause", sc.get("max_pause", 0.42)))
        pcm.extend(data)
        words = align(seg["text"], bw)
        for w in words:
            w["t"] += start
            w["e"] += start
        g = seg.get("gap_after", gap)
        pcm.extend(b"\x00\x00" * int(g * SR))
        timeline["segments"].append({**{k: v for k, v in seg.items() if k != "text"},
                                     "text": seg["text"], "start": start, "end": start + dur + g, "words": words})
    end = sc.get("end_card")
    total = len(pcm) / 2 / SR
    if end:
        timeline["end_card"] = {**end, "start": total}
        total += end.get("dur", 2.5)
        pcm.extend(b"\x00\x00" * int(end.get("dur", 2.5) * SR))
    timeline["duration"] = total
    out = os.path.join(proj, "build")
    with wave.open(os.path.join(out, "voice.wav"), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(bytes(pcm))
    json.dump(timeline, open(os.path.join(out, "timeline.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"Voice-over: {total:.1f} s, {len(timeline['segments'])} Segmente")


if __name__ == "__main__":
    main(sys.argv[1])
