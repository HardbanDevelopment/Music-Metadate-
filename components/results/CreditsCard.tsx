
import React, { useState, useEffect } from 'react';
import { Metadata } from '../../types';
import Card from './Card';
import { CopyrightIcon, Sparkles, Settings, RefreshCw, Zap } from '../icons';
import Tooltip from '../Tooltip';
import { generateNextCatalogNumber, generateNextISRC, getCodeConfig, saveCodeConfig, CodeConfig, resetSequences } from '../../services/codeGeneratorService';
import Button from '../Button';

interface CreditsCardProps {
    metadata: Metadata;
    isEditing: boolean;
    onFieldUpdate: (field: keyof Metadata, value: any) => void;
    refiningField: keyof Metadata | null;
    onRefine: (field: keyof Metadata) => void;
}

const CreditField: React.FC<{
    label: string;
    value: string | undefined;
    field: keyof Metadata;
    isEditing: boolean;
    onChange: (value: string) => void;
    onRefine: (field: keyof Metadata) => void;
    refiningField: keyof Metadata | null;
    onGenerate?: () => void; // Optional generator
}> = ({ label, value, field, isEditing, onChange, onRefine, refiningField, onGenerate }) => (
    <div className="bg-slate-50 dark:bg-slate-900/30 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
        <div className="flex justify-between items-center mb-1">
            <h4 className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">{label}</h4>
            <div className="flex items-center gap-1">
                {onGenerate && isEditing && (
                    <Tooltip text="Generate code">
                        <button onClick={onGenerate} className="text-slate-400 hover:text-emerald-500 transition-colors mr-1">
                            <Zap className="w-3 h-3" />
                        </button>
                    </Tooltip>
                )}
                <Tooltip text="Suggest with AI">
                    <button onClick={() => onRefine(field)} disabled={!!refiningField} className="text-slate-400 hover:text-accent-violet transition-colors">
                        {refiningField === field ? <div className="w-3 h-3 border-2 border-accent-violet border-t-transparent rounded-full animate-spin"></div> : <Sparkles className="w-3 h-3" />}
                    </button>
                </Tooltip>
            </div>
        </div>
        {isEditing ? (
            <input
                type="text"
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                className="w-full p-1.5 bg-slate-100 dark:bg-slate-800 rounded-md text-sm border border-slate-300 dark:border-slate-700 focus:ring-accent-violet focus:border-accent-violet"
                placeholder={`Enter ${label.toLowerCase()}`}
            />
        ) : (
            <p className="text-sm text-light-text dark:text-dark-text truncate font-medium">{value || <span className="text-slate-400 italic">-</span>}</p>
        )}
    </div>
);

const GeneratorSettings: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [config, setConfig] = useState<CodeConfig>(getCodeConfig());

    const handleSave = () => {
        saveCodeConfig(config);
        onClose();
    };

    const handleReset = () => {
        if (confirm("Are you sure you want to reset sequence counters to 1?")) {
            resetSequences();
            setConfig(getCodeConfig());
        }
    };

    return (
        <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg mb-4 border border-slate-200 dark:border-slate-700 animate-fade-in">
            <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-bold text-light-text dark:text-dark-text flex items-center gap-2">
                    <Settings className="w-4 h-4" /> Generator Settings
                </h4>
                <button onClick={handleReset} className="text-xs text-red-500 hover:underline flex items-center gap-1">
                    <RefreshCw className="w-3 h-3" /> Reset counters
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">ISRC Prefix (Country-Registrant)</label>
                    <input
                        type="text"
                        value={config.isrcPrefix}
                        onChange={(e) => setConfig({ ...config, isrcPrefix: e.target.value.toUpperCase() })}
                        placeholder="e.g. PL-A12"
                        className="w-full p-2 text-sm rounded border border-slate-300 dark:border-slate-600 dark:bg-slate-900"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Format: CC-XXX (e.g. PL-S1Z)</p>
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Catalog Prefix</label>
                    <input
                        type="text"
                        value={config.catPrefix}
                        onChange={(e) => setConfig({ ...config, catPrefix: e.target.value.toUpperCase() })}
                        className="w-full p-2 text-sm rounded border border-slate-300 dark:border-slate-600 dark:bg-slate-900"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Result: {config.catPrefix}-{new Date().getFullYear()}-001</p>
                </div>
            </div>

            <div className="flex justify-end gap-2">
                <Button onClick={onClose} size="sm" variant="secondary">Cancel</Button>
                <Button onClick={handleSave} size="sm" variant="primary">Save Settings</Button>
            </div>
        </div>
    );
};

