---
name: tiktok-was-waere-wenn
description: Erstellt fertige TikTok-Erklärvideos (9:16, Deutsch) im Stil "Was wäre, wenn …?" mit flacher 2D-Animation, wortgenauen farbigen Untertiteln, HUD (Zeit-Chip, Zähler, Checkliste), menschlichem Neural-Voice-over, Musikteppich und Soundeffekten. Nutzen bei: TikTok-Video, "Was wäre wenn", Erklärvideo, Short/Reel erstellen, Video wie die Referenzen.
---

# TikTok „Was wäre, wenn …?“ – Videoproduktion

Ergebnis: eine fertige MP4 (1080×1920, 30 fps, AAC, −14 LUFS), direkt hochladbar.
Alles wird lokal erzeugt: Grafik, Musik, SFX und die Stimme.

## 0. Stimme (wichtigster Qualitätsfaktor)

**Standard: `"tts": "orpheus"`, `"voice": "thomas"`** – vom Creator am 25.11.2026 per Hör-Casting gewählt (Orpheus Thomas vor Max, Jana und Chatterbox).
- Modell: deutsches Orpheus 3B von Canopy Labs (Apache-2.0), lokal auf CPU über llama.cpp (`Orpheus-3b-German-FT-Q8_0.gguf`, ungated Kopie von `lex-au`) und SNAC-Decoder (`hubertsiuzdak/snac_24khz`, MIT). Code: `engine/orpheus_de.py` und `engine/tts_orpheus.py`.
- Jedes Segment wird **am Stück** gesprochen, damit Melodie und Atmung natürlich durchlaufen. Es gibt **keine** Tonhöhen-Verschiebung und **keine** Tempo-Tricks.
- Emotionen: im Feld `"say"` (gesprochener Text) Tags wie `<chuckle>`, `<sigh>`, `<gasp>` oder `<laugh>` sparsam einsetzen, 3–5 pro Video. `"text"` bleibt der Untertitel ohne Tags.
- Dauer: ca. 10× Echtzeit (60 s Audio ≈ 10–20 min inkl. Prüfung).
- Mix: sanfte Kompression und leichte Präsenz, kein Hall.
- **Wichtigste Lehre:** Claude kann Audio nicht hören. Stimmen nie nach Messwerten „optimieren“, das hat die Stimme schlechter gemacht. Bei Stimmfragen immer ein **Hör-Casting** (gleicher Text, mehrere Varianten, nummeriert) schicken und den Creator wählen lassen.
- Die menschlichste Option bleibt die **eigene Aufnahme des Creators** (Sprachmemo). Sie lässt sich bereinigen und mit Whisper wortgenau untertiteln.

Ältere Engines, nur noch Notlösungen:
- `"tts": "chatterbox"`: Das ist ein Open-Source-Sprachmodell (Chatterbox Multilingual, MIT-Lizenz, läuft lokal auf der CPU) mit einer **echten menschlichen Referenzstimme** (Thorsten-Voice, deutscher Sprecher, CC0) in vier Emotionen: `neutral`, `amused`, `surprised`, `whisper`. Die Microsoft-Stimme (edge-tts) klingt dem Creator zu sehr nach KI und ist nur noch eine Notlösung.
- Einmalige Einrichtung: `engine/setup_chatterbox.sh` (lädt venv, Modelle und Referenzen; ~7 GB). Netzwerk: `huggingface.co`, `us.aws.cdn.hf.co`.
- **Stimmstil `"voice_style": "doku"` (Standard, Wunsch des Creators: „wie in den Referenzen“).** Die Referenzstimmen wurden gemessen: tiefe Männerstimme (~97–110 Hz), ruhig und kontrolliert (~3,7 Halbtöne Melodie-Schwankung), schnell (~170 Wörter/min), präsent und trocken. Umsetzung:
  - Referenzen 4 Halbtöne tiefer, Formanten erhalten (Rubber Band, Dateien `*_d4.wav`)
  - Emotionsstärke ×0,72, `cfg` ≥ 0,5
  - Präsenz-EQ und harte Kompression ohne Raumhall
  - Am Ende wird die Stimme um weitere 2,5 Halbtöne abgesenkt (`voice_pitch`, Formanten und Timing bleiben gleich), Tempo 1,14, Satzpausen ×0,82.
  - Gemessen im Endmix: ~101–104 Hz, 166 Wörter/min, 2,8 dB Lautstärke-Dynamik (Referenzen: 97–106 Hz, 169–178 W/min, 2,3–2,4 dB).
  - Bestätigt durch eine vierte Referenz des Creators (Geld-Erklärvideo, schwarz-weiß): tiefe Männerstimme ~95–100 Hz, 174 Wörter/min, sehr gleichmäßige Lautstärke (2,3 dB Dynamik).
  Die Referenzstimmen selbst werden **nicht** geklont (Rechte der anderen Creator). Alternative: `"voice_style": "emotional"` (höher, mehr Schwankung).
