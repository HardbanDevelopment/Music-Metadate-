
import React, { useState } from 'react';
import { Metadata } from '../../types';
import Card from './Card';
import { Shield, Lock, FileSignature, Stamp, DownloadCloud, Play, Pause, CheckCircle2 } from '../icons';
import Button from '../Button';
import { calculateFileHash, generateWatermarkedAudio, generateCertificate } from '../../services/copyrightService';

interface CopyrightCardProps {
    metadata: Metadata;
    file: File | null;
    showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

const CopyrightCard: React.FC<CopyrightCardProps> = ({ metadata, file, showToast }) => {
    const [hash, setHash] = useState<string | null>(null);
    const [isHashing, setIsHashing] = useState(false);
    const [watermarkUrl, setWatermarkUrl] = useState<string | null>(null);
    const [isWatermarking, setIsWatermarking] = useState(false);
    const [isPlayingWatermark, setIsPlayingWatermark] = useState(false);
    const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

    const handleCalculateHash = async () => {
        if (!file) return;
        setIsHashing(true);
        try {
            const h = await calculateFileHash(file);
            setHash(h);
            showToast("Digital fingerprint calculated!", 'success');
        } catch (e) {
            showToast("Error calculating file hash.", 'error');
        } finally {
            setIsHashing(false);
        }
    };

    const handleDownloadCertificate = () => {
        if (!hash || !file) return;
        generateCertificate(metadata, hash, file.name);
        showToast("Certificate downloaded.", 'success');
    };

    const handleGenerateWatermark = async () => {
        if (!file) return;
        setIsWatermarking(true);
        try {
            const url = await generateWatermarkedAudio(file);
            setWatermarkUrl(url);

            // Create audio element for preview
            const audio = new Audio(url);
            audio.onended = () => setIsPlayingWatermark(false);
            setAudioElement(audio);

            showToast("DEMO version with watermark ready!", 'success');
        } catch (e) {
            showToast("Error generating watermark.", 'error');
            console.error(e);
        } finally {
            setIsWatermarking(false);
        }
    };

    const togglePreview = () => {
        if (!audioElement) return;
        if (isPlayingWatermark) {
            audioElement.pause();
        } else {
            audioElement.play();
        }
        setIsPlayingWatermark(!isPlayingWatermark);
    };

    const handleDownloadWatermark = () => {
        if (!watermarkUrl) return;
        const link = document.createElement('a');
        link.href = watermarkUrl;
        link.download = `DEMO_${file?.name || 'audio'}.wav`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast("DEMO file downloaded.", 'success');
    };

    return (
        <Card className="border-l-4 border-l-emerald-500">
            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4 mb-6">
                <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-md shadow-emerald-500/20">
                    <Shield className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-light-text dark:text-dark-text">Copyright Protection</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Protect your tracks from theft.</p>
                </div>
            </div>

            <div className="space-y-6">
                {/* Hash & Certificate Section */}
                <div className="bg-slate-50 dark:bg-slate-900/30 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2 mb-3 text-emerald-600 dark:text-emerald-400">
                        <FileSignature className="w-5 h-5" />
                        <h4 className="font-bold text-sm uppercase tracking-wide">Digital Fingerprint (Proof of Existence)</h4>
                    </div>

                    {!hash ? (
                        <div className="text-center py-2">
                            <p className="text-xs text-slate-500 mb-3">Calculate unique SHA-256 hash of the file to create cryptographic proof of its existence at a given time.</p>
                            <Button onClick={handleCalculateHash} disabled={isHashing || !file} size="sm" variant="secondary" className="w-full">
                                {isHashing ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" /> Calculating...
                                    </>
                                ) : (
                                    <>
                                        <Lock className="w-4 h-4" /> Calculate Hash
                                    </>
                                )}
                            </Button>
                        </div>
                    ) : (
                        <div className="animate-fade-in">
                            <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded text-xs font-mono break-all text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 mb-3">
                                {hash}
                            </div>
                            <Button onClick={handleDownloadCertificate} size="sm" variant="primary" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white border-none">
                                <Stamp className="w-4 h-4" /> Download Certificate
                            </Button>
                        </div>
                    )}
                </div>

                {/* Watermark Section */}
                <div className="bg-slate-50 dark:bg-slate-900/30 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2 mb-3 text-blue-600 dark:text-blue-400">
                        <Shield className="w-5 h-5" />
                        <h4 className="font-bold text-sm uppercase tracking-wide">Audio Watermark (Demo Maker)</h4>
                    </div>

                    <p className="text-xs text-slate-500 mb-3">
                        Generate a secure DEMO version with warning signal overlay every 30 seconds. Perfect for sending to clients.
                    </p>

                    {!watermarkUrl ? (
                        <Button onClick={handleGenerateWatermark} disabled={isWatermarking || !file} size="sm" variant="secondary" className="w-full">
                            {isWatermarking ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" /> Processing Audio...
                                </>
                            ) : (
                                <>
                                    <Shield className="w-4 h-4" /> Generate Demo Version
                                </>
                            )}
                        </Button>
                    ) : (
                        <div className="flex gap-2 animate-fade-in">
                            <button
                                onClick={togglePreview}
                                className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-slate-200 dark:bg-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                            >
                                {isPlayingWatermark ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                Preview
                            </button>
                            <button
                                onClick={handleDownloadWatermark}
                                className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                            >
                                <DownloadCloud className="w-4 h-4" /> WAV
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
};

export default CopyrightCard;
