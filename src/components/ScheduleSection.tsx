import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Filter,
  RefreshCw,
  MapPin,
  Bell,
  Compass,
  ArrowRight,
  Shield,
  Layers,
} from 'lucide-react';
import { Flight, FlightStatus, SavedRoute } from '../types';
import { getFlights, getFlightRoutes } from '../utils/storage';
import { FlightRouteModal } from './FlightRouteModal';
import { FlightAlertModal } from './FlightAlertModal';

export const ScheduleSection: React.FC = () => {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [flightRoutes, setFlightRoutes] = useState<Record<string, SavedRoute>>({});
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [moscowTime, setMoscowTime] = useState<string>('');
  const [utcTime, setUtcTime] = useState<string>('');
  const [flipping, setFlipping] = useState(false);

  // Modals
  const [selectedFlightForRoute, setSelectedFlightForRoute] = useState<Flight | null>(null);
  const [selectedRouteForView, setSelectedRouteForView] = useState<SavedRoute | null>(null);
  const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);

  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [alertFlightNumber, setAlertFlightNumber] = useState<string | undefined>(undefined);

  const loadData = () => {
    setFlights(getFlights());
    setFlightRoutes(getFlightRoutes());
  };

  useEffect(() => {
    loadData();

    const handleFlightUpdate = () => loadData();
    window.addEventListener('lh_flights_updated', handleFlightUpdate);
    window.addEventListener('lh_flight_routes_updated', handleFlightUpdate);
    window.addEventListener('lh_routes_updated', handleFlightUpdate);

    // Live Clock with Moscow Time (MSK / UTC+3) and UTC
    const updateTime = () => {
      const now = new Date();
      // Format Moscow time (UTC + 3 hours)
      const mskTime = new Intl.DateTimeFormat('ru-RU', {
        timeZone: 'Europe/Moscow',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }).format(now);
      setMoscowTime(`${mskTime} МСК (MSK)`);

      const hUtc = String(now.getUTCHours()).padStart(2, '0');
      const mUtc = String(now.getUTCMinutes()).padStart(2, '0');
      const sUtc = String(now.getUTCSeconds()).padStart(2, '0');
      setUtcTime(`${hUtc}:${mUtc}:${sUtc} UTC`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => {
      clearInterval(interval);
      window.removeEventListener('lh_flights_updated', handleFlightUpdate);
      window.removeEventListener('lh_flight_routes_updated', handleFlightUpdate);
      window.removeEventListener('lh_routes_updated', handleFlightUpdate);
    };
  }, []);

  const triggerFlipRefresh = () => {
    setFlipping(true);
    loadData();
    setTimeout(() => setFlipping(false), 500);
  };

  const handleOpenRoute = (flight: Flight) => {
    const route = flightRoutes[flight.flightNumber] || null;
    setSelectedFlightForRoute(flight);
    setSelectedRouteForView(route);
    setIsRouteModalOpen(true);
  };

  const handleEditInPlanner = (flight: Flight, route: SavedRoute | null) => {
    setIsRouteModalOpen(false);
    // Dispatch custom event to MapPlannerSection
    window.dispatchEvent(
      new CustomEvent('lh_edit_route_in_planner', {
        detail: {
          flightNumber: flight.flightNumber,
          name: route?.name || `Маршрут ${flight.flightNumber}: ${flight.originCity} — ${flight.destinationCity}`,
          waypoints: route?.waypoints,
        },
      })
    );

    const el = document.querySelector('#planner');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenAlert = (flightNumber?: string) => {
    setAlertFlightNumber(flightNumber);
    setIsAlertModalOpen(true);
  };

  const filteredFlights = flights.filter((flight) => {
    if (filterStatus === 'ALL') return true;
    return flight.status === filterStatus;
  });

  const getStatusBadge = (status: FlightStatus) => {
    switch (status) {
      case 'ON_TIME':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/15 text-[#FFCC00] border border-[#FFCC00]/40 font-mono text-[11px] font-bold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FFCC00]" />
            ON TIME
          </span>
        );
      case 'BOARDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-mono text-[11px] font-bold uppercase tracking-wider animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            BOARDING
          </span>
        );
      case 'DELAYED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-500/20 text-rose-400 border border-rose-500/40 font-mono text-[11px] font-bold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            DELAYED
          </span>
        );
      case 'DEPARTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-500/20 text-slate-400 border border-slate-500/40 font-mono text-[11px] font-bold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            DEPARTED
          </span>
        );
    }
  };

  return (
    <section id="schedule" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
      <div className="flex flex-col items-center text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-3">
          <Calendar className="w-3.5 h-3.5 text-[#FFCC00]" />
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-300">
            Официальное расписание PTFS
          </span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight uppercase font-sans">
          Расписание <span className="text-[#FFCC00]">будущих рейсов</span>
        </h2>
        <p className="mt-3 text-sm sm:text-base text-slate-300 max-w-2xl">
          Онлайн-табло вылетов виртуальной авиакомпании Lufthansa. Время отправления приведено по Московскому времени (МСК). Слева от каждого рейса доступен интерактивный план полета на карте.
        </p>
      </div>

      {/* Airport Board Frame */}
      <div className="rounded-2xl bg-[#030c2c] border border-white/15 backdrop-blur-xl shadow-2xl overflow-hidden">
        {/* Top Board Bar with Hub & Moscow Time Clock */}
        <div className="bg-[#05164D] px-6 py-4 border-b border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
            <div>
              <div className="text-sm font-bold uppercase tracking-[0.18em] text-white font-mono">
                DEPARTURES / ОТДЕЛ ВЫЛЕТОВ
              </div>
              <div className="text-[10px] font-mono text-[#FFCC00] uppercase tracking-wider">
                HUB: FRA • MUC • BER • PTFS NETWORK
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end flex-wrap">
            {/* Prominent Moscow Time Clock */}
            <div className="flex items-center gap-2 bg-[#020B27] px-3.5 py-1.5 rounded-lg border border-white/15 font-mono text-xs text-[#FFCC00]">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-bold">{moscowTime || '18:00:00 МСК'}</span>
              <span className="text-[10px] text-slate-400 pl-1 border-l border-white/10 hidden md:inline">
                {utcTime}
              </span>
            </div>

            {/* Flight Alert Center Trigger Button */}
            <button
              type="button"
              onClick={() => handleOpenAlert()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-[#FFCC00] text-slate-200 hover:text-[#05164D] border border-white/10 hover:border-[#FFCC00] text-xs font-mono font-semibold transition-all cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Оповещения</span>
            </button>

            <button
              type="button"
              onClick={triggerFlipRefresh}
              title="Обновить табло"
              className="p-2 text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${flipping ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="px-6 py-3 bg-[#020B27]/70 border-b border-white/10 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-mono text-[11px] mr-2 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Фильтр:
          </span>
          {[
            { id: 'ALL', label: 'Все рейсы' },
            { id: 'ON_TIME', label: 'On Time' },
            { id: 'BOARDING', label: 'Boarding' },
            { id: 'DELAYED', label: 'Delayed' },
            { id: 'DEPARTED', label: 'Departed' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setFilterStatus(tab.id);
                triggerFlipRefresh();
              }}
              className={`px-3 py-1 rounded text-xs font-mono transition-all cursor-pointer ${
                filterStatus === tab.id
                  ? 'bg-[#FFCC00] text-[#05164D] font-bold shadow-sm'
                  : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Split-Flap Board Table with Leftmost Route Button */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#04113B] text-[10px] font-mono text-slate-400 uppercase tracking-widest border-b border-white/10">
                {/* 1. Left of Flight: Route Plan Button */}
                <th className="py-3 px-5 text-center">План полета</th>
                <th className="py-3 px-6">Рейс / Flight</th>
                <th className="py-3 px-6">Направление / Destination</th>
                <th className="py-3 px-6">Вылет (МСК)</th>
                <th className="py-3 px-6">Гейт / Gate</th>
                <th className="py-3 px-6">Воздушное судно / Aircraft</th>
                <th className="py-3 px-4 text-center">Оповещение</th>
                <th className="py-3 px-6 text-right">Статус / Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono text-xs">
              {filteredFlights.map((flight, index) => {
                const hasRoute = Boolean(flightRoutes[flight.flightNumber]);

                return (
                  <tr
                    key={flight.id}
                    className={`hover:bg-white/[0.03] transition-colors ${
                      flipping ? 'opacity-50 transform scale-[0.99]' : 'opacity-100'
                    }`}
                    style={{
                      transition: 'all 200ms ease',
                      transitionDelay: `${index * 25}ms`,
                    }}
                  >
                    {/* 1. Leftmost Column: View Route Button on Map */}
                    <td className="py-4 px-5 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleOpenRoute(flight)}
                        title={
                          hasRoute
                            ? `Открыть сохраненный маршрут для ${flight.flightNumber}`
                            : `Задать маршрут для ${flight.flightNumber} в планировщике`
                        }
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                          hasRoute
                            ? 'bg-[#FFCC00] text-[#05164D] font-bold shadow-md hover:bg-[#FFE066]'
                            : 'bg-white/5 text-slate-300 hover:text-white border border-white/10 hover:border-[#FFCC00]/50'
                        }`}
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{hasRoute ? 'Маршрут' : 'Задать'}</span>
                      </button>
                    </td>

                    {/* Flight Number */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className="font-bold text-[#FFCC00] tracking-wider bg-[#020B27] px-2 py-1 rounded border border-white/10">
                        {flight.flightNumber}
                      </span>
                    </td>

                    {/* Destination */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-bold">{flight.destinationCity}</span>
                        <span className="text-[11px] text-slate-400 bg-white/5 px-1.5 py-0.5 rounded">
                          {flight.destinationIata}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-sans mt-0.5">
                        Из: {flight.originCity} ({flight.originIata})
                      </div>
                    </td>

                    {/* Departure Time in Moscow Time (МСК) */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="text-white font-semibold flex items-center gap-1">
                        <span>{flight.departureTime}</span>
                        <span className="text-[10px] font-mono text-[#FFCC00]">МСК</span>
                      </div>
                    </td>

                    {/* Gate */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-white/5 text-slate-200 border border-white/10 font-bold">
                        {flight.gate}
                      </span>
                      <span className="text-[10px] text-slate-400 ml-1.5">{flight.terminal}</span>
                    </td>

                    {/* Aircraft */}
                    <td className="py-4 px-6 whitespace-nowrap text-slate-300 font-sans text-xs">
                      {flight.aircraft}
                    </td>

                    {/* Notification Subscription Trigger */}
                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleOpenAlert(flight.flightNumber)}
                        title={`Включить оповещение для ${flight.flightNumber}`}
                        className="p-1.5 text-slate-400 hover:text-[#FFCC00] bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors cursor-pointer"
                      >
                        <Bell className="w-3.5 h-3.5" />
                      </button>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6 whitespace-nowrap text-right">
                      {getStatusBadge(flight.status)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Board Footer with MSK time indicator */}
        <div className="bg-[#020B27] px-6 py-3 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-slate-400 gap-2">
          <span>СИНХРОНИЗИРОВАНО С ОТДЕЛОМ ВЫЛЕТОВ PTFS DISPATCH</span>
          <span className="text-slate-300">
            Расписание обновляется по Московскому времени (МСК / UTC+3)
          </span>
        </div>
      </div>

      {/* Flight Route Viewer Modal */}
      <FlightRouteModal
        isOpen={isRouteModalOpen}
        onClose={() => setIsRouteModalOpen(false)}
        flight={selectedFlightForRoute}
        route={selectedRouteForView}
        onEditInPlanner={handleEditInPlanner}
      />

      {/* Flight Alert Modal */}
      <FlightAlertModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        initialFlightNumber={alertFlightNumber}
      />
    </section>
  );
};
