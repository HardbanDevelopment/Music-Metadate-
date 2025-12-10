
import React, { useState, useRef, useEffect } from 'react';
// ... imports
import { Sun, Moon, User, LogOut, Wrench } from './icons'; // Add Wrench
import { SupabaseSession } from '../types';

interface HeaderProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  session: SupabaseSession | null;
  onLogin: () => void;
  onLogout: () => void;
  onOpenDiagnostics: () => void;
}

const Header: React.FC<HeaderProps> = ({ theme, toggleTheme, session, onLogin, onLogout, onOpenDiagnostics }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={toggleTheme}
        className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? (
          <Sun className="w-5 h-5 text-yellow-400" />
        ) : (
          <Moon className="w-5 h-5 text-slate-600" />
        )}
      </button>
      <button
        onClick={onOpenDiagnostics}
        className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        title="Diagnostics"
      >
        <Wrench className="w-5 h-5 text-slate-600 dark:text-slate-400" />
      </button>

      {session ? (
        <div className="relative" ref={profileRef}>
          <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 hidden sm:inline">{session.user.email}</span>
            <div className="w-8 h-8 bg-gradient-to-tr from-accent-violet to-accent-blue rounded-full flex items-center justify-center text-white font-bold text-sm">
              {session.user.email?.charAt(0).toUpperCase()}
            </div>
          </button>
          {isProfileOpen && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-light-card dark:bg-dark-card border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg py-1 animate-fade-in-fast">
              <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-700">
                <p className="text-sm font-medium text-light-text dark:text-dark-text truncate">{session.user.email}</p>
              </div>
              <button
                onClick={() => {
                  onLogout();
                  setIsProfileOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Log out
              </button>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={onLogin}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-accent-violet text-white font-bold rounded-lg hover:bg-violet-700 transition-colors text-sm"
        >
          <User className="w-4 h-4" />
          Log in
        </button>
      )}
    </div>
  );
};

export default Header;
