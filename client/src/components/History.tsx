import React, { useState, useEffect } from 'react';

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
    const [loading, setLoading] = useState(true);
    const [selectedAnalysis, setSelectedAnalysis] = useState<Analysis | null>(null);
    const [shareUrl, setShareUrl] = useState<string>('');

    useEffect(() => {
        if (isOpen) {
            fetchAnalyses();
        }
    }, [isOpen]);

    const fetchAnalyses = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Please login to view history');
                onClose();
                return;
            }

            const response = await fetch('http://localhost:5000/api/analyses', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setAnalyses(data.analyses || []);
            }
        } catch (error) {
            console.error('Error fetching history:', error);
        } finally {
            setLoading(false);
        }
    };

    const generateShareLink = async (analysisId: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/analyses/${analysisId}/share`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setShareUrl(data.shareUrl);
                alert(`Share link generated: ${data.shareUrl}\n\nThis link expires in 7 days.`);
            }
        } catch (error) {
            console.error('Error generating share link:', error);
        }
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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Medical History</h2>
                        <p className="text-gray-600">Your past AI analyses and diagnoses</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                        ✕
                    </button>
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
                            <div className="text-6xl mb-4">📋</div>
                            <h3 className="text-xl font-bold text-gray-700 mb-2">No Analysis History</h3>
                            <p className="text-gray-600">Your AI medical analyses will appear here.</p>
                            <button
                                onClick={onClose}
                                className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
                            >
                                Start Your First Analysis
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {analyses.map((analysis) => (
                                <div
                                    key={analysis.id}
                                    className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${selectedAnalysis?.id === analysis.id ? 'border-indigo-500 bg-indigo-50' : ''
                                        }`}
                                    onClick={() => setSelectedAnalysis(analysis)}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${analysis.urgency === 'RED' ? 'bg-red-100 text-red-800' :
                                                        analysis.urgency === 'YELLOW' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-green-100 text-green-800'
                                                    }`}>
                                                    {analysis.urgency} URGENCY
                                                </span>
                                                <span className="text-sm text-gray-500">
                                                    {formatDate(analysis.date)}
                                                </span>
                                            </div>
                                            <h4 className="font-bold text-gray-900 mb-1">
                                                {analysis.primaryDiagnosis}
                                            </h4>
                                            <p className="text-gray-600 text-sm mb-2">
                                                {analysis.symptoms}
                                            </p>
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-24 bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className="bg-indigo-600 h-2 rounded-full"
                                                            style={{ width: `${analysis.confidence}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-700">
                                                        {analysis.confidence}% confidence
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                generateShareLink(analysis.id);
                                            }}
                                            className="ml-4 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 text-sm font-medium"
                                        >
                                            Share with Doctor
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Database Info Panel */}
                    <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                            <i className="fas fa-database"></i> Full-Stack Feature
                        </h4>
                        <p className="text-blue-700 text-sm">
                            • Data stored in <strong>MongoDB Atlas</strong> (cloud database)<br />
                            • Retrieved via <strong>Node.js/Express API</strong> with JWT authentication<br />
                            • Share links use <strong>JWT tokens</strong> with 7-day expiration<br />
                            • Real-time updates when new analyses are saved
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t p-4 bg-gray-50">
                    <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-600">
                            <span className="font-medium">{analyses.length}</span> analyses stored in database
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={fetchAnalyses}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
                            >
                                Refresh
                            </button>
                            <button
                                onClick={onClose}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default History;