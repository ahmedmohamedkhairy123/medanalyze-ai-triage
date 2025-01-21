import React, { useState } from 'react';
import { TopBar, Disclaimer, LoginModal } from './components';
import { generateQuestions, generateFinalReport } from './services';
import { AppStep, SymptomInput, Question, MedicalReport } from './types';


const App: React.FC = () => {
    const [step, setStep] = useState<AppStep>('LANDING');
    const [loading, setLoading] = useState(false);
    const [symptoms, setSymptoms] = useState<SymptomInput>({ description: '', files: [] });
    const [questions, setQuestions] = useState<Question[]>([]);
    const [showLogin, setShowLogin] = useState(false);
    const [report, setReport] = useState<MedicalReport | null>(null);

    const handleStart = () => setStep('SYMPTOMS');

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    };

    const submitSymptoms = async () => {
        if (!symptoms.description) return;
        setLoading(true);
        try {
            const qTexts = await generateQuestions(symptoms.description, symptoms.files);
            setQuestions(qTexts.map((text, i) => ({ id: i, text, answer: '' })));
            setStep('QUESTIONNAIRE');
        } catch (error: any) {
            alert(error.message || "Failed to analyze symptoms. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const submitQuestionnaire = async () => {
        setLoading(true);
        try {
            const qaList = questions.map(q => ({ q: q.text, a: q.answer }));
            const result = await generateFinalReport(symptoms.description, symptoms.files, qaList);
            setReport(result);
            setStep('REPORT');
        } catch (error: any) {
            alert(error.message || "Failed to generate report. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Sort and split diagnoses safely
    const primaryDiagnosis = report?.diagnoses.reduce((prev, current) => (prev.confidence > current.confidence) ? prev : current);
    const otherDiagnoses = report?.diagnoses.filter(d => d !== primaryDiagnosis).slice(0, 2);

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
                            <button
                                onClick={() => setShowLogin(true)}
                                className="bg-white border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-bold text-lg hover:bg-gray-50 transition-all hover:scale-105"
                            >
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
                                        onChange={handleFileUpload}
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
                            onClick={submitSymptoms}
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
                            onClick={submitQuestionnaire}
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

                {step === 'REPORT' && report && (
                    <div id="report-content" className="space-y-8 animate-in fade-in duration-700">
                        {/* Primary Likely Diagnosis Hero */}
                        <div className="bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-8 text-center shadow-md">
                            <p className="text-xs font-black uppercase tracking-widest text-indigo-500 mb-2">Most Likely Condition</p>
                            <h1 className="text-5xl font-black text-indigo-900 mb-2 uppercase break-words">
                                {primaryDiagnosis?.disease}
                            </h1>
                            <div className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-1 rounded-full font-bold">
                                <i className="fas fa-chart-line"></i>
                                {primaryDiagnosis?.confidence}% Confidence
                            </div>
                        </div>

                        {/* Triage Header */}
                        <div className={`rounded-xl p-8 shadow-lg text-white border-l-8 ${report.triage.urgency === 'RED' ? 'bg-red-600 border-red-900' :
                            report.triage.urgency === 'YELLOW' ? 'bg-yellow-500 border-yellow-700' :
                                'bg-green-600 border-green-800'
                            }`}>
                            <div className="flex items-center gap-4 mb-4">
                                <span className="text-5xl">
                                    {report.triage.urgency === 'RED' ? '🔴' : report.triage.urgency === 'YELLOW' ? '🟡' : '🟢'}
                                </span>
                                <div>
                                    <h2 className="text-3xl font-black uppercase tracking-tight">Triage: {report.triage.urgency} Urgency</h2>
                                    <p className="text-xl opacity-90">{report.triage.message}</p>
                                </div>
                            </div>
                        </div>

                        {/* Alternative Diagnoses Grid (2 others) */}
                        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
                            <h3 className="text-2xl font-bold mb-6 text-gray-900 flex items-center gap-2">
                                <i className="fas fa-list-check text-indigo-500"></i> Other AI Predictions
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {otherDiagnoses?.map((d, i) => (
                                    <div key={i} className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
                                        <p className="text-lg font-bold text-gray-800">{d.disease}</p>
                                        <p className="text-sm text-gray-500">Confidence: {d.confidence}%</p>
                                        <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                                            <div className="bg-gray-400 h-1.5 rounded-full" style={{ width: `${d.confidence}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Treatment & Medicine Section */}
                        <div className="bg-indigo-900 rounded-xl p-8 shadow-lg text-white">
                            <h4 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                <i className="fas fa-pills"></i> Treatment & Medication
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {report.treatment.map((item, i) => (
                                    <div key={i} className="flex items-start gap-3 bg-white/10 p-4 rounded-lg">
                                        <i className="fas fa-check text-indigo-300 mt-1"></i>
                                        <span className="text-indigo-50 font-medium">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recommendations Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-green-50 rounded-xl p-6 border border-green-100 shadow-sm">
                                <h4 className="font-bold text-green-800 mb-4 flex items-center gap-2 text-lg">
                                    <i className="fas fa-check-circle"></i> What to Do Now
                                </h4>
                                <ul className="list-disc list-inside space-y-2 text-green-900">
                                    {report.triage.whatToDoNow.map((item, i) => <li key={i}>{item}</li>)}
                                </ul>
                            </div>
                            <div className="bg-red-50 rounded-xl p-6 border border-red-100 shadow-sm">
                                <h4 className="font-bold text-red-800 mb-4 flex items-center gap-2 text-lg">
                                    <i className="fas fa-times-circle"></i> What to Avoid
                                </h4>
                                <ul className="list-disc list-inside space-y-2 text-red-900">
                                    {report.triage.whatToAvoid.map((item, i) => <li key={i}>{item}</li>)}
                                </ul>
                            </div>
                        </div>

                        {/* Specialist & Next Steps */}
                        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
                            <div className="mb-8">
                                <h4 className="text-xl font-bold mb-3 text-indigo-900 flex items-center gap-2">
                                    <i className="fas fa-user-doctor"></i> Specialist Recommendation
                                </h4>
                                <p className="p-4 bg-indigo-50 rounded-lg text-indigo-800 border-l-4 border-indigo-400 font-medium">
                                    {report.specialist}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <h4 className="font-bold text-gray-900 mb-2">If symptoms persist or worsen:</h4>
                                    <p className="text-gray-700 italic border-l-4 border-gray-200 pl-4">{report.worseningScenario}</p>
                                </div>
                                <div>
                                    <h4 className="font-bold text-red-700 mb-2">Risk of Inaction:</h4>
                                    <p className="text-gray-700 bg-red-50 p-3 rounded">{report.riskOfInaction}</p>
                                </div>
                            </div>
                        </div>

                        {/* Explanations */}
                        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 space-y-8">
                            <div>
                                <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <i className="fas fa-microscope text-indigo-500"></i> Medical Explanation
                                </h4>
                                <p className="text-gray-700 leading-relaxed text-sm md:text-base">{report.medicalExplanation}</p>
                            </div>
                            <div>
                                <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <i className="fas fa-brain text-indigo-500"></i> Simple Explanation
                                </h4>
                                <p className="text-gray-700 leading-relaxed p-4 bg-gray-50 rounded-lg text-sm md:text-base">{report.simpleExplanation}</p>
                            </div>
                            <div>
                                <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <i className="fas fa-circle-info text-indigo-500"></i> Reasons for Symptoms
                                </h4>
                                <p className="text-gray-700 leading-relaxed text-sm md:text-base">{report.symptomReasons}</p>
                            </div>
                        </div>

                        {/* Initial Input History */}
                        <div className="bg-gray-100 rounded-xl p-8 border border-gray-200">
                            <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <i className="fas fa-history text-gray-500"></i> Initial Patient Statement
                            </h4>
                            <div className="p-4 bg-white border border-gray-200 rounded-lg text-gray-700 italic">
                                "{symptoms.description}"
                            </div>
                        </div>

                        <div className="flex gap-4 pb-12">
                            <button
                                onClick={() => {
                                    setStep('LANDING');
                                    setReport(null);
                                    setSymptoms({ description: '', files: [] });
                                }}
                                className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg"
                            >
                                Start New Analysis
                            </button>
                        </div>
                    </div>
                )}
            </main>
            <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
            <footer className="bg-gray-100 border-t border-gray-200 py-8 text-center text-gray-500 text-sm">
                <p>© 2024 MedAnalyze AI. All interactions are secure and encrypted.</p>
            </footer>
        </div>
    );
};

export default App;