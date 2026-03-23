import { useEffect, useMemo, useState, useCallback } from 'react';
import ReactECharts from 'echarts-for-react';
import { Link } from 'react-router-dom';
import { loadData } from '../data/loader';

import { useAppStore } from '../store';
import type { RetractionRecord } from '../data/parser';
import {
  AlertTriangle, TrendingUp, Search, Globe, Layers, ShieldAlert,
  Database, Newspaper, Building2, FileText, ChevronLeft, ChevronRight,
  ArrowUpDown, ArrowUp, ArrowDown, MapPin, RotateCcw,
} from 'lucide-react';

// ─── helpers ─────────────────────────────────────────────────────────────────

function useFilterOptions(data: RetractionRecord[]) {
  return useMemo(() => {
    const years = new Set<string>();
    const countries = new Set<string>();
    const subjects = new Set<string>();
    const natures = new Set<string>();
    const reasons = new Set<string>();

    data.forEach(r => {
      if (r.retractionDate) years.add(r.retractionDate.split('-')[0]);
      countries.add(r.country);
      r.subjects.forEach(s => { if (s) subjects.add(s); });
      if (r.retractionNature) natures.add(r.retractionNature);
      r.reasons.forEach(s => { if (s) reasons.add(s); });
    });

    return {
      years: ['全部', ...Array.from(years).sort().reverse()],
      countries: ['全部', ...Array.from(countries).sort()],
      subjects: ['全部', ...Array.from(subjects).sort()],
      natures: ['全部', ...Array.from(natures).sort()],
      reasons: ['全部', ...Array.from(reasons).sort()],
    };
  }, [data]);
}

