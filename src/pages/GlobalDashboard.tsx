import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle, Globe, BookOpen, ShieldAlert, TrendingUp, Layers
} from 'lucide-react';
import { fetchPrecomputed, fetchCSV } from '../lib/data';
import type { PrecomputedData, RetractionRecord, FilterState } from '../lib/types';
import Header from '../components/Header';
import KpiCard from '../components/KpiCard';
import FilterBar from '../components/FilterBar';
import ChartPanel from '../components/charts/ChartPanel';
import TrendChart from '../components/charts/TrendChart';
import CountryChart from '../components/charts/CountryChart';
import SubjectRadarChart from '../components/charts/SubjectRadarChart';
import ReasonBarChart from '../components/charts/ReasonBarChart';
import JournalChart from '../components/charts/JournalChart';
import RetractionTable from '../components/RetractionTable';

export default function GlobalDashboard() {
  const [precomputed, setPrecomputed] = useState<PrecomputedData | null>(null);
  const [tableData, setTableData] = useState<RetractionRecord[]>([]);
  const [tableLoading, setTableLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    year: '全部', nature: '全部', country: '全部', subject: '全部', search: ''
  });
  const [sortConfig, setSortConfig] = useState({ key: 'RetractionDate', dir: 'desc' as 'asc' | 'desc' });
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchPrecomputed().then(setPrecomputed).catch(console.error);
    fetchCSV().then(data => { setTableData(data); setTableLoading(false); }).catch(() => setTableLoading(false));
  }, []);

  const filterOptions = useMemo(() => ({
    years: ['全部', ...(precomputed?.years.map(([y]) => y) ?? [])],
    countries: ['全部', ...(precomputed?.countries.map(([c]) => c) ?? [])],
    subjects: ['全部', ...(precomputed?.subjects.map(([s]) => s) ?? [])],
    natures: ['全部', ...(precomputed?.natures.map(([n]) => n) ?? [])],
  }), [precomputed]);

  const handleSearchSubmit = () => {
    setFilters(f => ({ ...f, search: searchQuery }));
  };

  const handleSort = (key: string) => {
    setSortConfig(prev => ({ key, dir: prev.key === key && prev.dir === 'desc' ? 'asc' : 'desc' }));
  };

  if (!precomputed) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-5">
            <div className="absolute inset-0 border-2 border-rose-500/20 rounded-full" />
            <div className="absolute inset-0 border-2 border-transparent border-t-rose-500 rounded-full animate-spin" />
          </div>
          <p className="text-slate-400 text-sm font-medium">加载 Retraction Watch 数据中</p>
          <p className="text-slate-600 text-xs mt-1.5 font-mono">69,000+ 条记录</p>
        </div>
      </div>
    );
  }

  const kpiRetraction = precomputed.natures.find(([n]) => n === 'Retraction')?.[1] ?? 0;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 p-5 lg:p-8">
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={handleSearchSubmit}
      />

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
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

      {/* ── Filter Bar ── */}
      <FilterBar filters={filters} onChange={setFilters} options={filterOptions} />

      {/* ── Charts Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mb-8">
        {/* Trend */}
        <ChartPanel
          title="时间趋势"
          icon={<TrendingUp className="w-3.5 h-3.5 text-rose-400" />}
          className="md:col-span-8 h-[300px]"
        >
          <TrendChart data={precomputed} />
        </ChartPanel>

        {/* Radar */}
        <ChartPanel
          title="学科分布"
          icon={<Layers className="w-3.5 h-3.5 text-blue-400" />}
          className="md:col-span-4 h-[300px]"
        >
          <SubjectRadarChart subjects={precomputed.subjects} />
        </ChartPanel>

        {/* Country */}
        <ChartPanel
          title="国家分布 TOP 8"
          icon={<Globe className="w-3.5 h-3.5 text-rose-400" />}
          className="md:col-span-4 h-[280px]"
          action={
            <span className="text-[9px] text-slate-600 font-mono">点击进入国家详情 →</span>
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
        >
          <ReasonBarChart reasons={precomputed.reasons} total={precomputed.total} />
        </ChartPanel>

        {/* Sources */}
        <ChartPanel
          title="高频来源"
          icon={<BookOpen className="w-3.5 h-3.5 text-emerald-400" />}
          className="md:col-span-4 h-[280px]"
        >
          <div className="space-y-5 overflow-y-auto max-h-full pr-1">
            <JournalChart title="重灾期刊 TOP 5" icon="journal" items={precomputed.journals} />
            <JournalChart title="重灾机构 TOP 5" icon="institution" items={precomputed.institutions} />
          </div>
        </ChartPanel>
      </div>

      {/* ── Data Table ── */}
      <RetractionTable
        data={tableData}
        loading={tableLoading}
        filters={filters}
        sortConfig={sortConfig}
        onSort={handleSort}
      />

      <footer className="text-center py-8 text-xs text-slate-700 mt-8 border-t border-white/[0.03]">
        数据来源：Retraction Watch（Crossref 开放数据）· 仅供研究与教育目的
      </footer>
    </div>
  );
}
