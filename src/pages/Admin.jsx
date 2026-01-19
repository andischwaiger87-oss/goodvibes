import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Trash2, CheckCircle, Clock, Search, ExternalLink, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Admin() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchProjects = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error) setProjects(data || []);
        setLoading(false);
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const handleApprove = async (id) => {
        await supabase.from('projects').update({ status: 'active' }).eq('id', id);
        fetchProjects();
    };

    const handleDelete = async (id) => {
        if (confirm('Wirklich löschen?')) {
            await supabase.from('projects').delete().eq('id', id);
            fetchProjects();
        }
    };

    const filteredProjects = projects.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="py-12 pb-24">
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
                    <p className="text-slate-500">Projekte verwalten und moderieren</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={fetchProjects} className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-slate-600 transition-colors">
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <button onClick={() => supabase.auth.signOut()} className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium transition-colors text-sm">
                        Abmelden
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <span className="text-slate-400 text-sm font-semibold uppercase">Offene Anfragen</span>
                    <div className="text-3xl font-bold text-slate-900 mt-2">
                        {projects.filter(p => p.status === 'pending').length}
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <span className="text-green-600 text-sm font-semibold uppercase">Freigegeben</span>
                    <div className="text-3xl font-bold text-slate-900 mt-2">
                        {projects.filter(p => p.status === 'active').length}
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <span className="text-blue-600 text-sm font-semibold uppercase">Stimmen Gesamt</span>
                    <div className="text-3xl font-bold text-slate-900 mt-2">
                        {projects.reduce((acc, curr) => acc + (curr.votes || 0), 0)}
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="mb-6 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Suchen nach Titel oder User..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                />
            </div>

            {/* Table */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Projekt</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Kategorie</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Votes</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Aktionen</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            <AnimatePresence>
                                {filteredProjects.map((project) => (
                                    <motion.tr
                                        key={project.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="hover:bg-gray-50/50 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-slate-900">{project.title}</div>
                                            <div className="text-xs text-slate-400 truncate max-w-[200px]">{project.description}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex px-2 py-1 bg-gray-100 text-slate-600 rounded text-xs font-medium border border-gray-200">
                                                {project.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-2">
                                                <div className="w-6 h-6 rounded bg-gray-200 overflow-hidden">
                                                    <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${project.avatar_seed}`} alt="" className="w-full h-full" />
                                                </div>
                                                <span className="text-sm text-slate-600">{project.username}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-sm text-slate-600">
                                            {project.votes}
                                        </td>
                                        <td className="px-6 py-4">
                                            {project.status === 'active' ? (
                                                <span className="inline-flex items-center text-green-600 text-xs font-bold uppercase tracking-wide">
                                                    <CheckCircle className="w-3 h-3 mr-1" /> Aktiv
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center text-amber-500 text-xs font-bold uppercase tracking-wide">
                                                    <Clock className="w-3 h-3 mr-1" /> Waret
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            {project.status !== 'active' && (
                                                <button
                                                    onClick={() => handleApprove(project.id)}
                                                    className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Freigeben"
                                                >
                                                    <CheckCircle className="w-5 h-5" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(project.id)}
                                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Löschen"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                            {filteredProjects.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                                        Keine Projekte gefunden.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
