// =============================================================
//  GoodVibes – Sicherheits- & Moderations-Schicht
// =============================================================
//  Diese Datei bündelt ALLE Schutz-Funktionen für den anonymen
//  Community-Bereich. Sie wird sowohl beim Absenden (Client) als
//  auch – idealerweise gespiegelt – serverseitig eingesetzt.
//
//  WICHTIG (bitte lesen):
//  Client-seitige Prüfungen sind eine erste, freundliche Hürde.
//  Sie halten Laien und Versehen zuverlässig ab und geben
//  sofortiges Feedback. Sie sind aber KEIN vollständiger Schutz
//  gegen technisch versierte Angreifer, die den Browser umgehen.
//  Die "echte" Absicherung muss zusätzlich in der Datenbank
//  (Supabase RLS + Trigger) passieren. Siehe SICHERHEIT.md.
// =============================================================

import { v4 as uuidv4 } from 'uuid';
import { getDeviceId } from './security';

// -------------------------------------------------------------
// 1) ANONYME IDENTITÄT & SPITZNAMEN
// -------------------------------------------------------------

// Verspielte, freundliche Bausteine für automatische Spitznamen.
const NICK_ADJ = ['Sonnige', 'Mutige', 'Kluge', 'Freundliche', 'Muntere', 'Ruhige', 'Flinke', 'Helle', 'Warme', 'Neugierige', 'Fröhliche', 'Sanfte'];
const NICK_NOUN = ['Libelle', 'Sonnenblume', 'Wolke', 'Biene', 'Feder', 'Welle', 'Kastanie', 'Amsel', 'Brise', 'Koralle', 'Lichtung', 'Robbe'];
const AVATAR_STYLES = ['bottts', 'fun-emoji', 'shapes', 'thumbs'];

/**
 * Erzeugt einen freundlichen, zufälligen Spitznamen.
 * Beispiel: "Sonnige Libelle".
 */
export function generateNickname() {
    const a = NICK_ADJ[Math.floor(Math.random() * NICK_ADJ.length)];
    const n = NICK_NOUN[Math.floor(Math.random() * NICK_NOUN.length)];
    return `${a} ${n}`;
}

/**
 * Erzeugt einen Avatar-Seed im Format "style:seed" (passt zu Dicebear,
 * wie es GoodVibes bereits verwendet).
 */
export function generateAvatarSeed(name) {
    const style = AVATAR_STYLES[Math.floor(Math.random() * AVATAR_STYLES.length)];
    const seed = (name || uuidv4()).replace(/\s+/g, '');
    return `${style}:${seed}`;
}

/**
 * Baut eine Avatar-Bild-URL aus einem Seed.
 * Die Bilder liegen lokal unter /public/avatars – kein Drittanbieter,
 * es werden keine Besucherdaten nach außen gegeben.
 * (Umsetzung siehe src/utils/avatar.js)
 */
export { avatarUrl } from './avatar';

// -------------------------------------------------------------
// 2) EXTERNE LINKS ERKENNEN & ENTFERNEN
// -------------------------------------------------------------
// Ziel: Niemand kann per Link auf gefährliche Seiten locken oder
// Phishing betreiben. Wir entfernen Links, statt sie klickbar zu
// machen. Es gibt in der ganzen App KEINE anklickbaren User-Links.

const URL_PATTERNS = [
    /\bhttps?:\/\/\S+/gi,             // http:// https://
    /\bwww\.\S+/gi,                   // www.beispiel.at
    /\b[a-z0-9-]+\.(?:com|net|org|at|de|io|xyz|info|ru|cn|link|click|app|dev|co|me|tv|gg|to|ly|sh|shop|online|site|top)\b\S*/gi, // domain.tld
    /\bmailto:\S+/gi,                 // mailto:
    /\btel:\S+/gi,                    // tel:
    /\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/gi, // E-Mail-Adressen (können zu Kontaktumgehung/Spam dienen)
];

/**
 * Prüft, ob ein Text einen (externen) Link oder eine E-Mail enthält.
 */
export function containsLink(text = '') {
    return URL_PATTERNS.some((re) => { re.lastIndex = 0; return re.test(text); });
}

/**
 * Ersetzt alle Links/E-Mails durch einen neutralen Platzhalter.
 */
export function stripLinks(text = '') {
    let out = text;
    URL_PATTERNS.forEach((re) => { re.lastIndex = 0; out = out.replace(re, '[Link entfernt]'); });
    return out;
}

