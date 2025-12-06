
import React, { useState, useEffect } from 'react';
import { Metadata } from '../../types';
import Card from './Card';
import { LayoutGrid, Sparkles, X, Check, User, Music, Calendar } from '../icons';
import Tooltip from '../Tooltip';

interface SummaryCardProps {
    metadata: Metadata;
    isEditing: boolean;
    onFieldUpdate: (field: keyof Metadata, value: any) => void;
    refiningField: keyof Metadata | null;
    onRefine: (field: keyof Metadata) => void;
    refinePopup: { field: keyof Metadata; instruction: string } | null;
    onCloseRefinePopup: () => void;
    onConfirmRefine: (field: keyof Metadata, instruction: string) => void;
}

const EditableField: React.FC<{
    isEditing: boolean;
    value: string;
    onChange: (value: string) => void;
    multiline?: boolean;
    placeholder?: string;
    className?: string;
}> = ({ isEditing, value, onChange, multiline = false, placeholder, className }) => {
    if (isEditing) {
        if (multiline) {
            return <textarea value={value || ''} onChange={(e) => onChange(e.target.value)} rows={3} className={`w-full p-2 bg-slate-100 dark:bg-slate-800 rounded-md text-sm border border-slate-300 dark:border-slate-600 focus:ring-accent-violet focus:border-accent-violet ${className}`} placeholder={placeholder}/>
        }
        return <input type="text" value={value || ''} onChange={(e) => onChange(e.target.value)} className={`w-full p-2 bg-slate-100 dark:bg-slate-800 rounded-md text-sm border border-slate-300 dark:border-slate-600 focus:ring-accent-violet focus:border-accent-violet ${className}`} placeholder={placeholder}/>
    }
    return <p className={`text-slate-600 dark:text-slate-300 ${multiline ? 'whitespace-pre-wrap' : ''} ${className}`}>{value || <span className="italic opacity-50">{placeholder || '-'}</span>}</p>
};

const MetadataField: React.FC<{
    label: string;
    value: string | number;
    field: keyof Metadata;
    isEditing: boolean;
    onFieldUpdate: (field: keyof Metadata, value: any) => void;
    refiningField: keyof Metadata | null;
    onRefine: (field: keyof Metadata) => void;
}> = ({ label, value, field, isEditing, onFieldUpdate, refiningField, onRefine }) => (
    <div className="bg-slate-100 dark:bg-slate-800/50 p-3 rounded-lg flex-1 transition-transform hover:scale-[1.02] duration-200 group">
        <div className="flex justify-between items-center mb-1">
            <h4 className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">{label}</h4>
            <div className="relative opacity-0 group-hover:opacity-100 transition-opacity">
                <Tooltip text="Ulepsz z AI">
                    <button onClick={() => onRefine(field)} className="text-slate-400 hover:text-accent-violet transition-colors disabled:opacity-50" disabled={!!refiningField}>
                        {refiningField === field ? (
                             <div className="w-4 h-4 border-2 border-accent-violet border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <Sparkles className="w-4 h-4" />
                        )}
                    </button>
                </Tooltip>
            </div>
        </div>
        {isEditing ?
            <input type={typeof value === 'number' ? 'number' : 'text'} value={value || ''} onChange={(e) => onFieldUpdate(field, e.target.value)} className="w-full p-1 bg-slate-200 dark:bg-slate-700 rounded-md text-lg font-bold text-light-text dark:text-dark-text focus:ring-accent-violet focus:border-accent-violet" />
            :
            <p className="text-lg font-bold text-light-text dark:text-dark-text truncate" title={String(value)}>{value || '-'}</p>
        }
    </div>
);

const BpmGauge: React.FC<{ bpm: number }> = ({ bpm }) => {
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        const timeout = setTimeout(() => setMounted(true), 300);
        return () => clearTimeout(timeout);
    }, []);

    const percent = mounted ? Math.min((bpm / 200) * 100, 100) : 0;

    return (
        <div className="relative w-24 h-24 flex items-center justify-center group">
            <svg className="w-full h-full transform transition-transform duration-500 group-hover:scale-110" viewBox="0 0 36 36">
                <path
                    className="stroke-slate-200 dark:stroke-slate-700"
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    strokeWidth="3"
                />
                <path
                    className="stroke-accent-blue transition-all duration-[1500ms] cubic-bezier(0.4, 0, 0.2, 1)"
                    strokeDasharray={`${percent}, 100`}
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    strokeWidth="3"
                    strokeLinecap="round"
                />
            </svg>
            <div className="absolute text-center">
                <span className="text-2xl font-bold text-light-text dark:text-dark-text animate-fade-in">{bpm}</span>
                <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400">BPM</span>
            </div>
        </div>
    );
};

