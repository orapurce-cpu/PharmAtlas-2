import React, { useEffect, useState } from 'react';
import { 
  Bell, 
  Plus, 
  Smartphone, 
  Sliders 
} from 'lucide-react';
import { AudienceMode } from '../types';
import { notificationService } from '../services/notificationService';

interface AndroidHeaderProps {
  audienceMode: AudienceMode;
  onToggleMode: (mode: AudienceMode) => void;
  onOpenFilesModal: () => void;
  onOpenAddDrugModal: () => void;
  onOpenNotificationSettings: () => void;
  onOpenNotificationHistory: () => void;
  selectedCount: number;
}

export const AndroidHeader: React.FC<AndroidHeaderProps> = ({
  audienceMode,
  onToggleMode,
  onOpenFilesModal,
  onOpenAddDrugModal,
  onOpenNotificationSettings,
  onOpenNotificationHistory,
  selectedCount,
}) => {
  const [timeStr, setTimeStr] = useState('12:00');
  const [unreadAlertsCount, setUnreadAlertsCount] = useState<number>(0);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);

    const updateAlerts = () => {
      const history = notificationService.getHistory();
      const unread = history.filter(h => !h.isRead).length;
      setUnreadAlertsCount(unread);
    };
    updateAlerts();

    window.addEventListener('pharmatlas-history-updated', updateAlerts);
    return () => {
      clearInterval(interval);
      window.removeEventListener('pharmatlas-history-updated', updateAlerts);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-xs">
      {/* Android Native Status Bar */}
      <div className="max-w-4xl mx-auto px-4 py-1 flex items-center justify-between text-xs text-gray-500 font-mono select-none border-b border-gray-100/80">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-700">{timeStr}</span>
          <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold bg-indigo-50 text-indigo-700 rounded border border-indigo-100">
            5G+
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="text-emerald-700 font-sans font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            ГРЛС 2.0 (Offline)
          </span>
          <span className="flex items-center gap-1 text-gray-600">
            <span>98%</span>
            <div className="w-4 h-2 border border-gray-400 rounded-xs p-0.5 flex items-center">
              <div className="h-full w-3 bg-gray-600 rounded-2xs"></div>
            </div>
          </span>
        </div>
      </div>

      {/* Main App Bar */}
      <div className="max-w-4xl mx-auto px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-sm text-white font-bold text-base sm:text-lg shrink-0">
            💊
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm sm:text-lg font-bold text-gray-900 tracking-tight truncate">
                PharmAtlas
              </h1>
              <span className="hidden sm:inline text-[10px] uppercase font-bold px-1.5 py-0.5 bg-gray-100 text-indigo-600 border border-gray-200 rounded">
                Android Ready
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-gray-500 truncate">
              {selectedCount}/5 препаратов &bull; База + DDI чекер
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Quick Add Drug Button */}
          <button
            id="quick-add-drug-header-btn"
            onClick={onOpenAddDrugModal}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 active:scale-95 text-indigo-700 border border-indigo-200 text-xs font-bold transition-all shadow-xs"
            title="Добавить новый препарат в базу"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">+ Препарат</span>
            <span className="sm:hidden">+ База</span>
          </button>

          {/* Notification Bell with Badge */}
          <button
            id="open-notifications-bell-btn"
            onClick={onOpenNotificationHistory}
            className="relative p-2 rounded-xl bg-white hover:bg-gray-50 active:scale-95 text-gray-700 border border-gray-200 text-xs font-semibold transition-all shadow-xs"
            title="Журнал уведомлений об угрозах"
          >
            <Bell className="w-4 h-4 text-gray-600" />
            {unreadAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white rounded-full text-[9px] font-black flex items-center justify-center animate-pulse">
                {unreadAlertsCount > 9 ? '9+' : unreadAlertsCount}
              </span>
            )}
          </button>

          {/* Notification Settings quick button */}
          <button
            id="open-notifications-settings-btn"
            onClick={onOpenNotificationSettings}
            className="p-2 rounded-xl bg-white hover:bg-gray-50 active:scale-95 text-gray-700 border border-gray-200 text-xs font-semibold transition-all shadow-xs hidden sm:flex"
            title="Настройки уведомлений"
          >
            <Sliders className="w-4 h-4 text-gray-600" />
          </button>

          {/* Android Ready Files Button */}
          <button
            id="open-files-modal-btn"
            onClick={onOpenFilesModal}
            className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-white hover:bg-gray-50 active:scale-95 text-gray-700 border border-gray-200 text-xs font-semibold transition-all shadow-xs"
            title="Сборка APK и файлы для Android"
          >
            <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden md:inline">Сборка APK</span>
            <span className="md:hidden">APK</span>
          </button>
        </div>
      </div>
    </header>
  );
};