const CreditsCard: React.FC<CreditsCardProps> = ({ metadata, isEditing, onFieldUpdate, refiningField, onRefine }) => {
    const [showSettings, setShowSettings] = useState(false);

    const handleGenerateCatNum = () => {
        const code = generateNextCatalogNumber();
        onFieldUpdate('catalogNumber', code);
    };

    const handleGenerateISRC = () => {
        const code = generateNextISRC();
        onFieldUpdate('isrc', code);
    };

    return (
        <Card>
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-gradient-to-br from-slate-500 to-zinc-600 text-white shadow-md shadow-slate-500/20">
                        <CopyrightIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-light-text dark:text-dark-text">Rights & Credits</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Publishing and legal metadata.</p>
                    </div>
                </div>
                {isEditing && (
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className={`p-2 rounded-full transition-colors ${showSettings ? 'bg-accent-violet text-white' : 'text-slate-400 hover:text-accent-violet hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                        title="Generator settings"
                    >
                        <Settings className="w-5 h-5" />
                    </button>
                )}
            </div>

            {showSettings && <GeneratorSettings onClose={() => setShowSettings(false)} />}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CreditField
                    label="Copyright"
                    value={metadata.copyright}
                    field="copyright"
                    isEditing={isEditing}
                    onChange={(v) => onFieldUpdate('copyright', v)}
                    onRefine={onRefine}
                    refiningField={refiningField}
                />
                <CreditField
                    label="Publisher"
                    value={metadata.publisher}
                    field="publisher"
                    isEditing={isEditing}
                    onChange={(v) => onFieldUpdate('publisher', v)}
                    onRefine={onRefine}
                    refiningField={refiningField}
                />
                <CreditField
                    label="Composer"
                    value={metadata.composer}
                    field="composer"
                    isEditing={isEditing}
                    onChange={(v) => onFieldUpdate('composer', v)}
                    onRefine={onRefine}
                    refiningField={refiningField}
                />
                <CreditField
                    label="Lyricist"
                    value={metadata.lyricist}
                    field="lyricist"
                    isEditing={isEditing}
                    onChange={(v) => onFieldUpdate('lyricist', v)}
                    onRefine={onRefine}
                    refiningField={refiningField}
                />
                <CreditField
                    label="Album Artist"
                    value={metadata.albumArtist}
                    field="albumArtist"
                    isEditing={isEditing}
                    onChange={(v) => onFieldUpdate('albumArtist', v)}
                    onRefine={onRefine}
                    refiningField={refiningField}
                />
                <CreditField
                    label="Catalog No."
                    value={metadata.catalogNumber}
                    field="catalogNumber"
                    isEditing={isEditing}
                    onChange={(v) => onFieldUpdate('catalogNumber', v)}
                    onRefine={onRefine}
                    refiningField={refiningField}
                    onGenerate={handleGenerateCatNum}
                />
                <CreditField
                    label="ISRC Code"
                    value={metadata.isrc}
                    field="isrc"
                    isEditing={isEditing}
                    onChange={(v) => onFieldUpdate('isrc', v)}
                    onRefine={onRefine}
                    refiningField={refiningField}
                    onGenerate={handleGenerateISRC}
                />
            </div>
        </Card>
    );
};

export default CreditsCard;
