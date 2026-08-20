import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { Search, LayoutGrid, ShieldCheck, Heart, MessagesSquare } from 'lucide-react';
import AppCard from '../components/AppCard';
import { categoryLabels } from '../utils/categories';
import { cn } from '../utils/cn';
import { useSeo } from '../components/Seo';

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
            const { data: appData } = await supabase.from('apps').select('*').order('sort_order', { ascending: true });
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
        <div className="max-w-6xl mx-auto py-10 sm:py-14 px-4">
            {/* Header */}
            <div className="text-center mb-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-4 inline-flex items-center px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-semibold gap-2"
                >
                    <LayoutGrid className="w-4 h-4" />
                    App-Bereich & Community
                </motion.div>
                <h1 className="h1-hero text-4xl md:text-5xl mb-4">Unsere Apps – gemeinsam besser</h1>
                <p className="text-lg sm:text-xl text-subtle max-w-2xl mx-auto leading-relaxed">
                    Hier findest du alle GoodVibes-Apps. Probiere sie aus, teile deine Meinung und hilf mit,
                    sie Schritt für Schritt zu verbessern. Jede Stimme zählt – ganz anonym und ohne Anmeldung.
                </p>
            </div>

            {/* Vertrauens-Hinweise (barrierefrei & klar) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10">
                {[
                    { icon: Heart, title: 'Freundlich & anonym', text: 'Sag offen deine Meinung – ohne Name, ohne Konto.' },
                    { icon: ShieldCheck, title: 'Sicher geschützt', text: 'Wir filtern Spam und schädliche Inhalte automatisch.' },
                    { icon: MessagesSquare, title: 'Du gestaltest mit', text: 'Die Wünsche mit den meisten Stimmen setzen wir um.' },
                ].map((item, i) => {
                    const Icon = item.icon;
                    return (
                        <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 flex items-start gap-3 shadow-sm">
                            <div className="shrink-0 w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                <Icon className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-900">{item.title}</p>
                                <p className="text-xs text-slate-500 leading-relaxed">{item.text}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

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
                        className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all"
                    />
                </div>
                <div className="flex gap-2 flex-wrap" role="group" aria-label="Nach Kategorie filtern">
                    <button
                        onClick={() => setCategory('all')}
                        className={cn('px-3 py-2 rounded-lg text-xs font-semibold border transition-all',
                            category === 'all' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-gray-200 hover:bg-gray-50')}
                    >
                        Alle
                    </button>
                    {Object.entries(categoryLabels).map(([key, label]) => (
                        <button
                            key={key}
                            onClick={() => setCategory(key)}
                            className={cn('px-3 py-2 rounded-lg text-xs font-semibold border transition-all',
                                category === key ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-gray-200 hover:bg-gray-50')}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Liste */}
            {loading ? (
                <div className="flex justify-center items-center py-24">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" role="status" aria-label="Lädt" />
                </div>
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
