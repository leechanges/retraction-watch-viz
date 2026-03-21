import React, { useEffect, useState } from 'react';
import { loadData } from '../data/loader';
import { getYearStats } from '../data/parser';
import { PageLayout } from '../components/PageLayout';

export const YearsPage: React.FC = () => {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData().then(data => {
      setRecords(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const yearStats = getYearStats(records);
  const maxCount = yearStats.length > 0 ? Math.max(...yearStats.map(y => y.count)) : 1;
  const totalRetractions = yearStats.reduce((sum, y) => sum + y.count, 0);

  return (
    <PageLayout icon="📅" title="年份趋势" subtitle={`覆盖 ${yearStats.length} 年，共 ${totalRetractions.toLocaleString()} 篇撤稿`}>
      {/* Data note */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-6 text-sm text-amber-700">
        ⚠️ 注意：2024–2025 年数据可能尚未完整收录，2023 年数据量最大是因为 Retraction Watch 持续回溯补录历史撤稿记录。
      </div>

      {/* Chart */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 mb-8">
        <h3 className="font-bold text-slate-900 mb-4">撤稿趋势图</h3>
        <div className="flex items-end gap-1 h-48">
          {yearStats.map(({ year, count }) => (
            <div key={year} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer relative">
              <div
                className="w-full bg-rose-500 rounded-t hover:bg-rose-600 transition-colors"
                style={{ height: `${(count / maxCount) * 160}px` }}
              />
              <span className="text-xs text-slate-500">{year}</span>
              <div className="absolute bottom-full mb-2 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                {year}: {count} 篇
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Year List */}
      <div className="space-y-2">
        {yearStats.slice().reverse().map(({ year, count }) => {
          const percentage = (count / maxCount) * 100;
          return (
            <div
              key={year}
              className="flex items-center gap-4 bg-white border border-slate-200 rounded-lg p-4"
            >
              <span className="w-16 font-bold text-slate-900">{year}</span>
              <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-rose-500 font-bold">{count.toLocaleString()}</span>
              <span className="text-slate-400">篇</span>
            </div>
          );
        })}
      </div>
    </PageLayout>
  );
};
