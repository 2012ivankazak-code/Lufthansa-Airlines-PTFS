import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, Send, Sliders } from 'lucide-react';
import { RoleId, Application } from '../types';
import {
  validatePilotForm,
  validateAttendantForm,
  validateGroundForm,
  validateDispatcherForm,
  sanitizeTelegram,
} from '../utils/validation';
import { saveApplication } from '../utils/storage';

interface ApplicationModalProps {
  roleId: RoleId | null;
  onClose: () => void;
  onSuccess: (newApp: Application) => void;
}

export const ApplicationModal: React.FC<ApplicationModalProps> = ({ roleId, onClose, onSuccess }) => {
  // Form fields
  const [name, setName] = useState('');
  const [telegram, setTelegram] = useState('');
  
  // Pilot fields
  const [minutesInPtfs, setMinutesInPtfs] = useState('');
  const [referralSource, setReferralSource] = useState('');
  const [flightSkill, setFlightSkill] = useState<number>(8);
  const [pilotReady, setPilotReady] = useState<'yes' | 'no'>('yes');

  // Attendant fields
  const [serviceSkill, setServiceSkill] = useState<number>(8);
  const [attendantReady, setAttendantReady] = useState<'yes' | 'no'>('yes');

  // Ground Crew fields
  const [maintenanceKnowledge, setMaintenanceKnowledge] = useState('');

  // Dispatcher fields
  const [froKnowledge, setFroKnowledge] = useState('');

  // UI state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedApp, setSubmittedApp] = useState<Application | null>(null);

  if (!roleId) return null;

  const roleTitles: Record<RoleId, string> = {
    pilot: 'Пилот (Pilot PTFS)',
    attendant: 'Бортпроводник (Cabin Crew)',
    ground: 'Наземная служба (Ground Operations)',
    dispatcher: 'Диспетчер (Air Traffic Controller)',
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const cleanTg = sanitizeTelegram(telegram);
    let validationResult;
    let applicationData;

    if (roleId === 'pilot') {
      const payload = {
        name: name.trim(),
        minutesInPtfs: Number(minutesInPtfs),
        referralSource: referralSource.trim(),
        flightSkill: Number(flightSkill),
        readyForCheck: pilotReady,
        telegram: cleanTg,
      };
      validationResult = validatePilotForm(payload);
      applicationData = payload;
    } else if (roleId === 'attendant') {
      const payload = {
        name: name.trim(),
        serviceSkill: Number(serviceSkill),
        readyForCheck: attendantReady,
        telegram: cleanTg,
      };
      validationResult = validateAttendantForm(payload);
      applicationData = payload;
    } else if (roleId === 'ground') {
      const payload = {
        name: name.trim(),
        maintenanceKnowledge: maintenanceKnowledge.trim(),
        telegram: cleanTg,
      };
      validationResult = validateGroundForm(payload);
      applicationData = payload;
    } else {
      const payload = {
        name: name.trim(),
        froKnowledge: froKnowledge.trim(),
        telegram: cleanTg,
      };
      validationResult = validateDispatcherForm(payload);
      applicationData = payload;
    }

    if (!validationResult.isValid) {
      setErrors(validationResult.errors);
      return;
    }

    setIsSubmitting(true);

    const newApp: Application = {
      id: `LH-APP-${Date.now().toString(36).toUpperCase()}`,
      roleId,
      roleTitle: roleTitles[roleId],
      applicantName: name.trim(),
      telegram: cleanTg,
      data: applicationData,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    setTimeout(() => {
      saveApplication(newApp);
      setIsSubmitting(false);
      setSubmittedApp(newApp);
      onSuccess(newApp);
    }, 400);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="relative w-full max-w-xl my-8 bg-[#04113B] border border-white/15 rounded-2xl shadow-2xl overflow-hidden text-white">
        {/* Modal Top Bar */}
        <div className="bg-[#05164D] px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFCC00]" />
            <h3 id="modal-title" className="text-base font-bold uppercase tracking-wider text-white">
              {roleTitles[roleId]}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть окно"
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {submittedApp ? (
            <div className="py-8 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-4">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h4 className="text-xl font-bold uppercase tracking-wide text-white">
                Заявление успешно отправлено
              </h4>
              <p className="mt-2 text-sm text-slate-300 max-w-md">
                Ваша заявка зарегистрирована в системе Lufthansa PTFS под номером{' '}
                <span className="font-mono text-[#FFCC00] font-bold">{submittedApp.id}</span>.
              </p>

              <div className="mt-6 p-4 rounded-lg bg-white/5 border border-white/10 w-full text-left">
                <div className="text-xs font-mono text-slate-400 mb-1">ТЕКУЩИЙ СТАТУС:</div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#FFCC00]/15 text-[#FFCC00] border border-[#FFCC00]/30 font-semibold text-xs tracking-wider uppercase font-mono">
                  <span className="w-2 h-2 rounded-full bg-[#FFCC00] animate-pulse" />
                  На рассмотрении
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Статус заявки можно отслеживать в разделе «Статус заявки». Руководство свяжется с вами в Telegram ({submittedApp.telegram}).
                </p>
              </div>

              <div className="mt-6 flex gap-3 w-full">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2.5 rounded-lg bg-[#FFCC00] hover:bg-[#FFE066] text-[#05164D] font-bold text-xs uppercase tracking-wider transition-colors"
                >
                  Закрыть окно
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed">
                Пожалуйста, заполните официальную анкету кандидата. Все поля обязательны для заполнения.
              </p>

              {/* Common Field: Name */}
              <div>
                <label className="block text-xs font-mono font-medium text-slate-300 uppercase tracking-wider mb-1.5">
                  1) Ваше имя / Никнейм в Roblox *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Например: Alexander_PTFS"
                  className={`w-full px-3.5 py-2.5 rounded-lg bg-[#020B27]/80 border ${
                    errors.name ? 'border-rose-500 ring-1 ring-rose-500' : 'border-white/15 focus:border-[#FFCC00]'
                  } text-white text-sm focus:outline-none transition-colors`}
                />
                {errors.name && <p className="mt-1 text-xs text-rose-400">{errors.name}</p>}
              </div>

              {/* Role specific: Pilot */}
              {roleId === 'pilot' && (
                <>
                  <div>
                    <label className="block text-xs font-mono font-medium text-slate-300 uppercase tracking-wider mb-1.5">
                      2) Сколько минут вы провели в PTFS? *
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={minutesInPtfs}
                      onChange={(e) => setMinutesInPtfs(e.target.value)}
                      placeholder="Например: 1200"
                      className={`w-full px-3.5 py-2.5 rounded-lg bg-[#020B27]/80 border ${
                        errors.minutesInPtfs ? 'border-rose-500 ring-1 ring-rose-500' : 'border-white/15 focus:border-[#FFCC00]'
                      } text-white text-sm focus:outline-none transition-colors`}
                    />
                    {errors.minutesInPtfs && (
                      <p className="mt-1 text-xs text-rose-400">{errors.minutesInPtfs}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-medium text-slate-300 uppercase tracking-wider mb-1.5">
                      3) Как вы узнали о нашей авиакомпании? *
                    </label>
                    <input
                      type="text"
                      value={referralSource}
                      onChange={(e) => setReferralSource(e.target.value)}
                      placeholder="Например: Сервер Discord PTFS / играли на одном сервере"
                      className={`w-full px-3.5 py-2.5 rounded-lg bg-[#020B27]/80 border ${
                        errors.referralSource ? 'border-rose-500 ring-1 ring-rose-500' : 'border-white/15 focus:border-[#FFCC00]'
                      } text-white text-sm focus:outline-none transition-colors`}
                    />
                    {errors.referralSource && (
                      <p className="mt-1 text-xs text-rose-400">{errors.referralSource}</p>
                    )}
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs font-mono font-medium text-slate-300 uppercase tracking-wider">
                        4) Умеете ли управлять самолетом (от 1 до 10)? *
                      </label>
                      <span className="text-xs font-mono font-bold text-[#FFCC00] bg-[#FFCC00]/10 px-2 py-0.5 rounded border border-[#FFCC00]/30">
                        {flightSkill} / 10
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="1"
                        max="10"
                        step="1"
                        value={flightSkill}
                        onChange={(e) => setFlightSkill(Number(e.target.value))}
                        className="w-full h-2 bg-[#020B27] rounded-lg appearance-none cursor-pointer accent-[#FFCC00]"
                      />
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
                      <span>1 (Новичок)</span>
                      <span>5 (Средний)</span>
                      <span>10 (Профи ИКАО)</span>
                    </div>
                    {errors.flightSkill && (
                      <p className="mt-1 text-xs text-rose-400">{errors.flightSkill}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-medium text-slate-300 uppercase tracking-wider mb-1.5">
                      5) Готовы ли пройти летную проверку? *
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <label className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all ${
                        pilotReady === 'yes' ? 'bg-[#FFCC00]/10 border-[#FFCC00] text-white' : 'bg-[#020B27]/50 border-white/10 text-slate-300'
                      }`}>
                        <input
                          type="radio"
                          name="pilotReady"
                          value="yes"
                          checked={pilotReady === 'yes'}
                          onChange={() => setPilotReady('yes')}
                          className="accent-[#FFCC00]"
                        />
                        <span className="text-xs font-medium">Да, готов</span>
                      </label>
                      <label className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all ${
                        pilotReady === 'no' ? 'bg-[#FFCC00]/10 border-[#FFCC00] text-white' : 'bg-[#020B27]/50 border-white/10 text-slate-300'
                      }`}>
                        <input
                          type="radio"
                          name="pilotReady"
                          value="no"
                          checked={pilotReady === 'no'}
                          onChange={() => setPilotReady('no')}
                          className="accent-[#FFCC00]"
                        />
                        <span className="text-xs font-medium">Нет / Не сейчас</span>
                      </label>
                    </div>
                    {errors.readyForCheck && (
                      <p className="mt-1 text-xs text-rose-400">{errors.readyForCheck}</p>
                    )}
                  </div>
                </>
              )}

              {/* Role specific: Flight Attendant */}
              {roleId === 'attendant' && (
                <>
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs font-mono font-medium text-slate-300 uppercase tracking-wider">
                        2) Знаете ли как обслуживать пассажиров (от 1 до 10)? *
                      </label>
                      <span className="text-xs font-mono font-bold text-[#FFCC00] bg-[#FFCC00]/10 px-2 py-0.5 rounded border border-[#FFCC00]/30">
                        {serviceSkill} / 10
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      step="1"
                      value={serviceSkill}
                      onChange={(e) => setServiceSkill(Number(e.target.value))}
                      className="w-full h-2 bg-[#020B27] rounded-lg appearance-none cursor-pointer accent-[#FFCC00]"
                    />
                    <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
                      <span>1 (Не знаю)</span>
                      <span>5 (Базовый RP)</span>
                      <span>10 (Идеальный сервис)</span>
                    </div>
                    {errors.serviceSkill && (
                      <p className="mt-1 text-xs text-rose-400">{errors.serviceSkill}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-medium text-slate-300 uppercase tracking-wider mb-1.5">
                      3) Готовы ли пройти проверку (в лс)? *
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <label className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all ${
                        attendantReady === 'yes' ? 'bg-[#FFCC00]/10 border-[#FFCC00] text-white' : 'bg-[#020B27]/50 border-white/10 text-slate-300'
                      }`}>
                        <input
                          type="radio"
                          name="attendantReady"
                          value="yes"
                          checked={attendantReady === 'yes'}
                          onChange={() => setAttendantReady('yes')}
                          className="accent-[#FFCC00]"
                        />
                        <span className="text-xs font-medium">Да, готов</span>
                      </label>
                      <label className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all ${
                        attendantReady === 'no' ? 'bg-[#FFCC00]/10 border-[#FFCC00] text-white' : 'bg-[#020B27]/50 border-white/10 text-slate-300'
                      }`}>
                        <input
                          type="radio"
                          name="attendantReady"
                          value="no"
                          checked={attendantReady === 'no'}
                          onChange={() => setAttendantReady('no')}
                          className="accent-[#FFCC00]"
                        />
                        <span className="text-xs font-medium">Нет</span>
                      </label>
                    </div>
                    {errors.readyForCheck && (
                      <p className="mt-1 text-xs text-rose-400">{errors.readyForCheck}</p>
                    )}
                  </div>
                </>
              )}

              {/* Role specific: Ground Crew */}
              {roleId === 'ground' && (
                <div>
                  <label className="block text-xs font-mono font-medium text-slate-300 uppercase tracking-wider mb-1.5">
                    2) Знаете ли как обслуживать самолет? *
                  </label>
                  <textarea
                    rows={3}
                    value={maintenanceKnowledge}
                    onChange={(e) => setMaintenanceKnowledge(e.target.value)}
                    placeholder="Опишите ваш опыт буксировки (pushback), заправки, маршалинга и работы на перроне PTFS..."
                    className={`w-full px-3.5 py-2.5 rounded-lg bg-[#020B27]/80 border ${
                      errors.maintenanceKnowledge ? 'border-rose-500 ring-1 ring-rose-500' : 'border-white/15 focus:border-[#FFCC00]'
                    } text-white text-sm focus:outline-none transition-colors`}
                  />
                  {errors.maintenanceKnowledge && (
                    <p className="mt-1 text-xs text-rose-400">{errors.maintenanceKnowledge}</p>
                  )}
                </div>
              )}

              {/* Role specific: Dispatcher */}
              {roleId === 'dispatcher' && (
                <div>
                  <label className="block text-xs font-mono font-medium text-slate-300 uppercase tracking-wider mb-1.5">
                    2) Знаете ли ФРО (Фразеологию радиообмена)? *
                  </label>
                  <textarea
                    rows={3}
                    value={froKnowledge}
                    onChange={(e) => setFroKnowledge(e.target.value)}
                    placeholder="Укажите уровень владения ФРО (выдача разрешений, эшелонирование, радиообмен вышка/подход)..."
                    className={`w-full px-3.5 py-2.5 rounded-lg bg-[#020B27]/80 border ${
                      errors.froKnowledge ? 'border-rose-500 ring-1 ring-rose-500' : 'border-white/15 focus:border-[#FFCC00]'
                    } text-white text-sm focus:outline-none transition-colors`}
                  />
                  {errors.froKnowledge && (
                    <p className="mt-1 text-xs text-rose-400">{errors.froKnowledge}</p>
                  )}
                </div>
              )}

              {/* Common Field: Telegram */}
              <div>
                <label className="block text-xs font-mono font-medium text-slate-300 uppercase tracking-wider mb-1.5">
                  {roleId === 'pilot' ? '6' : roleId === 'attendant' ? '4' : '3'}) Имя в Telegram (для связи) *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={telegram}
                    onChange={(e) => setTelegram(e.target.value)}
                    placeholder="@username"
                    className={`w-full px-3.5 py-2.5 rounded-lg bg-[#020B27]/80 border ${
                      errors.telegram ? 'border-rose-500 ring-1 ring-rose-500' : 'border-white/15 focus:border-[#FFCC00]'
                    } text-white text-sm focus:outline-none transition-colors`}
                  />
                </div>
                {errors.telegram && <p className="mt-1 text-xs text-rose-400">{errors.telegram}</p>}
                <p className="text-[10px] text-slate-400 mt-1 font-mono">
                  Официальное сообщество: <a href="https://t.me/Lufthansa_rblx" target="_blank" rel="noopener noreferrer" className="text-[#FFCC00] hover:underline">t.me/Lufthansa_rblx</a>
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-1/3 py-2.5 rounded-lg border border-white/15 hover:bg-white/5 text-slate-300 text-xs font-semibold uppercase tracking-wider transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-2/3 py-2.5 rounded-lg bg-[#FFCC00] hover:bg-[#FFE066] disabled:opacity-50 text-[#05164D] font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(255,204,0,0.25)] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4 stroke-[2.5]" />
                  <span>{isSubmitting ? 'Отправка...' : 'Отправить заявление'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
