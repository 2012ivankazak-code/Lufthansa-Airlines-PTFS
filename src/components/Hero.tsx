import React from 'react';
import { FileText, Ticket, ArrowRight, ShieldCheck, Activity, Globe, Send } from 'lucide-react';

export const Hero: React.FC = () => {
  const scrollTo = (selector: string) => {
    const el = document.querySelector(selector);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="hero"
      className="relative pt-32 pb-20 md:pt-40 md:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center justify-center text-center z-10"
    >
      {/* Precision Badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-6 shadow-sm">
        <span className="w-2 h-2 rounded-full bg-[#FFCC00] animate-ping" />
        <span className="text-[11px] font-mono font-semibold tracking-wider text-[#FFCC00] uppercase">
          PTFS SERVER FLIGHT OPERATIONS ACTIVE
        </span>
      </div>

      {/* Main Title */}
      <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white uppercase max-w-4xl font-sans leading-[1.08]">
        Lufthansa Airlines <span className="text-[#FFCC00] block sm:inline">— PTFS</span>
      </h1>

      {/* Subtitle */}
      <p className="mt-5 text-base sm:text-xl text-slate-300 max-w-2xl font-normal leading-relaxed">
        Виртуальная авиакомпания в Roblox Pilot Training Flight Simulator.
        Профессиональные стандарты полетов, реалистичные регламенты ИКАО и регулярные рейсы.
      </p>

      {/* Action Buttons */}
      <div className="mt-8 flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto">
        <button
          type="button"
          onClick={() => scrollTo('#careers')}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-lg bg-[#FFCC00] hover:bg-[#FFE066] text-[#05164D] font-bold text-sm tracking-wide uppercase transition-all duration-200 shadow-[0_0_25px_rgba(255,204,0,0.3)] hover:shadow-[0_0_35px_rgba(255,204,0,0.5)] cursor-pointer group"
        >
          <FileText className="w-4 h-4 stroke-[2.5]" />
          <span>Заявление на работу</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>

        <button
          type="button"
          onClick={() => scrollTo('#checkin')}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-lg bg-[#05164D]/80 hover:bg-[#05164D] text-white border border-[#FFCC00]/40 hover:border-[#FFCC00] font-semibold text-sm tracking-wide uppercase transition-all duration-200 backdrop-blur-md shadow-md cursor-pointer group"
        >
          <Ticket className="w-4 h-4 text-[#FFCC00]" />
          <span>Регистрация на рейс</span>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
        </button>

        <a
          href="https://t.me/Lufthansa_rblx"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white border border-white/10 font-semibold text-sm tracking-wide transition-all backdrop-blur-md cursor-pointer"
        >
          <Send className="w-4 h-4 text-sky-400" />
          <span>Telegram Сообщество</span>
        </a>
      </div>

      {/* Corporate Glass Cards / Telemetry Stats */}
      <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-4xl text-left">
        <div className="p-5 rounded-xl bg-white/[0.04] border border-white/10 backdrop-blur-md hover:border-[#FFCC00]/40 transition-colors shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
              Базовые хабы
            </span>
            <Globe className="w-4 h-4 text-[#FFCC00]" />
          </div>
          <div className="text-xl font-bold font-sans text-white tracking-wide">
            FRA • MUC • BER
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Франкфурт, Мюнхен, Берлин Бранденбург
          </div>
        </div>

        <div className="p-5 rounded-xl bg-white/[0.04] border border-white/10 backdrop-blur-md hover:border-[#FFCC00]/40 transition-colors shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
              Стандарты полетов
            </span>
            <ShieldCheck className="w-4 h-4 text-[#FFCC00]" />
          </div>
          <div className="text-xl font-bold font-sans text-white tracking-wide">
            PTFS SOP & ФРО
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Строгое соблюдение эшелонов и процедур
          </div>
        </div>

        <div className="p-5 rounded-xl bg-white/[0.04] border border-white/10 backdrop-blur-md hover:border-[#FFCC00]/40 transition-colors shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
              Флот авиакомпании
            </span>
            <Activity className="w-4 h-4 text-[#FFCC00]" />
          </div>
          <div className="text-xl font-bold font-sans text-white tracking-wide">
            A320 / A350 / B747
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Современные магистральные и широкофюзеляжные ВС
          </div>
        </div>
      </div>
    </section>
  );
};