const EnergyMeter: React.FC<{ level: string }> = ({ level }) => {
    const energyLevels: { [key: string]: number } = {
        'Niski': 1, 'Low': 1,
        'Średni': 2, 'Medium': 2,
        'Wysoki': 3, 'High': 3,
        'Bardzo Wysoki': 4, 'Very High': 4,
    };
    const currentLevel = energyLevels[level] || 0;
    const colors = ['bg-sky-400', 'bg-yellow-400', 'bg-orange-400', 'bg-red-500'];
    
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setTimeout(() => setMounted(true), 500) }, []);

    return (
        <div className="w-full">
            <h4 className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-2 text-center">Energia</h4>
            <div className="flex h-3 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden gap-0.5">
                {[...Array(4)].map((_, i) => (
                    <div 
                        key={i} 
                        className={`flex-1 h-full transition-all duration-700 ease-out transform ${i < currentLevel && mounted ? `${colors[i]} scale-100` : 'bg-transparent scale-90 opacity-0'}`}
                        style={{ transitionDelay: `${i * 150}ms` }}
                    ></div>
                ))}
            </div>
            <p className="text-lg font-bold text-light-text dark:text-dark-text text-center mt-2 transition-all duration-300 animate-fade-in">{level}</p>
        </div>
    );
};


