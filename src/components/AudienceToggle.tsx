import React from 'react';
import { Stethoscope, User, HelpCircle, Activity, HeartHandshake } from 'lucide-react';
import { AudienceMode } from '../types';

interface AudienceToggleProps {
  mode: AudienceMode;
  onChange: (mode: AudienceMode) => void;
}

export const AudienceToggle: React.FC<AudienceToggleProps> = ({ mode, onChange }) => {
  return (
    <div className="w-full bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-600"></span>
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Режим адаптации ответа:
          </span>
        </div>
        <span className="text-xs">
          {mode === 'professional' ? (
            <span className="text-indigo-600 font-medium flex items-center gap-1.5">
              <Activity className="w-4 h-4" /> Фармакодинамика &bull; CYP450 &bull; Протоколы ЭКГ/СКФ
            </span>
          ) : (
            <span className="text-emerald-600 font-medium flex items-center gap-1.5">
              <HeartHandshake className="w-4 h-4" /> Простой язык &bull; Правила приема &bull; Сигналы тревоги
            </span>
          )}
        </span>
      </div>

      {/* Main Pill Toggle Segment */}
      <div className="grid grid-cols-2 gap-1.5 bg-gray-100 p-1.5 rounded-full border border-gray-200">
        <button
          id="mode-professional-btn"
          type="button"
          onClick={() => onChange('professional')}
          className={`relative flex items-center justify-center gap-2 py-2.5 px-4 rounded-full font-semibold text-xs sm:text-sm transition-all duration-200 ${
            mode === 'professional'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Stethoscope className={`w-4 h-4 ${mode === 'professional' ? 'text-indigo-600' : 'text-gray-400'}`} />
          <span>Для профессионалов</span>
          {mode === 'professional' && (
            <span className="hidden md:inline-block ml-1 text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-100">
              Врач / Провизор
            </span>
          )}
        </button>

        <button
          id="mode-consumer-btn"
          type="button"
          onClick={() => onChange('consumer')}
          className={`relative flex items-center justify-center gap-2 py-2.5 px-4 rounded-full font-semibold text-xs sm:text-sm transition-all duration-200 ${
            mode === 'consumer'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <User className={`w-4 h-4 ${mode === 'consumer' ? 'text-indigo-600' : 'text-gray-400'}`} />
          <span>Для потребителей</span>
          {mode === 'consumer' && (
            <span className="hidden md:inline-block ml-1 text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-100">
              Пациент / Понятно
            </span>
          )}
        </button>
      </div>
    </div>
  );
};
