export type AudienceMode = 'professional' | 'consumer';

export type RiskLevel = 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW' | 'SAFE_SYNERGY';

export interface DrugItem {
  id: string;
  inn: string;
  inn_lat?: string;
  trade_names: string[];
  group_id: string;
  group_name: string;
  mechanism_of_action: string;
  indications?: string; // Показания к применению
  side_effects?: string; // Возможные побочные эффекты
  profiles_and_targets: string;
  therapeutic_dosage: string;
  toxic_threshold: string;
  absolute_contraindications: string;
  dosage_forms: string;
  cyp_pathways?: string[]; // e.g. ["CYP3A4 inhibitor", "CYP2D6 substrate"]
  qt_risk?: boolean;
  receptors?: Record<string, number>; // e.g. { "α1": 4, "β1": 4, "β2": 3.5, "M1": 0 }
  is_custom?: boolean; // Добавлен пользователем в локальную базу данных
  created_at?: string;
}

export interface DrugGroup {
  sheet_id: string;
  group_name: string;
  description?: string;
  drugs: DrugItem[];
}

export interface SelectedSlot {
  slotNumber: number;
  drug: DrugItem | null;
  customName?: string;
  customDose?: string;
  customForm?: string;
}

export interface PairwiseCollision {
  drugA: string;
  drugB: string;
  groupA: string;
  groupB: string;
  riskLevel: RiskLevel;
  interactionType: string;
  // Professional details
  pharmacodynamics: string;
  pharmacokinetics: string;
  clinicalConsequences: string;
  monitoringProtocol: string;
  doctorRecommendation: string;
  // Consumer details
  consumerSummary: string;
  consumerAction: string;
  dangerSigns: string[];
  foodAndLifestyleTips: string;
}

export interface ComprehensiveAnalysis {
  overallRisk: RiskLevel;
  riskScore: number; // 0 to 100 (100 = life threatening)
  summaryHeadline: {
    professional: string;
    consumer: string;
  };
  pairwiseCollisions: PairwiseCollision[];
  polypharmacyWarnings: {
    professional: string[];
    consumer: string[];
  };
  metabolicCollisions: {
    enzyme: string;
    description: string;
    affectedDrugs: string[];
  }[];
  vitalOrganImpacts: {
    organ: 'Сердечно-сосудистая система' | 'Почки и СКФ' | 'Печень и CYP' | 'ЦНС и дыхание' | 'ЖКТ и гемостаз';
    status: 'safe' | 'caution' | 'danger';
    detailsPro: string;
    detailsConsumer: string;
  }[];
  monitoringChecklist: string[];
  actionPlanConsumer: string[];
  questionsForDoctor: string[];
  aiGenerated?: boolean;
  timestamp: string;
}

// Notification System Interfaces
export type NotificationRiskThreshold = 'CRITICAL' | 'HIGH' | 'MODERATE' | 'ALL';

export interface NotificationCategoryFilters {
  cardiovascular: boolean; // Коллапс АД, аритмия, инфаркт, интервал QT
  cns_respiratory: boolean; // Остановка дыхания, кома, седация
  metabolic_cyp: boolean; // Ферменты печени CYP450, P-гликопротеин
  renal_electrolytes: boolean; // Почки, гиперкалиемия, нефротоксичность
  gi_bleeding: boolean; // Язвы ЖКТ, эрозии, кровотечения
}

export interface NotificationSettings {
  enabled: boolean;
  minRiskThreshold: NotificationRiskThreshold; // Уровень чувствительности
  channels: {
    inAppBanner: boolean; // Всплывающий баннер
    soundAlert: boolean; // Звуковой сигнал (Audio Chime)
    vibration: boolean; // Вибрация устройства
    browserPush: boolean; // Нативные браузерные Web Notifications
    criticalModal: boolean; // Блокирующее экстренное окно при критическом риске
  };
  categories: NotificationCategoryFilters;
  autoDismissSeconds: number; // 0 - не скрывать, 4-10 сек
  soundVolume: number; // 0.1 to 1.0
}

export interface AlertNotificationItem {
  id: string;
  timestamp: string;
  riskLevel: RiskLevel;
  title: string;
  message: string;
  drugsInvolved: string[];
  interactionType?: string;
  isRead: boolean;
}
