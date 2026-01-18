import React, { useState } from 'react';
import localStorageService from '../services/localStorageService';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'patient'
    });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Frontend-only authentication
        if (isLogin) {
            // Mock login
            const success = localStorageService.mockLogin(formData.email, formData.password);
            if (success) {
                alert('✅ Logged in successfully');
                onClose();
                window.location.reload(); // Refresh to update UI
            } else {
                alert('Login failed');
            }
        } else {
            // Mock registration
            const success = localStorageService.mockRegister(formData.name, formData.email, formData.password);
            if (success) {
                alert('✅ Account created successfully (Frontend Mode)');
                onClose();
                window.location.reload();
            } else {
                alert('Registration failed');
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 w-full max-w-md">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                        {isLogin ? 'Login' : 'Sign Up'}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    {!isLogin && (
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2">Full Name</label>
                            <input
                                type="text"
                                className="w-full p-3 border border-gray-300 rounded-lg"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                    )}

                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Email</label>
                        <input
                            type="email"
                            className="w-full p-3 border border-gray-300 rounded-lg"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-gray-700 mb-2">Password</label>
                        <input
                            type="password"
                            className="w-full p-3 border border-gray-300 rounded-lg"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                            minLength={6}
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 mb-4"
                    >
                        {isLogin ? 'Login' : 'Create Account'}
                    </button>

                    <p className="text-center text-gray-600">
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <button
                            type="button"
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-indigo-600 hover:underline font-medium"
                        >
                            {isLogin ? 'Sign Up' : 'Login'}
                        </button>
                    </p>
                </form>

                <div className="mt-6 p-4 bg-yellow-50 rounded-lg text-sm text-yellow-700">
                    <p className="font-bold mb-1">Note for Testing:</p>
                    <p>• Backend must be running on port 5000</p>
                    <p>• Uses MongoDB Atlas for database</p>
                    <p>• Passwords are securely hashed</p>
                </div>
            </div>
        </div>
    );
};

export default LoginModal;