import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { loadData } from '../data/loader';
import { getCountryStats, getJournalStats, getYearStats, getReasonStats, getPublisherStats } from '../data/parser';
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500">加载数据中...</p>
        </div>
      </div>
    );
  }

  const countryStats = getCountryStats(records);
  const journalStats = getJournalStats(records);
  const yearStats = getYearStats(records);
  const reasonStats = getReasonStats(records);
  const publisherStats = getPublisherStats(records);

  const recentYear = yearStats[yearStats.length - 1]?.year || 2024;
  const recentCount = yearStats[yearStats.length - 1]?.count || 0;
  const totalCountries = countryStats.length;
  const totalJournals = journalStats.length;
  const topReason = reasonStats[0];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📊</span>
              <div>
                <div className="text-xl font-bold">RetractionWatch</div>
                <div className="text-xs text-slate-400">学术撤稿数据平台</div>
              </div>
            </div>
            <div className="text-sm text-slate-400">
              数据更新: {new Date().toLocaleDateString('zh-CN')}
            </div>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="bg-slate-100 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-3">
          <div className="flex items-center gap-8 text-sm">
            <div>
              <span className="text-slate-500">总撤稿记录 </span>
              <span className="font-bold text-slate-900">{records.length.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-slate-500">涉及国家 </span>
              <span className="font-bold text-slate-900">{totalCountries}</span>
            </div>
            <div>
              <span className="text-slate-500">学术期刊 </span>
              <span className="font-bold text-slate-900">{totalJournals}</span>
            </div>
            <div>
              <span className="text-slate-500">最新数据年 </span>
              <span className="font-bold text-rose-500">{recentYear}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Hero */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">
            追踪学术撤稿 · 守护科研诚信
          </h1>
          <p className="text-slate-500 text-lg">
            基于 Retraction Watch 数据的智能分析平台，揭示全球学术撤稿趋势
          </p>
        </div>

        {/* Navigation Cards */}
        <div className="mb-10">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span>🔍</span> 数据分类
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Link to="/countries" className="bg-white border border-slate-200 rounded-lg p-5 hover:border-rose-300 hover:shadow-md transition-all">
              <div className="text-2xl mb-2">🌍</div>
              <div className="font-bold text-slate-900">国家/地区</div>
              <div className="text-sm text-slate-500">查看 {totalCountries} 个国家</div>
            </Link>
            <Link to="/journals" className="bg-white border border-slate-200 rounded-lg p-5 hover:border-rose-300 hover:shadow-md transition-all">
              <div className="text-2xl mb-2">📚</div>
              <div className="font-bold text-slate-900">学术期刊</div>
              <div className="text-sm text-slate-500">浏览 {totalJournals} 种期刊</div>
            </Link>
            <Link to="/institutions" className="bg-white border border-slate-200 rounded-lg p-5 hover:border-rose-300 hover:shadow-md transition-all">
              <div className="text-2xl mb-2">🏛</div>
              <div className="font-bold text-slate-900">研究机构</div>
              <div className="text-sm text-slate-500">追踪机构撤稿历史</div>
            </Link>
            <Link to="/years" className="bg-white border border-slate-200 rounded-lg p-5 hover:border-rose-300 hover:shadow-md transition-all">
              <div className="text-2xl mb-2">📅</div>
              <div className="font-bold text-slate-900">年份趋势</div>
              <div className="text-sm text-slate-500">{recentYear} 年 {recentCount} 篇新撤稿</div>
            </Link>
            <Link to="/reasons" className="bg-white border border-slate-200 rounded-lg p-5 hover:border-rose-300 hover:shadow-md transition-all">
              <div className="text-2xl mb-2">⚠️</div>
              <div className="font-bold text-slate-900">撤稿原因</div>
              <div className="text-sm text-slate-500">最常见: {topReason?.[0]}</div>
            </Link>
            <Link to="/publishers" className="bg-white border border-slate-200 rounded-lg p-5 hover:border-rose-300 hover:shadow-md transition-all">
              <div className="text-2xl mb-2">🏢</div>
              <div className="font-bold text-slate-900">出版商</div>
              <div className="text-sm text-slate-500">出版商撤稿记录</div>
            </Link>
          </div>
        </div>

        {/* Top Countries */}
        <div className="mb-10">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span>🔥</span> 热门国家
          </h2>
          <div className="space-y-2">
            {countryStats.slice(0, 5).map(([country, count], i) => (
              <Link
                key={country}
                to={`/country/${encodeURIComponent(country)}`}
                className="flex items-center gap-4 bg-white border border-slate-200 rounded-lg p-4 hover:border-rose-300 hover:shadow-sm transition-all"
              >
                <span className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-sm font-bold text-slate-500">
                  {i + 1}
                </span>
                <span className="flex-1 font-medium text-slate-900">{country}</span>
                <span className="text-rose-500 font-bold">{count.toLocaleString()}</span>
                <span className="text-slate-400">篇</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Top Journals */}
        <div className="mb-10">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span>📖</span> 热门期刊
          </h2>
          <div className="space-y-2">
            {journalStats.slice(0, 5).map(([journal, count], i) => (
              <Link
                key={journal}
                to={`/journal/${encodeURIComponent(journal)}`}
                className="flex items-center gap-4 bg-white border border-slate-200 rounded-lg p-4 hover:border-rose-300 hover:shadow-sm transition-all"
              >
                <span className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-sm font-bold text-slate-500">
                  {i + 1}
                </span>
                <span className="flex-1 font-medium text-slate-900 truncate">{journal}</span>
                <span className="text-rose-500 font-bold">{count.toLocaleString()}</span>
                <span className="text-slate-400">篇</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Top Publishers */}
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span>🏢</span> 主要出版商
          </h2>
          <div className="space-y-2">
            {publisherStats.slice(0, 5).map(([publisher, count], i) => (
              <div
                key={publisher}
                className="flex items-center gap-4 bg-white border border-slate-200 rounded-lg p-4"
              >
                <span className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-sm font-bold text-slate-500">
                  {i + 1}
                </span>
                <span className="flex-1 font-medium text-slate-900">{publisher}</span>
                <span className="text-rose-500 font-bold">{count.toLocaleString()}</span>
                <span className="text-slate-400">篇</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 mt-12">
        <div className="max-w-6xl mx-auto px-6 py-6 text-center text-sm text-slate-500">
          数据来源: Retraction Watch | 仅供研究和教育目的
        </div>
      </footer>
    </div>
  );
};
