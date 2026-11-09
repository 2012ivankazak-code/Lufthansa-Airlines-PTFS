import React, { useState, useEffect } from 'react';
import {
  X,
  Bell,
  Volume2,
  Check,
  Trash2,
  AlertCircle,
  Radio,
  Clock,
  Send,
  Plane,
} from 'lucide-react';
import { Flight, FlightAlertSubscription, ActiveFlightNotification } from '../types';
import {
  getFlights,
  getAlertSubscriptions,
  saveAlertSubscription,
  removeAlertSubscription,
  INITIAL_ALERTS,
} from '../utils/storage';
import { playAirportChime } from '../utils/audioChime';

interface FlightAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialFlightNumber?: string;
}

export const FlightAlertModal: React.FC<FlightAlertModalProps> = ({
  isOpen,
  onClose,
  initialFlightNumber,
}) => {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [selectedFlightNumber, setSelectedFlightNumber] = useState<string>('');
  const [nickname, setNickname] = useState('');
  const [telegram, setTelegram] = useState('');
  const [boardingAlert, setBoardingAlert] = useState(true);
  const [delayAlert, setDelayAlert] = useState(true);
  const [gateAlert, setGateAlert] = useState(true);
  const [metarAlert, setMetarAlert] = useState(false);
  const [subscriptions, setSubscriptions] = useState<FlightAlertSubscription[]>([]);
  const [successMsg, setSuccessMsg] = useState(false);
  const [testPlaying, setTestPlaying] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fList = getFlights();
      setFlights(fList);
      if (initialFlightNumber) {
        setSelectedFlightNumber(initialFlightNumber);
      } else if (fList.length > 0 && !selectedFlightNumber) {
        setSelectedFlightNumber(fList[0].flightNumber);
      }
      setSubscriptions(getAlertSubscriptions());
    }
  }, [isOpen, initialFlightNumber]);

  if (!isOpen) return null;

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFlightNumber) return;

    const newSub: FlightAlertSubscription = {
      id: `alert-${Date.now()}`,
      flightNumber: selectedFlightNumber,
      passengerNickname: nickname.trim() || 'Пассажир PTFS',
      telegram: telegram.trim() ? (telegram.startsWith('@') ? telegram : `@${telegram}`) : undefined,
      alertTypes: {
        boarding: boardingAlert,
        delay: delayAlert,
        gateChange: gateAlert,
        metar: metarAlert,
      },
      createdAt: new Date().toISOString(),
    };

    saveAlertSubscription(newSub);
    setSubscriptions(getAlertSubscriptions());
    setSuccessMsg(true);
    playAirportChime();
    setTimeout(() => setSuccessMsg(false), 2500);
  };

  const handleDeleteSub = (id: string) => {
    removeAlertSubscription(id);
    setSubscriptions(getAlertSubscriptions());
  };

  const handleTestChime = () => {
    playAirportChime();
    setTestPlaying(true);
    setTimeout(() => setTestPlaying(false), 1200);
  };

  const selectedFlightObj = flights.find((f) => f.flightNumber === selectedFlightNumber);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="alert-modal-title"
    >
      <div className="relative w-full max-w-2xl bg-[#030e33] border border-white/20 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 bg-[#05164D] border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-[#FFCC00]/40 flex items-center justify-center text-[#FFCC00]">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="alert-modal-title"
                className="text-base sm:text-lg font-bold text-white tracking-wide uppercase font-sans"
              >
                Оповещения о рейсах PTFS
              </h2>
              <span className="text-[11px] font-mono text-[#FFCC00]">
                Мгновенные уведомления о статусах, гейтах и задержках (МСК)
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть окно оповещений"
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* Active Live Broadcast Alerts Box */}
          <div className="p-4 rounded-xl bg-[#020B27] border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-[#FFCC00] font-bold tracking-wider flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                Текущие оперативные оповещения PTFS:
              </span>
              <button
                type="button"
                onClick={handleTestChime}
                title="Проверить звук авиационного оповещения"
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/15 text-[10px] font-mono text-slate-300 hover:text-[#FFCC00] transition-colors cursor-pointer ${
                  testPlaying ? 'text-[#FFCC00] border-[#FFCC00]' : ''
                }`}
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>{testPlaying ? 'Воспроизведение...' : 'Тест сигнала Chime'}</span>
              </button>
            </div>

            <div className="space-y-2">
              {INITIAL_ALERTS.map((alert) => (
                <div
                  key={alert.id}
                  className="p-3 rounded-lg bg-white/5 border border-white/5 flex items-start justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#FFCC00] text-[11px]">
                        {alert.flightNumber}
                      </span>
                      <span className="font-bold text-white text-[11px]">{alert.title}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {alert.timestamp}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1 font-sans">{alert.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Subscribe Form */}
          <form onSubmit={handleSubscribe} className="space-y-4">
            <div className="text-xs font-mono uppercase text-slate-400 font-bold tracking-wider">
              Настроить персональное оповещение о рейсе:
            </div>

            {/* Flight Selection Dropdown */}
            <div>
              <label className="block text-[11px] font-mono uppercase text-slate-300 mb-1">
                Выберите рейс:
              </label>
              <select
                value={selectedFlightNumber}
                onChange={(e) => setSelectedFlightNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#020B27] border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-[#FFCC00] cursor-pointer"
              >
                {flights.map((f) => (
                  <option key={f.id} value={f.flightNumber} className="bg-[#030e33] text-white">
                    {f.flightNumber} — {f.originCity} ({f.originIata}) → {f.destinationCity} ({f.destinationIata}) [Вылет {f.departureTime} МСК]
                  </option>
                ))}
              </select>
            </div>

            {selectedFlightObj && (
              <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-slate-300 flex flex-wrap gap-4 items-center">
                <span>Гейт: <strong className="text-white">{selectedFlightObj.gate}</strong> ({selectedFlightObj.terminal})</span>
                <span>Борт: <strong className="text-white">{selectedFlightObj.aircraft}</strong></span>
                <span>Время: <strong className="text-[#FFCC00]">{selectedFlightObj.departureTime} МСК</strong></span>
              </div>
            )}

            {/* Nickname & Telegram Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-300 mb-1">
                  Никнейм в Roblox (Позывной):
                </label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="Например: Pilot_Alex"
                  className="w-full px-3 py-2 rounded-lg bg-[#020B27] border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-[#FFCC00]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-300 mb-1">
                  Telegram (для ролевой связи):
                </label>
                <input
                  type="text"
                  value={telegram}
                  onChange={(e) => setTelegram(e.target.value)}
                  placeholder="@telegram_nick"
                  className="w-full px-3 py-2 rounded-lg bg-[#020B27] border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-[#FFCC00]"
                />
              </div>
            </div>

            {/* Alert Categories Checkboxes */}
            <div className="pt-2">
              <span className="block text-[11px] font-mono uppercase text-slate-400 mb-2">
                События для оповещения:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <label className="flex items-center gap-2 p-2 rounded bg-[#020B27] border border-white/10 cursor-pointer hover:border-white/20">
                  <input
                    type="checkbox"
                    checked={boardingAlert}
                    onChange={(e) => setBoardingAlert(e.target.checked)}
                    className="accent-[#FFCC00]"
                  />
                  <span>Начало посадки на борт</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded bg-[#020B27] border border-white/10 cursor-pointer hover:border-white/20">
                  <input
                    type="checkbox"
                    checked={delayAlert}
                    onChange={(e) => setDelayAlert(e.target.checked)}
                    className="accent-[#FFCC00]"
                  />
                  <span>Задержка или перенос рейса</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded bg-[#020B27] border border-white/10 cursor-pointer hover:border-white/20">
                  <input
                    type="checkbox"
                    checked={gateAlert}
                    onChange={(e) => setGateAlert(e.target.checked)}
                    className="accent-[#FFCC00]"
                  />
                  <span>Смена номера гейта / терминала</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded bg-[#020B27] border border-white/10 cursor-pointer hover:border-white/20">
                  <input
                    type="checkbox"
                    checked={metarAlert}
                    onChange={(e) => setMetarAlert(e.target.checked)}
                    className="accent-[#FFCC00]"
                  />
                  <span>Сводка METAR / Погода в хабе</span>
                </label>
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-2 flex items-center justify-between">
              {successMsg ? (
                <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono">
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Оповещение успешно активировано со звуковым сигналом!</span>
                </div>
              ) : (
                <span className="text-[10px] font-mono text-slate-400">
                  Сигнал оповещения прозвучит автоматически при смене статуса
                </span>
              )}

              <button
                type="submit"
                className="px-5 py-2.5 rounded-lg bg-[#FFCC00] hover:bg-[#FFE066] text-[#05164D] font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer shrink-0"
              >
                Включить оповещение
              </button>
            </div>
          </form>

          {/* Active Subscriptions List */}
          {subscriptions.length > 0 && (
            <div className="pt-4 border-t border-white/10">
              <span className="block text-[11px] font-mono uppercase text-slate-400 mb-2">
                Ваши активные подписки на оповещения ({subscriptions.length}):
              </span>
              <div className="space-y-2 max-h-36 overflow-y-auto">
                {subscriptions.map((sub) => (
                  <div
                    key={sub.id}
                    className="p-2.5 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-mono font-bold text-[#FFCC00]">
                        {sub.flightNumber} • {sub.passengerNickname}
                      </div>
                      <div className="text-[10px] text-slate-400 font-sans mt-0.5">
                        Типы: {sub.alertTypes.boarding ? 'Посадка, ' : ''}
                        {sub.alertTypes.delay ? 'Задержка, ' : ''}
                        {sub.alertTypes.gateChange ? 'Гейт, ' : ''}
                        {sub.alertTypes.metar ? 'METAR' : ''}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteSub(sub.id)}
                      title="Удалить подписку"
                      className="p-1.5 text-slate-400 hover:text-rose-400 rounded hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
