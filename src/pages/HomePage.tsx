import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MOCK_DATA, getReasonStats, getYearStats } from '../data/mockData';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: string;
  color: string;
  path: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon, color, path }) => (
  <Link 
    to={path}
    className="bg-white rounded-xl border border-slate-200 p-5 card-hover cursor-pointer block"
  >
    <div className="flex items-start justify-between mb-3">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${color}`}>
        {icon}
      </div>
      <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </div>
    <div className="text-2xl font-bold text-slate-800 mb-1">{value}</div>
    <div className="text-sm font-medium text-slate-700 mb-1">{title}</div>
    <div className="text-xs text-slate-500">{subtitle}</div>
  </Link>
);

export const HomePage: React.FC = () => {
  const stats = useMemo(() => {
    const total = MOCK_DATA.length;
    const fraudCount = MOCK_DATA.filter(d => d.reason === 'Fraud').length;
    const journals = [...new Set(MOCK_DATA.map(d => d.journal))].length;
    const institutions = [...new Set(MOCK_DATA.map(d => d.institution))].length;
    const countries = [...new Set(MOCK_DATA.map(d => d.country))].length;
    const fields = [...new Set(MOCK_DATA.map(d => d.field))].length;
    
    const yearStats = getYearStats(MOCK_DATA);
    const latestYear = Math.max(...Object.keys(yearStats).map(Number));
    const latestYearCount = yearStats[latestYear] || 0;

    return { total, fraudCount, journals, institutions, countries, fields, latestYear, latestYearCount };
  }, []);

  const countryStats = useMemo(() => {
    const map: Record<string, number> = {};
    MOCK_DATA.forEach(d => {
      map[d.country] = (map[d.country] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, []);

  const journalStats = useMemo(() => {
    const map: Record<string, { count: number; fraud: number }> = {};
    MOCK_DATA.forEach(d => {
      if (!map[d.journal]) map[d.journal] = { count: 0, fraud: 0 };
      map[d.journal].count++;
      if (d.reason === 'Fraud') map[d.journal].fraud++;
    });
    return Object.entries(map).sort((a, b) => b[1].count - a[1].count).slice(0, 5);
  }, []);

  const reasonStats = useMemo(() => getReasonStats(MOCK_DATA), []);

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl p-8 mb-8 text-white">
          <h1 className="text-2xl font-bold mb-2">学术撤稿智能监测平台</h1>
          <p className="text-teal-100 text-sm mb-4">实时追踪全球学术撤稿动态，揭示科研诚信问题</p>
          <div className="flex gap-8 text-sm">
            <div>
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-teal-100">总撤稿数</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.journals}</div>
              <div className="text-teal-100">涉及期刊</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.institutions}</div>
              <div className="text-teal-100">研究机构</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.countries}</div>
              <div className="text-teal-100">国家/地区</div>
            </div>
          </div>
        </div>

        {/* Module Cards */}
        <h2 className="text-lg font-bold text-slate-800 mb-4">数据模块</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          <StatCard
            title="国家/地区"
            value={stats.countries}
            subtitle="全球撤稿分布"
            icon="🌍"
            color="bg-blue-50"
            path="/countries"
          />
          <StatCard
            title="期刊"
            value={stats.journals}
            subtitle="期刊撤稿排行"
            icon="📚"
            color="bg-purple-50"
            path="/journals"
          />
          <StatCard
            title="研究机构"
            value={stats.institutions}
            subtitle="机构撤稿统计"
            icon="🏛"
            color="bg-amber-50"
            path="/institutions"
          />
          <StatCard
            title="年份"
            value={stats.latestYear}
            subtitle={`${stats.latestYearCount}篇今年新撤稿`}
            icon="📅"
            color="bg-green-50"
            path="/years"
          />
          <StatCard
            title="学科领域"
            value={stats.fields}
            subtitle="跨学科分析"
            icon="🔬"
            color="bg-rose-50"
            path="/fields"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Country Distribution */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800">国家/地区分布</h3>
              <Link to="/countries" className="text-sm text-teal-600 hover:text-teal-700">查看全部 →</Link>
            </div>
            <div className="space-y-3">
              {countryStats.map(([country, count], i) => (
                <div key={country} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-slate-500 w-6">{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-slate-700">{country}</span>
                      <span className="text-sm font-bold text-slate-800">{count}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-teal-400 to-teal-500 rounded-full"
                        style={{ width: `${(count / stats.total) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Journal Distribution */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800">期刊撤稿排行</h3>
              <Link to="/journals" className="text-sm text-teal-600 hover:text-teal-700">查看全部 →</Link>
            </div>
            <div className="space-y-3">
              {journalStats.map(([journal, { count, fraud }], i) => (
                <div key={journal} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-slate-500 w-6">{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-slate-700">{journal}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                          {((fraud / count) * 100).toFixed(0)}%欺诈
                        </span>
                        <span className="text-sm font-bold text-slate-800">{count}</span>
                      </div>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-400 to-purple-500 rounded-full"
                        style={{ width: `${(count / stats.total) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reason Stats */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800">撤稿原因分布</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(reasonStats).map(([reason, count]) => (
              <div key={reason} className="bg-slate-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-slate-800 mb-1">{count}</div>
                <div className="text-sm text-slate-600">{reason}</div>
                <div className="text-xs text-slate-400 mt-1">{((count / stats.total) * 100).toFixed(1)}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
