import React, { useMemo } from 'react';
import { MOCK_DATA } from '../data/mockData';

export const InstitutionsPage: React.FC = () => {
  const institutionStats = useMemo(() => {
    const map: Record<string, { count: number; fraud: number; records: typeof MOCK_DATA }> = {};
    MOCK_DATA.forEach(d => {
      if (!map[d.institution]) map[d.institution] = { count: 0, fraud: 0, records: [] };
      map[d.institution].count++;
      map[d.institution].records.push(d);
      if (d.reason === 'Fraud') map[d.institution].fraud++;
    });
    return Object.entries(map)
      .map(([institution, stats]) => ({ institution, ...stats }))
      .sort((a, b) => b.count - a.count);
  }, []);

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">研究机构撤稿排行</h1>
          <p className="text-slate-500">查看各研究机构的撤稿统计数据</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {institutionStats.map(({ institution, count, fraud }) => (
            <div
              key={institution}
              className="bg-white rounded-xl border border-slate-200 p-5 card-hover"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center text-lg">🏛</div>
                  <div>
                    <div className="font-bold text-slate-800">{institution}</div>
                    <div className="text-sm text-slate-500">{count} 篇撤稿</div>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-md text-xs font-medium ${
                  (fraud / count) > 0.3 ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-600'
                }`}>
                  {((fraud / count) * 100).toFixed(0)}% 欺诈
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
              </div>
              <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
                  style={{ width: `${(count / institutionStats[0].count) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
