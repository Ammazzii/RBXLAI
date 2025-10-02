// src/components/EmailAuthForm.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function EmailAuthForm() {
    const { login } = useAuth();
    const router = useRouter();

    const [view, setView] = useState<'email_input' | 'password_login' | 'password_register'>('email_input');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // --- API HANDLERS (Unchanged) ---
    
    const handleEmailCheck = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        if (!email.trim()) {
            setError("Please enter a valid email address.");
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/auth/check-email', { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to check email existence.');
            }

            const data = await response.json();
            setIsLoading(false);
            setPassword(''); 

            if (data.exists) {
                setView('password_login');
            } else {
                setView('password_register');
            }
       } catch (error) {
            const message = error instanceof Error ? error.message : 'A network error occurred. Please try again.';
            setError(message);
            setIsLoading(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            setIsLoading(false);

            if (response.ok) {
                login(data.user, data.token);
                router.push('/dashboard'); 
            } else {
                setError(data.error || 'Invalid password.');
            }
        } catch (error) {
            setError('A network error occurred during login.');
            setIsLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });
            const data = await response.json();
            setIsLoading(false);

            if (response.ok) {
                login(data.user, data.token);
                router.push('/dashboard'); 
            } else {
                setError(data.error || 'Registration failed.');
            }
        } catch (error) {
            setError('A network error occurred during registration.');
            setIsLoading(false);
        }
    };


    // --- RENDER VIEWS ---

    const renderEmailInput = () => (
        // Uses the custom class 'auth-form-wrapper' for controlling width and centering
        <form onSubmit={handleEmailCheck} className="auth-form-wrapper flex flex-col items-center mx-auto space-y-4">
            {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
            
            {/* Input Field & Continue Button (Uses Custom CSS Class for visual fidelity) */}
            <div className="signup-form-group w-full">
                <input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input-field" /* Custom CSS for input styling */
                    required
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    disabled={isLoading}
                    className="form-continue-button cta-button" /* Custom CSS for button styling */
                >
                    {isLoading ? '...' : 'Continue'}
                </button>
            </div>
            
            {/* OR Separator (Uses Custom CSS Class for spacing) */}
            <div className="form-divider w-full">
                <span>OR</span>
            </div>

            {/* Google Button - Uses Custom CSS class for height alignment */}
            <Link 
                href="/dashboard" // Placeholder for Google SSO redirection
                className="w-full flex items-center justify-center font-semibold text-lg bg-gray-800 border border-gray-700 rounded-xl hover:bg-gray-700 transition shadow-lg space-x-4 google-button-match"
            >
                <svg width="24" height="24" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                <span>Continue with Google</span>
            </Link>

            {/* Register text */}
            <p className="text-center text-sm text-gray-500 pt-6">
                Don&apos;t have an account? <span className="text-blue-400 hover:underline">Register</span>
            </p>
        </form>
    );

    const renderPasswordLogin = () => (
        // Uses the custom class 'auth-form-wrapper' for controlling width and centering
        <form onSubmit={handleLogin} className="auth-form-wrapper flex flex-col items-center mx-auto space-y-6">
            <h3 className="text-2xl font-bold text-white mb-2">Welcome Back</h3>
            <p className="text-gray-400 text-center">Enter your password for <span className="font-semibold text-white">{email}</span></p>

            {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
            
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 bg-gray-900 border border-gray-700 rounded-xl text-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                required
            />

            <button
                type="submit"
                disabled={isLoading}
                className="w-full p-4 font-bold text-lg bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors disabled:bg-gray-500 mt-4"
            >
                {isLoading ? 'Logging In...' : 'Log In'}
            </button>
            
            <Link href="#" className="text-sm text-blue-400 hover:underline">Forgot password?</Link>
            <button type="button" onClick={() => { setView('email_input'); setPassword(''); }} className="text-sm text-gray-500 hover:text-gray-400 underline">Change Email</button>
        </form>
    );

    const renderPasswordRegister = () => (
        <form onSubmit={handleRegister} className="auth-form-wrapper flex flex-col items-center mx-auto space-y-6">
            <h3 className="text-2xl font-bold text-white mb-2">Create Your Account</h3>
            <p className="text-gray-400 text-center">Complete your registration for <span className="font-semibold text-white">{email}</span></p>

            {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

            <input
                type="text"
                placeholder="Full Name (Optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-4 bg-gray-900 border border-gray-700 rounded-xl text-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
            
            <input
                type="password"
                placeholder="Choose a Password (min 8 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 bg-gray-900 border border-gray-700 rounded-xl text-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                required
            />

            <button
                type="submit"
                disabled={isLoading}
                className="w-full p-4 font-bold text-lg bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors disabled:bg-gray-500 mt-4"
            >
                {isLoading ? 'Registering...' : 'Create Account'}
            </button>
             <button type="button" onClick={() => setView('email_input')} className="text-sm text-gray-500 hover:text-gray-400 underline pt-4">Start Over</button>
        </form>
    );

    switch (view) {
        case 'email_input':
            return renderEmailInput();
        case 'password_login':
            return renderPasswordLogin();
        case 'password_register':
            return renderPasswordRegister();
        default:
            return renderEmailInput();
    }
}