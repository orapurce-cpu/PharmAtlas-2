import { 
  NotificationSettings, 
  AlertNotificationItem, 
  ComprehensiveAnalysis, 
  RiskLevel, 
  PairwiseCollision 
} from '../types';
import { medicalAudio } from '../utils/audioAlert';

const SETTINGS_STORAGE_KEY = 'pharmatlas_notification_settings_v2';
const HISTORY_STORAGE_KEY = 'pharmatlas_notification_history_v2';

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: true,
  minRiskThreshold: 'HIGH', // Alerts on HIGH and CRITICAL by default
  channels: {
    inAppBanner: true,
    soundAlert: true,
    vibration: true,
    browserPush: false, // Default false until user explicitly requests / grants permission
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
  soundVolume: 0.7,
};

// Risk weights for threshold comparison
const RISK_WEIGHTS: Record<RiskLevel, number> = {
  CRITICAL: 4,
  HIGH: 3,
  MODERATE: 2,
  SAFE_SYNERGY: 1,
  LOW: 0,
};

const THRESHOLD_MIN_WEIGHTS: Record<string, number> = {
  CRITICAL: 4,
  HIGH: 3,
  MODERATE: 2,
  ALL: 0,
};

class NotificationService {
  private settings: NotificationSettings = DEFAULT_NOTIFICATION_SETTINGS;
  private history: AlertNotificationItem[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.loadSettings();
      this.loadHistory();
    }
  }

  // Load settings from storage
  loadSettings(): NotificationSettings {
    try {
      const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        this.settings = { 
          ...DEFAULT_NOTIFICATION_SETTINGS, 
          ...parsed,
          channels: { ...DEFAULT_NOTIFICATION_SETTINGS.channels, ...parsed.channels },
          categories: { ...DEFAULT_NOTIFICATION_SETTINGS.categories, ...parsed.categories }
        };
      }
    } catch (e) {
      console.warn('Failed to load notification settings:', e);
      this.settings = DEFAULT_NOTIFICATION_SETTINGS;
    }
    return this.settings;
  }

  getSettings(): NotificationSettings {
    return { ...this.settings };
  }

  saveSettings(newSettings: NotificationSettings): void {
    this.settings = newSettings;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
        window.dispatchEvent(new CustomEvent('pharmatlas-settings-updated', { detail: newSettings }));
      } catch (e) {
        console.error('Failed to save notification settings:', e);
      }
    }
  }

  // Load history from storage
  loadHistory(): AlertNotificationItem[] {
    try {
      const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          this.history = parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load notification history:', e);
      this.history = [];
    }
    return this.history;
  }

  getHistory(): AlertNotificationItem[] {
    return [...this.history];
  }

  getUnreadCount(): number {
    return this.history.filter(item => !item.isRead).length;
  }

  addHistoryItem(item: Omit<AlertNotificationItem, 'id' | 'timestamp' | 'isRead'>): AlertNotificationItem {
    const newItem: AlertNotificationItem = {
      ...item,
      id: `alert_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      isRead: false,
    };

    this.history = [newItem, ...this.history].slice(0, 50); // Keep last 50 alerts
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(this.history));
        window.dispatchEvent(new CustomEvent('pharmatlas-history-updated', { detail: this.history }));
      } catch (e) {
        console.error('Failed to save alert history:', e);
      }
    }
    return newItem;
  }

  markAllAsRead(): void {
    this.history = this.history.map(item => ({ ...item, isRead: true }));
    if (typeof window !== 'undefined') {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(this.history));
      window.dispatchEvent(new CustomEvent('pharmatlas-history-updated', { detail: this.history }));
    }
  }

  clearHistory(): void {
    this.history = [];
    if (typeof window !== 'undefined') {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify([]));
      window.dispatchEvent(new CustomEvent('pharmatlas-history-updated', { detail: [] }));
    }
  }

  // Check if a collision matches category filters
  private matchesCategoryFilters(collision: PairwiseCollision): boolean {
    const text = `${collision.interactionType} ${collision.clinicalConsequences} ${collision.pharmacodynamics}`.toLowerCase();
    const cats = this.settings.categories;

    const isCardio = text.includes('сердц') || text.includes('аритм') || text.includes('давлен') || text.includes('qt') || text.includes('коллапс') || text.includes('вазодилат') || text.includes('гипотенз');
    const isCNS = text.includes('дыхан') || text.includes('цнс') || text.includes('седат') || text.includes('сонлив') || text.includes('кома') || text.includes('опиоид') || text.includes('мозг');
    const isMetabolic = text.includes('cyp') || text.includes('цитохром') || text.includes('печен') || text.includes('фермент') || text.includes('p-gp') || text.includes('гликопротеин');
    const isRenal = text.includes('почк') || text.includes('калий') || text.includes('гиперкалием') || text.includes('скф') || text.includes('нефрот') || text.includes('диурет');
    const isBleeding = text.includes('желуд') || text.includes('язв') || text.includes('кровотеч') || text.includes('жкт') || text.includes('эрози');

    // If matches any activated category or if general
    if (isCardio && cats.cardiovascular) return true;
    if (isCNS && cats.cns_respiratory) return true;
    if (isMetabolic && cats.metabolic_cyp) return true;
    if (isRenal && cats.renal_electrolytes) return true;
    if (isBleeding && cats.gi_bleeding) return true;

    // If none matched specifically, allow if at least one category is on
    return Object.values(cats).some(Boolean);
  }

  // Request browser notification permission
  async requestPushPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      const granted = permission === 'granted';
      if (granted) {
        this.saveSettings({
          ...this.settings,
          channels: { ...this.settings.channels, browserPush: true }
        });
      }
      return granted;
    } catch (e) {
      console.warn('Notification permission error:', e);
      return false;
    }
  }

  // Process analysis results and trigger appropriate notifications
  processAnalysisAlerts(analysis: ComprehensiveAnalysis): {
    triggered: boolean;
    highestAlert: AlertNotificationItem | null;
  } {
    if (!this.settings.enabled || !analysis || analysis.pairwiseCollisions.length === 0) {
      return { triggered: false, highestAlert: null };
    }

    const minWeight = THRESHOLD_MIN_WEIGHTS[this.settings.minRiskThreshold] ?? 3;
    
    // Filter collisions exceeding threshold and category filters
    const validCollisions = analysis.pairwiseCollisions.filter(c => {
      const weight = RISK_WEIGHTS[c.riskLevel] ?? 0;
      return weight >= minWeight && this.matchesCategoryFilters(c);
    });

    if (validCollisions.length === 0) {
      return { triggered: false, highestAlert: null };
    }

    // Sort by highest risk
    validCollisions.sort((a, b) => (RISK_WEIGHTS[b.riskLevel] || 0) - (RISK_WEIGHTS[a.riskLevel] || 0));
    const primaryCollision = validCollisions[0];

    const title = primaryCollision.riskLevel === 'CRITICAL'
      ? `🚨 КРИТИЧЕСКАЯ УГРОЗА: ${primaryCollision.drugA} + ${primaryCollision.drugB}`
      : primaryCollision.riskLevel === 'HIGH'
      ? `⚠️ ОПАСНОЕ ВЗАИМОДЕЙСТВИЕ: ${primaryCollision.drugA} + ${primaryCollision.drugB}`
      : `🟡 Внимание: взаимодействие ${primaryCollision.drugA} + ${primaryCollision.drugB}`;

    const message = primaryCollision.consumerSummary || primaryCollision.clinicalConsequences;

    // Log to history
    const historyItem = this.addHistoryItem({
      riskLevel: primaryCollision.riskLevel,
      title,
      message,
      drugsInvolved: [primaryCollision.drugA, primaryCollision.drugB],
      interactionType: primaryCollision.interactionType,
    });

    // 1. Audio alert
    if (this.settings.channels.soundAlert) {
      if (primaryCollision.riskLevel === 'CRITICAL') {
        medicalAudio.playCriticalAlert(this.settings.soundVolume);
      } else {
        medicalAudio.playWarningAlert(this.settings.soundVolume);
      }
    }

    // 2. Vibration alert
    if (this.settings.channels.vibration && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        if (primaryCollision.riskLevel === 'CRITICAL') {
          navigator.vibrate([200, 100, 200, 100, 400]);
        } else {
          navigator.vibrate([150, 80, 150]);
        }
      } catch (e) {
        // Ignore vibration errors
      }
    }

    // 3. Browser Push Notification
    if (this.settings.channels.browserPush && typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body: message,
          icon: '/favicon.ico',
          tag: 'pharmatlas-ddi-alert',
          badge: '/favicon.ico',
        });
      } catch (e) {
        console.warn('Browser push display error:', e);
      }
    }

    // 4. In-App Banner Toast
    if (this.settings.channels.inAppBanner && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('pharmatlas-show-toast', { detail: historyItem }));
    }

    return {
      triggered: true,
      highestAlert: historyItem,
    };
  }

  // Trigger test alert for testing audio, vibration and notification UI
  triggerTestAlert(level: RiskLevel = 'CRITICAL'): AlertNotificationItem {
    const testTitle = level === 'CRITICAL' 
      ? '🚨 Тестовое оповещение: КРИТИЧЕСКИЙ РИСК' 
      : '⚠️ Тестовое оповещение: ВЫСОКИЙ РИСК';
    
    const testMessage = 'Это тестовое уведомление системы безопасности фармакотерапии PharmAtlas. Звуковой и тактильный каналы работают исправно.';

    if (this.settings.channels.soundAlert) {
      if (level === 'CRITICAL') {
        medicalAudio.playCriticalAlert(this.settings.soundVolume);
      } else {
        medicalAudio.playWarningAlert(this.settings.soundVolume);
      }
    }

    if (this.settings.channels.vibration && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([150, 100, 150]);
      } catch (e) {}
    }

    if (this.settings.channels.browserPush && typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(testTitle, {
          body: testMessage,
          icon: '/favicon.ico',
          tag: 'pharmatlas-test-alert',
        });
      } catch (e) {}
    }

    const item = this.addHistoryItem({
      riskLevel: level,
      title: testTitle,
      message: testMessage,
      drugsInvolved: ['Нитроглицерин', 'Силденафил (Виагра)'],
      interactionType: 'Тестовая проверка системы оповещений',
    });

    if (this.settings.channels.inAppBanner && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('pharmatlas-show-toast', { detail: item }));
    }

    return item;
  }
}

export const notificationService = new NotificationService();
export { notificationService as NotificationService };
