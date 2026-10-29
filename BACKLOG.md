# GoodVibes – Merkliste für später

Offene Ideen und geplante Verbesserungen. Neueste oben.

## Geplant

### Tier-Avatare zur Auswahl
- **Was:** Neben den bisherigen Stilen (Roboter, Formen, Emoji-Gesichter, Daumen) zusätzlich **Tier-Avatare** anbieten.
- **Wo:** Avatar-Auswahl beim Einreichen einer Idee (Stepper, Schritt 4) **und** beim App-Avatar im Admin (Apps → Bearbeiten).
- **Umsetzung (Notiz):** Tiere als lokale SVG-Dateien unter `public/avatars/` ablegen (kein Drittanbieter, wie die bestehenden Avatare). Neuen Stil in `src/utils/avatar.js` (`AVATAR_STYLES`) ergänzen. Für Apps ein Feld `avatar` in der Tabelle `apps`, damit jede App ihr eigenes Bild bekommt statt des gemeinsamen Roboters (`COMMUNITY_AVATAR`).
- **Achtung:** Bestehende Avatare der Einreichungen dürfen sich dabei nicht ändern (Wiedererkennung).

### Weitere Punkte aus dem Audit
- Feedback-Systeme zusammenführen (Fehlermelder bei Projekten + Community bei Apps)
- Abstimmung mit Enddatum und Countdown
- „Benachrichtige mich" (E-Mail, Double-Opt-in)
- Admin-Benachrichtigung bei neuen Einreichungen / Beiträgen in Prüfung
- Serverseitige Spam-Bremse für Beiträge (Beiträge pro Gerät und Stunde)
- „Aufräumen"-Funktion im Admin: ungenutzte Bilder im Speicher `app-media` finden und löschen (aktuell liegen von den ersten Speicherversuchen Doppel der MeinPlan-Bilder dort)
- Screenshots in Community-Beiträgen ebenfalls in den Bildspeicher verlegen
- Plan für Supabase-Free-Pausierung (Projekt pausiert nach 7 Tagen Inaktivität)
