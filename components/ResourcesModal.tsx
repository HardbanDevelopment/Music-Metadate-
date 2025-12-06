
import React from 'react';
import { Book, HelpCircle, Server, Code, CreditCard, Map, LayoutDashboard, X, Check, CheckCircle2, Zap, Shield, Database, Activity, Clock } from './icons';
import Button from './Button';

export type ResourceDocType = 'features' | 'pricing' | 'api' | 'roadmap' | 'docs' | 'help' | 'status';

interface ResourcesModalProps {
  type: ResourceDocType | null;
  onClose: () => void;
}

const ResourcesModal: React.FC<ResourcesModalProps> = ({ type, onClose }) => {
  if (!type) return null;

  const renderContent = () => {
    switch (type) {
      case 'features':
        return (
          <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="w-12 h-12 bg-accent-violet/10 rounded-lg flex items-center justify-center mb-4 text-accent-violet">
                        <Zap className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-light-text dark:text-dark-text mb-2">Przetwarzanie Wsadowe</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Analizuj setki utworów jednocześnie. Przeciągnij folder z dyskografią i pozwól AI skatalogować wszystko w kilka minut.</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="w-12 h-12 bg-pink-500/10 rounded-lg flex items-center justify-center mb-4 text-pink-500">
                        <Database className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-light-text dark:text-dark-text mb-2">Identyfikacja Hybrydowa</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Łączymy MusicBrainz, AcoustID, ACRCloud oraz AudD, aby bezbłędnie rozpoznawać utwory i pobierać oficjalne metadane (ISRC).</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center mb-4 text-emerald-500">
                        <Activity className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-light-text dark:text-dark-text mb-2">Inżynieria Dźwięku DSP</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Matematyczna analiza audio w przeglądarce: BPM, Key Detection, Loudness (LUFS/RMS), True Peak i analiza widma.</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4 text-blue-500">
                        <Shield className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-light-text dark:text-dark-text mb-2">Copyright & Ochrona</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Generowanie certyfikatów Proof-of-Existence (SHA-256) oraz tworzenie wersji DEMO ze znakiem wodnym audio.</p>
                </div>
            </div>
          </div>
        );

      case 'pricing':
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center max-w-2xl mx-auto mb-8">
                <p className="text-slate-600 dark:text-slate-300">Wybierz plan dopasowany do Twoich potrzeb. Wersja 1.3 BETA jest dostępna do testów.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Free */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col">
                    <h3 className="text-xl font-bold text-light-text dark:text-dark-text mb-2">Starter</h3>
                    <div className="text-3xl font-black mb-4">0 zł <span className="text-sm font-normal text-slate-500">/ mies</span></div>
                    <ul className="space-y-3 mb-8 flex-grow text-sm text-slate-600 dark:text-slate-300">
                        <li className="flex gap-2"><Check className="w-4 h-4 text-green-500" /> Analiza pojedynczych plików</li>
                        <li className="flex gap-2"><Check className="w-4 h-4 text-green-500" /> Podstawowe tagowanie AI</li>
                        <li className="flex gap-2"><Check className="w-4 h-4 text-green-500" /> Eksport do CSV</li>
                        <li className="flex gap-2 opacity-50"><X className="w-4 h-4" /> Brak trybu wsadowego</li>
                    </ul>
                    <Button variant="secondary" size="sm" className="w-full">Aktualny Plan</Button>
                </div>
                {/* Pro */}
                <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-xl border-2 border-accent-violet shadow-xl relative flex flex-col transform scale-105">
                    <div className="absolute top-0 right-0 bg-accent-violet text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">POLECANY</div>
                    <h3 className="text-xl font-bold text-light-text dark:text-dark-text mb-2">Pro Producer</h3>
                    <div className="text-3xl font-black mb-4 text-accent-violet">49 zł <span className="text-sm font-normal text-slate-500 dark:text-slate-400">/ mies</span></div>
                    <ul className="space-y-3 mb-8 flex-grow text-sm text-slate-600 dark:text-slate-300">
                        <li className="flex gap-2"><Check className="w-4 h-4 text-green-500" /> <strong>Nielimitowane</strong> przetwarzanie wsadowe</li>
                        <li className="flex gap-2"><Check className="w-4 h-4 text-green-500" /> Zaawansowane DSP & Inżynieria</li>
                        <li className="flex gap-2"><Check className="w-4 h-4 text-green-500" /> Generator okładek (Imagen 3)</li>
                        <li className="flex gap-2"><Check className="w-4 h-4 text-green-500" /> Certyfikaty Copyright</li>
                    </ul>
                    <Button variant="primary" size="sm" className="w-full">Wybierz Pro</Button>
                </div>
                {/* Studio */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col">
                    <h3 className="text-xl font-bold text-light-text dark:text-dark-text mb-2">Label / Studio</h3>
                    <div className="text-3xl font-black mb-4">199 zł <span className="text-sm font-normal text-slate-500">/ mies</span></div>
                    <ul className="space-y-3 mb-8 flex-grow text-sm text-slate-600 dark:text-slate-300">
                        <li className="flex gap-2"><Check className="w-4 h-4 text-green-500" /> Wszystko co w Pro</li>
                        <li className="flex gap-2"><Check className="w-4 h-4 text-green-500" /> Dostęp do API dla developerów</li>
                        <li className="flex gap-2"><Check className="w-4 h-4 text-green-500" /> Dedykowane wsparcie</li>
                        <li className="flex gap-2"><Check className="w-4 h-4 text-green-500" /> Licencja komercyjna dla zespołu</li>
                    </ul>
                    <Button variant="secondary" size="sm" className="w-full">Skontaktuj się</Button>
                </div>
            </div>
          </div>
        );

      case 'api':
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-slate-900 text-slate-200 p-6 rounded-xl font-mono text-sm overflow-x-auto">
                <div className="flex gap-2 mb-4 border-b border-slate-700 pb-2">
                    <span className="text-green-400">POST</span>
                    <span>https://api.musicmetadata.ai/v1/analyze</span>
                </div>
                <pre>{`
{
  "audio_url": "https://example.com/track.mp3",
  "options": {
    "detect_bpm": true,
    "detect_key": true,
    "generate_tags": true
  }
}
                `}</pre>
                <div className="mt-4 border-t border-slate-700 pt-4">
                    <span className="text-slate-500">// Response (200 OK)</span>
                    <pre className="text-green-300">{`
{
  "bpm": 124.5,
  "key": "Cm",
  "genre": "Deep House",
  "moods": ["Energetic", "Dark"]
}
                    `}</pre>
                </div>
            </div>
            <div>
                <h3 className="text-lg font-bold text-light-text dark:text-dark-text mb-2">Dokumentacja API</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                    Nasze REST API pozwala na integrację silnika analitycznego bezpośrednio z Twoim CMS, aplikacją mobilną lub systemem zarządzania katalogiem.
                </p>
                <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-300 space-y-1">
                    <li>Rate limit: 1000 zapytań / minuta</li>
                    <li>Wsparcie dla Webhooks</li>
                    <li>SLA 99.9%</li>
                </ul>
                <Button variant="secondary" size="sm" className="mt-4">
                    <Code className="w-4 h-4" /> Poproś o klucz API
                </Button>
            </div>
          </div>
        );

      case 'roadmap':
        return (
          <div className="space-y-8 animate-fade-in relative">
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-800"></div>
            
            <div className="relative pl-20">
                <div className="absolute left-6 top-1 w-4 h-4 bg-green-500 rounded-full border-4 border-white dark:border-dark-card"></div>
                <h3 className="text-lg font-bold text-light-text dark:text-dark-text">Q1 2024 - MVP (Zrealizowano)</h3>
                <p className="text-sm text-slate-500 mb-2">Wersja 1.0 - 1.3</p>
                <ul className="text-sm text-slate-600 dark:text-slate-300 list-disc list-inside">
                    <li>Core AI Engine (Gemini)</li>
                    <li>Przetwarzanie wsadowe</li>
                    <li>Analiza soniczna DSP</li>
                </ul>
            </div>

            <div className="relative pl-20">
                <div className="absolute left-6 top-1 w-4 h-4 bg-accent-violet rounded-full border-4 border-white dark:border-dark-card animate-pulse"></div>
                <h3 className="text-lg font-bold text-accent-violet">Q3 2024 - Cloud & Auth (W trakcie)</h3>
                <p className="text-sm text-slate-500 mb-2">Wersja 2.0</p>
                <ul className="text-sm text-slate-600 dark:text-slate-300 list-disc list-inside">
                    <li>Konta użytkowników (Cloud)</li>
                    <li>Zapisywanie historii w chmurze</li>
                    <li>Integracja z Google Drive / Dropbox</li>
                </ul>
            </div>

            <div className="relative pl-20 opacity-50">
                <div className="absolute left-6 top-1 w-4 h-4 bg-slate-300 dark:bg-slate-700 rounded-full border-4 border-white dark:border-dark-card"></div>
                <h3 className="text-lg font-bold text-light-text dark:text-dark-text">Q4 2024 - Ecosystem</h3>
                <p className="text-sm text-slate-500 mb-2">Wersja 3.0</p>
                <ul className="text-sm text-slate-600 dark:text-slate-300 list-disc list-inside">
                    <li>Wtyczka VST do DAW</li>
                    <li>Aplikacja mobilna (iOS/Android)</li>
                    <li>Marketplace dla presetów AI</li>
                </ul>
            </div>
          </div>
        );

      case 'docs':
        return (
          <div className="space-y-6 text-sm text-slate-600 dark:text-slate-300 animate-fade-in">
            <div>
                <h3 className="text-lg font-bold text-light-text dark:text-dark-text mb-2">Pierwsze kroki</h3>
                <p>Aby rozpocząć, po prostu przeciągnij plik MP3 lub WAV na obszar roboczy. Silnik automatycznie rozpocznie analizę. Upewnij się, że plik nie jest uszkodzony i trwa co najmniej 15 sekund.</p>
            </div>
            <div>
                <h3 className="text-lg font-bold text-light-text dark:text-dark-text mb-2">Formaty plików</h3>
                <p>Obsługujemy:</p>
                <ul className="list-disc list-inside mt-1">
                    <li>MP3 (do 320kbps)</li>
                    <li>WAV (16/24 bit) - zalecane dla najlepszej analizy</li>
                    <li>FLAC</li>
                    <li>AIFF / M4A</li>
                </ul>
            </div>
            <div>
                <h3 className="text-lg font-bold text-light-text dark:text-dark-text mb-2">Tagowanie ID3</h3>
                <p>Po zakończeniu analizy i edycji, kliknij przycisk "Pobierz Plik" w sekcji "Gotowy Produkt". Nowy plik będzie zawierał wszystkie wygenerowane metadane, w tym okładkę, zaszyte bezpośrednio w nagłówku ID3v2.4.</p>
            </div>
          </div>
        );

      case 'help':
        return (
          <div className="space-y-4 animate-fade-in">
            <details className="group bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                <summary className="font-bold text-light-text dark:text-dark-text cursor-pointer flex justify-between items-center">
                    Dlaczego analiza trwa tak długo?
                    <span className="group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    Analiza AI (Gemini) oraz DSP (przetwarzanie sygnału) są procesami obliczeniowo wymagającymi. W trybie darmowym API może mieć limity przepustowości. Spróbuj przetwarzać mniej plików naraz.
                </p>
            </details>
            <details className="group bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                <summary className="font-bold text-light-text dark:text-dark-text cursor-pointer flex justify-between items-center">
                    Czy moje pliki są bezpieczne?
                    <span className="group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    Tak. Większość analizy odbywa się lokalnie w Twojej przeglądarce (Client-Side). Próbki wysyłane do AI/Fingerprintingu są tymczasowe i nie są nigdzie archiwizowane przez nas.
                </p>
            </details>
            <details className="group bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                <summary className="font-bold text-light-text dark:text-dark-text cursor-pointer flex justify-between items-center">
                    Jak dodać własny klucz API?
                    <span className="group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    W sekcji "Centrum Identyfikacji" kliknij ikonę ustawień przy wybranym dostawcy (np. ACRCloud), aby wprowadzić własne poświadczenia.
                </p>
            </details>
          </div>
        );

      case 'status':
        return (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                    <div>
                        <h4 className="font-bold text-light-text dark:text-dark-text">Wszystkie systemy sprawne</h4>
                        <p className="text-xs text-slate-500">Ostatnia aktualizacja: Teraz</p>
                    </div>
                </div>
                <div className="text-right">
                    <span className="font-mono font-bold text-green-600 dark:text-green-400">99.9% Uptime</span>
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900/50 rounded border border-slate-100 dark:border-slate-800">
                    <span className="text-sm font-medium">Google Gemini API</span>
                    <span className="text-xs font-bold text-green-500 px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded">Operational</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900/50 rounded border border-slate-100 dark:border-slate-800">
                    <span className="text-sm font-medium">ACRCloud Gateway</span>
                    <span className="text-xs font-bold text-green-500 px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded">Operational</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900/50 rounded border border-slate-100 dark:border-slate-800">
                    <span className="text-sm font-medium">MusicBrainz Mirror</span>
                    <span className="text-xs font-bold text-yellow-500 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 rounded">High Latency</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900/50 rounded border border-slate-100 dark:border-slate-800">
                    <span className="text-sm font-medium">Internal Processing Engine</span>
                    <span className="text-xs font-bold text-green-500 px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded">Operational</span>
                </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const titles: Record<ResourceDocType, string> = {
      features: 'Funkcje i Możliwości',
      pricing: 'Cennik',
      api: 'API dla Deweloperów',
      roadmap: 'Roadmapa Rozwoju',
      docs: 'Dokumentacja',
      help: 'Centrum Pomocy',
      status: 'Status Systemu'
  };

  const icons: Record<ResourceDocType, React.ReactNode> = {
      features: <LayoutDashboard className="w-6 h-6 text-white" />,
      pricing: <CreditCard className="w-6 h-6 text-white" />,
      api: <Code className="w-6 h-6 text-white" />,
      roadmap: <Map className="w-6 h-6 text-white" />,
      docs: <Book className="w-6 h-6 text-white" />,
      help: <HelpCircle className="w-6 h-6 text-white" />,
      status: <Server className="w-6 h-6 text-white" />
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-light-card dark:bg-dark-card rounded-2xl shadow-xl w-full max-w-4xl border border-slate-200 dark:border-slate-800 relative overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center shrink-0">
                    {icons[type]}
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-light-text dark:text-dark-text tracking-tight">
                        {titles[type]}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Zasoby aplikacji Music Metadata Engine</p>
                </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" aria-label="Close modal">
                <X className="w-6 h-6 text-slate-500" />
            </button>
        </div>
        
        {/* Content */}
        <div className="p-8 overflow-y-auto custom-scrollbar bg-white dark:bg-dark-card">
            {renderContent()}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 flex justify-end">
            <Button onClick={onClose} variant="secondary">
                Zamknij
            </Button>
        </div>
      </div>
    </div>
  );
};

export default ResourcesModal;
