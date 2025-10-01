'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import Link from 'next/link';

export default function AuthModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { login } = useAuth();
  const searchParams = useSearchParams();

  const [view, setView] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const emailFromUrl = searchParams.get('email');
      if (emailFromUrl) setEmail(emailFromUrl);
      const viewFromUrl = searchParams.get('view');
      if (viewFromUrl === 'register') {
        setView('register');
      } else {
        setView('login');
      }
      setError(null);
    }
  }, [isOpen, searchParams]);

  if (!isOpen) return null;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await response.json();
    setIsLoading(false);
    if (response.ok) {
      login(data.user, data.token);
      onClose();
    } else {
      if (data.details && data.details[0]) {
        setError(data.details[0].message);
      } else {
        setError(data.error || 'Registration failed. Please try again.');
      }
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    setIsLoading(false);
    if (response.ok) {
      login(data.user, data.token);
      onClose();
    } else {
      setError(data.error || 'Invalid email or password.');
    }
  };
  
  // A wrapper for form elements to keep styling consistent
  const AuthFormWrapper = ({ title, subtitle, children }: { title: string, subtitle: string, children: React.ReactNode }) => (
    <>
      <h2 className="text-3xl font-extrabold mb-2 text-center text-white">{title}</h2>
      <p className="text-center text-gray-400 mb-8">{subtitle}</p>
      {children}
    </>
  );

  return (
    // Added subtle fade-in animation to the backdrop
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 animate-fade-in-fast" onClick={onClose}>
      {/* Added scale-up animation and more padding/shadow */}
      <div className="bg-gray-800 p-10 rounded-xl text-white w-full max-w-md shadow-2xl animate-scale-up" onClick={(e) => e.stopPropagation()}>
        
        {view === 'login' ? (
          <AuthFormWrapper title="Welcome Back" subtitle="Log in to continue to RBXAI.">
            <form onSubmit={handleLogin} className="space-y-6">
              <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition" required />
              <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition" required />
              <button type="submit" disabled={isLoading} className="w-full p-3 font-semibold text-lg bg-blue-600 rounded-lg hover:bg-blue-700 transition-all transform hover:scale-[1.02] shadow-lg disabled:bg-gray-500 disabled:scale-100">
                {isLoading ? 'Logging In...' : 'Log In'}
              </button>
              <div className="divider my-2"><span>OR</span></div>
              <Link href="/dashboard" className="google-button transition-all transform hover:scale-[1.02] shadow-lg">
                <svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Continue with Google
              </Link>
              <p className="mt-6 text-center text-sm text-gray-400">
                Don&apos;t have an account?{' '}
                <button type="button" onClick={() => setView('register')} className="font-semibold text-blue-400 hover:underline">Sign Up</button>
              </p>
            </form>
          </AuthFormWrapper>
        ) : (
          <AuthFormWrapper title="Create Your Account" subtitle="Join thousands of Roblox developers.">
            <form onSubmit={handleRegister} className="space-y-4">
              <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition" required />
              <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition" required />
              <input type="password" placeholder="Password (min. 8 characters)" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition" required />
              <button type="submit" disabled={isLoading} className="w-full p-3 font-semibold text-lg bg-blue-600 rounded-lg hover:bg-blue-700 transition-all transform hover:scale-[1.02] shadow-lg disabled:bg-gray-500 disabled:scale-100">
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
              <p className="pt-4 text-center text-sm text-gray-400">
                Already have an account?{' '}
                <button type="button" onClick={() => setView('login')} className="font-semibold text-blue-400 hover:underline">Log In</button>
              </p>
            </form>
          </AuthFormWrapper>
        )}
        {error && <p className="mt-6 text-red-400 text-center bg-red-900/50 p-3 rounded-lg">{error}</p>}
      </div>
    </div>
  );
}