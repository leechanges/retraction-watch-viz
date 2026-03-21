import React, { useMemo } from 'react';
import { MOCK_DATA, getReasonStats } from '../data/mockData';

export const FieldsPage: React.FC = () => {
  const fieldStats = useMemo(() => {
    const map: Record<string, { count: number; fraud: number; records: typeof MOCK_DATA }> = {};
    MOCK_DATA.forEach(d => {
      if (!map[d.field]) map[d.field] = { count: 0, fraud: 0, records: [] };
      map[d.field].count++;
      map[d.field].records.push(d);
      if (d.reason === 'Fraud') map[d.field].fraud++;
    });
    return Object.entries(map)
      .map(([field, stats]) => ({ field, ...stats }))
      .sort((a, b) => b.count - a.count);
  }, []);

  const fieldColors: Record<string, string> = {
    'Medicine': 'bg-rose-500',
    'Biology': 'bg-emerald-500',
    'Chemistry': 'bg-amber-500',
    'Physics': 'bg-blue-500',
    'Neuroscience': 'bg-purple-500',
    'Computer Science': 'bg-cyan-500',
    'Engineering': 'bg-orange-500',
    'Environmental Science': 'bg-green-500',
    'Materials Science': 'bg-slate-500',
    'Psychology': 'bg-pink-500',
  };

  const fieldIcons: Record<string, string> = {
    'Medicine': '⚕️',
    'Biology': '🧬',
    'Chemistry': '⚗️',
    'Physics': '⚛️',
    'Neuroscience': '🧠',
    'Computer Science': '💻',
    'Engineering': '🔧',
    'Environmental Science': '🌍',
    'Materials Science': '🔩',
    'Psychology': '🧠',
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">学科领域分布</h1>
          <p className="text-slate-500">查看各学科领域的撤稿统计数据</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {fieldStats.map(({ field, count, fraud }) => (
            <div
              key={field}
              className="bg-white rounded-xl border border-slate-200 p-5 text-center card-hover"
            >
              <div className="text-3xl mb-2">{fieldIcons[field] || '📊'}</div>
              <div className="text-2xl font-bold text-slate-800">{count}</div>
              <div className="text-sm text-slate-500 mb-1">{field}</div>
              <div className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                (fraud / count) > 0.3 ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-600'
              }`}>
                {((fraud / count) * 100).toFixed(0)}% 欺诈
              </div>
            </div>
          ))}
        </div>

        {/* Detailed Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {fieldStats.map(({ field, count, fraud, records }) => {
            const journals = [...new Set(records.map(r => r.journal))];
            const reasonStats = getReasonStats(records);
            
            return (
              <div key={field} className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-xl ${fieldColors[field] || 'bg-slate-500'} flex items-center justify-center text-2xl text-white`}>
                    {fieldIcons[field] || '📊'}
                  </div>
                  <div>
                    <div className="font-bold text-slate-800">{field}</div>
                    <div className="text-sm text-slate-500">{count} 篇撤稿</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-slate-50 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-slate-800">{count}</div>
                    <div className="text-xs text-slate-500">撤稿数</div>
                  </div>
                  <div className="bg-rose-50 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-rose-600">{fraud}</div>
                    <div className="text-xs text-slate-500">欺诈数</div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-slate-800">{journals.length}</div>
                    <div className="text-xs text-slate-500">期刊数</div>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="text-xs text-slate-500 mb-2">撤稿原因分布</div>
                  <div className="space-y-1">
                    {Object.entries(reasonStats).map(([reason, c]) => (
                      <div key={reason} className="flex items-center gap-2">
                        <div className="w-20 text-xs text-slate-600 truncate">{reason}</div>
                        <div className="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              reason === 'Fraud' ? 'bg-rose-500' :
                              reason === 'Error' ? 'bg-amber-500' :
                              reason === 'Plagiarism' ? 'bg-purple-500' :
                              'bg-slate-400'
                            }`}
                            style={{ width: `${(c / count) * 100}%` }}
                          />
                        </div>
                        <div className="w-8 text-xs text-right text-slate-600">{c}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
