import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  X, 
  Trash2, 
  CheckCheck, 
  ShieldAlert, 
  AlertTriangle, 
  Info, 
  Sliders, 
  ArrowRight,
  Clock
} from 'lucide-react';
import { AlertNotificationItem } from '../types';
import { notificationService } from '../services/notificationService';

interface NotificationHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
  onOpenReport: () => void;
}

export const NotificationHistoryModal: React.FC<NotificationHistoryModalProps> = ({
  isOpen,
  onClose,
  onOpenSettings,
  onOpenReport,
}) => {
  const [history, setHistory] = useState<AlertNotificationItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'critical' | 'high'>('all');

  useEffect(() => {
    if (isOpen) {
      setHistory(notificationService.getHistory());
    }
  }, [isOpen]);

  const handleMarkAllRead = () => {
    notificationService.markAllAsRead();
    setHistory(notificationService.getHistory());
  };

  const handleClearHistory = () => {
    notificationService.clearHistory();
    setHistory([]);
  };

  const filteredHistory = history.filter(item => {
    if (filter === 'critical') return item.riskLevel === 'CRITICAL';
    if (filter === 'high') return item.riskLevel === 'HIGH' || item.riskLevel === 'CRITICAL';
    return true;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-gray-900/40 backdrop-blur-xs animate-fade-in">
      <div 
        className="w-full max-w-xl bg-white border border-gray-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
                Журнал оповещений безопасности
              </h3>
              <p className="text-xs text-gray-500">
                История выявленных опасных взаимодействий между введенными препаратами
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

        {/* Filter & Action Toolbar */}
        <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100 flex items-center justify-between gap-2 overflow-x-auto text-xs">
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                filter === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
            >
              Все ({history.length})
            </button>
            <button
              onClick={() => setFilter('critical')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                filter === 'critical'
                  ? 'bg-red-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
            >
              🚨 Только критические
            </button>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {history.length > 0 && (
              <>
                <button
                  onClick={handleMarkAllRead}
                  className="px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 flex items-center gap-1 font-medium transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5 text-indigo-600" />
                  Прочитать все
                </button>
                <button
                  onClick={handleClearHistory}
                  className="px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-red-600 hover:bg-red-50 flex items-center gap-1 font-medium transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Очистить
                </button>
              </>
            )}
          </div>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filteredHistory.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-400 mx-auto flex items-center justify-center">
                <Bell className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-700">Журнал оповещений пуст</p>
                <p className="text-xs text-gray-500 max-w-xs mx-auto mt-1">
                  При выявлении опасных или несовместимых сочетаний лекарств они будут автоматически зафиксированы здесь.
                </p>
              </div>
            </div>
          ) : (
            filteredHistory.map(item => {
              const isCritical = item.riskLevel === 'CRITICAL';
              const isHigh = item.riskLevel === 'HIGH';

              return (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    isCritical
                      ? 'bg-red-50/60 border-red-200'
                      : isHigh
                      ? 'bg-amber-50/60 border-amber-200'
                      : 'bg-indigo-50/40 border-indigo-100'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        isCritical ? 'bg-red-600 text-white' : isHigh ? 'bg-amber-600 text-white' : 'bg-indigo-600 text-white'
                      }`}>
                        {item.riskLevel}
                      </span>
                      <span className="text-xs font-bold text-gray-900">
                        {item.drugsInvolved.join(' + ')}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-gray-400 font-mono shrink-0">
                      <Clock className="w-3 h-3" />
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  <p className="text-xs text-gray-700 leading-relaxed mt-1">
                    {item.message}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <button
            onClick={() => {
              onClose();
              onOpenSettings();
            }}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            <Sliders className="w-3.5 h-3.5" />
            Настроить пороги и каналы
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold shadow-xs"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
