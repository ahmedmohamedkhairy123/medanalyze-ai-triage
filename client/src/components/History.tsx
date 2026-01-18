import React, { useState, useEffect } from 'react';
import localStorageService from '../services/localStorageService';
import { generatePDF } from '../services/pdfExportService';
interface Analysis {
    id: string;
    symptoms: string;
    primaryDiagnosis: string;
    confidence: number;
    urgency: 'RED' | 'YELLOW' | 'GREEN';
    date: string;
}

interface HistoryProps {
    isOpen: boolean;
    onClose: () => void;
}

const History: React.FC<HistoryProps> = ({ isOpen, onClose }) => {
    const [analyses, setAnalyses] = useState<Analysis[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedAnalysis, setSelectedAnalysis] = useState<Analysis | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        if (isOpen) {
            loadAnalyses();
        }
    }, [isOpen]);

    const loadAnalyses = () => {
        setLoading(true);
        try {
            const allAnalyses = localStorageService.getAnalyses();

            // Transform to display format
            const formattedAnalyses: Analysis[] = allAnalyses.map(a => ({
                id: a.id,
                symptoms: a.symptoms.length > 100 ? a.symptoms.substring(0, 100) + '...' : a.symptoms,
                primaryDiagnosis: a.report.diagnoses[0]?.disease || 'Unknown Diagnosis',
                confidence: a.report.diagnoses[0]?.confidence || 0,
                urgency: a.report.triage.urgency,
                date: a.date
            }));

            setAnalyses(formattedAnalyses);
            setStats(localStorageService.getStats());
        } catch (error) {
            console.error('Error loading analyses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = (id: string, format: 'json' | 'text') => {
        if (format === 'json') {
            localStorageService.exportAnalysis(id);
            alert('✅ Report downloaded as JSON file! Share with your doctor.');
        } else {
            const text = localStorageService.exportAsText(id);
            navigator.clipboard.writeText(text)
                .then(() => alert('✅ Report copied to clipboard! Paste it anywhere.'))
                .catch(() => alert('Failed to copy to clipboard'));
        }
    };

    const handleDelete = (id: string) => {
        localStorageService.deleteAnalysis(id);
        loadAnalyses(); // Refresh list
        setShowDeleteConfirm(null);
        alert('🗑️ Analysis deleted from local storage');
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getUrgencyColor = (urgency: string) => {
        switch (urgency) {
            case 'RED': return 'bg-red-100 text-red-800 border-red-300';
            case 'YELLOW': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'GREEN': return 'bg-green-100 text-green-800 border-green-300';
            default: return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-indigo-50 to-white">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">📋 Medical History</h2>
                        <p className="text-gray-600">All your AI analyses stored in browser</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {stats && (
                            <div className="text-sm bg-white px-3 py-1 rounded-full border">
                                <span className="font-bold text-indigo-600">{stats.total}</span> analyses
                            </div>
                        )}
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 text-2xl bg-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[70vh]">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                            <p className="mt-4 text-gray-600">Loading your medical history...</p>
                        </div>
                    ) : analyses.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4 text-gray-300">📋</div>
                            <h3 className="text-xl font-bold text-gray-700 mb-2">No Analysis History Yet</h3>
                            <p className="text-gray-600 mb-6">Your AI medical analyses will appear here after you complete one.</p>
                            <button
                                onClick={onClose}
                                className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-all hover:scale-105"
                            >
                                <i className="fas fa-plus mr-2"></i> Start Your First Analysis
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {analyses.map((analysis) => (
                                <div
                                    key={analysis.id}
                                    className={`border rounded-xl p-5 transition-all hover:shadow-lg ${selectedAnalysis?.id === analysis.id
                                        ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200'
                                        : 'border-gray-200 bg-white'
                                        }`}
                                    onClick={() => setSelectedAnalysis(analysis)}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-3">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getUrgencyColor(analysis.urgency)}`}>
                                                    <i className={`fas fa-circle mr-1 text-xs ${analysis.urgency === 'RED' ? 'text-red-500' :
                                                        analysis.urgency === 'YELLOW' ? 'text-yellow-500' :
                                                            'text-green-500'
                                                        }`}></i>
                                                    {analysis.urgency} URGENCY
                                                </span>
                                                <span className="text-sm text-gray-500">
                                                    <i className="far fa-calendar mr-1"></i>
                                                    {formatDate(analysis.date)}
                                                </span>
                                            </div>

                                            <h4 className="font-bold text-gray-900 text-lg mb-2">
                                                {analysis.primaryDiagnosis}
                                            </h4>

                                            <p className="text-gray-600 text-sm mb-3">
                                                <i className="fas fa-comment-medical mr-2 text-gray-400"></i>
                                                {analysis.symptoms}
                                            </p>

                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-32 bg-gray-200 rounded-full h-2.5">
                                                        <div
                                                            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2.5 rounded-full transition-all duration-500"
                                                            style={{ width: `${analysis.confidence}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-sm font-bold text-gray-700 min-w-[60px]">
                                                        {analysis.confidence}% confidence
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="ml-4 flex flex-col gap-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const fullAnalysis = localStorageService.getAnalysis(analysis.id);
                                                    if (fullAnalysis) {
                                                        generatePDF(fullAnalysis);
                                                    }
                                                }}
                                                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm font-medium transition-all hover:scale-105"
                                                title="Download as PDF"
                                            >
                                                <i className="fas fa-file-pdf mr-2"></i> PDF
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleExport(analysis.id, 'text');
                                                }}
                                                className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm font-medium transition-all hover:scale-105"
                                                title="Copy as text"
                                            >
                                                <i className="far fa-copy mr-2"></i> Copy
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setShowDeleteConfirm(analysis.id);
                                                }}
                                                className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-sm font-medium transition-all hover:scale-105"
                                                title="Delete analysis"
                                            >
                                                <i className="fas fa-trash mr-2"></i> Delete
                                            </button>
                                        </div>
                                    </div>

                                    {/* Delete Confirmation */}
                                    {showDeleteConfirm === analysis.id && (
                                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                                            <p className="text-red-700 font-medium mb-2">
                                                <i className="fas fa-exclamation-triangle mr-2"></i>
                                                Delete this analysis permanently?
                                            </p>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(analysis.id);
                                                    }}
                                                    className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                                                >
                                                    Yes, Delete
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setShowDeleteConfirm(null);
                                                    }}
                                                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Deployment Info Panel */}
                    <div className="mt-8 p-5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 shadow-sm">
                        <h4 className="font-bold text-green-800 mb-3 flex items-center gap-2 text-lg">
                            <i className="fas fa-rocket text-green-600"></i> Perfect for Deployment!
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-green-700 text-sm mb-2">
                                    <span className="font-bold"></span>
                                    • Works on any hosting (Vercel, Netlify, GitHub Pages)<br />
                                    • Zero server costs - completely free!
                                </p>
                            </div>
                            <div>
                                <p className="text-green-700 text-sm mb-2">
                                    <span className="font-bold">🔒 Local Storage Benefits</span><br />
                                    • Data stays in your browser (privacy)<br />
                                    • Works offline without internet<br />
                                    • Export/share reports as files<br />
                                    • Fast - no API delays
                                </p>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-green-200">
                            <p className="text-green-600 text-xs">
                                <i className="fas fa-lightbulb mr-1"></i>
                                Pro Tip: Use the export buttons to save or share your analyses with healthcare providers!
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t p-4 bg-gray-50">
                    <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-600">
                            <i className="fas fa-database mr-1"></i>
                            Stored in <strong>browser localStorage</strong> •
                            <span className="ml-2 font-medium">{analyses.length}</span> analyses
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    if (analyses.length > 0 && window.confirm('Clear ALL analyses?')) {
                                        localStorageService.clearAll();
                                        loadAnalyses();
                                        alert('All analyses cleared');
                                    }
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 text-sm"
                                disabled={analyses.length === 0}
                            >
                                <i className="fas fa-broom mr-1"></i> Clear All
                            </button>
                            <button
                                onClick={loadAnalyses}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 text-sm"
                            >
                                <i className="fas fa-sync-alt mr-1"></i> Refresh
                            </button>
                            <button
                                onClick={onClose}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                            >
                                Close History
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default History;