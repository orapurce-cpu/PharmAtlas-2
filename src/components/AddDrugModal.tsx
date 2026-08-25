import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Save, 
  Pill, 
  Sparkles, 
  AlertCircle, 
  Check, 
  BookOpen, 
  ShieldAlert,
  Flame,
  Activity,
  HelpCircle
} from 'lucide-react';
import { DrugItem } from '../types';
import { MASTER_DRUG_GROUPS } from '../data/pharmacologyDb';
import { DrugDatabaseService } from '../services/drugDatabase';

interface AddDrugModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDrugSaved: (drug: DrugItem) => void;
  initialDrugToEdit?: DrugItem | null;
}

export const AddDrugModal: React.FC<AddDrugModalProps> = ({
  isOpen,
  onClose,
  onDrugSaved,
  initialDrugToEdit,
}) => {
  const [inn, setInn] = useState('');
  const [innLat, setInnLat] = useState('');
  const [tradeNamesInput, setTradeNamesInput] = useState('');
  const [groupId, setGroupId] = useState('01');
  const [customGroupName, setCustomGroupName] = useState('');
  const [mechanismOfAction, setMechanismOfAction] = useState('');
  const [indications, setIndications] = useState('');
  const [sideEffects, setSideEffects] = useState('');
  const [therapeuticDosage, setTherapeuticDosage] = useState('');
  const [toxicThreshold, setToxicThreshold] = useState('');
  const [absoluteContraindications, setAbsoluteContraindications] = useState('');
  const [dosageForms, setDosageForms] = useState('');
  const [cypInput, setCypInput] = useState('');
  const [qtRisk, setQtRisk] = useState(false);

  const [validationError, setValidationError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'basic' | 'clinical' | 'safety'>('basic');

  // Fill on edit
  useEffect(() => {
    if (initialDrugToEdit) {
      setInn(initialDrugToEdit.inn);
      setInnLat(initialDrugToEdit.inn_lat || '');
      setTradeNamesInput((initialDrugToEdit.trade_names || []).join(', '));
      setGroupId(initialDrugToEdit.group_id || '01');
      setMechanismOfAction(initialDrugToEdit.mechanism_of_action || '');
      setIndications(initialDrugToEdit.indications || '');
      setSideEffects(initialDrugToEdit.side_effects || '');
      setTherapeuticDosage(initialDrugToEdit.therapeutic_dosage || '');
      setToxicThreshold(initialDrugToEdit.toxic_threshold || '');
      setAbsoluteContraindications(initialDrugToEdit.absolute_contraindications || '');
      setDosageForms(initialDrugToEdit.dosage_forms || '');
      setCypInput((initialDrugToEdit.cyp_pathways || []).join(', '));
      setQtRisk(Boolean(initialDrugToEdit.qt_risk));
    } else {
      resetForm();
    }
  }, [initialDrugToEdit, isOpen]);

  const resetForm = () => {
    setInn('');
    setInnLat('');
    setTradeNamesInput('');
    setGroupId('01');
    setCustomGroupName('');
    setMechanismOfAction('');
    setIndications('');
    setSideEffects('');
    setTherapeuticDosage('');
    setToxicThreshold('');
    setAbsoluteContraindications('');
    setDosageForms('');
    setCypInput('');
    setQtRisk(false);
    setValidationError(null);
  };

  // Quick fill sample template for fast testing
  const handleFillSample = (type: 'cardio' | 'antibiotic' | 'nsaid') => {
    if (type === 'cardio') {
      setInn('Телмисартан (Telmisartan)');
      setInnLat('Telmisartanum');
      setTradeNamesInput('Микардис, Телмиста, Прайтор');
      setGroupId('14');
      setMechanismOfAction('Селективный антагонист рецепторов ангиотензина II (тип AT1) длительного действия (T1/2 > 24 ч).');
      setIndications('Эссенциальная артериальная гипертензия у взрослых; снижение сердечно-сосудистой заболеваемости и смертности.');
      setSideEffects('Головокружение, симптоматическая гипотензия, гиперкалиемия, инфекции верхних дыхательных путей, диспепсия.');
      setTherapeuticDosage('40-80 мг 1 раз в сутки утром независимо от приема пищи.');
      setToxicThreshold('> 160 мг/сут (выраженная гипотензия, брадикардия или тахикардия, головокружение).');
      setAbsoluteContraindications('Беременность, период лактации, тяжелая печеночная недостаточность, обструкция желчевыводящих путей.');
      setDosageForms('Таблетки 40 мг, 80 мг.');
      setCypInput('Не метаболизируется CYP450 (глюкуронидация)');
      setQtRisk(false);
    } else if (type === 'antibiotic') {
      setInn('Моксифлоксацин (Moxifloxacin)');
      setInnLat('Moxifloxacinum');
      setTradeNamesInput('Авелокс, Моксимак, Хайнемокс');
      setGroupId('12');
      setMechanismOfAction('Респираторный фторхинолон IV поколения. Ингибирует бактериальную ДНК-гиразу и топоизомеразу IV.');
      setIndications('Внебольничная пневмония, обострение хронического бронхита, острый синусит, осложненные инфекции кожи.');
      setSideEffects('Удлинение интервала QT на ЭКГ, тошнота, диарея, тендинит и разрыв ахиллова сухожилия, головокружение.');
      setTherapeuticDosage('400 мг 1 раз в сутки внутрь или в/в капельно (курс 7-14 дней).');
      setToxicThreshold('> 800 мг однократно (риск тяжелой полиморфной желудочковой аритмии Torsades de Pointes).');
      setAbsoluteContraindications('Удлинение интервала QT в анамнезе, тяжелая печеночная недостаточность, возраст до 18 лет, беременность.');
      setDosageForms('Таблетки 400 мг, раствор для инфузий 400 мг/250 мл.');
      setCypInput('CYP1A2 слабый ингибитор');
      setQtRisk(true);
    } else {
      setInn('Мелоксикам (Meloxicam)');
      setInnLat('Meloxicamum');
      setTradeNamesInput('Мовалис, Артрозан, Мовасин');
      setGroupId('33');
      setMechanismOfAction('Селективный ингибитор циклооксигеназы-2 (ЦОГ-2) из класса оксикамов. Оказывает противовоспалительное действие.');
      setIndications('Остеоартроз, ревматоидный артрит, анкилозирующий спондилит (болезнь Бехтерева), болевой синдром при артропатиях.');
      setSideEffects('Диспепсия, тошнота, эрозивно-язвенные поражения ЖКТ, периферические отеки, повышение АД.');
      setTherapeuticDosage('7.5 - 15 мг 1 раз в сутки во время еды.');
      setToxicThreshold('> 30 мг/сут (риск ЖКТ-кровотечения, острой почечной недостаточности).');
      setAbsoluteContraindications('Острая язва желудка/12-перстной кишки, активное ЖКТ-кровотечение, тяжелая сердечная или почечная недостаточность.');
      setDosageForms('Таблетки 7.5 мг, 15 мг; раствор для в/м введения 15 мг/1.5 мл.');
      setCypInput('CYP2C9 субстрат, CYP3A4 субстрат');
      setQtRisk(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!inn.trim()) {
      setValidationError('Пожалуйста, укажите название препарата (МНН)');
      setActiveTab('basic');
      return;
    }

    const selectedGroup = MASTER_DRUG_GROUPS.find(g => g.sheet_id.startsWith(groupId));
    const groupName = selectedGroup ? selectedGroup.group_name : (customGroupName.trim() || 'ПОЛЬЗОВАТЕЛЬСКАЯ ГРУППА');

    const tradeNames = tradeNamesInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const cypPathways = cypInput
      .split(',')
      .map(c => c.trim())
      .filter(Boolean);

    const drugPayload = {
      inn: inn.trim(),
      inn_lat: innLat.trim() || undefined,
      trade_names: tradeNames.length > 0 ? tradeNames : [inn.trim()],
      group_id: groupId,
      group_name: groupName,
      mechanism_of_action: mechanismOfAction.trim() || 'Фармакологическое действие в соответствии с классификацией ГРЛС',
      indications: indications.trim() || 'Показания согласно утвержденной инструкции препарата',
      side_effects: sideEffects.trim() || 'Возможны аллергические реакции и индивидуальная непереносимость',
      profiles_and_targets: 'Фармакологические рецепторы и молекулярные мишени',
      therapeutic_dosage: therapeuticDosage.trim() || 'По назначению лечащего врача',
      toxic_threshold: toxicThreshold.trim() || 'Превышение максимальной терапевтической дозы',
      absolute_contraindications: absoluteContraindications.trim() || 'Гиперчувствительность к компонентам препарата',
      dosage_forms: dosageForms.trim() || 'Таблетки / капсулы',
      cyp_pathways: cypPathways,
      qt_risk: qtRisk,
    };

    let savedDrug: DrugItem;

    if (initialDrugToEdit && initialDrugToEdit.is_custom) {
      DrugDatabaseService.updateDrug(initialDrugToEdit.id, drugPayload);
      savedDrug = { ...initialDrugToEdit, ...drugPayload };
    } else {
      savedDrug = DrugDatabaseService.addDrug(drugPayload);
    }

    onDrugSaved(savedDrug);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-gray-900/40 backdrop-blur-xs animate-fade-in">
      <div 
        className="w-full max-w-2xl bg-white border border-gray-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900">
                {initialDrugToEdit ? 'Редактирование препарата' : 'Добавить новый препарат в базу'}
              </h3>
              <p className="text-xs text-gray-500">
                Включая название, механизм, показания и побочные эффекты
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:text-gray-900 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Samples Banner for convenient testing */}
        {!initialDrugToEdit && (
          <div className="px-4 py-2.5 bg-indigo-50/50 border-b border-indigo-100 flex items-center justify-between gap-2 overflow-x-auto text-xs">
            <span className="text-indigo-900 font-semibold flex items-center gap-1 shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              Быстрое заполнение примера:
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => handleFillSample('cardio')}
                className="px-2.5 py-1 rounded-lg bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-medium transition-all"
              >
                + Телмисартан (БРА)
              </button>
              <button
                type="button"
                onClick={() => handleFillSample('antibiotic')}
                className="px-2.5 py-1 rounded-lg bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-medium transition-all"
              >
                + Моксифлоксацин (QT)
              </button>
              <button
                type="button"
                onClick={() => handleFillSample('nsaid')}
                className="px-2.5 py-1 rounded-lg bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-medium transition-all"
              >
                + Мелоксикам (НПВП)
              </button>
            </div>
          </div>
        )}

        {/* Navigation Tabs inside form */}
        <div className="px-4 pt-3 border-b border-gray-100 bg-gray-50/40 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('basic')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'basic'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            1. Название и Действие
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('clinical')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'clinical'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            2. Показания и Побочные эффекты
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('safety')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'safety'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            3. Дозировки и Безопасность
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {validationError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{validationError}</span>
            </div>
          )}

          {/* TAB 1: BASIC INFORMATION */}
          {activeTab === 'basic' && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Название препарата (МНН) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={inn}
                    onChange={e => {
                      setInn(e.target.value);
                      if (validationError) setValidationError(null);
                    }}
                    placeholder="Например: Телмисартан (Telmisartan)"
                    className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Латинское название (Lat)
                  </label>
                  <input
                    type="text"
                    value={innLat}
                    onChange={e => setInnLat(e.target.value)}
                    placeholder="Например: Telmisartanum"
                    className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Торговые наименования (через запятую)
                </label>
                <input
                  type="text"
                  value={tradeNamesInput}
                  onChange={e => setTradeNamesInput(e.target.value)}
                  placeholder="Микардис, Телмиста, Прайтор..."
                  className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Фармакологическая группа
                </label>
                <select
                  value={groupId}
                  onChange={e => setGroupId(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-sm text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                >
                  {MASTER_DRUG_GROUPS.map(g => (
                    <option key={g.sheet_id} value={g.sheet_id.split('.')[0] || g.sheet_id}>
                      {g.sheet_id} — {g.group_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center justify-between">
                  <span>Действие препарата и механизм <span className="text-red-500">*</span></span>
                  <span className="text-[11px] text-gray-400 font-normal">Фармакодинамика</span>
                </label>
                <textarea
                  rows={3}
                  value={mechanismOfAction}
                  onChange={e => setMechanismOfAction(e.target.value)}
                  placeholder="Опишите, как действует препарат на клеточном и системном уровне..."
                  className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>
          )}

          {/* TAB 2: INDICATIONS AND SIDE EFFECTS */}
          {activeTab === 'clinical' && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Показания к применению препарата
                </label>
                <textarea
                  rows={3}
                  value={indications}
                  onChange={e => setIndications(e.target.value)}
                  placeholder="Заболевания, состояния и клинические синдромы (например: Артериальная гипертензия, профилактика сердечно-сосудистых событий...)"
                  className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  Возможные побочные эффекты
                </label>
                <textarea
                  rows={3}
                  value={sideEffects}
                  onChange={e => setSideEffects(e.target.value)}
                  placeholder="Частые и опасные нежелательные реакции (например: головокружение, кашель, гиперкалиемия, диспепсия, аллергические сыпи...)"
                  className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Формы выпуска
                </label>
                <input
                  type="text"
                  value={dosageForms}
                  onChange={e => setDosageForms(e.target.value)}
                  placeholder="Таблетки 40 мг, 80 мг; раствор для инфузий..."
                  className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>
          )}

          {/* TAB 3: DOSAGE & SAFETY */}
          {activeTab === 'safety' && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Терапевтическая дозировка
                  </label>
                  <input
                    type="text"
                    value={therapeuticDosage}
                    onChange={e => setTherapeuticDosage(e.target.value)}
                    placeholder="Например: 40 мг 1 раз в сутки"
                    className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Токсический порог / Передозировка
                  </label>
                  <input
                    type="text"
                    value={toxicThreshold}
                    onChange={e => setToxicThreshold(e.target.value)}
                    placeholder="Например: > 160 мг (коллапс АД, брадикардия)"
                    className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Абсолютные противопоказания
                </label>
                <textarea
                  rows={2}
                  value={absoluteContraindications}
                  onChange={e => setAbsoluteContraindications(e.target.value)}
                  placeholder="Беременность, лактация, тяжелая печеночная недостаточность, кардиогенный шок..."
                  className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div className="p-3 bg-gray-50 border border-gray-200 rounded-2xl space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Пути метаболизма (CYP450 / P-gp)
                  </label>
                  <input
                    type="text"
                    value={cypInput}
                    onChange={e => setCypInput(e.target.value)}
                    placeholder="Например: CYP3A4 субстрат, CYP2D6 ингибитор"
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={qtRisk}
                    onChange={e => setQtRisk(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                  />
                  <span className="text-xs text-gray-700 font-medium">
                    Опасность удлинения интервала QT на ЭКГ (риск аритмии Torsades de Pointes)
                  </span>
                </label>
              </div>
            </div>
          )}
        </form>

        {/* Footer actions */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold shadow-xs"
          >
            Отмена
          </button>

          <div className="flex items-center gap-2">
            {activeTab !== 'safety' ? (
              <button
                type="button"
                onClick={() => setActiveTab(activeTab === 'basic' ? 'clinical' : 'safety')}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl text-xs font-semibold"
              >
                Далее &rarr;
              </button>
            ) : null}

            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all"
            >
              <Save className="w-4 h-4" />
              {initialDrugToEdit ? 'Сохранить изменения' : 'Добавить в базу данных'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
