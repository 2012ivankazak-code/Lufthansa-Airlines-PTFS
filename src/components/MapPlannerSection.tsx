import React, { useState, useRef, useEffect } from 'react';
import {
  Compass,
  MapPin,
  Trash2,
  Save,
  RotateCcw,
  Check,
  FolderOpen,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Navigation,
  Lock,
  Unlock,
  KeyRound,
  Plane,
  AlertCircle,
  Link as LinkIcon,
  X,
} from 'lucide-react';
import { RouteWaypoint, SavedRoute, Flight } from '../types';
import {
  getSavedRoutes,
  saveRoute,
  deleteSavedRoute,
  getFlights,
  saveRouteForFlight,
  isPlannerUnlocked,
  setPlannerUnlocked,
} from '../utils/storage';
import {
  calculateRouteDistance,
  calculateFlightTimeMin,
  validatePlannerKey,
} from '../utils/mapLogic';
import { PTFS_WAYPOINTS } from '../data/ptfsWaypoints';

export const MapPlannerSection: React.FC = () => {
  // Authorization state: requires key 'key-plan'
  const [unlocked, setUnlocked] = useState<boolean>(false);
  const [keyInput, setKeyInput] = useState('');
  const [keyError, setKeyError] = useState('');

  // Active planning route
  const [activeWaypoints, setActiveWaypoints] = useState<RouteWaypoint[]>([
    PTFS_WAYPOINTS.find((w) => w.code === 'PER') || PTFS_WAYPOINTS[0],
    PTFS_WAYPOINTS.find((w) => w.code === 'SHV') || PTFS_WAYPOINTS[1],
  ]);
  const [routeName, setRouteName] = useState('PTFS: Perth Oceanic Departure');
  const [savedRoutes, setSavedRoutes] = useState<SavedRoute[]>([]);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [showSavedList, setShowSavedList] = useState(false);
  const [hoveredWaypoint, setHoveredWaypoint] = useState<RouteWaypoint | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [filterType, setFilterType] = useState<'ALL' | 'VOR' | 'AIRPORT' | 'FIX'>('ALL');

  // Modal for binding route to a flight in the schedule
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [selectedFlightForSave, setSelectedFlightForSave] = useState<string>('LH 1042');
  const [saveSuccessNotification, setSaveSuccessNotification] = useState<string | null>(null);

  const svgRef = useRef<SVGSVGElement | null>(null);

  const loadData = () => {
    setSavedRoutes(getSavedRoutes());
    setFlights(getFlights());
    setUnlocked(isPlannerUnlocked());
  };

  // Pending route waiting for authentication
  const [pendingFlightEdit, setPendingFlightEdit] = useState<{
    flightNumber?: string;
    name?: string;
    waypoints?: RouteWaypoint[];
  } | null>(null);

  const applyPendingEdit = (edit: { flightNumber?: string; name?: string; waypoints?: RouteWaypoint[] }) => {
    if (edit.waypoints && edit.waypoints.length > 0) {
      setActiveWaypoints(edit.waypoints);
    }
    if (edit.name) {
      setRouteName(edit.name);
    }
    if (edit.flightNumber) {
      setSelectedFlightForSave(edit.flightNumber);
    }
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('lh_routes_updated', handleUpdate);
    window.addEventListener('lh_flight_routes_updated', handleUpdate);
    window.addEventListener('lh_planner_auth_changed', handleUpdate);
    window.addEventListener('lh_edit_route_in_planner', (e: Event) => {
      const customEvent = e as CustomEvent<{ waypoints?: RouteWaypoint[]; name?: string; flightNumber?: string }>;
      if (customEvent.detail) {
        const currentlyUnlocked = isPlannerUnlocked();
        if (currentlyUnlocked) {
          applyPendingEdit(customEvent.detail);
          setUnlocked(true);
        } else {
          // DO NOT auto-unlock for unauthorized users! Store pending edit and keep locked!
          setPendingFlightEdit(customEvent.detail);
          setUnlocked(false);
        }
      }
    });

    return () => {
      window.removeEventListener('lh_routes_updated', handleUpdate);
      window.removeEventListener('lh_flight_routes_updated', handleUpdate);
      window.removeEventListener('lh_planner_auth_changed', handleUpdate);
    };
  }, []);

  const handleUnlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validatePlannerKey(keyInput)) {
      setUnlocked(true);
      setPlannerUnlocked(true);
      setKeyError('');
      setKeyInput('');
      if (pendingFlightEdit) {
        applyPendingEdit(pendingFlightEdit);
        setPendingFlightEdit(null);
      }
    } else {
      setKeyError('Неверный ключ доступа. Введите служебный ключ диспетчера.');
    }
  };

  const handleLockPlanner = () => {
    setUnlocked(false);
    setPlannerUnlocked(false);
  };

  const totalDistanceNm = React.useMemo(() => {
    return calculateRouteDistance(activeWaypoints);
  }, [activeWaypoints]);

  const estTimeMin = calculateFlightTimeMin(totalDistanceNm);

  // Responsive and exact click coordinate calculation on the 1280x960 PTFS chart
  const handleMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const rawX = ((e.clientX - rect.left) / rect.width) * 1280;
    const rawY = ((e.clientY - rect.top) / rect.height) * 960;
    const x = Math.round(rawX);
    const y = Math.round(rawY);

    // Magnetic snap: if clicked within 26px of any known waypoint on the chart
    const nearest = PTFS_WAYPOINTS.find((wp) => {
      const d = Math.sqrt((wp.x - x) ** 2 + (wp.y - y) ** 2);
      return d < 26;
    });

    if (nearest) {
      addWaypoint(nearest);
    } else {
      const customNum = activeWaypoints.length + 1;
      const customPoint: RouteWaypoint = {
        id: `custom-${Date.now()}-${customNum}`,
        code: `FIX${customNum}`,
        name: `RNAV Waypoint ${customNum} (${x}, ${y})`,
        type: 'FIX',
        x,
        y,
      };
      addWaypoint(customPoint);
    }
  };

  const addWaypoint = (wp: RouteWaypoint) => {
    setActiveWaypoints((prev) => [...prev, wp]);
  };

  const removeWaypoint = (index: number) => {
    setActiveWaypoints((prev) => prev.filter((_, i) => i !== index));
  };

  const clearRoute = () => {
    setActiveWaypoints([]);
  };

  // Open Save Modal to choose flight from Schedule (Отдел вылетов)
  const openSaveModal = () => {
    if (activeWaypoints.length < 2) return;
    setIsSaveModalOpen(true);
  };

  // Confirm save and bind to flight
  const handleConfirmSaveToSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeWaypoints.length < 2) return;

    const finalName =
      routeName.trim() ||
      `Маршрут ${selectedFlightForSave}: ${activeWaypoints[0]?.code} → ${activeWaypoints[activeWaypoints.length - 1]?.code}`;

    const newRoute: SavedRoute = {
      id: `ptfs-route-${Date.now()}`,
      name: finalName,
      flightNumber: selectedFlightForSave,
      waypoints: activeWaypoints,
      totalDistanceNm,
      estFlightTimeMin: estTimeMin,
      createdAt: new Date().toISOString(),
    };

    // Save in general route library and link to chosen flight in schedule
    saveRoute(newRoute);
    if (selectedFlightForSave) {
      saveRouteForFlight(selectedFlightForSave, newRoute);
    }

    setIsSaveModalOpen(false);
    setSaveSuccessNotification(
      `Маршрут успешно сохранен и привязан к рейсу ${selectedFlightForSave} в расписании!`
    );
    setTimeout(() => setSaveSuccessNotification(null), 3500);
  };

  const handleLoadRoute = (r: SavedRoute) => {
    setActiveWaypoints(r.waypoints);
    setRouteName(r.name);
    if (r.flightNumber) {
      setSelectedFlightForSave(r.flightNumber);
    }
    setShowSavedList(false);
  };

  const handleDeleteRoute = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteSavedRoute(id);
  };

  // Build SVG Path string connecting active waypoints
  const routePathD = React.useMemo(() => {
    if (activeWaypoints.length < 2) return '';
    return activeWaypoints.reduce((acc, pt, i) => {
      return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
    }, '');
  }, [activeWaypoints]);

  const displayedWaypoints = PTFS_WAYPOINTS.filter((w) => {
    if (filterType === 'ALL') return true;
    if (filterType === 'VOR') return w.type === 'VOR' || w.type === 'VORTAC';
    if (filterType === 'AIRPORT') return w.type === 'AIRPORT';
    if (filterType === 'FIX') return w.type === 'FIX';
    return true;
  });

  return (
    <section id="planner" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10 font-sans">
      {/* Section Header */}
      <div className="flex flex-col items-center text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 mb-3 shadow-sm">
          <Compass className="w-3.5 h-3.5 text-[#FFCC00]" />
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-300">
            Официальная радионавигационная карта PTFS
          </span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight uppercase font-sans">
          Планирование полета <span className="text-[#FFCC00]">(Map Planner)</span>
        </h2>
        <p className="mt-3 text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
          Используйте официальную радионавигационную карту Roblox PTFS. Кликайте по маякам VOR (PER, HME, RFD), точкам FIX (SHV) или любой позиции для построения маршрута и сохранения в отдел вылетов.
        </p>
      </div>

      {/* Security Barrier: Require key-plan */}
      {!unlocked ? (
        <div className="max-w-xl mx-auto p-8 rounded-2xl bg-[#030e33] border border-white/20 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-[#FFCC00]/40 flex items-center justify-center mx-auto text-[#FFCC00] shadow-[0_0_25px_rgba(255,204,0,0.15)]">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-xl font-bold text-white uppercase tracking-wider">
              Доступ к планировщику защищен
            </h3>
            {pendingFlightEdit ? (
              <p className="text-xs text-[#FFCC00] mt-2 font-mono">
                Для редактирования полетного плана {pendingFlightEdit.flightNumber ? `рейса ${pendingFlightEdit.flightNumber}` : ''} требуется авторизация. Введите служебный ключ диспетчера.
              </p>
            ) : (
              <p className="text-xs text-slate-300 mt-2 font-mono">
                Для входа в диспетчерский центр планирования маршрутов введите ключ допуска диспетчера.
              </p>
            )}
          </div>

          <form onSubmit={handleUnlockSubmit} className="space-y-4">
            <div>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#FFCC00]" />
                <input
                  type="password"
                  value={keyInput}
                  onChange={(e) => {
                    setKeyInput(e.target.value);
                    setKeyError('');
                  }}
                  placeholder="Введите ключ доступа..."
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-[#020B27] border border-white/20 text-white font-mono text-sm focus:outline-none focus:border-[#FFCC00] transition-colors"
                />
              </div>
              {keyError && (
                <div className="flex items-center gap-1.5 text-rose-400 text-xs font-mono mt-2 text-left">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{keyError}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-[#FFCC00] hover:bg-[#FFE066] text-[#05164D] font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(255,204,0,0.3)] flex items-center justify-center gap-2 cursor-pointer"
            >
              <Unlock className="w-4 h-4 stroke-[2.5]" />
              <span>Разблокировать планировщик</span>
            </button>
          </form>
        </div>
      ) : (
        /* Full Unlocked Map Planner Canvas */
        <>
          {/* Notification Toast when Route is Saved and Bound */}
          {saveSuccessNotification && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-mono text-xs flex items-center justify-between gap-3 animate-fadeIn shadow-xl">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                <span>{saveSuccessNotification}</span>
              </div>
              <a
                href="#schedule"
                className="text-white underline hover:text-[#FFCC00] text-[11px]"
              >
                Перейти в расписание →
              </a>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Interactive Map Column (8 cols) */}
            <div className="lg:col-span-8 flex flex-col space-y-3">
              {/* Chart Header Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-[#05164D] border border-white/15 rounded-t-xl text-xs font-mono shadow-md">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FFCC00] animate-pulse" />
                  <span className="font-bold text-white uppercase tracking-wider">
                    ROBLOX PTFS AERONAUTICAL CHART
                  </span>
                  <span className="text-slate-400 hidden sm:inline">• 1280 × 960 HD</span>
                </div>

                {/* Filter buttons, Zoom Controls & Lock Planner */}
                <div className="flex items-center gap-2">
                  <div className="hidden sm:flex items-center bg-[#020B27] rounded-lg p-0.5 border border-white/10 text-[10px]">
                    {(['ALL', 'VOR', 'AIRPORT', 'FIX'] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setFilterType(t)}
                        className={`px-2 py-0.5 rounded transition-all ${
                          filterType === t
                            ? 'bg-[#FFCC00] text-[#05164D] font-bold'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {t === 'ALL' ? 'Все точки' : t}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-1 bg-[#020B27] rounded-lg p-0.5 border border-white/10">
                    <button
                      type="button"
                      onClick={() => setZoomLevel((z) => Math.max(0.9, z - 0.15))}
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
                      onClick={() => setZoomLevel((z) => Math.min(1.8, z + 0.15))}
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

                  <button
                    type="button"
                    onClick={handleLockPlanner}
                    title="Заблокировать планировщик"
                    className="p-1.5 text-slate-400 hover:text-rose-400 bg-[#020B27] border border-white/10 rounded-lg"
                  >
                    <Lock className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Map Viewport Container */}
              <div className="relative w-full aspect-[1280/960] rounded-b-xl overflow-auto border border-white/15 bg-[#02091f] shadow-2xl select-none group">
                <div
                  className="w-full h-full transition-transform duration-200 origin-top-left"
                  style={{
                    transform: `scale(${zoomLevel})`,
                    width: `${100 * zoomLevel}%`,
                  }}
                >
                  <svg
                    ref={svgRef}
                    viewBox="0 0 1280 960"
                    className="w-full h-full cursor-crosshair block"
                    onClick={handleMapClick}
                    preserveAspectRatio="xMidYMid meet"
                  >
                    <defs>
                      <filter id="ptfsRouteGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="4.5" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                      <marker
                        id="flightArrow"
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

                    {/* 1. Real Uploaded PTFS Aeronautical Map Chart Background */}
                    <image
                      href="/assets/aistudio/image_d4f9ff20.png"
                      width="1280"
                      height="960"
                      preserveAspectRatio="xMidYMid slice"
                    />

                    {/* Subtle dark tint */}
                    <rect width="1280" height="960" fill="#05164D" opacity="0.1" pointerEvents="none" />

                    {/* 2. Interactive SVG Flight Route Lines */}
                    {routePathD && (
                      <>
                        <path
                          d={routePathD}
                          fill="none"
                          stroke="#FFCC00"
                          strokeWidth="6"
                          strokeOpacity="0.45"
                          filter="url(#ptfsRouteGlow)"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          pointerEvents="none"
                        />
                        <path
                          d={routePathD}
                          fill="none"
                          stroke="#FFCC00"
                          strokeWidth="3.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeDasharray="10 5"
                          markerMid="url(#flightArrow)"
                          markerEnd="url(#flightArrow)"
                          className="animate-pulse"
                          pointerEvents="none"
                        />
                      </>
                    )}

                    {/* 3. Interactive Radiocontrol Stations and Waypoint Targets */}
                    {displayedWaypoints.map((wp) => {
                      const activeIndex = activeWaypoints.findIndex((p) => p.code === wp.code);
                      const isSelected = activeIndex !== -1;

                      return (
                        <g
                          key={wp.id}
                          className="cursor-pointer transition-transform hover:scale-125"
                          onClick={(e) => {
                            e.stopPropagation();
                            addWaypoint(wp);
                          }}
                          onMouseEnter={() => setHoveredWaypoint(wp)}
                          onMouseLeave={() => setHoveredWaypoint(null)}
                        >
                          <circle cx={wp.x} cy={wp.y} r="18" fill="transparent" />

                          {isSelected ? (
                            <>
                              <circle
                                cx={wp.x}
                                cy={wp.y}
                                r="12"
                                fill="rgba(255, 204, 0, 0.3)"
                                stroke="#FFCC00"
                                strokeWidth="2"
                              />
                              <circle cx={wp.x} cy={wp.y} r="5" fill="#FFCC00" />
                            </>
                          ) : (
                            <circle
                              cx={wp.x}
                              cy={wp.y}
                              r="5"
                              fill="rgba(5, 22, 77, 0.3)"
                              stroke={wp.type === 'AIRPORT' ? '#38BDF8' : '#FFCC00'}
                              strokeWidth="1.5"
                              opacity="0.85"
                            />
                          )}

                          {isSelected && (
                            <g transform={`translate(${wp.x + 8}, ${wp.y - 20})`}>
                              <rect width="20" height="16" rx="4" fill="#FFCC00" stroke="#05164D" strokeWidth="1" />
                              <text
                                x="10"
                                y="12"
                                fill="#05164D"
                                fontSize="10"
                                fontWeight="900"
                                textAnchor="middle"
                                fontFamily="monospace"
                              >
                                {activeIndex + 1}
                              </text>
                            </g>
                          )}
                        </g>
                      );
                    })}

                    {/* 4. Custom Waypoints added by direct clicking */}
                    {activeWaypoints
                      .filter((p) => !PTFS_WAYPOINTS.some((d) => d.code === p.code))
                      .map((cp, idx) => (
                        <g key={cp.id} transform={`translate(${cp.x}, ${cp.y})`}>
                          <circle r="6" fill="#FFCC00" stroke="#05164D" strokeWidth="2" />
                          <circle r="12" fill="none" stroke="#FFCC00" strokeWidth="1.5" strokeDasharray="3 3" />
                          <rect x="8" y="-20" width="20" height="16" rx="4" fill="#FFCC00" stroke="#05164D" strokeWidth="1" />
                          <text x="18" y="-8" fill="#05164D" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                            {idx + 1}
                          </text>
                        </g>
                      ))}
                  </svg>
                </div>

                {/* Hover Tooltip Overlay */}
                {hoveredWaypoint && (
                  <div className="absolute top-3 left-3 bg-[#05164D]/95 border border-[#FFCC00]/50 p-2.5 rounded-lg shadow-xl text-xs font-mono text-white pointer-events-none backdrop-blur-md">
                    <div className="font-bold text-[#FFCC00] text-sm">
                      {hoveredWaypoint.code} — {hoveredWaypoint.name}
                    </div>
                    <div className="text-[10px] text-slate-300 mt-0.5">
                      ТИП: {hoveredWaypoint.type} {hoveredWaypoint.freq ? `• ЧАСТОТА: ${hoveredWaypoint.freq}` : ''}
                    </div>
                    <div className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
                      <span>Кликните для добавления точки в маршрут</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between px-1">
                <span>Клик по точке на карте добавляет ее в полетный план</span>
                <span className="text-[#FFCC00]">Точная привязка всех 100+ навигационных точек PTFS</span>
              </div>
            </div>

            {/* Route Panel (4 cols) */}
            <div className="lg:col-span-4 p-5 rounded-2xl bg-[#04113B]/85 border border-white/15 backdrop-blur-md shadow-2xl flex flex-col space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                    Панель маршрута
                  </h3>
                  <p className="text-[10px] font-mono text-slate-400">
                    PTFS Waypoint Sequencing
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSavedList(!showSavedList)}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono text-slate-300 hover:text-white bg-white/5 border border-white/10 rounded-lg hover:border-[#FFCC00]/40 transition-colors cursor-pointer"
                >
                  <FolderOpen className="w-3.5 h-3.5 text-[#FFCC00]" />
                  <span>Библиотека</span>
                </button>
              </div>

              {/* Saved Routes Drawer */}
              {showSavedList && (
                <div className="p-3 bg-[#020B27] rounded-xl border border-white/15 space-y-2 animate-fadeIn max-h-52 overflow-y-auto">
                  <div className="text-[10px] font-mono uppercase text-[#FFCC00] font-bold">
                    Сохраненные планы ({savedRoutes.length}):
                  </div>
                  {savedRoutes.map((sr) => (
                    <div
                      key={sr.id}
                      onClick={() => handleLoadRoute(sr)}
                      className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-[#FFCC00]/40 cursor-pointer flex items-center justify-between text-xs transition-colors"
                    >
                      <div>
                        <div className="font-bold text-white text-[11px] flex items-center gap-1.5">
                          {sr.flightNumber && (
                            <span className="px-1.5 py-0.2 bg-[#FFCC00] text-[#05164D] rounded text-[9px] font-mono">
                              {sr.flightNumber}
                            </span>
                          )}
                          <span>{sr.name}</span>
                        </div>
                        <div className="text-[10px] font-mono text-[#FFCC00] mt-0.5">
                          {sr.waypoints.map((w) => w.code).join(' → ')}
                        </div>
                        <div className="text-[9px] font-mono text-slate-400 mt-0.5">
                          {sr.totalDistanceNm} NM • ~{sr.estFlightTimeMin} мин
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteRoute(e, sr.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 rounded hover:bg-white/5"
                        title="Удалить сохраненный план"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Route Name Input */}
              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-400 tracking-wider mb-1">
                  Название маршрута:
                </label>
                <input
                  type="text"
                  value={routeName}
                  onChange={(e) => setRouteName(e.target.value)}
                  placeholder="Например: PTFS: Perth Coastal Departure"
                  className="w-full px-3 py-2 rounded-lg bg-[#020B27] border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-[#FFCC00]"
                />
              </div>

              {/* Flight Plan Metrics Cards */}
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-3 rounded-lg bg-[#020B27]/90 border border-white/10">
                  <div className="text-[9px] font-mono text-slate-400 uppercase">Дистанция</div>
                  <div className="text-xl font-bold font-mono text-[#FFCC00] mt-0.5">
                    {totalDistanceNm} <span className="text-xs text-white">NM</span>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[#020B27]/90 border border-white/10">
                  <div className="text-[9px] font-mono text-slate-400 uppercase">Расчетное время</div>
                  <div className="text-xl font-bold font-mono text-white mt-0.5">
                    ~{estTimeMin} <span className="text-xs text-slate-400">мин</span>
                  </div>
                </div>
              </div>

              {/* Waypoints List with Individual Delete Buttons */}
              <div className="space-y-1.5 flex-1 max-h-64 overflow-y-auto pr-1">
                <div className="text-[10px] font-mono uppercase text-slate-400 mb-1 flex justify-between items-center">
                  <span>Точки маршрута (по порядку):</span>
                  <span className="text-[#FFCC00] font-bold">{activeWaypoints.length} точек</span>
                </div>

                {activeWaypoints.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-500 font-mono border border-dashed border-white/10 rounded-lg">
                    Маршрут пуст. Кликните по точкам на карте, чтобы добавить их.
                  </div>
                ) : (
                  activeWaypoints.map((wp, idx) => (
                    <div
                      key={`${wp.id}-${idx}`}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 text-xs transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded bg-[#FFCC00] text-[#05164D] font-mono font-bold text-[10px] flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <div>
                          <span className="font-mono font-bold text-white tracking-wide">
                            Точка {idx + 1}: {wp.code}
                          </span>
                          <span className="text-[10px] text-slate-400 ml-1.5 truncate max-w-[130px] inline-block align-bottom">
                            {wp.name}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeWaypoint(idx)}
                        title={`Удалить ${wp.code}`}
                        className="p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Quick Route Preset Buttons from User Map */}
              <div className="pt-2 border-t border-white/10">
                <span className="text-[10px] font-mono text-slate-400 block mb-1.5">
                  Готовые маршруты PTFS:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    {
                      label: 'PER → SHV (Perth)',
                      flight: 'LH 1042',
                      wps: [
                        PTFS_WAYPOINTS.find((w) => w.code === 'PER')!,
                        PTFS_WAYPOINTS.find((w) => w.code === 'SHV')!,
                        PTFS_WAYPOINTS.find((w) => w.code === 'ILKL')!,
                        PTFS_WAYPOINTS.find((w) => w.code === 'ATALIS')!,
                      ],
                    },
                    {
                      label: 'HME → ROM → PER',
                      flight: 'LH 2210',
                      wps: [
                        PTFS_WAYPOINTS.find((w) => w.code === 'HME')!,
                        PTFS_WAYPOINTS.find((w) => w.code === 'ROM')!,
                        PTFS_WAYPOINTS.find((w) => w.code === 'STRAX')!,
                        PTFS_WAYPOINTS.find((w) => w.code === 'PER')!,
                      ],
                    },
                    {
                      label: 'RFD → MLR → CLR',
                      flight: 'LH 3054',
                      wps: [
                        PTFS_WAYPOINTS.find((w) => w.code === 'RFD')!,
                        PTFS_WAYPOINTS.find((w) => w.code === 'MLR')!,
                        PTFS_WAYPOINTS.find((w) => w.code === 'CLR')!,
                        PTFS_WAYPOINTS.find((w) => w.code === 'IPPH')!,
                      ],
                    },
                  ].map((p, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setActiveWaypoints(p.wps.filter(Boolean));
                        setRouteName(`PTFS: ${p.label}`);
                        setSelectedFlightForSave(p.flight);
                      }}
                      className="px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-md text-[10px] font-mono text-slate-300 hover:text-[#FFCC00] transition-colors cursor-pointer"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons: Save & Reset */}
              <div className="pt-3 border-t border-white/10 flex gap-2">
                <button
                  type="button"
                  onClick={clearRoute}
                  title="Очистить маршрут"
                  className="p-2.5 rounded-lg border border-white/15 hover:bg-white/5 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={openSaveModal}
                  disabled={activeWaypoints.length < 2}
                  className="flex-1 py-2.5 px-3 rounded-lg bg-[#FFCC00] hover:bg-[#FFE066] disabled:opacity-40 text-[#05164D] font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(255,204,0,0.25)] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4 stroke-[2.5]" />
                  <span>Сохранить в отдел вылетов</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Save to Schedule Modal (Отдел вылетов) */}
      {isSaveModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
          role="dialog"
          aria-modal="true"
          aria-labelledby="save-schedule-title"
        >
          <div className="relative w-full max-w-lg bg-[#030e33] border border-white/20 rounded-2xl shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-[#FFCC00] text-[#05164D] flex items-center justify-center font-bold">
                  <LinkIcon className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h3
                    id="save-schedule-title"
                    className="text-base font-bold text-white uppercase font-sans"
                  >
                    Сохранение маршрута в расписание
                  </h3>
                  <span className="text-[11px] font-mono text-[#FFCC00]">
                    Отдел вылетов / Будущие рейсы PTFS
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsSaveModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmSaveToSchedule} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-300 mb-1">
                  Название маршрута:
                </label>
                <input
                  type="text"
                  value={routeName}
                  onChange={(e) => setRouteName(e.target.value)}
                  placeholder="Название полетного плана"
                  className="w-full px-3 py-2 rounded-lg bg-[#020B27] border border-white/20 text-white font-mono text-xs focus:outline-none focus:border-[#FFCC00]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-300 mb-1">
                  Выберите рейс из отдела вылетов (Расписание):
                </label>
                <select
                  value={selectedFlightForSave}
                  onChange={(e) => setSelectedFlightForSave(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#020B27] border border-white/20 text-white font-mono text-xs focus:outline-none focus:border-[#FFCC00] cursor-pointer"
                >
                  {flights.map((f) => (
                    <option key={f.id} value={f.flightNumber} className="bg-[#030e33] text-white">
                      {f.flightNumber} — {f.originCity} ({f.originIata}) → {f.destinationCity} ({f.destinationIata}) [{f.departureTime} МСК]
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-[#FFCC00] font-mono mt-1.5">
                  Если для выбранного рейса уже был сохранен маршрут, он будет автоматически перезаписан на новый план.
                </p>
              </div>

              <div className="p-3 bg-[#020B27] rounded-lg border border-white/10 text-xs font-mono text-slate-300 space-y-1">
                <div>Дистанция: <strong className="text-white">{totalDistanceNm} NM</strong></div>
                <div>Расчетное время: <strong className="text-white">~{estTimeMin} мин</strong></div>
                <div>Точки: <strong className="text-[#FFCC00]">{activeWaypoints.map((w) => w.code).join(' → ')}</strong></div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsSaveModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-mono cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#FFCC00] hover:bg-[#FFE066] text-[#05164D] font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
                >
                  Сохранить в расписание
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
