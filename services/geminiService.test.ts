
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateMetadata } from './geminiService';
import { GoogleGenAI } from '@google/genai';

// Mock dependencies
vi.mock('@google/genai', () => {
  return {
    GoogleGenAI: vi.fn().mockImplementation(() => ({
      models: {
        generateContent: vi.fn()
      }
    })),
    Type: {
      OBJECT: 'OBJECT',
      STRING: 'STRING',
      NUMBER: 'NUMBER',
      ARRAY: 'ARRAY'
    }
  };
});

vi.mock('./audioAnalysisService', () => ({
  analyzeAudioFeatures: vi.fn().mockResolvedValue({
    bpm: 120,
    key: 'C',
    mode: 'Major',
    energy: 'High',
    duration: 180
  })
}));

describe('geminiService', () => {
  const mockGenerateContent = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.API_KEY = 'test-key';

    // Setup mock for GoogleGenAI constructor to return our mockGenerateContent
    (GoogleGenAI as unknown as { mockImplementation: (fn: any) => void }).mockImplementation(() => ({
      models: {
        generateContent: mockGenerateContent
      }
    }));
  });

  it('generateMetadata should call Gemini API and return parsed metadata for file input', async () => {
    const mockMetadata = {
      title: 'Test Track',
      artist: 'Test Artist',
      bpm: 120,
      key: 'C',
      mode: 'Major',
      mainGenre: 'Pop',
      energyLevel: 'High'
    };

    mockGenerateContent.mockResolvedValue({
      text: JSON.stringify(mockMetadata)
    });

    const dummyFile = new File(['audio data'], 'test.mp3', { type: 'audio/mpeg' });

    const result = await generateMetadata('file', false, dummyFile, '', '');

    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    // Check if parameters contain parts with text and inlineData (audio)
    const callArgs = mockGenerateContent.mock.calls[0][0];
    expect(callArgs.model).toBe('gemini-2.5-flash');
    expect(callArgs.contents.parts).toHaveLength(2); // Prompt + Audio
    expect(result).toEqual(mockMetadata);
  });

  it('generateMetadata should handle API errors gracefully', async () => {
    mockGenerateContent.mockRejectedValue(new Error('API Error'));

    const dummyFile = new File(['audio data'], 'test.mp3', { type: 'audio/mpeg' });

    await expect(generateMetadata('file', false, dummyFile, '', ''))
      .rejects.toThrow('API communication error occurred');
  });
});
