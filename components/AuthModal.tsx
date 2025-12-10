
import React, { useState } from 'react';
import { User, Mail, Lock, LogIn, X } from './icons';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: (session: any) => void; // A session object from Supabase
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

type AuthView = 'signin' | 'signup';

const AuthModal: React.FC<AuthModalProps> = ({ onClose, onSuccess, showToast }) => {
  const [view, setView] = useState<AuthView>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const endpoint = view === 'signin' ? '/auth/signin' : '/auth/signup';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'An unknown error occurred.');
      }

      if (view === 'signup') {
        showToast('Registration successful! Check your email to verify your account.', 'success');
        setView('signin'); // Switch to signin view after successful signup
      } else {
        onSuccess(data); // Pass the whole session object up
        showToast('Logged in successfully!', 'success');
        onClose();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      showToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in-fast" onClick={onClose}>
      <div className="relative bg-light-card dark:bg-dark-card w-full max-w-md p-8 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors">
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-light-text dark:text-dark-text">
            {view === 'signin' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {view === 'signin' ? 'Sign in to continue.' : 'Join us and start analyzing.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="w-5 h-5 text-slate-400 absolute top-1/2 left-3 -translate-y-1/2" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-3 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-accent-violet outline-none transition"
            />
          </div>
          <div className="relative">
            <Lock className="w-5 h-5 text-slate-400 absolute top-1/2 left-3 -translate-y-1/2" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full pl-10 pr-4 py-3 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-accent-violet outline-none transition"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-accent-violet text-white font-bold py-3 rounded-lg hover:bg-violet-700 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                <span>{view === 'signin' ? 'Sign In' : 'Sign Up'}</span>
              </>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
          {view === 'signin' ? "Don't have an account?" : "Already have an account?"}
          <button
            onClick={() => setView(view === 'signin' ? 'signup' : 'signin')}
            className="font-bold text-accent-violet hover:underline ml-1"
          >
            {view === 'signin' ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthModal;
