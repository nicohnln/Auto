---
name: tiktok-was-waere-wenn
description: Erstellt fertige TikTok-Erklärvideos (9:16, Deutsch) im Stil "Was wäre, wenn …?" mit flacher 2D-Animation, wortgenauen farbigen Untertiteln, HUD (Zeit-Chip, Zähler, Checkliste), menschlichem Neural-Voice-over, Musikteppich und Soundeffekten. Nutzen bei: TikTok-Video, "Was wäre wenn", Erklärvideo, Short/Reel erstellen, Video wie die Referenzen.
---

# TikTok „Was wäre, wenn …?“ – Videoproduktion

Ergebnis: eine fertige MP4 (1080×1920, 30 fps, AAC, −14 LUFS), direkt hochladbar.
Alles wird lokal erzeugt (Grafik, Musik, SFX). Nur das Voice-over kommt von Microsofts Neural-TTS (edge-tts, kostenlos).

## 1. Stil-DNA (aus den 3 Referenzvideos analysiert)

Referenzen: „Was wäre, wenn alle Frauen sterben“ (flache 2D-Story, Hauptvorbild), „What if it rained for a thousand years?“ (Zeitraffer-Eskalation), „Wie nah berühren sich deine Finger wirklich?“ (Zoom-Reise mit Messschieber).

**Format & Länge**
- 9:16, 70–110 s, harter Schnitt alle 2–4 s (eine Szene pro Satz/Halbsatz).
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
   - 14–20 Segmente, je 1–2 kurze Sätze (insgesamt ~180–220 Wörter ≈ 75–90 s).
   - Pro Segment: `scene`, `chip`, `text`, `hl` (Schlüsselwort → Farbe, Wörter kleingeschrieben ohne Satzzeichen), optional `counter`, `list`, `tint` (`red`/`sepia`), `sfx`.
   - `counter.at`: `"w:<wort>"` (springt beim Wort) oder `"span"` (läuft über das ganze Segment).
   - `sfx`: `[["start"|"end"|"w:<wort>", name]]`. Namen: whoosh, pop, ding, impact, hit, glitch, error, buzz, stamp, chime, beep, crowd, tick, net, vinyl, coin, heartbeat, riser_short. Impact/Stamp/Error lösen automatisch Kamerawackler und Farbblitz aus.
   - Stimme: `de-DE-FlorianMultilingualNeural` (männlich, sehr natürlich). Alternative: `de-DE-SeraphinaMultilingualNeural` (weiblich). `rate` +4 % bis +8 %.
3. **`scenes.js`** schreiben: eine Funktion pro `scene`-Name, `(t, d, S, h) => SVG-String`.
   - `t` = Sekunden seit Segmentstart, `d` = Dauer, `h.wt('wort')` = Zeitpunkt eines Wortes, `h.p(t,a,b)` = Fortschritt 0..1, `E.outBack` usw. = Easing.
   - Bausteine aus `engine/lib.js`: `person()`, `figure()`, `phone()`, `hand()`, `notif()`, `globe()`, `shelf()`, `register()`, `bus()`, `bakery()`, `trash()`, `house()`, `coin()`, `banknote()`, `cigPack()`, `bread()`, `noodles()`, `toiletPaper()`, `stamp()`, `bigX()`, `arrowCurve()`, `confetti()`, `clockFace()`, `bubble()`, `heartLine()`, `spotlight()`, `ring()`, `T()` (Text), `G()` (Gruppe mit x/y/s/r/op).
   - Bildbereich für Grafik: y ≈ 360–1200. Darunter (ab 1235) liegen die Untertitel, unten ~450 px bleiben für die TikTok-Oberfläche frei.
   - Jede Szene braucht schon ab t = 0.1 s sichtbaren Inhalt (keine leeren Frames).
4. **Bauen:** `bash .claude/skills/tiktok-was-waere-wenn/engine/build.sh videos/<slug>`
   Einzelschritte: `engine/tts.py`, `engine/audio.py`, `engine/render.cjs` (mit `--stills 1.5,7,20` für Kontrollbilder).
5. **Kontrolle:** Kontrollbilder pro Segment rendern und ansehen (Überlappungen Chip/Liste/Zähler, leere Frames, Text über Grafik). Lautheit prüfen: `ffmpeg -i build/mix.wav -af ebur128 -f null -` → ca. −14 bis −15 LUFS.

## 3. Technik und Voraussetzungen

- Python: `edge-tts`, `numpy`, `scipy`. Node: `playwright` mit Chromium. Dazu `ffmpeg`.
- Netzwerk: `speech.platform.bing.com` muss erreichbar sein (in der Cloud-Umgebung „auto“ freigeschaltet). edge-tts läuft über den Proxy aus `HTTPS_PROXY`.
- `tts.py` kürzt Sprechpausen automatisch auf 0,42 s (`max_pause`) für TikTok-Tempo und richtet jedes Untertitelwort an den TTS-Wortgrenzen aus.
- Rendern: 4 Chromium-Worker, ~80 s für ein 80-s-Video.
- `build/` ist temporär (gitignored). Nur `script.json` und `scenes.js` gehören ins Repo.

## 4. Text-Regeln für das Skript

- Du-Form, gesprochene Sprache, Sätze mit max. ~10 Wörtern, viele Pausen-Punkte.
- Jede Szene muss in einem Bild erzählbar sein (konkretes Objekt oder konkrete Handlung).
- Mindestens ein überprüfbarer echter Fakt als Wendepunkt, Zahlen realistisch.
- Ende: offene Frage plus „FORTSETZUNG FOLGT …“, Untertitelzeile auf der Abspannkarte als Kommentar-Aufforderung.
