import React, { useEffect, useState } from 'react';

interface PreloaderProps {
  onLoaded?: () => void;
}

export const Preloader: React.FC<PreloaderProps> = ({ onLoaded }) => {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);
  const [progress, setProgress] = useState(15);
  const [statusText, setStatusText] = useState('ИНИЦИАЛИЗАЦИЯ СИСТЕМ PTFS...');

  useEffect(() => {
    // Increment progress over 1.3 seconds
    const t1 = setTimeout(() => {
      setProgress(55);
      setStatusText('ЗАГРУЗКА БАЗЫ РЕЙСОВ И ЭКИПАЖЕЙ...');
    }, 450);

    const t2 = setTimeout(() => {
      setProgress(95);
      setStatusText('СИНХРОНИЗАЦИЯ С ДИСПЕТЧЕРСКОЙ СЛУЖБОЙ...');
    }, 950);

    const t3 = setTimeout(() => {
      setProgress(100);
      setStatusText('ГОТОВО К ВЫЛЕТУ');
    }, 1300);

    // Fade out at 1.5 seconds exactly
    const t4 = setTimeout(() => {
      setFading(true);
      if (onLoaded) onLoaded();
    }, 1500);

    // Remove from DOM after fade-out transition (400ms)
    const t5 = setTimeout(() => {
      setVisible(false);
    }, 1900);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [onLoaded]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#05164D] text-white transition-opacity duration-500 ease-in-out ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      role="status"
      aria-live="polite"
    >
      <div className="w-full max-w-sm px-6 flex flex-col items-center">
        {/* Strict Corporate Lufthansa Stylized Crane Emblem SVG - Vector only, zero emoji */}
        <div className="w-16 h-16 mb-5 relative flex items-center justify-center rounded-full border border-[#FFCC00]/40 bg-[#020B27]/60 shadow-[0_0_30px_rgba(255,204,0,0.2)]">
          <svg
            viewBox="0 0 100 100"
            className="w-10 h-10 text-[#FFCC00] fill-current"
            aria-hidden="true"
          >
            {/* Elegant vector crane geometry inspired by classic Lufthansa roundel */}
            <path d="M78 28 C68 28, 52 38, 40 47 C32 53, 24 60, 16 63 C25 61, 35 56, 44 50 C55 43, 67 36, 80 34 C76 40, 71 47, 65 54 C58 62, 50 71, 38 78 C52 72, 65 62, 74 50 C80 42, 85 34, 86 28 C84 28, 81 28, 78 28 Z" />
            <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="3" opacity="0.4" />
          </svg>
        </div>

        {/* Corporate Wordmark */}
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold tracking-[0.25em] text-white uppercase font-sans">
            LUFTHANSA
          </h1>
          <div className="flex items-center justify-center gap-2 mt-1">
            <span className="h-[1px] w-6 bg-[#FFCC00]/60"></span>
            <span className="text-[11px] font-semibold tracking-[0.2em] text-[#FFCC00] uppercase font-mono">
              PTFS VIRTUAL OPERATIONS
            </span>
            <span className="h-[1px] w-6 bg-[#FFCC00]/60"></span>
          </div>
        </div>

        {/* Strict technological progress bar */}
        <div className="w-full bg-[#020B27] rounded-full h-1.5 p-0.5 overflow-hidden border border-white/10 shadow-inner">
          <div
            className="bg-gradient-to-r from-[#FFCC00] to-[#FFE066] h-full rounded-full transition-all duration-300 ease-out shadow-[0_0_10px_#FFCC00]"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Telemetry status readout */}
        <div className="w-full flex justify-between items-center mt-3 text-[10px] font-mono tracking-wider text-slate-300">
          <span className="truncate max-w-[240px] uppercase">{statusText}</span>
          <span className="text-[#FFCC00] font-semibold">{progress}%</span>
        </div>
      </div>
    </div>
  );
};
