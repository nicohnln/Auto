---
name: tiktok-was-waere-wenn
description: Erstellt fertige TikTok-Erklärvideos (9:16, Deutsch, max. 70 s) zu "Was wäre, wenn …?"-Themen im minimalistischen Schwarz-Weiß-Stil (Piktogramme mit Glow, große Zahlen, Pillen-Badges, Schlüsselsätze statt Untertiteln, Serien-Endkarte "Nr. X"), mit menschlicher lokaler Orpheus-Stimme "Thomas", Musikteppich und Soundeffekten. Nutzen bei: TikTok-Video, "Was wäre wenn", Erklärvideo, Short/Reel erstellen, Video wie die Referenzen.
---

# TikTok „Was wäre, wenn …?“ – Videoproduktion

Ergebnis: eine fertige MP4 (1080×1920, 30 fps, AAC, −14 LUFS), direkt hochladbar, **höchstens 70 s**.
Alles wird lokal erzeugt (Grafik, Musik, SFX, Stimme). **Grundregel: komplett kostenlos und ohne Anmeldung.**

## 1. Stil-DNA – Standard `"theme": "mono"`

Referenzen (vom Creator am 26.11.2026 vorgegeben, ersetzen die alten): „geld.gesetze“ (Klassenbester / Geldgesetz Nr. 3, Reich-werden-Gedanke / Nr. 13) und „egotalking5“ („Wer mit 1.000 € nicht umgehen kann, verliert auch 1 Million“). Nur Stil und Aufbau übernehmen, **nie Texte, Figuren oder Bilder kopieren**.

**Bild**
- **Reines Schwarz** mit feinem Punktraster und weichem Lichtfleck in der Mitte. **Keine Farben**, nur Weiß, Grau und Glow. Der Player stellt das SVG im Mono-Stil auf Graustufen.
- **Piktogramm-Menschen ohne Gesicht** (`mPerson`): Kreis + abgerundeter Körper. Die **Hauptfigur ist weiß mit Glow**, oft mit **Lichtkegel von oben** (`mSpot`) auf einer **Bühnen-Ellipse** (`mStage`). Nebenfiguren sind **grau** (`lit:false`).
- **Gestrichelte Bodenlinie** (`mGround`) als Horizont. **Vergleiche** zeigen zwei Figuren nebeneinander mit **gestricheltem senkrechtem Trenner** (`mDivider`) und je einer Zahl darüber („0 €“ | „700 €“).
- **Dünne weiße Linien-Icons** mit Glow (`MI.*`): Haus, Auto, Uhr, Tresor, Schreibtisch, Doktorhut, Laden, Dokument, Tropfen, Sonne, Schirm, Pflanze, Wolke.
- **Dazu:** Karten (`mCard`), Denkwolke (`mCloud`), Häkchen/X (`mCheck`/`mX`), Münze (`mCoin`), Schalter AUS/AN (`mToggle`), Fortschrittsring (`mRing`), Zeitleiste (`mTimeline`), Lupe (`mMagnifier`), Punktraster (`mDots`).
- **Typografie Poppins:**
  - Große fette weiße **Zahlen mit Glow** und winzigem gesperrtem Label darüber (`mNumber`, z. B. „DEIN GELD / 1.000 €“). Im HUD ist der `counter` automatisch so gestaltet, optional mit `sub`.
  - **Weiße Pillen-Badges** mit schwarzer Schrift (`mPill`, z. B. „DAS PROBLEM“, „TAG 1“). Der `chip` des Segments wird automatisch zur Pille oben.
- **Keine Wort-für-Wort-Untertitel** (`"captions": false`). Stattdessen pro Segment höchstens ein **Schlüsselsatz** `kicker: {small, big, at?, y?}`, z. B. small „WER MIT 1.000 € NICHT UMGEHEN KANN“ und big „verliert auch 1 Million.“. Am stärksten ist er beim Hook und beim Schluss-Satz.
- **Ruhige Bewegung:** Elemente blenden weich ein und skalieren, Zahlen zählen hoch, leichtes Zoomen. Keine Wackel-Effekte, Blitze höchstens dezent weiß.
- **Endkarte:**
  - Icon-Kachel (`end_card.icon`, z. B. „?“)
  - Serienname gesperrt (`series`, Standard „WAS WÄRE WENN“)
  - **„Nr. X“** groß (`nr`)
  - eine Zeile Tagline (`tagline`), z. B. „Kein Weltuntergang. Ein Test.“

