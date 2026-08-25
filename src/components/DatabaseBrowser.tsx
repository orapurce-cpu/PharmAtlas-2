import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, 
  Search, 
  Pill, 
  ChevronDown, 
  ChevronUp, 
  AlertCircle, 
  ShieldAlert, 
  Check, 
  Plus, 
  Trash2, 
  Edit3, 
  Download, 
  Upload, 
  Sparkles, 
  Layers, 
  Heart,
  Activity,
  FileSpreadsheet
} from 'lucide-react';
import { DrugItem, DrugGroup } from '../types';
import { DrugDatabaseService } from '../services/drugDatabase';

interface DatabaseBrowserProps {
  onAddDrugToSlot: (drug: DrugItem) => void;
  onOpenAddDrugModal: (drugToEdit?: DrugItem) => void;
}

export const DatabaseBrowser: React.FC<DatabaseBrowserProps> = ({ 
  onAddDrugToSlot,
  onOpenAddDrugModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'custom' | 'qt'>('all');
  const [groupedDrugs, setGroupedDrugs] = useState<DrugGroup[]>([]);
  const [customDrugsCount, setCustomDrugsCount] = useState<number>(0);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const refreshData = () => {
    const groups = DrugDatabaseService.getGroupedDrugs();
    const custom = DrugDatabaseService.getCustomDrugs();
    setGroupedDrugs(groups);
    setCustomDrugsCount(custom.length);
    if (!expandedGroup && groups.length > 0) {
      setExpandedGroup(groups[0].sheet_id);
    }
  };

  useEffect(() => {
    refreshData();
    window.addEventListener('pharmatlas-db-changed', refreshData);
    return () => {
      window.removeEventListener('pharmatlas-db-changed', refreshData);
    };
  }, []);

  const handleDeleteCustomDrug = (id: string, name: string) => {
    if (window.confirm(`Вы действительно хотите удалить препарат "${name}" из базы данных?`)) {
      DrugDatabaseService.deleteDrug(id);
      refreshData();
    }
  };

  const handleExportDatabase = () => {
    const jsonStr = DrugDatabaseService.exportJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pharmatlas_drugs_db_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const res = DrugDatabaseService.importJSON(content);
        setImportStatus(res.message);
        refreshData();
        setTimeout(() => setImportStatus(null), 4000);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Filter groups
  const filteredGroups = groupedDrugs.map(g => {
    let drugs = g.drugs;

    if (activeFilter === 'custom') {
      drugs = drugs.filter(d => d.is_custom);
    } else if (activeFilter === 'qt') {
      drugs = drugs.filter(d => d.qt_risk);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      drugs = drugs.filter(d => 
        d.inn.toLowerCase().includes(q) || 
        (d.inn_lat || '').toLowerCase().includes(q) ||
        d.trade_names.some(t => t.toLowerCase().includes(q)) ||
        (d.indications || '').toLowerCase().includes(q) ||
        (d.side_effects || '').toLowerCase().includes(q) ||
        (d.mechanism_of_action || '').toLowerCase().includes(q)
      );
    }

    return {
      ...g,
      drugs
    };
  }).filter(g => g.drugs.length > 0);

  const totalFilteredDrugs = filteredGroups.reduce((acc, g) => acc + g.drugs.length, 0);

  return (
    <div className="space-y-4">
      {/* Hidden file input for JSON import */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleImportFile} 
        accept=".json" 
        className="hidden" 
      />

      {/* Main Database Header & Management Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-gray-200 shadow-sm space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                База данных лекарственных препаратов
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-[11px] font-bold">
                {totalFilteredDrugs} препаратов
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Хранилище сведений: МНН, фармакологическое действие, показания к применению и побочные эффекты
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Add new drug button */}
            <button
              id="add-new-drug-db-btn"
              onClick={() => onOpenAddDrugModal()}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              Добавить препарат
            </button>

            {/* Export DB */}
            <button
              onClick={handleExportDatabase}
              className="px-3 py-2 rounded-xl bg-white hover:bg-gray-50 active:scale-95 text-gray-700 border border-gray-200 text-xs font-semibold flex items-center gap-1 shadow-xs transition-all"
              title="Экспорт базы в JSON"
            >
              <Download className="w-3.5 h-3.5 text-gray-600" />
              <span className="hidden md:inline">Экспорт</span>
            </button>

            {/* Import DB */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-2 rounded-xl bg-white hover:bg-gray-50 active:scale-95 text-gray-700 border border-gray-200 text-xs font-semibold flex items-center gap-1 shadow-xs transition-all"
              title="Импорт базы из JSON"
            >
              <Upload className="w-3.5 h-3.5 text-gray-600" />
              <span className="hidden md:inline">Импорт</span>
            </button>
          </div>
        </div>

        {/* Import status banner if active */}
        {importStatus && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-fade-in">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{importStatus}</span>
          </div>
        )}

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2 border-t border-gray-100">
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1 sm:pb-0">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
                activeFilter === 'all'
                  ? 'bg-gray-900 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Все группы
            </button>

            <button
              onClick={() => setActiveFilter('custom')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                activeFilter === 'custom'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Пользовательские ({customDrugsCount})
            </button>

            <button
              onClick={() => setActiveFilter('qt')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                activeFilter === 'qt'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Heart className="w-3.5 h-3.5" />
              Риск удлинения QT
            </button>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Поиск по МНН, действию, показаниям..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Accordion List of Groups */}
      <div className="space-y-2.5">
        {filteredGroups.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-200 p-8 text-center space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-400 mx-auto flex items-center justify-center">
              <Pill className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">Препараты не найдены</p>
              <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
                Попробуйте изменить запрос или добавьте новый препарат в базу данных.
              </p>
            </div>
            <button
              onClick={() => onOpenAddDrugModal()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Добавить этот препарат
            </button>
          </div>
        ) : (
          filteredGroups.map(group => {
            const isExpanded = expandedGroup === group.sheet_id;

            return (
              <div
                key={group.sheet_id}
                className="rounded-2xl border border-gray-200 bg-white shadow-xs overflow-hidden transition-all"
              >
                <button
                  onClick={() => setExpandedGroup(isExpanded ? null : group.sheet_id)}
                  className="w-full p-3.5 sm:p-4 flex items-center justify-between gap-3 text-left hover:bg-gray-50/70 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {group.sheet_id.split('.')[0] || 'Класс'}
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">
                        {group.group_name}
                      </h3>
                      <span className="text-[11px] text-gray-500">
                        {group.drugs.length} активных МНН в реестре
                      </span>
                    </div>
                  </div>

                  <div className="text-gray-400">
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-indigo-600" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="p-3.5 sm:p-4 border-t border-gray-100 bg-gray-50/50 space-y-3">
                    {group.drugs.map(drug => (
                      <div
                        key={drug.id}
                        className={`p-4 rounded-2xl bg-white border shadow-xs space-y-3 transition-all ${
                          drug.is_custom ? 'border-indigo-200 bg-indigo-50/10' : 'border-gray-200'
                        }`}
                      >
                        {/* Drug Title and Action buttons */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
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
                                <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-bold flex items-center gap-1">
                                  <Sparkles className="w-3 h-3 text-indigo-600" />
                                  Пользовательский
                                </span>
                              )}
                              {drug.qt_risk && (
                                <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">
                                  Риск QT
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              <b>Торговые названия:</b> {(drug.trade_names || []).join(', ')}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 self-start sm:self-auto shrink-0">
                            {drug.is_custom && (
                              <>
                                <button
                                  onClick={() => onOpenAddDrugModal(drug)}
                                  className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                                  title="Редактировать препарат"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteCustomDrug(drug.id, drug.inn)}
                                  className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                                  title="Удалить препарат"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}

                            <button
                              onClick={() => onAddDrugToSlot(drug)}
                              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs shrink-0"
                            >
                              <Pill className="w-3.5 h-3.5" />
                              + Добавить в чекер
                            </button>
                          </div>
                        </div>

                        {/* FIELD 1: ACTION / MECHANISM */}
                        <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs">
                          <span className="font-bold text-indigo-700 block mb-1">
                            ⚙️ Действие препарата и механизм:
                          </span>
                          <p className="text-gray-700 leading-relaxed">
                            {drug.mechanism_of_action}
                          </p>
                        </div>

                        {/* FIELD 2 & 3: INDICATIONS & SIDE EFFECTS */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
                          {/* INDICATIONS */}
                          <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200">
                            <span className="font-bold text-emerald-800 block mb-1 flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                              Показания к применению:
                            </span>
                            <p className="text-emerald-950 leading-relaxed">
                              {drug.indications || 'Применяется согласно клиническим рекомендациям и нозологическим показаниям.'}
                            </p>
                          </div>

                          {/* SIDE EFFECTS */}
                          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200">
                            <span className="font-bold text-amber-800 block mb-1 flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                              Возможные побочные эффекты:
                            </span>
                            <p className="text-amber-950 leading-relaxed">
                              {drug.side_effects || 'Возможны реакции индивидуальной непереносимости, аллергические проявления.'}
                            </p>
                          </div>
                        </div>

                        {/* Dosage & Safety Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                          <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-800">
                            <b className="block text-gray-900">🟢 Терапевтическая доза:</b>
                            {drug.therapeutic_dosage}
                          </div>

                          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
                            <b className="block text-amber-800">🟡 Токсический порог:</b>
                            {drug.toxic_threshold}
                          </div>

                          <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-900">
                            <b className="block text-red-800">🔴 Противопоказания:</b>
                            {drug.absolute_contraindications}
                          </div>
                        </div>

                        {/* Dosage forms and metabolic path */}
                        <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1 border-t border-gray-100 flex-wrap gap-1">
                          <span><b>Формы выпуска:</b> {drug.dosage_forms}</span>
                          {drug.cyp_pathways && drug.cyp_pathways.length > 0 && (
                            <span className="font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                              {drug.cyp_pathways.join(', ')}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

