import React from 'react';
import { Music, Cloud, Database } from './icons';

interface StatsCardProps {
    title: string;
    value: string;
    subtitle: string;
    icon: React.ReactNode;
    trend?: string;
    trendUp?: boolean;
    colorClass: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, subtitle, icon, trend, trendUp, colorClass }) => (
    <div className="bg-light-card dark:bg-dark-card border border-slate-200 dark:border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-accent-violet transition-colors duration-300">
        <div className={`absolute top-0 right-0 p-16 opacity-5 rounded-full blur-2xl transform translate-x-8 -translate-y-8 ${colorClass}`} />

        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl ${colorClass} bg-opacity-10 dark:bg-opacity-20 text-white`}>
                {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { className: `w-6 h-6 ${colorClass.replace('bg-', 'text-')}` }) : icon}
            </div>
            {trend && (
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${trendUp ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400'}`}>
                    {trend}
                </span>
            )}
        </div>

        <h3 className="text-2xl font-bold text-light-text dark:text-dark-text mb-1 tracking-tight">
            {value}
        </h3>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {title}
        </p>
        <p className="text-xs text-slate-400 mt-2 font-mono">
            {subtitle}
        </p>
    </div>
);

const DashboardStats: React.FC = () => {
    // Mock data - in real app, fetch from backend/history
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
            <StatsCard
                title="Analyzed Tracks"
                value="1,248"
                subtitle="+24 this week"
                icon={<Music />}
                trend="+12%"
                trendUp={true}
                colorClass="bg-accent-violet"
            />
            <StatsCard
                title="Generative AI Usage"
                value="45%"
                subtitle="Reset in 14 days"
                icon={<Cloud />}
                colorClass="bg-accent-blue"
            />
            <StatsCard
                title="Storage Used"
                value="2.4 GB"
                subtitle="Limit 10 GB"
                icon={<Database />}
                trend="+5%"
                trendUp={false}
                colorClass="bg-pink-500"
            />
        </div>
    );
};

export default DashboardStats;
