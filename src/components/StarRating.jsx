import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '../utils/cn';

/**
 * Barrierefreie Sterne-Bewertung.
 * - Anzeige-Modus (readOnly): zeigt einen Durchschnittswert.
 * - Eingabe-Modus: per Maus UND Tastatur (Pfeiltasten) bedienbar.
 */
export default function StarRating({ value = 0, onChange, readOnly = false, size = 'md', showValue = false }) {
    const [hover, setHover] = useState(0);
    const dims = { sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-7 h-7' }[size] || 'w-5 h-5';
    const active = hover || value;

    if (readOnly) {
        return (
            <div className="inline-flex items-center gap-1" role="img" aria-label={`Bewertung: ${value.toFixed(1)} von 5 Sternen`}>
                <div className="flex">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                            key={i}
                            className={cn(dims, i <= Math.round(value) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200')}
                            aria-hidden="true"
                        />
                    ))}
                </div>
                {showValue && <span className="text-sm font-bold text-slate-700 ml-1">{value.toFixed(1)}</span>}
            </div>
        );
    }

    return (
        <div
            className="inline-flex items-center gap-1"
            role="radiogroup"
            aria-label="Wie viele Sterne gibst du?"
        >
            {[1, 2, 3, 4, 5].map((i) => (
                <button
                    type="button"
                    key={i}
                    role="radio"
                    aria-checked={value === i}
                    aria-label={`${i} von 5 Sternen`}
                    onClick={() => onChange?.(i)}
                    onMouseEnter={() => setHover(i)}
                    onMouseLeave={() => setHover(0)}
                    onKeyDown={(e) => {
                        if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); onChange?.(Math.min(5, (value || 0) + 1)); }
                        if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); onChange?.(Math.max(1, (value || 1) - 1)); }
                    }}
                    className="p-0.5 rounded focus:outline-none focus:ring-2 focus:ring-amber-400 transition-transform hover:scale-110"
                >
                    <Star className={cn(dims, i <= active ? 'text-amber-400 fill-amber-400' : 'text-gray-300 fill-gray-100')} />
                </button>
            ))}
        </div>
    );
}
