import React, { useState } from 'react';
import History from './History';

const TopBar: React.FC = () => {
  const [showHistory, setShowHistory] = useState(false);
  const isLoggedIn = localStorage.getItem('token');

  return (
    <>
      <div className="sticky top-0 z-50 bg-indigo-900 text-white py-2 px-4 shadow-md text-xs sm:text-sm print:hidden">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-4">
            <span className="font-medium">© 2024 MedAnalyze AI - All Rights Reserved</span>
            {isLoggedIn && (
              <button
                onClick={() => setShowHistory(true)}
                className="bg-indigo-700 hover:bg-indigo-800 px-3 py-1 rounded text-sm"
              >
                <i className="fas fa-history mr-1"></i> View History
              </button>
            )}
          </div>
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

      <History isOpen={showHistory} onClose={() => setShowHistory(false)} />
    </>
  );
};

export default TopBar;