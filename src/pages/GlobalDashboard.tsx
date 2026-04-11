import { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  AlertTriangle, Globe, BookOpen, ShieldAlert, TrendingUp, Layers,
  X, Info
} from 'lucide-react';
import { fetchPrecomputed, fetchCSV } from '../lib/data';
import type { PrecomputedData, RetractionRecord, FilterState } from '../lib/types';
import { computeStats, applyFilters } from '../lib/aggregations';
import Header from '../components/Header';
import KpiCard from '../components/KpiCard';
import FilterBar from '../components/FilterBar';
import ExportBar from '../components/ExportBar';
import ChartPanel from '../components/charts/ChartPanel';
import TrendChart from '../components/charts/TrendChart';
import CountryChart from '../components/charts/CountryChart';
import SubjectRadarChart from '../components/charts/SubjectRadarChart';
import ReasonBarChart from '../components/charts/ReasonBarChart';
import JournalChart from '../components/charts/JournalChart';
import RetractionTable from '../components/RetractionTable';

// ── Skeleton ──────────────────────────────────────────────
function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 p-5 lg:p-8 animate-pulse">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-slate-800 rounded-2xl" />
        <div className="space-y-2"><div className="h-7 w-56 bg-slate-800 rounded" /><div className="h-4 w-72 bg-slate-800 rounded" /></div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-slate-800/50 rounded-2xl border border-white/5" />)}
      </div>
      <div className="h-14 bg-slate-800/50 rounded-2xl mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mb-8">
        {[...Array(5)].map((_, i) => <div key={i} className="bg-slate-800/50 rounded-2xl border border-white/5" style={{height:i===0?300:i===1?300:i===2?280:i===3?280:280, gridColumn:i===0?'span 8':i===1?'span 4':'span 4'}} />)}
      </div>
      <div className="h-96 bg-slate-800/50 rounded-2xl border border-white/5" />
    </div>
  );
}

