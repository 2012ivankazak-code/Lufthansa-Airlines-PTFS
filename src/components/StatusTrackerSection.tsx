import React, { useState, useEffect } from 'react';
import { Search, Clock, CheckCircle2, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { Application, ApplicationStatus } from '../types';
import { getApplications } from '../utils/storage';

export const StatusTrackerSection: React.FC = () => {
  const [query, setQuery] = useState('');
  const [applications, setApplications] = useState<Application[]>([]);
  const [searched, setSearched] = useState(false);

  const loadData = () => {
    setApplications(getApplications());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('lh_storage_updated', handleUpdate);
    return () => window.removeEventListener('lh_storage_updated', handleUpdate);
  }, []);

  const trimmed = query.trim().toLowerCase().replace('@', '');

  const matches = trimmed
    ? applications.filter(
        (app) =>
          app.applicantName.toLowerCase().includes(trimmed) ||
          app.telegram.toLowerCase().replace('@', '').includes(trimmed) ||
          app.id.toLowerCase().includes(trimmed)
      )
    : [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'PENDING':
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFCC00]/15 text-[#FFCC00] border border-[#FFCC00]/30 font-semibold text-xs tracking-wider uppercase font-mono">
            <Clock className="w-3.5 h-3.5" />
            <span>На рассмотрении</span>
          </div>
        );
      case 'APPROVED':
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-semibold text-xs tracking-wider uppercase font-mono">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Одобрено</span>
          </div>
        );
      case 'REJECTED':
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 font-semibold text-xs tracking-wider uppercase font-mono">
            <XCircle className="w-3.5 h-3.5" />
            <span>Отклонено</span>
          </div>
        );
    }
  };

  return (
    <section id="status" className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto relative z-10">
      <div className="p-8 rounded-2xl bg-[#04113B]/80 border border-white/10 backdrop-blur-md shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono text-[#FFCC00] uppercase tracking-wider mb-1">
              <span className="w-2 h-2 rounded-full bg-[#FFCC00]" />
              Официальный реестр кандидатов
            </div>
            <h3 className="text-2xl font-bold uppercase tracking-tight text-white font-sans">
              Проверка статуса заявления
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              Введите имя/никнейм в Roblox или Telegram для проверки решения руководства.
            </p>
          </div>

          <button
            type="button"
            onClick={loadData}
            title="Обновить реестр"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-slate-300 hover:text-white bg-white/5 border border-white/10 rounded hover:border-[#FFCC00]/40 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Синхронизировать</span>
          </button>
        </div>

        {/* Search input form */}
        <form onSubmit={handleSearch} className="mt-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSearched(false);
              }}
              placeholder="Введите никнейм (например, Maxim_Aviator или @maxim_ptfs)"
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#020B27]/80 border border-white/15 focus:border-[#FFCC00] text-white text-sm focus:outline-none transition-colors"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-lg bg-[#FFCC00] hover:bg-[#FFE066] text-[#05164D] font-bold text-xs uppercase tracking-wider transition-colors shadow-md cursor-pointer shrink-0"
          >
            Найти заявку
          </button>
        </form>

        {/* Results view */}
        <div className="mt-6 space-y-3">
          {trimmed && matches.length > 0 ? (
            matches.map((app) => (
              <div
                key={app.id}
                className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-[#FFCC00]/30 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-slate-400">ID: {app.id}</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-xs font-semibold text-slate-200">{app.roleTitle}</span>
                  </div>
                  <div className="text-base font-bold text-white tracking-wide">
                    {app.applicantName}
                    <span className="ml-2 text-xs font-mono text-[#FFCC00] font-normal">
                      ({app.telegram})
                    </span>
                  </div>
                  {app.adminNote && (
                    <div className="mt-2 text-xs text-slate-300 bg-white/5 px-3 py-1.5 rounded border border-white/5">
                      <span className="font-semibold text-slate-200">Решение комиссии: </span>
                      {app.adminNote}
                    </div>
                  )}
                  <div className="text-[10px] font-mono text-slate-500 mt-1">
                    Подано: {new Date(app.createdAt).toLocaleString('ru-RU')}
                  </div>
                </div>

                <div className="shrink-0">{getStatusBadge(app.status)}</div>
              </div>
            ))
          ) : searched && trimmed ? (
            <div className="p-6 text-center rounded-xl bg-white/5 border border-white/10">
              <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-200">
                Заявок по запросу «{query}» не найдено.
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Убедитесь, что никнейм указан точно так же, как в форме подачи.
              </p>
            </div>
          ) : (
            <div className="pt-2 text-xs text-slate-400 flex items-center justify-between">
              <span>Всего зарегистрированных кандидатов в базе: {applications.length}</span>
              <span className="text-slate-500 font-mono">Автономная база данных</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
