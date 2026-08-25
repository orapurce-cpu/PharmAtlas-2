import { DrugItem, DrugGroup } from '../types';
import { MASTER_DRUG_GROUPS } from '../data/pharmacologyDb';

const STORAGE_KEY = 'pharmatlas_custom_drugs_v2';

// In-memory cache for fast operations and reactive updates
let customDrugsCache: DrugItem[] = [];

// Initialize custom drugs from localStorage
function loadCustomDrugsFromStorage(): DrugItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (e) {
    console.warn('Failed to load custom drugs from localStorage:', e);
  }
  return [];
}

function saveCustomDrugsToStorage(drugs: DrugItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(drugs));
    customDrugsCache = drugs;
    window.dispatchEvent(new CustomEvent('pharmatlas-db-changed', { detail: { count: drugs.length } }));
  } catch (e) {
    console.error('Failed to save custom drugs to localStorage:', e);
  }
}

// Initial load
if (typeof window !== 'undefined') {
  customDrugsCache = loadCustomDrugsFromStorage();
}

export const DrugDatabaseService = {
  // Get all master flat drugs + all custom drugs
  getAllDrugs(): DrugItem[] {
    const masterFlat = MASTER_DRUG_GROUPS.flatMap(g => g.drugs);
    const custom = this.getCustomDrugs();
    return [...custom, ...masterFlat];
  },

  // Get only user-created custom drugs
  getCustomDrugs(): DrugItem[] {
    if (typeof window !== 'undefined' && customDrugsCache.length === 0) {
      customDrugsCache = loadCustomDrugsFromStorage();
    }
    return [...customDrugsCache];
  },

  // Get grouped drugs for Database Browser
  getGroupedDrugs(): DrugGroup[] {
    const customDrugs = this.getCustomDrugs();
    const groups: DrugGroup[] = MASTER_DRUG_GROUPS.map(g => ({
      ...g,
      drugs: [...g.drugs]
    }));

    if (customDrugs.length > 0) {
      // Create a dedicated group for Custom / User added drugs
      const customGroup: DrugGroup = {
        sheet_id: "00. Пользовательская база",
        group_name: "ДОБАВЛЕННЫЕ ПОЛЬЗОВАТЕЛЕМ ПРЕПАРАТЫ (ПОЛЬЗОВАТЕЛЬСКАЯ БАЗА)",
        description: "Лекарственные средства, добавленные в локальную базу данных вручную",
        drugs: customDrugs
      };

      // Also merge custom drugs with same group_id into corresponding master groups if applicable
      return [customGroup, ...groups];
    }

    return groups;
  },

  // Add a new custom drug to the database
  addDrug(drugData: Omit<DrugItem, 'id' | 'is_custom' | 'created_at'>): DrugItem {
    const customList = this.getCustomDrugs();
    const id = `custom_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    
    const newDrug: DrugItem = {
      ...drugData,
      id,
      is_custom: true,
      created_at: new Date().toISOString(),
      trade_names: drugData.trade_names.length > 0 ? drugData.trade_names : [drugData.inn],
      indications: drugData.indications || 'Показания согласно инструкции ГРЛС / врача',
      side_effects: drugData.side_effects || 'Возможные индивидуальные реакции гиперчувствительности',
      mechanism_of_action: drugData.mechanism_of_action || 'Фармакологическое действие согласно клинико-фармакологической группе',
      profiles_and_targets: drugData.profiles_and_targets || 'Клеточные рецепторы и мишени',
      therapeutic_dosage: drugData.therapeutic_dosage || 'В соответствии с назначением врача',
      toxic_threshold: drugData.toxic_threshold || 'Превышение максимальной суточной дозы',
      absolute_contraindications: drugData.absolute_contraindications || 'Гиперчувствительность, беременность (по показаниям)',
      dosage_forms: drugData.dosage_forms || 'Таблетки, капсулы или раствор',
      cyp_pathways: drugData.cyp_pathways || [],
      receptors: drugData.receptors || {},
    };

    const updated = [newDrug, ...customList];
    saveCustomDrugsToStorage(updated);
    return newDrug;
  },

  // Update existing custom drug
  updateDrug(id: string, updatedFields: Partial<DrugItem>): boolean {
    const customList = this.getCustomDrugs();
    const index = customList.findIndex(d => d.id === id);
    if (index === -1) return false;

    customList[index] = {
      ...customList[index],
      ...updatedFields,
      id, // Preserve id
      is_custom: true,
    };

    saveCustomDrugsToStorage(customList);
    return true;
  },

  // Delete custom drug by ID
  deleteDrug(id: string): boolean {
    const customList = this.getCustomDrugs();
    const filtered = customList.filter(d => d.id !== id);
    if (filtered.length === customList.length) return false;

    saveCustomDrugsToStorage(filtered);
    return true;
  },

  // Search across all drugs (master + custom)
  searchDrugs(query: string, groupFilter: string = 'all'): DrugItem[] {
    const all = this.getAllDrugs();
    let filtered = all;

    if (groupFilter !== 'all') {
      if (groupFilter === 'custom') {
        filtered = filtered.filter(d => d.is_custom);
      } else {
        filtered = filtered.filter(d => d.group_id === groupFilter || d.group_name === groupFilter);
      }
    }

    if (!query || !query.trim()) {
      return filtered.slice(0, 20);
    }

    const q = query.toLowerCase().trim();
    return filtered.filter(d => {
      const innMatch = d.inn.toLowerCase().includes(q) || (d.inn_lat && d.inn_lat.toLowerCase().includes(q));
      const tradeMatch = (d.trade_names || []).some(t => t.toLowerCase().includes(q));
      const groupMatch = (d.group_name || '').toLowerCase().includes(q);
      const indMatch = (d.indications || '').toLowerCase().includes(q);
      const actionMatch = (d.mechanism_of_action || '').toLowerCase().includes(q);
      const sideEffectsMatch = (d.side_effects || '').toLowerCase().includes(q);
      return innMatch || tradeMatch || groupMatch || indMatch || actionMatch || sideEffectsMatch;
    });
  },

  // Export full database as JSON
  exportJSON(): string {
    const custom = this.getCustomDrugs();
    const all = this.getAllDrugs();
    const exportPayload = {
      version: "2.5",
      exported_at: new Date().toISOString(),
      total_drugs: all.length,
      custom_drugs_count: custom.length,
      custom_drugs: custom,
      all_drugs: all
    };
    return JSON.stringify(exportPayload, null, 2);
  },

  // Import custom drugs JSON
  importJSON(jsonString: string): { success: boolean; addedCount: number; message: string } {
    try {
      const data = JSON.parse(jsonString);
      let itemsToImport: DrugItem[] = [];

      if (Array.isArray(data)) {
        itemsToImport = data;
      } else if (data && Array.isArray(data.custom_drugs)) {
        itemsToImport = data.custom_drugs;
      } else if (data && Array.isArray(data.drugs)) {
        itemsToImport = data.drugs;
      } else if (data && Array.isArray(data.all_drugs)) {
        itemsToImport = data.all_drugs.filter((d: DrugItem) => d.is_custom);
      } else {
        return { success: false, addedCount: 0, message: 'Неверный формат JSON файла' };
      }

      if (itemsToImport.length === 0) {
        return { success: false, addedCount: 0, message: 'В файле не найдено препаратов для импорта' };
      }

      const current = this.getCustomDrugs();
      const existingIds = new Set(current.map(d => d.id));
      const existingInns = new Set(current.map(d => d.inn.toLowerCase().trim()));

      let addedCount = 0;
      const merged = [...current];

      for (const item of itemsToImport) {
        if (!item.inn) continue;
        const cleanInn = item.inn.trim();
        if (existingInns.has(cleanInn.toLowerCase())) continue;

        const newId = item.id && !existingIds.has(item.id) 
          ? item.id 
          : `custom_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

        merged.push({
          ...item,
          id: newId,
          is_custom: true,
          created_at: item.created_at || new Date().toISOString()
        });
        existingIds.add(newId);
        existingInns.add(cleanInn.toLowerCase());
        addedCount++;
      }

      saveCustomDrugsToStorage(merged);
      return {
        success: true,
        addedCount,
        message: `Успешно импортировано ${addedCount} новых препаратов в базу данных.`
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      return { success: false, addedCount: 0, message: `Ошибка парсинга JSON: ${errorMsg}` };
    }
  },

  // Reset custom drugs
  resetCustomDrugs(): void {
    saveCustomDrugsToStorage([]);
  }
};
