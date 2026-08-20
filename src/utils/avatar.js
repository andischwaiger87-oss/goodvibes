// -------------------------------------------------------------
// AVATARE – lokal, ohne Drittanbieter
// -------------------------------------------------------------
// Früher wurden die Avatare live von api.dicebear.com geladen.
// Damit floss bei jedem Seitenaufruf die IP-Adresse unserer
// Besucher zu einem fremden Anbieter – das passt nicht zu unserer
// Datenschutz-Zusage.
//
// Jetzt liegen die Bilder als fertige SVG-Dateien unter
// /public/avatars. Aus dem Spitznamen (Seed) wird immer dasselbe
// Bild berechnet – gleicher Name = gleiches Gesicht, wie vorher.

export const AVATAR_STYLES = ['bottts', 'shapes', 'fun-emoji', 'thumbs'];

// Wie viele Varianten pro Stil in /public/avatars liegen.
const VARIANTS_PER_STYLE = 30;

/**
 * Kleiner, stabiler String-Hash (FNV-1a).
 * Gleiche Eingabe ergibt immer dieselbe Zahl – auch nach Neuladen.
 */
function hashString(str) {
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i);
        h = Math.imul(h, 0x01000193);
    }
    return Math.abs(h >>> 0);
}

/**
 * Baut den Pfad zu einem lokalen Avatar-Bild.
 *
 * Akzeptiert beide Schreibweisen:
 *   "bottts:FlinkeAmsel"  → Stil vorgegeben
 *   "FlinkeAmsel"         → Stil wird aus dem Namen abgeleitet
 */
export function avatarUrl(seedString, fallback = 'gast') {
    const raw = String(seedString || fallback);

    let style;
    let seed;

    if (raw.includes(':')) {
        const [maybeStyle, rest] = raw.split(':');
        style = AVATAR_STYLES.includes(maybeStyle) ? maybeStyle : null;
        seed = rest || raw;
    } else {
        seed = raw;
    }

    if (!style) {
        // Kein (gültiger) Stil angegeben: aus dem Seed einen wählen,
        // damit die Avatare trotzdem abwechslungsreich bleiben.
        style = AVATAR_STYLES[hashString(seed) % AVATAR_STYLES.length];
    }

    const index = hashString(`${style}|${seed}`) % VARIANTS_PER_STYLE;
    return `/avatars/${style}-${index}.svg`;
}

/**
 * Fester Community-Avatar für Kopfbereiche (App-Karte, App-Detail, Hinweise).
 * Bewusst eine eigene Datei: Das ist genau der Avatar, den GoodVibes
 * vorher über den Fremdanbieter geladen hat (Seed „avatar-5") – jetzt lokal.
 */
export const COMMUNITY_AVATAR = '/avatars/community.svg';