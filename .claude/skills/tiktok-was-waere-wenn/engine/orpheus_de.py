#!/usr/bin/env python3
"""Deutsches Orpheus-TTS (Canopy Labs, Apache-2.0) lokal auf CPU via llama.cpp + SNAC-Decoder (MIT).
Stimmen: jana (weiblich), thomas (männlich, ruhig), max (männlich, energisch).
Emotions-Tags im Text: <laugh> <chuckle> <sigh> <gasp> <groan> <yawn> <cough> <sniffle>
"""
import os
import numpy as np
import torch

GGUF = os.environ.get("ORPHEUS_GGUF", "/home/user/models/orpheus-de/Orpheus-3b-German-FT-Q8_0.gguf")
SNAC_DIR = os.environ.get("SNAC_DIR", "/home/user/models/snac")
SR = 24000
START_HUMAN, EOT, END_HUMAN, START_SPEECH, END_SPEECH, AUDIO0 = 128259, 128009, 128260, 128257, 128258, 128266

_llm = _snac = None


def _load():
    global _llm, _snac
    if _llm is None:
        from llama_cpp import Llama
        _llm = Llama(model_path=GGUF, n_ctx=4096, n_threads=os.cpu_count() or 4, n_batch=256, verbose=False)
    if _snac is None:
        import json
        from snac import SNAC
        cfg = json.load(open(os.path.join(SNAC_DIR, "config.json")))
        _snac = SNAC(**cfg)
        _snac.load_state_dict(torch.load(os.path.join(SNAC_DIR, "pytorch_model.bin"), map_location="cpu"))
        _snac.eval()
    return _llm, _snac


def synth(text, voice="thomas", temp=0.6, top_p=0.95, rep=1.1, max_tokens=1600, seed=None):
    llm, snac = _load()
    if seed is not None:
        llm.set_seed(int(seed))
    ids = llm.tokenize(f"{voice}: {text}".encode("utf-8"), add_bos=True, special=True)
    prompt = [START_HUMAN] + ids + [EOT, END_HUMAN]
    out = []
    llm.reset()
    for tok in llm.generate(prompt, temp=temp, top_p=top_p, repeat_penalty=rep, reset=True):
        if tok == END_SPEECH or tok == EOT and out:
            break
        out.append(tok)
        if len(out) >= max_tokens:
            break
    if START_SPEECH in out:
        out = out[len(out) - out[::-1].index(START_SPEECH):]
    codes = [t - AUDIO0 for t in out if t >= AUDIO0]
    n = len(codes) // 7
    if n == 0:
        return np.zeros(0, np.float32)
    l1, l2, l3 = [], [], []
    for i in range(n):
        c = codes[7 * i:7 * i + 7]
        l1.append(c[0]); l2.append(c[1] - 4096); l3.append(c[2] - 2 * 4096); l3.append(c[3] - 3 * 4096)
        l2.append(c[4] - 4 * 4096); l3.append(c[5] - 5 * 4096); l3.append(c[6] - 6 * 4096)
    clip = lambda a: torch.tensor([min(max(x, 0), 4095) for x in a]).unsqueeze(0)
    with torch.no_grad():
        audio = snac.decode([clip(l1), clip(l2), clip(l3)])
    return audio.squeeze().numpy().astype(np.float32)


if __name__ == "__main__":
    import sys, time, soundfile as sf
    t0 = time.time()
    y = synth(sys.argv[2] if len(sys.argv) > 2 else "Hallo, ich bin Thomas. Schön, dass du da bist.", sys.argv[1] if len(sys.argv) > 1 else "thomas")
    sf.write("/tmp/orpheus_test.wav", y, SR)
    print(f"{len(y)/SR:.1f}s Audio in {time.time()-t0:.1f}s")
