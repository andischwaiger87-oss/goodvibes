// -------------------------------------------------------------
// Sicherer Zugriff auf den Browser-Speicher
// -------------------------------------------------------------
// In manchen Situationen (strenge Privatsphaere-Einstellungen,
// eingebettete Ansichten, voller Speicher) wirft der Browser beim
// Zugriff auf localStorage einen Fehler. Ohne Schutz wuerde dann die
// ganze Seite abstuerzen. Diese Helfer fangen das ab und weichen auf
// einen Zwischenspeicher im Arbeitsspeicher aus.

const memory = new Map();

function store(kind) {
    try {
        const s = kind === 'session' ? window.sessionStorage : window.localStorage;
        const probe = '__gv_probe__';
        s.setItem(probe, '1');
        s.removeItem(probe);
        return s;
    } catch {
        return null;
    }
}

export function getItem(key, kind = 'local') {
    const s = store(kind);
    try {
        return s ? s.getItem(key) : (memory.get(`${kind}:${key}`) ?? null);
    } catch {
        return memory.get(`${kind}:${key}`) ?? null;
    }
}

export function setItem(key, value, kind = 'local') {
    memory.set(`${kind}:${key}`, String(value));
    const s = store(kind);
    try { s?.setItem(key, String(value)); } catch { /* Speicher voll/gesperrt – Arbeitsspeicher reicht */ }
}

export function getJSON(key, fallback, kind = 'local') {
    try {
        const raw = getItem(key, kind);
        return raw ? JSON.parse(raw) : fallback;
    } catch {
        return fallback;
    }
}

export function setJSON(key, value, kind = 'local') {
    setItem(key, JSON.stringify(value), kind);
}
