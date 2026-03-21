import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MOCK_DATA } from '../data/mockData';

export const JournalsPage: React.FC = () => {
  const journalStats = useMemo(() => {
    const map: Record<string, { count: number; fraud: number; records: typeof MOCK_DATA }> = {};
    MOCK_DATA.forEach(d => {
      if (!map[d.journal]) map[d.journal] = { count: 0, fraud: 0, records: [] };
      map[d.journal].count++;
      map[d.journal].records.push(d);
      if (d.reason === 'Fraud') map[d.journal].fraud++;
    });
    return Object.entries(map)
      .map(([journal, stats]) => ({ journal, ...stats }))
      .sort((a, b) => b.count - a.count);
  }, []);

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">期刊撤稿排行</h1>
          <p className="text-slate-500">查看各期刊的撤稿统计数据和欺诈率</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase w-12">#</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">期刊名称</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">撤稿数</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">欺诈数</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">欺诈率</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">趋势</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {journalStats.map(({ journal, count, fraud, records }, i) => (
                <tr key={journal} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4">
                    <span className={`w-7 h-7 inline-flex items-center justify-center rounded-full text-xs font-bold ${
                      i === 0 ? 'bg-amber-100 text-amber-700' :
                      i === 1 ? 'bg-slate-200 text-slate-600' :
                      i === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-slate-100 text-slate-500'
                    }`}>
                      {i + 1}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <Link to={`/journal/${encodeURIComponent(journal)}`} className="font-medium text-slate-800 hover:text-teal-600">
                      {journal}
                    </Link>
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-bold text-slate-800">{count}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-rose-600">{fraud}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-rose-500 rounded-full"
                          style={{ width: `${(fraud / count) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-slate-600">{((fraud / count) * 100).toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-0.5">
                      {records.slice(0, 5).map((r, idx) => (
                        <div 
                          key={idx}
                          className={`w-2 h-6 rounded-sm ${
                            r.reason === 'Fraud' ? 'bg-rose-400' :
                            r.reason === 'Error' ? 'bg-amber-400' :
                            r.reason === 'Plagiarism' ? 'bg-purple-400' :
                            'bg-slate-300'
                          }`}
                          title={`${r.year}: ${r.reason}`}
                        />
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