// ── Active filter pill ──────────────────────────────────────
function ActiveFilterPills({ filters, onRemove }: { filters: FilterState; onRemove: (key: keyof FilterState) => void }) {
  const pills: { key: keyof FilterState; label: string; value: string }[] = [];
  if (filters.year !== '全部') pills.push({ key: 'year', label: '年份', value: filters.year });
  if (filters.nature !== '全部') pills.push({ key: 'nature', label: '类型', value: filters.nature });
  if (filters.country !== '全部') pills.push({ key: 'country', label: '国家', value: filters.country });
  if (filters.subject !== '全部') pills.push({ key: 'subject', label: '学科', value: filters.subject });
  if (filters.search) pills.push({ key: 'search', label: '关键词', value: filters.search });

  if (pills.length === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap mb-4">
      <div className="flex items-center gap-1.5 text-xs text-slate-500 mr-1">
        <Info className="w-3.5 h-3.5" />
        <span>当前筛选影响所有图表：</span>
      </div>
      {pills.map(p => (
        <button
          key={p.key}
          onClick={() => onRemove(p.key)}
          className="flex items-center gap-1.5 pl-3 pr-2 py-1 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs rounded-full transition-all group"
        >
          <span className="text-rose-500/70">{p.label}:</span>
          <span className="font-semibold">{p.value}</span>
          <X className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity" />
        </button>
      ))}
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────
export default function GlobalDashboard() {
  const [precomputed, setPrecomputed] = useState<PrecomputedData | null>(null);
  const [tableData, setTableData] = useState<RetractionRecord[]>([]);
  const [tableLoading, setTableLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<FilterState>({
    year: searchParams.get('year') || '全部',
    nature: searchParams.get('nature') || '全部',
    country: searchParams.get('country') || '全部',
    subject: searchParams.get('subject') || '全部',
    search: searchParams.get('q') || '',
  });
  const [sortConfig, setSortConfig] = useState({ key: 'RetractionDate', dir: 'desc' as 'asc' | 'desc' });
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const navigate = useNavigate();

  useEffect(() => {
    fetchPrecomputed().then(setPrecomputed).catch(console.error);
    fetchCSV().then(data => { setTableData(data); setTableLoading(false); }).catch(() => setTableLoading(false));
  }, []);

  // Sync filters to URL
  const handleSetFilters = useCallback((updater: FilterState | ((prev: FilterState) => FilterState)) => {
    setFilters(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      const params = new URLSearchParams();
      if (next.year !== '全部') params.set('year', next.year);
      if (next.nature !== '全部') params.set('nature', next.nature);
      if (next.country !== '全部') params.set('country', next.country);
      if (next.subject !== '全部') params.set('subject', next.subject);
      if (next.search) params.set('q', next.search);
      setSearchParams(params, { replace: true });
      return next;
    });
  }, [setSearchParams]);

  const handleRemoveFilter = (key: keyof FilterState) => {
    handleSetFilters(prev => ({ ...prev, [key]: key === 'search' ? '' : '全部', ...(key === 'search' ? {} : {}) }));
  };

  const handleSearchSubmit = () => handleSetFilters(f => ({ ...f, search: searchQuery }));

  const handleSort = (key: string) => {
    setSortConfig(prev => ({ key, dir: prev.key === key && prev.dir === 'desc' ? 'asc' : 'desc' }));
  };

  // ── Filtered stats (key: charts NOW respond to filters) ──
  const filteredStats = useMemo(() => {
    if (!tableData.length) return null;
    const filtered = applyFilters(tableData, filters);
    return computeStats(filtered);
  }, [tableData, filters]);

  // Precomputed fallback for filter options while data loads
  const filterOptions = useMemo(() => ({
    years: ['全部', ...(precomputed?.years.map(([y]) => y) ?? [])],
    countries: ['全部', ...(precomputed?.countries.map(([c]) => c) ?? [])],
    subjects: ['全部', ...(precomputed?.subjects.map(([s]) => s) ?? [])],
    natures: ['全部', ...(precomputed?.natures.map(([n]) => n) ?? [])],
  }), [precomputed]);

  const hasActiveFilter = filters.year !== '全部' || filters.nature !== '全部' ||
    filters.country !== '全部' || filters.subject !== '全部' || filters.search !== '';

  if (!precomputed) return <DashboardSkeleton />;

  // Use filtered stats if available, else precomputed
  const stats = filteredStats ?? precomputed;

  const kpiRetraction = stats.natures.find(([n]) => n === 'Retraction')?.[1] ?? 0;
  const topReason = stats.reasons[0];
  const topCountry = stats.countries[0];

  return (
    <main id="main-content" className="min-h-screen bg-[#020617] text-slate-300 p-5 lg:p-8 ambient-bg" role="main">

      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} onSearchSubmit={handleSearchSubmit} />

      {/* ── Export Bar ── */}
      <div className="flex justify-end mb-5">
        <ExportBar records={tableData} filters={filters} />
      </div>

      {/* ── Active filter pills ── */}
      <ActiveFilterPills filters={filters} onRemove={handleRemoveFilter} />

      {/* ── KPI Cards ── */}
      <section aria-label="关键指标">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 stagger-children">
          <KpiCard
            label="筛选结果数"
            value={stats.total}
            sub={hasActiveFilter ? '已应用筛选条件' : 'Retraction Watch 全量数据'}
            icon={<AlertTriangle className="w-5 h-5 text-rose-400" />}
            accentColor="#f43f5e"
          />
          <KpiCard
            label="正式撤稿"
            value={kpiRetraction}
            sub={`占总撤稿 ${stats.total > 0 ? ((kpiRetraction / stats.total) * 100).toFixed(1) : 0}%`}
            icon={<ShieldAlert className="w-5 h-5 text-rose-400" />}
            accentColor="#fb7185"
          />
          <KpiCard
            label="涉及国家"
            value={stats.uniqueCountries}
            sub={topCountry ? `第1: ${topCountry[0]}` : ''}
            icon={<Globe className="w-5 h-5 text-blue-400" />}
            accentColor="#60a5fa"
          />
          <KpiCard
            label="涉及期刊"
            value={stats.uniqueJournals}
            sub={topReason ? `头号原因: ${topReason[0].slice(0, 20)}…` : ''}
            icon={<BookOpen className="w-5 h-5 text-emerald-400" />}
            accentColor="#34d399"
          />
        </div>
      </section>

      {/* ── Filter Bar ── */}
      <section aria-label="数据筛选">
        <FilterBar filters={filters} onChange={handleSetFilters} options={filterOptions} />
      </section>

      {/* ── Charts Grid ── */}
      <section aria-label="数据可视化图表" className="mb-6 stagger-children">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">

          {/* Trend — spans full width on large screens */}
          <div className="md:col-span-12 xl:col-span-8">
            <ChartPanel
              title="时间趋势"
              icon={<TrendingUp className="w-3.5 h-3.5 text-rose-400" />}
              className="h-[300px]"
              glow="rose"
            >
              <TrendChart data={stats} />
            </ChartPanel>
          </div>

          {/* Radar */}
          <div className="md:col-span-12 xl:col-span-4">
            <ChartPanel
              title="学科分布"
              icon={<Layers className="w-3.5 h-3.5 text-blue-400" />}
              className="h-[300px]"
              glow="blue"
            >
              <SubjectRadarChart subjects={stats.subjects} />
            </ChartPanel>
          </div>

          {/* Country */}
          <div className="md:col-span-6 xl:col-span-4">
            <ChartPanel
              title="国家分布 TOP 8"
              icon={<Globe className="w-3.5 h-3.5 text-rose-400" />}
              className="h-[300px]"
              glow="rose"
              action={<span className="text-xs text-slate-500 font-mono">点击进入国家详情 →</span>}
            >
              <CountryChart
                data={stats}
                onCountryClick={(c) => navigate(`#/country/${encodeURIComponent(c)}`)}
              />
            </ChartPanel>
          </div>

          {/* Reason */}
          <div className="md:col-span-6 xl:col-span-4">
            <ChartPanel
              title="撤稿原因分析"
              icon={<ShieldAlert className="w-3.5 h-3.5 text-purple-400" />}
              className="h-[300px]"
              glow="purple"
            >
              <ReasonBarChart reasons={stats.reasons} total={stats.total} />
            </ChartPanel>
          </div>

          {/* Sources */}
          <div className="md:col-span-12 xl:col-span-4">
            <ChartPanel
              title="高频来源"
              icon={<BookOpen className="w-3.5 h-3.5 text-emerald-400" />}
              className="h-[300px]"
              glow="emerald"
            >
              <div className="flex flex-col gap-5 overflow-y-auto max-h-full pr-1">
                <JournalChart title="重灾期刊 TOP 5" icon="journal" items={stats.journals} />
                <JournalChart title="重灾机构 TOP 5" icon="institution" items={stats.institutions} />
              </div>
            </ChartPanel>
          </div>

        </div>
      </section>

      {/* ── Data Table ── */}
      <section aria-label="撤稿明细记录">
        <RetractionTable
          data={tableData}
          loading={tableLoading}
          filters={filters}
          sortConfig={sortConfig}
          onSort={handleSort}
        />
      </section>

      <footer className="text-center py-8 text-xs text-slate-600 mt-8 border-t border-white/[0.03]" role="contentinfo">
        数据来源：Retraction Watch（Crossref 开放数据）· 仅供研究与教育目的
      </footer>
    </main>
  );
}
