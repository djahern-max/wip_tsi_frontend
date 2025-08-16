import React, { useState } from 'react';
import { Eye, EyeOff, Calculator, Zap } from 'lucide-react';
import { authAPI } from '../lib/api';

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
        { username: 'dahern@gototsi.com', label: 'Admin Login', role: 'admin', icon: Zap },
        { username: 'kulike@muehlhan.com', label: 'Viewer Login', role: 'viewer', icon: Eye },
    ];

    const handleQuickLogin = (user: string) => {
        setUsername(user);
        setPassword('123456');
    };

    return (
        <div className="min-h-screen bg-gradient-dark flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                {/* Header with React-inspired design */}
                <div className="text-center">
                    <div className="flex justify-center items-center space-x-3 mb-6">
                        <div className="relative">
                            <Calculator className="h-10 w-10 text-cyan-400 animate-spin-slow" />
                            <div className="absolute -top-1 -right-1 h-3 w-3 bg-cyan-400 rounded-full animate-pulse"></div>
                        </div>
                        <div className="h-8 w-px bg-cyan-400/30"></div>
                        <div className="text-3xl font-bold">
                            <span className="text-cyan-400">TSI</span>
                            <span className="text-cyan-200 ml-2">WIP</span>
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-cyan-100 mb-2">
                        Modern WIP Reporting
                    </h2>
                    <p className="text-sm text-cyan-300/80">
                        Replacing spreadsheet confusion with calculated clarity
                    </p>
                    <div className="mt-4 flex justify-center">
                        <div className="bg-gradient-cyan text-dark-900 px-3 py-1 rounded-full text-xs font-semibold">
                            $43.1M Total Contract Value
                        </div>
                    </div>
                </div>

                {/* Login Form */}
                <div className="card">
                    <div className="card-content space-y-6">
                        {error && (
                            <div className="bg-red-900/50 border border-red-700 rounded-md p-4">
                                <p className="text-sm text-red-300">{error}</p>
                            </div>
                        )}

                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-cyan-200 mb-2">
                                Email Address
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="email"
                                required
                                className="input"
                                placeholder="Enter your email"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-cyan-200 mb-2">
                                Password
                            </label>
                            <div className="relative">
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
                                        <EyeOff className="h-4 w-4 text-cyan-400" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-cyan-400" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="btn-primary w-full h-12 text-base font-semibold"
                        >
                            {isLoading ? (
                                <div className="flex items-center space-x-2">
                                    <Calculator className="h-4 w-4 animate-spin" />
                                    <span>Signing in...</span>
                                </div>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </div>
                </div>

                {/* Quick Login Buttons */}
                <div className="space-y-4">
                    <div className="text-center">
                        <div className="inline-flex items-center space-x-2 text-sm text-cyan-300">
                            <div className="h-px bg-cyan-600 flex-1 w-12"></div>
                            <span>Quick Login (Demo)</span>
                            <div className="h-px bg-cyan-600 flex-1 w-12"></div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {quickLoginButtons.map((user) => {
                            const IconComponent = user.icon;
                            return (
                                <button
                                    key={user.username}
                                    onClick={() => handleQuickLogin(user.username)}
                                    className="btn-secondary p-4 h-auto flex flex-col items-center space-y-2 hover:border-cyan-400 transition-colors group"
                                >
                                    <IconComponent className="h-5 w-5 text-cyan-400 group-hover:text-cyan-300" />
                                    <div className="text-xs font-medium">{user.label}</div>
                                    <div className="text-xs text-cyan-400 opacity-75">
                                        {user.role === 'admin' ? 'Can edit data' : 'View only'}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    <div className="text-center">
                        <p className="text-xs text-cyan-400/60">
                            Demo password: <code className="bg-dark-700 text-cyan-300 px-2 py-1 rounded font-mono">123456</code>
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center space-y-3">
                    <div className="flex justify-center items-center space-x-4 text-xs text-cyan-400/60">
                        <span>FastAPI Backend</span>
                        <div className="h-1 w-1 bg-cyan-400 rounded-full"></div>
                        <span>React Frontend</span>
                        <div className="h-1 w-1 bg-cyan-400 rounded-full"></div>
                        <span>PostgreSQL</span>
                    </div>
                    <p className="text-xs text-cyan-400/40">
                        Built with ❤️ to eliminate spreadsheet confusion
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;