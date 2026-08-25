import React from 'react';
import { 
  ShieldAlert, 
  X, 
  AlertTriangle, 
  ArrowRight, 
  CheckCircle2, 
  PhoneCall, 
  Sliders 
} from 'lucide-react';
import { PairwiseCollision, ComprehensiveAnalysis } from '../types';

interface CriticalRiskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenReport: () => void;
  onOpenSettings: () => void;
  analysis: ComprehensiveAnalysis | null;
}

export const CriticalRiskModal: React.FC<CriticalRiskModalProps> = ({
  isOpen,
  onClose,
  onOpenReport,
  onOpenSettings,
  analysis,
}) => {
  if (!isOpen || !analysis) return null;

  const criticalCollisions = analysis.pairwiseCollisions.filter(c => c.riskLevel === 'CRITICAL');
  if (criticalCollisions.length === 0) return null;

  const primary = criticalCollisions[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-red-950/60 backdrop-blur-md animate-fade-in">
      <div 
        className="w-full max-w-xl bg-white border-2 border-red-500 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-scale-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Urgent Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-red-600 to-rose-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 text-white flex items-center justify-center border border-white/30 shrink-0 animate-pulse">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-widest text-red-100 bg-red-800/40 px-2 py-0.5 rounded-full inline-block mb-0.5">
                Black Box Warning &bull; Противопоказано
              </span>
              <h3 className="text-base sm:text-lg font-black leading-tight">
                ОБНАРУЖЕНА СМЕРТЕЛЬНО ОПАСНАЯ КОМБИНАЦИЯ!
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-gray-800">
          {/* Drug Collision Badge */}
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold text-red-900 block">
                Конфликтующая пара препаратов:
              </span>
              <span className="text-sm font-black text-red-700">
                {primary.drugA} + {primary.drugB}
              </span>
            </div>
            <span className="px-3 py-1 rounded-full bg-red-600 text-white text-xs font-black self-start sm:self-auto uppercase tracking-wide">
              Критический риск
            </span>
          </div>

          {/* Clinical Danger description */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              В чем заключается опасность:
            </h4>
            <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs text-gray-800 leading-relaxed space-y-2">
              <p className="font-semibold text-gray-900">
                {primary.consumerSummary || primary.clinicalConsequences}
              </p>
              <p className="text-gray-600">
                <b>Механизм:</b> {primary.pharmacodynamics}
              </p>
            </div>
          </div>

          {/* Action Protocol */}
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
            <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-amber-600" />
              Что необходимо сделать прямо сейчас:
            </h4>
            <ul className="text-xs text-amber-900 space-y-1 list-disc list-inside">
              <li><b>Не принимайте эти лекарства одновременно</b> без прямого указания врача.</li>
              <li>Если один из препаратов уже принят, не принимайте второй и проверьте интервал (минимум 24-48 ч).</li>
              <li>Проконсультируйтесь с лечащим врачом для подбора безопасной альтернативы.</li>
            </ul>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <button
            onClick={onOpenSettings}
            className="w-full sm:w-auto px-3.5 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-xl transition-colors flex items-center justify-center gap-1.5"
          >
            <Sliders className="w-3.5 h-3.5" />
            Настроить оповещения
          </button>

          <div className="w-full sm:w-auto flex items-center gap-2">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-bold shadow-xs"
            >
              Я понял
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenReport();
              }}
              className="flex-1 sm:flex-initial px-4 py-2 bg-red-600 hover:bg-red-700 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all"
            >
              Полный протокол
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
