import React from 'react';
import { Pill, AlertTriangle, BookOpen, Smartphone } from 'lucide-react';

export type MainTab = 'slots' | 'report' | 'database' | 'files';

interface AndroidBottomNavProps {
  currentTab: MainTab;
  onTabChange: (tab: MainTab) => void;
  selectedCount: number;
  hasCollision: boolean;
}

export const AndroidBottomNav: React.FC<AndroidBottomNavProps> = ({
  currentTab,
  onTabChange,
  selectedCount,
  hasCollision,
}) => {
  return (
    <nav className="sticky bottom-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-sm">
      <div className="max-w-md mx-auto grid grid-cols-4 px-2 py-1.5">
        {/* Tab 1: Slots */}
        <button
          onClick={() => onTabChange('slots')}
          className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all ${
            currentTab === 'slots'
              ? 'text-indigo-600 font-bold bg-indigo-50/80 scale-102'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <div className="relative">
            <Pill className="w-5 h-5" />
            {selectedCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 w-4 h-4 rounded-full bg-indigo-600 text-white text-[9px] font-black flex items-center justify-center border border-white">
                {selectedCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-1">5 Препаратов</span>
        </button>

        {/* Tab 2: Report */}
        <button
          onClick={() => onTabChange('report')}
          className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all ${
            currentTab === 'report'
              ? 'text-indigo-600 font-bold bg-indigo-50/80 scale-102'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <div className="relative">
            <AlertTriangle className={`w-5 h-5 ${hasCollision ? 'text-amber-500 animate-bounce' : ''}`} />
            {hasCollision && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500"></span>
            )}
          </div>
          <span className="text-[10px] mt-1">Анализ DDI</span>
        </button>

        {/* Tab 3: Database */}
        <button
          onClick={() => onTabChange('database')}
          className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all ${
            currentTab === 'database'
              ? 'text-indigo-600 font-bold bg-indigo-50/80 scale-102'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-[10px] mt-1">70 Групп</span>
        </button>

        {/* Tab 4: Android Files */}
        <button
          onClick={() => onTabChange('files')}
          className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all ${
            currentTab === 'files'
              ? 'text-indigo-600 font-bold bg-indigo-50/80 scale-102'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Smartphone className="w-5 h-5" />
          <span className="text-[10px] mt-1">APK / Файлы</span>
        </button>
      </div>
    </nav>
  );
};