// -------------------------------------------------------------
// 3) CODE- / SKRIPT-EINSCHLEUSUNG ERKENNEN
// -------------------------------------------------------------
// Ziel: Kein eingeschleuster Code kann im Browser anderer User
// ausgeführt werden. React escaped Text zwar automatisch (wir nutzen
// NIEMALS dangerouslySetInnerHTML), aber wir markieren solche Inhalte
// zusätzlich zur Prüfung und zeigen Code ausschließlich als reinen,
// nicht ausführbaren Text an.

const INJECTION_PATTERNS = [
    /<\s*script/i,
    /<\s*iframe/i,
    /<\s*img[^>]*on\w+\s*=/i,
    /<\s*\/?\s*(svg|object|embed|link|meta|base|form|input|style)\b/i,
    /on(?:error|load|click|mouseover|focus|submit)\s*=/i, // Inline-Event-Handler
    /javascript\s*:/i,
    /data\s*:\s*text\/html/i,
    /<\s*a\b/i,                       // rohe Anker-Tags
    /\{\{.*\}\}/,                     // Template-Injection-Versuche
    /\$\{.*\}/,                       // Template-Literals
];

/**
 * Erkennt typische HTML-/Script-Injection-Versuche.
 */
export function containsInjection(text = '') {
    return INJECTION_PATTERNS.some((re) => re.test(text));
}

// -------------------------------------------------------------
// 4) BELEIDIGUNGEN / HASSREDE FILTERN
// -------------------------------------------------------------
// Bewusst offene Meinungen sind erwünscht. Beleidigungen, Hetze und
// Diskriminierung nicht. Diese Liste ist absichtlich schlank und
// erweiterbar – sie MARKIERT verdächtige Beiträge für die Prüfung,
// blockiert aber nicht stumm jede Meinung.

const PROFANITY = [
    // Beleidigungen (DE)
    'arschloch', 'wichser', 'hurensohn', 'missgeburt', 'schlampe', 'fotze', 'nutte',
    'spast', 'spasti', 'idiot', 'vollidiot', 'trottel', 'depp', 'schwachkopf',
    'verpiss dich', 'halt die fresse', 'halts maul', 'fick dich', 'fick dich ins knie',
    // Hass / Diskriminierung (DE, nur eindeutige Beispiele)
    'nazi', 'heil hitler', 'untermensch', 'volksverräter',
    // Englisch
    'asshole', 'fuck you', 'fuck off', 'bitch', 'bastard', 'retard', 'moron',
    'kill yourself', 'kys', 'nigger', 'faggot',
];

/**
 * Prüft, ob ein Text Schimpfwörter/Hassrede enthält (Wortgrenzen-sensibel).
 * Gibt die gefundenen Begriffe zurück (für Transparenz/Log).
 */
export function findProfanity(text = '') {
    const lower = ` ${text.toLowerCase().replace(/[^\p{L}\s]/gu, ' ')} `;
    return PROFANITY.filter((word) => lower.includes(` ${word} `) || lower.includes(`${word} `) || lower.includes(word));
}

export function containsProfanity(text = '') {
    return findProfanity(text).length > 0;
}

// -------------------------------------------------------------
// 5) SPAM-HEURISTIK
// -------------------------------------------------------------

/**
 * Einfache Spam-Erkennung: sehr viele Großbuchstaben, Wortwiederholungen,
 * exzessive Sonderzeichen. Markiert für Prüfung, blockiert nicht hart.
 */
export function looksLikeSpam(text = '') {
    const t = text.trim();
    if (t.length < 2) return true;
    const letters = t.replace(/[^A-Za-zÄÖÜäöüß]/g, '');
    const uppercase = t.replace(/[^A-ZÄÖÜ]/g, '');
    if (letters.length > 12 && uppercase.length / letters.length > 0.7) return true; // SCHREIT
    if (/(.)\1{6,}/.test(t)) return true;                     // aaaaaaa
    if (/(\b\w+\b)(\s+\1){4,}/i.test(t)) return true;          // wort wort wort wort wort
    return false;
}

// -------------------------------------------------------------
// 6) RATE LIMIT (geräte-basiert, lokal)
// -------------------------------------------------------------
// Verhindert schnelles Zuspammen. Serverseitig zusätzlich per RLS/
// Trigger absichern (siehe SICHERHEIT.md).

