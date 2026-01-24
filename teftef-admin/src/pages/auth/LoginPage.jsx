import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Loader2, Eye, EyeOff } from 'lucide-react';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to login. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#fafafa] p-4 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-neutral-200/50 rounded-full blur-3xl opacity-50" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-neutral-300/50 rounded-full blur-3xl opacity-50" />

            <div
                className="w-full max-w-md"
            >
                <div className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-[0_8px_32px_0_rgba(0,0,0,0.05)] rounded-3xl p-8 md:p-10">
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-12 h-12 bg-[#0a0a0a] rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                            <Lock className="text-white w-6 h-6" />
                        </div>
                        <h1 className="text-2xl font-semibold text-[#0a0a0a]">Admin Portal</h1>
                        <p className="text-neutral-500 mt-2 text-center">Enter your credentials to access the dashboard</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div
                                className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-medium"
                            >
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-neutral-700 ml-1">Email Address</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-neutral-400 group-focus-within:text-[#0a0a0a] transition-colors" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@example.com"
                                    className="block w-full pl-11 pr-4 py-3 bg-neutral-50 border border-neutral-100 rounded-xl text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#0a0a0a]/5 focus:border-[#0a0a0a] transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-neutral-700 ml-1">Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-neutral-400 group-focus-within:text-[#0a0a0a] transition-colors" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="block w-full pl-11 pr-11 py-3 bg-neutral-50 border border-neutral-100 rounded-xl text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#0a0a0a]/5 focus:border-[#0a0a0a] transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5 text-neutral-400 hover:text-neutral-600 transition-colors" />
                                    ) : (
                                        <Eye className="h-5 w-5 text-neutral-400 hover:text-neutral-600 transition-colors" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full flex items-center justify-center py-3.5 px-4 rounded-xl text-sm font-semibold text-white bg-[#0a0a0a] hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0a0a0a] transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-md"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                                    Signing In...
                                </>
                            ) : (
                                "Sign In"
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-neutral-100 text-center">
                        <p className="text-xs text-neutral-400 uppercase tracking-widest font-medium">
                            Verified Secure Session
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