**Erzählung (wie die Referenzen, 165–185 Wörter/min)**
1. **Provokante These als Hook** (1 Satz, steht auch als `kicker` im Bild). Beispiel: „Wenn es tausend Jahre regnen würde, wäre Wasser nicht unser größtes Problem.“
2. **Konkretes Beispiel mit Figuren:** „Stell dir zwei Menschen vor …“, „Denk an …“. Kurze Etappen mit Zeitangabe als Pille („TAG 1“, „NACH EINER WOCHE“).
3. **Kontrast und Einsicht:** Was die meisten denken gegen was wirklich passiert. Dazu ein **echter, überprüfbarer Fakt** mit Zahl.
4. **Schluss-Satz als Merksatz** mit Gegensatz-Struktur, z. B. „Geld verändert nicht, wer du bist. Es zeigt nur, wer du schon warst.“
5. **Serien-Abschluss gesprochen:** „Das war ‚Was wäre wenn‘ Nummer X.“ Danach die Endkarte. **Kein** „Fortsetzung folgt“, **keine** Cliffhanger-Effekthascherei.
- **Ton:** ruhig, sachlich, Du-Form, kurze Aussagesätze, keine Übertreibung. Emotionen höchstens 1–2 dezente Tags.

**Ton/Mix:** **Keine Hintergrundmusik** (Vorgabe des Creators vom 26.11.2026, `background_music` ist standardmäßig `false`). Es gibt **nur Soundeffekte**: wenige, weiche (pop, chime, whoosh, coin, impact nur bei der Pointe). Endmix −14 LUFS.

Alter Stil (bunte 2D-Navy-Welt mit farbigen Untertiteln, „FORTSETZUNG FOLGT“) bleibt als `"theme": "navy"` verfügbar. Alle Videos bis Nr. 8 sind in diesem Stil.

## 2. Ton: **Voice-over mit Jana „entrauscht“ + Soundeffekte, keine Musik**

- Voice-over ist wieder Standard. Der Creator hat den Versuch ohne Stimme verworfen: „Das ist Quatsch“.
- Stimme: Orpheus `jana` (`temp` 0.6) mit der **Entrauschungs-Kette** in `audio.py`. Der Creator hat sie im Deutlichkeits-Casting gewählt, Probe 1 in `videos/_casting3/`. Die Kette senkt das Codec-Zischeln über 8 kHz von ~8,5 % auf ~2 %, dazu mehr Präsenz bei 2,8 kHz und weniger Dröhnen bei 280 Hz.
- Keine Hintergrundmusik, nur Soundeffekte. Endmix −14 LUFS.
- Zu jedem Video gehört das **Voice-over-Skript als Text** (`voiceover.txt` und als Codeblock in der Antwort).

### 2a. Ohne Voice-over (nur auf ausdrücklichen Wunsch: `"voiceover": false`)

- Vorgabe des Creators: Er will **kein Voice-over** und **keine Hintergrundmusik**, nur Soundeffekte (`"voiceover": false`, `"background_music": false` sind Standard).
- `build.sh` erzeugt dann keine Stimme. `engine/timeline_text.py` schätzt die Zeitleiste aus dem Skripttext (`wpm`, Standard 165). `"hold": 1.0` lässt eine Szene länger stehen. Der Mix enthält nur Soundeffekte mit Spitze −3 dBFS, ohne Lautheits-Normalisierung, damit Stille still bleibt.
- Der Text in `script.json` bestimmt weiter das Tempo und landet in `transkript.txt`. Der Creator kann ihn selbst einsprechen.
- **Bei jeder Lieferung mitschicken:** das Video **und das Voice-over-Skript als Text** (`voiceover.txt` im Abschnitts-Format aus 2c). Das Skript gehört als Datei dazu und zusätzlich als Codeblock in die Antwort. Wunsch des Creators vom 26.11.2026.
- Weil keine Stimme die Geschichte trägt, müssen **Bild und Schlüsselsätze** (`kicker`, Zahlen, Pillen) die Aussage allein verständlich machen.

