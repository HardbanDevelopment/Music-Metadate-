
import React from 'react';
import { Music } from './icons';
import { LegalDocType } from './LegalModal';
import { ResourceDocType } from './ResourcesModal';

interface FooterProps {
  onOpenLegal: (type: LegalDocType) => void;
  onOpenResource?: (type: ResourceDocType) => void; // Optional to prevent breaking if not passed yet
}

const Footer: React.FC<FooterProps> = ({ onOpenLegal, onOpenResource }) => {
  const currentYear = new Date().getFullYear();
  
  // Safe handler
  const handleResourceClick = (type: ResourceDocType) => {
      if (onOpenResource) onOpenResource(type);
  };

  return (
    <footer className="bg-white dark:bg-dark-card border-t border-slate-200 dark:border-slate-800 mt-12 py-12 transition-colors duration-300">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-accent-violet to-accent-blue rounded-lg flex items-center justify-center">
                <Music className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg text-light-text dark:text-dark-text">Music Metadata</span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Automatyzacja metadanych dla profesjonalistów muzycznych. Oszczędzaj czas, zwiększaj zasięgi.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold text-light-text dark:text-dark-text mb-4">Produkt</h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li><button onClick={() => handleResourceClick('features')} className="hover:text-accent-violet transition-colors text-left">Funkcje</button></li>
              <li><button onClick={() => handleResourceClick('pricing')} className="hover:text-accent-violet transition-colors text-left">Cennik</button></li>
              <li><button onClick={() => handleResourceClick('api')} className="hover:text-accent-violet transition-colors text-left">API dla Deweloperów</button></li>
              <li><button onClick={() => handleResourceClick('roadmap')} className="hover:text-accent-violet transition-colors text-left">Roadmapa</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-light-text dark:text-dark-text mb-4">Zasoby</h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              {/* Blog REMOVED as requested */}
              <li><button onClick={() => handleResourceClick('docs')} className="hover:text-accent-violet transition-colors text-left">Dokumentacja</button></li>
              <li><button onClick={() => handleResourceClick('help')} className="hover:text-accent-violet transition-colors text-left">Pomoc</button></li>
              <li><button onClick={() => handleResourceClick('status')} className="hover:text-accent-violet transition-colors text-left">Status Systemu</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-light-text dark:text-dark-text mb-4">Legalne</h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li><button onClick={() => onOpenLegal('privacy')} className="hover:text-accent-violet transition-colors text-left">Privacy Policy</button></li>
              <li><button onClick={() => onOpenLegal('tos')} className="hover:text-accent-violet transition-colors text-left">Terms & Conditions</button></li>
              <li><button onClick={() => onOpenLegal('gdpr')} className="hover:text-accent-violet transition-colors text-left">GDPR Compliance</button></li>
              <li><button onClick={() => onOpenLegal('cookies')} className="hover:text-accent-violet transition-colors text-left">Cookie Policy</button></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-200 dark:border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col md:flex-row md:items-center gap-2">
            <p className="text-xs text-slate-400">
                &copy; {currentYear} Music Metadata Engine | HardbanRecords Lab
            </p>
            <span className="hidden md:block text-slate-600">•</span>
            <p className="text-xs text-slate-400">Created by Kamil Skomra</p>
          </div>
          <div className="flex gap-4">
             {/* Social placeholders */}
             <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-accent-violet hover:text-white transition-all cursor-pointer">
                <span className="font-bold text-xs">X</span>
             </div>
             <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-accent-violet hover:text-white transition-all cursor-pointer">
                <span className="font-bold text-xs">in</span>
             </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
