'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

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
      setError(null); // Clear errors when modal opens
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
      // THIS IS THE FIX: Show specific error messages from your API
      if (data.details && data.details[0]) {
        setError(data.details[0].message); // e.g., "Password must be at least 8 characters"
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-gray-800 p-8 rounded-lg text-white w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        
        {view === 'login' ? (
          <form onSubmit={handleLogin}>
            <h2 className="text-2xl font-bold mb-4 text-center">Welcome Back</h2>
            <p className="text-center text-gray-400 mb-6">Log in to continue to RBXAI.</p>
            <input
              type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 mb-4 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" required
            />
            <input
              type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 mb-4 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" required
            />
            <button type="submit" disabled={isLoading} className="w-full p-3 bg-blue-600 rounded hover:bg-blue-700 transition-colors disabled:bg-gray-500">
              {isLoading ? 'Logging In...' : 'Log In'}
            </button>
            <p className="mt-4 text-center text-sm text-gray-400">
             Don&apos;t have an account?{' '}
              <button type="button" onClick={() => setView('register')} className="font-semibold text-blue-400 hover:underline">
                Sign Up
              </button>
            </p>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <h2 className="text-2xl font-bold mb-4 text-center">Create Your Account</h2>
            <p className="text-center text-gray-400 mb-6">Join thousands of Roblox developers.</p>
            <input
              type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)}
              className="w-full p-3 mb-4 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" required
            />
            <input
              type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 mb-4 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" required
            />
            <input
              type="password" placeholder="Password (min. 8 characters)" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 mb-4 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" required
            />
            <button type="submit" disabled={isLoading} className="w-full p-3 bg-blue-600 rounded hover:bg-blue-700 transition-colors disabled:bg-gray-500">
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
            <p className="mt-4 text-center text-sm text-gray-400">
              Already have an account?{' '}
              <button type="button" onClick={() => setView('login')} className="font-semibold text-blue-400 hover:underline">
                Log In
              </button>
            </p>
          </form>
        )}
        {error && <p className="mt-4 text-red-400 text-center bg-red-900/50 p-3 rounded">{error}</p>}
      </div>
    </div>
  );
}