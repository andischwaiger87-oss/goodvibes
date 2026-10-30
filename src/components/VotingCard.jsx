import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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

    // Detail Modal
    const DetailModal = () => (
        <AnimatePresence>
            {showDetail && (
                <div className="fixed inset-0 z-[9999] flex items-start sm:items-center justify-center pt-24 sm:pt-4 px-4 pb-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                    >
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                            <h2 className="text-xl font-bold text-slate-900 pr-8">{project.title}</h2>
                            <button onClick={() => setShowDetail(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden">
                                    <img src={projectAvatarUrl(project)} alt="" className="w-full h-full" />
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-900">{project.username}</p>
                                    <p className="text-sm text-slate-500">{getCategoryLabel(project.category)}</p>
                                </div>
                            </div>

                            {project.admin_note && (
                                <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50/70 border border-blue-100">
                                    <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" aria-hidden="true" />
                                    <div>
                                        <h3 className="text-sm font-semibold text-blue-700 mb-1">Hinweis von Andi</h3>
                                        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{project.admin_note}</p>
                                    </div>
                                </div>
                            )}

                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-blue-600 mb-3">Die Idee</h3>
                                <RichText text={project.description} size="sm" />
                            </div>

                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-blue-600 mb-3">Wem hilft das?</h3>
                                <div className="relative pl-4">
                                    <span aria-hidden="true" className="absolute left-0 top-1 bottom-1 w-1 rounded-full bg-gradient-to-b from-blue-500 to-violet-500" />
                                    {project.benefit ? <RichText text={project.benefit} size="sm" /> : <p className="text-sm text-slate-500">Keine Angabe</p>}
                                </div>
                            </div>

                            {(hasVoted || isImplementation) && (
                                <div className="text-center py-4 bg-blue-50 rounded-xl border border-blue-100">
                                    <p className="text-blue-700 font-semibold flex items-center justify-center gap-2">
                                        <Heart className="w-5 h-5 fill-current" /> {votes} Stimmen
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-gray-100 flex gap-3 sticky bottom-0 bg-white">
                            {isImplementation ? (
                                <button
                                    onClick={() => { setShowDetail(false); navigate('/progress'); }}
                                    className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-semibold flex items-center justify-center gap-2"
                                >
                                    <Wrench className="w-5 h-5 animate-pulse" /> Live-Status ansehen
                                </button>
                            ) : !hasVoted && !isRejected ? (
                                <button
                                    onClick={() => { setShowDetail(false); handleInitialVoteClick(); }}
                                    disabled={isGlobalPhaseReview}
                                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ThumbsUp className="w-5 h-5" /> Unterstützen
                                </button>
                            ) : hasVoted ? (
                                <div className="flex-1 px-4 py-3 bg-green-50 text-green-700 rounded-xl font-semibold flex items-center justify-center gap-2 border border-green-200">
                                    <Check className="w-5 h-5" /> {alreadyCounted ? 'Bereits abgestimmt – danke!' : 'Du hast abgestimmt!'}
                                </div>
                            ) : null}
                            <button
                                onClick={handleShare}
                                disabled={isRejected}
                                className="px-4 py-3 bg-gray-100 text-slate-700 rounded-xl hover:bg-gray-200 font-medium flex items-center gap-2"
                            >
                                <Share2 className="w-5 h-5" /> Teilen
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    // Rejected Card UI
    if (isRejected && isOwner) {
        return (
            <>
                <DetailModal />
                <motion.div
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="elgato-card flex flex-col h-full overflow-hidden bg-red-50 border-2 border-red-200"
                >
                    <div className="bg-red-600 text-white px-6 py-3 flex items-center space-x-3">
                        <XCircle className="w-5 h-5 flex-shrink-0" />
                        <span className="font-bold text-sm">Deine Idee wurde abgelehnt</span>
                    </div>

                    <div className="p-6 flex items-start space-x-4">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0 opacity-50">
                            <img src={projectAvatarUrl(project)} alt="" className="w-full h-full" />
                        </div>
                        <div className="flex-grow min-w-0">
                            <h3 className="font-bold text-lg text-slate-600 leading-tight mb-1 line-clamp-2 pr-2 line-through">{project.title}</h3>
                            <p className="text-xs font-medium text-slate-400">von {project.username}</p>
                        </div>
                    </div>

                    <div className="px-5 sm:px-6 pb-5 sm:pb-6 flex-grow">
                        <div className="p-4 rounded-lg bg-white border border-red-200">
                            <p className="text-xs text-slate-500 mb-2 flex items-center">
                                <AlertTriangle className="w-4 h-4 mr-2 text-red-500" />
                                <strong className="text-red-600">Begründung:</strong>
                            </p>
                            <p className="text-sm text-slate-700 leading-relaxed">
                                {project.rejection_reason || 'Keine Begründung angegeben.'}
                            </p>
                        </div>
                    </div>

                    <div className="px-6 py-4 border-t border-red-200 bg-red-100/50 flex items-center justify-between mt-auto">
                        <span className="text-xs text-red-600 font-medium">
                            Abstimmung und Teilen nicht möglich
                        </span>
                    </div>
                </motion.div>
            </>
        );
    }

    if (isRejected && !isOwner) {
        return null;
    }

    // Normal Active Card or Implementation Card
    const open = () => setShowDetail(true);
    return (
        <>
            <DetailModal />
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
