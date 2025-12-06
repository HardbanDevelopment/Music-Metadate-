import React from 'react';
import { Zap } from './icons'; // Assuming Zap icon exists

interface QuotaStatusProps {
  count: number;
  limit: number;
}

const QuotaStatus: React.FC<QuotaStatusProps> = ({ count, limit }) => {
  const percentage = limit > 0 ? (count / limit) * 100 : 0;
  
  let barColor = 'bg-green-500';
  if (percentage > 85) {
    barColor = 'bg-red-500';
  } else if (percentage > 60) {
    barColor = 'bg-yellow-500';
  }

  return (
    <div className="px-4 py-3 bg-slate-100/50 dark:bg-slate-800/50 rounded-lg">
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Kredyty AI</span>
        </div>
        <span className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400">
          {count}/{limit}
        </span>
      </div>
      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
        <div 
          className={`h-1.5 rounded-full ${barColor} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default QuotaStatus;
