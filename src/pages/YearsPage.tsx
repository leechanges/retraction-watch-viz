import React, { useMemo } from 'react';
import { MOCK_DATA, getYearStats } from '../data/mockData';

export const YearsPage: React.FC = () => {
  const yearStats = useMemo(() => {
    const stats = getYearStats(MOCK_DATA);
    const map: Record<string, { count: number; fraud: number; records: typeof MOCK_DATA }> = {};
    
    Object.entries(stats).forEach(([year, count]) => {
      const records = MOCK_DATA.filter(d => d.year === Number(year));
      map[year] = {
        count,
        fraud: records.filter(d => d.reason === 'Fraud').length,
        records,
      };
    });
    
    return Object.entries(map)
      .map(([year, data]) => ({ year: Number(year), ...data }))
      .sort((a, b) => b.year - a.year);
  }, []);

  const maxCount = Math.max(...yearStats.map(y => y.count));

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">年度撤稿趋势</h1>
          <p className="text-slate-500">查看各年份的撤稿数量和趋势变化</p>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
          <h3 className="font-bold text-slate-800 mb-6">撤稿时间线</h3>
          <div className="flex items-end gap-2 h-48">
            {yearStats.map(({ year, count, fraud }) => (
              <div key={year} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex flex-col items-center gap-1">
                  <div className="text-xs font-bold text-slate-600">{count}</div>
                  <div 
                    className="w-full bg-slate-200 rounded-t-lg relative group cursor-pointer"
                    style={{ height: `${(count / maxCount) * 120}px` }}
                  >
                    <div 
                      className="absolute bottom-0 w-full bg-gradient-to-t from-teal-500 to-teal-400 rounded-t-lg transition-all hover:from-teal-600 hover:to-teal-500"
                      style={{ height: `${(fraud / count) * 100}%` }}
                    />
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {year}: {count}篇 ({((fraud / count) * 100).toFixed(0)}%欺诈)
                    </div>
                  </div>
                </div>
                <div className="text-sm font-medium text-slate-600">{year}</div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-4 justify-center">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-teal-400"></div>
              <span className="text-xs text-slate-500">正常撤稿</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-teal-600"></div>
              <span className="text-xs text-slate-500">欺诈撤稿</span>
            </div>
          </div>
        </div>

        {/* Year Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {yearStats.map(({ year, count, fraud, records }) => (
            <div
              key={year}
              className="bg-white rounded-xl border border-slate-200 p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-2xl font-bold text-slate-800">{year}</div>
                  <div className="text-sm text-slate-500">{count} 篇撤稿</div>
                </div>
                <div className={`px-2 py-1 rounded-md text-xs font-medium ${
                  (fraud / count) > 0.4 ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-600'
                }`}>
                  {((fraud / count) * 100).toFixed(1)}% 欺诈
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">撤稿总数</span>
                  <span className="font-medium text-slate-700">{count}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">欺诈/伪造</span>
                  <span className="font-medium text-rose-600">{fraud}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">涉及期刊</span>
                  <span className="font-medium text-slate-700">{new Set(records.map(r => r.journal)).size}</span>
                </div>
              </div>
              <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-teal-400 to-teal-500 rounded-full"
                  style={{ width: `${(count / maxCount) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
