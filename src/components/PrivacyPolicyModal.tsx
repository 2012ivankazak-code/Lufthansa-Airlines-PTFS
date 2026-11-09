import React from 'react';
import { X, Shield, Lock, FileText, Check } from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacy-policy-title"
    >
      <div className="relative w-full max-w-2xl bg-[#030e33] border border-white/20 rounded-2xl shadow-2xl flex flex-col max-h-[88vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-[#05164D] border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-[#FFCC00]/40 flex items-center justify-center text-[#FFCC00]">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="privacy-policy-title"
                className="text-lg font-bold text-white tracking-wide uppercase font-sans"
              >
                Политика конфиденциальности
              </h2>
              <span className="text-[11px] font-mono text-[#FFCC00]">
                Lufthansa Airlines PTFS • Roblox Community Edition
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть политику конфиденциальности"
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-300 font-sans leading-relaxed">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <h3 className="font-bold text-white uppercase text-sm mb-1">
              1. Статус виртуального сообщества
            </h3>
            <p>
              Данный веб-ресурс является независимым фан-проектом виртуальной авиакомпании в онлайн-симуляторе <strong>Roblox PTFS (Pilot Training Flight Simulator)</strong>. Сайт не связан с Deutsche Lufthansa AG и не осуществляет продажу реальных авиабилетов или услуг.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-white uppercase text-sm mb-2 flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#FFCC00]" />
              2. Использование локального хранилища (localStorage) и файлов cookie
            </h3>
            <p className="mb-2">
              Для обеспечения работы портала используется исключительно локальное хранилище браузера пользователя (<strong>localStorage</strong>) и сессионные куки:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
              <li>
                <strong>Заявления на работу</strong>: ваш никнейм в Roblox, ссылка на Telegram и ответы формы сохраняются исключительно на вашем устройстве для демонстрации функционала статуса заявки.
              </li>
              <li>
                <strong>Посадочные талоны</strong>: сохраненные билеты и выбранные места рейса.
              </li>
              <li>
                <strong>Полетные планы (Map Planner)</strong>: навигационные точки и пользовательские маршруты полетов.
              </li>
              <li>
                <strong>Оповещения о рейсах</strong>: ваши подписки на статусы гейтов и вылетов.
              </li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <h3 className="font-bold text-white uppercase text-sm mb-1">
              3. Отсутствие передачи третьим лицам
            </h3>
            <p>
              Мы <strong>не передаем</strong> ваши данные рекламодателям, коммерческим сервисам аналитики или третьим лицам. Никакие пароли от ваших учетных записей Roblox или Telegram никогда не запрашиваются сайтом.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-white uppercase text-sm mb-1">
              4. Удаление и сброс данных
            </h3>
            <p>
              Вы можете в любой момент полностью удалить все сохраненные данные, очистив кэш и хранилище вашего веб-браузера или воспользовавшись кнопкой сброса в служебной панели.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#020B27] border-t border-white/10 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg bg-[#FFCC00] hover:bg-[#FFE066] text-[#05164D] font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            Понятно
          </button>
        </div>
      </div>
    </div>
  );
};
