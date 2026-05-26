import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { getDeviceId } from '../utils/security';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, MessageSquare, ThumbsUp, PlusCircle, Filter, RotateCw, CornerDownRight } from 'lucide-react';
import { cn } from '../utils/cn';

const categories = [
    { id: 'bug', label: 'Fehler (Bug)', color: 'bg-red-50 text-red-700 border-red-100' },
    { id: 'feature', label: 'Funktionswunsch', color: 'bg-blue-50 text-blue-700 border-blue-100' },
    { id: 'feedback', label: 'Feedback', color: 'bg-purple-50 text-purple-700 border-purple-100' },
    { id: 'question', label: 'Frage', color: 'bg-amber-50 text-amber-700 border-amber-100' }
];

const statuses = {
    new: { label: 'Neu', style: 'bg-gray-100 text-gray-700 border-gray-200' },
    in_progress: { label: 'In Bearbeitung', style: 'bg-amber-100 text-amber-800 border-amber-200' },
    resolved: { label: 'Gelöst', style: 'bg-green-100 text-green-800 border-green-200' },
    duplicate: { label: 'Duplikat', style: 'bg-slate-100 text-slate-500 border-slate-200 line-through' }
};

export default function BugTracker({ projectId }) {
    const [reports, setReports] = useState([]);
    const [myVotes, setMyVotes] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Filters & Sorting
    const [activeCategory, setActiveCategory] = useState('all');
    const [activeStatus, setActiveStatus] = useState('all');
    const [sortBy, setSortBy] = useState('votes'); // 'votes' or 'newest'

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('bug');
    const [contactInfo, setContactInfo] = useState('');
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        fetchReports();
    }, [projectId]);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const deviceId = getDeviceId();

            // 1. Fetch bug reports for this project
            const { data: reportsData } = await supabase
                .from('bug_reports')
                .select('*')
                .eq('project_id', projectId);

            // 2. Fetch current user's upvotes for this project's bug reports
            const { data: votesData } = await supabase
                .from('bug_report_votes')
                .select('report_id')
                .eq('device_id', deviceId);

            if (reportsData) setReports(reportsData);
            if (votesData) setMyVotes(votesData.map(v => v.report_id));
        } catch (err) {
            console.error("Error loading bug reports:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleVote = async (reportId) => {
        const deviceId = getDeviceId();
        const hasVoted = myVotes.includes(reportId);
        
        try {
            if (hasVoted) {
                // Remove vote
                await supabase
                    .from('bug_report_votes')
                    .delete()
                    .eq('report_id', reportId)
                    .eq('device_id', deviceId);

                // Decrement in UI state & DB
                setReports(prev => prev.map(r => 
                    r.id === reportId ? { ...r, votes: Math.max(0, (r.votes || 0) - 1) } : r
                ));
                setMyVotes(prev => prev.filter(id => id !== reportId));

                // Update report table count
                const currentReport = reports.find(r => r.id === reportId);
                const nextVotes = Math.max(0, (currentReport?.votes || 1) - 1);
                await supabase.from('bug_reports').update({ votes: nextVotes }).eq('id', reportId);
            } else {
                // Add vote
                await supabase
                    .from('bug_report_votes')
                    .insert({ report_id: reportId, device_id: deviceId });

                // Increment in UI state & DB
                setReports(prev => prev.map(r => 
                    r.id === reportId ? { ...r, votes: (r.votes || 0) + 1 } : r
                ));
                setMyVotes(prev => [...prev, reportId]);

                // Update report table count
                const currentReport = reports.find(r => r.id === reportId);
                const nextVotes = (currentReport?.votes || 0) + 1;
                await supabase.from('bug_reports').update({ votes: nextVotes }).eq('id', reportId);
            }
        } catch (err) {
            console.error("Error toggling vote:", err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !description.trim()) {
            setErrorMessage('Bitte fülle Titel und Beschreibung aus.');
            return;
        }

        setIsSubmitting(true);
        setErrorMessage('');
        setSuccessMessage('');

        try {
            const deviceId = getDeviceId();
            const newReport = {
                project_id: projectId,
                title: title.trim(),
                description: description.trim(),
                category,
                contact_info: contactInfo.trim(),
                reporter_device_id: deviceId,
                status: 'new',
                votes: 0
            };

            const { data, error } = await supabase
                .from('bug_reports')
                .insert(newReport);

            if (error) throw error;

            setTitle('');
            setDescription('');
            setContactInfo('');
            setSuccessMessage('Vielen Dank! Deine Meldung wurde erfolgreich eingereicht und ist nun sichtbar.');
            
            // Reload list
            fetchReports();
        } catch (err) {
            console.error("Error creating report:", err);
            setErrorMessage('Meldung konnte nicht eingereicht werden.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Filter & Sort logic
    const filteredReports = reports
        .filter(r => activeCategory === 'all' || r.category === activeCategory)
        .filter(r => activeStatus === 'all' || r.status === activeStatus)
        .sort((a, b) => {
            if (sortBy === 'votes') {
                return b.votes - a.votes;
            }
            return new Date(b.created_at) - new Date(a.created_at);
        });

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left Side: Submit Form */}
            <div className="lg:col-span-5">
                <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm sticky top-28">
                    <h3 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                        <PlusCircle className="w-5 h-5 text-indigo-600" />
                        Meldung einreichen
                    </h3>
                    <p className="text-sm text-slate-500 mb-6">
                        Hast du einen Fehler gefunden oder einen Verbesserungswunsch? Hilf uns, die App noch besser zu machen.
                    </p>

                    {successMessage && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-800 text-sm flex items-start gap-2.5">
                            <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                            <span>{successMessage}</span>
                        </div>
                    )}

                    {errorMessage && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm flex items-start gap-2.5">
                            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                            <span>{errorMessage}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Titel der Meldung</label>
                            <input
                                type="text"
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-slate-900 text-sm focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all"
                                placeholder="z. B. Absturz beim Klick auf Kalender"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Kategorie</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-slate-900 text-sm focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all cursor-pointer"
                            >
                                <option value="bug">Fehler (Bug)</option>
                                <option value="feature">Wunsch-Feature</option>
                                <option value="feedback">Allgemeines Feedback</option>
                                <option value="question">Frage zum Projekt</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Beschreibung</label>
                            <textarea
                                required
                                rows="6"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-slate-900 text-sm focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all resize-none"
                                placeholder="Bitte beschreibe den Fehler oder deinen Vorschlag so genau wie möglich..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Kontakt-Info (Optional)</label>
                            <input
                                type="text"
                                value={contactInfo}
                                onChange={(e) => setContactInfo(e.target.value)}
                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-slate-900 text-sm focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all"
                                placeholder="z. B. Email oder Fantasiename (für Rückfragen)"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full btn-primary bg-indigo-600 hover:bg-indigo-700 py-3 font-semibold text-white rounded-xl shadow-md flex justify-center items-center gap-2"
                        >
                            {isSubmitting ? 'Wird gesendet...' : 'Jetzt absenden'}
                        </button>
                    </form>
                </div>
            </div>

            {/* Right Side: Feed of Reports */}
            <div className="lg:col-span-7 space-y-6">
                {/* Filters */}
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-800 flex items-center gap-2">
                            <Filter className="w-4 h-4 text-slate-400" /> Filter & Sortierung
                        </h4>
                        <button
                            onClick={fetchReports}
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-gray-100 hover:text-slate-700 transition-all"
                            title="Aktualisieren"
                        >
                            <RotateCw className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Category Filter Pills */}
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setActiveCategory('all')}
                            className={cn(
                                "px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all",
                                activeCategory === 'all'
                                    ? "bg-slate-900 text-white border-slate-900"
                                    : "bg-white text-slate-600 border-gray-200 hover:bg-gray-50"
                            )}
                        >
                            Alle Kategorien
                        </button>
                        {categories.map(c => (
                            <button
                                key={c.id}
                                onClick={() => setActiveCategory(c.id)}
                                className={cn(
                                    "px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all",
                                    activeCategory === c.id
                                        ? "bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-100"
                                        : "bg-white text-slate-600 border-gray-200 hover:bg-gray-50"
                                )}
                            >
                                {c.label}
                            </button>
                        ))}
                    </div>

                    {/* Status Filter Pills */}
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                        <button
                            onClick={() => setActiveStatus('all')}
                            className={cn(
                                "px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all",
                                activeStatus === 'all'
                                    ? "bg-slate-900 text-white border-slate-900"
                                    : "bg-white text-slate-600 border-gray-200 hover:bg-gray-50"
                            )}
                        >
                            Alle Status
                        </button>
                        {Object.entries(statuses).map(([key, value]) => (
                            <button
                                key={key}
                                onClick={() => setActiveStatus(key)}
                                className={cn(
                                    "px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all",
                                    activeStatus === key
                                        ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                                        : "bg-white text-slate-600 border-gray-200 hover:bg-gray-50"
                                )}
                            >
                                {value.label}
                            </button>
                        ))}
                    </div>

                    {/* Sorting Tabs */}
                    <div className="flex items-center gap-4 pt-3 border-t border-gray-100 text-xs">
                        <span className="text-slate-400 font-medium">Sortieren nach:</span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setSortBy('votes')}
                                className={cn(
                                    "font-bold py-1 px-2.5 rounded transition-all",
                                    sortBy === 'votes' ? "text-indigo-600 bg-indigo-50" : "text-slate-500 hover:text-slate-900"
                                )}
                            >
                                Meiste Stimmen
                            </button>
                            <button
                                onClick={() => setSortBy('newest')}
                                className={cn(
                                    "font-bold py-1 px-2.5 rounded transition-all",
                                    sortBy === 'newest' ? "text-indigo-600 bg-indigo-50" : "text-slate-500 hover:text-slate-900"
                                )}
                            >
                                Neueste
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bug list */}
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                ) : filteredReports.length > 0 ? (
                    <div className="space-y-4">
                        <AnimatePresence>
                            {filteredReports.map((report) => {
                                const catObj = categories.find(c => c.id === report.category);
                                const statusObj = statuses[report.status] || { label: 'Unbekannt', style: 'bg-gray-100 border-gray-200' };
                                const votedByUser = myVotes.includes(report.id);

                                return (
                                    <motion.div
                                        key={report.id}
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -15 }}
                                        className={cn(
                                            "elgato-card p-5 sm:p-6 bg-white hover:border-gray-300 transition-colors shadow-sm",
                                            report.status === 'resolved' && "bg-green-50/10 border-green-100"
                                        )}
                                    >
                                        <div className="flex items-start justify-between gap-4 mb-3">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider", catObj?.color || 'bg-gray-50 text-gray-600 border-gray-100')}>
                                                    {catObj?.label || report.category}
                                                </span>
                                                <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider", statusObj.style)}>
                                                    {statusObj.label}
                                                </span>
                                            </div>
                                            <span className="text-[10px] text-slate-400 font-semibold bg-gray-50 px-2 py-1 rounded border border-gray-100 shrink-0">
                                                {new Date(report.created_at).toLocaleDateString('de-DE')}
                                            </span>
                                        </div>

                                        <h4 className={cn("text-base font-bold text-slate-900 mb-2", report.status === 'duplicate' && "line-through text-slate-400")}>
                                            {report.title}
                                        </h4>
                                        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap mb-4 bg-gray-50/30 p-3 rounded-lg border border-gray-100/50">
                                            {report.description}
                                        </p>

                                        {/* Reply and Vote Bar */}
                                        <div className="flex flex-col gap-3">
                                            {/* Admin Reply */}
                                            {report.admin_reply && (
                                                <div className="bg-blue-50/40 border border-blue-100 rounded-xl p-4 text-sm flex items-start gap-2.5">
                                                    <CornerDownRight className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                                                    <div>
                                                        <p className="text-xs font-bold text-blue-800 mb-1">Offizielle Rückmeldung:</p>
                                                        <p className="text-blue-900 leading-relaxed text-xs sm:text-sm whitespace-pre-wrap">{report.admin_reply}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Footer vote button */}
                                            <div className="flex items-center justify-between border-t border-gray-100 pt-3 mt-1">
                                                {report.contact_info ? (
                                                    <span className="text-[10px] text-slate-400 italic">
                                                        Meldung von: {report.contact_info}
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] text-slate-400 italic">Anonyme Meldung</span>
                                                )}

                                                <button
                                                    onClick={() => handleVote(report.id)}
                                                    className={cn(
                                                        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border",
                                                        votedByUser
                                                            ? "bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700 shadow-sm"
                                                            : "bg-white text-slate-500 border-gray-200 hover:border-indigo-200 hover:text-indigo-600 hover:bg-indigo-50/30"
                                                    )}
                                                >
                                                    <ThumbsUp className="w-3.5 h-3.5" />
                                                    <span>{report.votes || 0}</span>
                                                    <span className="hidden sm:inline font-normal">Stimmen</span>
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                ) : (
                    <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-100">
                        <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-900 mb-1">Keine Meldungen</h3>
                        <p className="text-sm text-slate-500 max-w-sm mx-auto">
                            Für dieses Projekt wurden noch keine Meldungen eingereicht. Sei der Erste und sende uns dein Feedback!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
