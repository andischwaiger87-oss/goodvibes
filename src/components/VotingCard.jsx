import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ThumbsUp, Heart, Share2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { cn } from '../utils/cn';

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
            className="glass-card rounded-xl overflow-hidden flex flex-col h-full"
        >
            {/* Header / Avatar */}
            <div className="p-6 pb-0 flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-slate-800 border-2 border-slate-700 overflow-hidden">
                    <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${project.avatarSeed}`} alt="Avatar" className="w-full h-full" />
                </div>
                <div>
                    <h3 className="font-bold text-lg text-white leading-tight">{project.title}</h3>
                    <p className="text-xs text-indigo-400">by {project.username}</p>
                </div>
                <div className="ml-auto">
                    <span className="text-xs font-semibold px-2 py-1 rounded bg-slate-800 text-slate-400 border border-slate-700">
                        {project.category}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 flex-grow">
                <p className="text-sm text-slate-300 mb-4 line-clamp-3">
                    {project.description}
                </p>
                <div className="p-3 rounded-lg bg-indigo-500/5 border border-indigo-500/10">
                    <p className="text-xs text-indigo-200">
                        <strong className="text-indigo-400">Impact:</strong> {project.benefit}
                    </p>
                </div>
            </div>

            {/* Actions / Blind Vote Logic */}
            <div className="p-4 bg-slate-900/50 border-t border-slate-800 flex items-center justify-between">

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
                                        className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-bold rounded flex items-center"
                                    >
                                        <Check className="w-3 h-3 mr-1" /> Confirm
                                    </button>
                                    <button
                                        onClick={() => setShowConfirm(false)}
                                        className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs rounded"
                                    >
                                        Cancel
                                    </button>
                                </motion.div>
                            ) : (
                                <motion.button
                                    key="vote"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    onClick={handleInitialVoteClick}
                                    className="flex items-center space-x-2 text-slate-400 hover:text-indigo-400 transition-colors group"
                                >
                                    <div className="p-2 rounded-full bg-slate-800 group-hover:bg-indigo-500/20 transition-colors">
                                        <ThumbsUp className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                    </div>
                                    <span className="text-sm font-medium">Support this</span>
                                </motion.button>
                            )
                        ) : (
                            <motion.div
                                key="voted"
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="flex items-center space-x-2 text-indigo-400"
                            >
                                <div className="p-2 rounded-full bg-indigo-500/20">
                                    <Heart className="w-5 h-5 fill-current" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold">{votes} Votes</span>
                                    <span className="text-[10px] text-slate-500">Thanks for voting!</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Share Button */}
                <button className="text-slate-500 hover:text-white transition-colors">
                    <Share2 className="w-4 h-4" />
                </button>
            </div>
        </motion.div>
    );
}

// Helper icon
function Check({ className }) {
    return (
        <svg
            className={className}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
        >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
    );
}