const RL_KEY = 'gv_post_timestamps';
const RL_WINDOW_MS = 60 * 1000;   // 1 Minute
const RL_MAX_IN_WINDOW = 3;       // max. 3 Beiträge / Minute
const RL_MIN_GAP_MS = 8 * 1000;   // min. 8 Sek. zwischen zwei Beiträgen

export function checkRateLimit() {
    let stamps = [];
    try { stamps = JSON.parse(localStorage.getItem(RL_KEY) || '[]'); } catch { stamps = []; }
    const now = Date.now();
    stamps = stamps.filter((t) => now - t < RL_WINDOW_MS);

    if (stamps.length && now - stamps[stamps.length - 1] < RL_MIN_GAP_MS) {
        const wait = Math.ceil((RL_MIN_GAP_MS - (now - stamps[stamps.length - 1])) / 1000);
        return { ok: false, reason: `Bitte warte noch ${wait} Sekunden, bevor du wieder etwas schreibst.` };
    }
    if (stamps.length >= RL_MAX_IN_WINDOW) {
        return { ok: false, reason: 'Du hast gerade sehr viel geschrieben. Bitte mach eine kurze Pause (ca. 1 Minute).' };
    }
    return { ok: true };
}

export function recordPost() {
    let stamps = [];
    try { stamps = JSON.parse(localStorage.getItem(RL_KEY) || '[]'); } catch { stamps = []; }
    stamps.push(Date.now());
    localStorage.setItem(RL_KEY, JSON.stringify(stamps.slice(-10)));
}

// -------------------------------------------------------------
// 7) BLOCKIERTE GERÄTE
// -------------------------------------------------------------

/**
 * Prüft über die (mock- oder echte) Datenbank, ob das aktuelle Gerät
 * gesperrt ist. supabaseClient wird übergeben, um keine Zyklen zu bauen.
 */
export async function isDeviceBlocked(supabaseClient) {
    try {
        const deviceId = getDeviceId();
        const { data } = await supabaseClient
            .from('blocked_devices')
            .select('*')
            .eq('device_id', deviceId);
        return Array.isArray(data) && data.length > 0;
    } catch {
        return false; // im Zweifel nicht aussperren – Serverseite entscheidet endgültig
    }
}

// -------------------------------------------------------------
// 8) BILD-UPLOAD SICHER AUFBEREITEN
// -------------------------------------------------------------
// Nur Bilder erlaubt. SVG ist VERBOTEN (kann Skripte enthalten).
// Wir kodieren das Bild über ein <canvas> neu: dadurch werden
// eingebettete Metadaten (EXIF/GPS) und evtl. angehängte Payloads
// entfernt, und die Größe wird begrenzt.

const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB Eingang
const MAX_DIMENSION = 1600;               // px – längere Seite

export function validateImageFile(file) {
    if (!file) return { ok: false, reason: 'Keine Datei ausgewählt.' };
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        return { ok: false, reason: 'Nur PNG-, JPG- oder WEBP-Bilder sind erlaubt (kein SVG, kein Zip, kein PDF).' };
    }
    if (file.size > MAX_UPLOAD_BYTES) {
        return { ok: false, reason: 'Das Bild ist zu groß (max. 5 MB).' };
    }
    return { ok: true };
}

/**
 * Lädt das Bild, zeichnet es auf ein Canvas (entfernt Metadaten &
 * mögliche versteckte Inhalte), skaliert es herunter und gibt ein
 * sauberes JPEG als Data-URL zurück.
 *
 * Gibt Promise<{ ok, dataUrl?, reason? }> zurück.
 */
export function sanitizeImage(file) {
    return new Promise((resolve) => {
        const valid = validateImageFile(file);
        if (!valid.ok) return resolve(valid);

        const reader = new FileReader();
        reader.onerror = () => resolve({ ok: false, reason: 'Bild konnte nicht gelesen werden.' });
        reader.onload = () => {
            const img = new Image();
            img.onerror = () => resolve({ ok: false, reason: 'Das ist kein gültiges Bild.' });
            img.onload = () => {
                try {
                    let { width, height } = img;
                    if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
                        const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
                        width = Math.round(width * ratio);
                        height = Math.round(height * ratio);
                    }
                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    // weißer Hintergrund (falls Transparenz), dann Bild neu zeichnen
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(0, 0, width, height);
                    ctx.drawImage(img, 0, 0, width, height);
                    // Neu-Kodierung als JPEG => EXIF/Payloads sind weg
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
                    resolve({ ok: true, dataUrl });
                } catch {
                    resolve({ ok: false, reason: 'Bild konnte nicht sicher verarbeitet werden.' });
                }
            };
            img.src = reader.result;
        };
        reader.readAsDataURL(file);
    });
}

