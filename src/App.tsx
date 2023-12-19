import React, { useState } from 'react';
import { TopBar, Disclaimer } from './components';
import { AppStep, SymptomInput, Question, MedicalReport } from './types';

const App: React.FC = () => {
    const [step, setStep] = useState<AppStep>('LANDING');
    const [symptoms, setSymptoms] = useState<SymptomInput>({ description: '', files: [] });
    const [questions, setQuestions] = useState<Question[]>([]);
    const [report, setReport] = useState<MedicalReport | null>(null);

    const handleStart = () => setStep('SYMPTOMS');

    return (
        <div className="flex flex-col min-h-screen">
            <TopBar />

            <main className="flex-grow container mx-auto max-w-4xl px-4 py-8">
                <Disclaimer />

                {step === 'LANDING' && (
                    <div className="text-center py-12 bg-white rounded-xl shadow-lg p-8 border border-gray-100">
                        <div className="mb-6">
                            <i className="fas fa-heart-pulse text-6xl text-indigo-600"></i>
                        </div>
                        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">MedAnalyze AI Triage</h1>
                        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                            Get an instant, high-precision medical analysis of your symptoms. Our AI provides specialized triage,
                            risk assessments, and professional recommendations.
                        </p>
                        <button
                            onClick={handleStart}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-bold text-lg transition-all"
                        >
                            Analyze Symptoms Now
                        </button>
                    </div>
                )}

                {step === 'SYMPTOMS' && (
                    <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
                        <h2 className="text-2xl font-bold mb-4">Step 1: Describe Your Symptoms</h2>
                        <textarea
                            className="w-full h-40 p-4 border border-gray-300 rounded-lg mb-4"
                            placeholder="Describe your symptoms..."
                            value={symptoms.description}
                            onChange={(e) => setSymptoms({ ...symptoms, description: e.target.value })}
                        />
                        <button
                            className="bg-indigo-600 text-white px-6 py-2 rounded-lg"
                            onClick={() => setStep('QUESTIONNAIRE')}
                        >
                            Continue to Questions
                        </button>
                    </div>
                )}

                {step === 'QUESTIONNAIRE' && (
                    <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
                        <h2 className="text-2xl font-bold mb-4">Step 2: Questionnaire</h2>
                        <p className="text-gray-600 mb-6">Questions will appear here.</p>
                        <button
                            className="bg-green-600 text-white px-6 py-2 rounded-lg"
                            onClick={() => setStep('REPORT')}
                        >
                            Generate Report
                        </button>
                    </div>
                )}

                {step === 'REPORT' && (
                    <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
                        <h2 className="text-2xl font-bold mb-4">Step 3: Medical Report</h2>
                        <p className="text-gray-600 mb-6">Your AI-generated report will appear here.</p>
                    </div>
                )}

                <div className="mt-8 text-center text-green-600 font-medium">
                    ✅ Phase 4: Components Complete! (TopBar & Disclaimer)
                </div>
            </main>

            <footer className="bg-gray-100 border-t border-gray-200 py-8 text-center text-gray-500 text-sm">
                <p>© 2024 MedAnalyze AI. All interactions are secure and encrypted.</p>
            </footer>
        </div>
    );
};

export default App;