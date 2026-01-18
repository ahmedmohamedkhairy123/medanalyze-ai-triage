import React, { useState, useEffect } from 'react';
import History from './History';
import localStorageService from '../services/localStorageService';

const TopBar: React.FC = () => {
    const [showHistory, setShowHistory] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        // Check login status on mount
        const loggedIn = localStorageService.isLoggedIn();
        setIsLoggedIn(loggedIn);
        if (loggedIn) {
            setUser(localStorageService.getCurrentUser());
        }
    }, []);

    const handleLogout = () => {
        localStorageService.logout();
        setIsLoggedIn(false);
        setUser(null);
        alert('Logged out successfully');
        window.location.reload();
    };

    return (
        <>
            <div className="sticky top-0 z-50 bg-gradient-to-r from-indigo-900 to-purple-900 text-white py-3 px-4 shadow-lg print:hidden">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <i className="fas fa-heart-pulse text-xl"></i>
                            <span className="font-bold text-lg">MedAnalyze AI</span>
                        </div>

                        {isLoggedIn && (
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setShowHistory(true)}
                                    className="bg-white/20 hover:bg-white/30 px-4 py-1.5 rounded-lg text-sm font-medium transition-all hover:scale-105"
                                >
                                    <i className="fas fa-history mr-2"></i> View History
                                </button>

                                {user && (
                                    <div className="hidden md:flex items-center gap-2 text-sm bg-white/10 px-3 py-1 rounded-full">
                                        <i className="fas fa-user-circle"></i>
                                        <span>{user.name}</span>
                                    </div>
                                )}

                                <button
                                    onClick={handleLogout}
                                    className="text-sm bg-red-500/20 hover:bg-red-500/30 px-3 py-1 rounded-lg"
                                    title="Logout"
                                >
                                    <i className="fas fa-sign-out-alt"></i>
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-3 text-xs sm:text-sm">
                        <div className="hidden sm:flex items-center gap-2 bg-black/20 px-3 py-1 rounded-full">
                            <i className="fas fa-bolt text-yellow-300"></i>

                        </div>
                        <div className="flex items-center gap-1">
                            <span>for any inquiries or technical advice contact</span>
                            <a
                                href="mailto:ahmedmohamedkhairy123@gmail.com"
                                className="text-indigo-300 hover:text-white underline transition-colors font-medium"
                            >
                                ahmedmohamedkhairy123@gmail.com
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <History isOpen={showHistory} onClose={() => setShowHistory(false)} />
        </>
    );
};

export default TopBar;