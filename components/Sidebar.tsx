
import React from 'react';
import { Home, Music, LayoutDashboard, Clock, Wrench, Settings, LogOut, User, Info } from './icons';
import { SupabaseSession } from '../types';
import QuotaStatus from './QuotaStatus';

interface SidebarProps {
  currentView: string;
  onChangeView: (view: any) => void;
  onOpenAbout: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  session: SupabaseSession | null;
  quota: { count: number; limit: number; } | null;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, onOpenAbout, isOpenMobile, onCloseMobile, session, quota }) => {
  const menuItems = [
    { id: 'analyze', label: 'Analiza', icon: Music },
    { id: 'history', label: 'Historia', icon: Clock },
  ];

  const handleNavigation = (id: string) => {
    onChangeView(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpenMobile && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed top-0 left-0 z-50 h-screen w-64 bg-light-card dark:bg-dark-card border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-300 lg:translate-x-0 flex flex-col ${isOpenMobile ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Logo Section */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-accent-violet to-accent-blue rounded-lg flex items-center justify-center shadow-lg shadow-accent-violet/20">
                    <Music className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="font-bold text-light-text dark:text-dark-text leading-tight tracking-tight">
                        Music Metadata
                    </h1>
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Engine Pro</span>
                </div>
            </div>
        </div>

        {/* Navigation */}
        <nav className="flex-grow p-4 space-y-1 overflow-y-auto">
            {menuItems.map(item => (
                <button
                    key={item.id}
                    onClick={() => handleNavigation(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                        currentView === item.id 
                        ? 'bg-accent-violet/10 text-accent-violet font-semibold' 
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                >
                    <item.icon className={`w-5 h-5 transition-colors ${currentView === item.id ? 'text-accent-violet' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
                    {item.label}
                </button>
            ))}
            
            <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800">
                <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Aplikacja</p>
                <button
                    onClick={onOpenAbout}
                    className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm"
                >
                    <Info className="w-4 h-4" /> O Programie
                </button>
            </div>
        </nav>

        {/* Quota/User Section */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
             {session && quota && (
                <QuotaStatus count={quota.count} limit={quota.limit} />
             )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
