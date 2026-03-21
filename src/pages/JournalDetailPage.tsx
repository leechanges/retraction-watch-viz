import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { loadData } from '../data/loader';
import { getYearStats, getCountryStats } from '../data/parser';
import { PageLayout } from '../components/PageLayout';
import type { RetractionRecord } from '../data/parser';

export const JournalDetailPage: React.FC = () => {
  const { journal } = useParams<{ journal: string }>();
  const [records, setRecords] = useState<RetractionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData().then(data => {
      setRecords(data);
      setLoading(false);
    });
  }, []);

  const decodedJournal = decodeURIComponent(journal || '');

  const journalRecords = useMemo(() =>
    records.filter(r => r.journal === decodedJournal),
    [records, decodedJournal]
  );

  const yearStats = useMemo(() => getYearStats(journalRecords), [journalRecords]);
  const countryStats = useMemo(() => getCountryStats(journalRecords), [journalRecords]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (journalRecords.length === 0) {
    return (
      <PageLayout icon="📚" title="期刊详情" subtitle="">
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-xl font-bold mb-2">未找到数据</h2>
          <p className="text-slate-500 mb-4">未找到 "{decodedJournal}" 的相关数据</p>
          <Link to="/journals" className="text-rose-500 hover:underline">返回期刊列表</Link>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout icon="📚" title={decodedJournal} subtitle={`共 ${journalRecords.length} 篇撤稿`}>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-slate-900">{journalRecords.length.toLocaleString()}</div>
          <div className="text-sm text-slate-500">撤稿总数</div>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-slate-900">{countryStats.length}</div>
          <div className="text-sm text-slate-500">涉及国家</div>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-slate-900">{yearStats.length}</div>
          <div className="text-sm text-slate-500">覆盖年份</div>
        </div>
      </div>

      {/* Year Trend */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 mb-8">
        <h3 className="font-bold text-slate-900 mb-4">年度趋势</h3>
        <div className="flex items-end gap-1 h-32">
          {yearStats.map(({ year, count }) => {
            const maxCount = Math.max(...yearStats.map(y => y.count));
            return (
              <div key={year} className="flex-1 flex flex-col items-center gap-1 group relative">
                <div
                  className="w-full bg-rose-500 rounded-t hover:bg-rose-600 transition-colors"
                  style={{ height: `${(count / maxCount) * 100}px` }}
                />
                <span className="text-xs text-slate-500">{year}</span>
                <div className="absolute bottom-full mb-1 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  {year}: {count} 篇
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Records */}
      <div>
        <h3 className="font-bold text-slate-900 mb-4">撤稿记录</h3>
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left p-3 text-sm font-semibold text-slate-500">标题</th>
                <th className="text-left p-3 text-sm font-semibold text-slate-500">机构</th>
                <th className="text-left p-3 text-sm font-semibold text-slate-500">日期</th>
              </tr>
            </thead>
            <tbody>
              {journalRecords.slice(0, 15).map(record => (
                <tr key={record.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="p-3 text-sm text-slate-700 max-w-md truncate" title={record.title}>{record.title}</td>
                  <td className="p-3 text-sm text-slate-500 max-w-xs truncate" title={record.institution}>{record.institution}</td>
                  <td className="p-3 text-sm text-slate-500">{record.retractionDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageLayout>
  );
};
