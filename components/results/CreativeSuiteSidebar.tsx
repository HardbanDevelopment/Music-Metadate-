
import React from 'react';
import { Shield, Palette } from '../icons';
import VisualsCard from './VisualsCard';
import MarketingCard from './MarketingCard';

interface CreativeSuiteSidebarProps {
  coverArtUrl: string | null;
  isGeneratingArt: boolean;
  onGenerateArt: () => void;
  generatingMarketingType: string | null;
  onGenerateMarketing: (type: 'social' | 'press' | 'bio', tone: string) => void;
}

const CreativeSuiteSidebar: React.FC<CreativeSuiteSidebarProps> = (props) => {
  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <Palette className="w-6 h-6 text-accent-violet"/>
                <h3 className="text-xl font-bold text-light-text dark:text-dark-text">
                Creative Suite
                </h3>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 rounded-full text-xs font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
                <Shield className="w-3 h-3" /> Protected
            </div>
        </div>
      
      <VisualsCard 
        coverArtUrl={props.coverArtUrl}
        isGeneratingArt={props.isGeneratingArt}
        onGenerateArt={props.onGenerateArt}
      />
      <MarketingCard 
        generatingMarketingType={props.generatingMarketingType}
        onGenerateMarketing={props.onGenerateMarketing}
      />
    </div>
  );
};

export default CreativeSuiteSidebar;
