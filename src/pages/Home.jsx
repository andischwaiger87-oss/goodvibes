import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Lightbulb, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

const PhaseBadge = () => (
    <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium mb-6">
        <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
        </span>
        <span>Current Phase: Submission</span>
    </div>
);

export default function Home() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="max-w-3xl mx-auto"
            >
                <PhaseBadge />

                <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-8 text-white">
                    Turn your <span className="text-gradient">Social Vision</span><br />
                    into Reality.
                </h1>

                <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                    GoodVibes is a fair, secure, and anonymous platform to launch non-profit digital projects.
                    Submit your idea, get community support, and see it built for free.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                    <Link
                        to="/submission"
                        className="group relative inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold text-white bg-indigo-600 rounded-full hover:bg-indigo-500 transition-all shadow-[0_0_20px_-5px_rgba(79,70,229,0.5)] hover:shadow-[0_0_25px_-5px_rgba(79,70,229,0.6)]"
                    >
                        Submit Your Idea
                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>

                    <Link
                        to="/how-it-works"
                        className="inline-flex items-center justify-center px-8 py-3.5 text-base font-medium text-slate-300 hover:text-white transition-colors"
                    >
                        How it works
                    </Link>
                </div>
            </motion.div>

            {/* Feature Grid */}
            <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full px-4">
                {[
                    {
                        icon: <Lightbulb className="w-6 h-6" />,
                        title: "Submit an Idea",
                        desc: "Share your vision for a social app. No account required."
                    },
                    {
                        icon: <Activity className="w-6 h-6" />,
                        title: "Fair Voting",
                        desc: "Secure, anonymous community voting decides what gets built."
                    },
                    {
                        icon: <Heart className="w-6 h-6" />, // Using Heart meant importing it, but I didn't import basic Heart here, will fix import
                        title: "Free Development",
                        desc: "The winning project is professionally developed at zero cost."
                    }
                ].map((feature, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 + idx * 0.1 }}
                        className="glass-card p-6 rounded-2xl"
                    >
                        <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 mb-4">
                            {feature.icon}
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                        <p className="text-slate-400">{feature.desc}</p>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

// Quick fix for missing Heart import in the mapped array above
import { Heart } from 'lucide-react';
