
import React, { useEffect, useState } from 'react';
import Card from './Card';
import { Layers, Sparkles } from '../icons';
import Button from '../Button';
import { StructureSegment } from '../../types';
import Tooltip from '../Tooltip';

interface StructureCardProps {
    onAnalyze: () => void;
    isProcessing: boolean;
    structureData: StructureSegment[] | null;
}

const parseTime = (t: string | undefined) => {
    if (!t) return 0;
    try {
        const parts = t.split(':');
        if (parts.length === 2) return parseInt(parts[0]) * 60 + parseInt(parts[1]);
    } catch (e) {
        return 0;
    }
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

const StructureCard: React.FC<StructureCardProps> = ({ onAnalyze, isProcessing, structureData }) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        if (structureData && structureData.length > 0) {
            // Reset mounted state to re-trigger animation if data changes
            setMounted(false);
            const timer = setTimeout(() => {
                requestAnimationFrame(() => setMounted(true));
            }, 100);
            return () => clearTimeout(timer);
        } else {
            setMounted(false);
        }
    }, [structureData]);


    const renderTimeline = () => {
        if (!Array.isArray(structureData) || structureData.length === 0) return null;

        const lastSegment = structureData[structureData.length - 1];
        if (!lastSegment || !lastSegment.endTime) return null;

        const totalDuration = parseTime(lastSegment.endTime);
        if (totalDuration === 0) return null; // Avoid division by zero issues

        return (
            <div className="mt-6">
                <div className="flex w-full h-8 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 shadow-inner">
                    {structureData.map((seg, i) => {
                        const start = parseTime(seg.startTime);
                        const end = parseTime(seg.endTime);
                        const duration = end - start;
                        const targetWidth = (duration / totalDuration) * 100;

                        return (
                            <Tooltip key={i} text={`${seg.section} (${seg.startTime} - ${seg.endTime})`}>
                                <div
                                    className={`h-full ${getSectionColor(seg.section)} transition-all duration-1000 ease-out hover:brightness-110 cursor-help origin-left`}
                                    style={{
                                        width: mounted ? `${targetWidth}%` : '0%',
                                        transitionDelay: `${i * 100}ms`
                                    }}
                                />
                            </Tooltip>
                        );
                    })}
                </div>
                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-2 font-mono px-1">
                    <span>0:00</span>
                    <span>{lastSegment.endTime}</span>
                </div>
            </div>
        );
    };

    return (
        <Card>
            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4 mb-4">
                <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-md shadow-orange-500/20">
                    <Layers className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-light-text dark:text-dark-text">Track Structure</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Section and arrangement analysis.</p>
                </div>
            </div>

            {isProcessing ? (
                <div className="flex flex-col items-center justify-center text-center space-y-4 py-8">
                    <div className="w-12 h-12 border-4 border-accent-violet border-t-transparent rounded-full animate-spin"></div>
                    <p className="font-semibold text-light-text dark:text-dark-text">Analyzing audio structure...</p>
                </div>
            ) : structureData && Array.isArray(structureData) && structureData.length > 0 ? (
                <div className="animate-fade-in">
                    {renderTimeline()}
                    <div className="mt-4 space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                        {structureData.map((seg, i) => (
                            <div
                                key={i}
                                className="flex items-start gap-3 p-3 bg-slate-100 dark:bg-slate-800/50 rounded-lg text-sm transition-all duration-300 hover:scale-[1.01] hover:bg-slate-200 dark:hover:bg-slate-800 animate-slide-up"
                                style={{ animationDelay: `${i * 50}ms` }}
                            >
                                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${getSectionColor(seg.section)}`}></div>
                                <div className="flex-grow">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-bold text-light-text dark:text-dark-text">{seg.section}</span>
                                        <span className="font-mono text-xs text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                                            {seg.startTime} - {seg.endTime}
                                        </span>
                                    </div>
                                    <p className="text-slate-600 dark:text-slate-400 text-xs">{seg.description}</p>
                                    {seg.chords && <div className="mt-1 font-mono text-[10px] text-accent-violet bg-accent-violet/5 px-1.5 py-0.5 rounded inline-block border border-accent-violet/20">{seg.chords}</div>}
                                    {seg.keyChange && <div className="mt-1 ml-2 font-bold text-[10px] text-orange-500 inline-block uppercase">{seg.keyChange}</div>}
                                </div>
                            </div>
                        ))}
                    </div>
                    <Button onClick={onAnalyze} variant="secondary" size="sm" className="mt-4 w-full">
                        <Sparkles className="w-4 h-4" /> Re-analyze
                    </Button>
                </div>
            ) : (
                <div className="text-center p-4">
                    <Layers className="w-12 h-12 text-slate-400 dark:text-slate-500 mx-auto mb-4 opacity-50" />
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                        Automatically detect track sections (Intro, Verse, Chorus) and their timestamps.
                    </p>
                    <Button onClick={onAnalyze} variant="primary" size="sm" className="w-auto mx-auto hover:scale-105 transition-transform">
                        <Sparkles className="w-5 h-5" /> Analyze Structure
                    </Button>
                </div>
            )}
        </Card>
    );
};

export default StructureCard;
