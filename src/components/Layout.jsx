import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Menu, X, ArrowRight, Activity, Award } from 'lucide-react';
import { cn } from '../utils/cn';
import { supabase } from '../lib/supabase';
import AntigravityCursorEffect from './AntigravityCursorEffect';

const Navbar = ({ currentPhase, activeProjectTitle, activeProjectId }) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location.pathname]);

    const navLinks = [
        { path: '/', label: 'Startseite' },
        { path: '/voting', label: 'Abstimmung' },
        ...(activeProjectId ? [{ path: '/progress', label: 'Umsetzung', isStatus: true }] : []),
        { path: '/apps', label: 'Apps & Community', isApps: true },
        { path: '/projects', label: 'Showcase', isShowcase: true },
        { path: '/faq', label: 'FAQ' }
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <header className="fixed top-0 w-full z-40 flex flex-col">
            {/* Phase Banner - Jetzt voll mobil-optimiert (flex-col auf Mobile, flex-row auf Desktop) */}
            {currentPhase === 'implementation' && activeProjectTitle && (
                <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-3 px-4 text-center text-xs sm:text-sm font-semibold relative z-50 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 shadow-sm border-b border-blue-500/30">
                    <div className="flex items-center justify-center gap-2">
                        <span className="relative flex h-2 w-2 shrink-0">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <span>Wir setzen aktuell das Projekt <strong>{activeProjectTitle}</strong> um!</span>
                    </div>
                    <Link to="/progress" className="underline hover:text-blue-100 inline-flex items-center gap-1 font-bold mt-1 sm:mt-0">
                        Live-Status <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>
            )}

            {/* Review Phase Info Banner - Mobil optimiert */}
            {currentPhase === 'review' && (
                <div className="bg-amber-500 text-slate-950 py-3 px-4 text-center text-xs sm:text-sm font-semibold relative z-50 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 shadow-sm border-b border-amber-400">
                    <div className="flex items-center justify-center gap-2">
                        <span className="relative flex h-2 w-2 shrink-0">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-900 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-950"></span>
                        </span>
                        <span>Abstimmungsrunde beendet! Wir sichten aktuell alle Ideen & werten die Stimmen aus.</span>
                    </div>
                </div>
            )}

            {/* Beta-Test Banner */}
            {currentPhase === 'beta' && activeProjectTitle && (
                <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white py-3 px-4 text-center text-xs sm:text-sm font-medium tracking-wide relative z-50 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 shadow-sm border-b border-purple-700/30">
                    <div className="flex items-center justify-center gap-2">
                        <span className="relative flex h-2 w-2 shrink-0">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                        </span>
                        <span><strong>{activeProjectTitle}</strong> ist jetzt als BETA zum Testen freigegeben!</span>
                    </div>
                    <Link to="/apps" className="inline-flex items-center gap-1 font-semibold underline decoration-2 underline-offset-2 hover:text-fuchsia-100 mt-1 sm:mt-0">
                        Jetzt testen & Feedback geben <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>
            )}

            {/* Main Navbar container */}
            <nav className="w-full bg-white/85 backdrop-blur-md border-b border-gray-100/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        {/* Logo */}
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
                            <span className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                                GoodVibes
                                {currentPhase === 'implementation' && (
                                    <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold border border-blue-200 uppercase tracking-wider hidden sm:inline-block">
                                        Umsetzung
                                    </span>
                                )}
                                {currentPhase === 'beta' && (
                                    <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold border border-amber-200 uppercase tracking-wider hidden sm:inline-block">
                                        Beta
                                    </span>
                                )}
                            </span>
                        </Link>

                        {/* Desktop Links */}
                        <div className="hidden md:flex items-center space-x-8">
                            {navLinks.map(link => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={cn(
                                        "text-sm font-medium transition-colors py-2 relative",
                                        isActive(link.path) 
                                            ? "text-blue-600" 
                                            : "text-slate-500 hover:text-slate-900",
                                        link.isStatus && "text-indigo-600 font-semibold flex items-center gap-1",
                                        link.isShowcase && "text-slate-600 flex items-center gap-1"
                                    )}
                                >
                                    {link.isStatus && <Activity className="w-4 h-4 text-indigo-500 animate-pulse" />}
                                    {link.isShowcase && <Award className="w-4 h-4 text-yellow-600" />}
                                    {link.label}
                                    {isActive(link.path) && (
                                        <motion.span
                                            layoutId="activeNavLine"
                                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"
                                            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                        />
                                    )}
                                </Link>
                            ))}
                            <Link to="/submission" className="btn-primary flex items-center text-sm shadow-blue-500/20 hover:shadow-blue-500/30">
                                Idee einreichen <ArrowRight className="w-4 h-4 ml-2" />
                            </Link>
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden flex items-center z-50">
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="p-2 rounded-xl text-slate-600 hover:bg-gray-100 transition-colors focus:outline-none"
                                aria-label="Menu"
                            >
                                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation Drawer */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.25, ease: 'easeInOut' }}
                            className="md:hidden border-t border-gray-100 bg-white shadow-xl max-h-[85vh] overflow-y-auto"
                        >
                            <div className="px-4 pt-4 pb-8 space-y-3">
                                {navLinks.map(link => (
                                    <Link
                                        key={link.path}
                                        to={link.path}
                                        className={cn(
                                            "flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-semibold transition-all",
                                            isActive(link.path)
                                                ? "bg-blue-50 text-blue-700"
                                                : "text-slate-600 hover:bg-gray-50 hover:text-slate-900"
                                        )}
                                    >
                                        {link.isStatus && <Activity className="w-5 h-5 text-indigo-500 animate-pulse" />}
                                        {link.isShowcase && <Award className="w-5 h-5 text-yellow-600" />}
                                        {link.label}
                                    </Link>
                                ))}
                                <div className="pt-4 border-t border-gray-100 px-2">
                                    <Link
                                        to="/submission"
                                        className="btn-primary w-full flex items-center justify-center py-3.5 text-base shadow-blue-500/20"
                                    >
                                        Idee einreichen <ArrowRight className="w-5 h-5 ml-2" />
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>
        </header>
    );
};

