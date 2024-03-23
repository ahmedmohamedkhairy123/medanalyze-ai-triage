import React, { useState } from 'react';
import { TopBar, Disclaimer } from './components';
import { generateQuestions, generateFinalReport } from './services';
import { AppStep, SymptomInput, Question, MedicalReport } from './types';
const App: React.FC = () => {
    const [step, setStep] = useState<AppStep>('LANDING');
    const [loading, setLoading] = useState(false);
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
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <button
                                onClick={handleStart}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-bold text-lg transition-all transform hover:scale-105"
                            >
                                Analyze Symptoms Now
                            </button>
                            <button className="bg-white border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-bold text-lg hover:bg-gray-50 transition-all">
                                Login / Sign Up (Optional)
                            </button>
                        </div>
                    </div>
                )}
                {step === 'SYMPTOMS' && (
                    <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <i className="fas fa-stethoscope text-indigo-600"></i>
                            Step 1: Tell us about your symptoms
                        </h2>
                        <textarea
                            className="w-full h-40 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all mb-6"
                            placeholder="e.g., I've been feeling sharp pain in my upper abdomen for 3 days, accompanied by nausea and a slight fever..."
                            value={symptoms.description}
                            onChange={(e) => setSymptoms({ ...symptoms, description: e.target.value })}
                        />

                        <div className="mb-8">
                            <label className="block font-semibold mb-2">Upload Medical Files (Reports, Scans, Photos)</label>
                            <div className="flex items-center justify-center w-full">
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <i className="fas fa-cloud-upload-alt text-3xl text-gray-400 mb-2"></i>
                                        <p className="text-sm text-gray-500">Click to upload PDFs or Images</p>
                                    </div>
                                    <input
                                        type="file"
                                        className="hidden"
                                        multiple
                                        accept="image/*,application/pdf"
                                        onChange={(e) => {
                                            const files = e.target.files;
                                            if (!files) return;

                                            Array.from(files).forEach((file: File) => {
                                                const reader = new FileReader();
                                                reader.onload = (ev) => {
                                                    setSymptoms(prev => ({
                                                        ...prev,
                                                        files: [...prev.files, {
                                                            name: file.name,
                                                            type: file.type,
                                                            data: ev.target?.result as string
                                                        }]
                                                    }));
                                                };
                                                reader.readAsDataURL(file);
                                            });
                                        }}
                                    />
                                </label>
                            </div>
                            {symptoms.files.length > 0 && (
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {symptoms.files.map((f, i) => (
                                        <span key={i} className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-medium">
                                            {f.name}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button
                            disabled={!symptoms.description || loading}
                            onClick={async () => {
                                if (!symptoms.description) return;
                                setLoading(true);
                                try {
                                    // Call AI to generate questions
                                    const qTexts = await generateQuestions(symptoms.description, symptoms.files);

                                    // Create question objects with empty answers
                                    const generatedQuestions: Question[] = qTexts.map((text, i) => ({
                                        id: i,
                                        text,
                                        answer: ''
                                    }));

                                    setQuestions(generatedQuestions);
                                    setStep('QUESTIONNAIRE');
                                } catch (error: any) {
                                    alert(error.message || "Failed to analyze symptoms. Please try again.");
                                } finally {
                                    setLoading(false);
                                }
                            }}
                            className={`w-full py-4 rounded-lg font-bold text-white transition-all flex items-center justify-center gap-3 ${!symptoms.description || loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
                                }`}
                        >
                            {loading ? (
                                <>
                                    <i className="fas fa-circle-notch fa-spin"></i>
                                    Analyzing symptoms...
                                </>
                            ) : (
                                'Analyze initial symptoms'
                            )}
                        </button>
                    </div>
                )}
                {step === 'QUESTIONNAIRE' && (
                    <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <i className="fas fa-clipboard-question text-indigo-600"></i>
                            Step 2: Follow-up Questions
                        </h2>
                        <p className="text-gray-600 mb-8">Please answer these 10 questions accurately to refine our analysis.</p>

                        <div className="space-y-8">
                            {questions.map((q, idx) => (
                                <div key={q.id} className="border-b border-gray-100 pb-6 last:border-0">
                                    <label className="block text-lg font-medium text-gray-800 mb-3">
                                        {idx + 1}. {q.text}
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        placeholder="Provide your answer here..."
                                        value={q.answer}
                                        onChange={(e) => {
                                            const newQs = [...questions];
                                            newQs[idx].answer = e.target.value;
                                            setQuestions(newQs);
                                        }}
                                    />
                                </div>
                            ))}
                        </div>

                        <button
                            disabled={loading || questions.some(q => !q.answer)}
                            onClick={async () => {
                                setLoading(true);
                                try {
                                    // Prepare QA list for AI
                                    const qaList = questions.map(q => ({ q: q.text, a: q.answer }));

                                    // Call AI to generate final report
                                    const result = await generateFinalReport(symptoms.description, symptoms.files, qaList);

                                    setReport(result);
                                    setStep('REPORT');
                                } catch (error: any) {
                                    alert(error.message || "Failed to generate report. Please try again.");
                                } finally {
                                    setLoading(false);
                                }
                            }}
                            className={`w-full py-4 mt-8 rounded-lg font-bold text-white transition-all flex items-center justify-center gap-3 ${loading || questions.some(q => !q.answer) ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                                }`}
                        >
                            {loading ? (
                                <>
                                    <i className="fas fa-circle-notch fa-spin"></i>
                                    Finalizing Medical Analysis...
                                </>
                            ) : (
                                'Generate Final Analysis Report'
                            )}
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
                    ✅ Phase 5: Complete Symptoms input page with file upload UI, loading states, and exact styling
                </div>
            </main>

            <footer className="bg-gray-100 border-t border-gray-200 py-8 text-center text-gray-500 text-sm">
                <p>© 2024 MedAnalyze AI. All interactions are secure and encrypted.</p>
            </footer>
        </div>
    );
};

export default App;