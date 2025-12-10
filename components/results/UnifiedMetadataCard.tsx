
import React, { useState, useEffect } from 'react';
import { Metadata, SpotifyAudioFeatures, SpotifyTrack, LastFmTrackInfo, DiscogsResult, StructureSegment, LyricsAnalysis, LyricalIdeas } from '../../types';
import Card from './Card';
import { Music, User, Calendar, Sparkles, Activity, Mic, Layers, Hash, Globe, MessageSquare, BrainCircuit, CheckCircle2, ExternalLink, FileText, Download, TrendingUp, Database, CopyrightIcon, Settings, Zap, RefreshCw } from '../icons';
import Tooltip from '../Tooltip';
import { analyzeAudioFeatures, AudioFeatures } from '../../services/audioAnalysisService';
import { searchSpotifyTrack, getSpotifyAudioFeatures, mapSpotifyKey } from '../../services/spotifyService';
import { fetchLyrics } from '../../services/lyricsService';
import { getLastFmTrackInfo } from '../../services/lastFmService';
import { searchDiscogs } from '../../services/discogsService';
import { trainModel } from '../../services/learningService';
import { analyzeStructure, analyzeLyrics, generateLyricalIdeas } from '../../services/geminiService';
import { generateNextCatalogNumber, generateNextISRC } from '../../services/codeGeneratorService';
import Button from '../Button';

interface UnifiedMetadataCardProps {
    metadata: Metadata;
    isEditing: boolean;
    onFieldUpdate: (field: keyof Metadata, value: any) => void;
    refiningField: keyof Metadata | null;
    onRefine: (field: keyof Metadata) => void;
    uploadedFile: File | null;
    showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

// --- VISUALIZATION COMPONENTS ---

const SpectrumBar: React.FC<{ label: string; percent: number; color: string }> = ({ label, percent, color }) => {
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setTimeout(() => setMounted(true), 100); }, []);

    return (
        <div className="flex flex-col items-center gap-1 flex-1 h-16 justify-end group">
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-t-sm relative overflow-hidden h-full">
                <div
                    className={`absolute bottom-0 left-0 w-full transition-all duration-1000 cubic-bezier(0.4, 0, 0.2, 1) ${color} group-hover:brightness-110`}
                    style={{ height: `${mounted ? Math.min(100, Math.max(5, percent)) : 0}%` }}
                ></div>
            </div>
            <span className="text-[9px] uppercase font-bold text-slate-500">{label}</span>
        </div>
    );
};

const CorrelationMeter: React.FC<{ value: number }> = ({ value }) => {
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setTimeout(() => setMounted(true), 300); }, []);

    const percent = ((value + 1) / 2) * 100;
    return (
        <div className="w-full">
            <div className="flex justify-between text-[9px] text-slate-400 font-mono mb-1">
                <span>-1</span>
                <span>0</span>
                <span>+1</span>
            </div>
            <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden relative">
                <div className="absolute top-0 bottom-0 w-0.5 bg-slate-400 left-1/2 -ml-px z-10"></div>
                <div
                    className={`h-full transition-all duration-1000 ease-out rounded-full ${value < 0 ? 'bg-red-500' : 'bg-emerald-500'}`}
                    style={{ width: `${mounted ? percent : 0}%` }}
                ></div>
            </div>
        </div>
    );
};

// --- STRUCTURE HELPERS ---
const parseTime = (t: string | undefined) => {
    if (!t) return 0;
    try {
        const parts = t.split(':');
        if (parts.length === 2) return parseInt(parts[0]) * 60 + parseInt(parts[1]);
    } catch (e) { return 0; }
    return 0;
};

const getSectionColor = (section: string) => {
    const s = (section || '').toLowerCase();
    if (s.includes('intro')) return 'bg-blue-400';
    if (s.includes('chorus') || s.includes('drop')) return 'bg-red-500';
    if (s.includes('verse')) return 'bg-green-400';
    if (s.includes('bridge')) return 'bg-yellow-400';
    if (s.includes('outro')) return 'bg-purple-400';
    return 'bg-slate-400';
};

// --- UI HELPERS ---

const SectionHeader: React.FC<{ icon: React.ReactNode, title: string, color?: string }> = ({ icon, title, color = "text-accent-violet" }) => (
    <div className={`flex items-center gap-2 mb-4 text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-2 mt-2 first:mt-0 ${color}`}>
        <div>{icon}</div>
        <h3 className="font-bold text-sm uppercase tracking-wide">{title}</h3>
    </div>
);

