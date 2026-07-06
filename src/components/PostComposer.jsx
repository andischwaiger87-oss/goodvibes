import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    PlusCircle, ImagePlus, Code2, X, ShieldCheck, AlertCircle,
    CheckCircle, Loader2, Info, ArrowRight, MessageSquare
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getDeviceId } from '../utils/security';
import {
    moderateText, moderateCode, sanitizeImage, checkRateLimit, recordPost,
    isDeviceBlocked, generateNickname, generateAvatarSeed, containsLink, POST_LIMITS
} from '../utils/moderation';
import { POST_TYPES, getPostType } from '../utils/apps';
import StarRating from './StarRating';
import { cn } from '../utils/cn';

/**
 * Sicherer Beitrags-Composer.
 * Alle Inhalte laufen durch die Moderations-Schicht, bevor sie gespeichert
 * werden. Links werden entfernt, Code nur als reiner Text abgelegt,
 * Bilder neu kodiert (Metadaten entfernt).
 */
export default function PostComposer({ app, onPosted }) {
    const [open, setOpen] = useState(false);
    const [type, setType] = useState('review');
    const [rating, setRating] = useState(0);
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [showCode, setShowCode] = useState(false);
    const [code, setCode] = useState('');
    const [image, setImage] = useState(null);         // saubere Data-URL
    const [imageBusy, setImageBusy] = useState(false);

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const fileRef = useRef(null);

    const typeInfo = getPostType(type);
    const liveLinkWarning = containsLink(body) || containsLink(title);

    const reset = () => {
        setType('review'); setRating(0); setTitle(''); setBody('');
        setShowCode(false); setCode(''); setImage(null);
    };

    const handleImage = async (e) => {
        setError('');
        const file = e.target.files?.[0];
        if (!file) return;
        setImageBusy(true);
        const res = await sanitizeImage(file);
        setImageBusy(false);
        if (!res.ok) { setError(res.reason); if (fileRef.current) fileRef.current.value = ''; return; }
        setImage(res.dataUrl);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setSuccess('');

        // 1) Gerät gesperrt?
        if (await isDeviceBlocked(supabase)) {
            setError('Dein Zugang wurde eingeschränkt, weil frühere Beiträge unsere Regeln verletzt haben. Bei Fragen wende dich bitte an das GoodVibes-Team.');
            return;
        }

        // 2) Rate-Limit
        const rl = checkRateLimit();
        if (!rl.ok) { setError(rl.reason); return; }

        // 3) Pflichtfelder
        if (type === 'review' && rating === 0) { setError('Bitte wähle noch, wie viele Sterne du gibst.'); return; }
        if (!body.trim()) { setError('Bitte schreib noch ein paar Worte.'); return; }

        // 4) Text prüfen & bereinigen
        const titleMod = title.trim() ? moderateText(title, { maxLen: POST_LIMITS.title }) : { ok: true, cleanText: '', needsReview: false };
        if (!titleMod.ok) { setError(titleMod.userMessage); return; }

        const bodyMod = moderateText(body, { maxLen: POST_LIMITS.body });
        if (!bodyMod.ok) { setError(bodyMod.userMessage); return; }

        // 5) Code prüfen (optional)
        let cleanCode = null;
        let codeReview = false;
        if (showCode && code.trim()) {
            const codeMod = moderateCode(code);
            if (!codeMod.ok) { setError(codeMod.userMessage); return; }
            cleanCode = codeMod.cleanCode;
            codeReview = codeMod.needsReview;
        }

        const needsReview = titleMod.needsReview || bodyMod.needsReview || codeReview || !!image;
        const status = needsReview ? 'pending' : 'published';

        setSubmitting(true);
        try {
            const deviceId = getDeviceId();
            const nickname = generateNickname();
            const newPost = {
                app_id: app.id,
                type,
                rating: type === 'review' ? rating : null,
                title: titleMod.cleanText,
                body: bodyMod.cleanText,
                author_name: nickname,
                avatar_seed: generateAvatarSeed(nickname),
                device_id: deviceId,
                status,
                votes: 0,
                pinned: false,
                screenshot_url: image || null,
                code_snippet: cleanCode,
                admin_reply: null,
                created_at: new Date().toISOString(),
            };

            const { error: insErr } = await supabase.from('app_posts').insert(newPost);
            if (insErr) throw insErr;

            // Bewertung sofort auf App zählen, wenn direkt sichtbar
            if (status === 'published' && type === 'review') {
                await supabase.from('apps').update({
                    rating_sum: (app.rating_sum || 0) + rating,
                    rating_count: (app.rating_count || 0) + 1,
                }).eq('id', app.id);
            }

            recordPost();
            reset();
            setSuccess(needsReview
                ? 'Danke! Dein Beitrag wird kurz von einem Menschen geprüft und erscheint dann. So bleibt GoodVibes freundlich und sicher.'
                : 'Danke! Dein Beitrag ist jetzt sichtbar.');
            onPosted?.();
            if (!needsReview) setTimeout(() => setOpen(false), 1200);
        } catch (err) {
            console.error('Fehler beim Speichern:', err);
            setError('Dein Beitrag konnte gerade nicht gespeichert werden. Bitte versuch es später noch einmal.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-md ring-1 ring-blue-100 overflow-hidden">
            {/* Auslöser */}
            <button
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                className="w-full flex items-center gap-4 p-5 sm:p-6 text-left bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-colors focus:outline-none focus:ring-4 focus:ring-blue-200"
            >
                <div className="shrink-0 w-12 h-12 rounded-2xl bg-white/20 ring-1 ring-white/30 flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <div className="flex-grow min-w-0">
                    <p className="font-extrabold text-white text-base sm:text-lg leading-tight">Sag uns deine Meinung</p>
                    <p className="text-sm text-blue-50">Bewertung, Wunsch, Fehler oder Frage – anonym und in unter einer Minute.</p>
                </div>
                <span className="hidden sm:inline-flex items-center gap-1.5 shrink-0 bg-white text-blue-700 font-bold text-sm px-4 py-2.5 rounded-xl shadow-sm">
                    {open ? 'Schließen' : 'Jetzt schreiben'}
                    <ArrowRight className={cn('w-4 h-4 transition-transform', open && 'rotate-90')} />
                </span>
            </button>

            <AnimatePresence>
                {open && (
                    <motion.form
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        onSubmit={handleSubmit}
                        className="border-t border-gray-100 overflow-hidden"
                    >
                        <div className="p-4 sm:p-6 space-y-5">
                            {/* Meldungen */}
                            {error && (
                                <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm flex items-start gap-2.5" role="alert">
                                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                                    <span>{error}</span>
                                </div>
                            )}
                            {success && (
                                <div className="p-3.5 bg-green-50 border border-green-200 rounded-xl text-green-800 text-sm flex items-start gap-2.5" role="status">
                                    <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                                    <span>{success}</span>
                                </div>
                            )}

                            {/* Art des Beitrags */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Worum geht es?</label>
                                <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Art des Beitrags">
                                    {Object.entries(POST_TYPES).map(([key, info]) => (
                                        <button
                                            type="button"
                                            key={key}
                                            role="radio"
                                            aria-checked={type === key}
                                            onClick={() => setType(key)}
                                            className={cn('px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all',
                                                type === key ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white text-slate-600 border-gray-200 hover:bg-gray-50')}
                                        >
                                            {info.label}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
                                    <Info className="w-3.5 h-3.5" /> {typeInfo.help}
                                </p>
                            </div>

                            {/* Sterne (nur bei Bewertung) */}
                            {type === 'review' && (
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Wie viele Sterne gibst du?</label>
                                    <StarRating value={rating} onChange={setRating} size="lg" />
                                </div>
                            )}

                            {/* Titel */}
                            <div>
                                <label htmlFor="post-title" className="block text-sm font-semibold text-slate-700 mb-1.5">Überschrift <span className="text-slate-400 font-normal">(optional)</span></label>
                                <input
                                    id="post-title"
                                    type="text"
                                    maxLength={POST_LIMITS.title}
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all"
                                    placeholder="Kurz in einem Satz…"
                                />
                            </div>

                            {/* Text */}
                            <div>
                                <label htmlFor="post-body" className="block text-sm font-semibold text-slate-700 mb-1.5">Deine Nachricht</label>
                                <textarea
                                    id="post-body"
                                    rows="4"
                                    maxLength={POST_LIMITS.body}
                                    value={body}
                                    onChange={(e) => setBody(e.target.value)}
                                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all resize-none"
                                    placeholder="Schreib in deinen eigenen Worten, was du sagen möchtest…"
                                />
                                <div className="flex justify-between mt-1">
                                    {liveLinkWarning ? (
                                        <span className="text-xs text-amber-600 flex items-center gap-1"><Info className="w-3.5 h-3.5" /> Links werden aus Sicherheitsgründen automatisch entfernt.</span>
                                    ) : <span />}
                                    <span className="text-xs text-slate-400">{body.length}/{POST_LIMITS.body}</span>
                                </div>
                            </div>

                            {/* Zusatz: Screenshot & Code (v.a. bei Fehlern) */}
                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={() => fileRef.current?.click()}
                                    disabled={imageBusy}
                                    className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg border border-gray-200 text-slate-600 hover:bg-gray-50 disabled:opacity-60"
                                >
                                    {imageBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
                                    {image ? 'Bild ausgewählt' : 'Screenshot hinzufügen'}
                                </button>
                                <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleImage} className="hidden" aria-label="Screenshot auswählen" />

                                <button
                                    type="button"
                                    onClick={() => setShowCode((v) => !v)}
                                    className={cn('inline-flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg border transition-colors',
                                        showCode ? 'bg-slate-900 text-white border-slate-900' : 'border-gray-200 text-slate-600 hover:bg-gray-50')}
                                >
                                    <Code2 className="w-4 h-4" /> Code beifügen
                                </button>
                            </div>

                            {/* Bildvorschau */}
                            {image && (
                                <div className="relative inline-block">
                                    <img src={image} alt="Vorschau deines Screenshots" className="max-h-48 rounded-xl border border-gray-200" />
                                    <button type="button" onClick={() => { setImage(null); if (fileRef.current) fileRef.current.value = ''; }}
                                        className="absolute -top-2 -right-2 bg-white border border-gray-200 rounded-full p-1 shadow-sm hover:bg-red-50" aria-label="Bild entfernen">
                                        <X className="w-4 h-4 text-slate-600" />
                                    </button>
                                    <p className="text-[11px] text-green-600 mt-1 flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> Bild wurde neu gespeichert – versteckte Daten sind entfernt.</p>
                                </div>
                            )}

                            {/* Code-Feld */}
                            {showCode && (
                                <div>
                                    <label htmlFor="post-code" className="block text-sm font-semibold text-slate-700 mb-1.5">Code-Ausschnitt <span className="text-slate-400 font-normal">(optional)</span></label>
                                    <textarea
                                        id="post-code"
                                        rows="4"
                                        maxLength={POST_LIMITS.code}
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        spellCheck={false}
                                        className="w-full bg-slate-900 text-slate-100 font-mono text-xs border border-slate-700 rounded-xl px-4 py-3 focus:ring-4 focus:ring-slate-200 outline-none transition-all resize-none"
                                        placeholder="Hier kannst du Code einfügen. Er wird nur als Text angezeigt – niemals ausgeführt."
                                    />
                                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                                        <ShieldCheck className="w-3.5 h-3.5" /> Code wird ausschließlich als reiner Text gespeichert und geprüft, bevor er erscheint.
                                    </p>
                                </div>
                            )}

                            {/* Sicherheits-Hinweis */}
                            <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-3 text-xs text-blue-800 flex items-start gap-2">
                                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                                <span>Bitte bleib freundlich. Beleidigungen, Links und schädliche Inhalte werden automatisch gefiltert. Auffällige Beiträge prüfen wir kurz, bevor sie sichtbar sind.</span>
                            </div>

                            {/* Aktionen */}
                            <div className="flex justify-end gap-3 pt-1">
                                <button type="button" onClick={() => { reset(); setOpen(false); setError(''); setSuccess(''); }}
                                    className="btn-secondary text-sm">Abbrechen</button>
                                <button type="submit" disabled={submitting}
                                    className="btn-primary text-sm inline-flex items-center gap-2 disabled:opacity-70">
                                    {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Wird gesendet…</> : 'Beitrag senden'}
                                </button>
                            </div>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>
        </div>
    );
}