function aggregate(data: RetractionRecord[], extractor: (r: RetractionRecord) => string | string[], limit = 10) {
  const counts: Record<string, number> = {};
  data.forEach(r => {
    const keys = extractor(r);
    (Array.isArray(keys) ? keys : [keys]).forEach(k => {
      if (k) counts[k] = (counts[k] || 0) + 1;
    });
  });
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

const COLORS = ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

// ─── Panel wrapper ────────────────────────────────────────────────────────────

const Panel: React.FC<{
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  className?: string;
}> = ({ title, icon: Icon, children, className = '' }) => (
  <div className={`bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col ${className}`}>
    <div className="flex items-center gap-2 mb-4">
      <div className="p-1.5 bg-slate-800 rounded-lg">
        <Icon className="w-4 h-4 text-rose-500" />
      </div>
      <h3 className="text-xs font-bold text-slate-100 uppercase tracking-tight">{title}</h3>
    </div>
    <div className="flex-1 min-h-0">{children}</div>
  </div>
);

// ─── Sort header ───────────────────────────────────────────────────────────────

const SortTh: React.FC<{
  label: string;
  sortKey: string;
  currentKey: string;
  currentDir: string;
  onSort: (k: string, d: 'asc' | 'desc') => void;
  className?: string;
}> = ({ label, sortKey, currentKey, currentDir, onSort, className = '' }) => (
  <th
    className={`px-4 py-3 cursor-pointer hover:bg-slate-800/50 transition-colors group ${className}`}
    onClick={() => onSort(sortKey, currentKey === sortKey && currentDir === 'asc' ? 'desc' : 'asc')}
  >
    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 uppercase font-black">
      {label}
      {currentKey === sortKey
        ? currentDir === 'asc' ? <ArrowUp className="w-3 h-3 text-rose-500" /> : <ArrowDown className="w-3 h-3 text-rose-500" />
        : <ArrowUpDown className="w-3 h-3 opacity-20 group-hover:opacity-80" />}
    </div>
  </th>
);

// ─── Tooltip ──────────────────────────────────────────────────────────────────

// ─── Main Dashboard ────────────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 10;

export const DashboardPage: React.FC = () => {
  const { allData, filteredData, loading, filters, setAllData, setLoading, setFilter, resetFilters } = useAppStore();
  const [localSearch, setLocalSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    loadData().then(data => {
      setAllData(data);
      setLoading(false);
    });
  }, []);

  const opts = useFilterOptions(allData);

  // Aggregations (always computed from filteredData)
  const trendData = useMemo(() =>
    aggregate(filteredData, r => r.retractionDate?.split('-')[0] || '')
      .sort((a, b) => a.name.localeCompare(b.name)),
    [filteredData]);

  const countryData = useMemo(() =>
    aggregate(filteredData, r => r.country).slice(0, 8),
    [filteredData]);

  const subjectData = useMemo(() =>
    aggregate(filteredData, r => r.subjects, 8),
    [filteredData]);

  const reasonData = useMemo(() =>
    aggregate(filteredData, r => r.reasons.map(s => s.split(';')).flat()).slice(0, 8),
    [filteredData]);

  const journalSource = useMemo(() =>
    aggregate(filteredData, r => r.journal, 5),
    [filteredData]);

  const institutionSource = useMemo(() =>
    aggregate(filteredData, r => r.institution, 5),
    [filteredData]);

  // Sorted + paginated table data
  const sortedData = useMemo(() => {
    const d = [...filteredData];
    if (filters.sortKey) {
      d.sort((a, b) => {
        const av = (a as any)[filters.sortKey] ?? '';
        const bv = (b as any)[filters.sortKey] ?? '';
        const cmp = String(av).localeCompare(String(bv));
        return filters.sortDir === 'asc' ? cmp : -cmp;
      });
    }
    return d;
  }, [filteredData, filters.sortKey, filters.sortDir]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(filters.page, totalPages);
  const pageData = sortedData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleSort = useCallback((key: string, dir: 'asc' | 'desc') => {
    useAppStore.getState().setSort(key as keyof RetractionRecord, dir);
  }, []);

  const handleSearch = () => {
    setFilter('search', localSearch);
  };

  const handleSearchKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 text-sm">加载 Retraction Watch 数据中...</p>
          <p className="text-slate-600 text-xs mt-1">{allData.length.toLocaleString()} 条记录</p>
        </div>
      </div>
    );
  }

  // ECharts options
  const trendOption = {
    tooltip: { trigger: 'axis' },
    grid: { left: 45, right: 10, top: 10, bottom: 30 },
    xAxis: { type: 'category', data: trendData.map(d => d.name), axisLine: { lineStyle: { color: '#1e293b' } }, axisLabel: { color: '#64748b', fontSize: 10 } },
    yAxis: { type: 'value', axisLine: { lineStyle: { color: '#1e293b' } }, axisLabel: { color: '#64748b', fontSize: 10 }, splitLine: { lineStyle: { color: '#1e293b', type: 'dashed' as const } } },
    series: [{
      data: trendData.map(d => d.count),
      type: 'line', smooth: true,
      lineStyle: { color: '#f43f5e', width: 2.5 },
      areaStyle: {
        color: { type: 'linear' as const, x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(244,63,94,0.3)' }, { offset: 1, color: 'rgba(244,63,94,0)' }] }
      },
      symbol: 'circle', symbolSize: 5, itemStyle: { color: '#f43f5e' },
    }],
  };

  const countryOption = {
    tooltip: { trigger: 'item' },
    grid: { left: 80, right: 20, top: 10, bottom: 10 },
    xAxis: { type: 'value', show: false },
    yAxis: { type: 'category', data: countryData.map(d => d.name).reverse(), axisLine: { lineStyle: { color: '#1e293b' } }, axisLabel: { color: '#94a3b8', fontSize: 10 } },
    series: [{
      data: countryData.map(d => d.count).reverse(),
      type: 'bar',
      barWidth: 10,
      itemStyle: { color: (params: any) => COLORS[params.dataIndex % COLORS.length], borderRadius: [0, 4, 4, 0] },
    }],
  };

  const subjectOption = {
    tooltip: { trigger: 'item' },
    radar: {
      indicator: subjectData.map(d => ({ name: d.name, max: Math.max(...subjectData.map(s => s.count)) })),
      shape: 'polygon', splitNumber: 4,
      axisName: { color: '#94a3b8', fontSize: 9 },
      splitLine: { lineStyle: { color: '#1e293b' } },
      splitArea: { areaStyle: { color: ['transparent'] } },
      axisLine: { lineStyle: { color: '#1e293b' } },
    },
    series: [{
      type: 'radar',
      data: [{ value: subjectData.map(d => d.count), name: '撤稿数', symbol: 'circle', symbolSize: 4,
        lineStyle: { color: '#3b82f6', width: 2 },
        areaStyle: { color: 'rgba(59,130,246,0.35)' },
        itemStyle: { color: '#3b82f6' },
      }],
    }],
  };

  const reasonOption = {
    tooltip: { trigger: 'item' },
    series: [{
      type: 'pie', radius: ['55%', '80%'], center: ['50%', '50%'],
      data: reasonData.map((d, i) => ({ name: d.name, value: d.count, itemStyle: { color: COLORS[i % COLORS.length] } })),
      label: { show: false },
    }],
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-sans">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur border-b border-slate-800">
        <div className="max-w-[1600px] mx-auto px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
              </div>
              <div>
                <h1 className="text-lg font-black text-white tracking-tight leading-none">学术诚信撤稿监测</h1>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono mt-0.5">Retraction Watch Intelligence</p>
              </div>
            </div>

            {/* Search */}
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                <input
                  className="bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500/40 transition-all placeholder:text-slate-600"
                  placeholder="搜索标题、作者、DOI..."
                  value={localSearch}
                  onChange={e => setLocalSearch(e.target.value)}
                  onKeyDown={handleSearchKey}
                />
              </div>
              <button onClick={handleSearch} className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-sm font-medium rounded-lg transition-colors">
                搜索
              </button>
            </div>

            {/* Nav links */}
            <nav className="hidden lg:flex items-center gap-5">
              {[
                ['国家', '/countries'], ['期刊', '/journals'], ['机构', '/institutions'],
                ['年份', '/years'], ['原因', '/reasons'], ['出版商', '/publishers'],
              ].map(([label, path]) => (
                <Link key={path} to={path} className="text-xs font-medium text-slate-400 hover:text-white transition-colors">
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto px-4 lg:px-8 py-6 space-y-6">
        {/* ── KPI Strip ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: '总撤稿数', value: filteredData.length.toLocaleString(), sub: `共 ${allData.length.toLocaleString()} 条记录`, color: 'text-rose-500' },
            { label: '涉及国家', value: [...new Set(filteredData.map(r => r.country))].length.toString(), sub: '全球分布', color: 'text-blue-400' },
            { label: '涉及期刊', value: [...new Set(filteredData.map(r => r.journal))].length.toLocaleString(), sub: '学术期刊', color: 'text-emerald-400' },
            { label: '涉及机构', value: [...new Set(filteredData.map(r => r.institution))].length.toLocaleString(), sub: '研究机构', color: 'text-amber-400' },
          ].map(({ label, value, sub, color }) => (
            <div key={label} className="bg-slate-900/60 border border-slate-800 rounded-xl px-5 py-4 flex items-start justify-between">
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{label}</div>
                <div className={`text-2xl font-black mt-1 ${color}`}>{value}</div>
                <div className="text-[10px] text-slate-600 mt-0.5">{sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Filter Bar ── */}
        <div className="bg-slate-900/40 border border-slate-800/60 rounded-xl p-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-500 uppercase font-bold ml-1">撤稿年份</label>
              <select
                value={filters.year}
                onChange={e => setFilter('year', e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/40"
              >
                {opts.years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-500 uppercase font-bold ml-1">撤稿类型</label>
              <select
                value={filters.nature}
                onChange={e => setFilter('nature', e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/40"
              >
                {opts.natures.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-500 uppercase font-bold ml-1">国家/地区</label>
              <select
                value={filters.country}
                onChange={e => setFilter('country', e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/40"
              >
                {opts.countries.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-500 uppercase font-bold ml-1">学科领域</label>
              <select
                value={filters.subject}
                onChange={e => setFilter('subject', e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/40"
              >
                {opts.subjects.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => { resetFilters(); setLocalSearch(''); }}
                className="w-full h-[38px] bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-lg transition-colors border border-slate-700 flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3 h-3" /> 重置条件
              </button>
            </div>
          </div>
        </div>

        {/* ── Charts Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Trend */}
          <Panel title="时间趋势 · 撤稿演变" icon={TrendingUp} className="md:col-span-8 h-[280px]">
            <ReactECharts option={trendOption} style={{ height: '100%' }} />
          </Panel>

          {/* Subject Radar */}
          <Panel title="学科分布 · 研究领域画像" icon={Layers} className="md:col-span-4 h-[280px]">
            <ReactECharts option={subjectOption} style={{ height: '100%' }} />
          </Panel>

          {/* Country Bar */}
          <Panel title="地域分布 · 受影响国家" icon={Globe} className="md:col-span-4 h-[260px]">
            <ReactECharts option={countryOption} style={{ height: '100%' }} />
          </Panel>

          {/* Reason breakdown */}
          <Panel title="撤稿原因 · 多重成因拆解" icon={ShieldAlert} className="md:col-span-4 h-[260px]">
            <div className="flex gap-4 h-full">
              <div className="w-1/2 flex items-center">
                <ReactECharts option={reasonOption} style={{ height: '100%' }} />
              </div>
              <div className="w-1/2 flex flex-col justify-center gap-2 overflow-y-auto max-h-full pr-1">
                {reasonData.slice(0, 6).map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-[10px] text-slate-400 truncate flex-1">{item.name}</span>
                    <span className="text-[10px] font-mono text-slate-500">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </Panel>

          {/* Sources */}
          <Panel title="高发来源 · 期刊 / 机构" icon={Database} className="md:col-span-4 h-[260px]">
            <div className="space-y-3 overflow-y-auto max-h-full pr-1">
              <div>
                <p className="text-[10px] text-slate-500 font-bold mb-1.5 uppercase flex items-center gap-1">
                  <Newspaper className="w-3 h-3" /> 重灾期刊 TOP 3
                </p>
                {journalSource.slice(0, 3).map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-1 border-b border-slate-800/30">
                    <span className="text-[11px] text-slate-300 truncate w-36">{item.name}</span>
                    <span className="text-[10px] px-1.5 bg-slate-800 rounded text-slate-400">{item.count} 篇</span>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-bold mb-1.5 uppercase flex items-center gap-1">
                  <Building2 className="w-3 h-3" /> 重灾机构 TOP 3
                </p>
                {institutionSource.slice(0, 3).map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-1 border-b border-slate-800/30">
                    <span className="text-[11px] text-slate-300 truncate w-36">{item.name}</span>
                    <span className="text-[10px] px-1.5 bg-slate-800 rounded text-slate-400">{item.count} 篇</span>
                  </div>
                ))}
              </div>
            </div>
          </Panel>
        </div>

        {/* ── Data Table ── */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
          <div className="px-6 py-4 bg-slate-800/20 border-b border-slate-800 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-rose-500" />
              <h2 className="text-sm font-bold text-white tracking-tight">明细数据记录</h2>
            </div>
            <div className="text-xs font-mono text-slate-500">
              SHOWING <span className="text-white">{(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, sortedData.length)}</span> OF <span className="text-white">{sortedData.length.toLocaleString()}</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-slate-950/50 text-slate-500 text-[10px] uppercase font-black border-b border-slate-800">
                <tr>
                  <SortTh label="论文标题" sortKey="title" currentKey={filters.sortKey} currentDir={filters.sortDir} onSort={handleSort} className="min-w-[260px]" />
                  <th className="px-4 py-3">DOI / 期刊</th>
                  <SortTh label="国家" sortKey="country" currentKey={filters.sortKey} currentDir={filters.sortDir} onSort={handleSort} className="min-w-[100px]" />
                  <SortTh label="撤稿日期" sortKey="retractionDate" currentKey={filters.sortKey} currentDir={filters.sortDir} onSort={handleSort} className="min-w-[110px]" />
                  <SortTh label="发表日期" sortKey="originalPaperDate" currentKey={filters.sortKey} currentDir={filters.sortDir} onSort={handleSort} className="min-w-[110px]" />
                  <th className="px-4 py-3">撤稿类型</th>
                  <th className="px-4 py-3 min-w-[200px]">核心原因</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {pageData.map((row) => (
                  <tr key={row.id} className="hover:bg-rose-500/[0.03] transition-all group">
                    <td className="px-4 py-3.5">
                      <div className="max-w-[260px]">
                        <div className="text-slate-100 font-medium text-xs leading-snug line-clamp-2 group-hover:text-rose-400 transition-colors">{row.title}</div>
                        <div className="text-[9px] text-slate-600 mt-1 font-mono uppercase">{row.authors.slice(0, 2).join('; ')}{row.authors.length > 2 ? '...' : ''}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-col gap-0.5">
                        <div className="text-[10px] text-slate-500 font-mono truncate max-w-[140px]">{row.journal}</div>
                        <div className="text-[9px] text-slate-600">{row.institution}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <MapPin className="w-3 h-3 text-slate-600" />
                        {row.country}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="text-rose-400 font-mono text-xs">{row.retractionDate}</div>
                      <div className="text-[9px] text-slate-600 mt-0.5">{row.retractionNature}</div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 font-mono text-xs">{row.originalPaperDate}</td>
                    <td className="px-4 py-3.5">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        row.retractionNature === 'Retraction' ? 'bg-rose-500/10 text-rose-400' :
                        row.retractionNature === 'Correction' ? 'bg-amber-500/10 text-amber-400' :
                        'bg-blue-500/10 text-blue-400'
                      }`}>
                        {row.retractionNature}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {row.reasons.slice(0, 3).map((r, i) => (
                          <span key={i} className="bg-slate-800/80 border border-slate-700/40 px-1.5 py-0.5 rounded text-[9px] text-slate-400 leading-tight">
                            {r.length > 30 ? r.slice(0, 30) + '…' : r}
                          </span>
                        ))}
                        {row.reasons.length > 3 && (
                          <span className="bg-slate-800/40 px-1.5 py-0.5 rounded text-[9px] text-slate-600">+{row.reasons.length - 3}</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 bg-slate-950/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => useAppStore.getState().setPage(currentPage - 1)}
                className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 disabled:opacity-20 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex gap-1.5">
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let page = i + 1;
                  if (totalPages > 7) {
                    if (currentPage > 4) page = currentPage - 3 + i;
                    if (currentPage > totalPages - 3) page = totalPages - 6 + i;
                  }
                  if (page < 1 || page > totalPages) return null;
                  return (
                    <button
                      key={page}
                      onClick={() => useAppStore.getState().setPage(page)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${currentPage === page ? 'bg-rose-500 text-white' : 'bg-slate-900 text-slate-500 hover:bg-slate-800'}`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>
              <button
                disabled={currentPage === totalPages}
                onClick={() => useAppStore.getState().setPage(currentPage + 1)}
                className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 disabled:opacity-20 transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xs text-slate-600">
              PAGE <span className="text-slate-300 font-bold">{currentPage}</span> OF {totalPages}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center py-6 text-xs text-slate-600 border-t border-slate-800/50">
          数据来源: Retraction Watch | 仅供研究和教育目的 |{' '}
          <Link to="/" className="text-rose-500 hover:text-rose-400">返回首页</Link>
        </footer>
      </div>
    </div>
  );
};