const FieldGroup: React.FC<{ label: string, children: React.ReactNode, onRefine?: () => void, isRefining?: boolean, extraAction?: React.ReactNode }> = ({ label, children, onRefine, isRefining, extraAction }) => (
    <div className="mb-4 last:mb-0 group">
        <div className="flex justify-between items-center mb-1.5">
            <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">{label}</label>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {extraAction}
                {onRefine && (
                    <Tooltip text="Ulepsz z AI">
                        <button onClick={onRefine} disabled={isRefining} className="text-slate-400 hover:text-accent-violet transition-colors disabled:opacity-50">
                            {isRefining ? <div className="w-3 h-3 border-2 border-accent-violet border-t-transparent rounded-full animate-spin" /> : <Sparkles className="w-3 h-3" />}
                        </button>
                    </Tooltip>
                )}
            </div>
        </div>
        {children}
    </div>
);

const EditableInput: React.FC<{
    value: string | number | undefined;
    onChange: (val: string) => void;
    isEditing: boolean;
    className?: string;
    placeholder?: string;
    type?: 'text' | 'number' | 'textarea';
}> = ({ value, onChange, isEditing, className = '', placeholder, type = 'text' }) => {
    if (!isEditing) {
        return <div className={`text-slate-800 dark:text-slate-200 whitespace-pre-wrap ${className}`}>{value || <span className="opacity-40 italic text-sm">-</span>}</div>;
    }
    if (type === 'textarea') {
        return (
            <textarea
                value={value || ''}
                onChange={e => onChange(e.target.value)}
                className="w-full p-2 bg-white dark:bg-slate-900 rounded border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-accent-violet text-sm transition-colors outline-none"
                rows={4}
                placeholder={placeholder}
            />
        );
    }
    return (
        <input
            type={type}
            value={value || ''}
            onChange={e => onChange(e.target.value)}
            className="w-full p-1.5 bg-white dark:bg-slate-900 rounded border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-accent-violet text-sm transition-colors outline-none"
            placeholder={placeholder}
        />
    );
};

