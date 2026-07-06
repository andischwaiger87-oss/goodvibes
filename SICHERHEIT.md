# 🛡️ Sicherheit & Moderation – GoodVibes Community

Dieser Bereich erklärt in einfachen Worten, wie der neue Community-Bereich
Menschen schützt – und was du vor dem echten öffentlichen Start noch tun musst.

## Kurzfassung

Der Community-Bereich ist bewusst **anonym** (kein Konto, kein Name nötig).
Damit trotzdem niemand belästigt oder gefährdet wird, arbeiten mehrere
Schutzschichten zusammen. Eine einzelne Hürde reicht nie – wichtig ist das
Zusammenspiel.

## Die Schutzschichten im Überblick

1. **Freundlicher Filter direkt im Browser** (`src/utils/moderation.js`)
   - Entfernt automatisch alle **externen Links** und E-Mail-Adressen. In der
     ganzen Community gibt es **keine anklickbaren Nutzer-Links** – so kann
     niemand auf gefährliche Seiten locken (Phishing).
   - Erkennt **eingeschleusten Code / Skripte** und lässt ihn im normalen Text
     gar nicht erst zu. Für echten Code gibt es ein eigenes Feld, das nur
     **reinen Text** speichert und **niemals ausführt**.
   - Filtert **Beleidigungen und Hassrede** (Wortliste, leicht erweiterbar).
   - Erkennt **Spam** (Dauergroßschreibung, Wortwiederholungen).
   - **Tempo-Bremse:** höchstens 3 Beiträge pro Minute, mind. 8 Sekunden Pause.

2. **Bilder werden sicher aufbereitet**
   - Nur `PNG`, `JPG`, `WEBP` erlaubt – **kein SVG** (kann Schadcode enthalten),
     kein Zip, kein PDF.
   - Jedes Bild wird im Browser **neu gezeichnet und gespeichert**. Dabei
     verschwinden versteckte Daten (Standort/EXIF) und evtl. angehängte
     Schad-Inhalte. Die Größe wird begrenzt.

3. **Hybrid-Moderation (dein Wunsch)**
   - **Saubere Beiträge** erscheinen **sofort** – lebendiger Forum-Charakter.
   - **Auffällige Beiträge** (Link entfernt, Code, Bild, Schimpfwort, Spam)
     landen in der **Prüfung** und erscheinen erst nach deiner Freigabe.
   - Du steuerst alles im **Admin-Dashboard → Community**: freigeben, verbergen,
     anpinnen, offiziell antworten, löschen, **Gerät sperren**.

4. **Blockliste gegen Störer**
   - Über „Gerät sperren" (am Beitrag) oder im Tab **Blockliste** kannst du
     einzelne Geräte sperren. Gesperrte Geräte können **nichts mehr schreiben**.
     Sperren lassen sich jederzeit wieder aufheben.

5. **Mitbestimmung statt Feature-Chaos**
   - Wünsche werden per **„Finde ich auch"-Stimmen** priorisiert. Oben in jeder
     App steht der Block **„Meist-gewünschte Verbesserungen"**. So setzt ihr nur
     um, was die Mehrheit wirklich wichtig findet.

## ⚠️ Wichtig vor dem echten öffentlichen Start

Der Browser-Filter ist eine **erste, freundliche Hürde**. Er hält Laien und
Versehen zuverlässig ab. Ein technisch versierter Angreifer kann den Browser
aber umgehen. Deshalb muss die **gleiche Prüfung serverseitig** noch einmal
passieren. Genau das erledigt die Datei:

```
supabase/migrations/002_community.sql
```

Diese Migration richtet in einem echten Supabase-Projekt ein:

- **Datenbank-Trigger**, die Links serverseitig entfernen, Injection erkennen
  und gesperrte Geräte hart ablehnen – **egal, was der Client sendet**.
- **Row Level Security (RLS):** Öffentlich sind **nur freigegebene** Beiträge.
  Das Verwalten (freigeben/verbergen/löschen/sperren) darf **nur der
  eingeloggte Admin**.
- Eine sichere **Stimmen-Zählung** in der Datenbank.

### So aktivierst du den echten Betrieb
1. Supabase-Projekt öffnen → **SQL Editor** → Inhalt von `002_community.sql`
   einfügen → **Run**.
2. In Cloudflare (bzw. deiner `.env`) setzen:
   `VITE_SUPABASE_URL` und `VITE_SUPABASE_ANON_KEY`.
3. Neu deployen. Der Client nutzt dann automatisch die echte Datenbank statt
   des lokalen Test-Speichers.

> Ohne diese ENV-Variablen läuft die App im **Test-Modus** (localStorage-Mock).
> Perfekt zum Ausprobieren – aber **nicht** für den echten Publikumsbetrieb.

## Barrierefreiheit

Der Bereich ist auf **Verständlichkeit** ausgelegt: einfache Sprache, klare
Beschriftungen, große Klickflächen, gute Kontraste, Bedienung per Tastatur,
Beschreibungstexte (`aria-label`) für Screenreader und ein erklärter
**BETA-Hinweis** in Alltagssprache. Fachbegriffe werden vermieden oder erklärt.

## Wortlisten anpassen

Die Filter-Listen (Schimpfwörter, Link-Muster, Injection-Muster) stehen gut
sichtbar oben in `src/utils/moderation.js` und können jederzeit erweitert
werden. Passe sie an, wenn dir etwas fehlt.
