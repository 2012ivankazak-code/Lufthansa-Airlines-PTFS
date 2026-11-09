import React, { useState, useEffect } from 'react';
import { ShieldCheck, Cookie, ExternalLink } from 'lucide-react';
import { areCookiesAccepted, setCookiesAccepted } from '../utils/storage';

interface CookieBannerProps {
  onOpenPrivacyPolicy: () => void;
}

export const CookieBanner: React.FC<CookieBannerProps> = ({ onOpenPrivacyPolicy }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Check if user already accepted
    const accepted = areCookiesAccepted();
    if (!accepted) {
      const timer = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    setCookiesAccepted(true);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <aside
      aria-label="Уведомление об использовании файлов cookie"
      className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-lg z-40 bg-[#05164D]/95 border border-[#FFCC00]/40 rounded-2xl shadow-2xl backdrop-blur-xl p-5 text-xs text-slate-200 animate-fadeIn"
    >
      <div className="flex items-start gap-3.5">
        <div className="w-9 h-9 rounded-xl bg-white/5 border border-[#FFCC00]/50 flex items-center justify-center shrink-0 text-[#FFCC00]">
          <Cookie className="w-5 h-5" />
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white uppercase tracking-wider text-xs font-mono">
              Файлы Cookie и Хранилище
            </span>
          </div>

          <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
            Мы используем файлы cookie и локальное хранилище браузера (localStorage) для безопасного сохранения ваших заявок, посадочных талонов, полетных планов и оповещений в Roblox PTFS.
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleAccept}
              className="px-4 py-2 rounded-lg bg-[#FFCC00] hover:bg-[#FFE066] text-[#05164D] font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-sm"
            >
              Принять все
            </button>

            <button
              type="button"
              onClick={onOpenPrivacyPolicy}
              className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Политика конфиденциальности</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
