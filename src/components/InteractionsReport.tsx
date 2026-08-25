import React, { useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  Activity, 
  Stethoscope, 
  User, 
  HeartHandshake, 
  Sparkles, 
  Copy, 
  Check, 
  FileText, 
  HelpCircle, 
  Clock, 
  Flame, 
  Info,
  Layers,
  Heart,
  Droplet
} from 'lucide-react';
import { AudienceMode, ComprehensiveAnalysis, DrugItem, RiskLevel } from '../types';
import { ReceptorFingerprintChart } from './ReceptorFingerprintChart';

interface InteractionsReportProps {
  analysis: ComprehensiveAnalysis | null;
  selectedDrugs: DrugItem[];
  audienceMode: AudienceMode;
  isLoading: boolean;
  onRefreshAnalysis: () => void;
}

export const InteractionsReport: React.FC<InteractionsReportProps> = ({
  analysis,
  selectedDrugs,
  audienceMode,
  isLoading,
  onRefreshAnalysis,
}) => {
  const [copied, setCopied] = useState(false);

  if (selectedDrugs.length === 0) {
    return (
      <div className="text-center py-12 px-4 bg-white border border-dashed border-gray-300 rounded-3xl shadow-xs">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3 border border-indigo-100 shadow-xs">
          <Stethoscope className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-gray-900">
          Слоты препаратов пусты
        </h3>
        <p className="text-xs text-gray-500 max-w-md mx-auto mt-1">
          Выберите от 2 до 5 лекарственных средств выше или нажмите на готовый шаблон, чтобы запустить глубокий анализ межлекарственных взаимодействий (DDI Engine).
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-16 px-4 bg-white border border-gray-200 rounded-3xl shadow-sm space-y-4">
        <div className="relative w-14 h-14 mx-auto">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin"></div>
          <div className="absolute inset-2 rounded-full bg-white flex items-center justify-center text-indigo-600 text-lg font-bold">
            💊
          </div>
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-900 flex items-center justify-center gap-2">
            Выполняется клинический анализ взаимодействия
            <span className="inline-block w-2 h-2 rounded-full bg-indigo-600 animate-ping"></span>
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Сопоставление рецепторного сродства, ферментов CYP450 и доказательных клинических руководств...
          </p>
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  const isCritical = analysis.overallRisk === 'CRITICAL';
  const isHigh = analysis.overallRisk === 'HIGH';
  const isModerate = analysis.overallRisk === 'MODERATE';
  const isSafe = analysis.overallRisk === 'LOW' || analysis.overallRisk === 'SAFE_SYNERGY';

  const riskBannerStyles = isCritical
    ? 'bg-red-50/90 border-red-200 text-red-950'
    : isHigh
    ? 'bg-amber-50/90 border-amber-200 text-amber-950'
    : isModerate
    ? 'bg-blue-50/90 border-blue-200 text-blue-950'
    : 'bg-emerald-50/90 border-emerald-200 text-emerald-950';

  const riskTitle = isCritical
    ? 'КРИТИЧЕСКИЙ РИСК (ПРОТИВОПОКАЗАНО)'
    : isHigh
    ? 'ВЫСОКИЙ КЛИНИЧЕСКИЙ РИСК (ТРЕБУЕТСЯ КОРРЕКЦИЯ)'
    : isModerate
    ? 'УМЕРЕННЫЙ РИСК (ТРЕБУЕТСЯ НАБЛЮДЕНИЕ)'
    : 'БЕЗОПАСНАЯ КОМБИНАЦИЯ (РАЦИОНАЛЬНОЕ СОЧЕТАНИЕ)';

  const handleCopyReport = () => {
    const summaryText = `[PharmAtlas Clinical Report]\n` +
      `Дата: ${new Date().toLocaleDateString('ru-RU')}\n` +
      `Препараты (${selectedDrugs.length}): ${selectedDrugs.map(d => d.inn).join(', ')}\n` +
      `Общий уровень риска: ${analysis.overallRisk} (${analysis.riskScore}/100)\n` +
      `Вердикт: ${audienceMode === 'professional' ? analysis.summaryHeadline.professional : analysis.summaryHeadline.consumer}\n\n` +
      `Коллизии:\n` +
      analysis.pairwiseCollisions.map((c, i) => `${i + 1}. ${c.drugA} + ${c.drugB} [${c.riskLevel}]: ${c.interactionType}\n- Проф: ${c.clinicalConsequences}\n- Для пациента: ${c.consumerSummary}`).join('\n\n');

    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Risk Banner */}
      <div className={`p-4 sm:p-5 rounded-3xl border shadow-sm ${riskBannerStyles} transition-all`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
              isCritical ? 'bg-red-600 text-white' : isHigh ? 'bg-amber-600 text-white' : isModerate ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'
            }`}>
              {isCritical ? <ShieldAlert className="w-6 h-6" /> : isHigh ? <AlertTriangle className="w-6 h-6" /> : isModerate ? <Info className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/80 border border-black/10">
                  {riskTitle}
                </span>
                {analysis.aiGenerated && (
                  <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-100/80 border border-indigo-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-indigo-600" />
                    Gemini AI Clinical Engine
                  </span>
                )}
              </div>

              <h3 className="text-sm sm:text-base font-bold text-gray-900 mt-1.5 leading-snug">
                {audienceMode === 'professional'
                  ? analysis.summaryHeadline.professional
                  : analysis.summaryHeadline.consumer}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {/* Risk Meter Gauge */}
            <div className="text-right px-3.5 py-1.5 bg-white/80 rounded-2xl border border-black/5 shadow-xs">
              <span className="text-[10px] text-gray-500 block uppercase font-mono font-semibold">Опасность</span>
              <span className="text-lg font-black text-gray-900 font-mono">
                {analysis.riskScore}<span className="text-xs text-gray-400">/100</span>
              </span>
            </div>

            <button
              id="copy-clinical-report-btn"
              onClick={handleCopyReport}
              className="p-2.5 rounded-2xl bg-white hover:bg-gray-50 active:scale-95 text-gray-700 border border-gray-200 shadow-xs transition-all flex items-center gap-1.5 text-xs font-semibold"
              title="Скопировать клинический отчет"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-gray-600" />}
              <span className="hidden sm:inline">{copied ? 'Скопировано' : 'Отчет'}</span>
            </button>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full bg-black/10 h-2 rounded-full mt-3.5 overflow-hidden p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isCritical ? 'bg-red-500' : isHigh ? 'bg-amber-500' : isModerate ? 'bg-blue-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.max(8, analysis.riskScore)}%` }}
          ></div>
        </div>
      </div>

      {/* Mode View: PROFESSIONAL vs CONSUMER */}
      {audienceMode === 'professional' ? (
        /* ================= PROFESSIONAL VIEW ================= */
        <div className="space-y-4">
          {/* Pairwise Collisions Matrix */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-indigo-600" />
                Попарный анализ взаимодействий (Drug-Drug Collision Matrix): {analysis.pairwiseCollisions.length} коллизий
              </h3>
              <span className="text-xs text-gray-500">Формат CDSS / Клинические рекомендации</span>
            </div>

            {analysis.pairwiseCollisions.length === 0 ? (
              <div className="p-4 rounded-2xl bg-white border border-gray-200 text-xs text-gray-700 flex items-center gap-2 shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Прямых антагонистических или токсических перекрестных коллизий между выбранными препаратами в фармакопейных базах не зафиксировано.</span>
              </div>
            ) : (
              analysis.pairwiseCollisions.map((collision, idx) => {
                const cCrit = collision.riskLevel === 'CRITICAL';
                const cHigh = collision.riskLevel === 'HIGH';
                const cMod = collision.riskLevel === 'MODERATE';

                return (
                  <div
                    key={idx}
                    className={`rounded-2xl p-4 border transition-all bg-white shadow-xs ${
                      cCrit
                        ? 'border-red-200 ring-1 ring-red-50'
                        : cHigh
                        ? 'border-amber-200 ring-1 ring-amber-50'
                        : cMod
                        ? 'border-blue-200'
                        : 'border-gray-200'
                    }`}
                  >
                    {/* Pair Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${
                          cCrit ? 'bg-red-500 animate-ping' : cHigh ? 'bg-amber-500' : 'bg-blue-400'
                        }`}></span>
                        <h4 className="text-sm font-bold text-gray-900">
                          {collision.drugA} <span className="text-gray-400 font-normal">+</span> {collision.drugB}
                        </h4>
                      </div>

                      <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border self-start sm:self-auto ${
                        cCrit ? 'bg-red-50 text-red-700 border-red-200' : cHigh ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {collision.riskLevel}: {collision.interactionType}
                      </span>
                    </div>

                    {/* Detailed Clinical Breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 text-xs">
                      {/* Pharmacodynamics */}
                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
                        <span className="font-bold text-indigo-700 text-[11px] uppercase tracking-wider block">
                          🔬 Фармакодинамический механизм:
                        </span>
                        <p className="text-gray-700 leading-relaxed">
                          {collision.pharmacodynamics}
                        </p>
                      </div>

                      {/* Pharmacokinetics & Metabolism */}
                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
                        <span className="font-bold text-indigo-700 text-[11px] uppercase tracking-wider block">
                          🧬 Фармакокинетика & Метаболизм:
                        </span>
                        <p className="text-gray-700 leading-relaxed">
                          {collision.pharmacokinetics}
                        </p>
                      </div>

                      {/* Clinical Consequences */}
                      <div className="p-3 bg-red-50/70 rounded-xl border border-red-200 space-y-1">
                        <span className="font-bold text-red-700 text-[11px] uppercase tracking-wider block">
                          ⚠️ Клинические риски & Осложнения:
                        </span>
                        <p className="text-red-900 leading-relaxed font-medium">
                          {collision.clinicalConsequences}
                        </p>
                      </div>

                      {/* Monitoring Protocol & Doctor Action */}
                      <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200 space-y-1">
                        <span className="font-bold text-emerald-700 text-[11px] uppercase tracking-wider block">
                          👨‍⚕️ Тактика врача & Протокол мониторинга:
                        </span>
                        <p className="text-emerald-900 leading-relaxed font-medium">
                          {collision.doctorRecommendation}
                        </p>
                        <p className="text-xs text-gray-500 pt-1 border-t border-emerald-200/60">
                          <b>Контроль:</b> {collision.monitoringProtocol}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Metabolic & Cytochrome P450 Collisions */}
          {analysis.metabolicCollisions && analysis.metabolicCollisions.length > 0 && (
            <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" />
                Ферментные коллизии (CYP450 / Транспортеры P-гликопротеина)
              </h4>
              <div className="space-y-2">
                {analysis.metabolicCollisions.map((mc, mIdx) => (
                  <div key={mIdx} className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs">
                    <span className="font-bold text-indigo-700">{mc.enzyme}:</span>{' '}
                    <span className="text-gray-700">{mc.description}</span>
                    <div className="mt-1 flex items-center gap-1 text-[11px] text-gray-500">
                      <span>Задействованные препараты:</span>
                      <span className="text-indigo-600 font-semibold font-mono">{mc.affectedDrugs.join(', ')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Autonomic & Cardiorenal Fingerprint Chart */}
          <ReceptorFingerprintChart drugs={selectedDrugs} />

          {/* Organ Impact Matrix */}
          <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              Влияние на витальные системы органов
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {analysis.vitalOrganImpacts.map((org, oIdx) => (
                <div
                  key={oIdx}
                  className={`p-3 rounded-xl border flex flex-col justify-between gap-1 text-xs ${
                    org.status === 'danger'
                      ? 'bg-red-50/70 border-red-200 text-red-900'
                      : org.status === 'caution'
                      ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                      : 'bg-gray-50 border-gray-200 text-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900">{org.organ}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      org.status === 'danger' ? 'bg-red-100 text-red-800' : org.status === 'caution' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {org.status === 'danger' ? 'Угроза' : org.status === 'caution' ? 'Внимание' : 'Норма'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {org.detailsPro}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Professional Monitoring Checklist */}
          {analysis.monitoringChecklist && analysis.monitoringChecklist.length > 0 && (
            <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Клинический чек-лист лабораторного и инструментального мониторинга
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-700">
                {analysis.monitoringChecklist.map((item, iIdx) => (
                  <li key={iIdx} className="flex items-start gap-2 p-2.5 rounded-xl bg-gray-50 border border-gray-200">
                    <span className="text-emerald-600 font-bold font-mono">0{iIdx + 1}.</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        /* ================= CONSUMER VIEW ================= */
        <div className="space-y-4">
          {/* Plain Summary & Traffic Light Guide */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm sm:text-base font-bold text-gray-900">
                Что это значит для вашего здоровья? (Понятное руководство)
              </h3>
            </div>

            <p className="text-sm text-gray-700 leading-relaxed">
              {analysis.summaryHeadline.consumer}
            </p>

            {analysis.polypharmacyWarnings.consumer.length > 0 && (
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
                <span className="font-bold block">💡 Важное примечание:</span>
                {analysis.polypharmacyWarnings.consumer.map((pw, pwIdx) => (
                  <p key={pwIdx}>{pw}</p>
                ))}
              </div>
            )}
          </div>

          {/* Simple Pairwise Consumer Cards */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-600" />
              Разбор сочетания лекарств простыми словами:
            </h3>

            {analysis.pairwiseCollisions.length === 0 ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 shadow-xs">
                🎉 Ваши препараты отлично уживаются друг с другом и не вызывают вредных взаимных реакций. Принимайте их по схеме, назначенной врачом!
              </div>
            ) : (
              analysis.pairwiseCollisions.map((collision, idx) => {
                const cCrit = collision.riskLevel === 'CRITICAL';
                const cHigh = collision.riskLevel === 'HIGH';

                return (
                  <div
                    key={idx}
                    className={`rounded-2xl p-4 border transition-all bg-white shadow-xs ${
                      cCrit
                        ? 'border-red-200'
                        : cHigh
                        ? 'border-amber-200'
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h4 className="text-sm font-bold text-gray-900">
                        {collision.drugA} + {collision.drugB}
                      </h4>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        cCrit ? 'bg-red-50 text-red-700 border-red-200' : cHigh ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-blue-50 text-blue-800 border-blue-200'
                      }`}>
                        {cCrit ? 'Опасно для жизни' : cHigh ? 'Высокий риск' : 'Требует внимания'}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-medium">
                      {collision.consumerSummary}
                    </p>

                    <div className="mt-3 p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs space-y-2">
                      <div className="text-emerald-700 font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Совет пациенту:
                      </div>
                      <p className="text-gray-700">
                        {collision.consumerAction}
                      </p>

                      {collision.foodAndLifestyleTips && (
                        <p className="text-xs text-gray-500 pt-1.5 border-t border-gray-200">
                          🍏 <b>Питание и образ жизни:</b> {collision.foodAndLifestyleTips}
                        </p>
                      )}
                    </div>

                    {/* Danger Signs */}
                    {collision.dangerSigns && collision.dangerSigns.length > 0 && (
                      <div className="mt-2.5 p-3 bg-red-50 border border-red-200 rounded-xl text-xs space-y-1.5">
                        <span className="font-bold text-red-800 text-[11px] block">
                          🚨 Срочно к врачу или вызов скорой помощи при появлении:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {collision.dangerSigns.map((ds, dsIdx) => (
                            <span key={dsIdx} className="px-2 py-0.5 rounded-md bg-red-100 text-red-800 text-[11px] font-semibold border border-red-200">
                              &bull; {ds}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Simple Action Plan */}
          {analysis.actionPlanConsumer && analysis.actionPlanConsumer.length > 0 && (
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-2.5">
              <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-600" />
                Золотые правила приема этих лекарств
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-700">
                {analysis.actionPlanConsumer.map((rule, rIdx) => (
                  <div key={rIdx} className="p-3 rounded-xl bg-gray-50 border border-gray-200 flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center shrink-0 text-xs">
                      {rIdx + 1}
                    </span>
                    <span className="leading-snug">{rule}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Questions to Ask Doctor */}
          {analysis.questionsForDoctor && analysis.questionsForDoctor.length > 0 && (
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-2.5">
              <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4" />
                Что спросить у лечащего врача на приеме?
              </h4>
              <p className="text-xs text-gray-500">
                Вы можете показать эти вопросы доктору прямо с экрана смартфона:
              </p>
              <div className="space-y-1.5">
                {analysis.questionsForDoctor.map((q, qIdx) => (
                  <div key={qIdx} className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-800 flex items-center gap-2">
                    <span className="text-indigo-600 font-bold">❓</span>
                    <span>{q}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
