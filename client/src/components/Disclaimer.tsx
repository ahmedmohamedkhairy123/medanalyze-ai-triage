import React from 'react';

const Disclaimer: React.FC = () => {
    return (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded shadow-sm my-6 print:hidden">
            <div className="flex">
                <div className="flex-shrink-0">
                    <span className="text-xl">⚠️</span>
                </div>
                <div className="ml-3">
                    <p className="text-sm text-yellow-700 font-bold mb-1">MEDICAL DISCLAIMER</p>
                    <p className="text-xs text-yellow-700 leading-relaxed">
                        This application is powered by AI and is intended for informational and triage support only.
                        It is NOT a replacement for professional medical advice, diagnosis, or treatment.
                        In the event of a medical emergency, please contact your local emergency services (e.g., 911) immediately.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Disclaimer;