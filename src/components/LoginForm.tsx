import React, { useState } from 'react';
import { Eye, EyeOff, Building2, Calculator } from 'lucide-react';
import { authAPI } from '../api/auth';

interface LoginFormProps {
    onLoginSuccess: (token: string, user: { username: string; role: string }) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await authAPI.login({ username, password });
            onLoginSuccess(response.access_token, {
                username: response.username,
                role: response.role
            });
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    const quickLoginButtons = [
        { username: 'dahern@gototsi.com', label: 'Admin Login', role: 'admin' },
        { username: 'kulike@muehlhan.com', label: 'Viewer Login', role: 'viewer' },
    ];

    const handleQuickLogin = (user: string) => {
        setUsername(user);
        setPassword('123456');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                {/* Header */}
                <div className="text-center">
                    <div className="flex justify-center items-center space-x-2 mb-4">
                        <Building2 className="h-8 w-8 text-blue-600" />
                        <Calculator className="h-8 w-8 text-blue-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">TSI WIP Reporting</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Clean, calculated WIP data to replace confusing spreadsheets
                    </p>
                </div>

                {/* Login Form */}
                <div className="card">
                    <div className="card-content space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-md p-4">
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        )}

                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                                Email Address
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="email"
                                required
                                className="input mt-1"
                                placeholder="Enter your email"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <div className="mt-1 relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    className="input pr-10"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4 text-gray-400" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-gray-400" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="btn-primary w-full"
                        >
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </div>
                </div>

                {/* Quick Login Buttons */}
                <div className="space-y-4">
                    <p className="text-center text-sm text-gray-600">Quick Login (Demo)</p>
                    <div className="grid grid-cols-2 gap-3">
                        {quickLoginButtons.map((user) => (
                            <button
                                key={user.username}
                                onClick={() => handleQuickLogin(user.username)}
                                className="btn-secondary text-xs"
                            >
                                {user.label}
                                <span className="block text-xs text-gray-500 mt-1">
                                    {user.role === 'admin' ? 'Can edit data' : 'View only'}
                                </span>
                            </button>
                        ))}
                    </div>
                    <p className="text-center text-xs text-gray-500">
                        All demo accounts use password: <code className="bg-gray-100 px-1 rounded">123456</code>
                    </p>
                </div>

                {/* Footer */}
                <div className="text-center">
                    <p className="text-xs text-gray-500">
                        Built with FastAPI + React • Replacing spreadsheet confusion since 2025
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;