### 2c. Skript-Format (Pflicht bei Millionärs-/Denkfehler-Videos und allen Skripten im Mono-Stil)

Vorgabe des Creators vom 26.11.2026: „So soll es auch immer aussehen bei dieser Art von Videos.“ Das Skript (`voiceover.txt` und der Codeblock in der Antwort) hat genau vier Abschnitte. Die Sekunden sind die **echten Zeiten im fertigen Video**:

```
[HOOK – 0–5 Sek.]
Ein Satz, der sofort packt.

[HAUPTTEIL – 5–45 Sek.]
Problem → konkrete Zahlen/Beispiele → Gegenbild („Reiche Menschen …“).

[WENDEPUNKT – 45–55 Sek.]
Die eine Erkenntnis, oft „Nicht X. Sondern Y.“

[ABSCHLUSS – 55–60 Sek.]
Die Frage, die hängen bleibt.
```

- Jedes Segment in `script.json` trägt `"section": "HOOK" | "HAUPTTEIL" | "WENDEPUNKT" | "ABSCHLUSS"`. `transcript.py` fasst die Segmente zu diesen Abschnitten zusammen und schreibt die Zeiten aus der Zeitleiste dazu.
- Liefert der Creator ein Roh-Skript, darf und soll es geschärft werden („pass es an, wenn du es nicht stark genug findest“): kürzere Sätze, eine konkrete Rechnung statt „viele Menschen“, ein Kontrastsatz pro Abschnitt. Sagen, was geändert wurde.
- Zahlen in Rechenbeispielen nachrechnen und mit „keine Garantie“ o. ä. kennzeichnen, wenn es um Rendite geht.

## 2b. Stimme (nur wenn `"voiceover": true`)

**Standard seit 26.11.2026: Frauenstimme `"tts": "orpheus"`, `"voice": "jana"`, `"temp": 0.6`.** Der Creator wollte Frauenstimmen und hat Jana im Frauen-Casting (`videos/_casting3/`) gewählt. Davor war Thomas die Stimme, Casting vom 25.11.2026, Videos Nr. 5–8.
- Modell: deutsches Orpheus 3B (Canopy Labs, Apache-2.0), lokal über llama.cpp mit SNAC-Decoder (MIT). Dateien: `engine/orpheus_de.py`, `engine/tts_orpheus.py`.
- Jedes Segment wird am Stück gesprochen. **Keine** Tonhöhen- oder Tempo-Tricks.
- `"say"` = gesprochener Text: Zahlen als Wörter, optionale Tags `<sigh>` `<chuckle>` `<gasp>`. `"text"` = sauberer Text für Prüfung und Zeitstempel.
- **Prüfung:** Whisper hört jedes Segment nach. Sauber ist es nur, wenn jedes Wort stimmt. Füllaute, Ziffern und Getrenntschreibung zählen nicht als Fehler. Wiederholungen und gedehnte Wörter werden erkannt. Bis zu 4 Versuche, der beste gewinnt. Schwierige Wörter umformulieren statt hoffen.
- **Casting 2 (26.11.2026), gemessen gegen die Mono-Referenzen:** Die Hauptreferenz geld.gesetze liegt bei ~99 Hz, 3,7 Halbtönen Melodie und 183 W/min. Keine freie Stimme trifft das genau. Am nächsten ist Chatterbox mit unveränderter Thorsten-Referenz (125 Hz / 3,9 HT / 178 W/min, Einstellungen: `voice_style: emotional`, `ex: 0.45`, `cfg: 0.5`, `tempo: 1.0`, `voice_pitch: 0`). Danach folgt Orpheus Thomas ruhig (`temp` 0.45). Proben liegen in `videos/_casting2/`. Danach wollte der Creator **Frauenstimmen** und hat Jana gewählt (siehe oben).
- **Lehre:** Claude kann Audio nicht hören. Stimmen nie nach Messwerten „optimieren“. Bei Stimmfragen ein nummeriertes Hör-Casting schicken. Die menschlichste Option ist die eigene Aufnahme des Creators.
- Ältere Engines (nur Notlösung): `"tts": "chatterbox"` (`engine/tts_chatterbox.py`), edge-tts (`engine/tts.py`).

