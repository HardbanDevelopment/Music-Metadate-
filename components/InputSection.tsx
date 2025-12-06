
import React, { useState, useCallback, useRef } from 'react';
import { Upload, Music, Sparkles, Download } from './icons';
import Button from './Button';
import { BatchItem } from '../types';
import BatchQueueItem from './BatchQueueItem';

interface InputSectionProps {
  batch: BatchItem[];
  setBatch: React.Dispatch<React.SetStateAction<BatchItem[]>>;
  onAnalyze: () => void;
  isProMode: boolean;
  setIsProMode: (isPro: boolean) => void;
  isProcessingBatch: boolean;
  onViewResults: (itemId: string) => void;
  onExportBatch: () => void;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}


const ToggleSwitch: React.FC<{ checked: boolean; onChange: (checked: boolean) => void; }> = ({ checked, onChange }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className={`${checked ? 'bg-accent-violet' : 'bg-slate-300 dark:bg-slate-600'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-accent-violet focus:ring-offset-2 dark:ring-offset-dark-card`}
  >
    <span
      aria-hidden="true"
      className={`${checked ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
    />
  </button>
);


const InputSection: React.FC<InputSectionProps> = ({
  batch, setBatch, onAnalyze, isProMode, setIsProMode, isProcessingBatch, onViewResults, onExportBatch, showToast
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const addFilesToBatch = useCallback((files: FileList) => {
    const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB
    const allFiles = Array.from(files);

    const validFiles = allFiles.filter(file => file.size <= MAX_FILE_SIZE);
    const oversizedFiles = allFiles.filter(file => file.size > MAX_FILE_SIZE);

    if (oversizedFiles.length > 0) {
      const fileNames = oversizedFiles.map(f => `'${f.name}'`).join(', ');
      showToast(`Pliki są za duże (limit 50MB): ${fileNames}`, 'error');
    }

    if (validFiles.length === 0) return;

    const newItems: BatchItem[] = validFiles.map(file => ({
      id: `${file.name}-${file.lastModified}-${file.size}`,
      file,
      status: 'pending',
    }));

    setBatch(prev => {
      const existingIds = new Set(prev.map(item => item.id));
      const uniqueNewItems = newItems.filter(newItem => !existingIds.has(newItem.id));
      if (uniqueNewItems.length > 0) {
        showToast(`Dodano ${uniqueNewItems.length} nowych plików do kolejki.`, 'success');
      }
      return [...prev, ...uniqueNewItems];
    });
  }, [setBatch, showToast]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFilesToBatch(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  }, [addFilesToBatch]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFilesToBatch(e.target.files);
      // Reset input value to allow selecting the same file again if needed
      e.target.value = '';
    }
  };

  const handleRemoveItem = (id: string) => {
    setBatch(prev => prev.filter(item => item.id !== id));
  };

  const handleRetryItem = (id: string) => {
    setBatch(prev => prev.map(item => item.id === id ? { ...item, status: 'pending', error: undefined } : item));
  };

  const completedCount = batch.filter(i => i.status === 'completed').length;
  const totalCount = batch.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;


  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-light-text dark:text-dark-text">Przetwarzanie Wsadowe</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Przeciągnij i upuść wiele plików, aby przeanalizować je wszystkie naraz.</p>
      </div>

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        className={`relative flex flex-col items-center justify-center w-full p-8 md:p-12 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 overflow-hidden
                ${isDragging
            ? 'border-accent-violet bg-accent-violet/10 scale-[1.01] shadow-xl shadow-accent-violet/20'
            : 'border-slate-300 dark:border-slate-600 hover:border-accent-blue dark:hover:border-accent-blue hover:bg-slate-50 dark:hover:bg-slate-800/30'
          }`}
      >
        <input id="dropzone-file" type="file" className="hidden" onChange={handleFileChange} accept="audio/mpeg, audio/wav, audio/flac, audio/mp4" multiple />

        {isDragging ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-accent-violet/20 backdrop-blur-sm z-10 animate-fade-in">
            <Download className="w-16 h-16 text-accent-violet mb-4 animate-bounce" />
            <p className="text-xl font-bold text-accent-violet">Upuść pliki tutaj</p>
          </div>
        ) : (
          <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-full cursor-pointer z-0">
            <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
              <Upload className="w-8 h-8 text-slate-500 dark:text-slate-400" />
            </div>
            <p className="mb-2 text-lg text-center text-slate-700 dark:text-slate-200 font-medium">
              <span className="text-accent-blue hover:underline">Kliknij, by przesłać</span> lub przeciągnij pliki
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">MP3, WAV, FLAC, M4A</p>
          </label>
        )}
      </div>

      {batch.length > 0 && (
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-semibold text-light-text dark:text-dark-text">Kolejka ({completedCount}/{totalCount})</span>
              <span className="text-sm font-mono text-slate-500 dark:text-slate-400">{progress.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
              <div className="bg-gradient-to-r from-accent-violet to-accent-blue h-2.5 rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
            </div>
          </div>

          {isProcessingBatch && (
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200 rounded-lg text-sm text-center font-medium flex items-center justify-center gap-2 animate-pulse">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              Trwa przetwarzanie... Proszę nie zamykać tej karty przeglądarki.
            </div>
          )}

          <div className="space-y-2 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
            {batch.map(item => (
              <BatchQueueItem
                key={item.id}
                item={item}
                onRemove={handleRemoveItem}
                onRetry={handleRetryItem}
                onViewResults={onViewResults}
                isProcessingBatch={isProcessingBatch}
              />
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-slate-100 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50">
        <div className="flex-grow">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-accent-violet" />
            <label htmlFor="pro-mode-toggle" className="font-semibold text-light-text dark:text-dark-text cursor-pointer">Analiza Pro</label>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Dodaje szczegółową analizę instrumentarium, stylu wokalnego, struktury i zastosowań.</p>
        </div>
        <div className="flex-shrink-0 self-end sm:self-center">
          <ToggleSwitch checked={isProMode} onChange={setIsProMode} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Button onClick={onExportBatch} variant="secondary" size="lg" className="w-full" disabled={isProcessingBatch || completedCount === 0}>
          <Download className="w-6 h-6" />
          Eksportuj CSV ({completedCount})
        </Button>
        <Button onClick={onAnalyze} variant="primary" size="lg" className="w-full" disabled={isProcessingBatch || batch.filter(i => i.status === 'pending').length === 0}>
          {isProcessingBatch ? (
            <>
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Przetwarzanie...
            </>
          ) : (
            <>
              <Music className="w-6 h-6" />
              Analizuj Wsad ({batch.filter(i => i.status === 'pending').length})
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default InputSection;
