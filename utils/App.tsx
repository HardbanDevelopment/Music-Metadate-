
import { useState, useEffect } from 'react';
import { generateMetadata } from './services/geminiService';
import { Metadata, AnalysisRecord, BatchItem } from './types';
import Header from './components/Header';
import InputSection from './components/InputSection';
import ResultsSection from './components/results/ResultsSection';
import HistoryPanel from './components/HistoryPanel';
import Toast from './components/Toast';
import AboutModal from './components/AboutModal';
import LegalModal, { LegalDocType } from './components/LegalModal';
import ResourcesModal, { ResourceDocType } from './components/ResourcesModal';
import Footer from './components/Footer';
import Sidebar from './components/Sidebar';
import DashboardHome from './components/DashboardHome';
import { exportBatchToCsv } from './utils/export';
import { Menu } from './components/icons';

type Theme = 'light' | 'dark';
type View = 'dashboard' | 'analyze' | 'results' | 'history' | 'tools';

interface ToastState {
  message: string;
  type: 'success' | 'error' | 'info';
}

export default function App() {
  const [batch, setBatch] = useState<BatchItem[]>([]);
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);
  const [view, setView] = useState<View>('dashboard');
  const [activeAnalysis, setActiveAnalysis] = useState<BatchItem | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisRecord[]>([]);
  const [theme, setTheme] = useState<Theme>('dark');
  const [toastMessage, setToastMessage] = useState<ToastState | null>(null);
  const [isProMode, setIsProMode] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [activeLegalDoc, setActiveLegalDoc] = useState<LegalDocType | null>(null);
  const [activeResourceDoc, setActiveResourceDoc] = useState<ResourceDocType | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const showToast = (message: string, type: ToastState['type'] = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleStartBatchProcessing = async () => {
    const itemsToProcess = batch.filter(item => item.status === 'pending');
    if (itemsToProcess.length === 0) {
      showToast("Dodaj pliki do analizy.", 'info');
      return;
    }

    setIsProcessingBatch(true);
    let failedCount = 0;

    for (let i = 0; i < itemsToProcess.length; i++) {
      const item = itemsToProcess[i];
      
      // Add a delay between requests to be friendly to API rate limits
      // This prevents the "429 Resource Exhausted" error when processing many files.
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, 2500));
      }

      setBatch(prev => prev.map(b => b.id === item.id ? { ...b, status: 'processing' } : b));
      try {
        const results = await generateMetadata('file', isProMode, item.file, '', '');
        const newRecord: AnalysisRecord = {
          id: new Date().toISOString() + item.file.name,
          metadata: results,
          inputType: 'file',
          input: { fileName: item.file.name }
        };
        setAnalysisHistory(prev => [newRecord, ...prev.slice(0, 9)]);
        setBatch(prev => prev.map(b => b.id === item.id ? { ...b, status: 'completed', metadata: results } : b));
      } catch (err) {
        failedCount++;
        const errorMessage = err instanceof Error ? err.message : "Wystąpił nieznany błąd.";
        setBatch(prev => prev.map(b => b.id === item.id ? { ...b, status: 'error', error: errorMessage } : b));
      }
    }

    setIsProcessingBatch(false);
    
    const completedCount = itemsToProcess.length - failedCount;
    const totalCount = itemsToProcess.length;

    if (failedCount > 0 && completedCount > 0) {
        showToast(`Zakończono. ${completedCount} z ${totalCount} plików OK.`, 'info');
    } else if (failedCount > 0 && completedCount === 0) {
        showToast(`Wszystkie ${totalCount} pliki nie zostały przetworzone.`, 'error');
    } else {
        showToast(`Przetwarzanie wsadowe zakończone pomyślnie!`, 'success');
    }
  };
  
  const handleExportBatch = () => {
    const completedItems = batch.filter(item => item.status === 'completed');
    if(completedItems.length === 0) {
      showToast("Brak ukończonych analiz do wyeksportowania.", 'info');
      return;
    }
    exportBatchToCsv(completedItems);
    showToast(`Wyeksportowano ${completedItems.length} utworów.`, 'success');
  };

  const handleViewResults = (itemId: string) => {
    const item = batch.find(b => b.id === itemId);
    if (item && item.status === 'completed') {
      setActiveAnalysis(item);
      setView('results');
    }
  };

  const handleNewAnalysis = () => {
    setBatch([]);
    setActiveAnalysis(null);
    setView('analyze');
  };
  
  const handleBackToBatch = () => {
    setActiveAnalysis(null);
    setView('analyze');
  }

  const handleUpdateResults = (updatedMetadata: Metadata) => {
    if (!activeAnalysis) return;

    const updatedItem = { ...activeAnalysis, metadata: updatedMetadata };
    setActiveAnalysis(updatedItem);
    setBatch(prev => prev.map(b => b.id === activeAnalysis.id ? updatedItem : b));

    const recordToUpdate = analysisHistory.find(h => h.input.fileName === activeAnalysis.file.name);
    if(recordToUpdate) {
        setAnalysisHistory(prev => {
          return prev.map(h => h.id === recordToUpdate.id ? { ...h, metadata: updatedMetadata } : h);
        });
    }
    showToast("Metadane zaktualizowane!", 'success');
  };

  const handleSelectHistoryItem = (record: AnalysisRecord) => {
      const dummyFile = new File([], record.input.fileName || "history-item.mp3");
      const batchItem: BatchItem = {
          id: record.id,
          file: dummyFile,
          status: 'completed',
          metadata: record.metadata,
      };
      setActiveAnalysis(batchItem);
      setView('results');
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (newView: View) => {
      setView(newView);
  };


  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text font-sans transition-colors duration-300 flex">
      
      <Sidebar 
        currentView={view} 
        onChangeView={setView} 
        onOpenAbout={() => setIsAboutModalOpen(true)}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
        {/* Mobile Header / Top Bar */}
        <div className="sticky top-0 z-30 bg-light-bg/80 dark:bg-dark-bg/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex justify-between items-center">
             <div className="flex items-center gap-3">
                <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800">
                    <Menu className="w-6 h-6" />
                </button>
                <h2 className="text-lg font-bold capitalize text-slate-700 dark:text-slate-200">
                    {view === 'dashboard' ? 'Pulpit' : 
                     view === 'analyze' ? 'Analiza Audio' :
                     view === 'results' ? 'Wyniki Analizy' :
                     view === 'history' ? 'Historia' : 'Narzędzia'}
                </h2>
             </div>
             <Header theme={theme} toggleTheme={toggleTheme} />
        </div>

        <main className="flex-grow p-4 lg:p-8">
            {view === 'dashboard' && (
                <DashboardHome onNavigate={handleNavigate} onCreateNew={handleNewAnalysis} />
            )}

            {view === 'analyze' && (
                <div className="max-w-5xl mx-auto">
                    <div className="bg-light-card dark:bg-dark-card rounded-2xl shadow-lg p-6 md:p-8 border border-slate-200 dark:border-slate-800">
                        <InputSection
                            batch={batch}
                            setBatch={setBatch}
                            onAnalyze={handleStartBatchProcessing}
                            isProMode={isProMode}
                            setIsProMode={setIsProMode}
                            isProcessingBatch={isProcessingBatch}
                            onViewResults={handleViewResults}
                            onExportBatch={handleExportBatch}
                            showToast={showToast}
                        />
                    </div>
                </div>
            )}

            {view === 'results' && activeAnalysis && (
                 <div className="max-w-7xl mx-auto">
                     <ResultsSection
                        isLoading={false}
                        error={null}
                        results={activeAnalysis.metadata!}
                        onNewAnalysis={handleNewAnalysis}
                        showToast={showToast}
                        onUpdateResults={handleUpdateResults}
                        currentAnalysis={{
                            id: activeAnalysis.id,
                            metadata: activeAnalysis.metadata!,
                            inputType: 'file',
                            input: { fileName: activeAnalysis.file.name }
                        }}
                        uploadedFile={activeAnalysis.file}
                        theme={theme}
                        onBackToBatch={handleBackToBatch}
                      />
                </div>
            )}
            
            {view === 'history' && (
                <div className="max-w-4xl mx-auto">
                    <HistoryPanel history={analysisHistory} onSelectItem={handleSelectHistoryItem} />
                </div>
            )}

            {view === 'tools' && (
                 <div className="max-w-4xl mx-auto text-center py-20">
                    <h3 className="text-2xl font-bold text-slate-400">Narzędzia</h3>
                    <p className="text-slate-500 mt-2">Sekcja w budowie. Dostęp do narzędzi możliwy jest obecnie poprzez wyniki analizy.</p>
                    <button onClick={handleNewAnalysis} className="mt-4 text-accent-violet hover:underline">Rozpocznij Analizę</button>
                </div>
            )}
        </main>
        
        <Footer 
            onOpenLegal={(type) => setActiveLegalDoc(type)} 
            onOpenResource={(type) => setActiveResourceDoc(type)}
        />
      </div>

      {toastMessage && <Toast message={toastMessage.message} type={toastMessage.type} />}
      {isAboutModalOpen && <AboutModal onClose={() => setIsAboutModalOpen(false)} />}
      {activeLegalDoc && <LegalModal type={activeLegalDoc} onClose={() => setActiveLegalDoc(null)} />}
      {activeResourceDoc && <ResourcesModal type={activeResourceDoc} onClose={() => setActiveResourceDoc(null)} />}
    </div>
  );
}
