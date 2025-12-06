import React, { useState } from 'react';
import Card from './Card';
import { Megaphone, MessageSquare, Newspaper, User, Sparkles } from '../icons';
import Button from '../Button';

interface MarketingCardProps {
    generatingMarketingType: string | null;
    onGenerateMarketing: (type: 'social' | 'press' | 'bio', tone: string) => void;
}

const toneOptions = ["Angażujący", "Profesjonalny", "Zabawny", "Poetycki"];

const MarketingButton: React.FC<{
    type: 'social' | 'press' | 'bio',
    icon: React.ReactNode,
    label: string,
    description: string
    generatingMarketingType: string | null;
    onClick: () => void;
  }> = ({ type, icon, label, description, generatingMarketingType, onClick }) => (
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
          <div className="w-10 h-10 flex-shrink-0 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center">{icon}</div>
          <div className="flex-grow">
              <h5 className="font-semibold text-light-text dark:text-dark-text text-sm">{label}</h5>
              <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
          </div>
          <Button 
            onClick={onClick}
            disabled={!!generatingMarketingType}
            variant="secondary"
            size="sm"
            className="w-full sm:w-auto flex-shrink-0"
          >
              {generatingMarketingType === type ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"></div>
                   Generowanie...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-accent-violet" />
                  Generuj
                </>
              )}
          </Button>
      </div>
  );

const MarketingCard: React.FC<MarketingCardProps> = ({ generatingMarketingType, onGenerateMarketing }) => {
  const [tone, setTone] = useState(toneOptions[0]);

  return (
    <Card>
      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4 mb-4">
        <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-gradient-to-br from-green-400 to-cyan-500 text-white">
          <Megaphone className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-light-text dark:text-dark-text">Zestaw Marketingowy</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Wygeneruj treści promocyjne.</p>
        </div>
      </div>
      <div className="space-y-3">
        <div className="mb-3">
            <label htmlFor="tone-select" className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-2">Ton Komunikacji</label>
            <select
                id="tone-select"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-accent-violet focus:outline-none transition-all text-sm"
                disabled={!!generatingMarketingType}
            >
                {toneOptions.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
        </div>
        <MarketingButton
            type="social"
            label="Post na Media Społecznościowe"
            description="Angażujący post na X, Instagram."
            icon={<MessageSquare className="w-5 h-5 text-slate-600 dark:text-slate-300" />}
            generatingMarketingType={generatingMarketingType}
            onClick={() => onGenerateMarketing('social', tone)}
        />
        <MarketingButton
            type="press"
            label="Notka Prasowa"
            description="Profesjonalny akapit dla mediów."
            icon={<Newspaper className="w-5 h-5 text-slate-600 dark:text-slate-300" />}
            generatingMarketingType={generatingMarketingType}
            onClick={() => onGenerateMarketing('press', tone)}
        />
        <MarketingButton
            type="bio"
            label="Biografia Streamingowa"
            description="Chwytliwe bio na Spotify, Apple Music."
            icon={<User className="w-5 h-5 text-slate-600 dark:text-slate-300" />}
            generatingMarketingType={generatingMarketingType}
            onClick={() => onGenerateMarketing('bio', tone)}
        />
      </div>
    </Card>
  );
};

export default MarketingCard;