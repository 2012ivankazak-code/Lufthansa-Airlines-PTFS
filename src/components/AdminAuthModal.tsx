import React, { useState } from 'react';
import { X, Lock, KeyRound, AlertTriangle, ArrowRight } from 'lucide-react';
import { validateAdminKey } from '../utils/mapLogic';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated: () => void;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  onAuthenticated,
}) => {
  const [accessKey, setAccessKey] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmed = accessKey.trim();
    if (!trimmed) {
      setError('Введите ключ безопасности');
      return;
    }

    setIsVerifying(true);

    setTimeout(() => {
      // Strictly verify required key: key-lap
      if (validateAdminKey(trimmed)) {
        setIsVerifying(false);
        setAccessKey('');
        setError('');
        onAuthenticated();
      } else {
        setIsVerifying(false);
        setError('Неверный ключ доступа. Обратитесь к руководству авиакомпании.');
      }
    }, 300);
  };


  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-title"
    >
      <div className="relative w-full max-w-md bg-[#04113B] border border-white/20 rounded-2xl shadow-2xl overflow-hidden text-white font-sans animate-fadeIn">
        {/* Top Header */}
        <div className="bg-[#05164D] px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FFCC00]/10 border border-[#FFCC00]/40 flex items-center justify-center text-[#FFCC00]">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 id="auth-title" className="text-sm font-bold uppercase tracking-wider text-white">
                Служебная панель персонала
              </h3>
              <p className="text-[10px] font-mono text-slate-400">
                Lufthansa PTFS Internal Dispatch Protocol • Авторизация
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть окно авторизации"
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-xs text-slate-300 leading-relaxed">
              Доступ к управлению кадровым составом и редактированию расписания ограничен. Введите служебный ключ доступа.
            </p>

            <div>
              <label
                htmlFor="admin-key-input"
                className="block text-[11px] font-mono uppercase text-slate-300 tracking-wider mb-2 flex items-center gap-1.5"
              >
                <KeyRound className="w-3.5 h-3.5 text-[#FFCC00]" />
                Ключ допуска (Access Key) *
              </label>
              <input
                id="admin-key-input"
                type="password"
                value={accessKey}
                onChange={(e) => {
                  setAccessKey(e.target.value);
                  setError('');
                }}
                autoFocus
                placeholder="Введите ключ доступа..."
                className={`w-full px-3.5 py-2.5 rounded-lg bg-[#020B27] border ${
                  error ? 'border-rose-500 ring-1 ring-rose-500' : 'border-white/20 focus:border-[#FFCC00]'
                } text-white font-mono text-sm focus:outline-none transition-colors tracking-widest`}
              />
              {error && (
                <p className="mt-2 text-xs text-rose-400 flex items-center gap-1.5 font-sans">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{error}</span>
                </p>
              )}
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="w-1/3 py-2.5 rounded-lg border border-white/15 hover:bg-white/5 text-slate-300 text-xs font-semibold uppercase tracking-wider transition-colors"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={isVerifying}
                className="w-2/3 py-2.5 rounded-lg bg-[#FFCC00] hover:bg-[#FFE066] disabled:opacity-50 text-[#05164D] font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(255,204,0,0.25)] flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{isVerifying ? 'Проверка...' : 'Войти в панель'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
