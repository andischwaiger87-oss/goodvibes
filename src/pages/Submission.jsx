import React from 'react';
import Stepper from '../components/Stepper';

export default function Submission() {
    return (
        <div className="py-12 px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
                <h1 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 mb-4">
                    Idee einreichen
                </h1>
                <p className="text-slate-400 max-w-2xl mx-auto">
                    Teile deine Vision für eine soziale App.
                    Deine Idee bleibt anonym und soll dem Gemeinwohl dienen.
                </p>
            </div>

            <Stepper />
        </div>
    );
}
