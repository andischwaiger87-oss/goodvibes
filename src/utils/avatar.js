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

// Ältere Stile – bleiben für die automatische Auswahl unverändert,
// damit bestehende Avatare gleich aussehen wie bisher.
const LEGACY_STYLES = ['bottts', 'shapes', 'fun-emoji', 'thumbs'];

// Alle wählbaren Stile. "tiere" sind eigene, lokal gezeichnete Tier-Avatare.
export const AVATAR_STYLES = ['tiere', ...LEGACY_STYLES];

// Wie viele Varianten pro Stil in /public/avatars liegen.
export const VARIANTS = { tiere: 75, bottts: 30, shapes: 30, 'fun-emoji': 30, thumbs: 30 };

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
        style = LEGACY_STYLES[hashString(seed) % LEGACY_STYLES.length];
    }

    // Direkte Auswahl: "tiere:#12" zeigt genau Variante 12
    if (seed.startsWith('#')) {
        const n = parseInt(seed.slice(1), 10);
        if (Number.isFinite(n)) return `/avatars/${style}-${Math.abs(n) % VARIANTS[style]}.svg`;
    }
    const index = hashString(`${style}|${seed}`) % VARIANTS[style];
    return `/avatars/${style}-${index}.svg`;
}

/**
 * Fester Community-Avatar für Kopfbereiche (App-Karte, App-Detail, Hinweise).
 * Bewusst eine eigene Datei: Das ist genau der Avatar, den GoodVibes
 * vorher über den Fremdanbieter geladen hat (Seed „avatar-5") – jetzt lokal.
 */
export const COMMUNITY_AVATAR = '/avatars/community.svg';

/**
 * Avatar für einen Projekt-Eintrag (Abstimmung, Showcase, Detailseite).
 *
 * Projekte, aus denen bereits eine fertige App entstanden ist, zeigen das
 * App-Avatar – so sieht z. B. MeinPlan überall gleich aus und ist sofort
 * wiedererkennbar. Alle übrigen Ideen zeigen das Avatar der Person,
 * die sie eingereicht hat.
 */
export function projectAvatarUrl(project) {
    if (project?.live_url) return COMMUNITY_AVATAR;
    return avatarUrl(project?.avatar_seed, project?.id);
}
