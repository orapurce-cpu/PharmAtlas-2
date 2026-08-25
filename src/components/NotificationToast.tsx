import React, { useEffect, useState } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  X, 
  ArrowRight, 
  Sliders, 
  Volume2 
} from 'lucide-react';
import { AlertNotificationItem } from '../types';

interface NotificationToastProps {
  alert?: AlertNotificationItem | null;
  onClose?: () => void;
  onOpenReport?: () => void;
  onOpenSettings?: () => void;
  autoDismissSeconds?: number;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  alert: propAlert,
  onClose: propOnClose,
  onOpenReport,
  onOpenSettings,
  autoDismissSeconds = 8,
}) => {
  const [internalAlert, setInternalAlert] = useState<AlertNotificationItem | null>(null);
  const [progress, setProgress] = useState(100);

  const alert = propAlert !== undefined ? propAlert : internalAlert;

  useEffect(() => {
    const handleEvent = (e: any) => {
      if (e.detail) {
        setInternalAlert(e.detail);
      }
    };
    window.addEventListener('pharmatlas-show-toast', handleEvent);
    return () => {
      window.removeEventListener('pharmatlas-show-toast', handleEvent);
    };
  }, []);

  const handleClose = () => {
    if (propOnClose) propOnClose();
    setInternalAlert(null);
  };

  useEffect(() => {
    if (!alert || autoDismissSeconds <= 0) return;

    setProgress(100);
    const intervalMs = 50;
    const totalSteps = (autoDismissSeconds * 1000) / intervalMs;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const remaining = Math.max(0, 100 - (currentStep / totalSteps) * 100);
      setProgress(remaining);
      if (remaining <= 0) {
        clearInterval(timer);
        handleClose();
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [alert, autoDismissSeconds]);

  if (!alert) return null;

  const isCritical = alert.riskLevel === 'CRITICAL';
  const isHigh = alert.riskLevel === 'HIGH';

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-lg animate-bounce-subtle">
      <div 
        className={`rounded-2xl border shadow-xl overflow-hidden backdrop-blur-md transition-all ${
          isCritical
            ? 'bg-red-50/95 border-red-300 text-red-950'
            : isHigh
            ? 'bg-amber-50/95 border-amber-300 text-amber-950'
            : 'bg-indigo-50/95 border-indigo-200 text-indigo-950'
        }`}
      >
        {/* Progress Bar */}
        {autoDismissSeconds > 0 && (
          <div className="h-1 w-full bg-black/10">
            <div 
              className={`h-full transition-all duration-75 ${
                isCritical ? 'bg-red-600' : isHigh ? 'bg-amber-600' : 'bg-indigo-600'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        <div className="p-3.5 sm:p-4 flex items-start gap-3">
          {/* Icon Badge */}
          <div 
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
              isCritical
                ? 'bg-red-100 border-red-300 text-red-600 animate-pulse'
                : isHigh
                ? 'bg-amber-100 border-amber-300 text-amber-700'
                : 'bg-indigo-100 border-indigo-200 text-indigo-600'
            }`}
          >
            {isCritical ? <ShieldAlert className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 pr-1">
            <div className="flex items-center justify-between gap-1 mb-0.5">
              <span className={`text-xs font-black uppercase tracking-wider ${
                isCritical ? 'text-red-700' : isHigh ? 'text-amber-800' : 'text-indigo-800'
              }`}>
                {isCritical ? '🚨 Экстренное предупреждение DDI' : '⚠️ Внимание: Конфликт препаратов'}
              </span>
              <span className="text-[10px] text-gray-500 font-mono">
                {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>

            <h4 className="text-xs sm:text-sm font-bold text-gray-900 line-clamp-1">
              {alert.drugsInvolved.join(' + ')}
            </h4>

            <p className="text-xs text-gray-700 mt-1 line-clamp-2 leading-relaxed">
              {alert.message}
            </p>

            {/* Actions Bar */}
            <div className="flex items-center gap-2 mt-2.5 pt-1.5 border-t border-black/5">
              <button
                onClick={() => {
                  handleClose();
                  if (onOpenReport) onOpenReport();
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold text-white flex items-center gap-1 transition-all active:scale-95 shadow-xs ${
                  isCritical ? 'bg-red-600 hover:bg-red-700' : isHigh ? 'bg-amber-700 hover:bg-amber-800' : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                Подробнее в отчете
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {onOpenSettings && (
                <button
                  onClick={() => {
                    handleClose();
                    onOpenSettings();
                  }}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-black/5 flex items-center gap-1 transition-colors"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  Настроить
                </button>
              )}
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={handleClose}
            className="w-7 h-7 rounded-full bg-black/5 hover:bg-black/10 text-gray-500 hover:text-gray-900 flex items-center justify-center transition-colors shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
