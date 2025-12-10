import React, { useState } from 'react';
import { Metadata, VocalStyle } from '../../types';
import Card from './Card';
import { BarChart, ChevronDown, ChevronUp, Sparkles } from '../icons';
import Tooltip from '../Tooltip';

interface ProAnalysisCardProps {
    metadata: Metadata;
    isEditing: boolean;
    onFieldUpdate: (field: keyof Metadata, value: any) => void;
    refiningField: keyof Metadata | null;
    onRefine: (field: keyof Metadata) => void;
}

const ProField: React.FC<{
    label: string;
    children: React.ReactNode;
    field: keyof Metadata;
    refiningField: keyof Metadata | null;
    onRefine: (field: keyof Metadata) => void;
}> = ({ label, children, field, refiningField, onRefine }) => (
    <div>
        <div className="flex justify-between items-center mb-1">
            <h4 className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">{label}</h4>
            <Tooltip text="Refine with AI">
                <button onClick={() => onRefine(field)} className="text-slate-400 hover:text-accent-violet transition-colors disabled:opacity-50" disabled={!!refiningField}>
                    {refiningField === field ? (
                        <div className="w-4 h-4 border-2 border-accent-violet border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <Sparkles className="w-4 h-4" />
                    )}
                </button>
            </Tooltip>
        </div>
        <div className="text-sm text-slate-600 dark:text-slate-300">{children}</div>
    </div>
);

const EditableProField: React.FC<{
    isEditing: boolean;
    value: string[] | string | undefined;
    onChange: (value: any) => void;
    field: keyof Metadata;
    type?: 'textarea' | 'text';
}> = ({ isEditing, value, onChange, type = 'textarea' }) => {
    const stringValue = Array.isArray(value) ? value.join(', ') : value || '';
    if (isEditing) {
        const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const newValue = e.target.value;
            onChange(Array.isArray(value) ? newValue.split(',').map(item => item.trim()) : newValue);
        };

        if (type === 'textarea') {
            return <textarea value={stringValue} onChange={handleChange} rows={3} className="w-full p-2 bg-slate-100 dark:bg-slate-800 rounded-md text-sm border border-slate-300 dark:border-slate-600 focus:ring-accent-violet focus:border-accent-violet" />
        }
        return <input type="text" value={stringValue} onChange={handleChange} className="w-full p-2 bg-slate-100 dark:bg-slate-800 rounded-md text-sm border border-slate-300 dark:border-slate-600 focus:ring-accent-violet focus:border-accent-violet" />
    }
    return <p className="text-sm text-slate-600 dark:text-slate-300">{stringValue}</p>;
};

const EditableVocalStyle: React.FC<{
    isEditing: boolean;
    value: VocalStyle | undefined;
    onChange: (field: keyof Metadata, value: any) => void;
}> = ({ isEditing, value, onChange }) => {
    if (!value || value.gender === 'None') {
        return <p className="text-sm text-slate-500 dark:text-slate-400 italic">No vocals</p>;
    }

    const fields: { key: keyof VocalStyle; label: string }[] = [
        { key: 'gender', label: 'Gender' },
        { key: 'timbre', label: 'Timbre' },
        { key: 'delivery', label: 'Delivery' },
        { key: 'emotionalTone', label: 'Emotion' },
    ];

    const handleFieldChange = (fieldKey: keyof VocalStyle, fieldValue: string) => {
        onChange('vocalStyle', { ...value, [fieldKey]: fieldValue });
    };

    if (isEditing) {
        return (
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {fields.map(({ key, label }) => (
                    <div key={key}>
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400">{label}</label>
                        <input
                            type="text"
                            value={value[key]}
                            onChange={(e) => handleFieldChange(key, e.target.value)}
                            className="w-full mt-1 p-2 bg-slate-100 dark:bg-slate-800 rounded-md text-sm border border-slate-300 dark:border-slate-600 focus:ring-accent-violet focus:border-accent-violet"
                        />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center text-xs p-3 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
            {fields.map(({ key, label }) => (
                <div key={key}>
                    <span className="block text-slate-500 dark:text-slate-400">{label}</span>
                    <p className="font-semibold text-sm text-light-text dark:text-dark-text">{value[key]}</p>
                </div>
            ))}
        </div>
    );
};


const ProAnalysisCard: React.FC<ProAnalysisCardProps> = ({ metadata, isEditing, onFieldUpdate, refiningField, onRefine }) => {
    const [isOpen, setIsOpen] = useState(true);

    const { instrumentation, vocalStyle, useCases, structure } = metadata;

    return (
        <Card>
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-gradient-to-br from-teal-400 to-blue-500 text-white">
                        <BarChart className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-light-text dark:text-dark-text text-left">Pro Analysis</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 text-left">Detailed technical and creative data.</p>
                    </div>
                </div>
                {isOpen ? <ChevronUp className="w-6 h-6 text-slate-500" /> : <ChevronDown className="w-6 h-6 text-slate-500" />}
            </button>

            {isOpen && (
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4 animate-fade-in">
                    <ProField label="Vocal Style" field="vocalStyle" {...{ refiningField, onRefine }}>
                        <EditableVocalStyle
                            isEditing={isEditing}
                            value={vocalStyle}
                            onChange={onFieldUpdate}
                        />
                    </ProField>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ProField label="Instrumentation" field="instrumentation" {...{ refiningField, onRefine }}>
                            <EditableProField isEditing={isEditing} value={instrumentation} onChange={(v) => onFieldUpdate('instrumentation', v)} field="instrumentation" />
                        </ProField>
                        <ProField label="Use Cases" field="useCases" {...{ refiningField, onRefine }}>
                            <EditableProField isEditing={isEditing} value={useCases} onChange={(v) => onFieldUpdate('useCases', v)} field="useCases" />
                        </ProField>
                    </div>
                    <ProField label="Structure" field="structure" {...{ refiningField, onRefine }}>
                        <EditableProField isEditing={isEditing} value={structure} onChange={(v) => onFieldUpdate('structure', v)} field="structure" type="text" />
                    </ProField>
                </div>
            )}
        </Card>
    );
};

export default ProAnalysisCard;