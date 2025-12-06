
import React, { useState, useEffect } from 'react';
import { generateMetadata } from './services/geminiService';
import { Metadata, AnalysisRecord, BatchItem, SupabaseSession } from './types';
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
import AuthModal from './components/AuthModal';
import DiagnosticsModal from './components/DiagnosticsModal';

type Theme = 'light' | 'dark';
type View = 'dashboard' | 'analyze' | 'results' | 'history' | 'tools';

interface ToastState {
  message: string;
  type: 'success' | 'error' | 'info';
}

interface DbHistoryRecord {
  id: number;
  user_id: string;
  file_name: string;
  result: string; // Comes as a JSON string from the DB
  timestamp: string;
}

export default function App() {
  const [batch, setBatch] = useState<BatchItem[]>([]);
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);
  const [view, setView] = useState<View>('dashboard'); // Default to dashboard
  const [activeAnalysis, setActiveAnalysis] = useState<BatchItem | null>(null);

  const [analysisHistory, setAnalysisHistory] = useState<AnalysisRecord[]>([]);
  const [theme, setTheme] = useState<Theme>('dark');
  const [toastMessage, setToastMessage] = useState<ToastState | null>(null);
  const [isProMode, setIsProMode] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [activeLegalDoc, setActiveLegalDoc] = useState<LegalDocType | null>(null);
  const [activeResourceDoc, setActiveResourceDoc] = useState<ResourceDocType | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [session, setSession] = useState<SupabaseSession | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(false);

  // --- AUTH & DATA LOADING ---
  useEffect(() => {
    const storedSession = localStorage.getItem('supabaseSession');
    if (storedSession) {
      try {
        const sessionData = JSON.parse(storedSession);
        setSession(sessionData);
      } catch (e) {
        console.error("Failed to parse session", e);
      }
    }
  }, []);

  useEffect(() => {
    const fetchHistory = async () => {
      if (session) {
        try {
          const response = await fetch('/history', {
            headers: { 'Authorization': `Bearer ${session.access_token}` }
          });
          if (response.ok) {
            const dbRecords: DbHistoryRecord[] = await response.json();
            const mappedHistory: AnalysisRecord[] = dbRecords.map(rec => ({
              id: rec.id.toString(),
              metadata: typeof rec.result === 'string' ? JSON.parse(rec.result) : rec.result,
              inputType: 'file',
              input: { fileName: rec.file_name }
            }));
            setAnalysisHistory(mappedHistory);
          } else {
            setAnalysisHistory([]);
          }
        } catch (error) {
          console.error("Error fetching history:", error);
          setAnalysisHistory([]);
        }
      } else {
        setAnalysisHistory([]);
      }
    };
    fetchHistory();
  }, [session]);

  // --- THEME ---
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

  // --- AUTH HANDLERS ---
  const handleLoginSuccess = (newSession: SupabaseSession) => {
    setSession(newSession);
    localStorage.setItem('supabaseSession', JSON.stringify(newSession));
  };

  const handleLogout = () => {
    setSession(null);
    localStorage.removeItem('supabaseSession');
    showToast('Wylogowano pomyślnie.', 'info');
  };

  // --- CORE APP LOGIC ---
  const handleStartBatchProcessing = async () => {
    // if (!session) {
    //   showToast("Zaloguj się, aby rozpocząć analizę.", "info");
    //   setIsAuthModalOpen(true);
    //   return;
    // }

    const itemsToProcess = batch.filter(item => item.status === 'pending');
    if (itemsToProcess.length === 0) {
      showToast("Dodaj pliki do analizy.", 'info');
      return;
    }

    setIsProcessingBatch(true);
    let failedCount = 0;

    for (let i = 0; i < itemsToProcess.length; i++) {
      const item = itemsToProcess[i];

      if (i > 0) await new Promise(resolve => setTimeout(resolve, 2500));

      setBatch(prev => prev.map(b => b.id === item.id ? { ...b, status: 'processing' } : b));

      try {
        const results = await generateMetadata('file', isProMode, item.file, '', '');

        // Save to DB (only if logged in)
        if (session) {
          await fetch('/history', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ file_name: item.file.name, result: results }),
          });
        }

        const newRecord: AnalysisRecord = {
          id: new Date().toISOString() + item.file.name,
          metadata: results,
          inputType: 'file',
          input: { fileName: item.file.name }
        };

        setAnalysisHistory(prev => [newRecord, ...prev]);
        setBatch(prev => prev.map(b => b.id === item.id ? { ...b, status: 'completed', metadata: results } : b));
      } catch (err) {
        failedCount++;
        const errorMessage = err instanceof Error ? err.message : "Wystąpił nieznany błąd.";
        setBatch(prev => prev.map(b => b.id === item.id ? { ...b, status: 'error', error: errorMessage } : b));
      }
    }

    setIsProcessingBatch(false);
    if (failedCount === 0) {
      showToast("Przetwarzanie zakończone sukcesem!", "success");
    } else {
      showToast(`Zakończono. Błędy: ${failedCount}`, "error");
    }
  };

  const handleExportBatch = () => {
    const completedItems = batch.filter(item => item.status === 'completed');
    if (completedItems.length === 0) {
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


  interface ErrorBoundaryProps {
    children: React.ReactNode;
  }

  interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
  }

  class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    public state: ErrorBoundaryState = { hasError: false, error: null };

    constructor(props: ErrorBoundaryProps) {
      super(props);
    }

    static getDerivedStateFromError(error: Error) {
      return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
      console.error("React Error Boundary caught:", error, errorInfo);
    }

    render() {
      if (this.state.hasError) {
        return (
          <div className="p-10 flex flex-col items-center justify-center min-h-screen bg-red-50 text-red-900">
            <h1 className="text-3xl font-bold mb-4">Something went wrong.</h1>
            <pre className="bg-white p-4 rounded shadow text-sm overflow-auto max-w-full">
              {this.state.error?.toString()}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Reload Application
            </button>
          </div>
        );
      }
      return this.props.children;
    }
  }

  return (
    <div className={`min-h-screen bg-light-bg dark:bg-dark-bg text-slate-800 dark:text-slate-200 font-sans transition-colors duration-300 flex overflow-hidden`}>
      <ErrorBoundary>
        {/* Toast Notification */}
        {toastMessage && (
          <Toast
            message={toastMessage.message}
            type={toastMessage.type}
            onClose={() => setToastMessage(null)}
          />
        )}

        {/* Modals */}
        {isAuthModalOpen && (
          <AuthModal
            onClose={() => setIsAuthModalOpen(false)}
            onSuccess={handleLoginSuccess}
            showToast={showToast}
          />
        )}

        {isDiagnosticsOpen && (
          <DiagnosticsModal onClose={() => setIsDiagnosticsOpen(false)} />
        )}
        {isAboutModalOpen && (
          <AboutModal onClose={() => setIsAboutModalOpen(false)} />
        )}
        {activeLegalDoc && (
          <LegalModal type={activeLegalDoc} onClose={() => setActiveLegalDoc(null)} />
        )}
        {activeResourceDoc && (
          <ResourcesModal type={activeResourceDoc} onClose={() => setActiveResourceDoc(null)} />
        )}

        {/* Sidebar */}
        <Sidebar
          currentView={view} // Updated prop name
          onChangeView={setView} // Updated prop name
          isOpenMobile={isMobileMenuOpen} // Updated prop name
          onCloseMobile={() => setIsMobileMenuOpen(false)}
          session={session}
          onLogin={() => setIsAuthModalOpen(true)} // Added missing prop
          onLogout={handleLogout} // Added missing prop
          onOpenResource={(type) => setActiveResourceDoc(type)}
          onOpenLegal={(type) => setActiveLegalDoc(type)}
          onOpenAbout={() => setIsAboutModalOpen(true)}
          theme={theme}
          toggleTheme={toggleTheme}
          quota={null} // Added missing prop
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden relative lg:ml-64 transition-all duration-300">
          {/* Header */}
          <Header
            onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
            session={session}
            theme={theme}
            toggleTheme={toggleTheme}
            onLogin={() => setIsAuthModalOpen(true)}
            onLogout={handleLogout}
            onOpenDiagnostics={() => setIsDiagnosticsOpen(true)}
          />

          {/* Scrollable Area */}
          <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
            {view === 'dashboard' && (
              <DashboardHome
                onNavigate={(v) => setView(v as View)}
                onCreateNew={() => setView('analyze')}
              />
            )}

            {view === 'analyze' && (
              <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
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
            )}

            {view === 'results' && activeAnalysis && (
              <div className="animate-fade-in">
                <div className="mb-4">
                  <button onClick={() => setView('analyze')} className="text-sm font-bold text-slate-500 hover:text-accent-violet flex items-center gap-1 transition-colors">
                    <Menu className="w-4 h-4 rotate-180" /> Wróć do listy
                  </button>
                </div>
                <ResultsSection
                  isLoading={false}
                  error={null}
                  results={activeAnalysis.metadata!}
                  onNewAnalysis={() => setView('analyze')}
                  showToast={showToast}
                  onUpdateResults={(updated) => {
                    setActiveAnalysis(prev => prev ? { ...prev, metadata: updated } : null);
                    setBatch(prev => prev.map(b => b.id === activeAnalysis.id ? { ...b, metadata: updated } : b));
                  }}
                  currentAnalysis={{
                    id: activeAnalysis.id,
                    metadata: activeAnalysis.metadata!,
                    inputType: 'file',
                    timestamp: new Date().toISOString(),
                    input: { fileName: activeAnalysis.file.name }
                  } as any}
                  uploadedFile={activeAnalysis.file}
                  theme={theme}
                  onBackToBatch={() => setView('dashboard')}
                />
              </div>
            )}

            {view === 'results' && !activeAnalysis && (
              <div className="text-center py-20 opacity-50">
                <p>Brak wyników do wyświetlenia. Wybierz analizę z listy.</p>
              </div>
            )}

            {view === 'history' && (
              <HistoryPanel history={analysisHistory} />
            )}
          </main>

          <Footer
            onOpenLegal={(type) => setActiveLegalDoc(type)}
          />
        </div>
      </ErrorBoundary>
    </div>
  );
}
