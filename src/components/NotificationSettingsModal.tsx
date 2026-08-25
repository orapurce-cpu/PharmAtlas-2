import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  X, 
  Volume2, 
  VolumeX, 
  Smartphone, 
  ShieldAlert, 
  Check, 
  Sliders, 
  AlertTriangle, 
  Activity, 
  Radio, 
  Sparkles, 
  Play,
  Heart,
  Brain,
  Flame,
  ShieldCheck
} from 'lucide-react';
import { NotificationSettings, NotificationRiskThreshold } from '../types';
import { notificationService } from '../services/notificationService';

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsUpdated?: (settings: NotificationSettings) => void;
}

export const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({
  isOpen,
  onClose,
  onSettingsUpdated,
}) => {
  const [settings, setSettings] = useState<NotificationSettings>(notificationService.getSettings());
  const [hasPushPermission, setHasPushPermission] = useState<boolean>(false);
  const [testAlertTriggered, setTestAlertTriggered] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSettings(notificationService.getSettings());
      if (typeof window !== 'undefined' && 'Notification' in window) {
        setHasPushPermission(Notification.permission === 'granted');
      }
    }
  }, [isOpen]);

  const updateSetting = <K extends keyof NotificationSettings>(key: K, value: NotificationSettings[K]) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    notificationService.saveSettings(updated);
    if (onSettingsUpdated) onSettingsUpdated(updated);
  };

  const updateChannel = (channelKey: keyof NotificationSettings['channels'], value: boolean) => {
    const updatedChannels = { ...settings.channels, [channelKey]: value };
    const updated = { ...settings, channels: updatedChannels };
    setSettings(updated);
    notificationService.saveSettings(updated);
    if (onSettingsUpdated) onSettingsUpdated(updated);
  };

  const updateCategory = (catKey: keyof NotificationSettings['categories'], value: boolean) => {
    const updatedCats = { ...settings.categories, [catKey]: value };
    const updated = { ...settings, categories: updatedCats };
    setSettings(updated);
    notificationService.saveSettings(updated);
    if (onSettingsUpdated) onSettingsUpdated(updated);
  };

  const handleRequestPush = async () => {
    const granted = await notificationService.requestPushPermission();
    setHasPushPermission(granted);
    if (granted) {
      updateChannel('browserPush', true);
    }
  };

  const handleTestAlert = (level: 'CRITICAL' | 'HIGH' = 'CRITICAL') => {
    setTestAlertTriggered(true);
    notificationService.triggerTestAlert(level);
    setTimeout(() => setTestAlertTriggered(false), 2500);
  };

  // Presets
  const applyPreset = (type: 'max' | 'critical_only' | 'silent') => {
    let preset: NotificationSettings;
    if (type === 'max') {
      preset = {
        enabled: true,
        minRiskThreshold: 'HIGH',
        channels: {
          inAppBanner: true,
          soundAlert: true,
          vibration: true,
          browserPush: hasPushPermission,
          criticalModal: true,
        },
        categories: {
          cardiovascular: true,
          cns_respiratory: true,
          metabolic_cyp: true,
          renal_electrolytes: true,
          gi_bleeding: true,
        },
        autoDismissSeconds: 8,
        soundVolume: 0.8,
      };
    } else if (type === 'critical_only') {
      preset = {
        enabled: true,
        minRiskThreshold: 'CRITICAL',
        channels: {
          inAppBanner: true,
          soundAlert: true,
          vibration: true,
          browserPush: false,
          criticalModal: true,
        },
        categories: {
          cardiovascular: true,
          cns_respiratory: true,
          metabolic_cyp: true,
          renal_electrolytes: true,
          gi_bleeding: true,
        },
        autoDismissSeconds: 10,
        soundVolume: 0.7,
      };
    } else {
      preset = {
        enabled: true,
        minRiskThreshold: 'HIGH',
        channels: {
          inAppBanner: true,
          soundAlert: false,
          vibration: false,
          browserPush: false,
          criticalModal: false,
        },
        categories: {
          cardiovascular: true,
          cns_respiratory: true,
          metabolic_cyp: true,
          renal_electrolytes: true,
          gi_bleeding: true,
        },
        autoDismissSeconds: 5,
        soundVolume: 0.3,
      };
    }
    setSettings(preset);
    notificationService.saveSettings(preset);
    if (onSettingsUpdated) onSettingsUpdated(preset);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-gray-900/40 backdrop-blur-xs animate-fade-in">
      <div 
        className="w-full max-w-xl bg-white border border-gray-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
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
                Настройки системы уведомлений
              </h3>
              <p className="text-xs text-gray-500">
                Оповещения об опасных лекарственных взаимодействиях и угрозах
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

        {/* Presets Bar */}
        <div className="px-4 py-2.5 bg-gray-50/70 border-b border-gray-100 flex items-center justify-between gap-2 overflow-x-auto text-xs">
          <span className="text-gray-600 font-semibold shrink-0">Готовые профили:</span>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => applyPreset('max')}
              className="px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 font-medium transition-all shadow-xs"
            >
              🛡️ Максимальная защита
            </button>
            <button
              onClick={() => applyPreset('critical_only')}
              className="px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-red-50 hover:text-red-700 font-medium transition-all shadow-xs"
            >
              🚨 Только критические
            </button>
            <button
              onClick={() => applyPreset('silent')}
              className="px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 font-medium transition-all shadow-xs"
            >
              🔕 Без звука
            </button>
          </div>
        </div>

        {/* Settings Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {/* Master Toggle */}
          <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                Включить систему оповещений
              </span>
              <p className="text-xs text-gray-600">
                Автоматическое сканирование на опасные коллизии при выборе препаратов
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={e => updateSetting('enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {/* SECTION 1: SENSITIVITY THRESHOLD */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-indigo-600" />
              1. Порог чувствительности оповещений
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                {
                  id: 'CRITICAL',
                  label: '🚨 Только критический риск',
                  desc: 'Абсолютные противопоказания и смертельные коллизии (Нитраты + Силденафил, QT)',
                },
                {
                  id: 'HIGH',
                  label: '⚠️ Высокий и критический',
                  desc: 'Рекомендуемый режим по умолчанию (FDA/ГРЛС Black Box и токсический синергизм)',
                },
                {
                  id: 'MODERATE',
                  label: '🟡 Умеренный риск и выше',
                  desc: 'Включает аддитивную гипотензию, легкое взаимодействие через CYP450',
                },
                {
                  id: 'ALL',
                  label: '📋 Все уровни взаимодействий',
                  desc: 'Уведомлять обо всех взаимодействиях, включая синергизм',
                },
              ].map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => updateSetting('minRiskThreshold', opt.id as NotificationRiskThreshold)}
                  className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between gap-1.5 ${
                    settings.minRiskThreshold === opt.id
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-900">{opt.label}</span>
                    {settings.minRiskThreshold === opt.id && (
                      <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-gray-500 leading-tight">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* SECTION 2: NOTIFICATION CHANNELS */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-indigo-600" />
              2. Каналы и типы оповещений
            </h4>

            <div className="bg-gray-50/60 rounded-2xl border border-gray-200 divide-y divide-gray-200 overflow-hidden">
              {/* In-app Toast Banner */}
              <div className="p-3 sm:p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-gray-900 block">
                    Всплывающий баннер в приложении (In-App Toast)
                  </span>
                  <span className="text-[11px] text-gray-500">
                    Интерактивное всплывающее уведомление с кнопкой перехода в отчет
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.channels.inAppBanner}
                  onChange={e => updateChannel('inAppBanner', e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                />
              </div>

              {/* Sound alert */}
              <div className="p-3 sm:p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-gray-900 block flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
                    Звуковой сигнал (Audio Chime)
                  </span>
                  <span className="text-[11px] text-gray-500">
                    Медицинский тональный сигнал предупреждения (Web Audio API)
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.channels.soundAlert}
                  onChange={e => updateChannel('soundAlert', e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                />
              </div>

              {/* Vibration */}
              <div className="p-3 sm:p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-gray-900 block flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
                    Тактильная вибрация (Haptic feedback)
                  </span>
                  <span className="text-[11px] text-gray-500">
                    Вибрационный импульс на смартфонах Android
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.channels.vibration}
                  onChange={e => updateChannel('vibration', e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                />
              </div>

              {/* Critical modal popup */}
              <div className="p-3 sm:p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-red-700 block flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                    Экстренное модальное окно при смертельной угрозе
                  </span>
                  <span className="text-[11px] text-gray-500">
                    Блокирующее предупреждение при критических противопоказаниях
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.channels.criticalModal}
                  onChange={e => updateChannel('criticalModal', e.target.checked)}
                  className="w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
                />
              </div>

              {/* Browser Push */}
              <div className="p-3 sm:p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-gray-900 block">
                    Браузерные push-уведомления (Desktop / Web Push)
                  </span>
                  <span className="text-[11px] text-gray-500">
                    Оповещения в центре уведомлений операционной системы
                  </span>
                </div>
                {hasPushPermission ? (
                  <input
                    type="checkbox"
                    checked={settings.channels.browserPush}
                    onChange={e => updateChannel('browserPush', e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={handleRequestPush}
                    className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold"
                  >
                    Разрешить
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 3: CATEGORY FILTERS */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-indigo-600" />
              3. Фильтрация по клиническим системам
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <label className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-between cursor-pointer">
                <span className="flex items-center gap-2 text-gray-800 font-medium">
                  <Heart className="w-3.5 h-3.5 text-red-500" />
                  Сердце, сосуды и интервал QT
                </span>
                <input
                  type="checkbox"
                  checked={settings.categories.cardiovascular}
                  onChange={e => updateCategory('cardiovascular', e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded border-gray-300"
                />
              </label>

              <label className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-between cursor-pointer">
                <span className="flex items-center gap-2 text-gray-800 font-medium">
                  <Brain className="w-3.5 h-3.5 text-purple-500" />
                  ЦНС, седация и дыхание
                </span>
                <input
                  type="checkbox"
                  checked={settings.categories.cns_respiratory}
                  onChange={e => updateCategory('cns_respiratory', e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded border-gray-300"
                />
              </label>

              <label className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-between cursor-pointer">
                <span className="flex items-center gap-2 text-gray-800 font-medium">
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  Печень и цитохромы CYP450
                </span>
                <input
                  type="checkbox"
                  checked={settings.categories.metabolic_cyp}
                  onChange={e => updateCategory('metabolic_cyp', e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded border-gray-300"
                />
              </label>

              <label className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-between cursor-pointer">
                <span className="flex items-center gap-2 text-gray-800 font-medium">
                  <Activity className="w-3.5 h-3.5 text-blue-500" />
                  Почки, калий и электролиты
                </span>
                <input
                  type="checkbox"
                  checked={settings.categories.renal_electrolytes}
                  onChange={e => updateCategory('renal_electrolytes', e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded border-gray-300"
                />
              </label>

              <label className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-between cursor-pointer sm:col-span-2">
                <span className="flex items-center gap-2 text-gray-800 font-medium">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                  ЖКТ, эрозии и риски кровотечений
                </span>
                <input
                  type="checkbox"
                  checked={settings.categories.gi_bleeding}
                  onChange={e => updateCategory('gi_bleeding', e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded border-gray-300"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <button
            type="button"
            onClick={() => handleTestAlert('CRITICAL')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs ${
              testAlertTriggered
                ? 'bg-emerald-600 text-white'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Play className="w-3.5 h-3.5 text-indigo-600" />
            {testAlertTriggered ? 'Сигнал воспроизведен!' : 'Проверить тестовый сигнал'}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-xs transition-all"
          >
            Готово
          </button>
        </div>
      </div>
    </div>
  );
};
