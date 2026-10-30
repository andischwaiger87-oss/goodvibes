import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { Search, LayoutGrid, ShieldCheck, Heart, MessagesSquare } from 'lucide-react';
import AppCard from '../components/AppCard';
import { categoryLabels } from '../utils/categories';
import { cn } from '../utils/cn';
import { useSeo } from '../components/Seo';
import { CardGridSkeleton } from '../components/Skeleton';

export default function Apps() {
    useSeo({
        title: 'Apps & Community — GoodVibes',
        description: 'Alle GoodVibes-Apps im Überblick: ausprobieren, bewerten, Wünsche äußern und Fehler melden — anonym und ohne Anmeldung.',
    });

    const [apps, setApps] = useState([]);
    const [postCounts, setPostCounts] = useState({});
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState('all');

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data: appData } = await supabase.from('apps').select('id, slug, name, tagline, category, icon_emoji, accent, version, is_beta, status, live_url, rating_sum, rating_count, sort_order, created_at').order('sort_order', { ascending: true });
            const { data: postData } = await supabase.from('app_posts').select('*').eq('status', 'published');

            const counts = {};
            (postData || []).forEach((p) => { counts[p.app_id] = (counts[p.app_id] || 0) + 1; });
            setPostCounts(counts);
            setApps(appData || []);
        } catch (err) {
            console.error('Fehler beim Laden der Apps:', err);
        } finally {
            setLoading(false);
        }
    };

    const filtered = useMemo(() => {
        return apps.filter((a) => {
            const matchQuery = !query.trim()
                || a.name.toLowerCase().includes(query.toLowerCase())
                || (a.tagline || '').toLowerCase().includes(query.toLowerCase());
            const matchCat = category === 'all' || a.category === category;
            return matchQuery && matchCat;
        });
    }, [apps, query, category]);

    return (
        <div className="max-w-6xl mx-auto py-6 sm:py-14">
            {/* Header */}
            <motion.header
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="text-center mb-8 sm:mb-12 px-2"
            >
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600 mb-3">Apps & Community</p>
                <h1 className="h1-hero text-[2.15rem] leading-[1.08] sm:text-5xl md:text-6xl mb-4 sm:mb-5">
                    Unsere Apps.<br />
                    <span className="text-gradient-flow">Gemeinsam besser.</span>
                </h1>
                <p className="text-base sm:text-lg text-slate-500 max-w-md mx-auto leading-relaxed text-pretty">
                    Ausprobieren, Meinung sagen und mitverbessern – anonym und ohne Anmeldung.
                </p>
            </motion.header>

            {/* Vertrauens-Hinweise (barrierefrei & klar) */}
            <ul className="grid grid-cols-3 gap-2 sm:gap-6 mb-10 sm:mb-12 max-w-3xl mx-auto">
                {[
                    { icon: Heart, title: 'Anonym', text: 'Ohne Name, ohne Konto' },
                    { icon: ShieldCheck, title: 'Geschützt', text: 'Spam wird gefiltert' },
                    { icon: MessagesSquare, title: 'Du gestaltest mit', text: 'Beliebte Wünsche kommen zuerst' },
                ].map((item, i) => {
                    const Icon = item.icon;
                    return (
                        <li key={i} className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-2 sm:gap-3">
                            <span className="shrink-0 w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-50 to-violet-50 text-indigo-600 flex items-center justify-center">
                                <Icon className="w-5 h-5" aria-hidden="true" />
                            </span>
                            <span>
                                <span className="block text-sm font-semibold text-slate-900 leading-tight">{item.title}</span>
                                <span className="hidden sm:block text-sm text-slate-500 mt-0.5">{item.text}</span>
                            </span>
                        </li>
                    );
                })}
            </ul>

            {/* Suche & Filter */}
            <div className="mb-8 flex flex-col sm:flex-row gap-3 sm:items-center">
                <div className="relative flex-grow">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
                    <input
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="App suchen…"
                        aria-label="App suchen"
                        className="w-full bg-white border border-slate-200 rounded-full pl-10 pr-4 min-h-[44px] text-base sm:text-sm text-slate-900 focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all"
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="group" aria-label="Nach Kategorie filtern">
                    <button
                        onClick={() => setCategory('all')}
                        aria-pressed={category === 'all'}
                        className={cn('shrink-0 min-h-[40px] px-4 rounded-full text-sm font-semibold whitespace-nowrap transition-all',
                            category === 'all' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/20' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:text-blue-700')}
                    >
                        Alle
                    </button>
                    {Object.entries(categoryLabels).map(([key, label]) => (
                        <button
                            key={key}
                            onClick={() => setCategory(key)}
                            aria-pressed={category === key}
                            className={cn('shrink-0 min-h-[40px] px-4 rounded-full text-sm font-semibold whitespace-nowrap transition-all',
                                category === key ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/20' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:text-blue-700')}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Liste */}
            {loading ? (
                <CardGridSkeleton count={2} className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6" />
            ) : filtered.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {filtered.map((app, i) => (
                        <AppCard key={app.id} app={app} index={i} postCount={postCounts[app.id] || 0} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-100">
                    <LayoutGrid className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-slate-900 mb-1">Keine App gefunden</h3>
                    <p className="text-sm text-slate-500">Versuch es mit einem anderen Suchbegriff oder wähle „Alle".</p>
                </div>
            )}
        </div>
    );
}
