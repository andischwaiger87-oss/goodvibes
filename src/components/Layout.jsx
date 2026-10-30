import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Menu, X, ArrowRight, ChevronRight } from 'lucide-react';
import { cn } from '../utils/cn';

// Versionsnummer im Footer – bei grösseren Updates hier erhöhen.
const APP_VERSION = '2.0';
import { supabase } from '../lib/supabase';
// Der Herz-Effekt ist aufwendig: nur laden, wenn er wirklich gebraucht wird.
const AntigravityCursorEffect = lazy(() => import('./AntigravityCursorEffect'));

/** true, wenn das Geraet weniger Bewegung wuenscht (Systemeinstellung). */
function usePrefersReducedMotion() {
    const [reduced, setReduced] = useState(() =>
        typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    );
    useEffect(() => {
        const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
        if (!mq) return;
        const onChange = (e) => setReduced(e.matches);
        mq.addEventListener?.('change', onChange);
        return () => mq.removeEventListener?.('change', onChange);
    }, []);
    return reduced;
}

const Navbar = ({ currentPhase, activeProjectTitle, activeProjectId }) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();

    // Feiner Schatten unter der Navigation, sobald gescrollt wird
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location.pathname]);

    // Offenes Menue: Escape schliesst, Seite dahinter bleibt stehen
    useEffect(() => {
        if (!mobileMenuOpen) return;
        const onKey = (e) => { if (e.key === 'Escape') setMobileMenuOpen(false); };
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', onKey);
        return () => {
            document.body.style.overflow = prev;
            window.removeEventListener('keydown', onKey);
        };
    }, [mobileMenuOpen]);

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
            <a
                href="#inhalt"
                className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:bg-white focus:text-blue-700 focus:font-bold focus:px-4 focus:py-2.5 focus:rounded-xl focus:shadow-lg"
            >
                Zum Inhalt springen
            </a>
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
            <nav aria-label="Hauptnavigation" className={cn("w-full bg-white/80 backdrop-blur-xl backdrop-saturate-150 border-b transition-[box-shadow,border-color] duration-300 supports-[backdrop-filter]:bg-white/70", scrolled ? "border-slate-200/80 shadow-[0_6px_24px_-12px_rgba(15,23,42,0.18)]" : "border-transparent")}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 md:h-20">
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
                                    <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold border border-blue-200 uppercase tracking-wider hidden sm:inline-block">
                                        Beta
                                    </span>
                                )}
                            </span>
                        </Link>

                        {/* Desktop Links */}
                        <div className="hidden md:flex items-center gap-1 lg:gap-2">
                            {navLinks.map(link => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    aria-current={isActive(link.path) ? 'page' : undefined}
                                    className={cn(
                                        "text-sm font-medium transition-colors px-3 py-2 rounded-lg relative",
                                        isActive(link.path)
                                            ? "text-blue-700 bg-blue-50/80"
                                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70",
                                        link.isStatus && "text-indigo-600 font-semibold",
                                        link.isShowcase && "text-slate-600"
                                    )}
                                >
                                    {link.label}

                                </Link>
                            ))}
                            <Link to="/submission" className="btn-primary flex items-center text-sm ml-2 lg:ml-4">
                                Idee einreichen <ArrowRight className="w-4 h-4 ml-2" />
                            </Link>
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden flex items-center z-50">
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="w-11 h-11 -mr-1.5 inline-flex items-center justify-center rounded-xl text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition-colors"
                                aria-label={mobileMenuOpen ? 'Menü schließen' : 'Menü öffnen'}
                                aria-expanded={mobileMenuOpen}
                                aria-controls="mobile-menu"
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
                            id="mobile-menu"
                            className="md:hidden border-t border-slate-100 bg-white/95 backdrop-blur-xl shadow-2xl shadow-slate-900/10 max-h-[calc(100dvh-4rem)] overflow-y-auto overscroll-contain"
                        >
                            <div className="px-4 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] space-y-1">
                                {navLinks.map(link => (
                                    <Link
                                        key={link.path}
                                        to={link.path}
                                        aria-current={isActive(link.path) ? 'page' : undefined}
                                        className={cn(
                                            "flex items-center justify-between gap-3 px-4 min-h-[52px] rounded-2xl text-base font-semibold transition-colors",
                                            isActive(link.path)
                                                ? "bg-blue-50 text-blue-700"
                                                : "text-slate-700 hover:bg-slate-50 active:bg-slate-100"
                                        )}
                                    >
                                        {link.label}
                                        <ChevronRight className={cn("w-5 h-5", isActive(link.path) ? "text-blue-500" : "text-slate-300")} aria-hidden="true" />
                                    </Link>
                                ))}
                                <div className="pt-3 mt-2 border-t border-slate-100">
                                    <Link
                                        to="/submission"
                                        className="btn-primary w-full flex items-center justify-center min-h-[52px] text-base"
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
    <footer className="w-full mt-auto border-t border-slate-200/70 bg-white/60 backdrop-blur-sm text-slate-500 relative z-10">
        <div className="max-w-6xl mx-auto px-4 py-10 sm:py-12 pb-[max(2.5rem,env(safe-area-inset-bottom))]">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <Link to="/" className="flex items-center gap-2.5 text-slate-900 font-bold">
                    <span className="p-2 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl shadow-md shadow-blue-500/20">
                        <Heart className="w-4 h-4 text-white fill-white" aria-hidden="true" />
                    </span>
                    GoodVibes
                </Link>
                <nav aria-label="Fußzeile" className="flex flex-wrap justify-center gap-x-2 gap-y-1 text-sm font-medium">
                    {[
                        ['/apps', 'Apps & Community'],
                        ['/faq', 'FAQ'],
                        ['/privacy', 'Datenschutz'],
                        ['/imprint', 'Impressum'],
                    ].map(([to, label]) => (
                        <Link key={to} to={to} className="px-3 py-2.5 rounded-lg hover:text-blue-600 hover:bg-blue-50/60 transition-colors">
                            {label}
                        </Link>
                    ))}
                </nav>
            </div>
            <p className="mt-6 pt-6 border-t border-slate-200/60 text-xs text-slate-400 text-center sm:text-left">
                © {new Date().getFullYear()} GoodVibes · Gemeinnützige Open-Source-Initiative · Ohne Werbung, ohne Tracking
                <span className="ml-2 inline-flex align-middle items-center px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-600 to-violet-600 text-white text-[10px] font-semibold tracking-wide" title="Version">
                    v{APP_VERSION}
                </span>
            </p>
        </div>
    </footer>
);

