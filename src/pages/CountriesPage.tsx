import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MOCK_DATA } from '../data/mockData';

export const CountriesPage: React.FC = () => {
  const countryStats = useMemo(() => {
    const map: Record<string, { count: number; fraud: number; records: typeof MOCK_DATA }> = {};
    MOCK_DATA.forEach(d => {
      if (!map[d.country]) map[d.country] = { count: 0, fraud: 0, records: [] };
      map[d.country].count++;
      map[d.country].records.push(d);
      if (d.reason === 'Fraud') map[d.country].fraud++;
    });
    return Object.entries(map)
      .map(([country, stats]) => ({ country, ...stats }))
      .sort((a, b) => b.count - a.count);
  }, []);

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">国家/地区分布</h1>
          <p className="text-slate-500">查看全球各国家/地区的撤稿统计数据</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {countryStats.map(({ country, count, fraud, records }) => {
            const flag = records[0]?.flag || '🌍';
            return (
              <Link
                key={country}
                to={`/country/${encodeURIComponent(country)}`}
                className="bg-white rounded-xl border border-slate-200 p-5 card-hover cursor-pointer block"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{flag}</span>
                    <div>
                      <div className="font-bold text-slate-800">{country}</div>
                      <div className="text-sm text-slate-500">{count} 篇撤稿</div>
                    </div>
                  </div>
                  <div className="bg-rose-50 text-rose-600 px-2 py-1 rounded-md text-xs font-medium">
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
                    style={{ width: `${(count / countryStats[0].count) * 100}%` }}
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};
