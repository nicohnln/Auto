#!/usr/bin/env bash
# Komplettes Video bauen:  bash build.sh <projektordner>
# Ergebnis: <projektordner>/<ordnername>.mp4 (1080x1920, 30 fps, -14 LUFS)
set -euo pipefail
ENGINE="$(cd "$(dirname "$0")" && pwd)"
PROJ="$(cd "$1" && pwd)"
NAME="$(basename "$PROJ")"

python3 -c "import edge_tts, numpy, scipy" 2>/dev/null || pip install -q edge-tts numpy scipy

if ! grep -q '"voiceover": *true' "$PROJ/script.json"; then
  echo "== 1/4 Kein Voice-over (Standard): Zeitleiste aus dem Skripttext =="
  python3 "$ENGINE/timeline_text.py" "$PROJ"
elif grep -q '"tts": *"orpheus"' "$PROJ/script.json"; then
  echo "== 1/4 Voice-over (Orpheus, Stimme Thomas) =="
  "${TTS_VENV:-/home/user/tts-venv}/bin/python" "$ENGINE/tts_orpheus.py" "$PROJ"
elif grep -q '"tts": *"chatterbox"' "$PROJ/script.json"; then
  echo "== 1/4 Voice-over (Chatterbox, menschliche Referenzstimme) =="
  [ -x "${TTS_VENV:-/home/user/tts-venv}/bin/python" ] || bash "$ENGINE/setup_chatterbox.sh"
  "${TTS_VENV:-/home/user/tts-venv}/bin/python" "$ENGINE/tts_chatterbox.py" "$PROJ"
else
  echo "== 1/4 Voice-over (edge-tts) =="
  python3 "$ENGINE/tts.py" "$PROJ"
fi
echo "== 2/4 Musik + SFX + Mix =="
python3 "$ENGINE/audio.py" "$PROJ"
echo "== 3/4 Frames rendern =="
node "$ENGINE/render.cjs" "$PROJ" --workers "${WORKERS:-4}"
echo "== 4/4 Muxen =="
ffmpeg -v error -y -i "$PROJ/build/video_noaudio.mp4" -i "$PROJ/build/mix.wav" \
  -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart "$PROJ/$NAME.mp4"
python3 "$ENGINE/transcript.py" "$PROJ" > /dev/null
echo "Fertig: $PROJ/$NAME.mp4 (+ transkript.txt / transkript.srt)"
