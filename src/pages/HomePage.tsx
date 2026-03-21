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
      <div className="min-h-screen flex items-center justify-center bg-white">
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
  const totalPublishers = publisherStats.length;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">📊</span>
              <div>
                <div className="text-2xl font-bold tracking-tight">RetractionWatch</div>
                <div className="text-sm text-slate-400">学术撤稿智能监测平台</div>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <Link to="/" className="text-white font-medium">首页</Link>
              <Link to="/countries" className="text-slate-300 hover:text-white transition-colors">国家</Link>
              <Link to="/journals" className="text-slate-300 hover:text-white transition-colors">期刊</Link>
              <Link to="/institutions" className="text-slate-300 hover:text-white transition-colors">机构</Link>
              <Link to="/years" className="text-slate-300 hover:text-white transition-colors">年份</Link>
              <Link to="/reasons" className="text-slate-300 hover:text-white transition-colors">原因</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-slate-50 to-white py-20">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
            追踪学术撤稿<br />守护科研诚信
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            基于 Retraction Watch 数据的智能分析平台，揭示全球学术撤稿趋势，
            帮助研究机构和期刊出版社监测学术不端行为。
          </p>
          
          {/* Stats */}
          <div className="flex items-center justify-center gap-8 md:gap-12 flex-wrap mb-12">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-rose-500">{records.length.toLocaleString()}</div>
              <div className="text-sm text-slate-500 mt-1">撤稿记录</div>
            </div>
            <div className="w-px h-12 bg-slate-200 hidden md:block"></div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-rose-500">{totalCountries}</div>
              <div className="text-sm text-slate-500 mt-1">国家/地区</div>
            </div>
            <div className="w-px h-12 bg-slate-200 hidden md:block"></div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-rose-500">{totalJournals}</div>
              <div className="text-sm text-slate-500 mt-1">学术期刊</div>
            </div>
            <div className="w-px h-12 bg-slate-200 hidden md:block"></div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-rose-500">{totalPublishers}</div>
              <div className="text-sm text-slate-500 mt-1">出版商</div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link to="/countries" className="px-8 py-3 bg-rose-500 text-white font-medium rounded-full hover:bg-rose-600 transition-colors">
              开始探索
            </Link>
            <Link to="/reasons" className="px-8 py-3 bg-white text-slate-700 font-medium rounded-full border border-slate-200 hover:border-slate-300 transition-colors">
              了解撤稿原因
            </Link>
          </div>
        </div>
      </section>

      {/* Countries Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">🌍 国家/地区分布</h2>
              <p className="text-slate-500 mt-1">追踪全球各国家的撤稿情况</p>
            </div>
            <Link to="/countries" className="text-rose-500 hover:text-rose-600 font-medium">
              查看全部 →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {countryStats.slice(0, 6).map(([country, count], i) => (
              <Link
                key={country}
                to={`/country/${encodeURIComponent(country)}`}
                className="bg-white border border-slate-100 rounded-xl p-6 hover:shadow-lg hover:border-slate-200 transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl font-bold text-slate-400">{i + 1}</span>
                  <span className="text-2xl font-bold text-rose-500">{count.toLocaleString()}</span>
                </div>
                <div className="font-medium text-slate-900 group-hover:text-rose-500 transition-colors">{country}</div>
                <div className="text-sm text-slate-400 mt-1">篇撤稿</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Journals Section */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">📚 热门期刊</h2>
              <p className="text-slate-500 mt-1">撤稿数量最多的学术期刊</p>
            </div>
            <Link to="/journals" className="text-rose-500 hover:text-rose-600 font-medium">
              查看全部 →
            </Link>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            {journalStats.slice(0, 5).map(([journal, count], i) => (
              <Link
                key={journal}
                to={`/journal/${encodeURIComponent(journal)}`}
                className="flex items-center gap-4 p-4 border-b border-slate-50 last:border-b-0 hover:bg-slate-50 transition-colors"
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
      </section>

      {/* Year Trend Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">📅 年度趋势</h2>
              <p className="text-slate-500 mt-1">撤稿数量的历史演变</p>
            </div>
            <Link to="/years" className="text-rose-500 hover:text-rose-600 font-medium">
              查看全部 →
            </Link>
          </div>
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 text-white">
            <div className="flex items-end gap-2 h-48">
              {yearStats.slice(-12).map(({ year, count }) => {
                const maxCount = Math.max(...yearStats.slice(-12).map(y => y.count));
                return (
                  <div key={year} className="flex-1 flex flex-col items-center gap-2 group">
                    <div 
                      className="w-full bg-rose-500 rounded-t transition-all hover:bg-rose-400 cursor-pointer"
                      style={{ height: `${(count / maxCount) * 160}px` }}
                    />
                    <span className="text-xs text-slate-400">{year}</span>
                    <div className="absolute bg-white text-slate-900 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity -mt-8">
                      {count} 篇
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-700">
              <div>
                <div className="text-3xl font-bold">{recentYear} 年</div>
                <div className="text-slate-400 text-sm">最新数据年</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-rose-400">{recentCount} 篇</div>
                <div className="text-slate-400 text-sm">今年新撤稿</div>
              </div>
              <div>
                <div className="text-3xl font-bold">{yearStats.length} 年</div>
                <div className="text-slate-400 text-sm">覆盖时间</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reasons Section */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">⚠️ 撤稿原因分析</h2>
              <p className="text-slate-500 mt-1">导致学术撤稿的主要原因</p>
            </div>
            <Link to="/reasons" className="text-rose-500 hover:text-rose-600 font-medium">
              查看全部 →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {reasonStats.slice(0, 4).map(([reason, count]) => (
              <div key={reason} className="bg-white rounded-xl border border-slate-100 p-6">
                <div className="text-3xl font-bold text-rose-500 mb-2">{count.toLocaleString()}</div>
                <div className="text-sm text-slate-600 line-clamp-2">{reason}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Publishers Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">🏢 主要出版商</h2>
              <p className="text-slate-500 mt-1">学术出版巨头的撤稿记录</p>
            </div>
            <Link to="/publishers" className="text-rose-500 hover:text-rose-600 font-medium">
              查看全部 →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {publisherStats.slice(0, 4).map(([publisher, count], i) => (
              <div key={publisher} className="bg-white border border-slate-100 rounded-xl p-6 flex items-center gap-4">
                <span className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-xl font-bold text-slate-400">
                  {i + 1}
                </span>
                <div className="flex-1">
                  <div className="font-bold text-slate-900">{publisher}</div>
                  <div className="text-sm text-slate-400">{count.toLocaleString()} 篇撤稿</div>
                </div>
                <div className="text-2xl font-bold text-rose-500">{Math.round((count / records.length) * 100)}%</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">开始使用 RetractionWatch</h2>
          <p className="text-slate-400 mb-8 max-w-xl mx-auto">
            深入了解全球学术撤稿趋势，守护科研诚信
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link to="/countries" className="px-8 py-3 bg-rose-500 text-white font-medium rounded-full hover:bg-rose-600 transition-colors">
              探索国家数据
            </Link>
            <Link to="/journals" className="px-8 py-3 bg-transparent text-white font-medium rounded-full border border-slate-600 hover:border-white transition-colors">
              浏览期刊排名
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">📊</span>
              <span className="font-bold text-white">RetractionWatch</span>
            </div>
            <div className="text-sm">
              数据来源: Retraction Watch | 仅供研究和教育目的
            </div>
            <div className="text-sm">
              © 2026 RetractionWatch. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