const Footer = () => (
    <footer className="w-full py-12 mt-auto border-t border-gray-100 bg-white/50 backdrop-blur-sm text-slate-500 relative z-10">
        <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="mb-6 flex flex-wrap justify-center gap-6 sm:gap-8 text-sm font-medium">
                <Link to="/apps" className="hover:text-blue-600 transition-colors">Apps & Community</Link>
                <Link to="/faq" className="hover:text-blue-600 transition-colors">FAQ</Link>
                <Link to="/privacy" className="hover:text-blue-600 transition-colors">Datenschutz</Link>
                <Link to="/imprint" className="hover:text-blue-600 transition-colors">Impressum</Link>
            </div>
            <p className="text-xs text-slate-400">© {new Date().getFullYear()} GoodVibes. Non-profit Open Source Initiative.</p>
        </div>
    </footer>
);

export default function Layout({ children }) {
    const [currentPhase, setCurrentPhase] = useState('submission');
    const [activeProjectId, setActiveProjectId] = useState('');
    const [activeProjectTitle, setActiveProjectTitle] = useState('');

    const fetchAppSettings = async () => {
        try {
            const { data: settings } = await supabase.from('app_settings').select('*');
            if (settings) {
                const phaseSetting = settings.find(s => s.key === 'current_phase');
                const projectSetting = settings.find(s => s.key === 'active_project_id');

                const phase = phaseSetting ? phaseSetting.value : 'submission';
                const projId = projectSetting ? projectSetting.value : '';

                setCurrentPhase(phase);
                setActiveProjectId(projId);

                if (projId) {
                    const { data: proj } = await supabase.from('projects').select('title').eq('id', projId);
                    if (proj && proj.length > 0) {
                        setActiveProjectTitle(proj[0].title);
                    } else {
                        setActiveProjectTitle('');
                    }
                } else {
                    setActiveProjectTitle('');
                }
            }
        } catch (err) {
            console.error("Error loading layout config:", err);
        }
    };

    useEffect(() => {
        fetchAppSettings();
        window.addEventListener('gv_settings_updated', fetchAppSettings);
        return () => window.removeEventListener('gv_settings_updated', fetchAppSettings);
    }, []);

    // SOTA Mobile-Fix: Großzügigeres Padding-Top (pt-44) auf Mobile für zweizeilige Banner
    const paddingTopClass = ((currentPhase === 'implementation' || currentPhase === 'beta') && activeProjectTitle) || currentPhase === 'review'
        ? "pt-44 sm:pt-32 md:pt-36"
        : "pt-24 md:pt-28";

    return (
        <div className="min-h-screen flex flex-col relative bg-slate-50 selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden text-slate-900">
            {/* Antigravity background animation during implementation phase */}
            {currentPhase === 'implementation' ? (
                <AntigravityCursorEffect />
            ) : (
                /* Gentle background blobs for other phases - NEU: z-[-10] verhindert Ebenen-Fehler */
                <div className="fixed inset-0 z-[-10] overflow-hidden pointer-events-none">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))]" />
                    <motion.div
                        animate={{
                            x: [0, 50, -50, 0],
                            y: [0, -30, 30, 0],
                            scale: [1, 1.1, 0.9, 1],
                            opacity: [0.3, 0.5, 0.3]
                        }}
                        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-blue-200/40 rounded-full blur-[120px] mix-blend-multiply"
                    />
                    <motion.div
                        animate={{
                            x: [0, -30, 30, 0],
                            y: [0, 50, -50, 0],
                            scale: [1, 1.2, 0.8, 1],
                            opacity: [0.3, 0.6, 0.3]
                        }}
                        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                        className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-200/40 rounded-full blur-[100px] mix-blend-multiply"
                    />
                </div>
            )}

            <Navbar 
                currentPhase={currentPhase} 
                activeProjectTitle={activeProjectTitle} 
                activeProjectId={activeProjectId} 
            />
            
            {/* FIX: z-10 entfernt, damit Modals global über die Navbar (z-40) gelagert werden können */}
            <main className={cn("flex-grow pb-12 px-4 relative w-full", paddingTopClass)}>
                {children}
            </main>

            <Footer />
        </div>
    );
}
