import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Trash2, CheckCircle, Clock, Search, XCircle, RefreshCw, AlertTriangle, X, Eye, Settings, Activity, MessageSquare, Wrench, Award, CornerDownRight, PlusCircle, LayoutGrid, ShieldAlert, Ban } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCategoryLabel } from '../utils/categories';
import { cn } from '../utils/cn';
import { AppManagementTab, CommunityModerationTab, BlocklistTab } from '../components/admin/CommunityAdmin';

const getAvatarUrl = (seedString, fallbackId = 'default') => {
    const seed = String(seedString || fallbackId);
    if (seed.includes(':')) {
        const [style, actualSeed] = seed.split(':');
        return `https://api.dicebear.com/7.x/${style}/svg?seed=${actualSeed}`;
    }
    return `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}`;
};

// ──────────────────────────────────────────────
// Tab 1: Project Moderation (existing functionality)
// ──────────────────────────────────────────────
/* eslint-disable react/prop-types */
function ProjectModerationTab({ projects, fetchProjects, loading }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [rejectId, setRejectId] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [detailProject, setDetailProject] = useState(null);

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

    const getStatusLabel = (status) => {
        const map = {
            active: { label: 'Aktiv', icon: CheckCircle, cls: 'text-green-600' },
            pending: { label: 'Wartend', icon: Clock, cls: 'text-amber-500' },
            rejected: { label: 'Abgelehnt', icon: XCircle, cls: 'text-red-500' },
            implementation: { label: 'In Umsetzung', icon: Wrench, cls: 'text-indigo-600' },
            completed: { label: 'Fertig', icon: Award, cls: 'text-yellow-600' },
        };
        const s = map[status] || { label: status, icon: Clock, cls: 'text-slate-500' };
        const Icon = s.icon;
        return (
            <span className={cn("inline-flex items-center text-xs font-bold uppercase tracking-wide", s.cls)}>
                <Icon className="w-3 h-3 mr-1" /> {s.label}
            </span>
        );
    };

    return (
        <>
            {/* Detail Modal */}
            <AnimatePresence>
                {detailProject && (
                    <div className="fixed inset-0 z-[9999] flex items-start sm:items-center justify-center pt-24 sm:pt-4 px-4 pb-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
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
                                        <img src={getAvatarUrl(detailProject.avatar_seed)} alt="" className="w-full h-full" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-900">{detailProject.username}</p>
                                        <p className="text-sm text-slate-500">{getCategoryLabel(detailProject.category)}</p>
                                    </div>
                                    <span className={`ml-auto px-3 py-1 rounded-full text-xs font-bold uppercase ${detailProject.status === 'active' ? 'bg-green-100 text-green-700' :
                                        detailProject.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                        detailProject.status === 'implementation' ? 'bg-indigo-100 text-indigo-700' :
                                        detailProject.status === 'completed' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-amber-100 text-amber-700'
                                        }`}>
                                        {detailProject.status === 'active' ? 'Aktiv' : detailProject.status === 'rejected' ? 'Abgelehnt' : detailProject.status === 'implementation' ? 'In Umsetzung' : detailProject.status === 'completed' ? 'Fertig' : 'Wartend'}
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

                            <div className="p-6 border-t border-gray-100 flex flex-wrap gap-3 sticky bottom-0 bg-white">
                                {detailProject.status === 'pending' && (
                                    <>
                                        <button onClick={() => handleApprove(detailProject.id)} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center justify-center gap-2">
                                            <CheckCircle className="w-4 h-4" /> Freigeben
                                        </button>
                                        <button onClick={() => confirmReject(detailProject.id)} className="flex-1 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 font-medium flex items-center justify-center gap-2">
                                            <AlertTriangle className="w-4 h-4" /> Ablehnen
                                        </button>
                                    </>
                                )}
                                {detailProject.status === 'rejected' && (
                                    <button onClick={() => handleDeleteForever(detailProject.id)} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium flex items-center justify-center gap-2">
                                        <Trash2 className="w-4 h-4" /> Endgültig löschen
                                    </button>
                                )}
                                <button onClick={() => setDetailProject(null)} className="px-4 py-2 bg-gray-100 text-slate-700 rounded-lg hover:bg-gray-200 font-medium">
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
                    <div className="fixed inset-0 z-[9999] flex items-start sm:items-center justify-center pt-24 sm:pt-4 px-4 pb-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6"
                        >
                            <h3 className="text-xl font-bold text-slate-900 mb-4">Projekt ablehnen</h3>
                            <p className="text-slate-600 mb-4">Bitte gib einen Grund an, warum dieses Projekt abgelehnt wird.</p>
                            <textarea
                                className="w-full border-2 border-gray-200 rounded-xl p-4 min-h-[120px] focus:ring-4 focus:ring-red-100 focus:border-red-500 outline-none transition-all"
                                placeholder="Begründung (z.B. Verstoß gegen Regeln, keine gemeinnützige Absicht...)"
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                            />
                            <div className="flex justify-end gap-3 mt-6">
                                <button onClick={() => setRejectId(null)} className="px-4 py-2 text-slate-600 hover:bg-gray-100 rounded-lg transition-colors font-medium">Abbrechen</button>
                                <button onClick={handleReject} className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-lg shadow-red-200 font-medium">Ablehnen</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 shadow-sm">
                    <span className="text-slate-400 text-xs font-semibold uppercase">Offen</span>
                    <div className="text-2xl font-bold text-slate-900 mt-1">{projects.filter(p => p.status === 'pending').length}</div>
                </div>
                <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 shadow-sm">
                    <span className="text-green-600 text-xs font-semibold uppercase">Aktiv</span>
                    <div className="text-2xl font-bold text-slate-900 mt-1">{projects.filter(p => p.status === 'active').length}</div>
                </div>
                <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 shadow-sm">
                    <span className="text-indigo-600 text-xs font-semibold uppercase">Umsetzung</span>
                    <div className="text-2xl font-bold text-slate-900 mt-1">{projects.filter(p => p.status === 'implementation').length}</div>
                </div>
                <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 shadow-sm">
                    <span className="text-blue-600 text-xs font-semibold uppercase">Stimmen</span>
                    <div className="text-2xl font-bold text-slate-900 mt-1">{projects.reduce((acc, c) => acc + (c.votes || 0), 0)}</div>
                </div>
            </div>

            {/* Search */}
            <div className="mb-6 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input type="text" placeholder="Suchen nach Titel oder User..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm" />
            </div>

            {/* Table */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-4 sm:px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Projekt</th>
                                <th className="px-4 sm:px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Kategorie</th>
                                <th className="px-4 sm:px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">User</th>
                                <th className="px-4 sm:px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Votes</th>
                                <th className="px-4 sm:px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-4 sm:px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Aktionen</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            <AnimatePresence>
                                {filteredProjects.map((project) => (
                                    <motion.tr key={project.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                        className={`transition-colors cursor-pointer ${project.status === 'rejected' ? 'bg-red-50/50 opacity-60' : 'hover:bg-gray-50/50'}`}
                                        onClick={() => setDetailProject(project)}>
                                        <td className="px-4 sm:px-6 py-4">
                                            <div className="font-semibold text-slate-900 text-sm">{project.title}</div>
                                            <div className="text-xs text-slate-400 truncate max-w-[200px]">{project.description}</div>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 hidden md:table-cell">
                                            <span className="inline-flex px-2 py-1 bg-gray-100 text-slate-600 rounded text-xs font-medium border border-gray-200">
                                                {getCategoryLabel(project.category)}
                                            </span>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 hidden sm:table-cell">
                                            <div className="flex items-center space-x-2">
                                                <div className="w-6 h-6 rounded bg-gray-200 overflow-hidden">
                                                    <img src={getAvatarUrl(project.avatar_seed)} alt="" className="w-full h-full" />
                                                </div>
                                                <span className="text-sm text-slate-600">{project.username}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 font-mono text-sm text-slate-600">{project.votes}</td>
                                        <td className="px-4 sm:px-6 py-4">{getStatusLabel(project.status)}</td>
                                        <td className="px-4 sm:px-6 py-4 text-right space-x-1" onClick={(e) => e.stopPropagation()}>
                                            {project.status === 'pending' && (
                                                <>
                                                    <button onClick={() => handleApprove(project.id)} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Freigeben"><CheckCircle className="w-5 h-5" /></button>
                                                    <button onClick={() => confirmReject(project.id)} className="p-1.5 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors" title="Ablehnen"><AlertTriangle className="w-5 h-5" /></button>
                                                </>
                                            )}
                                            <button onClick={() => handleDeleteForever(project.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Löschen"><Trash2 className="w-5 h-5" /></button>
                                            <button onClick={() => setDetailProject(project)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Details"><Eye className="w-5 h-5" /></button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                            {filteredProjects.length === 0 && (
                                <tr><td colSpan="6" className="px-6 py-12 text-center text-slate-400">Keine Projekte gefunden.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}

// ──────────────────────────────────────────────
// Tab 2: Phase & Progress Control
// ──────────────────────────────────────────────
function PhaseControlTab({ projects, fetchProjects }) {
    const [currentPhase, setCurrentPhase] = useState('submission');
    const [activeProjectId, setActiveProjectId] = useState('');
    const [saving, setSaving] = useState(false);
    const [saveMsg, setSaveMsg] = useState('');

    // Progress update form
    const [updateTitle, setUpdateTitle] = useState('');
    const [updateText, setUpdateText] = useState('');
    const [updateProgress, setUpdateProgress] = useState(0);
    const [updates, setUpdates] = useState([]);
    const [savingUpdate, setSavingUpdate] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    useEffect(() => {
        if (activeProjectId) loadUpdates();
    }, [activeProjectId]);

    const loadSettings = async () => {
        const { data } = await supabase.from('app_settings').select('*');
        if (data) {
            const phase = data.find(s => s.key === 'current_phase');
            const proj = data.find(s => s.key === 'active_project_id');
            if (phase) setCurrentPhase(phase.value);
            if (proj) setActiveProjectId(proj.value);
        }
    };

    const loadUpdates = async () => {
        const { data } = await supabase.from('project_updates').select('*').eq('project_id', activeProjectId).order('created_at', { ascending: false });
        if (data) {
            setUpdates(data);
            if (data.length > 0) setUpdateProgress(data[0].progress_percent);
        }
    };

    const savePhaseSettings = async () => {
        setSaving(true);
        setSaveMsg('');
        try {
            // SOTA-Fix: Wir fangen Fehler beim Schreiben aktiv ab, anstatt Erfolg blind zu vermuten
            const { error: phaseError } = await supabase.from('app_settings').update({ value: currentPhase }).eq('key', 'current_phase');
            const { error: projectError } = await supabase.from('app_settings').update({ value: activeProjectId }).eq('key', 'active_project_id');

            if (phaseError || projectError) {
                setSaveMsg('Datenbank-Fehler: ' + (phaseError?.message || projectError?.message));
                setSaving(false);
                return;
            }

            // Update project statuses accordingly
            if (activeProjectId) {
                await supabase.from('projects').update({ status: 'implementation' }).eq('id', activeProjectId);
            }

            window.dispatchEvent(new Event('gv_settings_updated'));
            setSaveMsg('Einstellungen erfolgreich live gespeichert!');
            fetchProjects();
        } catch (err) {
            console.error(err);
            setSaveMsg('Kritischer Systemfehler beim Speichern.');
        } finally {
            setSaving(false);
        }
    };

    const [updateMsg, setUpdateMsg] = useState(''); // Neu: Für die Erfolgs-/Fehlermeldung

    const addUpdate = async () => {
        if (!updateTitle.trim() || !updateText.trim() || !activeProjectId) return;
        setSavingUpdate(true);
        setUpdateMsg('');
        try {
            const { error } = await supabase.from('project_updates').insert({
                project_id: activeProjectId,
                progress_percent: updateProgress,
                update_title: updateTitle.trim(),
                update_text: updateText.trim()
            });

            if (error) {
                setUpdateMsg('Fehler: ' + error.message);
                setSavingUpdate(false);
                return;
            }

            setUpdateTitle('');
            setUpdateText('');
            setUpdateMsg('Update erfolgreich hinzugefügt!');
            loadUpdates();
        } catch (err) {
            console.error(err);
            setUpdateMsg('Systemfehler beim Speichern.');
        } finally {
            setSavingUpdate(false);
        }
    };

    const deleteUpdate = async (id) => {
        if (confirm('Update löschen?')) {
            await supabase.from('project_updates').delete().eq('id', id);
            loadUpdates();
        }
    };

    const markCompleted = async () => {
        if (!activeProjectId) return;
        if (!confirm('Projekt als fertiggestellt markieren? Dies verschiebt es in den Showcase.')) return;
        await supabase.from('projects').update({ status: 'completed' }).eq('id', activeProjectId);
        setActiveProjectId('');
        await supabase.from('app_settings').update({ value: '' }).eq('key', 'active_project_id');
        window.dispatchEvent(new Event('gv_settings_updated'));
        fetchProjects();
    };

    const phases = [
        { id: 'submission', label: 'Einreichung', desc: 'Ideen werden gesammelt & es wird abgestimmt.', color: 'bg-blue-50 border-blue-200 text-blue-700' },
        { id: 'review', label: 'Review', desc: 'Abstimmungen geschlossen. Ideen werden gesichtet.', color: 'bg-amber-50 border-amber-200 text-amber-700' },
        { id: 'implementation', label: 'Umsetzung', desc: 'Gewinner-Projekt wird aktiv entwickelt.', color: 'bg-indigo-50 border-indigo-200 text-indigo-700' },
        { id: 'beta', label: 'Beta-Test', desc: 'App ist als BETA zum Testen freigegeben. Der Herz-Effekt ist pausiert.', color: 'bg-amber-50 border-amber-200 text-amber-700' },
    ];

    const activeProjects = projects.filter(p => ['active', 'implementation'].includes(p.status));

    return (
        <div className="space-y-10">
            {/* Phase Selection */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-indigo-600" /> Globale Phase
                </h3>
                <p className="text-sm text-slate-500 mb-6">Wähle die aktuelle Phase der GoodVibes-Plattform. Die Darstellung im Frontend passt sich automatisch an.</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {phases.map(ph => (
                        <button
                            key={ph.id}
                            onClick={() => setCurrentPhase(ph.id)}
                            className={cn(
                                "p-4 rounded-xl border-2 text-left transition-all",
                                currentPhase === ph.id
                                    ? `${ph.color} border-current shadow-sm ring-2 ring-current/20`
                                    : "bg-white border-gray-200 text-slate-600 hover:border-gray-300"
                            )}
                        >
                            <span className="font-bold text-base block mb-1">{ph.label}</span>
                            <span className="text-xs leading-relaxed block opacity-80">{ph.desc}</span>
                        </button>
                    ))}
                </div>

                {/* Active project selection */}
                {(currentPhase === 'implementation' || currentPhase === 'beta') && (
                    <div className="mb-6 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Aktives Umsetzungsprojekt</label>
                        <select
                            value={activeProjectId}
                            onChange={(e) => setActiveProjectId(e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                            <option value="">– Kein Projekt ausgewählt –</option>
                            {activeProjects.map(p => (
                                <option key={p.id} value={p.id}>{p.title} ({p.votes} Stimmen)</option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="flex flex-wrap items-center gap-4">
                    <button onClick={savePhaseSettings} disabled={saving}
                        className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-semibold text-sm shadow-sm disabled:opacity-50">
                        {saving ? 'Speichere...' : 'Phase speichern'}
                    </button>

                    {activeProjectId && (currentPhase === 'implementation' || currentPhase === 'beta') && (
                        <button onClick={markCompleted}
                            className="px-6 py-2.5 bg-yellow-500 text-slate-950 rounded-xl hover:bg-yellow-600 font-semibold text-sm shadow-sm flex items-center gap-2">
                            <Award className="w-4 h-4" /> Projekt als fertig markieren
                        </button>
                    )}

                    {saveMsg && (
                        <span className={cn(
                            "text-sm font-semibold",
                            saveMsg.includes('Fehler') ? "text-red-600" : "text-green-600"
                        )}>
                            {saveMsg}
                        </span>
                    )}
                </div>
            </div>

            {/* Progress Updates (Only during implementation) */}
            {activeProjectId && (
                <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-indigo-600" /> Fortschritts-Updates
                    </h3>
                    <p className="text-sm text-slate-500 mb-6">Pflege hier Timeline-Updates ein, die für Besucher auf der Fortschritts-Seite sichtbar sind.</p>

                    {/* Add new update form */}
                    <div className="space-y-4 p-5 bg-gray-50 rounded-xl border border-gray-100 mb-8">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Titel des Updates</label>
                                <input type="text" value={updateTitle} onChange={(e) => setUpdateTitle(e.target.value)}
                                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="z. B. Datenbank-Design fertig" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Fortschritt (%): {updateProgress}%</label>
                                <input type="range" min="0" max="100" value={updateProgress} onChange={(e) => setUpdateProgress(parseInt(e.target.value))}
                                    className="w-full accent-indigo-600 mt-1" />
                            </div>
                        </div>
                        <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Beschreibung</label>
                        <textarea rows="3" value={updateText} onChange={(e) => setUpdateText(e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                            placeholder="Was wurde in diesem Schritt erledigt?" />
                    </div>

                    {/* HIER GEÄNDERT: Button und Live-Meldung nebeneinander */}
                    <div className="flex flex-wrap items-center gap-4">
                        <button onClick={addUpdate} disabled={savingUpdate || !updateTitle.trim() || !updateText.trim()}
                            className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold text-sm disabled:opacity-50 flex items-center gap-2">
                            <PlusCircle className="w-4 h-4" /> {savingUpdate ? 'Wird gespeichert...' : 'Update hinzufügen'}
                        </button>
                        
                        {updateMsg && (
                            <span className={cn(
                                "text-sm font-semibold",
                                updateMsg.includes('Fehler') ? "text-red-600" : "text-green-600"
                            )}>
                                {updateMsg}
                            </span>
                        )}
                    </div>
                </div>

                    {/* Existing updates list */}
                    {updates.length > 0 ? (
                        <div className="space-y-4">
                            {updates.map(u => (
                                <div key={u.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                    <div className="flex-grow min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                            <h4 className="font-bold text-slate-900 text-sm">{u.update_title}</h4>
                                            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">{u.progress_percent}%</span>
                                        </div>
                                        <p className="text-xs text-slate-500 mb-1">{new Date(u.created_at).toLocaleDateString('de-DE')}</p>
                                        <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">{u.update_text}</p>
                                    </div>
                                    <button onClick={() => deleteUpdate(u.id)}
                                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0" title="Löschen">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-400 text-center py-6">Noch keine Updates eingepflegt.</p>
                    )}
                </div>
            )}
        </div>
    );
}

// ──────────────────────────────────────────────
// Tab 3: Bug Tracker Moderation
// ──────────────────────────────────────────────
function BugModerationTab() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [replyId, setReplyId] = useState(null);
    const [replyText, setReplyText] = useState('');

    useEffect(() => { fetchReports(); }, []);

    const fetchReports = async () => {
        setLoading(true);
        const { data } = await supabase.from('bug_reports').select('*').order('created_at', { ascending: false });
        if (data) setReports(data);
        setLoading(false);
    };

    const changeStatus = async (id, status) => {
        await supabase.from('bug_reports').update({ status }).eq('id', id);
        fetchReports();
    };

    const submitReply = async () => {
        if (!replyId || !replyText.trim()) return;
        await supabase.from('bug_reports').update({ admin_reply: replyText.trim() }).eq('id', replyId);
        setReplyId(null);
        setReplyText('');
        fetchReports();
    };

    const deleteReport = async (id) => {
        if (confirm('Meldung endgültig löschen?')) {
            await supabase.from('bug_reports').delete().eq('id', id);
            fetchReports();
        }
    };

    const catColors = {
        bug: 'bg-red-50 text-red-700 border-red-100',
        feature: 'bg-blue-50 text-blue-700 border-blue-100',
        feedback: 'bg-purple-50 text-purple-700 border-purple-100',
        question: 'bg-amber-50 text-amber-700 border-amber-100'
    };
    const catLabels = { bug: 'Bug', feature: 'Feature', feedback: 'Feedback', question: 'Frage' };
    const statusLabels = { new: 'Neu', in_progress: 'In Bearbeitung', resolved: 'Gelöst', duplicate: 'Duplikat' };

    if (loading) {
        return <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;
    }

    return (
        <div className="space-y-6">
            {/* Reply modal */}
            <AnimatePresence>
                {replyId && (
                    <div className="fixed inset-0 z-[9999] flex items-start sm:items-center justify-center pt-24 sm:pt-4 px-4 pb-4 bg-black/60 backdrop-blur-sm">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6">
                            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2"><CornerDownRight className="w-5 h-5 text-blue-600" /> Offizielle Antwort</h3>
                            <textarea
                                className="w-full border-2 border-gray-200 rounded-xl p-4 min-h-[120px] focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                                placeholder="Deine Antwort an den Melder..."
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)} />
                            <div className="flex justify-end gap-3 mt-6">
                                <button onClick={() => setReplyId(null)} className="px-4 py-2 text-slate-600 hover:bg-gray-100 rounded-lg font-medium">Abbrechen</button>
                                <button onClick={submitReply} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-200 font-medium">Antworten</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {reports.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-100">
                    <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">Keine Bug-Meldungen vorhanden.</p>
                </div>
            ) : (
                reports.map(r => (
                    <div key={r.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider", catColors[r.category] || 'bg-gray-50 text-gray-600 border-gray-200')}>
                                {catLabels[r.category] || r.category}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider bg-gray-100 text-gray-700 border-gray-200">
                                {statusLabels[r.status] || r.status}
                            </span>
                            <span className="text-[10px] text-slate-400 ml-auto">{new Date(r.created_at).toLocaleDateString('de-DE')}</span>
                        </div>

                        <h4 className="font-bold text-slate-900">{r.title}</h4>
                        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap bg-gray-50 p-3 rounded-lg border border-gray-100">{r.description}</p>

                        {r.contact_info && <p className="text-xs text-slate-400">Kontakt: {r.contact_info}</p>}
                        {r.admin_reply && (
                            <div className="bg-blue-50/40 border border-blue-100 rounded-lg p-3 text-sm flex items-start gap-2">
                                <CornerDownRight className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-xs font-bold text-blue-800 mb-0.5">Deine Antwort:</p>
                                    <p className="text-blue-900 text-xs">{r.admin_reply}</p>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100">
                            <span className="text-xs text-slate-400 mr-auto">👍 {r.votes || 0} Stimmen</span>

                            <select value={r.status} onChange={(e) => changeStatus(r.id, e.target.value)}
                                className="text-xs bg-white border border-gray-200 rounded-lg px-2 py-1 focus:ring-1 focus:ring-indigo-500 outline-none cursor-pointer">
                                <option value="new">Neu</option>
                                <option value="in_progress">In Bearbeitung</option>
                                <option value="resolved">Gelöst</option>
                                <option value="duplicate">Duplikat</option>
                            </select>

                            <button onClick={() => { setReplyId(r.id); setReplyText(r.admin_reply || ''); }}
                                className="text-xs px-3 py-1 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 font-semibold border border-blue-100">Antworten</button>

                            <button onClick={() => deleteReport(r.id)}
                                className="text-xs px-3 py-1 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-semibold border border-red-100">Löschen</button>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}

// ──────────────────────────────────────────────
// Main Admin Component with Tabs
// ──────────────────────────────────────────────
export default function Admin() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('projects');

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

    const tabs = [
        { id: 'projects', label: 'Projekte', icon: Eye, mobileLabel: 'Projekte' },
        { id: 'phases', label: 'Phasen & Fortschritt', icon: Settings, mobileLabel: 'Phasen' },
        { id: 'bugs', label: 'Bug-Tracker', icon: MessageSquare, mobileLabel: 'Bugs' },
        { id: 'apps', label: 'Apps', icon: LayoutGrid, mobileLabel: 'Apps' },
        { id: 'community', label: 'Community', icon: ShieldAlert, mobileLabel: 'Beiträge' },
        { id: 'blocklist', label: 'Blockliste', icon: Ban, mobileLabel: 'Sperren' },
    ];

    return (
        <div className="py-8 sm:py-12 pb-24 relative">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Admin Dashboard</h1>
                    <p className="text-slate-500 text-sm">Projekte verwalten, Phasen steuern und Feedback moderieren</p>
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

            {/* Tab Navigation */}
            <div className="mb-8 bg-white rounded-xl border border-gray-200 shadow-sm p-1.5 flex flex-wrap gap-1.5">
                {tabs.map(tab => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold transition-all",
                                activeTab === tab.id
                                    ? "bg-indigo-600 text-white shadow-sm"
                                    : "text-slate-500 hover:text-slate-900 hover:bg-gray-50"
                            )}
                        >
                            <Icon className="w-4 h-4" />
                            <span className="hidden sm:inline">{tab.label}</span>
                            <span className="sm:hidden">{tab.mobileLabel}</span>
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            {activeTab === 'projects' && (
                <ProjectModerationTab projects={projects} fetchProjects={fetchProjects} loading={loading} />
            )}
            {activeTab === 'phases' && (
                <PhaseControlTab projects={projects} fetchProjects={fetchProjects} />
            )}
            {activeTab === 'bugs' && (
                <BugModerationTab />
            )}
            {activeTab === 'apps' && (
                <AppManagementTab />
            )}
            {activeTab === 'community' && (
                <CommunityModerationTab />
            )}
            {activeTab === 'blocklist' && (
                <BlocklistTab />
            )}
        </div>
    );
}
