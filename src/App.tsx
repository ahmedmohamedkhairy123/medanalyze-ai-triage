import React from 'react';

const App: React.FC = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white">
            <div className="container mx-auto px-4 py-16 max-w-4xl">
                <div className="text-center">
                    <div className="mb-6">
                        <i className="fas fa-heart-pulse text-6xl text-indigo-600"></i>
                    </div>
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
                        MedAnalyze AI Triage
                    </h1>
                    <p className="text-lg text-gray-600 mb-8">
                        Professional medical symptom analyzer and triage system
                    </p>
                    <p className="text-green-600 font-medium">
                        ✅ Phase 2: Frontend Foundation Complete!
                    </p>
                </div>
            </div>
        </div>
    );
};

export default App;