export default function Layout({ children }) {
    const reducedMotion = usePrefersReducedMotion();
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
        ? "pt-40 sm:pt-32 md:pt-36"
        : "pt-20 md:pt-28";

    return (
        <div className="min-h-screen flex flex-col relative bg-slate-50 selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden text-slate-900">
            {/* Antigravity background animation during implementation phase */}
            {currentPhase === 'implementation' && !reducedMotion ? (
                <Suspense fallback={null}>
                    <AntigravityCursorEffect />
                </Suspense>
            ) : (
                /* Gentle background blobs for other phases - NEU: z-[-10] verhindert Ebenen-Fehler */
                <div className="fixed inset-0 z-[-10] overflow-hidden pointer-events-none">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))]" />
                    {/* Sanfte Farbflaechen: auf dem Handy kleiner und ohne Dauer-Animation (spart Akku) */}
                    <motion.div
                        animate={reducedMotion ? undefined : { x: [0, 40, -40, 0], y: [0, -24, 24, 0] }}
                        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -top-40 -right-40 w-[420px] h-[420px] md:w-[760px] md:h-[760px] bg-blue-200/35 rounded-full blur-[90px] md:blur-[120px] will-change-transform"
                    />
                    <motion.div
                        animate={reducedMotion ? undefined : { x: [0, -30, 30, 0], y: [0, 40, -40, 0] }}
                        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                        className="absolute -bottom-40 -left-40 w-[360px] h-[360px] md:w-[600px] md:h-[600px] bg-indigo-200/35 rounded-full blur-[80px] md:blur-[100px] will-change-transform"
                    />
                </div>
            )}

            <Navbar 
                currentPhase={currentPhase} 
                activeProjectTitle={activeProjectTitle} 
                activeProjectId={activeProjectId} 
            />
            
            {/* FIX: z-10 entfernt, damit Modals global über die Navbar (z-40) gelagert werden können */}
            <main id="inhalt" tabIndex={-1} className={cn("flex-grow pb-16 px-4 sm:px-6 relative w-full outline-none", paddingTopClass)}>
                {children}
            </main>

            <Footer />
        </div>
    );
}
