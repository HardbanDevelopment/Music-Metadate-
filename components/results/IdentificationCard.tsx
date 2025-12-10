import React, { useState } from 'react';
import { Metadata } from '../../types';
import Card from './Card';
import { Shield, CheckCircle2 } from '../icons';
import Button from '../Button';

interface IdentificationCardProps {
    metadata: Metadata;
    fileName?: string;
    uploadedFile?: File | null;
    onUpdateMetadata: (newMetadata: Partial<Metadata>, coverUrl?: string | null) => void;
    showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

const IdentificationCard: React.FC<IdentificationCardProps> = ({ metadata, fileName, uploadedFile, onUpdateMetadata, showToast }) => {
    const [isOpen, setIsOpen] = useState(true);

    // AudD State
    const [isAudDSearching, setIsAudDSearching] = useState(false);
    const [audDResult, setAudDResult] = useState<Partial<Metadata> | null>(null);

    const handleAudDSearch = async () => {
        if (!uploadedFile) {
            showToast("No audio file to verify.", 'error');
            return;
        }
        setIsAudDSearching(true);
        setAudDResult(null);

        const formData = new FormData();
        formData.append('file', uploadedFile);

        try {
            const res = await fetch('/analysis/identify', { method: 'POST', body: formData });

            if (!res.ok) throw new Error("Service unavailable or Backend error.");

            const json = await res.json();
            if (json.status === 'success' && json.result) {
                const r = json.result;
                const match: Partial<Metadata> = {
                    title: r.title,
                    artist: r.artist,
                    album: r.album,
                    year: r.release_date ? r.release_date.substring(0, 4) : undefined,
                    label: r.label,
                    isrc: r.isrc,
                    copyright: r.label ? `(C) ${r.label}` : undefined
                };
                setAudDResult(match);
                showToast("Found entry in copyright database (AudD).", 'success');
            } else {
                showToast("Track not found in AudD database (Clean Copyright).", 'info');
            }
        } catch (e) {
            console.error(e);
            showToast("AudD verification error. Check backend.", 'error');
        } finally {
            setIsAudDSearching(false);
        }
    };

    const handleAudDApply = () => {
        if (audDResult) {
            onUpdateMetadata(audDResult);
            showToast("Imported copyright data.", 'success');
            setAudDResult(null);
        }
    };

    return (
        <Card className="border-l-4 border-l-purple-500">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 transition-colors">
                        <Shield className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-light-text dark:text-dark-text">Rights Verification (AudD)</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Check copyright status and commercial identification.
                        </p>
                    </div>
                </div>
                <button onClick={() => setIsOpen(!isOpen)} className="text-xs font-semibold text-accent-violet hover:underline">
                    {isOpen ? 'Collapse' : 'Expand'}
                </button>
            </div>

            {isOpen && (
                <div className="animate-fade-in">
                    <div className="text-center py-4 bg-purple-50 dark:bg-purple-900/10 rounded-lg border border-purple-100 dark:border-purple-900/30 mb-4">
                        <Shield className="w-10 h-10 text-purple-500 mx-auto mb-2" />
                        <p className="text-xs text-slate-500 mb-3 px-4">
                            Audio sample analysis in AudD Enterprise database.
                        </p>
                        <Button onClick={handleAudDSearch} disabled={isAudDSearching || !uploadedFile} size="sm" variant="primary" className="mx-auto bg-purple-600 hover:bg-purple-700 border-none">
                            {isAudDSearching ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Verifying...
                                </>
                            ) : (
                                <>
                                    <Shield className="w-4 h-4" /> Check Rights
                                </>
                            )}
                        </Button>
                    </div>

                    {audDResult && (
                        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800 animate-toast-in">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-xs font-bold text-green-600 dark:text-green-400 uppercase mb-1">Found in AudD</p>
                                    <p className="font-bold text-light-text dark:text-dark-text">{audDResult.title}</p>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">{audDResult.artist}</p>
                                    <p className="text-xs text-slate-500 mt-1">{audDResult.label}</p>
                                    <p className="text-xs text-slate-500">{audDResult.isrc}</p>
                                </div>
                                <Button onClick={handleAudDApply} size="sm" variant="secondary">
                                    <CheckCircle2 className="w-4 h-4 text-green-500" /> Use
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </Card>
    );
};

export default IdentificationCard;