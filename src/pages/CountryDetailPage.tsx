import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MOCK_DATA, getReasonStats, getYearStats } from '../data/mockData';

export const CountryDetailPage: React.FC = () => {
  const { country } = useParams<{ country: string }>();
  const decodedCountry = decodeURIComponent(country || '');

  const countryData = useMemo(() => {
    const records = MOCK_DATA.filter(d => d.country === decodedCountry);
    const reasonStats = getReasonStats(records);
    const yearStats = getYearStats(records);
    
    const journalMap: Record<string, number> = {};
    const instMap: Record<string, number> = {};
    records.forEach(d => {
      journalMap[d.journal] = (journalMap[d.journal] || 0) + 1;
      instMap[d.institution] = (instMap[d.institution] || 0) + 1;
    });

    return {
      records,
      total: records.length,
      fraudCount: records.filter(d => d.reason === 'Fraud').length,
      reasonStats,
      yearStats,
      topJournals: Object.entries(journalMap).sort((a, b) => b[1] - a[1]).slice(0, 5),
      topInstitutions: Object.entries(instMap).sort((a, b) => b[1] - a[1]).slice(0, 5),
    };
  }, [decodedCountry]);

  if (countryData.records.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">未找到数据</h2>
          <p className="text-slate-500 mb-4">未找到 "{decodedCountry}" 的相关数据</p>
          <Link to="/countries" className="text-teal-600 hover:text-teal-700">返回国家列表</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link to="/countries" className="text-slate-400 hover:text-slate-600">←</Link>
          <h1 className="text-2xl font-bold text-slate-800">{decodedCountry}</h1>
          <span className="text-3xl">{countryData.records[0]?.flag}</span>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="text-3xl font-bold text-slate-800">{countryData.total}</div>
            <div className="text-sm text-slate-500">撤稿总数</div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="text-3xl font-bold text-rose-600">{countryData.fraudCount}</div>
            <div className="text-sm text-slate-500">欺诈/伪造</div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="text-3xl font-bold text-slate-800">{countryData.topJournals.length}</div>
            <div className="text-sm text-slate-500">涉及期刊</div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="text-3xl font-bold text-slate-800">{countryData.topInstitutions.length}</div>
            <div className="text-sm text-slate-500">研究机构</div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Reason Distribution */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-bold text-slate-800 mb-4">撤稿原因分布</h3>
            <div className="space-y-3">
              {Object.entries(countryData.reasonStats).map(([reason, count]) => (
                <div key={reason} className="flex items-center gap-3">
                  <div className="w-24 text-sm text-slate-600">{reason}</div>
                  <div className="flex-1 h-6 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        reason === 'Fraud' ? 'bg-rose-500' :
                        reason === 'Error' ? 'bg-amber-500' :
                        reason === 'Plagiarism' ? 'bg-purple-500' :
                        'bg-slate-400'
                      }`}
                      style={{ width: `${(count / countryData.total) * 100}%` }}
                    />
                  </div>
                  <div className="w-12 text-sm text-right font-medium text-slate-700">{count}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Journals */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-bold text-slate-800 mb-4">热门期刊</h3>
            <div className="space-y-2">
              {countryData.topJournals.map(([journal, count], i) => (
                <Link
                  key={journal}
                  to={`/journal/${journal}`}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <span className="w-6 text-sm text-slate-400">{i + 1}</span>
                  <span className="flex-1 text-sm text-slate-700">{journal}</span>
                  <span className="text-sm font-bold text-teal-600">{count}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Records Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200">
            <h3 className="font-bold text-slate-800">最近撤稿记录</h3>
          </div>
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">标题</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">期刊</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">原因</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">年份</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {countryData.records.slice(0, 10).map(record => (
                <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3 text-sm text-slate-700 max-w-md truncate">{record.title}</td>
                  <td className="px-5 py-3 text-sm text-slate-600">{record.journal}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      record.reason === 'Fraud' ? 'bg-rose-50 text-rose-600' :
                      record.reason === 'Error' ? 'bg-amber-50 text-amber-600' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {record.reason}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-slate-600 font-mono">{record.year}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
