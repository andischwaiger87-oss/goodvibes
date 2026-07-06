import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ThumbsUp, MessageSquare, RotateCw,
    Send, ShieldCheck, Loader2, MessagesSquare
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getDeviceId } from '../utils/security';
import {
    moderateText, checkRateLimit, recordPost, isDeviceBlocked,
    generateNickname, generateAvatarSeed, avatarUrl, POST_LIMITS
} from '../utils/moderation';
import { getPostType, timeAgo } from '../utils/apps';
import PostComposer from './PostComposer';
import StarRating from './StarRating';
import { cn } from '../utils/cn';

const TABS = [
    { id: 'all', label: 'Alles' },
    { id: 'review', label: 'Bewertungen' },
    { id: 'feature', label: 'Wünsche' },
    { id: 'bug', label: 'Fehler' },
    { id: 'question', label: 'Fragen' },
    { id: 'praise', label: 'Feedback' },
];

export default function CommunityFeed({ app }) {
    const [posts, setPosts] = useState([]);
    const [replies, setReplies] = useState([]);
    const [myVotes, setMyVotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('all');
    const [sortBy, setSortBy] = useState('top');

    useEffect(() => { fetchAll(); /* eslint-disable-next-line */ }, [app?.id]);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const deviceId = getDeviceId();
            const { data: postData } = await supabase.from('app_posts').select('*').eq('app_id', app.id);
            const published = (postData || []).filter((p) => p.status === 'published');
            const { data: replyData } = await supabase.from('app_post_replies').select('*');
            const { data: voteData } = await supabase.from('app_post_votes').select('*').eq('device_id', deviceId);

            setPosts(published);
            setReplies((replyData || []).filter((r) => r.status === 'published'));
            setMyVotes((voteData || []).map((v) => v.post_id));
        } catch (err) {
            console.error('Fehler beim Laden der Beiträge:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleVote = async (postId) => {
        if (await isDeviceBlocked(supabase)) return;
        const deviceId = getDeviceId();
        const voted = myVotes.includes(postId);
        try {
            if (voted) {
                await supabase.from('app_post_votes').delete().eq('post_id', postId).eq('device_id', deviceId);
                setMyVotes((prev) => prev.filter((id) => id !== postId));
                const cur = posts.find((p) => p.id === postId);
                const next = Math.max(0, (cur?.votes || 1) - 1);
                setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, votes: next } : p));
                await supabase.from('app_posts').update({ votes: next }).eq('id', postId);
            } else {
                await supabase.from('app_post_votes').insert({ post_id: postId, device_id: deviceId, created_at: new Date().toISOString() });
                setMyVotes((prev) => [...prev, postId]);
                const cur = posts.find((p) => p.id === postId);
                const next = (cur?.votes || 0) + 1;
                setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, votes: next } : p));
                await supabase.from('app_posts').update({ votes: next }).eq('id', postId);
            }
        } catch (err) {
            console.error('Fehler beim Abstimmen:', err);
        }
    };

    const visible = useMemo(() => {
        let list = posts.filter((p) => tab === 'all' || p.type === tab);
        list = [...list].sort((a, b) => {
            if (a.pinned && !b.pinned) return -1;
            if (!a.pinned && b.pinned) return 1;
            if (sortBy === 'top') return (b.votes || 0) - (a.votes || 0);
            return new Date(b.created_at) - new Date(a.created_at);
        });
        return list;
    }, [posts, tab, sortBy]);

    const featureRequests = posts.filter((p) => p.type === 'feature').sort((a, b) => (b.votes || 0) - (a.votes || 0)).slice(0, 3);

    return (
        <div className="space-y-6">
            {/* Composer */}
            <PostComposer app={app} onPosted={fetchAll} />

            {/* Top-Wünsche (Priorisierung durch die Community) */}
            {featureRequests.length > 0 && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-5">
                    <h3 className="text-sm font-bold text-blue-900 mb-1 flex items-center gap-2">
                        <ThumbsUp className="w-4 h-4" /> Meist-gewünschte Verbesserungen
                    </h3>
                    <p className="text-xs text-blue-700/80 mb-3">Was viele wichtig finden, setzen wir zuerst um. Stimm mit einem Klick ab!</p>
                    <div className="space-y-2">
                        {featureRequests.map((p) => (
                            <div key={p.id} className="flex items-center gap-3 bg-white/70 rounded-lg px-3 py-2">
                                <button
                                    onClick={() => handleVote(p.id)}
                                    className={cn('flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-md border shrink-0 transition-all',
                                        myVotes.includes(p.id) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50')}
                                    aria-label={`Für „${p.title || 'diesen Wunsch'}" stimmen`}
                                >
                                    <ThumbsUp className="w-3.5 h-3.5" /> {p.votes || 0}
                                </button>
                                <span className="text-sm text-slate-700 truncate">{p.title || p.body}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Filter + Sortierung */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-2" role="tablist" aria-label="Beiträge filtern">
                        {TABS.map((t) => (
                            <button
                                key={t.id}
                                role="tab"
                                aria-selected={tab === t.id}
                                onClick={() => setTab(t.id)}
                                className={cn('px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all',
                                    tab === t.id ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-gray-200 hover:bg-gray-50')}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
                    <button onClick={fetchAll} className="p-1.5 rounded-lg text-slate-400 hover:bg-gray-100 hover:text-slate-700 shrink-0" aria-label="Aktualisieren">
                        <RotateCw className="w-4 h-4" />
                    </button>
                </div>
                <div className="flex items-center gap-3 pt-2 border-t border-gray-100 text-xs">
                    <span className="text-slate-400 font-medium">Sortieren:</span>
                    <button onClick={() => setSortBy('top')} className={cn('font-bold py-1 px-2.5 rounded', sortBy === 'top' ? 'text-blue-600 bg-blue-50' : 'text-slate-500 hover:text-slate-900')}>Beliebteste</button>
                    <button onClick={() => setSortBy('new')} className={cn('font-bold py-1 px-2.5 rounded', sortBy === 'new' ? 'text-blue-600 bg-blue-50' : 'text-slate-500 hover:text-slate-900')}>Neueste</button>
                </div>
            </div>

            {/* Liste */}
            {loading ? (
                <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" role="status" aria-label="Lädt" /></div>
            ) : visible.length > 0 ? (
                <div className="space-y-4">
                    <AnimatePresence>
                        {visible.map((post) => (
                            <PostItem
                                key={post.id}
                                post={post}
                                replies={replies.filter((r) => r.post_id === post.id)}
                                voted={myVotes.includes(post.id)}
                                onVote={() => handleVote(post.id)}
                                onReplied={fetchAll}
                            />
                        ))}
                    </AnimatePresence>
                </div>
            ) : (
                <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-100">
                    <MessagesSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-slate-900 mb-1">Noch nichts hier</h3>
                    <p className="text-sm text-slate-500 max-w-sm mx-auto">Sei die erste Person, die etwas schreibt. Deine Meinung hilft allen weiter!</p>
                </div>
            )}
        </div>
    );
}

// -------------------------------------------------------------
// Einzelner Beitrag inkl. Antworten
// -------------------------------------------------------------
function PostItem({ post, replies, voted, onVote, onReplied }) {
    const typeInfo = getPostType(post.type);
    const [showReply, setShowReply] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [busy, setBusy] = useState(false);
    const [msg, setMsg] = useState('');

    const submitReply = async (e) => {
        e.preventDefault();
        setMsg('');
        if (await isDeviceBlocked(supabase)) { setMsg('Dein Zugang wurde eingeschränkt.'); return; }
        const rl = checkRateLimit();
        if (!rl.ok) { setMsg(rl.reason); return; }
        const mod = moderateText(replyText, { maxLen: POST_LIMITS.reply });
        if (!mod.ok) { setMsg(mod.userMessage); return; }

        setBusy(true);
        try {
            const nickname = generateNickname();
            await supabase.from('app_post_replies').insert({
                post_id: post.id,
                body: mod.cleanText,
                author_name: nickname,
                avatar_seed: generateAvatarSeed(nickname),
                device_id: getDeviceId(),
                status: mod.needsReview ? 'pending' : 'published',
                created_at: new Date().toISOString(),
            });
            recordPost();
            setReplyText('');
            setShowReply(false);
            setMsg('');
            onReplied?.();
        } catch (err) {
            console.error('Fehler bei Antwort:', err);
            setMsg('Antwort konnte nicht gesendet werden.');
        } finally {
            setBusy(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
            className={cn('elgato-card p-5 sm:p-6', post.pinned && 'ring-1 ring-blue-200 border-blue-200')}
        >
            {/* Kopf */}
            <div className="flex items-start gap-3">
                <img src={avatarUrl(post.avatar_seed, post.id)} alt="" aria-hidden="true" className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 shrink-0" />
                <div className="min-w-0 flex-grow">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-slate-800">{post.author_name}</span>
                        <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wide', typeInfo.color)}>{typeInfo.label}</span>
                        {post.pinned && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">Angepinnt</span>}
                        <span className="text-xs text-slate-400">· {timeAgo(post.created_at)}</span>
                    </div>
                    {post.type === 'review' && post.rating > 0 && (
                        <div className="mt-1"><StarRating value={post.rating} readOnly size="sm" /></div>
                    )}
                </div>
            </div>

            {/* Inhalt */}
            {post.title && <h4 className="text-base font-bold text-slate-900 mt-3">{post.title}</h4>}
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap mt-2">{post.body}</p>

            {/* Screenshot */}
            {post.screenshot_url && (
                <img src={post.screenshot_url} alt="Vom Nutzer beigefügtes Bildschirmfoto" className="mt-3 max-h-80 rounded-xl border border-gray-200" loading="lazy" />
            )}

            {/* Code (nur als reiner Text) */}
            {post.code_snippet && (
                <pre className="mt-3 bg-slate-900 text-slate-100 text-xs rounded-xl p-4 overflow-x-auto border border-slate-700">
                    <code>{post.code_snippet}</code>
                </pre>
            )}

            {/* Offizielle Antwort */}
            {post.admin_reply && (
                <div className="mt-4 bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-xs font-bold text-blue-800 mb-0.5">Antwort vom GoodVibes-Team</p>
                        <p className="text-sm text-blue-900 leading-relaxed whitespace-pre-wrap">{post.admin_reply}</p>
                    </div>
                </div>
            )}

            {/* Aktionen */}
            <div className="flex items-center gap-3 mt-4 pt-3 border-t border-gray-100">
                <button
                    onClick={onVote}
                    className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all',
                        voted ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-500 border-gray-200 hover:border-blue-200 hover:text-blue-600')}
                    aria-pressed={voted}
                    aria-label="Das finde ich auch"
                >
                    <ThumbsUp className="w-3.5 h-3.5" /> {post.votes || 0}
                    <span className="hidden sm:inline font-normal">Finde ich auch</span>
                </button>
                <button onClick={() => setShowReply((v) => !v)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-gray-50" aria-expanded={showReply}>
                    <MessageSquare className="w-3.5 h-3.5" /> Antworten {replies.length > 0 && `(${replies.length})`}
                </button>
            </div>

            {/* Antworten-Liste */}
            {replies.length > 0 && (
                <div className="mt-3 space-y-3 pl-4 border-l-2 border-gray-100">
                    {replies.map((r) => (
                        <div key={r.id} className="flex items-start gap-2.5">
                            <img src={avatarUrl(r.avatar_seed, r.id)} alt="" aria-hidden="true" className="w-7 h-7 rounded-full bg-gray-100 border border-gray-200 shrink-0" />
                            <div>
                                <p className="text-xs"><span className="font-bold text-slate-700">{r.author_name}</span> <span className="text-slate-400">· {timeAgo(r.created_at)}</span></p>
                                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{r.body}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Antwort-Formular */}
            {showReply && (
                <form onSubmit={submitReply} className="mt-3 pl-4 border-l-2 border-blue-100">
                    {msg && <p className="text-xs text-amber-600 mb-2">{msg}</p>}
                    <div className="flex items-start gap-2">
                        <div className="flex-grow">
                            <label htmlFor={`reply-${post.id}`} className="sr-only">Deine Antwort</label>
                            <textarea
                                id={`reply-${post.id}`}
                                rows="2"
                                maxLength={POST_LIMITS.reply}
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Freundlich antworten…"
                                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none resize-none"
                            />
                        </div>
                        <button type="submit" disabled={busy} className="btn-primary px-3 py-2 shrink-0" aria-label="Antwort senden">
                            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        </button>
                    </div>
                </form>
            )}
        </motion.div>
    );
}
