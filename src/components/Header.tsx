import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowUpRight } from 'lucide-react';

export const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Главная', href: '#hero' },
    { label: 'Заявление на работу', href: '#careers' },
    { label: 'Карта полетов', href: '#planner' },
    { label: 'Регистрация на рейс', href: '#checkin' },
    { label: 'Расписание', href: '#schedule' },
    { label: 'Статус заявки', href: '#status' },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#05164D]/95 backdrop-blur-md border-b border-white/10 shadow-lg shadow-[#020B27]/50 py-3'
          : 'bg-[#05164D]/85 backdrop-blur-sm border-b border-white/5 py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo - Pure typography + vector emblem (Strictly zero emojis) */}
        <a
          href="#hero"
          onClick={(e) => handleNavClick(e, '#hero')}
          className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFCC00]"
        >
          <div className="w-9 h-9 rounded-full bg-[#05164D] border border-[#FFCC00]/50 flex items-center justify-center p-1.5 shadow-[0_0_15px_rgba(255,204,0,0.15)] group-hover:border-[#FFCC00] transition-colors">
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full text-[#FFCC00] fill-current"
              aria-hidden="true"
            >
              <path d="M78 28 C68 28, 52 38, 40 47 C32 53, 24 60, 16 63 C25 61, 35 56, 44 50 C55 43, 67 36, 80 34 C76 40, 71 47, 65 54 C58 62, 50 71, 38 78 C52 72, 65 62, 74 50 C80 42, 85 34, 86 28 C84 28, 81 28, 78 28 Z" />
              <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="3" opacity="0.3" />
            </svg>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-[0.16em] text-white uppercase font-sans">
                LUFTHANSA
              </span>
              <span className="bg-[#FFCC00] text-[#05164D] text-[10px] font-black px-1.5 py-0.2 rounded font-mono tracking-wider">
                PTFS
              </span>
            </div>
            <span className="text-[9px] font-mono text-slate-300 tracking-[0.18em] uppercase -mt-0.5">
              Virtual Aviation Division
            </span>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="px-3 py-2 text-xs font-semibold tracking-wider text-slate-200 hover:text-white uppercase hover:bg-white/5 rounded-md transition-all duration-150 relative group"
            >
              {link.label}
              <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-[#FFCC00] scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
            </a>
          ))}
        </nav>

        {/* Action Button: Strictly "Вступить" CTA (Alerts, Telegram and Service Panel moved to bottom) */}
        <div className="hidden sm:flex items-center gap-3">
          <a
            href="#careers"
            onClick={(e) => handleNavClick(e, '#careers')}
            className="flex items-center gap-1.5 bg-[#FFCC00] hover:bg-[#FFE066] text-[#05164D] text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-lg font-sans transition-all shadow-[0_0_15px_rgba(255,204,0,0.25)] hover:shadow-[0_0_20px_rgba(255,204,0,0.4)]"
          >
            <span>Вступить</span>
            <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </a>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex lg:hidden items-center gap-2">
          <a
            href="#careers"
            onClick={(e) => handleNavClick(e, '#careers')}
            className="px-3 py-1.5 bg-[#FFCC00] text-[#05164D] text-xs font-bold uppercase rounded-lg"
          >
            Вступить
          </a>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
            className="p-2 text-white hover:text-[#FFCC00] bg-white/5 rounded-md"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#05164D] border-b border-white/10 px-4 pt-3 pb-5 space-y-2 animate-fadeIn shadow-2xl">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="block px-3 py-2.5 rounded-md text-sm font-semibold tracking-wider text-slate-200 hover:text-white hover:bg-white/10 uppercase"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-3 border-t border-white/10">
            <a
              href="#checkin"
              onClick={(e) => handleNavClick(e, '#checkin')}
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#FFCC00] text-[#05164D] font-bold text-xs uppercase tracking-wider rounded-lg"
            >
              Регистрация на рейс
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
