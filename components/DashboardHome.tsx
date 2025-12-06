
import React from 'react';
import { Music, Shield, ArrowLeft, Plus, Fingerprint } from './icons';

interface DashboardHomeProps {
  onNavigate: (view: string) => void;
  onCreateNew: () => void;
}

const ActionCard: React.FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
  colorClass: string;
  onClick: () => void;
  delay?: number;
}> = ({ title, description, icon, colorClass, onClick, delay = 0 }) => (
  <button
    onClick={onClick}
    className="group relative overflow-hidden bg-light-card dark:bg-dark-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 text-left flex flex-col h-full hover:-translate-y-1 animate-slide-up"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className={`absolute top-0 right-0 p-20 opacity-5 rounded-full blur-3xl transform translate-x-10 -translate-y-10 transition-transform group-hover:scale-150 ${colorClass}`} />
    
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${colorClass} text-white shadow-lg`}>
      {icon}
    </div>
    <h3 className="text-lg font-bold text-light-text dark:text-dark-text mb-2 group-hover:text-accent-violet transition-colors">{title}</h3>
    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
      {description}
    </p>
    <div className="mt-auto pt-4 flex items-center text-xs font-bold uppercase tracking-wider text-slate-400 group-hover:text-accent-violet transition-colors">
        Otwórz <ArrowLeft className="w-4 h-4 ml-1 rotate-180" />
    </div>
  </button>
);

const DashboardHome: React.FC<DashboardHomeProps> = ({ onNavigate, onCreateNew }) => {
  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-fade-in">
        <div>
            <h2 className="text-3xl md:text-4xl font-bold text-light-text dark:text-dark-text tracking-tight mb-2">
                Witaj, Twórco 👋
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-lg">
                Co chcesz dzisiaj stworzyć? Wybierz narzędzie, aby rozpocząć.
            </p>
        </div>
        <button 
            onClick={onCreateNew}
            className="px-6 py-3 bg-gradient-to-r from-accent-violet to-accent-blue text-white rounded-full font-bold shadow-lg shadow-accent-violet/30 hover:scale-105 transition-transform flex items-center gap-2"
        >
            <Plus className="w-5 h-5" /> Nowa Analiza
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ActionCard
            title="Analizator Metadanych"
            description="Prześlij pliki audio, aby automatycznie wykryć BPM, tonację i wygenerować profesjonalne metadane."
            icon={<Music className="w-6 h-6" />}
            colorClass="bg-indigo-500"
            onClick={() => onCreateNew()}
            delay={0}
        />
      </div>

      {/* Secondary Tools Grid */}
      <h3 className="text-xl font-bold text-light-text dark:text-dark-text mt-8 animate-fade-in">Szybkie Narzędzia</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button onClick={() => onNavigate('analyze')} className="flex items-center gap-4 p-4 bg-light-card dark:bg-dark-card rounded-xl border border-slate-200 dark:border-slate-800 hover:border-accent-violet transition-colors group text-left animate-slide-up" style={{animationDelay: '300ms'}}>
            <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Shield className="w-5 h-5" />
            </div>
            <div>
                <p className="font-bold text-light-text dark:text-dark-text text-sm">Copyright</p>
                <p className="text-xs text-slate-500">Ochrona plików</p>
            </div>
        </button>
         <button onClick={() => onNavigate('analyze')} className="flex items-center gap-4 p-4 bg-light-card dark:bg-dark-card rounded-xl border border-slate-200 dark:border-slate-800 hover:border-accent-violet transition-colors group text-left animate-slide-up" style={{animationDelay: '350ms'}}>
            <div className="w-10 h-10 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Fingerprint className="w-5 h-5" />
            </div>
            <div>
                <p className="font-bold text-light-text dark:text-dark-text text-sm">Identyfikacja</p>
                <p className="text-xs text-slate-500">ACRCloud & MB</p>
            </div>
        </button>
      </div>
    </div>
  );
};

export default DashboardHome;
