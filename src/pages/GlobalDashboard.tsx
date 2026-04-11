import { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  AlertTriangle, Globe, BookOpen, ShieldAlert, TrendingUp, Layers
} from 'lucide-react';
import { fetchPrecomputed, fetchCSV } from '../lib/data';
import type { PrecomputedData, RetractionRecord, FilterState } from '../lib/types';
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

// Skeleton loader for initial data load
function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 p-5 lg:p-8 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-slate-800 rounded-2xl" />
        <div className="space-y-2">
          <div className="h-7 w-48 bg-slate-800 rounded" />
          <div className="h-4 w-64 bg-slate-800 rounded" />
        </div>
      </div>

      {/* KPI Cards skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-slate-800/50 rounded-xl border border-white/5" />
        ))}
      </div>

      {/* Filter bar skeleton */}
      <div className="h-12 bg-slate-800/50 rounded-xl mb-8" />

      {/* Charts skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mb-8">
        <div className="md:col-span-8 h-[300px] bg-slate-800/50 rounded-xl border border-white/5" />
        <div className="md:col-span-4 h-[300px] bg-slate-800/50 rounded-xl border border-white/5" />
        <div className="md:col-span-4 h-[280px] bg-slate-800/50 rounded-xl border border-white/5" />
        <div className="md:col-span-4 h-[280px] bg-slate-800/50 rounded-xl border border-white/5" />
        <div className="md:col-span-4 h-[280px] bg-slate-800/50 rounded-xl border border-white/5" />
      </div>

      {/* Table skeleton */}
      <div className="h-96 bg-slate-800/50 rounded-xl border border-white/5" />
    </div>
  );
}

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

  const filterOptions = useMemo(() => ({
    years: ['全部', ...(precomputed?.years.map(([y]) => y) ?? [])],
    countries: ['全部', ...(precomputed?.countries.map(([c]) => c) ?? [])],
    subjects: ['全部', ...(precomputed?.subjects.map(([s]) => s) ?? [])],
    natures: ['全部', ...(precomputed?.natures.map(([n]) => n) ?? [])],
  }), [precomputed]);

  const handleSearchSubmit = () => {
    handleSetFilters(f => ({ ...f, search: searchQuery }));
  };

  const handleSort = (key: string) => {
    setSortConfig(prev => ({ key, dir: prev.key === key && prev.dir === 'desc' ? 'asc' : 'desc' }));
  };

  if (!precomputed) {
    return <DashboardSkeleton />;
  }

  const kpiRetraction = precomputed.natures.find(([n]) => n === 'Retraction')?.[1] ?? 0;

  return (
    <main
      id="main-content"
      className="min-h-screen bg-[#020617] text-slate-300 p-5 lg:p-8 ambient-bg"
      role="main"
    >
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={handleSearchSubmit}
      />

      {/* ── Export Bar ── */}
      <div className="flex justify-end mb-6">
        <ExportBar records={tableData} filters={filters} />
      </div>

      {/* ── KPI Cards ── */}
      <section aria-label="关键指标">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 stagger-children">
          <KpiCard
            label="总撤稿数"
            value={precomputed.total}
            sub="Retraction Watch 官方数据"
            icon={<AlertTriangle className="w-5 h-5 text-rose-400" />}
            accentColor="#f43f5e"
          />
          <KpiCard
            label="正式撤稿"
            value={kpiRetraction}
            sub="Retraction 类型"
            icon={<ShieldAlert className="w-5 h-5 text-rose-400" />}
            accentColor="#fb7185"
          />
          <KpiCard
            label="涉及国家"
            value={precomputed.uniqueCountries}
            sub="全球分布"
            icon={<Globe className="w-5 h-5 text-blue-400" />}
            accentColor="#60a5fa"
          />
          <KpiCard
            label="涉及期刊"
            value={precomputed.uniqueJournals}
            sub="学术期刊"
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
      <section aria-label="数据可视化图表" className="mb-8 stagger-children">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Trend */}
          <ChartPanel
            title="时间趋势"
            icon={<TrendingUp className="w-3.5 h-3.5 text-rose-400" />}
            className="md:col-span-8 h-[300px]"
            glow="rose"
          >
            <TrendChart data={precomputed} />
          </ChartPanel>

          {/* Radar */}
          <ChartPanel
            title="学科分布"
            icon={<Layers className="w-3.5 h-3.5 text-blue-400" />}
            className="md:col-span-4 h-[300px]"
            glow="blue"
          >
            <SubjectRadarChart subjects={precomputed.subjects} />
          </ChartPanel>

          {/* Country */}
          <ChartPanel
            title="国家分布 TOP 8"
            icon={<Globe className="w-3.5 h-3.5 text-rose-400" />}
            className="md:col-span-4 h-[280px]"
            glow="rose"
            action={
              <span className="text-xs text-slate-500 font-mono">点击进入国家详情 →</span>
            }
          >
            <CountryChart
              data={precomputed}
              onCountryClick={(c) => navigate(`#/country/${encodeURIComponent(c)}`)}
            />
          </ChartPanel>

          {/* Reason */}
          <ChartPanel
            title="撤稿原因分析"
            icon={<ShieldAlert className="w-3.5 h-3.5 text-rose-400" />}
            className="md:col-span-4 h-[280px]"
            glow="purple"
          >
            <ReasonBarChart reasons={precomputed.reasons} total={precomputed.total} />
          </ChartPanel>

          {/* Sources */}
          <ChartPanel
            title="高频来源"
            icon={<BookOpen className="w-3.5 h-3.5 text-emerald-400" />}
            className="md:col-span-4 h-[280px]"
            glow="emerald"
          >
            <div className="space-y-5 overflow-y-auto max-h-full pr-1">
              <JournalChart title="重灾期刊 TOP 5" icon="journal" items={precomputed.journals} />
              <JournalChart title="重灾机构 TOP 5" icon="institution" items={precomputed.institutions} />
            </div>
          </ChartPanel>
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
