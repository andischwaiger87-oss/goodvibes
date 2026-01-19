import React from 'react';
import Stepper from '../components/Stepper';

export default function Submission() {
    return (
        <div className="py-12 px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
                <h1 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 mb-4">
                    Submit your Idea
                </h1>
                <p className="text-slate-400 max-w-2xl mx-auto">
                    Share your vision for a social non-profit app.
                    Make sure to keep it anonymous and focused on the common good.
                </p>
            </div>

            <Stepper />
        </div>
    );
}
