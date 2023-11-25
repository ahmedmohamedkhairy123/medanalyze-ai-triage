import React, { useState } from 'react';
import { AppStep, SymptomInput, Question, MedicalReport } from './types';

const App: React.FC = () => {
    const [step, setStep] = useState<AppStep>('LANDING');
    const [symptoms, setSymptoms] = useState<SymptomInput>({ description: '', files: [] });
    const [questions, setQuestions] = useState<Question[]>([]);
    const [report, setReport] = useState<MedicalReport | null>(null);

    const handleStart = () => setStep('SYMPTOMS');

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

                    {/* Step indicator */}
                    <div className="mb-8">
                        <div className="flex justify-center space-x-4 mb-4">
                            {['LANDING', 'SYMPTOMS', 'QUESTIONNAIRE', 'REPORT'].map((s, i) => (
                                <div key={s} className="flex items-center">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === s ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'
                                        }`}>
                                        {i + 1}
                                    </div>
                                    {i < 3 && <div className="w-12 h-1 bg-gray-200"></div>}
                                </div>
                            ))}
                        </div>
                        <p className="text-sm text-gray-500">Current: {step}</p>
                    </div>

                    {/* Step content */}
                    {step === 'LANDING' && (
                        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
                            <h2 className="text-2xl font-bold mb-4">Welcome to MedAnalyze AI</h2>
                            <p className="text-gray-600 mb-6">
                                Get instant, high-precision medical analysis of your symptoms.
                            </p>
                            <button
                                onClick={handleStart}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-bold text-lg transition-all"
                            >
                                Start Symptom Analysis
                            </button>
                        </div>
                    )}

                    {step === 'SYMPTOMS' && (
                        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
                            <h2 className="text-2xl font-bold mb-4">Step 1: Describe Symptoms</h2>
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

                    <p className="mt-8 text-green-600 font-medium">
                        ✅ Phase 3: TypeScript Types Complete!
                    </p>
                </div>
            </div>
        </div>
    );
};

export default App;