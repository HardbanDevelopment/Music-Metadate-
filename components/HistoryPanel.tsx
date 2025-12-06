import React from 'react';
import { AnalysisRecord } from '../types';
import { Music, Lightbulb } from './icons';

interface HistoryPanelProps {
  history: AnalysisRecord[];
  onSelectItem: (record: AnalysisRecord) => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onSelectItem }) => {
  const getTitle = (record: AnalysisRecord) => {
    if (record.inputType === 'idea') {
      return record.input.description || 'Wygenerowany pomysł';
    }
    return record.input.fileName || record.input.link || 'Analiza pliku';
  };

  return (
    <div className="bg-light-card dark:bg-dark-card rounded-2xl shadow-lg p-6 border border-slate-200 dark:border-slate-800 h-full">
      <h3 className="text-xl font-bold mb-4 text-light-text dark:text-dark-text">Historia Analiz</h3>
      <div className="space-y-4 max-h-[80vh] overflow-y-auto">
        {history.map(record => (
          <button
            key={record.id}
            onClick={() => onSelectItem(record)}
            className="w-full text-left bg-slate-100 dark:bg-slate-800/50 rounded-lg p-4 transition-transform hover:scale-105 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-accent-violet"
          >
            <div className="flex items-center gap-3">
              {record.inputType === 'idea' 
                ? <Lightbulb className="w-5 h-5 text-slate-500 shrink-0" /> 
                : <Music className="w-5 h-5 text-slate-500 shrink-0" />}
              <p className="font-semibold text-sm truncate text-light-text dark:text-dark-text" title={getTitle(record)}>
                {getTitle(record)}
              </p>
            </div>
            <div className="mt-2 flex justify-between text-xs text-slate-500 dark:text-slate-400 pl-8">
              <span>{record.metadata.mainGenre}</span>
              <span className="font-mono">{record.metadata.bpm} BPM</span>
              <span>{`${record.metadata.key} ${record.metadata.mode}`}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default HistoryPanel;