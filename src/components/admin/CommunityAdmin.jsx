import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import {
    Plus, Trash2, Save, X, FlaskConical, Eye, EyeOff, CheckCircle,
    Ban, ShieldCheck, Pin, PinOff, CornerDownRight, MessageSquare, Loader2, RefreshCw,
    ImagePlus, ImageOff
} from 'lucide-react';
import { getPostType, POST_STATUS, normalizeScreenshots, slugifyName } from '../../utils/apps';
import { categoryLabels } from '../../utils/categories';
import { avatarUrl, moderateText, sanitizeImage } from '../../utils/moderation';
import { cn } from '../../utils/cn';

const ACCENT_KEYS = ['blue', 'green', 'purple', 'amber'];
const ICON_SUGGESTIONS = ['📱', '🗓️', '🚶', '💬', '🧭', '❤️', '🌱', '🎓', '🩺', '🛠️', '🔔', '🗺️', '📝', '🤝', '🏠', '⭐'];

const EMPTY_APP = {
    slug: '', name: '', tagline: '', description: '', category: 'community',
    icon_emoji: '📱', accent: 'blue', version: '0.1.0', is_beta: true,
    status: 'live', live_url: '', scope: '', features: '', whats_new: '',
    screenshots: [], rating_sum: 0, rating_count: 0, sort_order: 99,
};

