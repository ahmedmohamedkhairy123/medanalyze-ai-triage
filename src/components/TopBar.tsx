import React from 'react';

const TopBar: React.FC = () => {
    return (
        <div className="sticky top-0 z-50 bg-indigo-900 text-white py-2 px-4 shadow-md text-xs sm:text-sm print:hidden">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
                <span className="font-medium">© 2024 MedAnalyze AI - All Rights Reserved</span>
                <div className="flex items-center gap-1">
                    <span>For technical guidance or inquiries:</span>
                    <a
                        href="mailto:ahmedmohamedkhairy123@gmail.com"
                        className="text-indigo-300 hover:text-white underline transition-colors"
                    >
                        ahmedmohamedkhairy123@gmail.com
                    </a>
                </div>
            </div>
        </div>
    );
};

export default TopBar;