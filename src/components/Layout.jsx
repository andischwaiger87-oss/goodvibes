import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Menu, X, ArrowRight } from 'lucide-react';
import { cn } from '../utils/cn';

const Navbar = () => {
    return (
        <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <Link to="/" className="flex items-center space-x-3 group cursor-pointer z-50">
                        <motion.div
                            animate={{
                                scale: [1, 1.15, 1],
                                rotate: [0, 5, -5, 0]
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="p-2.5 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/30"
                        >
                            <Heart className="w-5 h-5 text-white fill-white" />
                        </motion.div>
                        <span className="text-xl font-bold text-slate-900 tracking-tight">
                            GoodVibes
                        </span>
                    </Link>

                    <div className="hidden md:block">
                        <div className="ml-10 flex items-center space-x-8">
                            <Link to="/" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
                                Startseite
                            </Link>
                            <Link to="/voting" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
                                Abstimmung
                            </Link>
                            <Link to="/faq" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
                                FAQ
                            </Link>
                            <Link to="/submission" className="btn-primary flex items-center text-sm shadow-blue-500/20 hover:shadow-blue-500/30">
                                Idee einreichen <ArrowRight className="w-4 h-4 ml-2" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

const Footer = () => (
    <footer className="w-full py-12 mt-auto border-t border-gray-100 bg-white/50 backdrop-blur-sm text-slate-500">
        <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="mb-6 flex justify-center space-x-8 text-sm font-medium">
                <Link to="/faq" className="hover:text-blue-600 transition-colors">FAQ</Link>
                <Link to="/privacy" className="hover:text-blue-600 transition-colors">Datenschutz</Link>
                <Link to="/imprint" className="hover:text-blue-600 transition-colors">Impressum</Link>
            </div>
            <p className="text-xs text-slate-400">© {new Date().getFullYear()} GoodVibes. Non-profit Open Source Initiative.</p>
        </div>
    </footer>
);

export default function Layout({ children }) {
    return (
        <div className="min-h-screen flex flex-col relative bg-slate-50 selection:bg-blue-100 selection:text-blue-900 overflow-hidden text-slate-900">
            {/* Gentle, Friendlier Background Blobs */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))]" />
                <motion.div
                    animate={{
                        x: [0, 50, -50, 0],
                        y: [0, -30, 30, 0],
                        scale: [1, 1.1, 0.9, 1],
                        opacity: [0.3, 0.5, 0.3]
                    }}
                    transition={{
                        duration: 15,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-blue-200/40 rounded-full blur-[120px] mix-blend-multiply"
                />
                <motion.div
                    animate={{
                        x: [0, -30, 30, 0],
                        y: [0, 50, -50, 0],
                        scale: [1, 1.2, 0.8, 1],
                        opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 2
                    }}
                    className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-200/40 rounded-full blur-[100px] mix-blend-multiply"
                />
                <motion.div
                    animate={{
                        x: [0, 40, -40, 0],
                        y: [0, -40, 40, 0],
                        opacity: [0.2, 0.4, 0.2]
                    }}
                    transition={{
                        duration: 18,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 5
                    }}
                    className="absolute top-[40%] left-[30%] w-[500px] h-[500px] bg-indigo-200/30 rounded-full blur-[90px] mix-blend-multiply"
                />
            </div>

            <Navbar />
            <main className="flex-grow pt-24 pb-12 px-4 relative z-10 w-full">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
            <Footer />
        </div>
    );
}
