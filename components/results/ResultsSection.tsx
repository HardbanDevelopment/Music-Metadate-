
import React, { useState, useEffect } from 'react';
import { Metadata, AnalysisRecord } from '../../types';
import { exportToCsv, exportToJson } from '../../utils/export';
import { refineMetadataField, generateCoverArtIdea, generateMarketingContent } from '../../services/geminiService';
import { embedMetadata } from '../../services/taggingService';
import MarketingModal from '../MarketingModal';
import { Copy, Download, RefreshCw, Pencil, ArrowLeft, FileSignature, AlertCircle, CheckCircle2 } from '../icons';
import ResultsSkeleton from './ResultsSkeleton';
import UnifiedMetadataCard from './UnifiedMetadataCard';
// import CreativeSuiteSidebar from './CreativeSuiteSidebar'; // MVP HIDE
import Button from '../Button';
import AnalysisSourceCard from './AnalysisSourceCard';
import WaveformDisplay from './WaveformDisplay';
import IdentificationCard from './IdentificationCard';
// import CopyrightCard from './CopyrightCard'; // MVP HIDE

interface ResultsSectionProps {
  isLoading: boolean;
  error: string | null;
  results: Metadata;
  onNewAnalysis: () => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  onUpdateResults: (results: Metadata) => void;
  currentAnalysis: AnalysisRecord | null;
  uploadedFile: File | null;
  theme: 'light' | 'dark';
  onBackToBatch: () => void;
}

const AUTOSAVE_KEY = 'music-metadata-autosave';

const ErrorDisplay: React.FC<{ message: string }> = ({ message }) => (
  <div className="text-center py-16 animate-fade-in">
    <p className="text-red-500 text-lg font-bold">An error occurred</p>
    <p className="text-slate-600 dark:text-slate-400 mt-2">{message}</p>
  </div>
);


