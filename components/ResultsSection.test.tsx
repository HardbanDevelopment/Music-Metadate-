
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import ResultsSection from './ResultsSection';
import { Metadata } from '../types';

// Mock heavy sub-components to focus test on ResultsSection logic
vi.mock('./results/WaveformDisplay', () => ({ default: () => <div>WaveformDisplay Mock</div> }));
vi.mock('./results/IdentificationCard', () => ({ default: () => <div>IdentificationCard Mock</div> }));
vi.mock('./results/CreativeSuiteSidebar', () => ({ default: () => <div>CreativeSuiteSidebar Mock</div> }));

const mockMetadata: Metadata = {
    title: 'Test Song',
    artist: 'Test Artist',
    album: 'Test Album',
    year: '2024',
    mainInstrument: 'Guitar',
    key: 'Am',
    mode: 'Minor',
    bpm: 120,
    duration: 200,
    tempoCharacter: 'Upbeat',
    mainGenre: 'Rock',
    additionalGenres: ['Indie'],
    trackDescription: 'A cool rock song',
    keywords: ['rock', 'guitar'],
    energyLevel: 'High',
    moods: ['Energetic'],
    instrumentation: ['Electric Guitar', 'Drums'],
    copyright: '© 2024',
    publisher: 'Test Pub',
    isrc: 'US12345',
};

describe('ResultsSection Component', () => {
    const defaultProps = {
        isLoading: false,
        error: null,
        results: mockMetadata,
        onNewAnalysis: vi.fn(),
        showToast: vi.fn(),
        onUpdateResults: vi.fn(),
        currentAnalysis: { id: 'test-id', metadata: mockMetadata, inputType: 'file' as const, input: { fileName: 'test.mp3' } },
        uploadedFile: new File([], 'test.mp3'),
        theme: 'dark' as const,
        onBackToBatch: vi.fn(),
    };

    beforeAll(() => {
        // Mock window.aistudio property
        Object.defineProperty(window, 'aistudio', {
            value: { hasSelectedApiKey: vi.fn().mockResolvedValue(true) },
            writable: true
        });
    });

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders metadata correctly in view mode', () => {
        render(<ResultsSection {...defaultProps} />);
        
        expect(screen.getByText('Test Song')).toBeDefined();
        expect(screen.getByText('Test Artist')).toBeDefined();
        expect(screen.getByText('Rock')).toBeDefined();
        expect(screen.getByText('120')).toBeDefined();
    });

    it('toggles edit mode and allows field updates', async () => {
        render(<ResultsSection {...defaultProps} />);
        
        const editButton = screen.getByText('Edytuj');
        fireEvent.click(editButton);
        
        // In edit mode, text fields become inputs. We find by display value.
        const titleInput = screen.getByDisplayValue('Test Song');
        fireEvent.change(titleInput, { target: { value: 'Updated Song' } });
        
        const saveButton = screen.getByText('Zapisz Zmiany');
        fireEvent.click(saveButton);
        
        expect(defaultProps.onUpdateResults).toHaveBeenCalled();
        const updatedMetadata = (defaultProps.onUpdateResults.mock.calls[0][0] as Metadata);
        expect(updatedMetadata.title).toBe('Updated Song');
    });

    it('handles new analysis button click', () => {
        render(<ResultsSection {...defaultProps} />);
        const newAnalysisBtn = screen.getByText('Nowa Analiza');
        fireEvent.click(newAnalysisBtn);
        expect(defaultProps.onNewAnalysis).toHaveBeenCalled();
    });

    it('displays error message when error prop is present', () => {
        render(<ResultsSection {...defaultProps} error="Test Error" results={null as any} />);
        expect(screen.getByText('Test Error')).toBeDefined();
    });
});
