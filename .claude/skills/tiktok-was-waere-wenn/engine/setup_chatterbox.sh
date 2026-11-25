#!/usr/bin/env bash
# Einmalige Einrichtung der menschlichen Stimme (alles kostenlos, ohne Konto):
#  - Chatterbox Multilingual (Resemble AI, MIT-Lizenz) + faster-whisper in eigener venv
#  - Modelldateien von Hugging Face (öffentlich, nicht gated)
#  - Referenzstimme: Thorsten-Voice (echter deutscher Sprecher, CC0), 4 Emotionen
# Netzwerk: huggingface.co, us.aws.cdn.hf.co (+ PyPI) müssen erreichbar sein.
set -euo pipefail
VENV="${TTS_VENV:-/home/user/tts-venv}"; M="${MODELS:-/home/user/models}"
HF=https://huggingface.co
[ -x "$VENV/bin/python" ] || { uv venv -q -p 3.12 "$VENV"; VIRTUAL_ENV="$VENV" uv pip install -q chatterbox-tts==0.1.7 faster-whisper "setuptools<81"; }
mkdir -p "$M/chatterbox" "$M/whisper-small" "$M/thorsten/refs"
for f in ve.pt t3_mtl23ls_v2.safetensors s3gen.pt grapheme_mtl_merged_expanded_v1.json conds.pt Cangjie5_TC.json; do
  [ -s "$M/chatterbox/$f" ] || curl -sL --fail -o "$M/chatterbox/$f" "$HF/ResembleAI/chatterbox/resolve/main/$f"; done
for f in config.json model.bin tokenizer.json vocabulary.txt; do
  [ -s "$M/whisper-small/$f" ] || curl -sL --fail -o "$M/whisper-small/$f" "$HF/Systran/faster-whisper-small/resolve/main/$f"; done
D="$M/thorsten"
[ -s "$D/emotional0.parquet" ] || curl -sL --fail -o "$D/emotional0.parquet" "$HF/datasets/Thorsten-Voice/TV-44kHz-Full/resolve/main/TV-2021.06-Emotional/train-00000-of-00002.parquet"
[ -s "$D/neutral2022_0.parquet" ] || curl -sL --fail -o "$D/neutral2022_0.parquet" "$HF/datasets/Thorsten-Voice/TV-44kHz-Full/resolve/main/TV-2022.10-Neutral/train-00000-of-00008.parquet"
python3 -c "import pyarrow" 2>/dev/null || pip install -q pyarrow
python3 "$(dirname "$0")/make_refs.py" "$D"
echo "Chatterbox bereit."
