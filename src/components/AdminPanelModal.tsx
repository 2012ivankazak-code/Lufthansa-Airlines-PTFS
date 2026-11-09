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
  MessageSquare,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Application, ApplicationStatus, RoleId } from '../types';
import { getApplications, updateApplicationStatus, deleteApplication, INITIAL_APPLICATIONS } from '../utils/storage';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({ isOpen, onClose }) => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedAppId, setExpandedAppId] = useState<string | null>(null);
  const [noteInputs, setNoteInputs] = useState<Record<string, string>>({});

  const refreshList = () => {
    setApplications(getApplications());
  };

  useEffect(() => {
    if (isOpen) {
      refreshList();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStatusChange = (id: string, newStatus: ApplicationStatus) => {
    const note = noteInputs[id];
    const updated = updateApplicationStatus(id, newStatus, note);
    setApplications(updated);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Удалить эту заявку из локального реестра?')) {
      const updated = deleteApplication(id);
      setApplications(updated);
    }
  };

  const handleResetToSeed = () => {
    if (window.confirm('Сбросить базу заявок к стандартным демонстрационным данным?')) {
      localStorage.setItem('lh_ptfs_applications_v1', JSON.stringify(INITIAL_APPLICATIONS));
      refreshList();
    }
  };

  const filtered = applications.filter((app) => {
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

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FFCC00]/15 text-[#FFCC00] border border-[#FFCC00]/30 font-mono text-[10px] font-bold uppercase">
            <Clock className="w-3 h-3" />
            На рассмотрении
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-mono text-[10px] font-bold uppercase">
            <CheckCircle2 className="w-3 h-3" />
            Одобрено
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 font-mono text-[10px] font-bold uppercase">
            <XCircle className="w-3 h-3" />
            Отклонено
          </span>
        );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-title"
    >
      <div className="relative w-full max-w-5xl my-6 bg-[#04113B] border border-white/20 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-white font-sans">
        {/* Top Header */}
        <div className="bg-[#05164D] px-6 py-4 border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#FFCC00] text-[#05164D] flex items-center justify-center font-bold">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 id="admin-title" className="text-base font-bold uppercase tracking-wider text-white">
                Админ-панель: Управление заявками PTFS
              </h3>
              <p className="text-[11px] font-mono text-slate-300">
                Автономный реестр кандидатов (localStorage) • {applications.length} записей
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetToSeed}
              title="Сбросить к начальным данным"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-slate-300 hover:text-white bg-white/5 border border-white/10 rounded hover:border-[#FFCC00]/40 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Сбросить демо</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Закрыть админ-панель"
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Filter controls row */}
        <div className="p-4 bg-[#020B27]/90 border-b border-white/10 shrink-0 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по имени, Telegram или ID..."
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-[#FFCC00]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-lg bg-[#04113B] border border-white/15 text-slate-200 text-xs focus:outline-none focus:border-[#FFCC00]"
            >
              <option value="ALL">Все статусы</option>
              <option value="PENDING">На рассмотрении</option>
              <option value="APPROVED">Одобрено</option>
              <option value="REJECTED">Отклонено</option>
            </select>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 rounded-lg bg-[#04113B] border border-white/15 text-slate-200 text-xs focus:outline-none focus:border-[#FFCC00]"
            >
              <option value="ALL">Все должности</option>
              <option value="pilot">Пилот</option>
              <option value="attendant">Бортпроводник</option>
              <option value="ground">Наземная служба</option>
              <option value="dispatcher">Диспетчер</option>
            </select>
          </div>
        </div>

        {/* Main List Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {filtered.length === 0 ? (
            <div className="text-center py-12 rounded-xl bg-white/[0.02] border border-white/10">
              <Shield className="w-10 h-10 text-slate-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-300">Заявок не найдено</p>
              <p className="text-xs text-slate-500 mt-1">Попробуйте изменить параметры фильтрации или поисковый запрос.</p>
            </div>
          ) : (
            filtered.map((app) => {
              const isExpanded = expandedAppId === app.id;
              return (
                <div
                  key={app.id}
                  className="rounded-xl bg-[#030e33] border border-white/10 hover:border-[#FFCC00]/40 transition-all overflow-hidden"
                >
                  {/* Summary Bar */}
                  <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#FFCC00] font-bold font-mono text-xs">
                        {app.roleId.slice(0, 3).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{app.applicantName}</span>
                          <span className="text-xs font-mono text-[#FFCC00]">{app.telegram}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono mt-0.5">
                          <span>{app.roleTitle}</span>
                          <span>•</span>
                          <span>ID: {app.id}</span>
                          <span>•</span>
                          <span>{new Date(app.createdAt).toLocaleDateString('ru-RU')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                      {getStatusBadge(app.status)}

                      <button
                        type="button"
                        onClick={() => setExpandedAppId(isExpanded ? null : app.id)}
                        className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-white/5"
                        aria-label={isExpanded ? 'Свернуть детали' : 'Развернуть детали'}
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Questionnaire Details & Decision Controls */}
                  {isExpanded && (
                    <div className="p-4 bg-[#020B27]/80 border-t border-white/10 space-y-4 text-xs">
                      {/* Answers breakdown */}
                      <div className="rounded-lg bg-white/5 p-3.5 border border-white/10 space-y-2">
                        <div className="font-mono text-[10px] uppercase text-[#FFCC00] font-bold tracking-wider mb-2">
                          Ответы на обязательные вопросы:
                        </div>

                        {app.roleId === 'pilot' && 'minutesInPtfs' in app.data && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-300">
                            <div>
                              <span className="text-slate-400 block text-[11px]">2) Минут в PTFS:</span>
                              <span className="font-mono text-white font-semibold">{app.data.minutesInPtfs} мин ({Math.round(app.data.minutesInPtfs / 60)} ч)</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[11px]">3) Как узнали:</span>
                              <span className="text-white">{app.data.referralSource}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[11px]">4) Навык управления (1-10):</span>
                              <span className="font-mono text-[#FFCC00] font-bold text-sm">{app.data.flightSkill} / 10</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[11px]">5) Готов к летной проверке:</span>
                              <span className="text-white font-semibold">{app.data.readyForCheck === 'yes' ? 'Да, готов' : 'Нет'}</span>
                            </div>
                          </div>
                        )}

                        {app.roleId === 'attendant' && 'serviceSkill' in app.data && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-300">
                            <div>
                              <span className="text-slate-400 block text-[11px]">2) Навык обслуживания (1-10):</span>
                              <span className="font-mono text-[#FFCC00] font-bold text-sm">{app.data.serviceSkill} / 10</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[11px]">3) Проверка в ЛС:</span>
                              <span className="text-white font-semibold">{app.data.readyForCheck === 'yes' ? 'Да, готов' : 'Нет'}</span>
                            </div>
                          </div>
                        )}

                        {app.roleId === 'ground' && 'maintenanceKnowledge' in app.data && (
                          <div className="text-slate-300">
                            <span className="text-slate-400 block text-[11px]">2) Обслуживание самолета:</span>
                            <p className="text-white mt-1 bg-[#020B27] p-2.5 rounded border border-white/5">{app.data.maintenanceKnowledge}</p>
                          </div>
                        )}

                        {app.roleId === 'dispatcher' && 'froKnowledge' in app.data && (
                          <div className="text-slate-300">
                            <span className="text-slate-400 block text-[11px]">2) Знание ФРО:</span>
                            <p className="text-white mt-1 bg-[#020B27] p-2.5 rounded border border-white/5">{app.data.froKnowledge}</p>
                          </div>
                        )}
                      </div>

                      {/* Optional Note / Decision input */}
                      <div>
                        <label className="block text-[11px] font-mono text-slate-400 mb-1 flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          Комментарий / Решение комиссии (отобразится кандидату):
                        </label>
                        <input
                          type="text"
                          defaultValue={app.adminNote || ''}
                          placeholder="Например: Проверка пройдена, ждем на сервере MUC"
                          onChange={(e) => setNoteInputs({ ...noteInputs, [app.id]: e.target.value })}
                          className="w-full px-3 py-1.5 rounded bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-[#FFCC00]"
                        />
                      </div>

                      {/* Action buttons: Одобрить, Отклонить, Удалить */}
                      <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-white/10">
                        <button
                          type="button"
                          onClick={() => handleDelete(app.id)}
                          className="flex items-center gap-1.5 text-rose-400 hover:text-rose-300 px-3 py-1.5 rounded hover:bg-rose-500/10 font-mono text-xs transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Удалить заявку</span>
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleStatusChange(app.id, 'REJECTED')}
                            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-rose-600/30 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/50 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Отклонить</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleStatusChange(app.id, 'APPROVED')}
                            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer"
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
    </div>
  );
};
