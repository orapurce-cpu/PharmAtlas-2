import React, { useState, useMemo, useEffect } from 'react';
import { Search, X, Pill, ShieldAlert, Sparkles, Check, Plus } from 'lucide-react';
import { DrugItem } from '../types';
import { DrugDatabaseService } from '../services/drugDatabase';
import { MASTER_DRUG_GROUPS } from '../data/pharmacologyDb';

interface DrugSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDrug: (drug: DrugItem) => void;
  onOpenAddDrugModal?: () => void;
  slotNumber: number;
  currentlySelectedIds: string[];
}

export const DrugSearchModal: React.FC<DrugSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectDrug,
  onOpenAddDrugModal,
  slotNumber,
  currentlySelectedIds,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>('all');
  const [allDrugs, setAllDrugs] = useState<DrugItem[]>([]);

  useEffect(() => {
    if (isOpen) {
      setAllDrugs(DrugDatabaseService.getAllDrugs());
    }
  }, [isOpen]);

  const filteredDrugs = useMemo(() => {
    let list = allDrugs;

    if (selectedGroupFilter !== 'all') {
      if (selectedGroupFilter === 'custom') {
        list = list.filter(d => d.is_custom);
      } else {
        list = list.filter(d => d.group_id === selectedGroupFilter || d.group_name === selectedGroupFilter);
      }
    }

    if (!searchQuery.trim()) {
      return list;
    }

    const q = searchQuery.toLowerCase().trim();
    return list.filter(d => {
      const innRu = d.inn.toLowerCase().includes(q);
      const innLat = (d.inn_lat || '').toLowerCase().includes(q);
      const trade = (d.trade_names || []).some(t => t.toLowerCase().includes(q));
      const group = (d.group_name || '').toLowerCase().includes(q);
      const indications = (d.indications || '').toLowerCase().includes(q);
      const action = (d.mechanism_of_action || '').toLowerCase().includes(q);
      return innRu || innLat || trade || group || indications || action;
    });
  }, [searchQuery, selectedGroupFilter, allDrugs]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
      <div 
        className="w-full max-w-2xl bg-white border border-gray-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm border border-indigo-100">
              #{slotNumber}
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">
                Выбор препарата для Слота {slotNumber}
              </h3>
              <p className="text-xs text-gray-500">
                Поиск по МНН, торговым маркам, действию и показаниям
              </p>
            </div>
          </div>
          <button
            id="close-search-modal-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:text-gray-900 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar Input */}
        <div className="p-4 bg-gray-50/70 border-b border-gray-200 flex flex-col gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Например: Нитроглицерин, Виагра, Лазикс, Дигоксин, Энап, Кордарон..."
              className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-10 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Group Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            <button
              onClick={() => setSelectedGroupFilter('all')}
              className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-all ${
                selectedGroupFilter === 'all'
                  ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              Все ({allDrugs.length})
            </button>

            <button
              onClick={() => setSelectedGroupFilter('custom')}
              className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-all flex items-center gap-1 ${
                selectedGroupFilter === 'custom'
                  ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              Пользовательские
            </button>

            {MASTER_DRUG_GROUPS.slice(0, 7).map(g => (
              <button
                key={g.sheet_id}
                onClick={() => setSelectedGroupFilter(g.group_name)}
                className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-all ${
                  selectedGroupFilter === g.group_name
                    ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {g.group_name.length > 20 ? g.group_name.substring(0, 18) + '…' : g.group_name}
              </button>
            ))}
          </div>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-1 divide-y divide-gray-100">
          {filteredDrugs.length === 0 ? (
            <div className="text-center py-10 px-4 space-y-3">
              <Pill className="w-10 h-10 text-gray-300 mx-auto" />
              <div>
                <p className="text-sm font-semibold text-gray-700">
                  Препарат не найден в базе данных
                </p>
                <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
                  Вы можете добавить этот препарат в базу с указанием действия, показаний и побочных эффектов.
                </p>
              </div>
              {onOpenAddDrugModal && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAddDrugModal();
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-xs transition-all"
                >
                  <Plus className="w-4 h-4" />
                  + Добавить препарат в базу
                </button>
              )}
            </div>
          ) : (
            filteredDrugs.map(drug => {
              const isAlreadySelected = currentlySelectedIds.includes(drug.id);
              return (
                <div
                  key={drug.id}
                  onClick={() => {
                    onSelectDrug(drug);
                    onClose();
                  }}
                  className={`pt-2.5 first:pt-0 p-3 rounded-2xl cursor-pointer transition-all flex items-start justify-between gap-3 ${
                    isAlreadySelected
                      ? 'bg-gray-50 opacity-60 hover:opacity-100 hover:bg-gray-100'
                      : 'hover:bg-indigo-50/50 active:bg-indigo-50'
                  }`}
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-gray-900">
                        {drug.inn}
                      </span>
                      {drug.inn_lat && (
                        <span className="text-xs font-mono text-indigo-600 italic">
                          ({drug.inn_lat})
                        </span>
                      )}
                      {drug.is_custom && (
                        <span className="text-[10px] font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                          <Sparkles className="w-2.5 h-2.5" />
                          Свой
                        </span>
                      )}
                      {isAlreadySelected && (
                        <span className="text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full">
                          Уже в слоте
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-gray-500 flex items-center gap-1.5 flex-wrap">
                      <span className="text-gray-700 font-semibold">Торговые:</span>
                      {(drug.trade_names || []).map(tn => (
                        <span
                          key={tn}
                          className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 border border-gray-200 text-[11px]"
                        >
                          {tn}
                        </span>
                      ))}
                    </div>

                    <p className="text-xs text-gray-600 line-clamp-1">
                      <span className="text-gray-800 font-medium">Действие:</span> {drug.mechanism_of_action}
                    </p>
                    {drug.indications && (
                      <p className="text-[11px] text-emerald-800 line-clamp-1">
                        <span className="font-semibold">Показания:</span> {drug.indications}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    className="shrink-0 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1 transition-transform active:scale-95"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Выбрать
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 flex items-center justify-between">
          <span>Найдено: {filteredDrugs.length} препаратов</span>
          <div className="flex items-center gap-2">
            {onOpenAddDrugModal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAddDrugModal();
                }}
                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold border border-indigo-200 flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Новый в базу
              </button>
            )}
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 bg-white hover:bg-gray-100 text-gray-700 rounded-lg text-xs font-medium border border-gray-200 shadow-xs"
            >
              Закрыть
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

