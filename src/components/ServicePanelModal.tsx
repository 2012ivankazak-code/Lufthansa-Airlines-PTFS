import React, { useState, useEffect } from 'react';
import {
  X,
  Shield,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  RefreshCw,
  Search,
  Filter,
  Radio,
  FileCheck,
  Plane,
  Plus,
  Edit3,
  ChevronDown,
  ChevronUp,
  Save,
} from 'lucide-react';
import {
  Application,
  ApplicationStatus,
  RoleId,
  Flight,
  FlightStatus,
} from '../types';
import {
  getApplications,
  updateApplicationStatus,
  deleteApplication,
  INITIAL_APPLICATIONS,
  getFlights,
  updateFlightStatus,
  addFlight,
  updateFlight,
  deleteFlight,
} from '../utils/storage';

interface ServicePanelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ServicePanelModal: React.FC<ServicePanelModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'applications' | 'dispatch'>('applications');

  // Applications Tab State
  const [applications, setApplications] = useState<Application[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedAppId, setExpandedAppId] = useState<string | null>(null);
  const [noteInputs, setNoteInputs] = useState<Record<string, string>>({});

  // Dispatch / Flight Management State
  const [flights, setFlights] = useState<Flight[]>([]);
  const [flightSearch, setFlightSearch] = useState('');
  const [statusSuccess, setStatusSuccess] = useState<string | null>(null);

  // Flight Editor Modal State (Add or Edit)
  const [editingFlight, setEditingFlight] = useState<Flight | null>(null);
  const [isFlightFormOpen, setIsFlightFormOpen] = useState(false);
  const [isNewFlight, setIsNewFlight] = useState(false);

  // Flight Form Fields
  const [flightNumber, setFlightNumber] = useState('');
  const [originCity, setOriginCity] = useState('');
  const [originIata, setOriginIata] = useState('');
  const [destinationCity, setDestinationCity] = useState('');
  const [destinationIata, setDestinationIata] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [arrivalTime, setArrivalTime] = useState('');
  const [gate, setGate] = useState('');
  const [terminal, setTerminal] = useState('');
  const [aircraft, setAircraft] = useState('');
  const [flightStatus, setFlightStatus] = useState<FlightStatus>('ON_TIME');
  const [formError, setFormError] = useState('');

  const refreshData = () => {
    setApplications(getApplications());
    setFlights(getFlights());
  };

  useEffect(() => {
    if (isOpen) {
      refreshData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Applications Handlers
  const handleStatusChange = (id: string, newStatus: ApplicationStatus) => {
    const note = noteInputs[id];
    const updated = updateApplicationStatus(id, newStatus, note);
    setApplications(updated);
  };

  const handleDeleteApp = (id: string) => {
    if (window.confirm('Удалить эту заявку из локального реестра?')) {
      const updated = deleteApplication(id);
      setApplications(updated);
    }
  };

  const handleResetToSeed = () => {
    if (window.confirm('Сбросить базу заявок к стандартным демонстрационным данным?')) {
      localStorage.setItem('lh_ptfs_applications_v1', JSON.stringify(INITIAL_APPLICATIONS));
      refreshData();
    }
  };

  // Dispatch Quick Status Change
  const handleQuickStatusChange = (fn: string, st: FlightStatus) => {
    const updated = updateFlightStatus(fn, st);
    setFlights(updated);
    setStatusSuccess(`Статус рейса ${fn} обновлен`);
    setTimeout(() => setStatusSuccess(null), 2500);
  };

  // Open Flight Form for New Flight
  const handleOpenAddFlight = () => {
    setIsNewFlight(true);
    setEditingFlight(null);
    setFlightNumber(`LH ${Math.floor(1000 + Math.random() * 9000)}`);
    setOriginCity('Франкфурт');
    setOriginIata('FRA');
    setDestinationCity('');
    setDestinationIata('');
    setDepartureTime('19:00');
    setArrivalTime('20:30');
    setGate('A' + Math.floor(1 + Math.random() * 20));
    setTerminal('T1');
    setAircraft('Airbus A320neo');
    setFlightStatus('ON_TIME');
    setFormError('');
    setIsFlightFormOpen(true);
  };

  // Open Flight Form for Editing
  const handleOpenEditFlight = (f: Flight) => {
    setIsNewFlight(false);
    setEditingFlight(f);
    setFlightNumber(f.flightNumber);
    setOriginCity(f.originCity);
    setOriginIata(f.originIata);
    setDestinationCity(f.destinationCity);
    setDestinationIata(f.destinationIata);
    setDepartureTime(f.departureTime);
    setArrivalTime(f.arrivalTime);
    setGate(f.gate);
    setTerminal(f.terminal);
    setAircraft(f.aircraft);
    setFlightStatus(f.status);
    setFormError('');
    setIsFlightFormOpen(true);
  };

  // Save Flight Form (Add or Edit)
  const handleSaveFlightForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!flightNumber.trim() || !destinationCity.trim() || !departureTime.trim()) {
      setFormError('Заполните обязательные поля (номер рейса, город назначения, время вылета)');
      return;
    }

    const flightPayload: Flight = {
      id: editingFlight ? editingFlight.id : `flight-${Date.now()}`,
      flightNumber: flightNumber.trim().toUpperCase(),
      originCity: originCity.trim(),
      originIata: (originIata.trim() || 'FRA').toUpperCase(),
      destinationCity: destinationCity.trim(),
      destinationIata: (destinationIata.trim() || 'PTFS').toUpperCase(),
      departureTime: departureTime.trim(),
      arrivalTime: arrivalTime.trim() || '21:00',
      gate: (gate.trim() || 'A1').toUpperCase(),
      terminal: (terminal.trim() || 'T1').toUpperCase(),
      aircraft: aircraft.trim() || 'Airbus A320neo',
      status: flightStatus,
    };

    if (isNewFlight) {
      const updated = addFlight(flightPayload);
      setFlights(updated);
      setStatusSuccess(`Рейс ${flightPayload.flightNumber} успешно добавлен в отдел вылетов!`);
    } else {
      const updated = updateFlight(flightPayload);
      setFlights(updated);
      setStatusSuccess(`Данные рейса ${flightPayload.flightNumber} успешно обновлены!`);
    }

    setIsFlightFormOpen(false);
    setTimeout(() => setStatusSuccess(null), 3000);
  };

  // Delete Flight
  const handleDeleteFlight = (fn: string) => {
    if (window.confirm(`Удалить рейс ${fn} из расписания?`)) {
      const updated = deleteFlight(fn);
      setFlights(updated);
      setStatusSuccess(`Рейс ${fn} удален из расписания`);
      setTimeout(() => setStatusSuccess(null), 2500);
    }
  };

  const filteredApplications = applications.filter((app) => {
    if (statusFilter !== 'ALL' && app.status !== statusFilter) return false;
    if (roleFilter !== 'ALL' && app.roleId !== roleFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().replace('@', '');
      const match =
        app.applicantName.toLowerCase().includes(q) ||
        app.telegram.toLowerCase().replace('@', '').includes(q) ||
        app.id.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const filteredFlights = flights.filter((f) => {
    if (!flightSearch.trim()) return true;
    const q = flightSearch.toLowerCase();
    return (
      f.flightNumber.toLowerCase().includes(q) ||
      f.destinationCity.toLowerCase().includes(q) ||
      f.destinationIata.toLowerCase().includes(q) ||
      f.originCity.toLowerCase().includes(q)
    );
  });

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 font-mono text-[10px] font-bold uppercase">
            <Clock className="w-3 h-3" />
            На рассмотрении
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-mono text-[10px] font-bold uppercase">
            <CheckCircle2 className="w-3 h-3" />
            Одобрено
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 font-mono text-[10px] font-bold uppercase">
            <XCircle className="w-3 h-3" />
            Отклонено
          </span>
        );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="service-panel-title"
    >
      <div className="relative w-full max-w-5xl bg-[#030e33] border border-white/20 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Header (Zero mention of secret key) */}
        <div className="flex items-center justify-between p-5 bg-[#05164D] border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-[#FFCC00]/40 flex items-center justify-center text-[#FFCC00]">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2
                  id="service-panel-title"
                  className="text-base sm:text-lg font-bold text-white tracking-wide uppercase font-sans"
                >
                  Служебная панель персонала
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono text-[10px] font-bold uppercase">
                  Служебный доступ активен
                </span>
              </div>
              <p className="text-[11px] font-mono text-slate-300 mt-0.5">
                Lufthansa PTFS • Служебный координационный центр и диспетчерская
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть служебную панель"
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs Bar (Checklists and METAR removed, replaced with full flight management) */}
        <div className="bg-[#020B27] px-6 py-2.5 border-b border-white/10 flex items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('applications')}
              className={`px-4 py-2 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'applications'
                  ? 'bg-[#FFCC00] text-[#05164D] shadow-sm'
                  : 'text-slate-300 hover:text-white bg-white/5'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Заявления на работу ({applications.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('dispatch')}
              className={`px-4 py-2 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'dispatch'
                  ? 'bg-[#FFCC00] text-[#05164D] shadow-sm'
                  : 'text-slate-300 hover:text-white bg-white/5'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Управление рейсами ({flights.length})</span>
            </button>
          </div>

          {activeTab === 'dispatch' && (
            <button
              type="button"
              onClick={handleOpenAddFlight}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#FFCC00] hover:bg-[#FFE066] text-[#05164D] font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Добавить рейс</span>
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* ==================================================== */}
          {/* TAB 1: APPLICATIONS REGISTRY                         */}
          {/* ==================================================== */}
          {activeTab === 'applications' && (
            <div className="space-y-4">
              {/* Filter & Search Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                <div className="sm:col-span-5 relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Поиск по никнейму, ID или Telegram..."
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-[#FFCC00]"
                  />
                </div>

                <div className="sm:col-span-3">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#04113B] border border-white/15 text-slate-200 text-xs focus:outline-none focus:border-[#FFCC00] cursor-pointer"
                  >
                    <option value="ALL">Все статусы</option>
                    <option value="PENDING">На рассмотрении</option>
                    <option value="APPROVED">Одобренные</option>
                    <option value="REJECTED">Отклоненные</option>
                  </select>
                </div>

                <div className="sm:col-span-4 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleResetToSeed}
                    title="Сбросить к тестовым данным"
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 text-xs font-mono transition-colors cursor-pointer"
                  >
                    Сброс базы
                  </button>
                  <button
                    type="button"
                    onClick={refreshData}
                    title="Обновить список"
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Applications List */}
              <div className="space-y-3">
                {filteredApplications.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400 font-mono border border-dashed border-white/10 rounded-xl">
                    Заявок по выбранным фильтрам не найдено.
                  </div>
                ) : (
                  filteredApplications.map((app) => {
                    const isExpanded = expandedAppId === app.id;

                    return (
                      <div
                        key={app.id}
                        className="rounded-xl bg-[#030e33] border border-white/10 hover:border-[#FFCC00]/40 transition-all overflow-hidden"
                      >
                        <div
                          onClick={() => setExpandedAppId(isExpanded ? null : app.id)}
                          className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-white/[0.02]"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#FFCC00] font-bold font-mono text-xs shrink-0">
                              {app.roleId.slice(0, 3).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white text-sm">
                                  {app.applicantName}
                                </span>
                                <span className="text-xs font-mono text-[#FFCC00]">
                                  {app.telegram}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-400 font-sans mt-0.5">
                                {app.roleTitle} • ID: {app.id}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 self-end sm:self-center">
                            {getStatusBadge(app.status)}
                            <button
                              type="button"
                              aria-label="Развернуть детали заявки"
                              className="p-1 text-slate-400 hover:text-white"
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Expanded details */}
                        {isExpanded && (
                          <div className="px-4 pb-4 pt-2 border-t border-white/5 bg-[#020B27]/60 space-y-3 text-xs">
                            <div className="p-3 rounded-lg bg-white/5 border border-white/5 space-y-2">
                              <div className="font-mono text-[10px] uppercase text-[#FFCC00] font-bold tracking-wider">
                                Данные анкеты кандидата:
                              </div>
                              {app.roleId === 'pilot' && 'minutesInPtfs' in app.data && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                  <div>
                                    <span className="text-slate-400 block text-[10px]">Налет в PTFS:</span>
                                    <span className="text-white font-mono">{app.data.minutesInPtfs} мин</span>
                                  </div>
                                  <div>
                                    <span className="text-slate-400 block text-[10px]">Навык управления:</span>
                                    <span className="font-mono text-[#FFCC00] font-bold">{app.data.flightSkill} / 10</span>
                                  </div>
                                  <div>
                                    <span className="text-slate-400 block text-[10px]">Готов к проверке:</span>
                                    <span className="text-white font-mono">{app.data.readyForCheck === 'yes' ? 'Да' : 'Нет'}</span>
                                  </div>
                                </div>
                              )}
                              {app.roleId === 'attendant' && 'serviceSkill' in app.data && (
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <span className="text-slate-400 block text-[10px]">Сервис пассажиров:</span>
                                    <span className="font-mono text-[#FFCC00] font-bold">{app.data.serviceSkill} / 10</span>
                                  </div>
                                  <div>
                                    <span className="text-slate-400 block text-[10px]">Готов к проверке:</span>
                                    <span className="text-white font-mono">{app.data.readyForCheck === 'yes' ? 'Да' : 'Нет'}</span>
                                  </div>
                                </div>
                              )}
                              {app.roleId === 'ground' && 'maintenanceKnowledge' in app.data && (
                                <div>
                                  <span className="text-slate-400 block text-[10px]">Знание процедур наземной службы:</span>
                                  <p className="text-white mt-0.5">{app.data.maintenanceKnowledge}</p>
                                </div>
                              )}
                              {app.roleId === 'dispatcher' && 'froKnowledge' in app.data && (
                                <div>
                                  <span className="text-slate-400 block text-[10px]">Знание ФРО и эшелонирования:</span>
                                  <p className="text-white mt-0.5">{app.data.froKnowledge}</p>
                                </div>
                              )}
                            </div>

                            {/* Note from administration */}
                            <div>
                              <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                                Заметка / Комментарий администрации:
                              </label>
                              <input
                                type="text"
                                value={noteInputs[app.id] ?? app.adminNote ?? ''}
                                onChange={(e) =>
                                  setNoteInputs({ ...noteInputs, [app.id]: e.target.value })
                                }
                                placeholder="Заметка к заявке..."
                                className="w-full px-3 py-1.5 rounded bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-[#FFCC00]"
                              />
                            </div>

                            {/* Action Buttons: Approve / Reject / Delete */}
                            <div className="flex items-center justify-between pt-2">
                              <button
                                type="button"
                                onClick={() => handleDeleteApp(app.id)}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Удалить заявку</span>
                              </button>

                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleStatusChange(app.id, 'REJECTED')}
                                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-mono font-bold transition-colors cursor-pointer"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                  <span>Отклонить</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleStatusChange(app.id, 'APPROVED')}
                                  className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold transition-colors cursor-pointer"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Одобрить</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 2: FLIGHTS MANAGEMENT (Add, Edit, Delete, Status) */}
          {/* ==================================================== */}
          {activeTab === 'dispatch' && (
            <div className="space-y-4 font-mono text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={flightSearch}
                    onChange={(e) => setFlightSearch(e.target.value)}
                    placeholder="Поиск рейса по номеру или городу..."
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-[#FFCC00]"
                  />
                </div>

                {statusSuccess && (
                  <span className="text-emerald-400 font-bold animate-fadeIn">
                    ✓ {statusSuccess}
                  </span>
                )}
              </div>

              <div className="space-y-3">
                {filteredFlights.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 border border-dashed border-white/10 rounded-xl">
                    Рейсов не найдено. Нажмите «Добавить рейс», чтобы создать новое отправление.
                  </div>
                ) : (
                  filteredFlights.map((f) => (
                    <div
                      key={f.id}
                      className="p-4 rounded-xl bg-[#020B27] border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#FFCC00] text-sm bg-white/5 px-2.5 py-0.5 rounded border border-white/10">
                            {f.flightNumber}
                          </span>
                          <span className="text-white font-bold text-sm">
                            {f.originCity} ({f.originIata}) → {f.destinationCity} ({f.destinationIata})
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-sans mt-1.5 flex flex-wrap gap-3">
                          <span>Вылет: <strong className="text-white">{f.departureTime} МСК</strong></span>
                          <span>Прибытие: <strong className="text-white">{f.arrivalTime}</strong></span>
                          <span>Гейт: <strong className="text-white">{f.gate}</strong> ({f.terminal})</span>
                          <span>ВС: <strong className="text-slate-300">{f.aircraft}</strong></span>
                        </div>
                      </div>

                      {/* Controls: Edit, Delete, and Status Badges */}
                      <div className="flex flex-wrap items-center gap-2 self-end md:self-center">
                        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/10">
                          {(['ON_TIME', 'BOARDING', 'DELAYED', 'DEPARTED'] as FlightStatus[]).map((st) => (
                            <button
                              key={st}
                              type="button"
                              onClick={() => handleQuickStatusChange(f.flightNumber, st)}
                              className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-wider transition-all cursor-pointer ${
                                f.status === st
                                  ? 'bg-[#FFCC00] text-[#05164D] shadow-sm'
                                  : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              {st === 'ON_TIME' ? 'ON TIME' : st}
                            </button>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleOpenEditFlight(f)}
                          title="Редактировать рейс"
                          className="p-2 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 hover:text-[#FFCC00] border border-white/10 transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteFlight(f.flightNumber)}
                          title="Удалить рейс"
                          className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#05164D] border-t border-white/10 flex items-center justify-between text-xs font-mono text-slate-300">
          <span>Служебная панель авторизована</span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-[#FFCC00] hover:bg-[#FFE066] text-[#05164D] font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            Закрыть панель
          </button>
        </div>
      </div>

      {/* Flight Editor Form Modal (Add / Edit) */}
      {isFlightFormOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-lg bg-[#030e33] border border-white/20 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Plane className="w-5 h-5 text-[#FFCC00]" />
                <h3 className="text-base font-bold text-white uppercase font-sans">
                  {isNewFlight ? 'Добавление нового рейса' : `Редактирование рейса ${flightNumber}`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsFlightFormOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFlightForm} className="space-y-3.5 text-xs font-mono">
              {formError && (
                <div className="p-2.5 rounded bg-rose-500/20 border border-rose-500/40 text-rose-300">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase text-slate-300 mb-1">
                    Номер рейса *:
                  </label>
                  <input
                    type="text"
                    value={flightNumber}
                    onChange={(e) => setFlightNumber(e.target.value)}
                    placeholder="LH 1234"
                    className="w-full px-3 py-2 rounded-lg bg-[#020B27] border border-white/20 text-white focus:outline-none focus:border-[#FFCC00]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase text-slate-300 mb-1">
                    Воздушное судно:
                  </label>
                  <input
                    type="text"
                    value={aircraft}
                    onChange={(e) => setAircraft(e.target.value)}
                    placeholder="Airbus A320neo"
                    className="w-full px-3 py-2 rounded-lg bg-[#020B27] border border-white/20 text-white focus:outline-none focus:border-[#FFCC00]"
                  />
                </div>
              </div>

              {/* Origin & Destination */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase text-slate-300 mb-1">
                    Откуда (Город / IATA):
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={originCity}
                      onChange={(e) => setOriginCity(e.target.value)}
                      placeholder="Франкфурт"
                      className="w-2/3 px-3 py-2 rounded-lg bg-[#020B27] border border-white/20 text-white focus:outline-none focus:border-[#FFCC00]"
                    />
                    <input
                      type="text"
                      value={originIata}
                      onChange={(e) => setOriginIata(e.target.value)}
                      placeholder="FRA"
                      maxLength={4}
                      className="w-1/3 px-2 py-2 rounded-lg bg-[#020B27] border border-white/20 text-white text-center uppercase focus:outline-none focus:border-[#FFCC00]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase text-slate-300 mb-1">
                    Куда (Город / IATA) *:
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={destinationCity}
                      onChange={(e) => setDestinationCity(e.target.value)}
                      placeholder="Лондон"
                      className="w-2/3 px-3 py-2 rounded-lg bg-[#020B27] border border-white/20 text-white focus:outline-none focus:border-[#FFCC00]"
                    />
                    <input
                      type="text"
                      value={destinationIata}
                      onChange={(e) => setDestinationIata(e.target.value)}
                      placeholder="LHR"
                      maxLength={4}
                      className="w-1/3 px-2 py-2 rounded-lg bg-[#020B27] border border-white/20 text-white text-center uppercase focus:outline-none focus:border-[#FFCC00]"
                    />
                  </div>
                </div>
              </div>

              {/* Time, Gate, Terminal */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] uppercase text-slate-300 mb-1">
                    Вылет (МСК) *:
                  </label>
                  <input
                    type="text"
                    value={departureTime}
                    onChange={(e) => setDepartureTime(e.target.value)}
                    placeholder="18:30"
                    className="w-full px-2.5 py-2 rounded-lg bg-[#020B27] border border-white/20 text-white text-center focus:outline-none focus:border-[#FFCC00]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase text-slate-300 mb-1">
                    Прибытие:
                  </label>
                  <input
                    type="text"
                    value={arrivalTime}
                    onChange={(e) => setArrivalTime(e.target.value)}
                    placeholder="20:00"
                    className="w-full px-2.5 py-2 rounded-lg bg-[#020B27] border border-white/20 text-white text-center focus:outline-none focus:border-[#FFCC00]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase text-slate-300 mb-1">
                    Гейт / Терминал:
                  </label>
                  <div className="flex gap-1">
                    <input
                      type="text"
                      value={gate}
                      onChange={(e) => setGate(e.target.value)}
                      placeholder="A14"
                      className="w-1/2 px-1.5 py-2 rounded-lg bg-[#020B27] border border-white/20 text-white text-center uppercase focus:outline-none focus:border-[#FFCC00]"
                    />
                    <input
                      type="text"
                      value={terminal}
                      onChange={(e) => setTerminal(e.target.value)}
                      placeholder="T1"
                      className="w-1/2 px-1.5 py-2 rounded-lg bg-[#020B27] border border-white/20 text-white text-center uppercase focus:outline-none focus:border-[#FFCC00]"
                    />
                  </div>
                </div>
              </div>

              {/* Status Select */}
              <div>
                <label className="block text-[10px] uppercase text-slate-300 mb-1">
                  Статус рейса:
                </label>
                <select
                  value={flightStatus}
                  onChange={(e) => setFlightStatus(e.target.value as FlightStatus)}
                  className="w-full px-3 py-2 rounded-lg bg-[#020B27] border border-white/20 text-white focus:outline-none focus:border-[#FFCC00] cursor-pointer"
                >
                  <option value="ON_TIME">ON TIME (По расписанию)</option>
                  <option value="BOARDING">BOARDING (Идет посадка)</option>
                  <option value="DELAYED">DELAYED (Задержан)</option>
                  <option value="DEPARTED">DEPARTED (Вылетел)</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsFlightFormOpen(false)}
                  className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-colors cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#FFCC00] hover:bg-[#FFE066] text-[#05164D] font-bold uppercase tracking-wider transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Сохранить рейс</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
