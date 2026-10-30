import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { ThumbsUp, Heart, Share2, Check, XCircle, AlertTriangle, X, Eye, Wrench, Target, Trophy, Info } from 'lucide-react';
import { getDeviceId, hasAlreadyVotedLocal, recordVoteLocal } from '../utils/security';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getCategoryLabel } from '../utils/categories';
import { cn } from '../utils/cn';
import { projectAvatarUrl } from '../utils/avatar';
import RichText from './RichText';

// Avatare kommen lokal aus /public/avatars (kein Drittanbieter).
// Projekte mit fertiger App zeigen das App-Avatar (siehe utils/avatar.js).

export default function VotingCard({ project, onVote, isGlobalPhaseReview = false, voteGoal = 100 }) {
    const [hasVoted, setHasVoted] = useState(hasAlreadyVotedLocal(project.id));
    const [showConfirm, setShowConfirm] = useState(false);
    const [votes, setVotes] = useState(project.votes || 0);
    const [isVoting, setIsVoting] = useState(false);
    // true, wenn der Server meldet: von diesem Geraet/Anschluss wurde schon abgestimmt
    const [alreadyCounted, setAlreadyCounted] = useState(false);
    const [shareSuccess, setShareSuccess] = useState(false);
    const [showDetail, setShowDetail] = useState(false);
    const navigate = useNavigate();
    const dragControls = useDragControls();

    const isRejected = project.status === 'rejected';
    const isImplementation = project.status === 'implementation';
    const isOwner = project.owner_id === getDeviceId();
    const goalReached = votes >= voteGoal;
    const goalPercent = Math.min(100, Math.round((votes / voteGoal) * 100));

    const handleInitialVoteClick = () => {
        if (isGlobalPhaseReview) return;
        if (!hasVoted && !isRejected && !isImplementation) {
            setShowConfirm(true);
        }
    };

    const confirmVote = async () => {
        setIsVoting(true);
        try {
            // Der Server prueft fair (Geraet + Anschluss) und meldet, ob gezaehlt wurde.
            const { data, error } = await supabase.rpc('increment_vote', {
                project_id: project.id,
                device_id: getDeviceId(),
            });
            if (error) throw error;

            recordVoteLocal(project.id);
            setHasVoted(true);

            if (data === false) {
                // Nicht gezaehlt: schon abgestimmt (z. B. im Inkognito-Tab erneut)
                setAlreadyCounted(true);
            } else {
                setVotes(prev => prev + 1);
                onVote(project.id);
            }
        } catch (err) {
            console.error('Abstimmung fehlgeschlagen:', err);
        } finally {
            setShowConfirm(false);
            setIsVoting(false);
        }
    };

    const handleShare = async () => {
        if (isRejected) return;

        const shareData = {
            title: `GoodVibes: ${project.title}`,
            text: `Schau dir diese Idee an: "${project.title}"`,
            url: `${window.location.origin}/voting`
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
                setShareSuccess(true);
                setTimeout(() => setShareSuccess(false), 2000);
            }
        } catch (err) {
            console.log('Share cancelled or failed:', err);
        }
    };

    // Detail: am Handy als Bottom-Sheet, am Desktop als zentriertes Fenster
    const DetailModal = () => createPortal(
        <AnimatePresence>
            {showDetail && (
                <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby={`detail-${project.id}`}>
                    <motion.div
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setShowDetail(false)}
                    />
                    <motion.div
                        initial={{ y: '100%', opacity: 0.6 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: '100%', opacity: 0.6 }}
                        transition={{ type: 'spring', stiffness: 380, damping: 36 }}
                        drag="y"
                        dragControls={dragControls}
                        dragListener={false}
                        dragConstraints={{ top: 0, bottom: 0 }}
                        dragElastic={{ top: 0, bottom: 0.6 }}
                        onDragEnd={(e, info) => { if (info.offset.y > 120 || info.velocity.y > 600) setShowDetail(false); }}
                        className="relative w-full sm:max-w-2xl bg-white rounded-t-[1.75rem] sm:rounded-3xl shadow-2xl flex flex-col max-h-[90svh] sm:max-h-[85vh]"
                    >
                        {/* Griff (nur Handy) + Kopf */}
                        <div
                            className="shrink-0 px-5 sm:px-7 pt-3 sm:pt-6 pb-4 border-b border-slate-100 touch-none sm:touch-auto"
                            onPointerDown={(e) => { if (e.pointerType !== 'mouse') dragControls.start(e); }}
                        >
                            <div aria-hidden="true" className="sm:hidden mx-auto mb-3 w-10 h-1.5 rounded-full bg-slate-200" />
                            <div className="flex items-start gap-3.5">
                                <img src={projectAvatarUrl(project)} alt="" className="w-12 h-12 rounded-2xl bg-slate-50 ring-1 ring-slate-200 shrink-0" />
                                <div className="min-w-0 flex-1">
                                    <h2 id={`detail-${project.id}`} className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">{project.title}</h2>
                                    <p className="mt-0.5 text-xs text-slate-500">
                                        <span className="font-semibold text-blue-600">{getCategoryLabel(project.category)}</span>
                                        <span aria-hidden="true"> · </span>von {project.username}
                                    </p>
                                </div>
                                <button
                                    type="button" onClick={() => setShowDetail(false)}
                                    className="shrink-0 -mr-2 -mt-1 w-11 h-11 inline-flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                                    aria-label="Schließen"
                                >
                                    <X className="w-5 h-5" aria-hidden="true" />
                                </button>
                            </div>
                        </div>

                        {/* Inhalt (scrollbar) */}
                        <div className="flex-1 overflow-y-auto overscroll-contain px-5 sm:px-7 py-5 sm:py-6 space-y-7">
                            {project.admin_note && (
                                <div className="flex items-start gap-3 p-4 rounded-2xl bg-blue-50/70 ring-1 ring-blue-100">
                                    <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" aria-hidden="true" />
                                    <div>
                                        <h3 className="text-sm font-semibold text-blue-700 mb-1">Hinweis von Andi</h3>
                                        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{project.admin_note}</p>
                                    </div>
                                </div>
                            )}

                            <section>
                                <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-blue-600 mb-3">Die Idee</h3>
                                <RichText text={project.description} size="sm" />
                            </section>

                            <section>
                                <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-blue-600 mb-3">Wem hilft das?</h3>
                                <div className="relative pl-4">
                                    <span aria-hidden="true" className="absolute left-0 top-1 bottom-1 w-1 rounded-full bg-gradient-to-b from-blue-500 to-violet-500" />
                                    {project.benefit ? <RichText text={project.benefit} size="sm" /> : <p className="text-sm text-slate-500">Keine Angabe</p>}
                                </div>
                            </section>
                        </div>

                        {/* Aktionen: immer sichtbar */}
                        <div className="shrink-0 flex items-center gap-3 px-5 sm:px-7 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:pb-5 border-t border-slate-100 bg-white rounded-b-none sm:rounded-b-3xl">
                            {isImplementation ? (
                                <button
                                    type="button"
                                    onClick={() => { setShowDetail(false); navigate('/progress'); }}
                                    className="btn-primary flex-1 inline-flex items-center justify-center gap-2 min-h-[52px] !rounded-2xl"
                                >
                                    <Wrench className="w-5 h-5" aria-hidden="true" /> Fortschritt ansehen
                                </button>
                            ) : !hasVoted && !isRejected ? (
                                <button
                                    type="button"
                                    onClick={confirmVote}
                                    disabled={isGlobalPhaseReview || isVoting}
                                    className="btn-primary flex-1 inline-flex items-center justify-center gap-2 min-h-[52px] !rounded-2xl"
                                >
                                    <ThumbsUp className="w-5 h-5" aria-hidden="true" /> {isVoting ? 'Zähle …' : 'Unterstützen'}
                                </button>
                            ) : hasVoted ? (
                                <div className="flex-1 inline-flex items-center justify-center gap-2 min-h-[52px] rounded-2xl bg-blue-50 text-blue-700 font-semibold">
                                    <Heart className="w-5 h-5 fill-current" aria-hidden="true" />
                                    {votes} Stimmen · {alreadyCounted ? 'schon gezählt' : 'danke!'}
                                </div>
                            ) : <span className="flex-1" />}
                            {!isRejected && (
                                <button
                                    type="button" onClick={handleShare}
                                    className="shrink-0 w-[52px] h-[52px] inline-flex items-center justify-center rounded-2xl ring-1 ring-slate-200 text-slate-600 hover:text-blue-700 hover:ring-blue-200 transition-colors"
                                    aria-label="Idee teilen"
                                >
                                    <Share2 className="w-5 h-5" aria-hidden="true" />
                                </button>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );

    // Hintergrund nicht mitscrollen lassen + Esc schließt
    useEffect(() => {
        if (!showDetail) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const onKey = (e) => { if (e.key === 'Escape') setShowDetail(false); };
        window.addEventListener('keydown', onKey);
        return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
    }, [showDetail]);

    // Abgelehnte Idee: nur für die einreichende Person sichtbar – ruhig und respektvoll
    if (isRejected && isOwner) {
        return (
            <motion.article
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col h-full bg-white rounded-3xl ring-1 ring-slate-200/80 p-5 sm:p-6"
            >
                <p className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 mb-4">
                    <span className="w-6 h-6 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center">
                        <XCircle className="w-3.5 h-3.5" aria-hidden="true" />
                    </span>
                    Nur für dich sichtbar · nicht freigegeben
                </p>
                <div className="flex items-start gap-3.5">
                    <img src={projectAvatarUrl(project)} alt="" className="w-11 h-11 rounded-2xl bg-slate-50 ring-1 ring-slate-200 shrink-0 opacity-70" />
                    <div className="min-w-0">
                        <h3 className="font-bold text-[17px] text-slate-700 leading-snug line-clamp-2">{project.title}</h3>
                        <p className="mt-0.5 text-xs text-slate-400">von {project.username}</p>
                    </div>
                </div>
                <div className="mt-4 pl-4 relative">
                    <span aria-hidden="true" className="absolute left-0 top-1 bottom-1 w-1 rounded-full bg-rose-200" />
                    <p className="text-xs font-semibold text-slate-700 mb-1">Begründung</p>
                    <p className="text-sm text-slate-600 leading-relaxed">{project.rejection_reason || 'Keine Begründung angegeben.'}</p>
                </div>
                <p className="mt-auto pt-5 text-xs text-slate-400">Du kannst die Idee gern überarbeiten und neu einreichen.</p>
            </motion.article>
        );
    }

    if (isRejected && !isOwner) {
        return null;
    }

    // Normal Active Card or Implementation Card
    const open = () => setShowDetail(true);
    return (
        <>
            {DetailModal()}
            <motion.article
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                    'relative flex flex-col h-full bg-white rounded-3xl ring-1 ring-slate-200/80 shadow-sm shadow-slate-200/50 transition-all',
                    'hover:ring-blue-200 hover:shadow-md',
                    isImplementation && 'ring-indigo-200'
                )}
            >
                {isImplementation && (
                    <div aria-hidden="true" className="absolute top-0 inset-x-6 h-1 rounded-b-full bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />
                )}

                {/* Kopf + Text: ganzer Bereich oeffnet die Details */}
                <button
                    type="button"
                    onClick={open}
                    aria-label={`${project.title} – Details ansehen`}
                    className="text-left p-5 sm:p-6 pb-0 sm:pb-0 flex-grow rounded-t-3xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
                >
                    <div className="flex items-start gap-3.5">
                        <img src={projectAvatarUrl(project)} alt="" className="w-11 h-11 rounded-2xl bg-slate-50 ring-1 ring-slate-200 shrink-0" />
                        <div className="min-w-0">
                            <h3 className="font-bold text-[17px] sm:text-lg text-slate-900 leading-snug line-clamp-2">{project.title}</h3>
                            <p className="mt-0.5 text-xs text-slate-500 truncate">
                                <span className={cn('font-semibold', isImplementation ? 'text-indigo-600' : 'text-blue-600')}>{getCategoryLabel(project.category)}</span>
                                <span aria-hidden="true"> · </span>von {project.username}
                            </p>
                        </div>
                    </div>

                    <p className="mt-4 text-[15px] text-slate-600 leading-relaxed line-clamp-3">{project.description}</p>

                    {project.benefit && (
                        <p className="mt-3 text-sm text-slate-500 leading-relaxed line-clamp-2">
                            <span className="font-semibold text-slate-800">Gut für: </span>{project.benefit}
                        </p>
                    )}
                </button>

                {/* Fortschritt zur Zielmarke (+ optionaler Hinweis als Tooltip) */}
                {!isImplementation && (
                    <div className="relative px-5 sm:px-6 mt-5">
                        <div className="flex items-center justify-between gap-3 text-xs mb-2 min-h-[24px]">
                            {goalReached ? (
                                <span className="inline-flex items-center gap-1.5 font-semibold px-2.5 py-1 rounded-full bg-gradient-to-r from-blue-600 to-violet-600 text-white">
                                    <Trophy className="w-3.5 h-3.5" aria-hidden="true" /> Ziel erreicht
                                </span>
                            ) : hasVoted ? (
                                <span className="font-semibold text-slate-700">{votes} von {voteGoal} Stimmen</span>
                            ) : (
                                <span className="inline-flex items-center gap-1.5 text-slate-500">
                                    <Target className="w-3.5 h-3.5 text-indigo-500" aria-hidden="true" /> Ziel: {voteGoal} Stimmen
                                </span>
                            )}
                            {project.admin_note && <NoteTip id={`note-${project.id}`} note={project.admin_note} />}
                        </div>
                        <div
                            className="h-1.5 rounded-full bg-slate-100 overflow-hidden"
                            role={hasVoted ? 'progressbar' : undefined}
                            aria-hidden={hasVoted ? undefined : true}
                            aria-valuemin={0} aria-valuemax={voteGoal} aria-valuenow={hasVoted ? votes : undefined}
                            aria-label={hasVoted ? `${votes} von ${voteGoal} Stimmen bis zur Umsetzungsliste` : undefined}
                        >
                            {(hasVoted || goalReached) && (
                                <motion.div
                                    className="h-full rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${goalPercent}%` }}
                                    transition={{ duration: 0.8, ease: 'easeOut' }}
                                />
                            )}
                        </div>
                    </div>
                )}

                {/* Aktionen */}
                <div className="flex items-center gap-2 p-4 sm:px-6 mt-4">
                    <AnimatePresence mode="wait" initial={false}>
                        {isImplementation ? (
                            <motion.button
                                key="impl" type="button"
                                onClick={() => navigate('/progress')}
                                className="inline-flex items-center gap-2 min-h-[44px] px-4 rounded-full bg-indigo-50 text-indigo-700 text-sm font-semibold hover:bg-indigo-100 transition-colors"
                            >
                                <Wrench className="w-4 h-4" aria-hidden="true" /> In Umsetzung · Status
                            </motion.button>
                        ) : !hasVoted ? (
                            showConfirm ? (
                                <motion.div key="confirm" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                                    <button
                                        type="button" onClick={confirmVote} disabled={isVoting}
                                        className="btn-primary inline-flex items-center gap-1.5 !min-h-[44px] !px-4 !py-0 text-sm !rounded-full"
                                    >
                                        {isVoting ? 'Zähle …' : <><Check className="w-4 h-4" aria-hidden="true" /> Stimme geben</>}
                                    </button>
                                    <button
                                        type="button" onClick={() => setShowConfirm(false)} disabled={isVoting}
                                        className="min-h-[44px] px-3 rounded-full text-sm font-semibold text-slate-500 hover:text-slate-800"
                                    >
                                        Abbrechen
                                    </button>
                                </motion.div>
                            ) : (
                                <motion.button
                                    key="vote" type="button"
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    onClick={handleInitialVoteClick}
                                    disabled={isGlobalPhaseReview}
                                    className="inline-flex items-center gap-2 min-h-[44px] px-4 rounded-full ring-1 ring-blue-200 bg-blue-50/60 text-blue-700 text-sm font-semibold hover:bg-blue-100 active:scale-[0.97] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    <ThumbsUp className="w-4 h-4" aria-hidden="true" /> Unterstützen
                                </motion.button>
                            )
                        ) : (
                            <motion.div
                                key="voted"
                                initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                                className="inline-flex items-center gap-2 min-h-[44px] px-4 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold"
                            >
                                <Heart className="w-4 h-4 fill-current" aria-hidden="true" />
                                <motion.span key={votes} initial={{ scale: 1.3 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 15 }}>
                                    {votes} Stimmen
                                </motion.span>
                                <span className="sr-only">{alreadyCounted ? '– bereits gezählt' : '– du hast abgestimmt'}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="ml-auto flex items-center">
                        <button
                            type="button" onClick={open}
                            className={cn('min-h-[44px] px-3 rounded-full text-sm font-semibold text-slate-600 hover:text-blue-700 hover:bg-slate-50 transition-colors', showConfirm && 'hidden sm:inline-block')}
                        >
                            Mehr lesen
                        </button>
                        <button
                            type="button" onClick={handleShare}
                            className="relative w-11 h-11 inline-flex items-center justify-center rounded-full text-slate-400 hover:text-blue-700 hover:bg-slate-50 transition-colors"
                            aria-label="Idee teilen"
                        >
                            <Share2 className="w-[18px] h-[18px]" aria-hidden="true" />
                            {shareSuccess && (
                                <motion.span
                                    initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                                    className="absolute -top-8 right-0 text-xs bg-emerald-600 text-white px-2 py-1 rounded-md whitespace-nowrap"
                                >
                                    Link kopiert
                                </motion.span>
                            )}
                        </button>
                    </div>
                </div>
            </motion.article>
        </>
    );
}

/**
 * Kleiner "Hinweis"-Knopf mit Tooltip.
 * Desktop: Hover oder Tastatur-Fokus. Handy: antippen (nochmal tippen schließt).
 * Öffnet nach oben innerhalb der Karte, damit nichts abgeschnitten wird.
 */
function NoteTip({ id, note }) {
    const [open, setOpen] = useState(false);
    return (
        <>
            <button
                type="button"
                aria-expanded={open}
                aria-controls={id}
                onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
                onMouseEnter={() => setOpen(true)}
                onMouseLeave={() => setOpen(false)}
                onFocus={() => setOpen(true)}
                onBlur={() => setOpen(false)}
                onKeyDown={(e) => { e.stopPropagation(); if (e.key === 'Escape') setOpen(false); }}
                className="shrink-0 inline-flex items-center gap-1 min-h-[32px] -my-1.5 px-2 rounded-full text-xs font-semibold text-blue-600 hover:bg-blue-50 transition-colors"
            >
                <Info className="w-3.5 h-3.5" aria-hidden="true" /> Hinweis
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div
                        id={id}
                        role="tooltip"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        transition={{ duration: 0.15 }}
                        onClick={(e) => e.stopPropagation()}
                        className="absolute left-0 right-0 bottom-full mb-2 z-30 p-4 rounded-2xl bg-white shadow-xl shadow-slate-900/10 ring-1 ring-slate-200 text-left"
                    >
                        <p className="text-xs font-semibold text-blue-700 mb-1">Hinweis von Andi</p>
                        <p className="text-xs text-slate-600 leading-relaxed">{note}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