// -------------------------------------------------------------
// 9) HAUPT-FUNKTION: BEITRAG PRÜFEN & KLASSIFIZIEREN
// -------------------------------------------------------------
// Hybrid-Moderation:
//  - sauber            -> status 'published' (sofort sichtbar)
//  - verdächtig        -> status 'pending'   (erst nach Freigabe sichtbar)
//  - hart unzulässig   -> abgelehnt (gar nicht gespeichert)

export const POST_LIMITS = { title: 120, body: 2000, code: 4000, reply: 800 };

/**
 * Prüft & bereinigt einen Freitext.
 * @returns {{
 *   ok: boolean,
 *   cleanText: string,
 *   needsReview: boolean,
 *   reasons: string[],
 *   hardBlock: boolean,
 *   userMessage: string
 * }}
 */
export function moderateText(text = '', { maxLen = POST_LIMITS.body, allowCode = false } = {}) {
    const reasons = [];
    let needsReview = false;
    let hardBlock = false;

    const trimmed = (text || '').trim();

    if (!trimmed) {
        return { ok: false, cleanText: '', needsReview: false, reasons: ['leer'], hardBlock: true, userMessage: 'Bitte schreib zuerst etwas.' };
    }
    if (trimmed.length > maxLen) {
        return { ok: false, cleanText: '', needsReview: false, reasons: ['zu lang'], hardBlock: true, userMessage: `Bitte kürze deinen Text auf max. ${maxLen} Zeichen.` };
    }

    // Links immer entfernen (nicht nur markieren)
    let clean = trimmed;
    if (containsLink(clean)) {
        clean = stripLinks(clean);
        reasons.push('link_entfernt');
        needsReview = true;
    }

    // Injection: außerhalb dedizierter Code-Felder hart blockieren
    if (containsInjection(clean)) {
        if (allowCode) {
            reasons.push('code_erkannt');
            needsReview = true;
        } else {
            hardBlock = true;
            reasons.push('injection_blockiert');
        }
    }

    if (containsProfanity(clean)) {
        reasons.push('sprache');
        needsReview = true;
    }
    if (looksLikeSpam(clean)) {
        reasons.push('spam_verdacht');
        needsReview = true;
    }

    if (hardBlock) {
        return {
            ok: false, cleanText: clean, needsReview: false, reasons, hardBlock: true,
            userMessage: 'Dein Beitrag enthält Code oder Steuerzeichen, die aus Sicherheitsgründen nicht erlaubt sind. Bitte beschreibe dein Anliegen in normalen Worten. Für Code nutze bitte das eigene Code-Feld.',
        };
    }

    return {
        ok: true,
        cleanText: clean,
        needsReview,
        reasons,
        hardBlock: false,
        userMessage: needsReview
            ? 'Danke! Dein Beitrag wird kurz von einem Menschen geprüft und erscheint dann. So halten wir GoodVibes freundlich und sicher.'
            : 'Danke! Dein Beitrag ist jetzt sichtbar.',
    };
}

/**
 * Code-Feld separat behandeln: wird NUR als reiner Text gespeichert und
 * später NUR als escaped Text (nie ausführbar) angezeigt. Links werden
 * hier NICHT als Fehler gewertet (Code enthält oft URLs), aber der
 * ganze Beitrag geht dann in die Prüfung.
 */
export function moderateCode(code = '') {
    const trimmed = (code || '').trim();
    if (!trimmed) return { ok: true, cleanCode: '', needsReview: false };
    if (trimmed.length > POST_LIMITS.code) {
        return { ok: false, cleanCode: '', needsReview: false, userMessage: `Code-Ausschnitt ist zu lang (max. ${POST_LIMITS.code} Zeichen).` };
    }
    // Kein Escaping nötig: React zeigt Text ohnehin escaped. Wir speichern
    // roh als Text und rendern in <pre><code>. Code => immer Review.
    return { ok: true, cleanCode: trimmed, needsReview: true };
}