## 3. Workflow für ein neues Video

1. Ordner `videos/<slug>/`. Die Nummer (`nr`) ist die nächste freie Seriennummer (bisher: 1 Geld, 2 Verschwunden, 3 Roboter-Jobs, 4 Roboter-Kontrolle, 5 Todeszeitpunkt, 6 Bewusstsein, 7 Russland-Gas, 8 Erde stoppt, 9 Regen). Eigene Reihe **„Millionärs Edition“** (`"series": "Millionärs Edition"`): 1 Entscheidung (`millionaer-entscheidung`), 2 Denkfehler (`denkfehler-arm`), 3 Umfeld (`umfeld-millionaere`), 4 Ärmster im Raum (`aermster-im-raum`).
2. `script.json` (Vorlage: `videos/regen-1000/script.json`):
   - Kopf: `"theme": "mono"`, `"captions": false`, `"series"`, `"nr"`, `"tagline"`, `"tts": "orpheus"`, `"voice": "thomas"`, `end_card: {icon, dur}`
   - 9–12 Segmente, ~150–170 Wörter, Gesamtlänge ≤ 70 s inklusive Endkarte
   - Pro Segment: `section` (siehe 2c), `scene`, `text`, `say`, optional `chip` (Pille), `counter` (`label`, `from`, `to`, `fmt`: int/pct/eur/eur0 (ganze Euro mit €)/m1, `at`: span|w:wort, `sub`), `kicker`, `sfx`, `music: [pad, bass, arp, kick]`
3. `scenes.js`: eine Funktion pro Szene `(t, d, S, h) => SVG`.
   - Bildbereich y ≈ 420–1250, Kicker oben bei y ≈ 300, unten ~450 px frei für die TikTok-Oberfläche.
   - Pro Szene eine klare Hauptsache in der Mitte, viel Schwarz drumherum.
   - Jede Szene muss ab t = 0,1 s sichtbaren Inhalt haben.
   - Helfer: `h.wt('wort')` (Zeitpunkt eines Wortes), `h.p(t,a,b)` (Fortschritt), `E.out`/`E.outBack`/`E.inOut` (Easing), `G()` (Gruppe), `MT()`/`MCAPS()` (Text).
4. Bauen: `bash .claude/skills/tiktok-was-waere-wenn/engine/build.sh videos/<slug>`. Das umfasst Stimme, Mix, Rendern, Muxen und Transkript.
5. Kontrolle:
   - Kontrollbilder je Segment mit `render.cjs --stills` ansehen: leere Frames, Überlappungen Kicker/Pille/Zahl, Lesbarkeit.
   - Gesamt-Transkript per Whisper gegen das Skript prüfen.
   - Lautheit −14 LUFS.

## 4. Technik

- Venv `/home/user/tts-venv` (llama-cpp-python, snac, faster-whisper), Modelle unter `/home/user/models/` (Orpheus-GGUF, SNAC, whisper-small). Netzwerk: `huggingface.co`, `us.aws.cdn.hf.co` (Umgebung „auto“).
- Node `playwright` (Chromium) für die Frames, `ffmpeg` für Ton und Export. Schriften liegen unter `engine/fonts`: Poppins, Inter, JetBrains Mono (alle OFL).
- `build/` ist temporär (gitignored). Ins Repo gehören Skript, Szenen, MP4 und Transkript.
- Fakten müssen stimmen und belegbar sein. Bei politischen Themen beide Seiten zeigen und den Zuschauer entscheiden lassen.
