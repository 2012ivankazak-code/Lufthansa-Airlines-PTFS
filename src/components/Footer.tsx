import React from 'react';
import { Send, Lock, ExternalLink, ShieldCheck, Bell } from 'lucide-react';

interface FooterProps {
  onOpenAuth: () => void;
  onOpenAlerts: () => void;
  onOpenPrivacyPolicy: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenAuth,
  onOpenAlerts,
  onOpenPrivacyPolicy,
}) => {
  return (
    <footer className="relative bg-[#02081d] border-t border-white/10 text-slate-300 py-14 px-4 sm:px-6 lg:px-8 z-10 font-sans">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Brand identity */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#05164D] border border-[#FFCC00] flex items-center justify-center p-1 shadow-[0_0_15px_rgba(255,204,0,0.15)]">
              <svg viewBox="0 0 100 100" className="w-full h-full text-[#FFCC00] fill-current">
                <path d="M78 28 C68 28, 52 38, 40 47 C32 53, 24 60, 16 63 C25 61, 35 56, 44 50 C55 43, 67 36, 80 34 C76 40, 71 47, 65 54 C58 62, 50 71, 38 78 C52 72, 65 62, 74 50 C80 42, 85 34, 86 28 C84 28, 81 28, 78 28 Z" />
              </svg>
            </div>
            <span className="text-xl font-extrabold tracking-[0.18em] text-white uppercase">
              LUFTHANSA <span className="text-[#FFCC00]">PTFS</span>
            </span>
          </div>

          <p className="mt-2 text-xs text-slate-400 max-w-sm leading-relaxed">
            Виртуальное подразделение гражданской авиации в Roblox Pilot Training Flight Simulator (PTFS).
          </p>
        </div>

        {/* Bottom Control Blocks: Alerts, Telegram Community, Service Panel, Privacy */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-mono">
          {/* 1. Flight Alerts Button */}
          <button
            type="button"
            onClick={onOpenAlerts}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/5 hover:bg-[#FFCC00] text-slate-200 hover:text-[#05164D] border border-white/10 hover:border-[#FFCC00] font-semibold transition-all shadow-sm cursor-pointer"
          >
            <Bell className="w-4 h-4 text-[#FFCC00] group-hover:text-[#05164D]" />
            <span>Оповещения о рейсах</span>
          </button>

          {/* 2. Telegram Community Link */}
          <a
            href="https://t.me/Lufthansa_rblx"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/5 hover:bg-[#FFCC00] text-slate-200 hover:text-[#05164D] border border-white/10 hover:border-[#FFCC00] font-semibold transition-all shadow-sm"
          >
            <Send className="w-4 h-4 text-sky-400 group-hover:text-[#05164D]" />
            <span>Telegram Сообщество</span>
            <ExternalLink className="w-3 h-3 opacity-60" />
          </a>

          {/* 3. Service Panel (Strictly zero key mention) */}
          <button
            type="button"
            onClick={onOpenAuth}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/[0.04] hover:bg-white/15 text-slate-300 hover:text-[#FFCC00] border border-white/10 hover:border-[#FFCC00]/50 font-semibold transition-all cursor-pointer"
          >
            <Lock className="w-4 h-4 text-[#FFCC00]" />
            <span>Служебная панель</span>
          </button>

          {/* 4. Privacy Policy */}
          <button
            type="button"
            onClick={onOpenPrivacyPolicy}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-white/[0.02] hover:bg-white/10 text-slate-400 hover:text-white border border-white/5 transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-slate-400" />
            <span>Конфиденциальность</span>
          </button>
        </div>
      </div>

      {/* Mandatory Disclaimer */}
      <div className="mt-10 pt-8 border-t border-white/5 max-w-7xl mx-auto text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 font-mono">
        <div>
          © Lufthansa Airlines PTFS. Виртуальная авиакомпания в Roblox. Не является реальной авиакомпанией. Не affiliated с Deutsche Lufthansa AG.
        </div>
        <div className="text-slate-500">
          Roblox PTFS Aviation Community Edition • Московское время (МСК / UTC+3)
        </div>
      </div>
    </footer>
  );
};
