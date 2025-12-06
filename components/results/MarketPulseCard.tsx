
import React, { useState } from 'react';
import Card from './Card';
import { TrendingUp, Music, User, Search, RefreshCw, ExternalLink, ChevronDown, ChevronUp } from '../icons';
import { MarketPulseData, GroundingSource, TrackSuggestion, ArtistSuggestion, PlaylistSuggestion } from '../../types';
import Button from '../Button';
import Tooltip from '../Tooltip';

interface MarketPulseCardProps {
  marketPulseData: MarketPulseData | null;
  sources: GroundingSource[];
  isFetching: boolean;
  error: string | null;
  onFetch: () => void;
}

const ResultItem: React.FC<{
    item: TrackSuggestion | ArtistSuggestion | PlaylistSuggestion,
    type: 'track' | 'artist' | 'playlist'
}> = ({ item, type }) => {
    let title = '';
    let link = '';

    if (type === 'track' && 'artist' in item && 'title' in item) {
        title = `${item.artist} - ${item.title}`;
        link = `https://www.youtube.com/results?search_query=${encodeURIComponent(title)}`;
    } else if (type === 'artist' && 'name' in item) {
        title = item.name;
        link = `https://www.google.com/search?q=${encodeURIComponent(item.name + " music")}`;
    } else if (type === 'playlist' && 'name' in item && 'platform' in item) {
        title = `${item.name} (${item.platform})`;
        link = `https://www.google.com/search?q=${encodeURIComponent(item.name + " " + item.platform + " playlist")}`;
    }

    return (
        <li className="flex items-center py-2.5 space-x-3">
            <div className="flex-shrink-0">
                {type === 'track' && <Music className="h-5 w-5 text-slate-400" />}
                {type === 'artist' && <User className="h-5 w-5 text-slate-400" />}
                {type === 'playlist' && <Search className="h-5 w-5 text-slate-400" />}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-light-text dark:text-dark-text truncate" title={title}>
                    {title}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                    {item.reason}
                </p>
            </div>
            <Tooltip text="Wyszukaj w sieci">
                <a href={link} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" aria-label="Search online">
                    <ExternalLink className="w-4 h-4 text-slate-500" />
                </a>
            </Tooltip>
        </li>
    );
};


const MarketPulseCard: React.FC<MarketPulseCardProps> = ({
  marketPulseData, sources, isFetching, error, onFetch,
}) => {
  const [showSources, setShowSources] = useState(false);

  return (
    <Card>
      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4 mb-4">
        <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-indigo-500 text-white">
          <TrendingUp className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-light-text dark:text-dark-text">Puls Rynku</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Analiza trendów i popularności.</p>
        </div>
      </div>

      <div className="space-y-4">
        {!marketPulseData && !isFetching && !error && (
          <div className="text-center p-4">
            <TrendingUp className="w-12 h-12 text-slate-400 dark:text-slate-500 mx-auto" />
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 mb-4">
              Odkryj trendy, artystów i playlisty pasujące do Twojej muzyki, bazując na aktualnych danych.
            </p>
            <Button onClick={onFetch} variant="primary" size="sm" className="w-auto mx-auto">
              <Search className="w-5 h-5" /> Analizuj Rynek
            </Button>
          </div>
        )}
        {isFetching && (
          <div className="flex flex-col items-center justify-center text-center space-y-4 py-10">
            <div className="w-12 h-12 border-4 border-accent-blue border-t-transparent rounded-full animate-spin"></div>
            <p className="font-semibold text-light-text dark:text-dark-text">Analizuję dane rynkowe...</p>
          </div>
        )}
        {error && (
          <div className="text-center py-6">
            <p className="text-red-500 font-bold">Wystąpił błąd</p>
            <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm">{error}</p>
            <Button onClick={onFetch} variant="secondary" size="sm" className="mt-4 w-auto mx-auto">
              <RefreshCw className="w-4 h-4" /> Spróbuj ponownie
            </Button>
          </div>
        )}
        {marketPulseData && (
          <div className="animate-fade-in space-y-4">
            <div className="flow-root">
                <h4 className="font-bold text-sm mb-1">Podobne utwory</h4>
                <ul role="list" className="-my-2 divide-y divide-slate-200 dark:divide-slate-700">
                    {marketPulseData.tracks?.map((track, i) => <ResultItem key={`track-${i}`} item={track} type="track" />)}
                </ul>
            </div>
            <div className="flow-root">
                <h4 className="font-bold text-sm mb-1">Popularni artyści</h4>
                <ul role="list" className="-my-2 divide-y divide-slate-200 dark:divide-slate-700">
                    {marketPulseData.artists?.map((artist, i) => <ResultItem key={`artist-${i}`} item={artist} type="artist" />)}
                </ul>
            </div>
             <div className="flow-root">
                <h4 className="font-bold text-sm mb-1">Wpływowe playlisty</h4>
                <ul role="list" className="-my-2 divide-y divide-slate-200 dark:divide-slate-700">
                    {marketPulseData.playlists?.map((pl, i) => <ResultItem key={`pl-${i}`} item={pl} type="playlist" />)}
                </ul>
            </div>

            {sources.length > 0 && (
              <div className="pt-2">
                <button onClick={() => setShowSources(!showSources)} className="flex justify-between items-center w-full text-left text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                  Źródła Danych
                  {showSources ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {showSources && (
                  <ul className="mt-2 space-y-1 animate-fade-in">
                    {sources.map((source, i) => (
                      <li key={i}>
                        <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-blue-500 hover:underline truncate">
                          <ExternalLink className="w-3 h-3" />
                          <span className="truncate">{source.web.title}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            
            <Button onClick={onFetch} disabled={isFetching} variant="secondary" size="sm" className="mt-4 w-auto">
                <RefreshCw className="w-4 h-4" /> Wygeneruj ponownie
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default MarketPulseCard;
