import React, { useState } from 'react';
import {
  X,
  Compass,
  MapPin,
  Clock,
  ArrowRight,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Edit3,
} from 'lucide-react';
import { Flight, SavedRoute } from '../types';
import { calculateHeading } from '../utils/mapLogic';

interface FlightRouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  flight: Flight | null;
  route: SavedRoute | null;
  onEditInPlanner: (flight: Flight, route: SavedRoute | null) => void;
}

export const FlightRouteModal: React.FC<FlightRouteModalProps> = ({
  isOpen,
  onClose,
  flight,
  route,
  onEditInPlanner,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  if (!isOpen || !flight) return null;

  const waypoints = route?.waypoints || [];

  // Generate SVG path for waypoints
  const pathD =
    waypoints.length >= 2
      ? waypoints.reduce((acc, pt, i) => {
          return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
        }, '')
      : '';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="route-modal-title"
    >
      <div className="relative w-full max-w-5xl bg-[#030e33] border border-white/20 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 bg-[#05164D] border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-[#FFCC00]/40 flex items-center justify-center text-[#FFCC00]">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-xs bg-[#FFCC00] text-[#05164D] px-2 py-0.5 rounded">
                  {flight.flightNumber}
                </span>
                <h2
                  id="route-modal-title"
                  className="text-sm sm:text-base font-bold text-white tracking-wide uppercase font-sans truncate"
                >
                  План полета: {flight.originCity} ({flight.originIata}) → {flight.destinationCity} ({flight.destinationIata})
                </h2>
              </div>
              <p className="text-[10px] sm:text-[11px] font-mono text-[#FFCC00] mt-0.5">
                {route ? route.name : 'Маршрут не назначен — кликните «Изменить в планировщике»'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть окно маршрута"
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Flight & Navigation Stats Header */}
        <div className="bg-[#020B27] px-5 py-3 border-b border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div>
            <span className="text-[10px] text-slate-400 uppercase block">Дистанция</span>
            <span className="text-white font-bold text-sm">
              {route ? `${route.totalDistanceNm} NM` : '—'}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase block">Время полета</span>
            <span className="text-white font-bold text-sm">
              {route ? `~${route.estFlightTimeMin} мин` : '—'}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase block">Воздушное судно</span>
            <span className="text-[#FFCC00] font-bold text-xs truncate block">
              {flight.aircraft}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase block">Вылет (МСК)</span>
            <span className="text-white font-bold text-sm">
              {flight.departureTime} МСК • Гейт {flight.gate}
            </span>
          </div>
        </div>

        {/* Main Content: Map Viewport + Nav Log */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Map Viewer */}
          <div className="relative w-full aspect-[1280/960] rounded-xl overflow-hidden border border-white/15 bg-[#02091f] shadow-inner">
            {/* Zoom Controls Overlay */}
            <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-[#020B27]/90 rounded-lg p-1 border border-white/10">
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(0.9, z - 0.2))}
                title="Отдалить"
                className="p-1 text-slate-400 hover:text-white rounded"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] text-slate-300 font-mono px-1">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(2.0, z + 0.2))}
                title="Приблизить"
                className="p-1 text-slate-400 hover:text-white rounded"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel(1)}
                title="Сброс масштаба"
                className="p-1 text-slate-400 hover:text-[#FFCC00] rounded"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div
              className="w-full h-full transition-transform duration-200 origin-top-left"
              style={{
                transform: `scale(${zoomLevel})`,
                width: `${100 * zoomLevel}%`,
              }}
            >
              <svg
                viewBox="0 0 1280 960"
                className="w-full h-full block"
                preserveAspectRatio="xMidYMid meet"
              >
                <defs>
                  <filter id="savedRouteGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                  <marker
                    id="routeArrow"
                    viewBox="0 0 10 10"
                    refX="7"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1 L 9 5 L 0 9 z" fill="#FFCC00" />
                  </marker>
                </defs>

                {/* 1. Aeronautical Chart Background */}
                <image
                  href="/assets/aistudio/image_d4f9ff20.png"
                  width="1280"
                  height="960"
                  preserveAspectRatio="xMidYMid slice"
                />

                {/* Subtle dark tint */}
                <rect width="1280" height="960" fill="#05164D" opacity="0.1" pointerEvents="none" />

                {/* 2. Route Path Lines */}
                {pathD && (
                  <>
                    <path
                      d={pathD}
                      fill="none"
                      stroke="#FFCC00"
                      strokeWidth="6"
                      strokeOpacity="0.45"
                      filter="url(#savedRouteGlow)"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d={pathD}
                      fill="none"
                      stroke="#FFCC00"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeDasharray="12 6"
                      markerMid="url(#routeArrow)"
                      markerEnd="url(#routeArrow)"
                    />
                  </>
                )}

                {/* 3. Waypoint Points with Sequence Badges */}
                {waypoints.map((wp, idx) => (
                  <g key={`${wp.id}-${idx}`} transform={`translate(${wp.x}, ${wp.y})`}>
                    <circle r="12" fill="rgba(255, 204, 0, 0.25)" stroke="#FFCC00" strokeWidth="2" />
                    <circle r="5" fill="#FFCC00" />
                    <g transform="translate(8, -20)">
                      <rect width="22" height="16" rx="4" fill="#FFCC00" stroke="#05164D" strokeWidth="1" />
                      <text
                        x="11"
                        y="12"
                        fill="#05164D"
                        fontSize="10"
                        fontWeight="900"
                        textAnchor="middle"
                        fontFamily="monospace"
                      >
                        {idx + 1}
                      </text>
                    </g>
                    <text
                      x="0"
                      y="26"
                      fill="#ffffff"
                      fontSize="12"
                      fontWeight="bold"
                      textAnchor="middle"
                      fontFamily="monospace"
                      filter="drop-shadow(0px 1px 3px rgba(0,0,0,0.9))"
                    >
                      {wp.code}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </div>

          {/* Navigation Log (Leg Details) */}
          <div className="rounded-xl bg-[#020B27] border border-white/10 overflow-hidden">
            <div className="px-4 py-2.5 bg-[#04113B] border-b border-white/10 flex items-center justify-between text-xs font-mono">
              <span className="font-bold text-white uppercase">
                Навигационный журнал полета (PTFS Nav Log)
              </span>
              <span className="text-[#FFCC00]">
                {waypoints.length} контрольных точек маршрута
              </span>
            </div>

            {waypoints.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 font-mono">
                Для данного рейса еще не задан маршрут. Нажмите кнопку ниже для перехода в планировщик.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs font-mono">
                  <thead>
                    <tr className="bg-white/[0.02] text-[10px] text-slate-400 uppercase border-b border-white/5">
                      <th className="py-2.5 px-4">Этап</th>
                      <th className="py-2.5 px-4">Код точки</th>
                      <th className="py-2.5 px-4">Наименование</th>
                      <th className="py-2.5 px-4">Тип</th>
                      <th className="py-2.5 px-4">Частота / Данные</th>
                      <th className="py-2.5 px-4 text-right">Курс на след. точку</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {waypoints.map((wp, i) => {
                      const nextWp = waypoints[i + 1];
                      const heading = nextWp ? calculateHeading(wp, nextWp) : null;

                      return (
                        <tr key={i} className="hover:bg-white/[0.02]">
                          <td className="py-2.5 px-4">
                            <span className="w-5 h-5 rounded bg-[#FFCC00] text-[#05164D] font-bold text-[10px] inline-flex items-center justify-center">
                              {i + 1}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 font-bold text-[#FFCC00]">{wp.code}</td>
                          <td className="py-2.5 px-4 text-white">{wp.name}</td>
                          <td className="py-2.5 px-4 text-slate-300">{wp.type}</td>
                          <td className="py-2.5 px-4 text-slate-400">{wp.freq || '—'}</td>
                          <td className="py-2.5 px-4 text-right text-slate-200">
                            {heading !== null ? `${heading}° MAG` : 'Финал маршрута'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#05164D] border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[11px] font-mono text-slate-300 text-center sm:text-left">
            Маршрут синхронизирован с расписанием PTFS Dispatcher.
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 sm:w-auto px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-mono transition-colors cursor-pointer"
            >
              Закрыть
            </button>

            <button
              type="button"
              onClick={() => onEditInPlanner(flight, route)}
              className="w-1/2 sm:w-auto px-5 py-2 rounded-lg bg-[#FFCC00] hover:bg-[#FFE066] text-[#05164D] font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Изменить в планировщике</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