// =============================================================
// TAB: App-Verwaltung (CRUD + BETA-Schalter + Version)
// =============================================================
export function AppManagementTab() {
    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null);
    const [msg, setMsg] = useState('');

    useEffect(() => { fetchApps(); }, []);

    const fetchApps = async () => {
        setLoading(true);
        const { data } = await supabase.from('apps').select('*').order('sort_order', { ascending: true });
        setApps(data || []);
        setLoading(false);
    };

    const toggleBeta = async (app) => {
        await supabase.from('apps').update({ is_beta: !app.is_beta }).eq('id', app.id);
        fetchApps();
    };

    const save = async (form) => {
        setMsg('');
        if (!form.name.trim()) { setMsg('Bitte gib einen Namen an.'); return; }

        const raw = (form.slug || '').trim();
        // Schutz: Wurde versehentlich eine ganze Web-Adresse ins Kürzel-Feld kopiert?
        if (/^https?:\/\//i.test(raw) || raw.includes('/') || raw.includes('.')) {
            setMsg('Das Kürzel ist keine Web-Adresse. Nutze ein kurzes Wort wie „meinplan" – der Link zur App gehört ins Feld „Link zur App".');
            return;
        }
        // Leeres Kürzel? Dann automatisch aus dem Namen ableiten.
        const slug = slugifyName(raw) || slugifyName(form.name);
        if (!slug) { setMsg('Bitte gib ein Kürzel an (nur Buchstaben, Zahlen und Bindestriche).'); return; }

        const payload = { ...form, slug };

        if (form.id) {
            await supabase.from('apps').update(payload).eq('id', form.id);
        } else {
            await supabase.from('apps').insert({ ...payload, created_at: new Date().toISOString() });
        }
        setEditing(null);
        fetchApps();
    };

    const remove = async (app) => {
        if (!confirm(`App „${app.name}" wirklich löschen? Alle Beiträge dazu bleiben in der Datenbank, werden aber nirgends mehr angezeigt.`)) return;
        await supabase.from('apps').delete().eq('id', app.id);
        fetchApps();
    };

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold text-slate-900">Apps im Store</h2>
                    <p className="text-sm text-slate-500">Lege neue Apps an, pflege Version & Funktionen, schalte die BETA-Phase pro App.</p>
                </div>
                <button onClick={() => setEditing({ ...EMPTY_APP })} className="btn-primary inline-flex items-center gap-2 text-sm">
                    <Plus className="w-4 h-4" /> Neue App
                </button>
            </div>

            {msg && <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">{msg}</div>}

            {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>
            ) : (
                <div className="grid grid-cols-1 gap-3">
                    {apps.map((app) => (
                        <div key={app.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4 shadow-sm">
                            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-2xl shrink-0">{app.icon_emoji}</div>
                            <div className="min-w-0 flex-grow">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-bold text-slate-900">{app.name}</span>
                                    <span className="text-xs text-slate-400">v{app.version}</span>
                                    {app.is_beta && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 uppercase">Beta</span>}
                                </div>
                                <p className="text-xs text-slate-500 truncate">{app.tagline}</p>
                            </div>

                            <button
                                onClick={() => toggleBeta(app)}
                                role="switch"
                                aria-checked={app.is_beta}
                                aria-label="BETA-Phase umschalten"
                                className={cn('relative inline-flex h-7 w-12 items-center rounded-full transition-colors shrink-0', app.is_beta ? 'bg-amber-500' : 'bg-gray-300')}
                            >
                                <span className={cn('inline-block h-5 w-5 transform rounded-full bg-white transition-transform', app.is_beta ? 'translate-x-6' : 'translate-x-1')} />
                            </button>
                            <span className="text-[11px] font-semibold text-slate-500 w-16 shrink-0 hidden sm:block">{app.is_beta ? 'BETA an' : 'Stabil'}</span>

                            <button onClick={() => setEditing(app)} className="text-xs px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 font-semibold border border-blue-100 shrink-0">Bearbeiten</button>
                            <button onClick={() => remove(app)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg shrink-0" aria-label="App löschen"><Trash2 className="w-4 h-4" /></button>
                        </div>
                    ))}
                </div>
            )}

            {editing && <AppEditor initial={editing} onSave={save} onCancel={() => setEditing(null)} />}
        </div>
    );
}

function AppEditor({ initial, onSave, onCancel }) {
    const [form, setForm] = useState({ ...initial, screenshots: normalizeScreenshots(initial.screenshots) });
    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
    const input = 'w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none';

    const [imgBusy, setImgBusy] = useState(false);
    const [imgError, setImgError] = useState('');

    const handleScreenshots = async (e) => {
        setImgError('');
        const files = Array.from(e.target.files || []);
        if (!files.length) return;
        setImgBusy(true);
        const cleaned = [];
        for (const file of files) {
            const res = await sanitizeImage(file);
            if (res.ok) cleaned.push({ src: res.dataUrl, alt: '', name: '' });
            else setImgError(res.reason);
        }
        if (cleaned.length) set('screenshots', [...(form.screenshots || []), ...cleaned]);
        setImgBusy(false);
        e.target.value = '';
    };

    const removeScreenshot = (idx) => set('screenshots', (form.screenshots || []).filter((_, i) => i !== idx));
    const moveScreenshot = (idx, dir) => {
        const arr = [...(form.screenshots || [])];
        const j = idx + dir;
        if (j < 0 || j >= arr.length) return;
        [arr[idx], arr[j]] = [arr[j], arr[idx]];
        set('screenshots', arr);
    };
    const setScreenshotField = (idx, key, value) => {
        set('screenshots', (form.screenshots || []).map((sh, i) => (i === idx ? { ...sh, [key]: value } : sh)));
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center p-4 overflow-y-auto" role="dialog" aria-modal="true" aria-label="App bearbeiten">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl my-8">
                <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
                    <h3 className="font-bold text-slate-900">{form.id ? 'App bearbeiten' : 'Neue App anlegen'}</h3>
                    <button onClick={onCancel} className="p-1.5 hover:bg-gray-100 rounded-lg" aria-label="Schließen"><X className="w-5 h-5" /></button>
                </div>
                <div className="p-5 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-semibold text-slate-600">Name</label>
                            <input
                                className={input}
                                value={form.name}
                                onChange={(e) => {
                                    const name = e.target.value;
                                    // Bei neuen Apps das Kürzel automatisch mitführen
                                    setForm((f) => ({
                                        ...f,
                                        name,
                                        slug: (!f.id && (!f.slug || f.slug === slugifyName(f.name))) ? slugifyName(name) : f.slug,
                                    }));
                                }}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-slate-600">Kürzel (URL)</label>
                            <input
                                className={input}
                                value={form.slug}
                                onChange={(e) => set('slug', e.target.value)}
                                onBlur={(e) => set('slug', slugifyName(e.target.value))}
                                placeholder="z. B. meinplan"
                            />
                            <p className="text-[11px] text-slate-400 mt-1">Kurzes Wort, keine Web-Adresse. Ergibt: /apps/{form.slug || 'meinplan'}</p>
                        </div>
                    </div>
                    <div><label className="text-xs font-semibold text-slate-600">Kurzbeschreibung (ein Satz)</label><input className={input} value={form.tagline} onChange={(e) => set('tagline', e.target.value)} /></div>
                    <div><label className="text-xs font-semibold text-slate-600">Beschreibung</label><textarea rows="3" className={input} value={form.description} onChange={(e) => set('description', e.target.value)} /></div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div><label className="text-xs font-semibold text-slate-600">Symbol</label><input className={input} value={form.icon_emoji} onChange={(e) => set('icon_emoji', e.target.value)} placeholder="📱" /></div>
                        <div><label className="text-xs font-semibold text-slate-600">Version</label><input className={input} value={form.version} onChange={(e) => set('version', e.target.value)} /></div>
                        <div>
                            <label className="text-xs font-semibold text-slate-600">Kategorie</label>
                            <select className={input} value={form.category} onChange={(e) => set('category', e.target.value)}>
                                {Object.entries(categoryLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-slate-600">Farbe</label>
                            <select className={input} value={form.accent} onChange={(e) => set('accent', e.target.value)}>
                                {ACCENT_KEYS.map((a) => <option key={a} value={a}>{a}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Symbol-Schnellwahl */}
                    <div>
                        <label className="text-xs font-semibold text-slate-600">Symbol schnell wählen</label>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                            {ICON_SUGGESTIONS.map((emo) => (
                                <button
                                    type="button"
                                    key={emo}
                                    onClick={() => set('icon_emoji', emo)}
                                    className={cn('w-9 h-9 rounded-lg border text-lg flex items-center justify-center transition-all',
                                        form.icon_emoji === emo ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-100' : 'border-gray-200 hover:bg-gray-50')}
                                    aria-label={`Symbol ${emo} wählen`}
                                >
                                    {emo}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div><label className="text-xs font-semibold text-slate-600">Link zur App (wird als „App öffnen"-Button genutzt)</label><input className={input} value={form.live_url} onChange={(e) => set('live_url', e.target.value)} placeholder="https://…" /></div>
                    <div><label className="text-xs font-semibold text-slate-600">Umfang / Kurz-Infos</label><input className={input} value={form.scope} onChange={(e) => set('scope', e.target.value)} placeholder="Kostenlos • Ohne Anmeldung • …" /></div>
                    <div><label className="text-xs font-semibold text-slate-600">Funktionen (eine pro Zeile)</label><textarea rows="4" className={input} value={form.features} onChange={(e) => set('features', e.target.value)} /></div>
                    <div><label className="text-xs font-semibold text-slate-600">Was ist neu?</label><textarea rows="2" className={input} value={form.whats_new} onChange={(e) => set('whats_new', e.target.value)} /></div>

                    {/* Vorschau-Bilder (Screenshots) */}
                    <div>
                        <label className="text-xs font-semibold text-slate-600">Vorschau-Bilder</label>
                        <p className="text-[11px] text-slate-400 mb-2">PNG/JPG/WEBP. Werden sicher neu gespeichert (versteckte Daten & Metadaten entfernt). Gib pro Bild einen Alt-Text an (für Screenreader & SEO), sortiere per Pfeilen.</p>

                        {(form.screenshots || []).length > 0 && (
                            <div className="space-y-2.5 mb-3">
                                {form.screenshots.map((shot, idx) => (
                                    <div key={idx} className="flex gap-3 items-start bg-gray-50 border border-gray-200 rounded-lg p-2.5">
                                        <img src={shot.src} alt={shot.alt || `Vorschau ${idx + 1}`} className="h-20 w-auto rounded-md border border-gray-200 shrink-0" />
                                        <div className="flex-grow min-w-0 space-y-1.5">
                                            <input
                                                value={shot.alt || ''}
                                                onChange={(e) => setScreenshotField(idx, 'alt', e.target.value)}
                                                placeholder="Alt-Text: Was ist auf dem Bild zu sehen?"
                                                className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none"
                                            />
                                            <div className="flex items-center gap-1">
                                                <button type="button" onClick={() => moveScreenshot(idx, -1)} className="text-xs px-2 py-1 rounded border border-gray-200 text-slate-600 hover:bg-white" aria-label="Nach vorne">◀</button>
                                                <button type="button" onClick={() => moveScreenshot(idx, 1)} className="text-xs px-2 py-1 rounded border border-gray-200 text-slate-600 hover:bg-white" aria-label="Nach hinten">▶</button>
                                                <button type="button" onClick={() => removeScreenshot(idx)} className="text-xs px-2 py-1 rounded border border-red-100 text-red-600 hover:bg-red-50 ml-auto inline-flex items-center gap-1" aria-label="Bild entfernen"><Trash2 className="w-3.5 h-3.5" /> Entfernen</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {imgError && <p className="text-xs text-red-600 mb-2">{imgError}</p>}

                        <label className={cn('inline-flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg border cursor-pointer', imgBusy ? 'opacity-60 pointer-events-none border-gray-200' : 'border-gray-200 text-slate-600 hover:bg-gray-50')}>
                            {imgBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
                            {imgBusy ? 'Wird verarbeitet…' : 'Bilder hinzufügen'}
                            <input type="file" accept="image/png,image/jpeg,image/webp" multiple onChange={handleScreenshots} className="hidden" />
                        </label>
                        {(form.screenshots || []).length === 0 && !imgBusy && (
                            <span className="ml-2 inline-flex items-center gap-1 text-[11px] text-slate-400"><ImageOff className="w-3.5 h-3.5" /> Noch keine Bilder</span>
                        )}
                    </div>

                    <div className="flex items-center gap-6 pt-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
                            <input type="checkbox" checked={form.is_beta} onChange={(e) => set('is_beta', e.target.checked)} className="w-4 h-4" />
                            <FlaskConical className="w-4 h-4 text-amber-500" /> Als BETA kennzeichnen
                        </label>
                        <div className="flex items-center gap-2 text-sm">
                            <label className="text-xs font-semibold text-slate-600">Reihenfolge</label>
                            <input type="number" className="w-16 bg-white border border-gray-200 rounded-lg px-2 py-1 text-sm" value={form.sort_order} onChange={(e) => set('sort_order', Number(e.target.value))} />
                        </div>
                    </div>
                </div>
                <div className="flex justify-end gap-3 p-5 border-t border-gray-100">
                    <button onClick={onCancel} className="btn-secondary text-sm">Abbrechen</button>
                    <button onClick={() => onSave(form)} className="btn-primary text-sm inline-flex items-center gap-2"><Save className="w-4 h-4" /> Speichern</button>
                </div>
            </div>
        </div>
    );
}

// =============================================================
// TAB: Community-Moderation (Freigabe, Verbergen, Antworten, Blocken)
// =============================================================
export function CommunityModerationTab() {
    const [posts, setPosts] = useState([]);
    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending');
    const [replyId, setReplyId] = useState(null);
    const [replyText, setReplyText] = useState('');

    useEffect(() => { fetchAll(); }, []);

    const fetchAll = async () => {
        setLoading(true);
        const { data: postData } = await supabase.from('app_posts').select('*').order('created_at', { ascending: false });
        const { data: appData } = await supabase.from('apps').select('*');
        setPosts(postData || []);
        setApps(appData || []);
        setLoading(false);
    };

    const appName = (id) => apps.find((a) => a.id === id)?.name || '—';

    const setStatus = async (post, status) => {
        if (status === 'published' && post.status !== 'published' && post.type === 'review' && post.rating) {
            const app = apps.find((a) => a.id === post.app_id);
            if (app) {
                await supabase.from('apps').update({
                    rating_sum: (app.rating_sum || 0) + post.rating,
                    rating_count: (app.rating_count || 0) + 1,
                }).eq('id', app.id);
            }
        }
        await supabase.from('app_posts').update({ status }).eq('id', post.id);
        fetchAll();
    };

    const togglePin = async (post) => {
        await supabase.from('app_posts').update({ pinned: !post.pinned }).eq('id', post.id);
        fetchAll();
    };

    const remove = async (post) => {
        if (!confirm('Beitrag endgültig löschen?')) return;
        await supabase.from('app_posts').delete().eq('id', post.id);
        fetchAll();
    };

    const blockDevice = async (deviceId) => {
        if (!deviceId) return;
        if (!confirm('Dieses Gerät sperren? Es kann dann keine neuen Beiträge mehr schreiben.')) return;
        await supabase.from('blocked_devices').insert({ device_id: deviceId, reason: 'Von Admin gesperrt', created_at: new Date().toISOString() });
        alert('Gerät gesperrt. In der Blockliste kannst du das rückgängig machen.');
    };

    const submitReply = async (post) => {
        const mod = moderateText(replyText, { maxLen: 800 });
        await supabase.from('app_posts').update({ admin_reply: mod.cleanText || replyText.trim() }).eq('id', post.id);
        setReplyId(null); setReplyText('');
        fetchAll();
    };

    const filtered = posts.filter((p) => filter === 'all' || p.status === filter);
    const pendingCount = posts.filter((p) => p.status === 'pending').length;

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h2 className="text-lg font-bold text-slate-900">Beiträge moderieren</h2>
                    <p className="text-sm text-slate-500">Geprüfte Beiträge freigeben, unpassende verbergen oder löschen, Geräte sperren.</p>
                </div>
                <button onClick={fetchAll} className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-slate-600"><RefreshCw className={cn('w-5 h-5', loading && 'animate-spin')} /></button>
            </div>

            <div className="flex flex-wrap gap-2">
                {[
                    { id: 'pending', label: `In Prüfung${pendingCount ? ` (${pendingCount})` : ''}` },
                    { id: 'published', label: 'Sichtbar' },
                    { id: 'hidden', label: 'Verborgen' },
                    { id: 'all', label: 'Alle' },
                ].map((f) => (
                    <button key={f.id} onClick={() => setFilter(f.id)}
                        className={cn('px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all',
                            filter === f.id ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-gray-200 hover:bg-gray-50')}>
                        {f.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-100">
                    <CheckCircle className="w-10 h-10 text-green-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">Nichts zu tun – alles erledigt.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map((post) => {
                        const typeInfo = getPostType(post.type);
                        const st = POST_STATUS[post.status] || POST_STATUS.hidden;
                        return (
                            <div key={post.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-3">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <img src={avatarUrl(post.avatar_seed, post.id)} alt="" className="w-7 h-7 rounded-full border border-gray-200" />
                                    <span className="text-sm font-bold text-slate-700">{post.author_name}</span>
                                    <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase', typeInfo.color)}>{typeInfo.label}</span>
                                    <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase', st.color)}>{st.label}</span>
                                    <span className="text-xs text-slate-400">· {appName(post.app_id)}</span>
                                    <span className="text-xs text-slate-400 ml-auto">{new Date(post.created_at).toLocaleDateString('de-DE')}</span>
                                </div>

                                {post.title && <h4 className="font-bold text-slate-900 text-sm">{post.title}</h4>}
                                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap bg-gray-50 p-3 rounded-lg border border-gray-100">{post.body}</p>
                                {post.screenshot_url && <img src={post.screenshot_url} alt="Beigefügtes Bild" className="max-h-48 rounded-lg border border-gray-200" />}
                                {post.code_snippet && <pre className="bg-slate-900 text-slate-100 text-xs rounded-lg p-3 overflow-x-auto"><code>{post.code_snippet}</code></pre>}
                                {post.admin_reply && (
                                    <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-3 text-sm flex items-start gap-2">
                                        <CornerDownRight className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                                        <p className="text-blue-900 text-xs">{post.admin_reply}</p>
                                    </div>
                                )}

                                {replyId === post.id ? (
                                    <div className="space-y-2">
                                        <textarea rows="3" value={replyText} onChange={(e) => setReplyText(e.target.value)}
                                            className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none"
                                            placeholder="Offizielle Antwort an die Community…" />
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => { setReplyId(null); setReplyText(''); }} className="text-xs px-3 py-1.5 text-slate-600 hover:bg-gray-100 rounded-lg">Abbrechen</button>
                                            <button onClick={() => submitReply(post)} className="text-xs btn-primary px-3 py-1.5">Antwort speichern</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100">
                                        <span className="text-xs text-slate-400 mr-auto">👍 {post.votes || 0}</span>
                                        {post.status !== 'published' && (
                                            <button onClick={() => setStatus(post, 'published')} className="text-xs px-3 py-1.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 font-semibold border border-green-100 inline-flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> Freigeben</button>
                                        )}
                                        {post.status !== 'hidden' && (
                                            <button onClick={() => setStatus(post, 'hidden')} className="text-xs px-3 py-1.5 bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-100 font-semibold border border-slate-200 inline-flex items-center gap-1"><EyeOff className="w-3.5 h-3.5" /> Verbergen</button>
                                        )}
                                        <button onClick={() => togglePin(post)} className="text-xs px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 font-semibold border border-blue-100 inline-flex items-center gap-1">{post.pinned ? <><PinOff className="w-3.5 h-3.5" /> Lösen</> : <><Pin className="w-3.5 h-3.5" /> Anpinnen</>}</button>
                                        <button onClick={() => { setReplyId(post.id); setReplyText(post.admin_reply || ''); }} className="text-xs px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 font-semibold border border-indigo-100 inline-flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" /> Antworten</button>
                                        <button onClick={() => blockDevice(post.device_id)} className="text-xs px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 font-semibold border border-amber-100 inline-flex items-center gap-1"><Ban className="w-3.5 h-3.5" /> Gerät sperren</button>
                                        <button onClick={() => remove(post)} className="text-xs px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-semibold border border-red-100 inline-flex items-center gap-1"><Trash2 className="w-3.5 h-3.5" /> Löschen</button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// =============================================================
// TAB: Blockliste (gesperrte Geräte verwalten)
// =============================================================
export function BlocklistTab() {
    const [blocked, setBlocked] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newId, setNewId] = useState('');

    useEffect(() => { load(); }, []);

    const load = async () => {
        setLoading(true);
        const { data } = await supabase.from('blocked_devices').select('*').order('created_at', { ascending: false });
        setBlocked(data || []);
        setLoading(false);
    };

    const unblock = async (row) => {
        await supabase.from('blocked_devices').delete().eq('device_id', row.device_id);
        load();
    };

    const addBlock = async () => {
        if (!newId.trim()) return;
        await supabase.from('blocked_devices').insert({ device_id: newId.trim(), reason: 'Manuell gesperrt', created_at: new Date().toISOString() });
        setNewId('');
        load();
    };

    return (
        <div className="space-y-5">
            <div>
                <h2 className="text-lg font-bold text-slate-900">Blockliste</h2>
                <p className="text-sm text-slate-500">Gesperrte Geräte können keine neuen Beiträge schreiben. Du kannst Sperren jederzeit aufheben.</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4 flex gap-2 shadow-sm">
                <input value={newId} onChange={(e) => setNewId(e.target.value)} placeholder="Geräte-Kennung manuell sperren (optional)…"
                    className="flex-grow bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none" />
                <button onClick={addBlock} className="btn-primary text-sm inline-flex items-center gap-1"><Ban className="w-4 h-4" /> Sperren</button>
            </div>

            {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>
            ) : blocked.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-100">
                    <ShieldCheck className="w-10 h-10 text-green-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">Keine gesperrten Geräte. Alles ruhig.</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {blocked.map((row) => (
                        <div key={row.device_id} className="bg-white border border-gray-200 rounded-xl p-3 flex items-center gap-3 shadow-sm">
                            <Ban className="w-4 h-4 text-red-500 shrink-0" />
                            <div className="min-w-0 flex-grow">
                                <p className="text-xs font-mono text-slate-600 truncate">{row.device_id}</p>
                                <p className="text-[11px] text-slate-400">{row.reason} · {new Date(row.created_at).toLocaleDateString('de-DE')}</p>
                            </div>
                            <button onClick={() => unblock(row)} className="text-xs px-3 py-1.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 font-semibold border border-green-100 shrink-0">Sperre aufheben</button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