- Pro Segment `emotion` passend zum Inhalt wählen, außerdem `ex` (Emotionsstärke 0.5–0.75) und `cfg` (0.35–0.45; niedriger = ruhiger). Neutral erzählen, `surprised` bei Wendungen, `amused` bei positiven Stellen, `whisper` bei persönlichen oder unheimlichen Momenten.
- Qualitätskontrolle läuft automatisch: Whisper hört jeden Satz nach, bei Fehlern wird neu generiert. Die Wort-Zeitstempel kommen ebenfalls aus Whisper.
  - Geprüft wird die **End-Fassung** (abgesenkt und beschleunigt), Schwelle 0,93.
  - **Wiederholungen** werden erkannt (mehr gehörte Wörter als im Skript) und nie genommen, genauso **gedehnte Wörter** (versteckte Wiederholung).
  - Sätze mit höchstens 2 Wörtern werden mit dem Nachbarsatz zusammen gesprochen. Allein wiederholt das Modell sie gern.
  - Ändern sich Stil-Parameter, werden gespeicherte Sätze automatisch in der neuen End-Fassung nachgehört.
- Dauer: ca. 5× Echtzeit auf 4 CPU-Kernen (60 s Audio ≈ 6–10 min).

## 1. Stil-DNA (aus den 3 Referenzvideos analysiert)

Referenzen: „Was wäre, wenn alle Frauen sterben“ (flache 2D-Story, Hauptvorbild), „What if it rained for a thousand years?“ (Zeitraffer-Eskalation), „Wie nah berühren sich deine Finger wirklich?“ (Zoom-Reise mit Messschieber).

