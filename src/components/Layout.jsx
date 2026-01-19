import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Menu, X, ArrowRight } from 'lucide-react';
import { cn } from '../utils/cn';

const Navbar = () => {
    return (
        <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <Link to="/" className="flex items-center space-x-3 group">
                        <div className="p-2 bg-slate-900 rounded-lg group-hover:bg-blue-600 transition-colors duration-300">
                            <Heart className="w-5 h-5 text-white fill-white" />
                        </div>
                        <span className="text-xl font-bold text-slate-900 tracking-tight">
                            GoodVibes
                        </span>
                    </Link>

                    <div className="hidden md:block">
                        <div className="ml-10 flex items-center space-x-8">
                            <Link to="/" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">
                                Startseite
                            </Link>
                            <Link to="/voting" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">
                                Voting
                            </Link>
                            <Link to="/submission" className="btn-primary flex items-center text-sm">
                                Projekt einreichen <ArrowRight className="w-4 h-4 ml-2" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

const Footer = () => (
    <footer className="w-full py-12 mt-auto border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="mb-4 flex justify-center space-x-6 text-slate-400">
                <a href="#" className="hover:text-blue-600 transition-colors">Über uns</a>
                <a href="#" className="hover:text-blue-600 transition-colors">Datenschutz</a>
                <a href="#" className="hover:text-blue-600 transition-colors">Impressum</a>
            </div>
            <p className="text-slate-500 text-sm">© {new Date().getFullYear()} GoodVibes. Non-profit Open Source Initiative.</p>
        </div>
    </footer>
);

export default function Layout({ children }) {
    return (
        <div className="min-h-screen flex flex-col relative bg-gray-50 text-slate-900 font-sans">
            {/* Subtle technical background grid removed for pure clean look, or keep very subtle */}

            <Navbar />
            <main className="flex-grow pt-24 pb-12 px-4 relative z-10">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
            <Footer />
        </div>
    );
}
