import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThumbsUp, Heart, Share2, Check } from 'lucide-react';

export default function VotingCard({ project, onVote }) {
    const [hasVoted, setHasVoted] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [votes, setVotes] = useState(project.votes || 0);

    const handleInitialVoteClick = () => {
        if (!hasVoted) {
            setShowConfirm(true);
        }
    };

    const confirmVote = () => {
        // Simulate secure voting call
        setShowConfirm(false);
        setHasVoted(true);
        setVotes(prev => prev + 1);
        onVote(project.id);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="elgato-card flex flex-col h-full overflow-hidden group"
        >
            {/* Header / Avatar */}
            <div className="p-6 flex items-start space-x-4">
                <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0">
                    <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${project.avatarSeed}`} alt="Avatar" className="w-full h-full" />
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
                                        className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-md flex items-center shadow-sm transition-colors"
                                    >
                                        <Check className="w-3 h-3 mr-1.5" /> Bestätigen
                                    </button>
                                    <button
                                        onClick={() => setShowConfirm(false)}
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
                <button className="text-slate-400 hover:text-slate-900 transition-colors">
                    <Share2 className="w-4 h-4" />
                </button>
            </div>
        </motion.div>
    );
}