**Format & Länge**
- 9:16, **höchstens 70 s** inkl. Abspann (Wunsch des Creators), harter Schnitt alle 2–4 s (eine Szene pro Satz/Halbsatz).
- Dunkler Navy-Hintergrund (radialer Verlauf #1d2150 → #0b0d20) mit schwachen Sternpunkten und Vignette.
- Flache Vektor-Illustration: runde Köpfe, einfache Körper, kräftige Flächenfarben, Glow für wichtige Objekte. Stimmungs-Tints: Rot = Gefahr, Sepia = Vergangenheit.

**Durchgehendes HUD (wichtigstes Wiedererkennungsmerkmal)**
- Zeit-/Kapitel-Chip oben mittig in Mono-Schrift, goldener Rahmen: „TAG 1 · 07:12“, „WOCHE 3“, „REGEL 2 · UNSICHTBAR“. Tippt sich bei Wechsel neu ein.
- Zähler-Box darunter mit farbigem Glow-Rahmen und großer Zahl, die live hoch- oder runterzählt („FRAUEN AUF DER ERDE 3.999.384.396“, „WATER 9 M ABOVE THE STREET“, Messschieber „0,32 nm“).
- Checkliste oben links, die mit jeder Etappe wächst („1. HANDY ✓ 2. UNSICHTBAR ✓“).

**Dramaturgie**
1. Hook in den ersten 2 s in Du-Form: „Stell dir vor, du wachst morgen auf …“ / „Du wachst eines Morgens auf …“.
2. Eskalation über Zeit oder Maßstab (Stunde → Tag → Woche → Jahr bzw. cm → mm → nm). Jede Etappe = neuer Chip-Wert.
3. Konkrete, nachvollziehbare Alltagsdetails (Kontostand, Supermarkt, SIM-Karte) statt abstrakter Aussagen.
4. Wendung/Aha-Moment mit echtem Fakt („Genau das ist 1945 wirklich passiert“).
5. Cliffhanger-Frage + Abspann „FORTSETZUNG FOLGT …“ (treibt Kommentare und Teil 2).

**Untertitel (wortgenau)**
- Mittig auf ~65 % Höhe, Inter Black, GROSSBUCHSTABEN, 2 Zeilen, max. ~24 Zeichen pro Phrase.
- Ganze Phrase steht da: noch nicht gesprochene Wörter grau (#5f6385), gesprochene weiß, Schlüsselwörter farbig mit Glow.
- Farbcode: gelb = wichtig/Zahl, rot = Gefahr/Verlust, grün = positiv/Lösung, blau = Objekt/neutral, pink = Personen/Überraschung.
- Jedes neue Wort ploppt kurz (Scale 1.09 → 1).

**Ton**
- Erzählstimme: ruhig, persönlich, leicht spannungsgeladen, Du-Ansprache, kurze Sätze, rhetorische Fragen („Klingt erstmal genial, oder?“).
- Musikteppich läuft durchgehend unter der Stimme (Moll, Puls, Arpeggio), ca. 14 dB leiser als die Stimme, mit Ducking.
- Soundeffekte auf Schlüsselwörtern: Whoosh bei jedem Szenenwechsel, Impact bei Enthüllungen, Ding bei Nachrichten, Error/Buzz bei Fehlschlägen, Stempel, Herzschlag beim Cliffhanger.
- Endmix laut und komprimiert (Referenzen: −15 LUFS, LRA ~2,5).

## 2. Workflow für ein neues Video

1. **Projektordner** anlegen: `videos/<slug>/` (Slug = Thema, z. B. `strom-weg`).
2. **`script.json`** schreiben (Vorlage: `videos/geld-abgeschafft/script.json`):
   - 10–13 Segmente, je 1–2 kurze Sätze (insgesamt ~140–155 Wörter ≈ 60–66 s + Abspann ≤ 70 s). Zahlen als Wörter schreiben („zwölfhundert Euro“), weil Chatterbox Ziffern nicht zuverlässig ausspricht.
   - Pro Segment: `scene`, `chip`, `text`, `hl` (Schlüsselwort → Farbe, Wörter kleingeschrieben ohne Satzzeichen), optional `counter`, `list`, `tint` (`red`/`sepia`), `sfx`.
   - `counter.at`: `"w:<wort>"` (springt beim Wort) oder `"span"` (läuft über das ganze Segment).
   - `sfx`: `[["start"|"end"|"w:<wort>", name]]`. Namen: whoosh, pop, ding, static (Funkrauschen), impact, hit, glitch, error, buzz, stamp, chime, beep, crowd, tick, net, vinyl, coin, heartbeat, riser_short. Impact/Stamp/Error lösen automatisch Kamerawackler und Farbblitz aus.
   - Stimme: `de-DE-FlorianMultilingualNeural` (männlich, sehr natürlich). Alternative: `de-DE-SeraphinaMultilingualNeural` (weiblich). `rate` +3 % bis +6 %.
   - **Menschliche Stimme** (`"humanize": true`, Standard): Jeder Satz wird einzeln gesprochen, mit leicht variiertem Tempo und Tonhöhe. Fragen gehen hoch, kurze Einwürfe sind ruhiger. Die Pausen richten sich nach dem Satzzeichen, dazu kommen leise Atemzüge (`breath_level`, Standard 0.05) und ein warmer Mikrofon-Klang mit kleinem Raum (`voice_room`, Standard 0.10).
   - Pro Segment möglich: `rate` (z. B. `-8%` für ruhige, emotionale Stellen), `pitch`, `voice` (zweite Stimme), `fx: "radio"` (Funkgerät/Telefon), `breath: false`, `max_pause`, `music: [pad, bass, arp, kick]` (Intensität 0–1 je Musikspur).
   - Zähler-`to` darf Text sein (z. B. `"2 ?"`): Er springt beim Wort aus `at` um.
3. **`scenes.js`** schreiben: eine Funktion pro `scene`-Name, `(t, d, S, h) => SVG-String`.
   - `t` = Sekunden seit Segmentstart, `d` = Dauer, `h.wt('wort')` = Zeitpunkt eines Wortes, `h.p(t,a,b)` = Fortschritt 0..1, `E.outBack` usw. = Easing.
   - Bausteine aus `engine/lib.js`: `person()`, `figure()`, `phone()`, `hand()`, `notif()`, `globe()`, `shelf()`, `register()`, `bus()`, `bakery()`, `trash()`, `house()`, `coin()`, `banknote()`, `cigPack()`, `bread()`, `noodles()`, `toiletPaper()`, `stamp()`, `bigX()`, `arrowCurve()`, `confetti()`, `clockFace()`, `bubble()`, `heartLine()`, `spotlight()`, `ring()`, `car()`, `trafficLight()`, `skyline()`, `moon()`, `candle()`, `tinCan()`, `walkie()`, `faucet()`, `powerPlant()`, `pylon()`, `dog()`, `waveform()`, `T()` (Text), `G()` (Gruppe mit x/y/s/r/op).
   - Bildbereich für Grafik: y ≈ 360–1200. Darunter (ab 1235) liegen die Untertitel, unten ~450 px bleiben für die TikTok-Oberfläche frei.
   - Jede Szene braucht schon ab t = 0.1 s sichtbaren Inhalt (keine leeren Frames).
4. **Bauen:** `bash .claude/skills/tiktok-was-waere-wenn/engine/build.sh videos/<slug>`
   Einzelschritte: `engine/tts.py`, `engine/audio.py`, `engine/render.cjs` (mit `--stills 1.5,7,20` für Kontrollbilder), `engine/transcript.py` (Transkript mit Zeitstempeln als `transkript.txt` + `.srt`).
   Nur Ton geändert (gleiche Timeline)? Dann reicht `audio.py` + Muxen, kein neues Rendern.
5. **Kontrolle:** Kontrollbilder pro Segment rendern und ansehen (Überlappungen Chip/Liste/Zähler, leere Frames, Text über Grafik). Lautheit prüfen: `ffmpeg -i build/mix.wav -af ebur128 -f null -` → ca. −14 bis −15 LUFS.

## 3. Technik und Voraussetzungen

**Grundregel: Alles muss komplett kostenlos und ohne Anmeldung laufen.** Keine kostenpflichtigen Dienste, keine Konten oder API-Keys (also z. B. kein ElevenLabs, keine Stock-Musik-Abos). Grafik, Musik und SFX werden lokal erzeugt. Schriften sind Open Source (OFL).

- Python: `edge-tts`, `numpy`, `scipy`. Node: `playwright` mit Chromium. Dazu `ffmpeg`.
- Netzwerk: `speech.platform.bing.com` muss erreichbar sein (in der Cloud-Umgebung „auto“ freigeschaltet). edge-tts läuft über den Proxy aus `HTTPS_PROXY`.
- `tts.py` kürzt Sprechpausen automatisch auf 0,42 s (`max_pause`) für TikTok-Tempo und richtet jedes Untertitelwort an den TTS-Wortgrenzen aus.
- Rendern: 4 Chromium-Worker, ~80 s für ein 80-s-Video.
- `build/` ist temporär (gitignored). Nur `script.json` und `scenes.js` gehören ins Repo.

## 4. Text-Regeln für das Skript

- **Persönlich erzählen:** wie ein Freund, der dir die Geschichte erzählt. Einschübe wie „Und ehrlich?“, „Weißt du, was …?“, kleine echte Details („deine Mama, zuletzt online gestern 23:58“), Ein-Wort-Sätze für Gewicht („Laut.“, „Gratis.“).
- Emotionale Stellen langsamer (`rate` −4 bis −8 %), aufregende Stellen mit Grundtempo.

- Du-Form, gesprochene Sprache, Sätze mit max. ~10 Wörtern, viele Pausen-Punkte.
- Jede Szene muss in einem Bild erzählbar sein (konkretes Objekt oder konkrete Handlung).
- Mindestens ein überprüfbarer echter Fakt als Wendepunkt, Zahlen realistisch.
- Ende: offene Frage plus „FORTSETZUNG FOLGT …“, Untertitelzeile auf der Abspannkarte als Kommentar-Aufforderung.
