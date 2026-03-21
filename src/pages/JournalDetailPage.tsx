import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { loadData } from '../data/loader';
import { getYearStats, getCountryStats } from '../data/parser';
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
      <div className="min-h-screen flex items-center justify-center pt-14">
        <div className="w-12 h-12 border-4 border-[#0071e3] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (journalRecords.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-14">
        <div className="text-center">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-2xl font-semibold mb-2">未找到数据</h2>
          <p className="text-[#86868b] mb-4">未找到 "{decodedJournal}" 的相关数据</p>
          <Link to="/journals" className="text-[#0071e3] hover:underline">返回期刊列表</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-14">
      <section className="hero-gradient py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <Link to="/journals" className="text-[#0071e3] text-[14px] mb-6 inline-block">
            ← 返回期刊列表
          </Link>
          <h1 className="headline-xl mb-4">{decodedJournal}</h1>
          <p className="text-[17px] text-[#86868b]">
            共 {journalRecords.length.toLocaleString()} 篇撤稿记录
          </p>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-3 gap-6 mb-16">
            <div className="bg-[#f5f5f7] rounded-2xl p-6 text-center">
              <div className="text-4xl font-semibold">{journalRecords.length.toLocaleString()}</div>
              <p className="text-[14px] text-[#86868b] mt-1">撤稿总数</p>
            </div>
            <div className="bg-[#f5f5f7] rounded-2xl p-6 text-center">
              <div className="text-4xl font-semibold">{countryStats.length}</div>
              <p className="text-[14px] text-[#86868b] mt-1">涉及国家</p>
            </div>
            <div className="bg-[#f5f5f7] rounded-2xl p-6 text-center">
              <div className="text-4xl font-semibold">{yearStats[yearStats.length - 1]?.year || '-'}</div>
              <p className="text-[14px] text-[#86868b] mt-1">最新年份</p>
            </div>
          </div>

          {/* Year Trend */}
          <div className="mb-16">
            <h2 className="headline-md mb-8">年度趋势</h2>
            <div className="bg-[#f5f5f7] rounded-2xl p-8">
              <div className="flex items-end gap-1 h-48">
                {yearStats.map(({ year, count }) => {
                  const maxCount = Math.max(...yearStats.map(y => y.count));
                  return (
                    <div key={year} className="flex-1 flex flex-col items-center gap-2">
                      <div 
                        className="w-full bg-[#0071e3] rounded-t-lg hover:bg-[#0077ED] transition-colors"
                        style={{ height: `${(count / maxCount) * 160}px` }}
                      />
                      <span className="text-[10px] text-[#86868b]">{year}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Recent Records */}
          <div>
            <h2 className="headline-md mb-8">最近撤稿</h2>
            <div className="bg-[#f5f5f7] rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#d2d2d7]">
                    <th className="text-left p-4 text-[12px] font-semibold text-[#86868b] uppercase">标题</th>
                    <th className="text-left p-4 text-[12px] font-semibold text-[#86868b] uppercase">机构</th>
                    <th className="text-left p-4 text-[12px] font-semibold text-[#86868b] uppercase">撤稿原因</th>
                  </tr>
                </thead>
                <tbody>
                  {journalRecords.slice(0, 15).map(record => (
                    <tr key={record.id} className="border-b border-[#e8e8ed] hover:bg-[#e8e8ed]">
                      <td className="p-4 text-[14px] max-w-md truncate">{record.title}</td>
                      <td className="p-4 text-[14px] text-[#86868b]">{record.institution}</td>
                      <td className="p-4 text-[14px] text-[#86868b]">{record.reasons[0]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
