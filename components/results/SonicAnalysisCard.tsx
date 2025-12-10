
import React, { useState, useEffect } from 'react';
import Card from './Card';
import { BrainCircuit, BarChart, Plus, CheckCircle2, Mic, Layers, RefreshCw, ListPlus, Sparkles } from '../icons';
import { Metadata, HFClassificationResult } from '../../types';
import Button from '../Button';
import { analyzeFullSonicContext, SonicAnalysisResult } from '../../services/huggingFaceService';
import { analyzeAudioFeatures, AudioFeatures } from '../../services/audioAnalysisService';
import Tooltip from '../Tooltip';

interface SonicAnalysisCardProps {
    metadata: Metadata;
    file: File | null;
    onUpdateMetadata: (data: Partial<Metadata>) => void;
    showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

const SpectrumBar: React.FC<{ label: string; percent: number; color: string }> = ({ label, percent, color }) => (
    <div className="flex flex-col items-center gap-1 flex-1 h-24 justify-end">
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-t-sm relative overflow-hidden h-full">
            <div
                className={`absolute bottom-0 left-0 w-full transition-all duration-1000 ${color}`}
                style={{ height: `${Math.min(100, Math.max(5, percent))}%` }}
            ></div>
        </div>
        <span className="text-[10px] uppercase font-bold text-slate-500">{label}</span>
    </div>
);

const CorrelationMeter: React.FC<{ value: number }> = ({ value }) => {
    const percent = ((value + 1) / 2) * 100;
    return (
        <div className="w-full">
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mb-1">
                <span>-1 (Phase Issue)</span>
                <span>0</span>
                <span>+1 (Mono/Perf)</span>
            </div>
            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden relative">
                <div className="absolute top-0 bottom-0 w-1 bg-slate-400 left-1/2 -ml-0.5 z-10"></div>
                <div
                    className={`h-full transition-all duration-700 rounded-full ${value < 0 ? 'bg-red-500' : 'bg-green-500'}`}
                    style={{ width: `${percent}%` }}
                ></div>
            </div>
            <div className="text-center text-xs font-bold mt-1 text-slate-600 dark:text-slate-300">
                {value.toFixed(2)}
            </div>
        </div>
    );
};

const ClassificationBlock: React.FC<{
    results: HFClassificationResult[] | null;
    title: string;
    icon: React.ReactNode;
    colorClass: string;
    onApply: (label: string, type: 'main' | 'add' | 'main_single') => void;
    onAddTop3?: () => void;
    emptyMessage?: string;
    onRetry: () => void;
    isAnalyzing: boolean;
    limit?: number;
    type: 'genre' | 'mood' | 'inst';
}> = ({ results, title, icon, colorClass, onApply, onAddTop3, emptyMessage, onRetry, isAnalyzing, limit = 5, type }) => {
    return (
        <div className="space-y-3 animate-fade-in h-full flex flex-col">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase text-slate-500">
                    {icon} <span>{title}</span>
                </div>
                {onAddTop3 && results && results.length >= 2 && (
                    <Tooltip text="Add top 3 to tags">
                        <button onClick={onAddTop3} className="text-xs flex items-center gap-1 text-accent-violet hover:underline font-medium">
                            <ListPlus className="w-3.5 h-3.5" /> Add Top 3
                        </button>
                    </Tooltip>
                )}
            </div>

            <div className="flex-grow space-y-2">
                {isAnalyzing ? (
                    <div className="flex flex-col items-center justify-center h-32 text-slate-400">
                        <div className="w-8 h-8 border-4 border-slate-200 dark:border-slate-700 border-t-accent-violet rounded-full animate-spin mb-2"></div>
                        <span className="text-xs font-semibold">Full AI analysis...</span>
                    </div>
                ) : (!results || results.length === 0) ? (
                    <div className="flex flex-col items-center justify-center h-32 text-slate-400">
                        <p className="text-xs italic">{emptyMessage || "No results."}</p>
                        <button onClick={onRetry} className="mt-2 text-xs text-accent-violet hover:underline">Analyze</button>
                    </div>
                ) : (
                    results.slice(0, limit).map((res, i) => (
                        <div key={i} className="relative h-8 bg-white dark:bg-slate-800 rounded-md overflow-hidden border border-slate-100 dark:border-slate-700 group">
                            <div
                                className={`absolute top-0 left-0 h-full opacity-10 dark:opacity-20 transition-all duration-1000 ${colorClass}`}
                                style={{ width: `${res.score * 100}%` }}
                            />
                            <div className={`absolute top-0 left-0 h-full w-1 ${colorClass.replace('bg-', 'bg-opacity-100 bg-')}`} />

                            <div className="absolute inset-0 flex items-center justify-between px-3">
                                <div className="flex items-center gap-2 z-10 min-w-0">
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200 capitalize truncate" title={res.label}>
                                        {res.label}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 z-10">
                                    <span className="text-[10px] font-mono text-slate-400 group-hover:hidden">{(res.score * 100).toFixed(0)}%</span>
                                    <div className="hidden group-hover:flex gap-1 bg-white dark:bg-slate-800 pl-2 shadow-sm rounded">
                                        {type === 'inst' ? (
                                            <Tooltip text="Set as main instrument">
                                                <button onClick={() => onApply(res.label, 'main_single')} className="p-1 hover:bg-green-50 dark:hover:bg-green-900 rounded text-green-500">
                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                </button>
                                            </Tooltip>
                                        ) : type === 'genre' ? (
                                            <Tooltip text="Set as main genre">
                                                <button onClick={() => onApply(res.label, 'main')} className="p-1 hover:bg-green-50 dark:hover:bg-green-900 rounded text-green-500">
                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                </button>
                                            </Tooltip>
                                        ) : null}

                                        <Tooltip text="Add to list">
                                            <button onClick={() => onApply(res.label, 'add')} className="p-1 hover:bg-blue-50 dark:hover:bg-blue-900 rounded text-blue-500">
                                                <Plus className="w-3.5 h-3.5" />
                                            </button>
                                        </Tooltip>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {!isAnalyzing && results && results.length > 0 && (
                <div className="mt-auto pt-2 border-t border-slate-100 dark:border-slate-800">
                    <Button onClick={onRetry} disabled={isAnalyzing} size="sm" variant="secondary" className="w-full text-xs py-1.5 h-8">
                        <RefreshCw className="w-3 h-3" /> Re-analyze
                    </Button>
                </div>
            )}
        </div>
    );
};

const SonicAnalysisCard: React.FC<SonicAnalysisCardProps> = ({ metadata, file, onUpdateMetadata, showToast }) => {
    const [activeTab, setActiveTab] = useState<'genre' | 'mood' | 'inst'>('genre');

    // Unified Results State
    const [analysisResult, setAnalysisResult] = useState<SonicAnalysisResult | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // DSP Data state
    const [dspData, setDspData] = useState<AudioFeatures | null>(null);
    const [isDspLoading, setIsDspLoading] = useState(false);

    const handleAnalyze = async () => {
        if (!file || isAnalyzing) return;

        setIsAnalyzing(true);

        try {
            // Analyze ALL categories in one unified request
            const res = await analyzeFullSonicContext(file);
            setAnalysisResult(res);

            // Auto-Apply High Confidence Instruments
            const highConfidenceInstruments = res.instruments
                .filter(r => r.score > 0.85)
                .map(r => r.label);

            if (highConfidenceInstruments.length > 0) {
                const currentInstruments = new Set((metadata.instrumentation || []).map(i => i.toLowerCase()));
                let addedCount = 0;
                const newInstrumentation = [...(metadata.instrumentation || [])];

                highConfidenceInstruments.forEach(inst => {
                    if (!currentInstruments.has(inst.toLowerCase())) {
                        newInstrumentation.push(inst);
                        currentInstruments.add(inst.toLowerCase());
                        addedCount++;
                    }
                });

                if (addedCount > 0) {
                    onUpdateMetadata({ instrumentation: newInstrumentation });
                    showToast(`Automatically added ${addedCount} confident instruments.`, 'success');
                }
            }

            showToast("Sonic analysis completed successfully.", 'success');
        } catch (err) {
            const message = err instanceof Error ? err.message : "An error occurred during analysis.";
            showToast(message, 'error');
        } finally {
            setIsAnalyzing(false);
        }
    };

    // Auto-analyze DSP on load
    useEffect(() => {
        const loadDsp = async () => {
            if (!file) return;
            setIsDspLoading(true);
            try {
                const features = await analyzeAudioFeatures(file);
                setDspData(features);
            } catch (e) {
                console.error(e);
            } finally {
                setIsDspLoading(false);
            }
        };
        loadDsp();

        // Reset analysis when file changes
        setAnalysisResult(null);
    }, [file]);

    // Auto-analyze AI on first tab interaction if empty
    useEffect(() => {
        if (file && !analysisResult && !isAnalyzing) {
            handleAnalyze();
        }
    }, [activeTab, file]);

    const handleApplyResult = (value: string, type: 'main' | 'add' | 'main_single', category: 'genre' | 'mood' | 'inst') => {
        const cleanValue = value.split('/')[0].trim();
        const formatted = cleanValue.charAt(0).toUpperCase() + cleanValue.slice(1);

        if (category === 'genre') {
            if (type === 'main') {
                onUpdateMetadata({ mainGenre: formatted });
                showToast(`Set main genre: ${formatted}`, 'success');
            } else {
                const current = metadata.additionalGenres || [];
                // Case insensitive check
                if (!current.some(g => g.toLowerCase() === formatted.toLowerCase())) {
                    onUpdateMetadata({ additionalGenres: [...current, formatted] });
                    showToast(`Added genre: ${formatted}`, 'success');
                }
            }
        } else if (category === 'mood') {
            const current = metadata.moods || [];
            if (!current.some(m => m.toLowerCase() === formatted.toLowerCase())) {
                onUpdateMetadata({ moods: [...current, formatted] });
                showToast(`Added mood: ${formatted}`, 'success');
            }
        } else if (category === 'inst') {
            if (type === 'main_single') {
                onUpdateMetadata({ mainInstrument: formatted });
                showToast(`Set main instrument: ${formatted}`, 'success');
            } else {
                const current = metadata.instrumentation || [];
                if (!current.some(i => i.toLowerCase() === formatted.toLowerCase())) {
                    onUpdateMetadata({ instrumentation: [...current, formatted] });
                    showToast(`Added instrument: ${formatted}`, 'success');
                }
            }
        }
    };

    const handleAddTop3 = (results: HFClassificationResult[], category: 'genre' | 'inst') => {
        if (!results || results.length === 0) return;

        const top3 = results.slice(0, 3).map(r => r.label);
        let addedCount = 0;

        if (category === 'genre') {
            const current = new Set((metadata.additionalGenres || []).map(s => s.toLowerCase()));
            const mainLower = (metadata.mainGenre || '').toLowerCase();
            const newAdditional = [...(metadata.additionalGenres || [])];

            top3.forEach(genre => {
                if (genre.toLowerCase() !== mainLower && !current.has(genre.toLowerCase())) {
                    newAdditional.push(genre);
                    current.add(genre.toLowerCase());
                    addedCount++;
                }
            });
            if (addedCount > 0) onUpdateMetadata({ additionalGenres: newAdditional });
        } else {
            const current = new Set((metadata.instrumentation || []).map(s => s.toLowerCase()));
            const newInst = [...(metadata.instrumentation || [])];

            top3.forEach(inst => {
                if (!current.has(inst.toLowerCase())) {
                    newInst.push(inst);
                    current.add(inst.toLowerCase());
                    addedCount++;
                }
            });
            if (addedCount > 0) onUpdateMetadata({ instrumentation: newInst });
        }

        if (addedCount > 0) {
            showToast(`Added ${addedCount} new tags.`, 'success');
        } else {
            showToast("These tags are already added.", 'info');
        }
    };

    return (
        <Card>
            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4 mb-6">
                <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-gradient-to-br from-fuchsia-500 to-pink-600 text-white shadow-md shadow-fuchsia-500/20">
                    <BrainCircuit className="w-6 h-6" />
                </div>
                <div className="flex-grow">
                    <h3 className="text-lg font-bold text-light-text dark:text-dark-text">Sound Engineering & AI</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Advanced DSP and Gemini Classification.</p>
                </div>
                {!isAnalyzing && !analysisResult && file && (
                    <Button onClick={handleAnalyze} size="sm" variant="primary">
                        <Sparkles className="w-4 h-4" /> Analyze
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column: DSP Data (Hard Data) */}
                <div className="bg-slate-50 dark:bg-slate-900/30 rounded-lg p-4 border border-slate-100 dark:border-slate-800 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-4 text-accent-violet">
                        <div className="flex items-center gap-2">
                            <BarChart className="w-5 h-5" />
                            <h4 className="font-bold text-sm uppercase tracking-wide">Technical Analysis</h4>
                        </div>
                        {isDspLoading && <div className="w-4 h-4 border-2 border-accent-violet border-t-transparent rounded-full animate-spin"></div>}
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-white dark:bg-slate-800 p-3 rounded shadow-sm text-center">
                            <div className="text-[10px] text-slate-500 uppercase mb-1">Loudness (RMS)</div>
                            <div className="text-lg font-bold text-light-text dark:text-dark-text">{dspData?.loudnessDb ?? metadata.energyLevel} <span className="text-xs font-normal">dB</span></div>
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-3 rounded shadow-sm text-center">
                            <div className="text-[10px] text-slate-500 uppercase mb-1">True Peak</div>
                            <div className={`text-lg font-bold ${dspData?.truePeak && dspData.truePeak > 0 ? 'text-red-500' : 'text-light-text dark:text-dark-text'}`}>
                                {dspData?.truePeak ?? '-'} <span className="text-xs font-normal">dB</span>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-3 rounded shadow-sm text-center">
                            <div className="text-[10px] text-slate-500 uppercase mb-1">BPM</div>
                            <div className="text-lg font-bold text-light-text dark:text-dark-text">{dspData?.bpm ?? metadata.bpm}</div>
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-3 rounded shadow-sm text-center">
                            <div className="text-[10px] text-slate-500 uppercase mb-1">Key</div>
                            <div className="text-lg font-bold text-light-text dark:text-dark-text">
                                {dspData?.key ? `${dspData.key} ${dspData.mode}` : metadata.key}
                            </div>
                        </div>
                    </div>

                    {dspData && (
                        <div className="space-y-4 mt-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                            <div>
                                <h5 className="text-xs font-bold text-slate-500 mb-2">Phase Correlation</h5>
                                <CorrelationMeter value={dspData.stereoCorrelation || 0} />
                            </div>

                            {dspData.spectralBalance && (
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <h5 className="text-xs font-bold text-slate-500">Spectral Balance</h5>
                                        <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-slate-600 dark:text-slate-300">
                                            {dspData.spectralBalance.character}
                                        </span>
                                    </div>
                                    <div className="flex gap-2 h-16">
                                        <SpectrumBar label="Low" percent={dspData.spectralBalance.low} color="bg-indigo-500" />
                                        <SpectrumBar label="Mid" percent={dspData.spectralBalance.mid} color="bg-teal-500" />
                                        <SpectrumBar label="High" percent={dspData.spectralBalance.high} color="bg-fuchsia-500" />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Right Column: Gemini Classification Models */}
                <div className="bg-slate-50 dark:bg-slate-900/30 rounded-lg p-4 border border-slate-100 dark:border-slate-800 relative h-full flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-pink-500">
                            <BrainCircuit className="w-5 h-5" />
                            <h4 className="font-bold text-sm uppercase tracking-wide">AI Classification (Gemini)</h4>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex space-x-1 bg-slate-200 dark:bg-slate-800 p-1 rounded-lg mb-4">
                        <button
                            onClick={() => setActiveTab('genre')}
                            className={`flex-1 py-1 text-xs font-bold rounded transition-all flex items-center justify-center gap-1 ${activeTab === 'genre' ? 'bg-white dark:bg-slate-600 shadow text-pink-600' : 'text-slate-500'}`}
                        >
                            Genre
                        </button>
                        <button
                            onClick={() => setActiveTab('mood')}
                            className={`flex-1 py-1 text-xs font-bold rounded transition-all flex items-center justify-center gap-1 ${activeTab === 'mood' ? 'bg-white dark:bg-slate-600 shadow text-violet-600' : 'text-slate-500'}`}
                        >
                            Mood
                        </button>
                        <button
                            onClick={() => setActiveTab('inst')}
                            className={`flex-1 py-1 text-xs font-bold rounded transition-all flex items-center justify-center gap-1 ${activeTab === 'inst' ? 'bg-white dark:bg-slate-600 shadow text-cyan-600' : 'text-slate-500'}`}
                        >
                            Instruments
                        </button>
                    </div>

                    <div className="flex-grow overflow-y-auto custom-scrollbar min-h-[200px] flex flex-col">
                        {activeTab === 'genre' && (
                            <ClassificationBlock
                                results={analysisResult?.genres || null}
                                title="Detected Genres"
                                icon={<Layers className="w-4 h-4" />}
                                colorClass="bg-pink-500"
                                onApply={(val, type) => handleApplyResult(val, type, 'genre')}
                                onAddTop3={() => analysisResult && handleAddTop3(analysisResult.genres, 'genre')}
                                onRetry={handleAnalyze}
                                isAnalyzing={isAnalyzing}
                                emptyMessage="Click 'Analyze' to fetch full sonic profile."
                                type="genre"
                            />
                        )}

                        {activeTab === 'mood' && (
                            <ClassificationBlock
                                results={analysisResult?.moods || null}
                                title="Emotions / Mood"
                                icon={<BrainCircuit className="w-4 h-4" />}
                                colorClass="bg-violet-500"
                                onApply={(val, type) => handleApplyResult(val, type, 'mood')}
                                emptyMessage="Click 'Analyze' to fetch full sonic profile."
                                onRetry={handleAnalyze}
                                isAnalyzing={isAnalyzing}
                                type="mood"
                            />
                        )}

                        {activeTab === 'inst' && (
                            <ClassificationBlock
                                results={analysisResult?.instruments || null}
                                title="Detected Instruments"
                                icon={<Mic className="w-4 h-4" />}
                                colorClass="bg-cyan-500"
                                onApply={(val, type) => handleApplyResult(val, type, 'inst')}
                                onAddTop3={() => analysisResult && handleAddTop3(analysisResult.instruments, 'inst')}
                                emptyMessage="Click 'Analyze' to fetch full sonic profile."
                                onRetry={handleAnalyze}
                                isAnalyzing={isAnalyzing}
                                limit={10}
                                type="inst"
                            />
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default SonicAnalysisCard;
