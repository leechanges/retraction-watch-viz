import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { loadData } from '../data/loader';
import { getCountryStats, getJournalStats, getYearStats, getReasonStats } from '../data/parser';
import type { RetractionRecord } from '../data/parser';

export const HomePage: React.FC = () => {
  const [records, setRecords] = useState<RetractionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData().then(data => {
      setRecords(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-14">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#0071e3] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#86868b]">加载数据中...</p>
        </div>
      </div>
    );
  }

  const countryStats = getCountryStats(records);
  const journalStats = getJournalStats(records);
  const yearStats = getYearStats(records);
  const reasonStats = getReasonStats(records);

  const recentYear = yearStats[yearStats.length - 1]?.year || 2024;
  const recentCount = yearStats[yearStats.length - 1]?.count || 0;
  const totalCountries = countryStats.length;
  const totalJournals = journalStats.length;
  const topReason = reasonStats[0];

  return (
    <div className="pt-14">
      {/* Hero Section */}
      <section className="hero-gradient py-24 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <p className="eyebrow mb-4">全球学术撤稿数据库</p>
          <h1 className="headline-xl mb-6">
            追踪学术撤稿<br />守护科研诚信
          </h1>
          <p className="text-[17px] text-[#86868b] max-w-3xl mx-auto mb-10 leading-relaxed">
            基于 Retraction Watch 数据的智能分析平台，揭示全球学术撤稿趋势，
            帮助研究机构和期刊出版社监测学术不端行为。
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link to="/countries" className="btn-primary">
              开始探索
            </Link>
            <Link to="/reasons" className="btn-secondary">
              了解撤稿原因
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="stat-number text-[#1d1d1f]">{records.length.toLocaleString()}</div>
              <p className="text-[15px] text-[#86868b] mt-2">总撤稿记录</p>
            </div>
            <div>
              <div className="stat-number text-[#1d1d1f]">{totalCountries}</div>
              <p className="text-[15px] text-[#86868b] mt-2">涉及国家</p>
            </div>
            <div>
              <div className="stat-number text-[#1d1d1f]">{totalJournals}</div>
              <p className="text-[15px] text-[#86868b] mt-2">学术期刊</p>
            </div>
            <div>
              <div className="stat-number text-[#0071e3]">{recentYear}</div>
              <p className="text-[15px] text-[#86868b] mt-2">最新数据年</p>
            </div>
          </div>
        </div>
      </section>

      {/* Browse by Category */}
      <section className="py-20 px-6 bg-[#f5f5f7]">
        <div className="max-w-7xl mx-auto">
          <h2 className="headline-md text-center mb-4">按类别浏览</h2>
          <p className="text-[17px] text-[#86868b] text-center mb-12">
            从不同维度深入了解撤稿数据
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link to="/countries" className="apple-card p-8 block">
              <div className="text-4xl mb-4">🌍</div>
              <h3 className="text-[21px] font-semibold mb-2">国家/地区</h3>
              <p className="text-[14px] text-[#86868b] mb-4">
                查看各国撤稿数量和趋势对比
              </p>
              <div className="text-[14px] text-[#0071e3]">
                探索 {totalCountries} 个国家 →
              </div>
            </Link>

            <Link to="/journals" className="apple-card p-8 block">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-[21px] font-semibold mb-2">学术期刊</h3>
              <p className="text-[14px] text-[#86868b] mb-4">
                分析各期刊的撤稿情况和诚信记录
              </p>
              <div className="text-[14px] text-[#0071e3]">
                浏览 {totalJournals} 种期刊 →
              </div>
            </Link>

            <Link to="/institutions" className="apple-card p-8 block">
              <div className="text-4xl mb-4">🏛</div>
              <h3 className="text-[21px] font-semibold mb-2">研究机构</h3>
              <p className="text-[14px] text-[#86868b] mb-4">
                追踪研究机构的撤稿历史
              </p>
              <div className="text-[14px] text-[#0071e3]">
                查看全部机构 →
              </div>
            </Link>

            <Link to="/years" className="apple-card p-8 block">
              <div className="text-4xl mb-4">📅</div>
              <h3 className="text-[21px] font-semibold mb-2">年份趋势</h3>
              <p className="text-[14px] text-[#86868b] mb-4">
                撤稿数量随时间的演变趋势
              </p>
              <div className="text-[14px] text-[#0071e3]">
                {recentYear} 年 {recentCount} 篇新撤稿 →
              </div>
            </Link>

            <Link to="/reasons" className="apple-card p-8 block">
              <div className="text-4xl mb-4">⚠️</div>
              <h3 className="text-[21px] font-semibold mb-2">撤稿原因</h3>
              <p className="text-[14px] text-[#86868b] mb-4">
                了解导致撤稿的主要原因分析
              </p>
              <div className="text-[14px] text-[#0071e3]">
                最常见: {topReason?.[0]} →
              </div>
            </Link>

            <Link to="/publishers" className="apple-card p-8 block">
              <div className="text-4xl mb-4">🏢</div>
              <h3 className="text-[21px] font-semibold mb-2">出版商</h3>
              <p className="text-[14px] text-[#86868b] mb-4">
                主要学术出版商的撤稿记录
              </p>
              <div className="text-[14px] text-[#0071e3]">
                浏览出版商数据 →
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Top Countries */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <h2 className="headline-md">热门国家</h2>
            <Link to="/countries" className="text-[15px] text-[#0071e3] hover:underline">
              查看全部 →
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {countryStats.slice(0, 5).map(([country, count]) => (
              <Link 
                key={country}
                to={`/country/${encodeURIComponent(country)}`}
                className="bg-[#f5f5f7] rounded-2xl p-6 text-center hover:bg-[#e8e8ed] transition-colors"
              >
                <div className="text-3xl font-semibold text-[#1d1d1f]">{count.toLocaleString()}</div>
                <div className="text-[14px] text-[#86868b] mt-1">{country}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Top Journals */}
      <section className="py-20 px-6 bg-[#f5f5f7]">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <h2 className="headline-md">热门期刊</h2>
            <Link to="/journals" className="text-[15px] text-[#0071e3] hover:underline">
              查看全部 →
            </Link>
          </div>
          
          <div className="space-y-4">
            {journalStats.slice(0, 5).map(([journal, count], idx) => (
              <Link 
                key={journal}
                to={`/journal/${encodeURIComponent(journal)}`}
                className="bg-white rounded-2xl p-6 flex items-center gap-6 hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 rounded-full bg-[#f5f5f7] flex items-center justify-center text-[18px] font-semibold text-[#86868b]">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <div className="text-[17px] font-semibold">{journal}</div>
                </div>
                <div className="text-[21px] font-semibold text-[#0071e3]">{count.toLocaleString()}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-[#f5f5f7] border-t border-[#d2d2d7]">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-[12px] text-[#86868b]">
            数据来源: Retraction Watch | 仅供研究和教育目的
          </p>
        </div>
      </footer>
    </div>
  );
};
