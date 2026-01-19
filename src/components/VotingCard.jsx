import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThumbsUp, Heart, Share2, Check, XCircle, AlertTriangle } from 'lucide-react';
import { getDeviceId, hasAlreadyVotedLocal, recordVoteLocal } from '../utils/security';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export default function VotingCard({ project, onVote }) {
    const [hasVoted, setHasVoted] = useState(hasAlreadyVotedLocal(project.id));
    const [showConfirm, setShowConfirm] = useState(false);
    const [votes, setVotes] = useState(project.votes || 0);
    const [isVoting, setIsVoting] = useState(false);
    const [shareSuccess, setShareSuccess] = useState(false);

    const isRejected = project.status === 'rejected';
    const isOwner = project.owner_id === getDeviceId();

    const handleInitialVoteClick = () => {
        if (!hasVoted && !isRejected) {
            setShowConfirm(true);
        }
    };

    const confirmVote = async () => {
        setIsVoting(true);

        const deviceId = getDeviceId();
        recordVoteLocal(project.id);

        if (isSupabaseConfigured()) {
            try {
                const { error } = await supabase.rpc('increment_vote', { project_id: project.id });
                if (error) {
                    console.error("Vote error:", error);
                }
            } catch (err) {
                console.error("Vote exception:", err);
            }
        }

        setShowConfirm(false);
        setHasVoted(true);
        setVotes(prev => prev + 1);
        onVote(project.id);
        setIsVoting(false);
    };

    const handleShare = async () => {
        if (isRejected) return;

        const shareData = {
            title: `GoodVibes: ${project.title}`,
            text: `Schau dir diese Idee an: "${project.title}" – ${project.description.substring(0, 100)}...`,
            url: window.location.href
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                // Fallback: Copy to clipboard
                await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
                setShareSuccess(true);
                setTimeout(() => setShareSuccess(false), 2000);
            }
        } catch (err) {
            console.log('Share cancelled or failed:', err);
        }
    };

    // Rejected Card UI
    if (isRejected && isOwner) {
        return (
            <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="elgato-card flex flex-col h-full overflow-hidden bg-red-50 border-2 border-red-200"
            >
                {/* Rejection Banner */}
                <div className="bg-red-600 text-white px-6 py-3 flex items-center space-x-3">
                    <XCircle className="w-5 h-5 flex-shrink-0" />
                    <span className="font-bold text-sm">Deine Idee wurde abgelehnt</span>
                </div>

                {/* Header / Avatar */}
                <div className="p-6 flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0 opacity-50">
                        <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${project.avatar_seed || project.id}`} alt="Avatar" className="w-full h-full" />
                    </div>
                    <div className="flex-grow min-w-0">
                        <h3 className="font-bold text-lg text-slate-600 leading-tight mb-1 truncate line-through">{project.title}</h3>
                        <p className="text-xs font-medium text-slate-400">von {project.username}</p>
                    </div>
                </div>

                {/* Rejection Reason */}
                <div className="px-6 pb-6 flex-grow">
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

                {/* Disabled Actions */}
                <div className="px-6 py-4 border-t border-red-200 bg-red-100/50 flex items-center justify-between mt-auto">
                    <span className="text-xs text-red-600 font-medium">
                        Abstimmung und Teilen nicht möglich
                    </span>
                </div>
            </motion.div>
        );
    }

    // Don't render rejected cards for non-owners at all
    if (isRejected && !isOwner) {
        return null;
    }

    // Normal Active Card
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="elgato-card flex flex-col h-full overflow-hidden group bg-white"
        >
            {/* Header / Avatar */}
            <div className="p-6 flex items-start space-x-4">
                <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0">
                    <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${project.avatar_seed || project.id}`} alt="Avatar" className="w-full h-full" />
                </div>
                <div className="flex-grow min-w-0">
                    <h3 className="font-bold text-lg text-slate-900 leading-tight mb-1 truncate">{project.title}</h3>
                    <p className="text-xs font-medium text-slate-500">von {project.username}</p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded bg-blue-50 text-blue-700 border border-blue-100">
                    {project.category}
                </span>
            </div>

            {/* Content */}
            <div className="px-6 pb-6 flex-grow">
                <p className="text-sm text-slate-600 mb-5 leading-relaxed line-clamp-3">
                    {project.description}
                </p>

                <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
                    <p className="text-xs text-slate-500 leading-relaxed">
                        <strong className="text-slate-900 block mb-1">Gut für:</strong>
                        {project.benefit}
                    </p>
                </div>
            </div>

            {/* Actions / Blind Vote Logic */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between mt-auto">

                {/* Vote Button Area */}
                <div className="relative">
                    <AnimatePresence mode="wait">
                        {!hasVoted ? (
                            showConfirm ? (
                                <motion.div
                                    key="confirm"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    className="flex items-center space-x-2"
                                >
                                    <button
                                        onClick={confirmVote}
                                        disabled={isVoting}
                                        className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-md flex items-center shadow-sm transition-colors disabled:opacity-50"
                                    >
                                        {isVoting ? '...' : <><Check className="w-3 h-3 mr-1.5" /> Bestätigen</>}
                                    </button>
                                    <button
                                        onClick={() => setShowConfirm(false)}
                                        disabled={isVoting}
                                        className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-slate-600 text-xs font-semibold rounded-md transition-colors"
                                    >
                                        Abbruch
                                    </button>
                                </motion.div>
                            ) : (
                                <motion.button
                                    key="vote"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    onClick={handleInitialVoteClick}
                                    className="flex items-center space-x-2 text-slate-500 hover:text-blue-600 transition-colors group/btn"
                                >
                                    <div className="p-2 rounded-lg bg-white border border-gray-200 group-hover/btn:border-blue-200 group-hover/btn:bg-blue-50 transition-all">
                                        <ThumbsUp className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-semibold">Unterstützen</span>
                                </motion.button>
                            )
                        ) : (
                            <motion.div
                                key="voted"
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="flex items-center space-x-3 text-blue-600"
                            >
                                <div className="p-2 rounded-lg bg-blue-50 border border-blue-100">
                                    <Heart className="w-4 h-4 fill-current" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-slate-900">{votes} Stimmen</span>
                                    <span className="text-[10px] uppercase tracking-wide font-semibold text-slate-400">Gestimmt</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Share Button */}
                <button
                    onClick={handleShare}
                    className="text-slate-400 hover:text-slate-900 transition-colors relative"
                    title="Teilen"
                >
                    <Share2 className="w-4 h-4" />
                    {shareSuccess && (
                        <motion.span
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="absolute -top-8 -left-4 text-xs bg-green-600 text-white px-2 py-1 rounded whitespace-nowrap"
                        >
                            Kopiert!
                        </motion.span>
                    )}
                </button>
            </div>
        </motion.div>
    );
}
