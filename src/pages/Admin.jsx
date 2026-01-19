import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Trash2, CheckCircle, Clock, Search, XCircle, RefreshCw, AlertTriangle, X, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCategoryLabel } from '../utils/categories';

export default function Admin() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Reject Modal State
    const [rejectId, setRejectId] = useState(null);
    const [rejectReason, setRejectReason] = useState('');

    // Detail Modal State
    const [detailProject, setDetailProject] = useState(null);

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
        setDetailProject(null);
    };

    const confirmReject = (id) => {
        setRejectId(id);
        setRejectReason('');
        setDetailProject(null);
    };

    const handleReject = async () => {
        if (!rejectId) return;
        await supabase.from('projects').update({
            status: 'rejected',
            rejection_reason: rejectReason
        }).eq('id', rejectId);
        setRejectId(null);
        fetchProjects();
    };

    const handleDeleteForever = async (id) => {
        if (confirm('Dieses Projekt endgültig aus der Datenbank löschen?')) {
            await supabase.from('projects').delete().eq('id', id);
            fetchProjects();
            setDetailProject(null);
        }
    };

    const filteredProjects = projects.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="py-12 pb-24 relative">
            {/* Detail Modal */}
            <AnimatePresence>
                {detailProject && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                        >
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                                <h2 className="text-xl font-bold text-slate-900">{detailProject.title}</h2>
                                <button onClick={() => setDetailProject(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                                    <X className="w-5 h-5 text-slate-500" />
                                </button>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden">
                                        <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${detailProject.avatar_seed}`} alt="" className="w-full h-full" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-900">{detailProject.username}</p>
                                        <p className="text-sm text-slate-500">{getCategoryLabel(detailProject.category)}</p>
                                    </div>
                                    <span className={`ml-auto px-3 py-1 rounded-full text-xs font-bold uppercase ${detailProject.status === 'active' ? 'bg-green-100 text-green-700' :
                                            detailProject.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                'bg-amber-100 text-amber-700'
                                        }`}>
                                        {detailProject.status === 'active' ? 'Aktiv' : detailProject.status === 'rejected' ? 'Abgelehnt' : 'Wartend'}
                                    </span>
                                </div>

                                <div>
                                    <h3 className="text-sm font-semibold text-slate-500 uppercase mb-2">Beschreibung</h3>
                                    <p className="text-slate-700 whitespace-pre-wrap leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        {detailProject.description}
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-sm font-semibold text-slate-500 uppercase mb-2">Nutzen / Zielgruppe</h3>
                                    <p className="text-slate-700 whitespace-pre-wrap leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        {detailProject.benefit || 'Keine Angabe'}
                                    </p>
                                </div>

                                {detailProject.rejection_reason && (
                                    <div className="bg-red-50 border border-red-200 p-4 rounded-xl">
                                        <h3 className="text-sm font-semibold text-red-600 uppercase mb-2">Ablehnungsgrund</h3>
                                        <p className="text-red-700">{detailProject.rejection_reason}</p>
                                    </div>
                                )}

                                <div className="text-xs text-slate-400">
                                    Eingereicht am: {new Date(detailProject.created_at).toLocaleDateString('de-DE')} •
                                    Stimmen: {detailProject.votes || 0}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="p-6 border-t border-gray-100 flex flex-wrap gap-3 sticky bottom-0 bg-white">
                                {detailProject.status === 'pending' && (
                                    <>
                                        <button
                                            onClick={() => handleApprove(detailProject.id)}
                                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center justify-center gap-2"
                                        >
                                            <CheckCircle className="w-4 h-4" /> Freigeben
                                        </button>
                                        <button
                                            onClick={() => confirmReject(detailProject.id)}
                                            className="flex-1 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 font-medium flex items-center justify-center gap-2"
                                        >
                                            <AlertTriangle className="w-4 h-4" /> Ablehnen
                                        </button>
                                    </>
                                )}
                                {detailProject.status === 'rejected' && (
                                    <button
                                        onClick={() => handleDeleteForever(detailProject.id)}
                                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium flex items-center justify-center gap-2"
                                    >
                                        <Trash2 className="w-4 h-4" /> Endgültig löschen
                                    </button>
                                )}
                                <button
                                    onClick={() => setDetailProject(null)}
                                    className="px-4 py-2 bg-gray-100 text-slate-700 rounded-lg hover:bg-gray-200 font-medium"
                                >
                                    Schließen
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Reject Modal */}
            <AnimatePresence>
                {rejectId && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6"
                        >
                            <h3 className="text-xl font-bold text-slate-900 mb-4">Projekt ablehnen</h3>
                            <p className="text-slate-600 mb-4">
                                Bitte gib einen Grund an, warum dieses Projekt abgelehnt wird.
                            </p>
                            <textarea
                                className="w-full border-2 border-gray-200 rounded-xl p-4 min-h-[120px] focus:ring-4 focus:ring-red-100 focus:border-red-500 outline-none transition-all"
                                placeholder="Begründung (z.B. Verstoß gegen Regeln, keine gemeinnützige Absicht...)"
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                            />
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    onClick={() => setRejectId(null)}
                                    className="px-4 py-2 text-slate-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                                >
                                    Abbrechen
                                </button>
                                <button
                                    onClick={handleReject}
                                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-lg shadow-red-200 font-medium"
                                >
                                    Ablehnen
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

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
                                        className={`transition-colors cursor-pointer ${project.status === 'rejected' ? 'bg-red-50/50 opacity-60' : 'hover:bg-gray-50/50'}`}
                                        onClick={() => setDetailProject(project)}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-slate-900">{project.title}</div>
                                            <div className="text-xs text-slate-400 truncate max-w-[200px]">{project.description}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex px-2 py-1 bg-gray-100 text-slate-600 rounded text-xs font-medium border border-gray-200">
                                                {getCategoryLabel(project.category)}
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
                                            {project.status === 'active' && (
                                                <span className="inline-flex items-center text-green-600 text-xs font-bold uppercase tracking-wide">
                                                    <CheckCircle className="w-3 h-3 mr-1" /> Aktiv
                                                </span>
                                            )}
                                            {project.status === 'pending' && (
                                                <span className="inline-flex items-center text-amber-500 text-xs font-bold uppercase tracking-wide">
                                                    <Clock className="w-3 h-3 mr-1" /> Wartend
                                                </span>
                                            )}
                                            {project.status === 'rejected' && (
                                                <span className="inline-flex items-center text-red-500 text-xs font-bold uppercase tracking-wide">
                                                    <XCircle className="w-3 h-3 mr-1" /> Abgelehnt
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                            <button
                                                onClick={() => setDetailProject(project)}
                                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Details ansehen"
                                            >
                                                <Eye className="w-5 h-5" />
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
