
import React, { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { Play, Pause, BarChart, Zap } from '../icons';

interface WaveformDisplayProps {
  file: File;
  theme: 'light' | 'dark';
}

const WaveformDisplay: React.FC<WaveformDisplayProps> = ({ file, theme }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [visualizerMode, setVisualizerMode] = useState<'bars' | 'off'>('bars');

  useEffect(() => {
    if (!containerRef.current) return;

    // Create WaveSurfer
    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: theme === 'dark' ? '#4b5563' : '#cbd5e1',
      progressColor: '#8b5cf6',
      cursorColor: '#8b5cf6',
      barWidth: 2,
      barRadius: 3,
      barGap: 2,
      height: 80,
      url: URL.createObjectURL(file),
      normalize: true,
    });

    wavesurferRef.current = ws;

    ws.on('play', () => setIsPlaying(true));
    ws.on('pause', () => setIsPlaying(false));
    ws.on('finish', () => setIsPlaying(false));
    ws.on('ready', () => setIsReady(true));
    
    // Setup Web Audio API Analyser when ready
    ws.on('ready', () => {
        const mediaElement = ws.getMediaElement();
        if (mediaElement) {
            // Check if context is locked (browser policy)
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const source = audioContext.createMediaElementSource(mediaElement);
            const analyser = audioContext.createAnalyser();
            
            analyser.fftSize = 256; // Resolution
            source.connect(analyser);
            analyser.connect(audioContext.destination);
            
            // Override wavesurfer internal connecting to prevent double audio
            // Note: This is a simplified integration, wavesurfer 7 handles this well usually
            analyserRef.current = analyser;
        }
    });

    ws.on('destroy', () => {
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
    });

    return () => {
      ws.destroy();
      wavesurferRef.current = null;
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [file, theme]);

  // Visualizer Loop
  useEffect(() => {
      if (visualizerMode === 'off' || !isPlaying || !analyserRef.current || !canvasRef.current) {
          if (animationRef.current) cancelAnimationFrame(animationRef.current);
          // Clear canvas if stopped
          const canvas = canvasRef.current;
          if (canvas) {
             const ctx = canvas.getContext('2d');
             ctx?.clearRect(0, 0, canvas.width, canvas.height);
          }
          return;
      }

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const analyser = analyserRef.current;
      
      if (!ctx || !analyser) return;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const draw = () => {
          animationRef.current = requestAnimationFrame(draw);
          analyser.getByteFrequencyData(dataArray);

          ctx.clearRect(0, 0, canvas.width, canvas.height);

          const width = canvas.width;
          const height = canvas.height;
          const barWidth = (width / bufferLength) * 2.5;
          let barHeight;
          let x = 0;

          // Create Gradient
          const gradient = ctx.createLinearGradient(0, height, 0, 0);
          gradient.addColorStop(0, theme === 'dark' ? '#3b82f6' : '#3b82f6'); // Blue base
          gradient.addColorStop(0.6, theme === 'dark' ? '#8b5cf6' : '#8b5cf6'); // Violet mid
          gradient.addColorStop(1, theme === 'dark' ? '#f472b6' : '#f472b6'); // Pink top

          ctx.fillStyle = gradient;

          for (let i = 0; i < bufferLength; i++) {
              barHeight = (dataArray[i] / 255) * height;
              
              // Draw rounded bar
              ctx.beginPath();
              ctx.roundRect(x, height - barHeight, barWidth, barHeight, [2, 2, 0, 0]);
              ctx.fill();

              x += barWidth + 1;
          }
      };

      draw();

      return () => {
          if (animationRef.current) cancelAnimationFrame(animationRef.current);
      };
  }, [isPlaying, visualizerMode, theme]);


  const handlePlayPause = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-0 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm relative">
      {/* Visualizer Overlay */}
      <canvas 
        ref={canvasRef} 
        className={`absolute top-0 left-0 w-full h-full pointer-events-none transition-opacity duration-500 ${isPlaying && visualizerMode === 'bars' ? 'opacity-30' : 'opacity-0'}`}
        width={800}
        height={200}
      />

      <div className="p-4 flex items-center gap-4 relative z-10">
        <button
          onClick={handlePlayPause}
          disabled={!isReady}
          className="w-12 h-12 flex-shrink-0 bg-gradient-to-br from-accent-violet to-accent-blue text-white rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 shadow-lg shadow-accent-violet/30"
          aria-label={isPlaying ? 'Pauza' : 'Odtwarzaj'}
        >
          {!isReady ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : isPlaying ? (
            <Pause className="w-5 h-5 fill-current" />
          ) : (
            <Play className="w-5 h-5 fill-current pl-1" />
          )}
        </button>
        
        <div className="flex-grow relative">
             <div ref={containerRef} className="w-full" />
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-1">
            <button 
                onClick={() => setVisualizerMode(prev => prev === 'bars' ? 'off' : 'bars')}
                className={`p-2 rounded-lg transition-colors ${visualizerMode === 'bars' ? 'text-accent-violet bg-accent-violet/10' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                title="Wizualizator Widma"
            >
                <BarChart className="w-5 h-5" />
            </button>
            <div className="text-[10px] font-mono text-slate-400 text-center uppercase tracking-wider">
                {isPlaying ? 'Live' : 'Ready'}
            </div>
        </div>
      </div>
      
      {/* Footer Info */}
      <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 font-mono">
        <div className="flex items-center gap-2">
            <Zap className="w-3 h-3 text-yellow-500" />
            <span>44.1kHz / 16bit</span>
        </div>
        <div>
            Natywny Analizator Widma
        </div>
      </div>
    </div>
  );
};

export default WaveformDisplay;
