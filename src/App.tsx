import React, { useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { 
  AudienceMode, 
  DrugItem, 
  SelectedSlot, 
  ComprehensiveAnalysis,
  AlertNotificationItem 
} from './types';
import { ALL_DRUGS_FLAT, analyzeInteractionsOffline } from './data/pharmacologyDb';
import { AndroidHeader } from './components/AndroidHeader';
import { AudienceToggle } from './components/AudienceToggle';
import { DrugInputSlots } from './components/DrugInputSlots';
import { InteractionsReport } from './components/InteractionsReport';
import { DatabaseBrowser } from './components/DatabaseBrowser';
import { AndroidFilesModal } from './components/AndroidFilesModal';
import { AndroidBottomNav, MainTab } from './components/AndroidBottomNav';
import { AddDrugModal } from './components/AddDrugModal';
import { NotificationSettingsModal } from './components/NotificationSettingsModal';
import { NotificationHistoryModal } from './components/NotificationHistoryModal';
import { CriticalRiskModal } from './components/CriticalRiskModal';
import { NotificationToast } from './components/NotificationToast';
import { NotificationService } from './services/notificationService';
import { DrugDatabaseService } from './services/drugDatabase';
import { 
  Pill, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  BookOpen, 
  RefreshCw, 
  Smartphone,
  ShieldAlert,
  ArrowRight,
  Plus
} from 'lucide-react';

export default function App() {
  // Audience mode: 'professional' or 'consumer'
  const [audienceMode, setAudienceMode] = useState<AudienceMode>('professional');

  // Navigation tab for mobile
  const [activeTab, setActiveTab] = useState<MainTab>('slots');

  // Modals state
  const [isFilesModalOpen, setIsFilesModalOpen] = useState(false);
  const [isAddDrugModalOpen, setIsAddDrugModalOpen] = useState(false);
  const [drugToEdit, setDrugToEdit] = useState<DrugItem | undefined>(undefined);
  const [isNotificationSettingsOpen, setIsNotificationSettingsOpen] = useState(false);
  const [isNotificationHistoryOpen, setIsNotificationHistoryOpen] = useState(false);
  const [isCriticalRiskModalOpen, setIsCriticalRiskModalOpen] = useState(false);
  const [activeCriticalAlert, setActiveCriticalAlert] = useState<AlertNotificationItem | null>(null);
  const [unreadAlertsCount, setUnreadAlertsCount] = useState(0);

  // 5 Medication Slots
  const [slots, setSlots] = useState<SelectedSlot[]>([
    { slotNumber: 1, drug: null },
    { slotNumber: 2, drug: null },
    { slotNumber: 3, drug: null },
    { slotNumber: 4, drug: null },
    { slotNumber: 5, drug: null },
  ]);

  const [analysis, setAnalysis] = useState<ComprehensiveAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Filter selected drugs (up to 5)
  const selectedDrugs = useMemo(() => {
    return slots.map(s => s.drug).filter((d): d is DrugItem => d !== null);
  }, [slots]);

  // Initial preset on mount (e.g. classic Nitroglycerin + Sildenafil)
  useEffect(() => {
    const all = DrugDatabaseService.getAllDrugs();
    const nitro = all.find(d => d.inn.includes('Нитроглицерин'));
    const sildenafil = all.find(d => d.inn.includes('Силденафил'));
    if (nitro && sildenafil) {
      setSlots([
        { slotNumber: 1, drug: nitro },
        { slotNumber: 2, drug: sildenafil },
        { slotNumber: 3, drug: null },
        { slotNumber: 4, drug: null },
        { slotNumber: 5, drug: null },
      ]);
    }
  }, []);

  // Update unread count on mount and events
  const updateAlertsCount = () => {
    setUnreadAlertsCount(NotificationService.getUnreadCount());
  };

  useEffect(() => {
    updateAlertsCount();
    window.addEventListener('pharmatlas-history-updated', updateAlertsCount);
    return () => {
      window.removeEventListener('pharmatlas-history-updated', updateAlertsCount);
    };
  }, []);

  // Run analysis function
  const runAnalysis = useCallback(async (drugsToAnalyze: DrugItem[]) => {
    if (drugsToAnalyze.length === 0) {
      setAnalysis(null);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/analyze-interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ drugs: drugsToAnalyze }),
      });

      if (response.ok) {
        const data = await response.json();
        setAnalysis(data);

        // Safe celebration confetti if safe synergy
        if (data.overallRisk === 'LOW' || data.overallRisk === 'SAFE_SYNERGY') {
          confetti({
            particleCount: 40,
            spread: 60,
            origin: { y: 0.8 },
            colors: ['#10b981', '#06b6d4', '#3b82f6'],
          });
        }

        // Process Notification & Audio Alerts
        const alertResult = NotificationService.processAnalysisAlerts(data);
        const settings = NotificationService.getSettings();
        if (alertResult.triggered && alertResult.highestAlert?.riskLevel === 'CRITICAL' && settings.channels.criticalModal) {
          setActiveCriticalAlert(alertResult.highestAlert);
          setIsCriticalRiskModalOpen(true);
        }
      } else {
        // Fallback offline calculation
        const fallback = analyzeInteractionsOffline(drugsToAnalyze);
        setAnalysis(fallback);

        const alertResult = NotificationService.processAnalysisAlerts(fallback);
        const settings = NotificationService.getSettings();
        if (alertResult.triggered && alertResult.highestAlert?.riskLevel === 'CRITICAL' && settings.channels.criticalModal) {
          setActiveCriticalAlert(alertResult.highestAlert);
          setIsCriticalRiskModalOpen(true);
        }
      }
    } catch (err) {
      console.warn('Network API unavailable, using local pharmacology engine:', err);
      const fallback = analyzeInteractionsOffline(drugsToAnalyze);
      setAnalysis(fallback);

      const alertResult = NotificationService.processAnalysisAlerts(fallback);
      const settings = NotificationService.getSettings();
      if (alertResult.triggered && alertResult.highestAlert?.riskLevel === 'CRITICAL' && settings.channels.criticalModal) {
        setActiveCriticalAlert(alertResult.highestAlert);
        setIsCriticalRiskModalOpen(true);
      }
    } finally {
      setIsLoading(false);
      updateAlertsCount();
    }
  }, []);

  // Trigger analysis when selected drugs change
  useEffect(() => {
    runAnalysis(selectedDrugs);
  }, [selectedDrugs, runAnalysis]);

  // Slot handlers
  const handleUpdateSlot = (slotNumber: number, drug: DrugItem | null) => {
    setSlots(prev => prev.map(s => s.slotNumber === slotNumber ? { ...s, drug } : s));
  };

  const handleClearAll = () => {
    setSlots([
      { slotNumber: 1, drug: null },
      { slotNumber: 2, drug: null },
      { slotNumber: 3, drug: null },
      { slotNumber: 4, drug: null },
      { slotNumber: 5, drug: null },
    ]);
  };

  const handleApplyPreset = (presetDrugs: DrugItem[]) => {
    setSlots(prev => {
      return prev.map((s, idx) => ({
        ...s,
        drug: presetDrugs[idx] || null,
      }));
    });
  };

  const handleAddDrugFromDatabase = (drug: DrugItem) => {
    // Find first empty slot
    const emptySlot = slots.find(s => s.drug === null);
    if (emptySlot) {
      handleUpdateSlot(emptySlot.slotNumber, drug);
      setActiveTab('slots');
    } else {
      // Replace last slot if all filled
      handleUpdateSlot(5, drug);
      setActiveTab('slots');
    }
  };

  const handleOpenAddDrugModal = (drugToEditParam?: DrugItem) => {
    setDrugToEdit(drugToEditParam);
    setIsAddDrugModalOpen(true);
  };

  const handleSaveDrug = (savedDrug: DrugItem) => {
    // If the saved drug was in any slot, update the slot
    setSlots(prev => prev.map(s => s.drug?.id === savedDrug.id ? { ...s, drug: savedDrug } : s));
  };

  const hasCollision = Boolean(analysis && (analysis.overallRisk === 'CRITICAL' || analysis.overallRisk === 'HIGH'));

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-gray-800 flex flex-col font-sans">
      {/* Real-time Notification Toast overlay */}
      <NotificationToast />

      {/* Android Native Mockup Header */}
      <AndroidHeader
        audienceMode={audienceMode}
        onToggleMode={setAudienceMode}
        onOpenFilesModal={() => setIsFilesModalOpen(true)}
        onOpenAddDrugModal={() => handleOpenAddDrugModal()}
        onOpenNotificationsSettings={() => setIsNotificationSettingsOpen(true)}
        onOpenNotificationsHistory={() => setIsNotificationHistoryOpen(true)}
        unreadAlertsCount={unreadAlertsCount}
        selectedCount={selectedDrugs.length}
      />

      {/* Main App Body Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-3.5 sm:p-5 space-y-4 sm:space-y-5 pb-24">
        {/* Prominent Audience Switcher Toggle */}
        <AudienceToggle
          mode={audienceMode}
          onChange={setAudienceMode}
        />

        {/* Tab 1: Slots & Interactive Checker */}
        {activeTab === 'slots' && (
          <div className="space-y-5 animate-fade-in">
            <DrugInputSlots
              slots={slots}
              onUpdateSlot={handleUpdateSlot}
              onClearAll={handleClearAll}
              onApplyPreset={handleApplyPreset}
              onOpenAddDrugModal={() => handleOpenAddDrugModal()}
            />

            {/* Direct Inline Results Preview */}
            <div className="pt-2">
              <InteractionsReport
                analysis={analysis}
                selectedDrugs={selectedDrugs}
                audienceMode={audienceMode}
                isLoading={isLoading}
                onRefreshAnalysis={() => runAnalysis(selectedDrugs)}
              />
            </div>
          </div>
        )}

        {/* Tab 2: Dedicated Detailed Report */}
        {activeTab === 'report' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
              <div className="flex items-center gap-2 text-xs text-gray-700">
                <Pill className="w-4 h-4 text-indigo-600" />
                <span>Анализируемые препараты: <b>{selectedDrugs.length} из 5</b></span>
              </div>
              <button
                onClick={() => setActiveTab('slots')}
                className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1 font-semibold"
              >
                Изменить список <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <InteractionsReport
              analysis={analysis}
              selectedDrugs={selectedDrugs}
              audienceMode={audienceMode}
              isLoading={isLoading}
              onRefreshAnalysis={() => runAnalysis(selectedDrugs)}
            />
          </div>
        )}

        {/* Tab 3: Database of 70 Groups & Custom Drugs */}
        {activeTab === 'database' && (
          <div className="animate-fade-in">
            <DatabaseBrowser 
              onAddDrugToSlot={handleAddDrugFromDatabase}
              onOpenAddDrugModal={handleOpenAddDrugModal}
            />
          </div>
        )}

        {/* Tab 4: Android Files Quick Access */}
        {activeTab === 'files' && (
          <div className="p-5 sm:p-6 rounded-3xl bg-white border border-gray-200 shadow-sm space-y-4 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900">
                  Готовые файлы для сборки Android
                </h3>
                <p className="text-xs text-gray-500">
                  PWA манифест, SQLite / JSON фармакологии, Kotlin/Compose код
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Нажмите кнопку ниже, чтобы открыть окно полного экспорта исходников и скачивания базы данных:
            </p>

            <button
              onClick={() => setIsFilesModalOpen(true)}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-bold rounded-2xl text-xs sm:text-sm transition-all shadow-xs flex items-center justify-center gap-2"
            >
              <Smartphone className="w-4 h-4" />
              Открыть менеджер готовых файлов Android
            </button>
          </div>
        )}
      </main>

      {/* Android Bottom Navigation */}
      <AndroidBottomNav
        currentTab={activeTab}
        onTabChange={setActiveTab}
        selectedCount={selectedDrugs.length}
        hasCollision={hasCollision}
      />

      {/* Android Files & Export Modal */}
      <AndroidFilesModal
        isOpen={isFilesModalOpen}
        onClose={() => setIsFilesModalOpen(false)}
        selectedDrugs={selectedDrugs}
        analysis={analysis}
      />

      {/* Add / Edit Drug in Database Modal */}
      <AddDrugModal
        isOpen={isAddDrugModalOpen}
        onClose={() => {
          setIsAddDrugModalOpen(false);
          setDrugToEdit(undefined);
        }}
        onDrugSaved={handleSaveDrug}
        drugToEdit={drugToEdit}
      />

      {/* Notification Preferences Settings Modal */}
      <NotificationSettingsModal
        isOpen={isNotificationSettingsOpen}
        onClose={() => setIsNotificationSettingsOpen(false)}
      />

      {/* Notification Alert History Modal */}
      <NotificationHistoryModal
        isOpen={isNotificationHistoryOpen}
        onClose={() => setIsNotificationHistoryOpen(false)}
        onSelectDrug={drug => handleAddDrugFromDatabase(drug)}
      />

      {/* Critical Risk Emergency Modal */}
      <CriticalRiskModal
        isOpen={isCriticalRiskModalOpen}
        onClose={() => {
          setIsCriticalRiskModalOpen(false);
          setActiveCriticalAlert(null);
        }}
        notification={activeCriticalAlert}
      />
    </div>
  );
}

