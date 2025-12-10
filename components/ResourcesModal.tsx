
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
                <h3 className="text-lg font-bold text-light-text dark:text-dark-text mb-2">Batch Processing</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Analyze hundreds of tracks simultaneously. Drag a folder with discography and let AI catalog everything in minutes.</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="w-12 h-12 bg-pink-500/10 rounded-lg flex items-center justify-center mb-4 text-pink-500">
                  <Database className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-light-text dark:text-dark-text mb-2">Hybrid Identification</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">We combine MusicBrainz, AcoustID, ACRCloud, and AudD to accurately recognize tracks and fetch official metadata (ISRC).</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center mb-4 text-emerald-500">
                  <Activity className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-light-text dark:text-dark-text mb-2">DSP Sound Engineering</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Mathematical audio analysis in the browser: BPM, Key Detection, Loudness (LUFS/RMS), True Peak, and spectrum analysis.</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4 text-blue-500">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-light-text dark:text-dark-text mb-2">Copyright & Protection</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Generation of Proof-of-Existence certificates (SHA-256) and creation of DEMO versions with audio watermark.</p>
              </div>
            </div>
          </div>
        );

      case 'pricing':
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <p className="text-slate-600 dark:text-slate-300">Choose a plan that fits your needs. Version 1.3 BETA is available for testing.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Free */}
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col">
                <h3 className="text-xl font-bold text-light-text dark:text-dark-text mb-2">Starter</h3>
                <div className="text-3xl font-black mb-4">$0 <span className="text-sm font-normal text-slate-500">/ month</span></div>
                <ul className="space-y-3 mb-8 flex-grow text-sm text-slate-600 dark:text-slate-300">
                  <li className="flex gap-2"><Check className="w-4 h-4 text-green-500" /> Single file analysis</li>
                  <li className="flex gap-2"><Check className="w-4 h-4 text-green-500" /> Basic AI tagging</li>
                  <li className="flex gap-2"><Check className="w-4 h-4 text-green-500" /> Export to CSV</li>
                  <li className="flex gap-2 opacity-50"><X className="w-4 h-4" /> No batch mode</li>
                </ul>
                <Button variant="secondary" size="sm" className="w-full">Current Plan</Button>
              </div>
              {/* Pro */}
              <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-xl border-2 border-accent-violet shadow-xl relative flex flex-col transform scale-105">
                <div className="absolute top-0 right-0 bg-accent-violet text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">RECOMMENDED</div>
                <h3 className="text-xl font-bold text-light-text dark:text-dark-text mb-2">Pro Producer</h3>
                <div className="text-3xl font-black mb-4 text-accent-violet">$12 <span className="text-sm font-normal text-slate-500 dark:text-slate-400">/ month</span></div>
                <ul className="space-y-3 mb-8 flex-grow text-sm text-slate-600 dark:text-slate-300">
                  <li className="flex gap-2"><Check className="w-4 h-4 text-green-500" /> <strong>Unlimited</strong> batch processing</li>
                  <li className="flex gap-2"><Check className="w-4 h-4 text-green-500" /> Advanced DSP & Engineering</li>
                  <li className="flex gap-2"><Check className="w-4 h-4 text-green-500" /> Cover generator (Imagen 3)</li>
                  <li className="flex gap-2"><Check className="w-4 h-4 text-green-500" /> Copyright Certificates</li>
                </ul>
                <Button variant="primary" size="sm" className="w-full">Choose Pro</Button>
              </div>
              {/* Studio */}
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col">
                <h3 className="text-xl font-bold text-light-text dark:text-dark-text mb-2">Label / Studio</h3>
                <div className="text-3xl font-black mb-4">$49 <span className="text-sm font-normal text-slate-500">/ month</span></div>
                <ul className="space-y-3 mb-8 flex-grow text-sm text-slate-600 dark:text-slate-300">
                  <li className="flex gap-2"><Check className="w-4 h-4 text-green-500" /> Everything in Pro</li>
                  <li className="flex gap-2"><Check className="w-4 h-4 text-green-500" /> API access for developers</li>
                  <li className="flex gap-2"><Check className="w-4 h-4 text-green-500" /> Dedicated support</li>
                  <li className="flex gap-2"><Check className="w-4 h-4 text-green-500" /> Commercial license for team</li>
                </ul>
                <Button variant="secondary" size="sm" className="w-full">Contact Us</Button>
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
              <h3 className="text-lg font-bold text-light-text dark:text-dark-text mb-2">API Documentation</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                Our REST API allows integration of the analytical engine directly with your CMS, mobile app, or catalog management system.
              </p>
              <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-300 space-y-1">
                <li>Rate limit: 1000 requests / minute</li>
                <li>Webhook support</li>
                <li>SLA 99.9%</li>
              </ul>
              <Button variant="secondary" size="sm" className="mt-4">
                <Code className="w-4 h-4" /> Request API Key
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
              <h3 className="text-lg font-bold text-light-text dark:text-dark-text">Q1 2024 - MVP (Completed)</h3>
              <p className="text-sm text-slate-500 mb-2">Version 1.0 - 1.3</p>
              <ul className="text-sm text-slate-600 dark:text-slate-300 list-disc list-inside">
                <li>Core AI Engine (Gemini)</li>
                <li>Batch processing</li>
                <li>DSP sonic analysis</li>
              </ul>
            </div>

            <div className="relative pl-20">
              <div className="absolute left-6 top-1 w-4 h-4 bg-accent-violet rounded-full border-4 border-white dark:border-dark-card animate-pulse"></div>
              <h3 className="text-lg font-bold text-accent-violet">Q3 2024 - Cloud & Auth (In Progress)</h3>
              <p className="text-sm text-slate-500 mb-2">Version 2.0</p>
              <ul className="text-sm text-slate-600 dark:text-slate-300 list-disc list-inside">
                <li>User accounts (Cloud)</li>
                <li>Cloud history saving</li>
                <li>Google Drive / Dropbox integration</li>
              </ul>
            </div>

            <div className="relative pl-20 opacity-50">
              <div className="absolute left-6 top-1 w-4 h-4 bg-slate-300 dark:bg-slate-700 rounded-full border-4 border-white dark:border-dark-card"></div>
              <h3 className="text-lg font-bold text-light-text dark:text-dark-text">Q4 2024 - Ecosystem</h3>
              <p className="text-sm text-slate-500 mb-2">Version 3.0</p>
              <ul className="text-sm text-slate-600 dark:text-slate-300 list-disc list-inside">
                <li>VST plugin for DAW</li>
                <li>Mobile app (iOS/Android)</li>
                <li>AI presets marketplace</li>
              </ul>
            </div>
          </div>
        );

      case 'docs':
        return (
          <div className="space-y-6 text-sm text-slate-600 dark:text-slate-300 animate-fade-in">
            <div>
              <h3 className="text-lg font-bold text-light-text dark:text-dark-text mb-2">Getting Started</h3>
              <p>To start, simply drag an MP3 or WAV file to the workspace. The engine will automatically begin analysis. Make sure the file is not corrupted and is at least 15 seconds long.</p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-light-text dark:text-dark-text mb-2">File Formats</h3>
              <p>We support:</p>
              <ul className="list-disc list-inside mt-1">
                <li>MP3 (up to 320kbps)</li>
                <li>WAV (16/24 bit) - recommended for best analysis</li>
                <li>FLAC</li>
                <li>AIFF / M4A</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold text-light-text dark:text-dark-text mb-2">ID3 Tagging</h3>
              <p>After completing analysis and editing, click the "Download File" button in the "Ready Product" section. The new file will contain all generated metadata, including cover art, embedded directly in the ID3v2.4 header.</p>
            </div>
          </div>
        );

      case 'help':
        return (
          <div className="space-y-4 animate-fade-in">
            <details className="group bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
              <summary className="font-bold text-light-text dark:text-dark-text cursor-pointer flex justify-between items-center">
                Why does analysis take so long?
                <span className="group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                AI analysis (Gemini) and DSP (signal processing) are computationally intensive processes. In free mode, the API may have bandwidth limits. Try processing fewer files at once.
              </p>
            </details>
            <details className="group bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
              <summary className="font-bold text-light-text dark:text-dark-text cursor-pointer flex justify-between items-center">
                Are my files secure?
                <span className="group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Yes. Most analysis happens locally in your browser (Client-Side). Samples sent to AI/Fingerprinting are temporary and are not archived anywhere by us.
              </p>
            </details>
            <details className="group bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
              <summary className="font-bold text-light-text dark:text-dark-text cursor-pointer flex justify-between items-center">
                How do I add my own API key?
                <span className="group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                In the "Identification Center" section, click the settings icon next to the selected provider (e.g., ACRCloud) to enter your own credentials.
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
                  <h4 className="font-bold text-light-text dark:text-dark-text">All systems operational</h4>
                  <p className="text-xs text-slate-500">Last update: Now</p>
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
    features: 'Features & Capabilities',
    pricing: 'Pricing',
    api: 'Developer API',
    roadmap: 'Development Roadmap',
    docs: 'Documentation',
    help: 'Help Center',
    status: 'System Status'
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
              <p className="text-xs text-slate-500 dark:text-slate-400">Music Metadata Engine application resources</p>
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
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ResourcesModal;
