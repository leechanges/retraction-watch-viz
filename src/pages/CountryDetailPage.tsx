import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { loadData } from '../data/loader';
import { getYearStats, getJournalStats } from '../data/parser';
import type { RetractionRecord } from '../data/parser';

export const CountryDetailPage: React.FC = () => {
  const { country } = useParams<{ country: string }>();
  const [records, setRecords] = useState<RetractionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData().then(data => {
      setRecords(data);
      setLoading(false);
    });
  }, []);

  const decodedCountry = decodeURIComponent(country || '');
  
  const countryRecords = useMemo(() => 
    records.filter(r => r.country === decodedCountry),
    [records, decodedCountry]
  );

  const yearStats = useMemo(() => getYearStats(countryRecords), [countryRecords]);
  const journalStats = useMemo(() => getJournalStats(countryRecords), [countryRecords]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-14">
        <div className="w-12 h-12 border-4 border-[#0071e3] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (countryRecords.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-14">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-semibold mb-2">未找到数据</h2>
          <p className="text-[#86868b] mb-4">未找到 "{decodedCountry}" 的相关数据</p>
          <Link to="/countries" className="text-[#0071e3] hover:underline">返回国家列表</Link>
        </div>
      </div>
    );
  }

  const maxCount = yearStats.length > 0 ? Math.max(...yearStats.map(y => y.count)) : 1;

  return (
    <div className="pt-14">
      {/* Hero */}
      <section className="hero-gradient py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <Link to="/countries" className="text-[#0071e3] text-[14px] mb-6 inline-block">
            ← 返回国家列表
          </Link>
          <h1 className="headline-xl mb-4">{decodedCountry}</h1>
          <p className="text-[17px] text-[#86868b]">
            共 {countryRecords.length.toLocaleString()} 篇撤稿记录
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-4 gap-6 mb-16">
            <div className="bg-[#f5f5f7] rounded-2xl p-6 text-center">
              <div className="text-4xl font-semibold">{countryRecords.length.toLocaleString()}</div>
              <p className="text-[14px] text-[#86868b] mt-1">撤稿总数</p>
            </div>
            <div className="bg-[#f5f5f7] rounded-2xl p-6 text-center">
              <div className="text-4xl font-semibold">{journalStats.length}</div>
              <p className="text-[14px] text-[#86868b] mt-1">涉及期刊</p>
            </div>
            <div className="bg-[#f5f5f7] rounded-2xl p-6 text-center">
              <div className="text-4xl font-semibold">{yearStats.length}</div>
              <p className="text-[14px] text-[#86868b] mt-1">覆盖年份</p>
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
              <div className="flex items-end gap-2 h-48">
                {yearStats.map(({ year, count }) => (
                  <div key={year} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex flex-col items-center">
                      <span className="text-[12px] font-medium mb-1">{count}</span>
                      <div 
                        className="w-full bg-[#0071e3] rounded-t-lg transition-all hover:bg-[#0077ED]"
                        style={{ height: `${(count / maxCount) * 160}px` }}
                      />
                    </div>
                    <span className="text-[12px] text-[#86868b]">{year}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Journals */}
          <div className="mb-16">
            <h2 className="headline-md mb-8">热门期刊</h2>
            <div className="space-y-4">
              {journalStats.slice(0, 10).map(([journal, count]) => (
                <Link
                  key={journal}
                  to={`/journal/${encodeURIComponent(journal)}`}
                  className="bg-[#f5f5f7] rounded-2xl p-6 flex items-center gap-6 hover:bg-[#e8e8ed] transition-colors block"
                >
                  <div className="flex-1">
                    <div className="text-[17px] font-semibold">{journal}</div>
                  </div>
                  <div className="text-[21px] font-semibold text-[#0071e3]">{count}</div>
                </Link>
              ))}
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
                    <th className="text-left p-4 text-[12px] font-semibold text-[#86868b] uppercase">期刊</th>
                    <th className="text-left p-4 text-[12px] font-semibold text-[#86868b] uppercase">撤稿日期</th>
                  </tr>
                </thead>
                <tbody>
                  {countryRecords.slice(0, 10).map(record => (
                    <tr key={record.id} className="border-b border-[#e8e8ed] hover:bg-[#e8e8ed] transition-colors">
                      <td className="p-4 text-[14px] max-w-md truncate">{record.title}</td>
                      <td className="p-4 text-[14px] text-[#86868b]">{record.journal}</td>
                      <td className="p-4 text-[14px] text-[#86868b]">{record.retractionDate}</td>
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
