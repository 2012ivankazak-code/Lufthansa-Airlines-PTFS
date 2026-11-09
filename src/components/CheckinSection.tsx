import React, { useState } from 'react';
import { Ticket, Plane, ArrowRight, Printer, Check, Copy, AlertCircle, Sparkles } from 'lucide-react';
import { FLIGHTS_DATA } from '../data/flights';
import { BoardingPass, CabinClass, Flight } from '../types';
import { validateCheckIn } from '../utils/validation';
import { saveBoardingPass, getBoardingPasses } from '../utils/storage';

export const CheckinSection: React.FC = () => {
  const [selectedFlightId, setSelectedFlightId] = useState<string>('LH-1042');
  const [nickname, setNickname] = useState('');
  const [cabinClass, setCabinClass] = useState<CabinClass>('BUSINESS');
  const [seatPreference, setSeatPreference] = useState<'random' | 'window' | 'aisle'>('window');
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isRegistering, setIsRegistering] = useState(false);
  const [currentPass, setCurrentPass] = useState<BoardingPass | null>(null);
  const [copied, setCopied] = useState(false);

  const selectedFlight = FLIGHTS_DATA.find((f) => f.id === selectedFlightId) || FLIGHTS_DATA[0];

  const generateSeatNumber = (pref: 'random' | 'window' | 'aisle', cabin: CabinClass): string => {
    const row = cabin === 'FIRST' ? Math.floor(Math.random() * 3) + 1 : cabin === 'BUSINESS' ? Math.floor(Math.random() * 6) + 4 : Math.floor(Math.random() * 25) + 10;
    const padRow = row < 10 ? `0${row}` : `${row}`;
    let letter = 'A';
    if (pref === 'window') {
      letter = Math.random() > 0.5 ? 'A' : 'F';
    } else if (pref === 'aisle') {
      letter = Math.random() > 0.5 ? 'C' : 'D';
    } else {
      const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
      letter = letters[Math.floor(Math.random() * letters.length)];
    }
    return `${padRow}${letter}`;
  };

  const calculateBoardingTime = (depTime: string): string => {
    const [h, m] = depTime.split(':').map(Number);
    let total = h * 60 + m - 30; // 30 minutes before
    if (total < 0) total += 24 * 60;
    const bh = Math.floor(total / 60);
    const bm = total % 60;
    return `${bh < 10 ? '0' : ''}${bh}:${bm < 10 ? '0' : ''}${bm}`;
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const val = validateCheckIn(nickname, selectedFlightId);
    if (!val.isValid) {
      setErrors(val.errors);
      return;
    }

    setIsRegistering(true);

    const seat = generateSeatNumber(seatPreference, cabinClass);
    const boardingTime = calculateBoardingTime(selectedFlight.departureTime);
    const passId = `LH-BP-${Date.now().toString(36).toUpperCase()}`;

    const newPass: BoardingPass = {
      id: passId,
      passengerNickname: nickname.trim(),
      flightNumber: selectedFlight.flightNumber,
      originCity: selectedFlight.originCity,
      originIata: selectedFlight.originIata,
      destinationCity: selectedFlight.destinationCity,
      destinationIata: selectedFlight.destinationIata,
      departureTime: selectedFlight.departureTime,
      boardingTime,
      gate: selectedFlight.gate,
      terminal: selectedFlight.terminal,
      seat,
      cabinClass,
      ticketNumber: `220-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      sequence: `ETKT#${Math.floor(Math.random() * 180) + 1}`,
      issueDate: new Date().toLocaleDateString('ru-RU'),
    };

    setTimeout(() => {
      saveBoardingPass(newPass);
      setCurrentPass(newPass);
      setIsRegistering(false);
    }, 450);
  };

  const copyTicketDetails = () => {
    if (!currentPass) return;
    const text = `LUFTHANSA PTFS BOARDING PASS\nРейс: ${currentPass.flightNumber}\nПассажир: ${currentPass.passengerNickname}\nМаршрут: ${currentPass.originIata} -> ${currentPass.destinationIata}\nВылет: ${currentPass.departureTime} (Посадка: ${currentPass.boardingTime})\nГейт: ${currentPass.gate} | Место: ${currentPass.seat} (${currentPass.cabinClass})\nБилет: ${currentPass.ticketNumber}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="checkin" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
      <div className="flex flex-col items-center text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-3">
          <Ticket className="w-3.5 h-3.5 text-[#FFCC00]" />
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-300">
            Электронная регистрация пассажиров
          </span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight uppercase font-sans">
          Регистрация <span className="text-[#FFCC00]">на рейс</span>
        </h2>
        <p className="mt-3 text-sm sm:text-base text-slate-300 max-w-2xl">
          Зарегистрируйтесь на предстоящий рейс в PTFS и получите персональный посадочный талон авиакомпании.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left column: Check-in Form */}
        <div className="lg:col-span-5 p-7 rounded-2xl bg-[#04113B]/80 border border-white/10 backdrop-blur-md shadow-2xl">
          <h3 className="text-lg font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFCC00]" />
            Данные пассажира
          </h3>

          <form onSubmit={handleRegister} className="space-y-5">
            {/* Flight Select */}
            <div>
              <label htmlFor="flight-select" className="block text-xs font-mono font-medium text-slate-300 uppercase tracking-wider mb-2">
                Выберите рейс *
              </label>
              <select
                id="flight-select"
                value={selectedFlightId}
                onChange={(e) => setSelectedFlightId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#020B27] border border-white/15 focus:border-[#FFCC00] text-white text-sm focus:outline-none cursor-pointer"
              >
                {FLIGHTS_DATA.map((flight) => (
                  <option key={flight.id} value={flight.id} className="bg-[#04113B] text-white">
                    {flight.flightNumber}: {flight.originCity} ({flight.originIata}) → {flight.destinationCity} ({flight.destinationIata}) — {flight.departureTime}
                  </option>
                ))}
              </select>
            </div>

            {/* Nickname input */}
            <div>
              <label htmlFor="roblox-nick" className="block text-xs font-mono font-medium text-slate-300 uppercase tracking-wider mb-2">
                Никнейм в Roblox *
              </label>
              <input
                id="roblox-nick"
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Например: Captain_Skywalker"
                className={`w-full px-3.5 py-2.5 rounded-lg bg-[#020B27] border ${
                  errors.nickname ? 'border-rose-500 ring-1 ring-rose-500' : 'border-white/15 focus:border-[#FFCC00]'
                } text-white text-sm focus:outline-none transition-colors`}
              />
              {errors.nickname && (
                <p className="mt-1.5 text-xs text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.nickname}</span>
                </p>
              )}
            </div>

            {/* Cabin class select */}
            <div>
              <label className="block text-xs font-mono font-medium text-slate-300 uppercase tracking-wider mb-2">
                Класс обслуживания
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['ECONOMY', 'BUSINESS', 'FIRST'] as CabinClass[]).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCabinClass(c)}
                    className={`py-2 px-1 text-center rounded-lg text-xs font-bold uppercase tracking-wider transition-all border ${
                      cabinClass === c
                        ? 'bg-[#FFCC00] text-[#05164D] border-[#FFCC00] shadow-[0_0_15px_rgba(255,204,0,0.3)]'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/30'
                    }`}
                  >
                    {c === 'ECONOMY' ? 'Эконом' : c === 'BUSINESS' ? 'Бизнес' : 'Первый'}
                  </button>
                ))}
              </div>
            </div>

            {/* Seat preference */}
            <div>
              <label className="block text-xs font-mono font-medium text-slate-300 uppercase tracking-wider mb-2">
                Предпочтение по месту
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'window', label: 'У окна' },
                  { id: 'aisle', label: 'У прохода' },
                  { id: 'random', label: 'Любое' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSeatPreference(s.id as any)}
                    className={`py-2 px-1 text-center rounded-lg text-xs font-medium transition-all border ${
                      seatPreference === s.id
                        ? 'bg-white/15 text-white border-[#FFCC00]'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Flight summary pill inside form */}
            <div className="p-3.5 rounded-lg bg-[#020B27]/80 border border-white/10 text-xs text-slate-300 flex justify-between items-center">
              <div>
                <div className="font-mono text-[#FFCC00] font-bold">
                  {selectedFlight.originIata} → {selectedFlight.destinationIata}
                </div>
                <div className="text-[11px] text-slate-400">
                  {selectedFlight.originCity} — {selectedFlight.destinationCity}
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-white font-semibold">Гейт: {selectedFlight.gate}</div>
                <div className="text-[11px] text-slate-400">Вылет: {selectedFlight.departureTime}</div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isRegistering}
              className="w-full py-3.5 rounded-lg bg-[#FFCC00] hover:bg-[#FFE066] disabled:opacity-50 text-[#05164D] font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-[0_0_25px_rgba(255,204,0,0.3)] hover:shadow-[0_0_35px_rgba(255,204,0,0.5)] flex items-center justify-center gap-2 cursor-pointer"
            >
              <Ticket className="w-4 h-4 stroke-[2.5]" />
              <span>{isRegistering ? 'Регистрация...' : 'Зарегистрироваться'}</span>
            </button>
          </form>
        </div>

        {/* Right column: Generated Boarding Pass Preview */}
        <div className="lg:col-span-7 flex flex-col items-center">
          {currentPass ? (
            <div className="w-full max-w-xl animate-fadeIn">
              {/* Pass Action bar */}
              <div className="flex items-center justify-between mb-3 px-2">
                <span className="text-xs font-mono uppercase tracking-wider text-[#FFCC00] font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Посадочный талон сформирован
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={copyTicketDetails}
                    className="flex items-center gap-1.5 px-3 py-1 text-xs font-mono text-slate-300 hover:text-white bg-white/5 border border-white/10 rounded hover:border-[#FFCC00]/40 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Скопировано' : 'Копировать'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 px-3 py-1 text-xs font-mono text-[#05164D] bg-[#FFCC00] hover:bg-[#FFE066] rounded font-semibold transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Печать</span>
                  </button>
                </div>
              </div>

              {/* Realistic High-Fidelity Lufthansa Boarding Pass */}
              <div className="rounded-2xl bg-[#030e33] border border-white/20 shadow-2xl overflow-hidden text-slate-100 font-sans print:bg-white print:text-black">
                {/* Header ribbon */}
                <div className="bg-[#05164D] p-5 border-b border-[#FFCC00]/40 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#030e33] border border-[#FFCC00] flex items-center justify-center p-1.5">
                      <svg viewBox="0 0 100 100" className="w-full h-full text-[#FFCC00] fill-current">
                        <path d="M78 28 C68 28, 52 38, 40 47 C32 53, 24 60, 16 63 C25 61, 35 56, 44 50 C55 43, 67 36, 80 34 C76 40, 71 47, 65 54 C58 62, 50 71, 38 78 C52 72, 65 62, 74 50 C80 42, 85 34, 86 28 C84 28, 81 28, 78 28 Z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xl font-extrabold tracking-[0.2em] text-white uppercase">
                        LUFTHANSA
                      </div>
                      <div className="text-[10px] font-mono tracking-widest text-[#FFCC00] uppercase">
                        PTFS BOARDING PASS / ПОСАДОЧНЫЙ ТАЛОН
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] font-mono font-bold bg-[#FFCC00] text-[#05164D] px-2.5 py-1 rounded">
                      {currentPass.cabinClass}
                    </span>
                    <div className="text-[10px] font-mono text-slate-400 mt-1">
                      {currentPass.sequence}
                    </div>
                  </div>
                </div>

                {/* Main Pass Information */}
                <div className="p-6">
                  {/* Passenger & Flight Details */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pb-5 border-b border-white/10">
                    <div>
                      <div className="text-[10px] font-mono uppercase text-slate-400">Пассажир / Passenger</div>
                      <div className="text-base font-bold text-white font-mono truncate">{currentPass.passengerNickname}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-mono uppercase text-slate-400">Рейс / Flight</div>
                      <div className="text-base font-bold text-[#FFCC00] font-mono">{currentPass.flightNumber}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-mono uppercase text-slate-400">Дата / Date</div>
                      <div className="text-base font-semibold text-white font-mono">{currentPass.issueDate}</div>
                    </div>
                  </div>

                  {/* Route Big Display */}
                  <div className="py-6 flex items-center justify-between border-b border-white/10">
                    <div>
                      <div className="text-4xl font-extrabold font-mono text-white">{currentPass.originIata}</div>
                      <div className="text-xs text-slate-300 font-medium">{currentPass.originCity}</div>
                    </div>

                    <div className="flex flex-col items-center px-4 flex-1 max-w-[200px]">
                      <span className="text-[10px] font-mono text-slate-400 mb-1">PTFS DIRECT</span>
                      <div className="w-full flex items-center gap-1">
                        <div className="h-[2px] flex-1 bg-white/20" />
                        <div className="w-2.5 h-2.5 rounded-full bg-[#FFCC00]" />
                        <div className="h-[2px] flex-1 bg-white/20" />
                      </div>
                      <span className="text-[10px] font-mono text-[#FFCC00] mt-1">NON-STOP</span>
                    </div>

                    <div className="text-right">
                      <div className="text-4xl font-extrabold font-mono text-white">{currentPass.destinationIata}</div>
                      <div className="text-xs text-slate-300 font-medium">{currentPass.destinationCity}</div>
                    </div>
                  </div>

                  {/* Key Boarding Stats */}
                  <div className="grid grid-cols-4 gap-3 py-5 text-center border-b border-white/10 bg-white/[0.02] rounded-xl my-4">
                    <div className="p-2 border-r border-white/10">
                      <div className="text-[10px] font-mono uppercase text-slate-400">Посадка / Board</div>
                      <div className="text-xl font-bold font-mono text-[#FFCC00] mt-0.5">{currentPass.boardingTime}</div>
                    </div>
                    <div className="p-2 border-r border-white/10">
                      <div className="text-[10px] font-mono uppercase text-slate-400">Вылет / Dep</div>
                      <div className="text-xl font-bold font-mono text-white mt-0.5">{currentPass.departureTime}</div>
                    </div>
                    <div className="p-2 border-r border-white/10">
                      <div className="text-[10px] font-mono uppercase text-slate-400">Гейт / Gate</div>
                      <div className="text-xl font-bold font-mono text-white mt-0.5">{currentPass.gate}</div>
                    </div>
                    <div className="p-2">
                      <div className="text-[10px] font-mono uppercase text-slate-400">Место / Seat</div>
                      <div className="text-xl font-bold font-mono text-[#FFCC00] mt-0.5">{currentPass.seat}</div>
                    </div>
                  </div>

                  {/* Barcode & Mock QR Code Footer */}
                  <div className="pt-3 flex items-center justify-between gap-4">
                    {/* SVG Vector Barcode */}
                    <div className="flex-1 overflow-hidden">
                      <div className="text-[9px] font-mono text-slate-400 mb-1">
                        ETKT: {currentPass.ticketNumber} • {currentPass.id}
                      </div>
                      <svg className="w-full h-11 text-white opacity-85" preserveAspectRatio="none" viewBox="0 0 200 40">
                        {Array.from({ length: 48 }).map((_, i) => {
                          const w = (i % 3 === 0 ? 3 : i % 2 === 0 ? 2 : 1);
                          return (
                            <rect
                              key={i}
                              x={i * 4.1}
                              y="0"
                              width={w}
                              height="40"
                              fill="currentColor"
                            />
                          );
                        })}
                      </svg>
                    </div>

                    {/* SVG Vector Mock QR Code */}
                    <div className="w-16 h-16 p-1.5 bg-white rounded-lg flex items-center justify-center shrink-0">
                      <svg viewBox="0 0 40 40" className="w-full h-full text-[#05164D] fill-current">
                        {/* Realistic QR Pattern */}
                        <rect x="2" y="2" width="10" height="10" fill="currentColor" />
                        <rect x="4" y="4" width="6" height="6" fill="white" />
                        <rect x="5" y="5" width="4" height="4" fill="currentColor" />
                        <rect x="28" y="2" width="10" height="10" fill="currentColor" />
                        <rect x="30" y="4" width="6" height="6" fill="white" />
                        <rect x="31" y="5" width="4" height="4" fill="currentColor" />
                        <rect x="2" y="28" width="10" height="10" fill="currentColor" />
                        <rect x="4" y="30" width="6" height="6" fill="white" />
                        <rect x="5" y="31" width="4" height="4" fill="currentColor" />
                        {/* Data dots */}
                        <rect x="16" y="4" width="3" height="3" />
                        <rect x="22" y="4" width="3" height="3" />
                        <rect x="16" y="10" width="3" height="3" />
                        <rect x="20" y="16" width="4" height="4" />
                        <rect x="28" y="18" width="4" height="3" />
                        <rect x="16" y="26" width="3" height="4" />
                        <rect x="24" y="28" width="4" height="4" />
                        <rect x="32" y="30" width="5" height="5" />
                        <rect x="20" y="34" width="4" height="3" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full h-full min-h-[420px] rounded-2xl bg-white/[0.02] border border-dashed border-white/15 flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 mb-4">
                <Ticket className="w-8 h-8 text-[#FFCC00]/60" />
              </div>
              <h4 className="text-lg font-bold text-white uppercase tracking-wider">
                Посадочный талон не сформирован
              </h4>
              <p className="mt-2 text-xs text-slate-400 max-w-sm">
                Заполните форму слева, выберите рейс и нажмите «Зарегистрироваться», чтобы получить электронный посадочный талон Lufthansa PTFS.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
