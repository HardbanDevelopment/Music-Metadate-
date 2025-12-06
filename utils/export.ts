
import { Metadata, BatchItem } from '../types';

const downloadFile = (blob: Blob, fileName: string) => {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
};

export const exportToJson = (data: Metadata, fileName: string) => {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  downloadFile(blob, fileName);
};

const CSV_HEADERS = [
    'fileName',
    'title',
    'artist',
    'album',
    'year',
    'mainInstrument',
    'key',
    'mode',
    'bpm',
    'duration',
    'tempoCharacter',
    'energyLevel',
    'mainGenre',
    'additionalGenres',
    'trackDescription',
    'keywords',
    'copyright',
    'publisher',
    'composer',
    'lyricist',
    'albumArtist',
    'catalogNumber',
    'isrc',
    'moods',
    'instrumentation',
    'vocalGender',
    'vocalTimbre',
    'vocalDelivery',
    'vocalEmotionalTone',
    'useCases',
    'structure',
];

const formatCsvValue = (value: any) => {
    if (value === undefined || value === null) return '""';
    if (Array.isArray(value)) {
      return `"${value.join(', ')}"`;
    }
    const stringValue = String(value);
    return `"${stringValue.replace(/"/g, '""')}"`;
};
  
const metadataToCsvRow = (fileName: string, data: Metadata) => {
    return [
      formatCsvValue(fileName),
      formatCsvValue(data.title),
      formatCsvValue(data.artist),
      formatCsvValue(data.album),
      formatCsvValue(data.year),
      formatCsvValue(data.mainInstrument),
      formatCsvValue(data.key),
      formatCsvValue(data.mode),
      formatCsvValue(data.bpm),
      formatCsvValue(data.duration),
      formatCsvValue(data.tempoCharacter),
      formatCsvValue(data.energyLevel),
      formatCsvValue(data.mainGenre),
      formatCsvValue(data.additionalGenres),
      formatCsvValue(data.trackDescription),
      formatCsvValue(data.keywords),
      formatCsvValue(data.copyright),
      formatCsvValue(data.publisher),
      formatCsvValue(data.composer),
      formatCsvValue(data.lyricist),
      formatCsvValue(data.albumArtist),
      formatCsvValue(data.catalogNumber),
      formatCsvValue(data.isrc),
      formatCsvValue(data.moods),
      formatCsvValue(data.instrumentation),
      formatCsvValue(data.vocalStyle?.gender),
      formatCsvValue(data.vocalStyle?.timbre),
      formatCsvValue(data.vocalStyle?.delivery),
      formatCsvValue(data.vocalStyle?.emotionalTone),
      formatCsvValue(data.useCases),
      formatCsvValue(data.structure),
    ].join(',');
};


export const exportToCsv = (data: Metadata, fileName: string) => {
  const row = metadataToCsvRow('single_file', data);
  const csvContent = [CSV_HEADERS.join(','), row].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadFile(blob, fileName);
};


export const exportBatchToCsv = (batch: BatchItem[]) => {
    const completedItems = batch.filter(item => item.status === 'completed' && item.metadata);
    if (completedItems.length === 0) return;

    const csvRows = completedItems.map(item => metadataToCsvRow(item.file.name, item.metadata!));
    const csvContent = [CSV_HEADERS.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    downloadFile(blob, `metadata_batch_${timestamp}.csv`);
};