const TagInput: React.FC<{
    tags: string[] | undefined;
    onChange: (tags: string[]) => void;
    isEditing: boolean;
    colorClass?: string;
}> = ({ tags, onChange, isEditing, colorClass = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700' }) => {
    const safeTags = tags || [];

    if (isEditing) {
        return (
            <textarea
                value={safeTags.join(', ')}
                onChange={e => onChange(e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
                className="w-full p-2 bg-white dark:bg-slate-900 rounded border border-slate-300 dark:border-slate-600 text-sm outline-none focus:ring-2 focus:ring-accent-violet"
                rows={3}
                placeholder="Wpisz tagi oddzielone przecinkami..."
            />
        );
    }
    return (
        <div className="flex flex-wrap gap-1.5">
            {safeTags.length > 0 ? safeTags.map((tag, i) => (
                <span key={i} className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-transform hover:scale-105 cursor-default ${colorClass}`}>
                    {tag}
                </span>
            )) : <span className="text-xs text-slate-400 italic">Brak danych</span>}
        </div>
    );
};

const SpotifyDataBlock: React.FC<{ data: SpotifyAudioFeatures, track: SpotifyTrack }> = ({ data, track }) => {
    return (
        <div className="mt-4 p-3 bg-[#1DB954]/10 border border-[#1DB954]/30 rounded-lg animate-fade-in">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-[#1DB954] rounded-full flex items-center justify-center shadow-md">
                        <Music className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-xs font-bold text-[#1DB954] uppercase">Oficjalne Dane Spotify</span>
                </div>
                <a href={track.external_urls.spotify} target="_blank" rel="noopener noreferrer" className="text-xs text-[#1DB954] hover:underline flex items-center gap-1">
                    {track.name} <ExternalLink className="w-3 h-3" />
                </a>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between p-1.5 bg-white dark:bg-slate-900/50 rounded border border-transparent hover:border-[#1DB954]/20 transition-colors">
                    <span className="text-slate-500">BPM</span>
                    <span className="font-bold">{Math.round(data.tempo)}</span>
                </div>
                <div className="flex justify-between p-1.5 bg-white dark:bg-slate-900/50 rounded border border-transparent hover:border-[#1DB954]/20 transition-colors">
                    <span className="text-slate-500">Key</span>
                    <span className="font-bold">{mapSpotifyKey(data.key, data.mode)}</span>
                </div>
                <div className="flex justify-between p-1.5 bg-white dark:bg-slate-900/50 rounded border border-transparent hover:border-[#1DB954]/20 transition-colors">
                    <span className="text-slate-500">Energy</span>
                    <span className="font-bold">{Math.round(data.energy * 100)}%</span>
                </div>
                <div className="flex justify-between p-1.5 bg-white dark:bg-slate-900/50 rounded border border-transparent hover:border-[#1DB954]/20 transition-colors">
                    <span className="text-slate-500">Dance</span>
                    <span className="font-bold">{Math.round(data.danceability * 100)}%</span>
                </div>
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---

const UnifiedMetadataCard: React.FC<UnifiedMetadataCardProps> = ({ metadata, isEditing, onFieldUpdate, refiningField, onRefine, uploadedFile, showToast }) => {

    // ... (state remains the same)
    const [dspData, setDspData] = useState<AudioFeatures | null>(null);
    const [isDspLoading, setIsDspLoading] = useState(false);
    const [spotifyData, setSpotifyData] = useState<SpotifyAudioFeatures | null>(null);
    const [spotifyTrack, setSpotifyTrack] = useState<SpotifyTrack | null>(null);
    const [isSpotifyLoading, setIsSpotifyLoading] = useState(false);
    const [fetchedLyrics, setFetchedLyrics] = useState<string | null>(null);
    const [lyricsData, setLyricsData] = useState<LyricsAnalysis | LyricalIdeas | null>(null);
    const [isLyricsLoading, setIsLyricsLoading] = useState(false);
    const [lyricsError, setLyricsError] = useState<string | null>(null);
    const [structureData, setStructureData] = useState<StructureSegment[] | null>(null);
    const [isStructureLoading, setIsStructureLoading] = useState(false);
    const [lastFmData, setLastFmData] = useState<LastFmTrackInfo | null>(null);
    const [discogsData, setDiscogsData] = useState<DiscogsResult | null>(null);
    const [isMarketLoading, setIsMarketLoading] = useState(false);
    const [isTraining, setIsTraining] = useState(false);
    const [energyMounted, setEnergyMounted] = useState(false);

    useEffect(() => {
        const analyzeDSP = async () => {
            if (!uploadedFile) return;
            setIsDspLoading(true);
            try {
                const features = await analyzeAudioFeatures(uploadedFile);
                setDspData(features);
            } catch (e) {
                console.error("DSP Analysis Failed", e);
            } finally {
                setIsDspLoading(false);
            }
        };
        analyzeDSP();
        setEnergyMounted(false);
        setTimeout(() => setEnergyMounted(true), 500);
    }, [uploadedFile]);

    // ... (handlers remain the same)
    const handleVerifySpotify = async () => {
        const query = `${metadata.artist || ''} ${metadata.title || ''}`.trim();
        if (!query) return;
        setIsSpotifyLoading(true);
        setSpotifyData(null);
        setSpotifyTrack(null);
        try {
            const track = await searchSpotifyTrack(query);
            if (track) {
                setSpotifyTrack(track);
                const features = await getSpotifyAudioFeatures(track.id);
                setSpotifyData(features);
            }
        } catch (e) { console.error("Spotify verification failed", e); } finally { setIsSpotifyLoading(false); }
    };

    const handleFetchLyrics = async () => {
        if (!metadata.artist || !metadata.title) return;
        setIsLyricsLoading(true);
        setLyricsError(null);
        setFetchedLyrics(null);
        try {
            const result = await fetchLyrics(metadata.artist, metadata.title);
            if (result.error) { setLyricsError(result.error); } else { setFetchedLyrics(result.lyrics); }
        } catch (e) { setLyricsError("Fetch error"); } finally { setIsLyricsLoading(false); }
    };

    const handleAnalyzeLyricsAI = async () => {
        if (!uploadedFile) return;
        setIsLyricsLoading(true);
        try {
            const result = await analyzeLyrics(uploadedFile, metadata);
            setLyricsData(result);
        } catch (e) { setLyricsError("AI Analysis failed"); } finally { setIsLyricsLoading(false); }
    };

    const handleGenerateLyricsIdeas = async () => {
        setIsLyricsLoading(true);
        try {
            const result = await generateLyricalIdeas(metadata);
            setLyricsData(result);
        } catch (e) { setLyricsError("Ideas generation failed"); } finally { setIsLyricsLoading(false); }
    };

    const handleAnalyzeStructure = async () => {
        if (!uploadedFile) return;
        setIsStructureLoading(true);
        try {
            const result = await analyzeStructure(uploadedFile);
            setStructureData(result);
        } catch (e) { showToast("Structure analysis failed", 'error'); } finally { setIsStructureLoading(false); }
    };

    const handleFetchMarketData = async () => {
        if (!metadata.artist || !metadata.title) return;
        setIsMarketLoading(true);
        try {
            const [lfm, discogs] = await Promise.all([
                getLastFmTrackInfo(metadata.artist, metadata.title),
                searchDiscogs(metadata.artist, metadata.title)
            ]);
            setLastFmData(lfm);
            setDiscogsData(discogs);
        } catch (e) { console.error("Market data fetch failed", e); } finally { setIsMarketLoading(false); }
    };

    const handleTrainModel = () => {
        if (!dspData || !metadata.mainGenre) return;
        setIsTraining(true);
        try {
            trainModel(metadata, dspData);
            setTimeout(() => setIsTraining(false), 800);
        } catch (e) { setIsTraining(false); }
    };

    const handleGenerateCode = (type: 'cat' | 'isrc') => {
        if (type === 'cat') { onFieldUpdate('catalogNumber', generateNextCatalogNumber()); } else { onFieldUpdate('isrc', generateNextISRC()); }
        showToast("Wygenerowano kod", 'info');
    };

    // Render Logic for Energy Bar
    const renderEnergyBar = () => {
        const level = metadata.energyLevel || 'Medium';
        const widthMap: Record<string, string> = { 'Low': '30%', 'Medium': '50%', 'High': '75%', 'Very High': '95%' };
        const colorMap: Record<string, string> = { 'Low': 'bg-blue-500', 'Medium': 'bg-green-500', 'High': 'bg-orange-500', 'Very High': 'bg-red-500' };
        const targetWidth = widthMap[level] || '50%';
        const targetColor = colorMap[level] || 'bg-blue-500';

        return (
            <div className="flex items-center gap-2">
                <div className="flex-grow bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-all duration-1000 ease-out rounded-full ${targetColor}`}
                        style={{ width: energyMounted ? targetWidth : '0%' }}
                    ></div>
                </div>
                <EditableInput isEditing={isEditing} value={metadata.energyLevel} onChange={v => onFieldUpdate('energyLevel', v)} className="text-xs font-bold w-20 text-right" />
            </div>
        );
    };

    return (
        <Card className="overflow-hidden border-t-4 border-t-accent-violet shadow-2xl">
            {/* ... Header remains mostly the same, just minor animation tweaks ... */}
            {/* 1. HEADER: IDENTITY */}
            <div className="flex flex-col md:flex-row gap-6 mb-8 pb-6 border-b border-slate-100 dark:border-slate-800 relative">
                {dspData && (
                    <div className="absolute top-0 right-0 animate-fade-in">
                        <Tooltip text="Add this track to AI knowledge base to improve future analyses">
                            <button
                                onClick={handleTrainModel}
                                disabled={isTraining}
                                className={`flex items-center gap-1 text-[10px] uppercase font-bold px-2 py-1 rounded-full transition-all ${isTraining ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500 hover:bg-accent-violet hover:text-white'}`}
                            >
                                {isTraining ? <CheckCircle2 className="w-3 h-3" /> : <BrainCircuit className="w-3 h-3" />}
                                {isTraining ? 'Trained' : 'Train Model'}
                            </button>
                        </Tooltip>
                    </div>
                )}

                {/* Cover/Icon */}
                <div className="w-full md:w-auto flex justify-center md:justify-start">
                    <div className="w-24 h-24 bg-gradient-to-br from-accent-violet to-accent-blue rounded-2xl flex items-center justify-center shadow-lg shadow-accent-violet/20 text-white shrink-0 overflow-hidden group hover:scale-105 transition-transform duration-300">
                        {spotifyTrack?.album.images[0] ? (
                            <img src={spotifyTrack.album.images[0].url} alt="Cover" className="w-full h-full object-cover" />
                        ) : discogsData?.thumb ? (
                            <img src={discogsData.thumb} alt="Discogs Cover" className="w-full h-full object-cover" />
                        ) : (
                            <Music className="w-10 h-10 opacity-90 group-hover:rotate-12 transition-transform" />
                        )}
                    </div>
                </div>

                {/* Title & Artist */}
                <div className="flex-grow flex flex-col justify-center text-center md:text-left">
                    <div className="mb-2">
                        <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                            <label className="text-[10px] font-bold text-accent-violet uppercase tracking-wider">Track Title</label>
                            {isEditing && <button onClick={() => onRefine('title')} disabled={!!refiningField}><Sparkles className="w-3 h-3 text-accent-violet" /></button>}
                        </div>
                        <EditableInput
                            isEditing={isEditing}
                            value={metadata.title}
                            onChange={v => onFieldUpdate('title', v)}
                            className="text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-none"
                            placeholder="Title"
                        />
                    </div>
                    <div>
                        <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Artysta</label>
                            {isEditing && <button onClick={() => onRefine('artist')} disabled={!!refiningField}><Sparkles className="w-3 h-3 text-slate-400 hover:text-accent-violet" /></button>}
                        </div>
                        <EditableInput
                            isEditing={isEditing}
                            value={metadata.artist}
                            onChange={v => onFieldUpdate('artist', v)}
                            className="text-xl font-semibold text-slate-600 dark:text-slate-300"
                            placeholder="Artysta"
                        />
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="flex flex-row md:flex-col gap-4 justify-center md:justify-start min-w-[200px]">
                    {/* ... items ... */}
                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2"><Layers className="w-3 h-3" /> Album</span>
                        <EditableInput isEditing={isEditing} value={metadata.album} onChange={v => onFieldUpdate('album', v)} className="text-sm font-medium text-right" />
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2"><Calendar className="w-3 h-3" /> Rok</span>
                        <EditableInput isEditing={isEditing} value={metadata.year} onChange={v => onFieldUpdate('year', v)} className="text-sm font-medium text-right" />
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2"><Hash className="w-3 h-3" /> Gatunek</span>
                        <EditableInput isEditing={isEditing} value={metadata.mainGenre} onChange={v => onFieldUpdate('mainGenre', v)} className="text-sm font-bold text-accent-violet text-right" />
                    </div>
                </div>
            </div>

            {/* 2. THREE-COLUMN LAYOUT */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 divide-y lg:divide-y-0 lg:divide-x divide-slate-100 dark:divide-slate-800">

                {/* COL 1: TECHNICAL & STRUCTURE */}
                <div className="lg:pr-6 space-y-6">
                    <SectionHeader icon={<Activity className="w-5 h-5" />} title="Engineering & Structure" color="text-blue-500" />

                    <div className="grid grid-cols-2 gap-3">
                        <div className="text-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 group hover:border-blue-500/30 transition-colors">
                            <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">BPM</span>
                            <div className="text-3xl font-black text-slate-800 dark:text-slate-100 group-hover:scale-110 transition-transform">{metadata.bpm || dspData?.bpm || 0}</div>
                        </div>
                        <div className="text-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 group hover:border-blue-500/30 transition-colors">
                            <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Key</span>
                            <div className="text-2xl font-bold text-slate-800 dark:text-slate-100 group-hover:scale-110 transition-transform">
                                {metadata.key || dspData?.key || '-'} <span className="text-sm font-medium text-slate-500">{metadata.mode}</span>
                            </div>
                        </div>
                    </div>

                    {/* Backend MIR Technical Data */}
                    {(metadata.spectral_centroid || metadata.danceability) && (
                        <div className="bg-slate-50 dark:bg-slate-900/40 p-3 rounded-xl border border-blue-100 dark:border-blue-900/30">
                            <div className="flex items-center gap-2 mb-2">
                                <BrainCircuit className="w-3 h-3 text-blue-500" />
                                <span className="text-[9px] font-bold uppercase text-blue-500 tracking-wider">Technical Analysis (Python MIR)</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-center">
                            </div>
                        </div>

                    )}

                    {/* DSP Visualization Block */}
                    <div className="bg-slate-50 dark:bg-slate-900/30 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-[10px] font-bold uppercase text-slate-500">Signal Parameters</span>
                            {isDspLoading && <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>}
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <div className="text-[9px] text-slate-400 uppercase mb-1">Loudness</div>
                                <div className="font-mono font-bold text-slate-700 dark:text-slate-300">{dspData?.loudnessDb ?? '-'} dB</div>
                            </div>
                            <div>
                                <div className="text-[9px] text-slate-400 uppercase mb-1">True Peak</div>
                                <div className={`font-mono font-bold ${dspData?.truePeak && dspData.truePeak > 0 ? 'text-red-500' : 'text-slate-700 dark:text-slate-300'}`}>
                                    {dspData?.truePeak ?? '-'} dB
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <div className="text-[9px] text-slate-400 uppercase mb-1">Korelacja Fazy</div>
                                <CorrelationMeter value={dspData?.stereoCorrelation || 0} />
                            </div>
                            {dspData?.spectralBalance && (
                                <div>
                                    <div className="text-[9px] text-slate-400 uppercase mb-1 mt-2">Balans Spektralny ({dspData.spectralBalance.character})</div>
                                    <div className="flex gap-1 h-12 mt-1">
                                        <SpectrumBar label="Low" percent={dspData.spectralBalance.low} color="bg-indigo-500" />
                                        <SpectrumBar label="Mid" percent={dspData.spectralBalance.mid} color="bg-teal-500" />
                                        <SpectrumBar label="High" percent={dspData.spectralBalance.high} color="bg-fuchsia-500" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <FieldGroup label="Poziom Energii" onRefine={() => onRefine('energyLevel')} isRefining={refiningField === 'energyLevel'}>
                            {renderEnergyBar()}
                        </FieldGroup>
                        <FieldGroup label="Charakter Tempa" onRefine={() => onRefine('tempoCharacter')} isRefining={refiningField === 'tempoCharacter'}>
                            <EditableInput isEditing={isEditing} value={metadata.tempoCharacter} onChange={v => onFieldUpdate('tempoCharacter', v)} className="font-medium text-sm" />
                        </FieldGroup>
                    </div>

                    {/* Spotify Verification */}
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                        {!spotifyData ? (
                            <Button onClick={handleVerifySpotify} disabled={isSpotifyLoading || !metadata.title} variant="secondary" size="sm" className="w-full text-xs">
                                {isSpotifyLoading ? 'Sprawdzanie...' : 'Weryfikuj w Spotify'}
                            </Button>
                        ) : (
                            spotifyTrack && <SpotifyDataBlock data={spotifyData} track={spotifyTrack} />
                        )}
                    </div>
                </div>

                {/* COL 2: CLASSIFICATION & STYLE (AI) */}
                <div className="lg:px-6 pt-6 lg:pt-0 space-y-6">
                    <SectionHeader icon={<BrainCircuit className="w-5 h-5" />} title="Klasyfikacja & Styl (AI)" color="text-pink-500" />

                    <div className="space-y-5">
                        <FieldGroup label="Instrumentarium" onRefine={() => onRefine('instrumentation')} isRefining={refiningField === 'instrumentation'}>
                            <TagInput
                                isEditing={isEditing}
                                tags={metadata.instrumentation}
                                onChange={v => onFieldUpdate('instrumentation', v)}
                                colorClass="bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800/50"
                            />
                        </FieldGroup>

                        <FieldGroup label="Mood / Emotions" onRefine={() => onRefine('moods')} isRefining={refiningField === 'moods'}>
                            <TagInput
                                isEditing={isEditing}
                                tags={metadata.moods}
                                onChange={v => onFieldUpdate('moods', v)}
                                colorClass="bg-fuchsia-50 dark:bg-fuchsia-900/20 text-fuchsia-700 dark:text-fuchsia-300 border-fuchsia-200 dark:border-fuchsia-800/50"
                            />
                        </FieldGroup>

                        <FieldGroup label="Subgenres" onRefine={() => onRefine('additionalGenres')} isRefining={refiningField === 'additionalGenres'}>
                            <TagInput
                                isEditing={isEditing}
                                tags={metadata.additionalGenres}
                                onChange={v => onFieldUpdate('additionalGenres', v)}
                                colorClass="bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-800/50"
                            />
                        </FieldGroup>

                        <FieldGroup label="Vocal Style" onRefine={() => onRefine('vocalStyle')} isRefining={refiningField === 'vocalStyle'}>
                            {(metadata.vocalStyle?.gender && metadata.vocalStyle.gender !== 'None') ? (
                                <div className="flex flex-wrap gap-2 text-xs">
                                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-600 dark:text-slate-300">
                                        <User className="w-3 h-3 inline mr-1" /> {metadata.vocalStyle.gender}
                                    </span>
                                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-600 dark:text-slate-300">
                                        {metadata.vocalStyle.timbre}
                                    </span>
                                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-600 dark:text-slate-300">
                                        {metadata.vocalStyle.emotionalTone}
                                    </span>
                                </div>
                            ) : (
                                <div className="text-sm text-slate-400 italic">Instrumental track</div>
                            )}
                        </FieldGroup>
                    </div>
                </div>

                {/* COL 3: CONTEXT & DESCRIPTION */}
                <div className="lg:pl-6 pt-6 lg:pt-0 space-y-6">
                    <SectionHeader icon={<MessageSquare className="w-5 h-5" />} title="Context & Description" color="text-emerald-500" />

                    <div className="space-y-5">
                        {/* Legal & Credits Block */}
                        <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-lg border border-slate-100 dark:border-slate-800 space-y-3">
                            <div className="grid grid-cols-2 gap-4">
                                <FieldGroup label="Label">
                                    <EditableInput isEditing={isEditing} value={metadata.label} onChange={v => onFieldUpdate('label', v)} placeholder="E.g. Sony Music" className="text-sm font-medium" />
                                </FieldGroup>
                                <FieldGroup label="Publisher">
                                    <EditableInput isEditing={isEditing} value={metadata.publisher} onChange={v => onFieldUpdate('publisher', v)} placeholder="E.g. Sony ATV" className="text-sm font-medium" />
                                </FieldGroup>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <FieldGroup label="Composer">
                                    <EditableInput isEditing={isEditing} value={metadata.composer} onChange={v => onFieldUpdate('composer', v)} placeholder="First Last" className="text-sm" />
                                </FieldGroup>
                                <FieldGroup label="Lyricist">
                                    <EditableInput isEditing={isEditing} value={metadata.lyricist} onChange={v => onFieldUpdate('lyricist', v)} placeholder="First Last" className="text-sm" />
                                </FieldGroup>
                            </div>
                            <FieldGroup label="Copyright">
                                <div className="flex items-center gap-2">
                                    <CopyrightIcon className="w-3 h-3 text-slate-400" />
                                    <EditableInput isEditing={isEditing} value={metadata.copyright} onChange={v => onFieldUpdate('copyright', v)} placeholder="(C) 2024 Artist Name" className="text-sm font-mono text-slate-600 dark:text-slate-300" />
                                </div>
                            </FieldGroup>
                        </div>

                        <FieldGroup label="Full Track Lyrics" extraAction={<span className="text-[9px] text-slate-400">USLT Frame</span>}>
                            <EditableInput
                                isEditing={isEditing}
                                value={metadata.lyrics}
                                onChange={v => onFieldUpdate('lyrics', v)}
                                type="textarea"
                                className="text-xs font-mono leading-relaxed text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 p-3 rounded border border-slate-200 dark:border-slate-700 h-32 overflow-y-auto"
                                placeholder="Wklej tutaj tekst utworu..."
                            />
                        </FieldGroup>

                        <FieldGroup label="Opis Utworu (Context)" onRefine={() => onRefine('trackDescription')} isRefining={refiningField === 'trackDescription'}>
                            <EditableInput
                                isEditing={isEditing}
                                value={metadata.trackDescription}
                                onChange={v => onFieldUpdate('trackDescription', v)}
                                type="textarea"
                                className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 italic bg-slate-50 dark:bg-slate-900/30 p-3 rounded-lg border border-slate-100 dark:border-slate-800 transition-shadow focus:shadow-md"
                                placeholder="Brak opisu."
                            />
                        </FieldGroup>

                        {/* LYRICS SECTION */}
                        <div className="mb-4">
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Tekst Utworu (Lyrics)</label>
                                <div className="flex gap-2">
                                    {!fetchedLyrics && !isLyricsLoading && (
                                        <button onClick={handleFetchLyrics} className="text-xs text-blue-500 hover:underline flex items-center gap-1">
                                            <FileText className="w-3 h-3" /> OVH
                                        </button>
                                    )}
                                    {uploadedFile && (
                                        <button onClick={handleAnalyzeLyricsAI} disabled={isLyricsLoading} className="text-xs text-accent-violet hover:underline flex items-center gap-1">
                                            <Sparkles className="w-3 h-3" /> Transcribe
                                        </button>
                                    )}
                                    <button onClick={handleGenerateLyricsIdeas} disabled={isLyricsLoading} className="text-xs text-pink-500 hover:underline flex items-center gap-1">
                                        <BrainCircuit className="w-3 h-3" /> Ideas
                                    </button>
                                </div>
                            </div>

                            {isLyricsLoading && <div className="text-xs text-slate-500">Processing lyrics...</div>}
                            {lyricsError && <div className="text-xs text-red-500">{lyricsError}</div>}

                            {(fetchedLyrics || lyricsData) && (
                                <div className="relative group animate-fade-in">
                                    <div className="max-h-32 overflow-y-auto bg-slate-50 dark:bg-slate-900/30 p-3 rounded-lg border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">
                                        {fetchedLyrics || (lyricsData as LyricsAnalysis)?.lyrics || (lyricsData as LyricalIdeas)?.verse + "\n...\n" + (lyricsData as LyricalIdeas)?.chorus}
                                    </div>
                                    <button
                                        onClick={() => { navigator.clipboard.writeText(fetchedLyrics || (lyricsData as LyricsAnalysis)?.lyrics || ''); showToast("Copied lyrics!", 'success'); }}
                                        className="absolute top-2 right-2 p-1 bg-white dark:bg-slate-800 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Copy lyrics"
                                    >
                                        <Download className="w-3 h-3 text-slate-500" />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* MARKET INTELLIGENCE SECTION */}
                        <div className="mb-4">
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3" /> Market Intelligence
                                </label>
                                {!lastFmData && !isMarketLoading && (
                                    <button onClick={handleFetchMarketData} className="text-xs text-accent-violet hover:underline flex items-center gap-1">
                                        <Database className="w-3 h-3" /> Analyze Trends
                                    </button>
                                )}
                            </div>

                            {isMarketLoading && <div className="text-xs text-slate-500 flex gap-2 items-center"><div className="w-3 h-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" /> Fetching Last.fm & Discogs data...</div>}

                            {(lastFmData || discogsData) && (
                                <div className="bg-slate-50 dark:bg-slate-900/30 p-3 rounded-lg border border-slate-100 dark:border-slate-800 space-y-3 text-xs animate-fade-in">
                                    {/* Last.fm Tags */}
                                    {lastFmData?.track?.toptags?.tag?.length ? (
                                        <div>
                                            <span className="font-bold text-red-500 block mb-1">Last.fm Community Tags:</span>
                                            <div className="flex flex-wrap gap-1">
                                                {lastFmData.track.toptags.tag.slice(0, 5).map(t => (
                                                    <span key={t.name} className="px-1.5 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300 rounded text-[10px] hover:bg-red-200 dark:hover:bg-red-900/50 cursor-default transition-colors">
                                                        {t.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ) : null}

                                    {/* Discogs Info */}
                                    {discogsData && (
                                        <div>
                                            <span className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Discogs Data:</span>
                                            <div className="grid grid-cols-2 gap-1 text-slate-500">
                                                <span>Label: <span className="text-slate-700 dark:text-slate-300">{discogsData.label?.[0] || '-'}</span></span>
                                                <span>Rok: <span className="text-slate-700 dark:text-slate-300">{discogsData.year || '-'}</span></span>
                                                <span>Cat#: <span className="text-slate-700 dark:text-slate-300">{discogsData.catno || '-'}</span></span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <FieldGroup label="Zastosowania (Sync)" onRefine={() => onRefine('useCases')} isRefining={refiningField === 'useCases'}>
                            <TagInput
                                isEditing={isEditing}
                                tags={metadata.useCases}
                                onChange={v => onFieldUpdate('useCases', v)}
                                colorClass="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50"
                            />
                        </FieldGroup>

                        {/* ... (Other fields) ... */}

                        <div className="grid grid-cols-2 gap-4">
                            <FieldGroup label="Language">
                                <div className="flex items-center gap-2">
                                    <Globe className="w-3 h-3 text-slate-400" />
                                    <EditableInput isEditing={isEditing} value={metadata.language} onChange={v => onFieldUpdate('language', v)} className="font-medium text-sm" />
                                </div>
                            </FieldGroup>
                            <FieldGroup label="Era">
                                <EditableInput isEditing={isEditing} value={metadata.musicalEra} onChange={v => onFieldUpdate('musicalEra', v)} className="font-medium text-sm" />
                            </FieldGroup>
                        </div>
                    </div>
                </div>

            </div>
        </Card >
    );
};

export default UnifiedMetadataCard;