const ResultsSection: React.FC<ResultsSectionProps> = ({ isLoading, error, results, onNewAnalysis, showToast, onUpdateResults, currentAnalysis, uploadedFile, theme, onBackToBatch }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedResults, setEditedResults] = useState<Metadata | null>(results);
  const [refiningField, setRefiningField] = useState<keyof Metadata | null>(null);
  const [coverArtUrl, setCoverArtUrl] = useState<string | null>(null);
  const [isGeneratingArt, setIsGeneratingArt] = useState(false);

  const [isMarketingModalOpen, setIsMarketingModalOpen] = useState(false);
  const [marketingContent, setMarketingContent] = useState({ title: '', content: '' });
  const [generatingMarketingType, setGeneratingMarketingType] = useState<string | null>(null);
  const [isTaggingFile, setIsTaggingFile] = useState(false);

  // Effect to reset creative assets ONLY when the analysis subject changes.
  useEffect(() => {
    setCoverArtUrl(null);
    setEditedResults(results);
  }, [currentAnalysis?.id, results]);

  // Effect for handling results prop changes and loading autosaved data.
  useEffect(() => {
    if (!results || !currentAnalysis) return;

    setIsEditing(false);

    const savedData = localStorage.getItem(AUTOSAVE_KEY);
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        if (parsedData.id === currentAnalysis.id) {
          setEditedResults(parsedData.metadata);
          setIsEditing(true);
          showToast("Restored unsaved changes.", 'info');
        } else {
          setEditedResults(results);
          localStorage.removeItem(AUTOSAVE_KEY);
        }
      } catch (e) {
        console.error("Failed to parse autosaved data", e);
        setEditedResults(results);
        localStorage.removeItem(AUTOSAVE_KEY);
      }
    } else {
      setEditedResults(results);
    }
  }, [results, currentAnalysis, showToast]);

  // Effect for autosaving changes while editing.
  useEffect(() => {
    if (isEditing && editedResults && currentAnalysis) {
      const dataToSave = {
        id: currentAnalysis.id,
        metadata: editedResults,
      };
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(dataToSave));
    }
  }, [isEditing, editedResults, currentAnalysis]);

  if (isLoading) return <ResultsSkeleton />;
  if (error && !results) return <ErrorDisplay message={error} />;
  if (!results || !editedResults) return null;

  const handleSave = () => {
    if (editedResults) {
      onUpdateResults(editedResults);
    }
    setIsEditing(false);
    localStorage.removeItem(AUTOSAVE_KEY);
  };

  const handleCancel = () => {
    setEditedResults(results);
    setIsEditing(false);
    localStorage.removeItem(AUTOSAVE_KEY);
  };

  const handleFieldUpdate = (field: keyof Metadata, value: any) => {
    setEditedResults(prev => prev ? { ...prev, [field]: value } : null);
  };

  const getRefinementInstruction = (field: keyof Metadata): string => {
    switch (field) {
      case 'title': return "Suggest a catchy and fitting track title.";
      case 'artist': return "Suggest an artist name or performance style.";
      case 'mainGenre': return "CRITICAL: Analyze the sonic characteristics. Provide ONE precise Main Genre.";
      case 'trackDescription': return "Create a rich, evocative description, emphasizing emotions and atmosphere.";
      case 'moods': return `Analyze tempo and key to infer emotional mood. Provide 5-7 precise adjectives.`;
      default: return `Suggest a better value for the ${String(field)} field.`;
    }
  };

  const handleRefine = async (field: keyof Metadata) => {
    if (!editedResults) return;
    const instruction = getRefinementInstruction(field);
    setRefiningField(field);
    try {
      const refinedPart = await refineMetadataField(editedResults, field, instruction);
      const newResults = { ...editedResults, ...refinedPart };
      onUpdateResults(newResults);
      setEditedResults(newResults);
      showToast(`Field has been refined!`, 'success');
    } catch (err) {
      showToast("An error occurred during refinement.", 'error');
    } finally {
      setRefiningField(null);
    }
  };

  const handleExternalMetadataUpdate = (newMetadata: Partial<Metadata>, coverUrl?: string | null) => {
    if (!editedResults) return;
    const merged = { ...editedResults, ...newMetadata };
    setEditedResults(merged);
    onUpdateResults(merged);
    if (coverUrl) {
      setCoverArtUrl(coverUrl);
    }
  };

  const handleGenerateArt = async () => {
    if (!results) return;
    setIsGeneratingArt(true);
    setCoverArtUrl(null);
    try {
      const artIdea = await generateCoverArtIdea(results);
      // setCoverArtUrl(imageUrl); // Cover art generation is currently text-only (prompt)
      showToast("Generated cover art prompt (see console)", 'success');
      console.log("Generated Cover Art Prompt:", artIdea.visual_prompt);
    } catch (err) {
      showToast("Failed to generate cover art.", 'error');
    } finally {
      setIsGeneratingArt(false);
    }
  };

  const handleGenerateMarketing = async (type: 'social' | 'press' | 'bio', tone: string) => {
    if (!results) return;
    setGeneratingMarketingType(type);
    try {
      const content = await generateMarketingContent(results, type, tone);
      const titles = {
        social: 'Social Media Post',
        press: 'Press Release',
        bio: 'Streaming Platform Bio'
      };
      setMarketingContent({ title: titles[type], content });
      setIsMarketingModalOpen(true);
    } catch (err) {
      showToast("Failed to generate content.", 'error');
    } finally {
      setGeneratingMarketingType(null);
    }
  };

  const handleEmbedMetadata = async () => {
    if (!uploadedFile) {
      showToast("No source file to tag.", 'error');
      return;
    }
    if (!editedResults) return;

    setIsTaggingFile(true);
    try {
      await embedMetadata(uploadedFile, editedResults, coverArtUrl);
      showToast("Tagged file download started!", 'success');
    } catch (err) {
      showToast("An error occurred while saving tags.", 'error');
    } finally {
      setIsTaggingFile(false);
    }
  };

  const handleCopyToClipboard = () => {
    const data = isEditing ? editedResults : results;
    let textToCopy = `Title: ${data.title}\nArtist: ${data.artist}\nBPM: ${data.bpm}\nKey: ${data.key} ${data.mode}\nGenre: ${data.mainGenre}`;
    navigator.clipboard.writeText(textToCopy);
    showToast("Copied to clipboard!", 'success');
  };

  const isOriginalFileAvailable = uploadedFile && uploadedFile.size > 0 && currentAnalysis?.inputType === 'file';
  const isMp3 = uploadedFile?.type === 'audio/mpeg' || uploadedFile?.name.toLowerCase().endsWith('.mp3');
  const isWav = uploadedFile?.type === 'audio/wav' || uploadedFile?.name.toLowerCase().endsWith('.wav');
  const isTaggingSupported = isMp3 || isWav;

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 animate-slide-up">
        <div className="flex items-center gap-3">
          <Button onClick={onBackToBatch} variant="secondary" size="sm" className="px-2.5">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent-violet to-accent-blue">Analysis Dashboard</h2>
        </div>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)} variant="secondary" size="sm" className="self-start sm:self-center">
            <Pencil className="w-4 h-4" /> Edit
          </Button>
        )}
      </div>

      <div className="animate-slide-up" style={{ animationDelay: '50ms' }}>
        <AnalysisSourceCard analysis={currentAnalysis} />
      </div>

      {isOriginalFileAvailable ? (
        <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
          <WaveformDisplay file={uploadedFile} theme={theme} />
        </div>
      ) : (
        <div className="p-4 bg-slate-100 dark:bg-slate-800/50 rounded-lg text-center text-sm text-slate-500 dark:text-slate-400 animate-slide-up">
          Player unavailable.
        </div>
      )}

      <div className="animate-slide-up" style={{ animationDelay: '125ms' }}>
        <IdentificationCard
          metadata={editedResults}
          fileName={uploadedFile?.name}
          onUpdateMetadata={handleExternalMetadataUpdate}
          showToast={showToast}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-3 space-y-6">
          {/* THE UNIFIED CARD */}
          <div className="animate-slide-up" style={{ animationDelay: '150ms' }}>
            <UnifiedMetadataCard
              metadata={editedResults}
              isEditing={isEditing}
              onFieldUpdate={handleFieldUpdate}
              refiningField={refiningField}
              onRefine={handleRefine}
              uploadedFile={uploadedFile}
              showToast={showToast}
            />
          </div>

          {/* Copyright - MVP HIDE
          <div className="animate-slide-up" style={{ animationDelay: '190ms' }}>
            <CopyrightCard 
                metadata={editedResults}
                file={uploadedFile}
                showToast={showToast}
            />
          </div>
          */}
        </div>

        {/* Creative Suite Sidebar - MVP HIDE
        <div className="lg:col-span-1 space-y-6">
            <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
                <CreativeSuiteSidebar
                    coverArtUrl={coverArtUrl}
                    isGeneratingArt={isGeneratingArt}
                    onGenerateArt={handleGenerateArt}
                    generatingMarketingType={generatingMarketingType}
                    onGenerateMarketing={handleGenerateMarketing}
                />
            </div>
        </div>
        */}
      </div>

      {isEditing ? (
        <div className="flex justify-end gap-4 mt-8 animate-fade-in">
          <Button onClick={handleCancel} variant="secondary">Cancel</Button>
          <Button onClick={handleSave} variant="primary">Save Changes</Button>
        </div>
      ) : (
        <div className="mt-8 space-y-4 animate-slide-up" style={{ animationDelay: '450ms' }}>
          {isOriginalFileAvailable && (
            <div className={`p-5 rounded-xl border shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors ${isTaggingSupported ? 'bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-emerald-200 dark:border-emerald-800' : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'}`}>
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg shrink-0 ${isTaggingSupported ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>
                  <FileSignature className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-lg text-light-text dark:text-dark-text">Ready Product?</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                    {isTaggingSupported ? `Save metadata to ${isWav ? 'WAV' : 'MP3'} file.` : "Format not supported."}
                  </p>
                </div>
              </div>
              <Button onClick={handleEmbedMetadata} disabled={isTaggingFile || !isTaggingSupported} variant="primary" className={`w-full sm:w-auto shadow-xl border-none px-6 py-3 ${isTaggingSupported ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-400'}`}>
                {isTaggingFile ? 'Saving...' : <><Download className="w-5 h-5" /> Download File</>}
              </Button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Button onClick={handleCopyToClipboard} variant="secondary" className="w-full"><Copy className="w-4 h-4" /> Copy</Button>
            <Button onClick={() => exportToJson(editedResults, 'metadata.json')} variant="secondary" className="w-full"><Download className="w-4 h-4" /> JSON</Button>
            <Button onClick={() => exportToCsv(editedResults, 'metadata.csv')} variant="secondary" className="w-full"><Download className="w-4 h-4" /> CSV</Button>
            <Button onClick={onNewAnalysis} variant="primary" className="w-full"><RefreshCw className="w-4 h-4" /> New Analysis</Button>
          </div>
        </div>
      )}

      {isMarketingModalOpen && (
        <MarketingModal
          title={marketingContent.title}
          content={marketingContent.content}
          onClose={() => setIsMarketingModalOpen(false)}
          onCopy={() => { navigator.clipboard.writeText(marketingContent.content); showToast("Copied!", 'success'); }}
        />
      )}
    </div>
  );
};

export default ResultsSection;
