// -------------------------------------------------------------
// Bilder in den Supabase-Speicher "app-media" hochladen
// -------------------------------------------------------------
// Bilder liegen dort als echte Dateien mit eigener Adresse.
// Im lokalen Testmodus (ohne Supabase) bleibt das Bild einfach
// als Daten-Text erhalten – so funktioniert alles auch offline.

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { slugifyName } from './apps';

const BUCKET = 'app-media';

function dataUrlToBlob(dataUrl) {
    const [meta, b64] = dataUrl.split(',');
    const mime = (meta.match(/data:([^;]+)/) || [])[1] || 'image/jpeg';
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new Blob([bytes], { type: mime });
}

const EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

/** true, wenn das Bild noch als Daten-Text vorliegt (noch nicht hochgeladen). */
export const isDataUrl = (src) => typeof src === 'string' && src.startsWith('data:');

/**
 * Laedt ein Bild (Daten-Text) hoch und liefert die oeffentliche Adresse.
 * folder z. B. "apps/meinplan/screenshots", name dient dem sprechenden Dateinamen.
 */
export async function uploadDataUrl(dataUrl, folder, name = 'bild') {
    if (!isDataUrl(dataUrl) || !isSupabaseConfigured() || !supabase.storage) return dataUrl;

    const blob = dataUrlToBlob(dataUrl);
    const ext = EXT[blob.type] || 'jpg';
    const base = slugifyName(name) || 'bild';
    const path = `${folder}/${base}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}.${ext}`;

    const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
        contentType: blob.type,
        cacheControl: '31536000',
        upsert: false,
    });
    if (error) throw error;

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return data.publicUrl;
}

/**
 * Geht eine Bilderliste durch und laedt alle noch nicht hochgeladenen Bilder hoch.
 * Bereits hochgeladene (normale Adressen) bleiben unveraendert.
 */
export async function uploadPendingImages(items, folder, nameOf = (it) => it.alt || it.title || it.name) {
    const out = [];
    for (const it of items || []) {
        if (isDataUrl(it.src)) {
            out.push({ ...it, src: await uploadDataUrl(it.src, folder, nameOf(it)) });
        } else {
            out.push(it);
        }
    }
    return out;
}
