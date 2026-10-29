import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ShieldCheck, Lock, Mail, AlertCircle } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;
            navigate('/admin');
        } catch (err) {
            // Verstaendliche, deutsche Meldung – ohne zu verraten, ob die E-Mail existiert
            const msg = String(err?.message || '').toLowerCase();
            if (msg.includes('rate') || msg.includes('too many')) {
                setError('Zu viele Versuche. Bitte warte kurz und probiere es dann erneut.');
            } else if (msg.includes('network') || msg.includes('fetch')) {
                setError('Keine Verbindung. Bitte prüfe deine Internetverbindung.');
            } else {
                setError('E-Mail oder Passwort stimmen nicht.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200/60 p-6 sm:p-8 border border-gray-100">
                <div className="text-center mb-8">
                    <div className="mx-auto w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/25">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">Admin Login</h1>
                    <p className="text-slate-500 mt-2">Nur für autorisiertes Personal.</p>
                </div>

                {error && (
                    <div role="alert" className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center text-red-700 text-sm">
                        <AlertCircle className="w-4 h-4 mr-2 shrink-0" aria-hidden="true" />
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label htmlFor="login-email" className="block text-sm font-semibold text-slate-700 mb-1.5">E-Mail-Adresse</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" aria-hidden="true" />
                            <input
                                id="login-email"
                                type="email"
                                autoComplete="username"
                                inputMode="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 text-base bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                                placeholder="name@beispiel.at"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="login-password" className="block text-sm font-semibold text-slate-700 mb-1.5">Passwort</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" aria-hidden="true" />
                            <input
                                id="login-password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 text-base bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-primary py-3 text-base flex justify-center items-center"
                    >
                        {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Anmelden'}
                    </button>
                </form>
            </div>
        </div>
    );
}
