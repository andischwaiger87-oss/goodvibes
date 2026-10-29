import React from 'react';
import { RefreshCw, Home } from 'lucide-react';

/**
 * Faengt unerwartete Fehler ab, damit nicht die ganze Seite weiss bleibt.
 * Stattdessen sieht man eine freundliche Meldung mit Ausweg.
 */
export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, info) {
        console.error('Unerwarteter Fehler:', error, info?.componentStack);
    }

    componentDidUpdate(prevProps) {
        // Bei Seitenwechsel neu versuchen
        if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
            this.setState({ hasError: false });
        }
    }

    render() {
        if (!this.state.hasError) return this.props.children;

        return (
            <div className="max-w-md mx-auto py-20 px-4 text-center" role="alert">
                <div className="mx-auto w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5">
                    <RefreshCw className="w-7 h-7" aria-hidden="true" />
                </div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">
                    Hier ist etwas schiefgelaufen
                </h1>
                <p className="text-slate-500 leading-relaxed mb-8">
                    Das tut uns leid. Lade die Seite neu – meistens klappt es dann wieder.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button type="button" onClick={() => window.location.reload()} className="btn-primary inline-flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4" aria-hidden="true" /> Neu laden
                    </button>
                    <a href="/" className="btn-secondary inline-flex items-center justify-center gap-2">
                        <Home className="w-4 h-4" aria-hidden="true" /> Zur Startseite
                    </a>
                </div>
            </div>
        );
    }
}
