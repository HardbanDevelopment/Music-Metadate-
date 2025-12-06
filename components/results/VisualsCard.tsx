
import React from 'react';
import Card from './Card';
import { Image, Download } from '../icons';
import Button from '../Button';
import Tooltip from '../Tooltip';

interface VisualsCardProps {
  coverArtUrl: string | null;
  isGeneratingArt: boolean;
  onGenerateArt: () => void;
}

const VisualsCard: React.FC<VisualsCardProps> = ({
  coverArtUrl, isGeneratingArt, onGenerateArt
}) => {
    
    const handleDownloadArt = () => {
        if (!coverArtUrl) return;
        const link = document.createElement('a');
        link.href = coverArtUrl;
        link.download = 'album-art.jpeg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Card>
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4 mb-4">
                <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-orange-500 text-white shadow-md shadow-orange-500/20">
                    <Image className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-light-text dark:text-dark-text">Wizualizacje</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Okładki Albumów (Imagen).</p>
                </div>
            </div>
            
            <div className="space-y-8">
                {/* Cover Art Section */}
                <div className="text-center group">
                    <h4 className="text-xs font-bold uppercase text-slate-500 mb-2">Okładka Albumu</h4>
                    <div className="w-full aspect-square bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center overflow-hidden relative mb-3 border border-slate-200 dark:border-slate-700 cursor-pointer">
                        {isGeneratingArt ? (
                            <div className="flex flex-col items-center justify-center text-center space-y-2">
                                <div className="w-10 h-10 border-4 border-accent-violet border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-sm font-semibold">Generowanie Imagen 3...</p>
                            </div>
                        ) : coverArtUrl ? (
                            <>
                                <img src={coverArtUrl} alt="Generated album cover" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <span className="text-white text-xs font-bold border border-white px-3 py-1 rounded-full backdrop-blur-sm">Podgląd</span>
                                </div>
                            </>
                        ) : (
                            <Image className="w-16 h-16 text-slate-400 dark:text-slate-500 transition-transform duration-300 group-hover:scale-110 group-hover:text-slate-300" />
                        )}
                    </div>
                     <div className="flex gap-2">
                        <Button onClick={onGenerateArt} disabled={isGeneratingArt} variant="secondary" className="w-full text-xs">
                            {isGeneratingArt ? 'Generowanie...' : coverArtUrl ? 'Ponów' : 'Generuj (Imagen)'}
                        </Button>
                        {coverArtUrl && !isGeneratingArt && (
                            <Tooltip text="Pobierz okładkę">
                                <Button onClick={handleDownloadArt} variant="primary" className="flex-shrink-0 px-3" aria-label="Pobierz okładkę">
                                    <Download className="w-5 h-5" />
                                </Button>
                            </Tooltip>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default VisualsCard;
