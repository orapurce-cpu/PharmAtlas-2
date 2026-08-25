import React, { useState } from 'react';
import { Pill, Plus, Trash2, Search, Zap, AlertCircle, CheckCircle2, ChevronRight, RefreshCw } from 'lucide-react';
import { DrugItem, SelectedSlot } from '../types';
import { ALL_DRUGS_FLAT } from '../data/pharmacologyDb';
import { DrugSearchModal } from './DrugSearchModal';

interface DrugInputSlotsProps {
  slots: SelectedSlot[];
  onUpdateSlot: (slotNumber: number, drug: DrugItem | null, customDose?: string) => void;
  onClearAll: () => void;
  onApplyPreset: (presetDrugs: DrugItem[]) => void;
  onOpenAddDrugModal?: () => void;
}

export const DrugInputSlots: React.FC<DrugInputSlotsProps> = ({
  slots,
  onUpdateSlot,
  onClearAll,
  onApplyPreset,
  onOpenAddDrugModal,
}) => {
  const [activeModalSlot, setActiveModalSlot] = useState<number | null>(null);

  const currentlySelectedIds = slots
    .filter(s => s.drug !== null)
    .map(s => s.drug!.id);

  const filledCount = slots.filter(s => s.drug !== null).length;

  // Curated presets for instant demonstration of real DDI collisions
  const presets = [
    {
      title: 'Нитрат + Силденафил',
      subtitle: 'Критический риск сосудистого коллапса',
      badge: 'Критический',
      badgeColor: 'bg-red-50 text-red-700 border-red-200',
      drugInns: ['Нитроглицерин (Nitroglycerin)', 'Силденафил (Sildenafil)']
    },
    {
      title: 'Амиодарон + Кларитромицин',
      subtitle: 'Блокада калиевых каналов, риск QT torsades',
      badge: 'Критический',
      badgeColor: 'bg-red-50 text-red-700 border-red-200',
      drugInns: ['Амиодарон (Amiodarone)', 'Кларитромицин (Clarithromycin)']
    },
    {
      title: 'Эналаприл + Верошпирон + Дигоксин',
      subtitle: 'Кардио-микс: гиперкалиемия и гликозидная интоксикация',
      badge: 'Высокий риск',
      badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
      drugInns: ['Эналаприл (Enalapril)', 'Спиронолактон (Spironolactone)', 'Дигоксин (Digoxin)']
    },
    {
      title: 'Фуросемид + Гентамицин + Кеторол',
      subtitle: 'Тройной удар: ототоксичность и нефротоксичность',
      badge: 'Высокий риск',
      badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
      drugInns: ['Фуросемид (Furosemide)', 'Гентамицин (Gentamicin)', 'Кеторолак (Ketorolac)']
    },
    {
      title: 'Морфин + Диазепам + Зопиклон',
      subtitle: 'Центральная суммация угнетения дыхания',
      badge: 'Критический',
      badgeColor: 'bg-red-50 text-red-700 border-red-200',
      drugInns: ['Морфин (Morphine)', 'Диазепам (Diazepam)', 'Зопиклон (Zopiclone)']
    },
    {
      title: 'Лизиноприл + Амлодипин',
      subtitle: 'Рациональная безопасная комбинация (Экватор)',
      badge: 'Безопасно',
      badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      drugInns: ['Лизиноприл (Lisinopril)', 'Амлодипин (Amlodipine)']
    }
  ];

  const handleApplyPresetByInns = (inns: string[]) => {
    const matched: DrugItem[] = [];
    inns.forEach(innName => {
      const found = ALL_DRUGS_FLAT.find(d => d.inn === innName || d.inn.toLowerCase().includes(innName.toLowerCase()));
      if (found) matched.push(found);
    });
    onApplyPreset(matched);
  };

  return (
    <div className="space-y-4">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
            <Pill className="w-5 h-5 text-indigo-600" />
            Ввод до 5 лекарственных препаратов
          </h2>
          <p className="text-xs text-gray-500">
            Заполните от 1 до 5 слотов для мгновенного построения матрицы коллизий
          </p>
        </div>

        {filledCount > 0 && (
          <button
            id="clear-all-drugs-btn"
            onClick={onClearAll}
            className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100/80 border border-red-200 rounded-xl transition-colors font-semibold"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Очистить все ({filledCount})
          </button>
        )}
      </div>

      {/* 5 Input Slots */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {slots.map((slot) => {
          const isFilled = slot.drug !== null;

          return (
            <div
              key={slot.slotNumber}
              className={`relative rounded-2xl p-3.5 border transition-all flex flex-col justify-between ${
                isFilled
                  ? 'bg-white border-indigo-200 shadow-sm ring-1 ring-indigo-50'
                  : 'bg-white/70 border-dashed border-gray-300 hover:border-indigo-400 hover:bg-white'
              }`}
            >
              {/* Slot Badge */}
              <div className="flex items-center justify-between gap-1 mb-2">
                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-lg text-xs font-bold ${
                  isFilled ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  {slot.slotNumber}
                </span>

                {isFilled && (
                  <button
                    onClick={() => onUpdateSlot(slot.slotNumber, null)}
                    className="text-gray-400 hover:text-red-500 p-1 rounded-lg transition-colors"
                    title="Удалить препарат"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Slot Content */}
              {isFilled ? (
                <div className="space-y-1.5 flex-1">
                  <div className="font-bold text-xs sm:text-sm text-gray-900 leading-tight">
                    {slot.drug!.inn}
                  </div>
                  {slot.drug!.trade_names && slot.drug!.trade_names.length > 0 && (
                    <div className="text-[11px] text-indigo-600 font-semibold">
                      {slot.drug!.trade_names.slice(0, 2).join(', ')}
                    </div>
                  )}
                  <div className="text-[11px] text-gray-500 line-clamp-2 mt-1">
                    {slot.drug!.group_name}
                  </div>

                  <div className="pt-2.5">
                    <button
                      onClick={() => setActiveModalSlot(slot.slotNumber)}
                      className="w-full text-center py-1.5 text-[11px] font-semibold text-gray-700 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
                    >
                      Заменить
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-4 text-center">
                  <button
                    id={`add-drug-slot-${slot.slotNumber}-btn`}
                    onClick={() => setActiveModalSlot(slot.slotNumber)}
                    className="w-full h-full flex flex-col items-center justify-center gap-2 group cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-xl bg-gray-100 group-hover:bg-indigo-50 group-hover:text-indigo-600 text-gray-400 flex items-center justify-center transition-colors">
                      <Plus className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-gray-700 group-hover:text-indigo-600">
                      Слот #{slot.slotNumber}
                    </span>
                    <span className="text-[11px] text-gray-400">Нажмите для выбора</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Clinical Presets Bar */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
            <Zap className="w-4 h-4 text-amber-500" />
            Быстрые клинические шаблоны для проверки:
          </div>
          <span className="text-xs text-gray-400 hidden sm:inline">1 клик для загрузки</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {presets.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleApplyPresetByInns(p.drugInns)}
              className="text-left p-3 rounded-xl bg-gray-50 hover:bg-white border border-gray-200 hover:border-indigo-300 hover:shadow-xs transition-all flex flex-col justify-between gap-1.5 group cursor-pointer"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">
                  {p.title}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${p.badgeColor}`}>
                  {p.badge}
                </span>
              </div>
              <p className="text-xs text-gray-500 line-clamp-1">
                {p.subtitle}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Drug Search Modal */}
      {activeModalSlot !== null && (
        <DrugSearchModal
          isOpen={activeModalSlot !== null}
          onClose={() => setActiveModalSlot(null)}
          slotNumber={activeModalSlot}
          currentlySelectedIds={currentlySelectedIds}
          onSelectDrug={(drug) => {
            onUpdateSlot(activeModalSlot, drug);
          }}
          onOpenAddDrugModal={onOpenAddDrugModal}
        />
      )}
    </div>
  );
};
