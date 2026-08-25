import React, { useState } from 'react';
import { 
  X, 
  Download, 
  FileCode2, 
  Smartphone, 
  Copy, 
  Check, 
  FolderArchive, 
  Database, 
  Share2,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { DrugItem, ComprehensiveAnalysis } from '../types';
import { ALL_DRUGS_FLAT, MASTER_DRUG_GROUPS } from '../data/pharmacologyDb';

interface AndroidFilesModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDrugs: DrugItem[];
  analysis: ComprehensiveAnalysis | null;
}

export const AndroidFilesModal: React.FC<AndroidFilesModalProps> = ({
  isOpen,
  onClose,
  selectedDrugs,
  analysis,
}) => {
  const [activeTab, setActiveTab] = useState<'apk' | 'pwa' | 'kotlin' | 'json' | 'report'>('apk');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const capacitorConfig = `{
  "appId": "com.pharmatlas.app",
  "appName": "PharmAtlas",
  "webDir": "dist",
  "bundledWebRuntime": false,
  "server": {
    "androidScheme": "https"
  },
  "android": {
    "allowMixedContent": true,
    "captureInput": true,
    "webContentsDebuggingEnabled": true
  }
}`;

  const buildApkCommands = `# Способ 1: Сборка APK через Capacitor & Android Studio
npm install -g @capacitor/cli @capacitor/core @capacitor/android
npx cap init PharmAtlas com.pharmatlas.app --web-dir dist
npm run build
npx cap add android
npx cap copy android
npx cap open android
# В Android Studio: Build -> Build Bundle(s) / APK(s) -> Build APK(s)

# Способ 2: Мгновенная генерация APK через Google Bubblewrap CLI (TWA)
npm install -g @bubblewrap/cli
bubblewrap init --manifest https://ais-pre-d4au5av33dxsi2siumj64p-517684822625.europe-west3.run.app/manifest.json
bubblewrap build`;

  const handleDownloadJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      metadata: {
        title: "Государственный реестр лекарственных препаратов РФ - База данных фармакологии",
        version: "2.0",
        total_groups: MASTER_DRUG_GROUPS.length,
        total_drugs: ALL_DRUGS_FLAT.length,
        exported_at: new Date().toISOString()
      },
      drug_groups: MASTER_DRUG_GROUPS
    }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "master_pharmacology_database.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleDownloadReport = () => {
    if (!analysis) return;
    const reportStr = `=====================================================
PHARMATLAS CLINICAL PHARMACOLOGY REPORT
Сгенерировано: ${new Date().toLocaleString('ru-RU')}
=====================================================

1. ВЫБРАННЫЕ ПРЕПАРАТЫ (${selectedDrugs.length}/5):
${selectedDrugs.map((d, i) => `  ${i + 1}. ${d.inn} (${d.inn_lat || ''})
     - Торговые: ${d.trade_names.join(', ')}
     - Группа: ${d.group_name}
     - Терапевтическая доза: ${d.therapeutic_dosage}
     - Токсический порог: ${d.toxic_threshold}
     - Противопоказания: ${d.absolute_contraindications}`).join('\n\n')}

2. ОБЩИЙ ВЕРДИКТ БЕЗОПАСНОСТИ:
   Уровень риска: ${analysis.overallRisk} (Индекс: ${analysis.riskScore}/100)
   Для врачей: ${analysis.summaryHeadline.professional}
   Для пациентов: ${analysis.summaryHeadline.consumer}

3. ПОПАРНЫЙ АНАЛИЗ КОЛЛИЗИЙ (${analysis.pairwiseCollisions.length}):
${analysis.pairwiseCollisions.map((c, i) => `  [Коллизия ${i + 1}] ${c.drugA} + ${c.drugB}
     * Степень: ${c.riskLevel} (${c.interactionType})
     * Фармакодинамика: ${c.pharmacodynamics}
     * Фармакокинетика: ${c.pharmacokinetics}
     * Риски: ${c.clinicalConsequences}
     * Рекомендация врача: ${c.doctorRecommendation}
     * Совет пациенту: ${c.consumerSummary}`).join('\n\n')}

4. ВИТАЛЬНЫЕ СИСТЕМЫ ОРГАНОВ:
${analysis.vitalOrganImpacts.map(o => `   - ${o.organ}: [${o.status.toUpperCase()}] ${o.detailsPro}`).join('\n')}

5. ЧЕК-ЛИСТ МОНИТОРИНГА:
${analysis.monitoringChecklist.map((m, i) => `   [ ] 0${i + 1}. ${m}`).join('\n')}

=====================================================
Документ носит рекомендательно-справочный характер.
=====================================================`;

    const blob = new Blob([reportStr], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", url);
    downloadAnchor.setAttribute("download", `PharmAtlas_Prescription_Report_${Date.now()}.txt`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const kotlinSampleCode = `// MainActivity.kt - Android Jetpack Compose + Room
package com.pharmatlas.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme {
                PharmAtlasApp()
            }
        }
    }
}

@Composable
fun PharmAtlasApp() {
    var audienceMode by remember { mutableStateOf("professional") } // "professional" or "consumer"
    var selectedDrugs by remember { mutableStateOf(listOf<DrugEntity>()) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("PharmAtlas DDI Checker (5 Drugs)") },
                actions = {
                    Button(onClick = {
                        audienceMode = if (audienceMode == "professional") "consumer" else "professional"
                    }) {
                        Text(if (audienceMode == "professional") "🩺 Профи" else "👤 Пациент")
                    }
                }
            )
        }
    ) { padding ->
        Column(modifier = Modifier.padding(padding).padding(16.dp)) {
            Text("Слоты препаратов (до 5 МНН): \${selectedDrugs.size}/5", style = MaterialTheme.typography.titleMedium)
            // Interaction Matrix & Radar target visualization
        }
    }
}`;

  const manifestCode = `{
  "short_name": "PharmAtlas",
  "name": "PharmAtlas Android - Чекер совместимости 5 препаратов",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#0f172a",
  "background_color": "#090d16"
}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-gray-900/40 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-3xl bg-white border border-gray-200 rounded-3xl shadow-xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
                Готовые файлы для Android & Экспорт
              </h3>
              <p className="text-xs text-gray-500">
                Полный комплект: PWA для мобильного, Kotlin/Compose исходники, JSON-база ГРЛС и отчет
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-gray-100 text-gray-500 hover:text-gray-900 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="px-4 pt-3 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('apk')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'apk'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            📦 Сборка APK (.apk)
          </button>

          <button
            onClick={() => setActiveTab('pwa')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'pwa'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            1. Установка на Android (PWA)
          </button>

          <button
            onClick={() => setActiveTab('json')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'json'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            2. JSON База фармакологии
          </button>

          <button
            onClick={() => setActiveTab('kotlin')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'kotlin'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <FileCode2 className="w-3.5 h-3.5" />
            3. Android Kotlin
          </button>

          <button
            onClick={() => setActiveTab('report')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'report'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            4. Выгрузка заключения
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {activeTab === 'apk' && (
            <div className="space-y-4 animate-fade-in">
              {/* Option A: Cloud 1-click APK with PWABuilder */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">1</span>
                    <h4 className="text-sm font-bold text-gray-900">
                      Самый быстрый способ: Онлайн-генератор APK (PWABuilder)
                    </h4>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                    Без установки программ
                  </span>
                </div>
                <p className="text-xs text-gray-700 leading-relaxed">
                  Сервис <b>PWABuilder от Microsoft</b> упаковывает приложение в полноценный установочный <b>.APK</b> (и AAB для Google Play/RuStore) за 1 минуту:
                </p>
                <ol className="list-decimal list-inside text-xs text-gray-700 space-y-1.5 bg-white p-3 rounded-xl border border-indigo-100">
                  <li>Перейдите на сайт <a href="https://www.pwabuilder.com" target="_blank" rel="noreferrer" className="text-indigo-600 font-bold underline">PWABuilder.com</a>.</li>
                  <li>Вставьте URL приложения: <code className="px-1.5 py-0.5 bg-gray-100 rounded text-indigo-700 font-mono select-all">https://ais-pre-d4au5av33dxsi2siumj64p-517684822625.europe-west3.run.app</code></li>
                  <li>Нажмите <b>«Start»</b> &rarr; <b>«Package for Android»</b> &rarr; Скачайте готовый <b>.apk</b> файл на телефон.</li>
                </ol>
              </div>

              {/* Option B: Local CLI build with Capacitor / Bubblewrap */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-gray-800 text-white text-xs font-bold flex items-center justify-center">2</span>
                    <h4 className="text-sm font-bold text-gray-900">
                      Сборка через Capacitor / Android Studio
                    </h4>
                  </div>
                  <button
                    onClick={() => handleCopy(buildApkCommands, 'apk-commands')}
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1"
                  >
                    {copiedCode === 'apk-commands' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedCode === 'apk-commands' ? 'Скопировано' : 'Копировать команды'}
                  </button>
                </div>
                <p className="text-xs text-gray-600">
                  Выполните команды в терминале проекта для сборки нативного Android проекта:
                </p>
                <pre className="text-[11px] font-mono text-gray-800 overflow-x-auto p-3 bg-white border border-gray-200 rounded-xl leading-relaxed">
                  {buildApkCommands}
                </pre>
              </div>

              {/* Option C: Capacitor Config */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700 font-mono">capacitor.config.json</span>
                  <button
                    onClick={() => handleCopy(capacitorConfig, 'cap-config')}
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1"
                  >
                    {copiedCode === 'cap-config' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedCode === 'cap-config' ? 'Скопировано' : 'Копировать'}
                  </button>
                </div>
                <pre className="text-[11px] font-mono text-gray-700 overflow-x-auto p-3 bg-white border border-gray-200 rounded-xl">
                  {capacitorConfig}
                </pre>
              </div>
            </div>
          )}
          {activeTab === 'pwa' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-3">
                <h4 className="text-sm font-bold text-indigo-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                  Установка приложения прямо на главный экран Android:
                </h4>
                <p className="text-xs text-gray-700 leading-relaxed">
                  Приложение построено с поддержкой Progressive Web App (PWA) и стандарта Android Standalone. Вы можете установить его на любой телефон Android без необходимости публикации в Google Play:
                </p>

                <ol className="list-decimal list-inside text-xs text-gray-700 space-y-1.5 bg-white p-3 rounded-xl border border-indigo-100">
                  <li>Откройте эту страницу в мобильном браузере <b>Google Chrome</b> или <b>Яндекс.Браузер</b> на Android.</li>
                  <li>Нажмите меню <b>&vellip; (три точки)</b> в правом верхнем углу.</li>
                  <li>Выберите пункт <b>«Установить приложение»</b> или <b>«Добавить на главный экран»</b>.</li>
                  <li>На рабочем столе появится иконка <b>PharmAtlas</b>, приложение будет открываться на весь экран и работать офлайн!</li>
                </ol>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700 font-mono">public/manifest.json</span>
                  <button
                    onClick={() => handleCopy(manifestCode, 'manifest')}
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1"
                  >
                    {copiedCode === 'manifest' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedCode === 'manifest' ? 'Скопировано' : 'Копировать'}
                  </button>
                </div>
                <pre className="text-[11px] font-mono text-gray-700 overflow-x-auto p-3 bg-white border border-gray-200 rounded-xl">
                  {manifestCode}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'json' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">
                      Готовая база данных: master_pharmacology_database.json
                    </h4>
                    <p className="text-xs text-gray-500">
                      70 фармакологических групп, сотни зарегистрированных МНН, торговых наименований РФ и матрица DDI.
                    </p>
                  </div>
                  <button
                    onClick={handleDownloadJSON}
                    className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs shrink-0"
                  >
                    <Download className="w-4 h-4" />
                    Скачать JSON
                  </button>
                </div>

                <div className="p-3 bg-white rounded-xl border border-gray-200 text-xs text-gray-700 space-y-1">
                  <p>✅ <b>Формат:</b> JSON UTF-8 (совместим с Room, SQLite, Hive, Drift, PostgreSQL, Firebase).</p>
                  <p>✅ <b>Поля каждого препарата:</b> INN (рус/лат), trade_names, mechanism_of_action, profiles_and_targets, therapeutic_dosage, toxic_threshold, absolute_contraindications, dosage_forms, receptors.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'kotlin' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-700">MainActivity.kt (Android Jetpack Compose)</span>
                <button
                  onClick={() => handleCopy(kotlinSampleCode, 'kotlin')}
                  className="px-2.5 py-1 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs text-indigo-600 font-semibold flex items-center gap-1 transition-colors"
                >
                  {copiedCode === 'kotlin' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedCode === 'kotlin' ? 'Скопировано' : 'Копировать код'}
                </button>
              </div>

              <pre className="text-[11px] font-mono text-gray-700 p-3.5 bg-gray-50 rounded-2xl border border-gray-200 overflow-x-auto max-h-72">
                {kotlinSampleCode}
              </pre>
            </div>
          )}

          {activeTab === 'report' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">
                      Клиническое заключение / Протокол назначения
                    </h4>
                    <p className="text-xs text-gray-500">
                      Экспорт текущего анализа {selectedDrugs.length} препаратов в файл .TXT для карты пациента или распечатки
                    </p>
                  </div>
                  <button
                    onClick={handleDownloadReport}
                    disabled={!analysis || selectedDrugs.length === 0}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs shrink-0"
                  >
                    <Download className="w-4 h-4" />
                    Скачать Отчет (.txt)
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            PharmAtlas v2.0 &bull; 100% Offline-Ready
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-semibold shadow-xs"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
