import React, { useEffect, useState } from 'react';
import { loadData } from '../data/loader';
import { getYearStats } from '../data/parser';

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const yearStats = getYearStats(records);
  const maxCount = yearStats.length > 0 ? Math.max(...yearStats.map(y => y.count)) : 1;
  const totalRetractions = yearStats.reduce((sum, y) => sum + y.count, 0);

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📅</span>
            <div>
              <div className="text-xl font-bold">年份趋势</div>
              <div className="text-xs text-slate-400">覆盖 {yearStats.length} 年，共 {totalRetractions.toLocaleString()} 篇撤稿</div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Chart */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 mb-8">
          <h3 className="font-bold text-slate-900 mb-4">撤稿趋势图</h3>
          <div className="flex items-end gap-1 h-48">
            {yearStats.map(({ year, count }) => (
              <div key={year} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                <div 
                  className="w-full bg-rose-500 rounded-t hover:bg-rose-600 transition-colors"
                  style={{ height: `${(count / maxCount) * 160}px` }}
                />
                <span className="text-xs text-slate-500">{year}</span>
                <div className="absolute bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity -mt-8 whitespace-nowrap">
                  {year}: {count}
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
      </main>
    </div>
  );
};