const SummaryCard: React.FC<SummaryCardProps> = ({ metadata, isEditing, onFieldUpdate, refiningField, onRefine, refinePopup, onCloseRefinePopup, onConfirmRefine }) => {
    const [popupInstruction, setPopupInstruction] = useState('');

    useEffect(() => {
        if (refinePopup) {
            setPopupInstruction(refinePopup.instruction);
        }
    }, [refinePopup]);

    return (
        <Card>
            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4 mb-6">
                <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-gradient-to-br from-accent-violet to-accent-blue text-white shadow-md shadow-accent-blue/20">
                    <LayoutGrid className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-light-text dark:text-dark-text">Dane Utworu</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Identyfikacja i charakterystyka.</p>
                </div>
            </div>

            <div className="space-y-6">
                {/* Identity Section */}
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 space-y-3">
                    
                    {/* Title */}
                    <div className="flex items-start gap-3">
                         <div className="mt-2 p-1.5 bg-slate-200 dark:bg-slate-800 rounded text-slate-400">
                            <Music className="w-4 h-4" />
                        </div>
                        <div className="flex-grow">
                             <div className="flex justify-between items-center mb-1">
                                <h4 className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Tytuł</h4>
                                <Tooltip text="Zasugeruj tytuł">
                                    <button onClick={() => onRefine('title')} disabled={!!refiningField} className="text-slate-400 hover:text-accent-violet transition-colors">
                                        {refiningField === 'title' ? <div className="w-3 h-3 border-2 border-accent-violet border-t-transparent rounded-full animate-spin"></div> : <Sparkles className="w-3 h-3" />}
                                    </button>
                                </Tooltip>
                            </div>
                            <EditableField isEditing={isEditing} value={metadata.title || ''} onChange={(v) => onFieldUpdate('title', v)} className="font-bold text-lg md:text-xl text-light-text dark:text-dark-text" placeholder="Nieznany Tytuł" />
                        </div>
                    </div>

                     {/* Artist */}
                    <div className="flex items-start gap-3">
                        <div className="mt-2 p-1.5 bg-slate-200 dark:bg-slate-800 rounded text-slate-400">
                            <User className="w-4 h-4" />
                        </div>
                        <div className="flex-grow">
                            <div className="flex justify-between items-center mb-1">
                                <h4 className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Artysta</h4>
                                <Tooltip text="Zasugeruj artystę">
                                    <button onClick={() => onRefine('artist')} disabled={!!refiningField} className="text-slate-400 hover:text-accent-violet transition-colors">
                                        {refiningField === 'artist' ? <div className="w-3 h-3 border-2 border-accent-violet border-t-transparent rounded-full animate-spin"></div> : <Sparkles className="w-3 h-3" />}
                                    </button>
                                </Tooltip>
                            </div>
                            <EditableField isEditing={isEditing} value={metadata.artist || ''} onChange={(v) => onFieldUpdate('artist', v)} className="font-semibold text-base" placeholder="Nieznany Artysta" />
                        </div>
                    </div>

                     {/* Album & Year */}
                    <div className="flex gap-4">
                        <div className="flex-1">
                             <div className="flex justify-between items-center mb-1">
                                <h4 className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Album</h4>
                                <button onClick={() => onRefine('album')} disabled={!!refiningField} className="text-slate-400 hover:text-accent-violet">
                                     {refiningField === 'album' ? <div className="w-3 h-3 border-2 border-accent-violet border-t-transparent rounded-full animate-spin"></div> : <Sparkles className="w-3 h-3" />}
                                </button>
                            </div>
                            <EditableField isEditing={isEditing} value={metadata.album || ''} onChange={(v) => onFieldUpdate('album', v)} placeholder="Singiel / Album" className="text-sm" />
                        </div>
                         <div className="w-24 flex-shrink-0">
                             <div className="flex justify-between items-center mb-1">
                                <h4 className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Rok</h4>
                                <button onClick={() => onRefine('year')} disabled={!!refiningField} className="text-slate-400 hover:text-accent-violet">
                                     {refiningField === 'year' ? <div className="w-3 h-3 border-2 border-accent-violet border-t-transparent rounded-full animate-spin"></div> : <Sparkles className="w-3 h-3" />}
                                </button>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-slate-400" />
                                <EditableField isEditing={isEditing} value={metadata.year || ''} onChange={(v) => onFieldUpdate('year', v)} placeholder="YYYY" className="text-sm" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sonic Data */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center pt-2">
                    <div className="md:col-span-1 flex justify-center">
                        <BpmGauge bpm={metadata.bpm} />
                    </div>
                    <div className="md:col-span-2 space-y-4">
                        <EnergyMeter level={metadata.energyLevel} />
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                             <MetadataField label="Tonacja" value={`${metadata.key} ${metadata.mode}`} field="key" {...{isEditing, onFieldUpdate, refiningField, onRefine}} />
                             <MetadataField label="Instrument" value={metadata.mainInstrument} field="mainInstrument" {...{isEditing, onFieldUpdate, refiningField, onRefine}} />
                             <MetadataField label="Charakter" value={metadata.tempoCharacter} field="tempoCharacter" {...{isEditing, onFieldUpdate, refiningField, onRefine}} />
                        </div>
                    </div>
                </div>

                {/* Description (Comment) */}
                <div>
                    <div className="flex justify-between items-center mb-1">
                         <h4 className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Opis / Komentarz</h4>
                        <Tooltip text="Ulepsz z AI">
                            <button onClick={() => onRefine('trackDescription')} className="text-slate-400 hover:text-accent-violet transition-colors disabled:opacity-50" disabled={!!refiningField}>
                                {refiningField === 'trackDescription' ? (
                                    <div className="w-4 h-4 border-2 border-accent-violet border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <Sparkles className="w-4 h-4" />
                                )}
                            </button>
                        </Tooltip>
                    </div>
                    <EditableField isEditing={isEditing} value={metadata.trackDescription} onChange={(v) => onFieldUpdate('trackDescription', v)} multiline placeholder="Opis utworu..."/>
                </div>
            </div>

            {refinePopup && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-light-card dark:bg-dark-card p-6 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-700 relative animate-slide-up">
                        <div className="flex justify-between items-center mb-4">
                            <h5 className="text-lg font-bold text-light-text dark:text-dark-text">Ulepsz "{refinePopup.field}"</h5>
                            <button onClick={onCloseRefinePopup} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"><X className="w-5 h-5 text-slate-500" /></button>
                        </div>
                        
                        <div className="mb-4">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Obecna wartość:</span>
                            <div className="text-sm text-slate-600 dark:text-slate-300 italic mt-1 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-200 dark:border-slate-800 max-h-24 overflow-y-auto">
                                {Array.isArray(metadata[refinePopup.field]) 
                                    ? (metadata[refinePopup.field] as any[]).join(', ') 
                                    : String(metadata[refinePopup.field] || 'Brak')}
                            </div>
                        </div>

                        <div className="mb-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Instrukcja dla AI:</label>
                        </div>
                        <textarea
                            value={popupInstruction}
                            onChange={(e) => setPopupInstruction(e.target.value)}
                            rows={4}
                            className="w-full text-sm p-3 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-accent-violet focus:outline-none transition-shadow"
                        />
                        <button
                            onClick={() => onConfirmRefine(refinePopup.field, popupInstruction)}
                            className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-white bg-gradient-to-r from-accent-violet to-accent-blue rounded-lg hover:opacity-90 transition-all hover:shadow-lg hover:scale-[1.02]"
                        >
                           <Check className="w-5 h-5" /> Zatwierdź i Generuj
                        </button>
                    </div>
                </div>
            )}
        </Card>
    );
};

export default SummaryCard;
