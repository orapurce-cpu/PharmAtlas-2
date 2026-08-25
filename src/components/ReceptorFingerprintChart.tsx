import React from 'react';
import { DrugItem } from '../types';
import { ShieldCheck, Activity, Target } from 'lucide-react';

interface ReceptorFingerprintChartProps {
  drugs: DrugItem[];
}

export const ReceptorFingerprintChart: React.FC<ReceptorFingerprintChartProps> = ({ drugs }) => {
  if (drugs.length === 0) return null;

  // Selected autonomic / cardiorenal target markers from the user's atlas
  const targets = [
    { key: 'α1', label: 'α1-AR (Сосуды/АД)', color: '#f97316' },
    { key: 'β1', label: 'β1-AR (Сердце/ЧСС)', color: '#ef4444' },
    { key: 'β2', label: 'β2-AR (Бронхи)', color: '#3b82f6' },
    { key: 'M1', label: 'M1/M2/M3 (Холино)', color: '#a855f7' },
    { key: 'NKCC2', label: 'NKCC2 (Петля Генле)', color: '#06b6d4' },
    { key: 'Ca-L-канал', label: 'Ca-L (Са-каналы)', color: '#eab308' },
    { key: 'Na+/K+-АТФаза', label: 'Na/K-АТФаза', color: '#10b981' },
    { key: 'K-канал', label: 'K-канал (QT)', color: '#ec4899' },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-indigo-600" />
          <h3 className="text-sm font-bold text-gray-900">
            Рецепторная карта и молекулярные мишени (PharmAtlas Fingerprint)
          </h3>
        </div>
        <span className="text-xs text-gray-500">
          Сродство: 0.0 (нет) &rarr; 4.0 (макс)
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-gray-200 text-gray-500">
              <th className="py-2.5 px-3 font-semibold text-gray-700">Препарат</th>
              {targets.map(t => (
                <th key={t.key} className="py-2.5 px-2 text-center font-mono text-[11px] text-gray-600">
                  {t.key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {drugs.map(d => {
              return (
                <tr key={d.id} className="hover:bg-gray-50/70">
                  <td className="py-2.5 px-3 font-bold text-gray-900 whitespace-nowrap">
                    {d.inn.split(' ')[0]}
                    <span className="block text-[11px] font-normal text-gray-500">
                      {d.trade_names[0] || ''}
                    </span>
                  </td>
                  {targets.map(t => {
                    const val = d.receptors ? (d.receptors[t.key] ?? 0) : 0;
                    const intensity = val / 4.0;
                    
                    return (
                      <td key={t.key} className="py-2 px-2 text-center">
                        {val > 0 ? (
                          <span
                            className="inline-block px-2 py-0.5 rounded-md text-[11px] font-bold"
                            style={{
                              backgroundColor: `rgba(79, 70, 229, ${Math.max(0.12, intensity * 0.9)})`,
                              color: intensity > 0.4 ? '#ffffff' : '#4338ca',
                            }}
                          >
                            {val.toFixed(1)}
                          </span>
                        ) : (
                          <span className="text-gray-300 font-mono text-[11px]">0.0</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-200">
        💡 <b>Интерпретация:</b> Пересечение нескольких препаратов на одной и той же рецепторной мишени (например, на K-каналах с риском аритмии или β1-адренорецепторах) многократно увеличивает вероятность взаимного токсического потенцирования.
      </p>
    </div>
  );
};
