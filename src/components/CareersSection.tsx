import React from 'react';
import { Compass, Users, Wrench, Radio, ArrowRight, ShieldCheck } from 'lucide-react';
import { RoleId } from '../types';

interface CareersSectionProps {
  onSelectRole: (roleId: RoleId) => void;
}

export const CareersSection: React.FC<CareersSectionProps> = ({ onSelectRole }) => {
  const roles: Array<{
    id: RoleId;
    title: string;
    badge: string;
    desc: string;
    icon: React.ReactNode;
    requirements: string[];
  }> = [
    {
      id: 'pilot',
      title: 'Пилот (Pilot)',
      badge: 'Летный состав',
      desc: 'Пилотирование воздушных судов авиапарка Lufthansa (A320, A350, B747) по расписанию в PTFS.',
      icon: <Compass className="w-6 h-6 text-[#FFCC00]" />,
      requirements: [
        'Опыт налета в PTFS',
        'Управление самолетом (1-10)',
        'Готовность к практическому тесту',
        'Соблюдение регламентов полета',
      ],
    },
    {
      id: 'attendant',
      title: 'Бортпроводник (Cabin Crew)',
      badge: 'Обслуживание',
      desc: 'Обеспечение комфорта пассажиров на рейсах, предполетный брифинг, безопасность салона.',
      icon: <Users className="w-6 h-6 text-[#FFCC00]" />,
      requirements: [
        'Знание сервиса пассажиров (1-10)',
        'Готовность пройти проверку в лс',
        'Грамотная коммуникация в чате',
        'Пунктуальность к рейсам',
      ],
    },
    {
      id: 'ground',
      title: 'Наземная служба (Ground Ops)',
      badge: 'Перронное обслуживание',
      desc: 'Подготовка бортов к вылету, координация телетрапов, pushback буксировка и заправка.',
      icon: <Wrench className="w-6 h-6 text-[#FFCC00]" />,
      requirements: [
        'Знание обслуживания ВС в PTFS',
        'Работа с наземным оборудованием',
        'Соблюдение техники безопасности',
      ],
    },
    {
      id: 'dispatcher',
      title: 'Диспетчер (Air Traffic Controller)',
      badge: 'Управление движением',
      desc: 'Контроль взлетно-посадочных полос, эшелонирование, радиообмен и связь с бортами.',
      icon: <Radio className="w-6 h-6 text-[#FFCC00]" />,
      requirements: [
        'Знание ФРО (Фразеологии)',
        'Контроль заходов и взлетов',
        'Координация трафика хабов FRA/MUC',
      ],
    },
  ];

  return (
    <section id="careers" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
      <div className="flex flex-col items-center text-center mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-3">
          <ShieldCheck className="w-3.5 h-3.5 text-[#FFCC00]" />
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-300">
            Официальный набор персонала
          </span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight uppercase font-sans">
          Заявление на работу <span className="text-[#FFCC00]">в а/к</span>
        </h2>
        <p className="mt-3 text-sm sm:text-base text-slate-300 max-w-2xl">
          Выберите желаемую должность для заполнения строгой формы кандидата. Заявки сохраняются локально и рассматриваются администрацией.
        </p>
      </div>

      {/* Role Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {roles.map((role) => (
          <div
            key={role.id}
            className="group relative flex flex-col justify-between p-6 rounded-2xl bg-[#04113B]/70 hover:bg-[#05164D]/90 border border-white/10 hover:border-[#FFCC00]/60 transition-all duration-300 backdrop-blur-md shadow-xl hover:shadow-[0_0_30px_rgba(255,204,0,0.15)] hover:-translate-y-1"
          >
            <div>
              {/* Header inside card */}
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-[#FFCC00]/50 transition-colors">
                  {role.icon}
                </div>
                <span className="text-[10px] font-mono uppercase px-2 py-1 rounded bg-white/5 text-slate-300 border border-white/10">
                  {role.badge}
                </span>
              </div>

              <h3 className="text-lg font-bold text-white tracking-wide uppercase font-sans group-hover:text-[#FFCC00] transition-colors">
                {role.title}
              </h3>
              <p className="mt-2 text-xs text-slate-300 leading-relaxed min-h-[48px]">
                {role.desc}
              </p>

              {/* Requirement Checklist */}
              <div className="mt-5 pt-4 border-t border-white/10 space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-2">
                  Критерии отбора:
                </span>
                {role.requirements.map((req, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FFCC00] mt-1.5 shrink-0" />
                    <span>{req}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Button */}
            <div className="mt-6 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => onSelectRole(role.id)}
                className="w-full py-2.5 px-4 rounded-lg bg-white/5 hover:bg-[#FFCC00] group-hover:bg-[#FFCC00] text-slate-200 hover:text-[#05164D] group-hover:text-[#05164D] text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <span>Подать заявление</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
