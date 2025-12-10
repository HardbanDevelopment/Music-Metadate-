import React from 'react';
import Card from './Card';
import { Mic, Sparkles } from '../icons';
import { Metadata, VocalStyle, LyricsAnalysis, LyricalIdeas } from '../../types';
import Button from '../Button';

interface LyricsCardProps {
    metadata: Metadata;
    onAnalyze: () => void;
    onGenerate: () => void;
    isProcessing: boolean;
    analysisResult: LyricsAnalysis | LyricalIdeas | null;
}

const LyricsCard: React.FC<LyricsCardProps> = ({ metadata, onAnalyze, onGenerate, isProcessing, analysisResult }) => {
    const vocalPresenceKnown = metadata.vocalStyle !== undefined;
    const hasVocals = vocalPresenceKnown && metadata.vocalStyle.gender !== 'None';

    const renderInitialState = () => {
        if (!vocalPresenceKnown) {
            return (
                <div className="text-center p-4">
                    <Mic className="w-12 h-12 text-slate-400 dark:text-slate-500 mx-auto" />
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 mb-4">
                        Does this track contain vocals? Select an action to continue.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-3">
                        <Button onClick={onAnalyze} variant="primary" size="sm" className="w-full sm:w-auto" disabled={isProcessing}>
                            <Sparkles className="w-5 h-5" /> Analyze Lyrics
                        </Button>
                        <Button onClick={onGenerate} variant="secondary" size="sm" className="w-full sm:w-auto" disabled={isProcessing}>
                            <Sparkles className="w-5 h-5" /> Generate Ideas
                        </Button>
                    </div>
                </div>
            );
        }

        return (
            <div className="text-center p-4">
                <Mic className="w-12 h-12 text-slate-400 dark:text-slate-500 mx-auto" />
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 mb-4">
                    {hasVocals ? "Analyze vocals to get transcription and thematic analysis." : "Track is instrumental. Generate creative lyric ideas."}
                </p>
                <Button onClick={hasVocals ? onAnalyze : onGenerate} variant="primary" size="sm" className="w-auto mx-auto" disabled={isProcessing}>
                    <Sparkles className="w-5 h-5" /> {hasVocals ? 'Analyze Lyrics' : 'Generate Ideas'}
                </Button>
            </div>
        );
    }

    const renderProcessingState = () => (
        <div className="flex flex-col items-center justify-center text-center space-y-4 py-10">
            <div className="w-12 h-12 border-4 border-accent-blue border-t-transparent rounded-full animate-spin"></div>
            <p className="font-semibold text-light-text dark:text-dark-text">Processing in Lyrics Corner...</p>
        </div>
    );

    const renderResultState = () => {
        if (!analysisResult) return null;
        if ('lyrics' in analysisResult) { // LyricsAnalysis
            return (
                <div className="space-y-4 text-sm animate-fade-in">
                    <div>
                        <h4 className="font-bold mb-2">Lyrics Transcription</h4>
                        <pre className="whitespace-pre-wrap font-sans p-3 bg-slate-100 dark:bg-slate-800/50 rounded-lg max-h-48 overflow-y-auto">{analysisResult.lyrics || "Failed to transcribe lyrics."}</pre>
                    </div>
                    <div>
                        <h4 className="font-bold mb-2">Analysis</h4>
                        <ul className="list-disc list-inside space-y-1">
                            <li><strong>Theme:</strong> {analysisResult.theme}</li>
                            <li><strong>Mood:</strong> {analysisResult.mood}</li>
                            <li><strong>Summary:</strong> {analysisResult.summary}</li>
                        </ul>
                    </div>
                </div>
            );
        }
        if ('verse' in analysisResult) { // LyricalIdeas
            return (
                <div className="space-y-4 text-sm animate-fade-in">
                    <div>
                        <h4 className="font-bold mb-2">Verse</h4>
                        <pre className="whitespace-pre-wrap font-sans p-3 bg-slate-100 dark:bg-slate-800/50 rounded-lg">{analysisResult.verse}</pre>
                    </div>
                    <div>
                        <h4 className="font-bold mb-2">Chorus</h4>
                        <pre className="whitespace-pre-wrap font-sans p-3 bg-slate-100 dark:bg-slate-800/50 rounded-lg">{analysisResult.chorus}</pre>
                    </div>
                    <div>
                        <h4 className="font-bold mb-2">Explanation</h4>
                        <p className="italic text-xs text-slate-500 dark:text-slate-400">{analysisResult.explanation}</p>
                    </div>
                </div>
            );
        }
        return null;
    };

    const handleRegenerate = () => {
        if (isProcessing || !analysisResult) return;
        if ('lyrics' in analysisResult) {
            onAnalyze();
        } else {
            onGenerate();
        }
    };

    return (
        <Card>
            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4 mb-4">
                <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 text-white">
                    <Mic className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-light-text dark:text-dark-text">Lyrics Corner</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Lyrics analysis and generation.</p>
                </div>
            </div>

            {isProcessing ? renderProcessingState() : analysisResult ? renderResultState() : renderInitialState()}

            {analysisResult && !isProcessing &&
                <Button onClick={handleRegenerate} variant="secondary" size="sm" className="w-auto mt-4" disabled={isProcessing}>
                    <Sparkles className="w-4 h-4" /> Regenerate
                </Button>
            }

        </Card>
    );
};

export default LyricsCard;