
import React from 'react';
import { Metadata } from '../../types';
import Card from './Card';
import { Tags as TagsIcon, Sparkles, Mic, AlertCircle, Clock, Users } from '../icons';
import Tooltip from '../Tooltip';

interface TagsCardProps {
    metadata: Metadata;
    isEditing: boolean;
    onFieldUpdate: (field: keyof Metadata, value: any) => void;
    refiningField: keyof Metadata | null;
    onRefine: (field: keyof Metadata) => void;
}

const EditableTagList: React.FC<{
    isEditing: boolean;
    tags: string[];
    onChange: (tags: string[]) => void;
}> = ({ isEditing, tags, onChange }) => {
    if (isEditing) {
        return (
            <textarea
                value={tags.join(', ')}
                onChange={(e) => onChange(e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag))}
                rows={2}
                className="w-full p-2 bg-slate-100 dark:bg-slate-800 rounded-md text-sm border border-slate-300 dark:border-slate-600 focus:ring-accent-violet focus:border-accent-violet"
                placeholder="Wprowadź tagi oddzielone przecinkami"
            />
        );
    }
    return (
        <div className="flex flex-wrap gap-2">
            {tags.length > 0 ? tags.map((tag, i) => (
                <span key={i} className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-full text-xs border border-slate-200 dark:border-slate-700">
                    {tag}
                </span>
            )) : <span className="text-slate-400 text-xs italic">Brak tagów</span>}
        </div>
    );
};

const TagSection: React.FC<{
    title: string;
    field: keyof Metadata;
    tags: string[];
    isEditing: boolean;
    onFieldUpdate: (field: keyof Metadata, value: string[]) => void;
    refiningField: keyof Metadata | null;
    onRefine: (field: keyof Metadata) => void;
}> = ({ title, field, tags, isEditing, onFieldUpdate, refiningField, onRefine }) => (
    <div>
        <div className="flex justify-between items-center mb-2">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</h4>
             <Tooltip text="Ulepsz z AI">
                <button onClick={() => onRefine(field)} className="text-slate-400 hover:text-accent-violet transition-colors disabled:opacity-50" disabled={!!refiningField}>
                    {refiningField === field ? (
                            <div className="w-3 h-3 border-2 border-accent-violet border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <Sparkles className="w-3 h-3" />
                    )}
                </button>
            </Tooltip>
        </div>
        <EditableTagList isEditing={isEditing} tags={tags} onChange={(v) => onFieldUpdate(field, v)} />
    </div>
);

const DetailField: React.FC<{
    label: string;
    value: string | undefined;
    icon: React.ReactNode;
    isEditing: boolean;
    onChange: (val: string) => void;
}> = ({ label, value, icon, isEditing, onChange }) => (
    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            {icon}
            <span>{label}</span>
        </div>
        {isEditing ? (
             <input 
                type="text" 
                value={value || ''} 
                onChange={(e) => onChange(e.target.value)} 
                className="text-sm p-1 w-32 text-right bg-slate-200 dark:bg-slate-800 rounded focus:ring-accent-violet focus:outline-none"
             />
        ) : (
            <span className="text-sm font-semibold text-light-text dark:text-dark-text">{value || '-'}</span>
        )}
    </div>
);


const TagsCard: React.FC<TagsCardProps> = ({ metadata, isEditing, onFieldUpdate, refiningField, onRefine }) => {
    return (
        <Card>
            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4 mb-4">
                <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 text-white">
                    <TagsIcon className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-light-text dark:text-dark-text">Tagi i Klasyfikacja</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Gatunki, słowa kluczowe i kontekst.</p>
                </div>
            </div>
            
            <div className="space-y-6">
                 {/* Main Genre */}
                 <div className="bg-pink-50 dark:bg-pink-900/10 p-3 rounded-lg border border-pink-100 dark:border-pink-900/30">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="text-xs font-bold text-pink-600 dark:text-pink-400 uppercase tracking-wider">Główny Gatunek</h4>
                        <Tooltip text="Sugeruj precyzyjny gatunek główny (AI)">
                            <button onClick={() => onRefine('mainGenre')} className="text-pink-400 hover:text-pink-600 transition-colors disabled:opacity-50" disabled={!!refiningField}>
                                {refiningField === 'mainGenre' ? (
                                        <div className="w-3 h-3 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <Sparkles className="w-3 h-3" />
                                )}
                            </button>
                        </Tooltip>
                    </div>
                    {isEditing ? (
                        <input 
                            type="text" 
                            value={metadata.mainGenre || ''} 
                            onChange={(e) => onFieldUpdate('mainGenre', e.target.value)}
                            className="w-full p-2 bg-white dark:bg-slate-900 rounded-md text-lg font-bold text-slate-800 dark:text-slate-100 border border-pink-200 dark:border-pink-800/50 focus:ring-pink-500 focus:border-pink-500"
                            placeholder="np. Deep House"
                        />
                    ) : (
                        <div className="text-xl font-bold text-slate-800 dark:text-slate-100">{metadata.mainGenre || '-'}</div>
                    )}
                </div>

                 {/* Additional Genres */}
                 <div>
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Dodatkowe Gatunki</h4>
                        <Tooltip text="Sugeruj podgatunki (AI)">
                            <button onClick={() => onRefine('additionalGenres')} className="text-slate-400 hover:text-accent-violet transition-colors disabled:opacity-50" disabled={!!refiningField}>
                                {refiningField === 'additionalGenres' ? (
                                        <div className="w-3 h-3 border-2 border-accent-violet border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <Sparkles className="w-3 h-3" />
                                )}
                            </button>
                        </Tooltip>
                    </div>
                    <EditableTagList 
                        isEditing={isEditing} 
                        tags={metadata.additionalGenres} 
                        onChange={(tags) => onFieldUpdate('additionalGenres', tags)} 
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <DetailField 
                        label="Język" 
                        value={metadata.language} 
                        icon={<Mic className="w-4 h-4" />} 
                        isEditing={isEditing}
                        onChange={(v) => onFieldUpdate('language', v)}
                    />
                    <DetailField 
                        label="Treść (Explicit)" 
                        value={metadata.explicitContent} 
                        icon={<AlertCircle className="w-4 h-4" />} 
                        isEditing={isEditing}
                        onChange={(v) => onFieldUpdate('explicitContent', v)}
                    />
                    <DetailField 
                        label="Era Muzyczna" 
                        value={metadata.musicalEra} 
                        icon={<Clock className="w-4 h-4" />} 
                        isEditing={isEditing}
                        onChange={(v) => onFieldUpdate('musicalEra', v)}
                    />
                     <DetailField 
                        label="Grupa Docelowa" 
                        value={metadata.targetAudience} 
                        icon={<Users className="w-4 h-4" />} 
                        isEditing={isEditing}
                        onChange={(v) => onFieldUpdate('targetAudience', v)}
                    />
                </div>

                <div className="border-t border-slate-200 dark:border-slate-800 pt-4 space-y-4">
                    <TagSection title="Słowa kluczowe" field="keywords" tags={metadata.keywords} {...{isEditing, onFieldUpdate, refiningField, onRefine}}/>
                    {metadata.moods && <TagSection title="Nastroje" field="moods" tags={metadata.moods} {...{isEditing, onFieldUpdate, refiningField, onRefine}}/>}
                </div>
            </div>
        </Card>
    );
};

export default TagsCard;
