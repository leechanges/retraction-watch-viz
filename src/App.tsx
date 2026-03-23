import React, { useState, useMemo, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, Cell
} from 'recharts';
import {
  AlertTriangle, TrendingUp, Search, Globe, Layers, ShieldAlert,
  Database, Newspaper, Building2, FileText, ChevronLeft, ChevronRight,
  ArrowUpDown, MapPin, Link
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface RetractionRecord {
  'Record ID': number;
  DOI: string;
  Title: string;
  Subject: string;
  Institution: string;
  Journal: string;
  Publisher: string;
  Country: string;
  Author: string;
  ArticleType: string;
  RetractionDate: string;
  OriginalPaperDate: string;
  RetractionNature: string;
  Reason: string;
  Paywalled: string;
}

// ─── CSV Parser ───────────────────────────────────────────────────────────────

function parseDate(dateStr: string): string {
  if (!dateStr || dateStr === '0:00') return '';
  const parts = dateStr.split(' ')[0].split('/');
  if (parts.length === 3) {
    const [month, day, year] = parts;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  return dateStr;
}

function parseCSV(text: string): RetractionRecord[] {
  const lines = text.split('\n').filter(l => l.trim());
  if (lines.length < 2) return [];
  const records: RetractionRecord[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    const values: string[] = [];
    let inQuotes = false;
    let fieldStart = 0;
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') { inQuotes = !inQuotes; }
      else if (char === ',' && !inQuotes) {
        values.push(line.slice(fieldStart, j).trim().replace(/^"|"$/g, ''));
        fieldStart = j + 1;
      }
    }
    values.push(line.slice(fieldStart).trim().replace(/^"|"$/g, ''));

    const get = (idx: number) => values[idx] || '';
    const id = parseInt(get(0));
    if (!id) continue;

    records.push({
      'Record ID': id,
      DOI: get(1),
      Title: get(2),
      Subject: get(3),
      Institution: get(4),
      Journal: get(5),
      Publisher: get(6),
      Country: get(7),
      Author: get(8),
      ArticleType: get(10),
      RetractionDate: parseDate(get(11)),
      OriginalPaperDate: parseDate(get(13)),
      RetractionNature: get(16),
      Reason: get(17),
      Paywalled: get(18),
    });
  }
  return records;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const COLORS = ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function aggregate(data: RetractionRecord[], extractor: (r: RetractionRecord) => string | string[], limit = 10) {
  const counts: Record<string, number> = {};
  data.forEach(r => {
    const keys = extractor(r);
    (Array.isArray(keys) ? keys : [keys]).forEach(k => { if (k) counts[k] = (counts[k] || 0) + 1; });
  });
  return Object.entries(counts).map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count).slice(0, limit);
}

// ─── Components ───────────────────────────────────────────────────────────────

const Panel: React.FC<{ title: string; icon: React.ElementType; children: React.ReactNode; className?: string }> =
  ({ title, icon: Icon, children, className = '' }) => (
    <div className={`bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 bg-slate-800 rounded-lg">
          <Icon className="w-4 h-4 text-rose-500" />
        </div>
        <h3 className="text-sm font-bold text-slate-100 uppercase tracking-tight">{title}</h3>
      </div>
      <div className="flex-1 min-h-0">{children}</div>
    </div>
  );

const SortHeader: React.FC<{
  label: string; sortKey: string;
  sortConfig: { key: string; dir: 'asc' | 'desc' };
  onSort: (k: string) => void; className?: string;
}> = ({ label, sortKey, sortConfig, onSort, className = '' }) => (
  <th className={`px-4 py-3 cursor-pointer hover:bg-slate-800 transition-colors group ${className}`}
    onClick={() => onSort(sortKey)}>
    <div className="flex items-center gap-2 text-[10px] text-slate-500 uppercase font-black">
      {label}
      <ArrowUpDown className={`w-3 h-3 ${sortConfig.key === sortKey ? 'text-rose-500' : 'opacity-20 group-hover:opacity-100'}`} />
    </div>
  </th>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) return (
    <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl text-xs z-50">
      <p className="text-slate-200 font-bold mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
          <span className="text-slate-400">数量: <span className="text-white font-semibold">{entry.value}</span></span>
        </div>
      ))}
    </div>
  );
  return null;
};

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [allData, setAllData] = useState<RetractionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    year: '全部', nature: '全部', country: '全部', subject: '全部', search: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: 'RetractionDate', dir: 'desc' as 'asc' | 'desc' });
  const [localSearch, setLocalSearch] = useState('');

  const itemsPerPage = 20;

  // Load data from public CSV at runtime
  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}retraction_watch.csv`)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.text(); })
      .then(text => {
        const data = parseCSV(text);
        setAllData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load CSV:', err);
        setLoading(false);
      });
  }, []);

  // Filter options
  const filterOptions = useMemo(() => {
    const years = new Set<string>();
    const countries = new Set<string>();
    const subjects = new Set<string>();
    const natures = new Set<string>();
    allData.forEach(d => {
      if (d.RetractionDate) years.add(d.RetractionDate.split('-')[0]);
      countries.add(d.Country);
      if (d.Subject) d.Subject.split(';').forEach(s => subjects.add(s.trim()));
      if (d.RetractionNature) natures.add(d.RetractionNature);
    });
    return {
      years: ['全部', ...Array.from(years).sort().reverse()],
      countries: ['全部', ...Array.from(countries).sort()],
      subjects: ['全部', ...Array.from(subjects).sort()],
      natures: ['全部', ...Array.from(natures).sort()],
    };
  }, [allData]);

  // Processed & sorted data
  const processedData = useMemo(() => {
    let result = allData.filter(item => {
      if (filters.year !== '全部' && !item.RetractionDate?.startsWith(filters.year)) return false;
      if (filters.nature !== '全部' && item.RetractionNature !== filters.nature) return false;
      if (filters.country !== '全部' && !item.Country.includes(filters.country)) return false;
      if (filters.subject !== '全部' && !item.Subject?.includes(filters.subject)) return false;
      if (localSearch) {
        const q = localSearch.toLowerCase();
        if (!item.Title.toLowerCase().includes(q) &&
            !item.Author.toLowerCase().includes(q) &&
            !item.Journal.toLowerCase().includes(q) &&
            !item.DOI.toLowerCase().includes(q)) return false;
      }
      return true;
    });
    if (sortConfig.key) {
      result.sort((a, b) => {
        const av = (a as any)[sortConfig.key] ?? '';
        const bv = (b as any)[sortConfig.key] ?? '';
        const cmp = String(av).localeCompare(String(bv));
        return sortConfig.dir === 'asc' ? cmp : -cmp;
      });
    }
    return result;
  }, [allData, filters, sortConfig, localSearch]);

  const totalPages = Math.max(1, Math.ceil(processedData.length / itemsPerPage));
  const pageData = processedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Chart data
  const trendData = useMemo(() =>
    aggregate(processedData, r => r.RetractionDate?.split('-')[0])
      .sort((a, b) => a.name.localeCompare(b.name)),
    [processedData]);

  const countryData = useMemo(() => aggregate(processedData, r => r.Country, 8), [processedData]);
  const subjectRadar = useMemo(() => aggregate(processedData, r => r.Subject?.split(';')).slice(0, 8), [processedData]);
  const reasonData = useMemo(() =>
    aggregate(processedData, r => r.Reason?.split(';').map(s => s.trim())).slice(0, 8),
    [processedData]);
  const journalSource = useMemo(() => aggregate(processedData, r => r.Journal, 5), [processedData]);
  const institutionSource = useMemo(() => aggregate(processedData, r => r.Institution, 5), [processedData]);

  const handleSort = (key: string) => {
    setSortConfig(prev => ({ key, dir: prev.key === key && prev.dir === 'desc' ? 'asc' : 'desc' }));
  };

  const resetFilters = () => {
    setFilters({ year: '全部', nature: '全部', country: '全部', subject: '全部', search: '' });
    setLocalSearch('');
    setCurrentPage(1);
  };

  const handleSearch = () => {
    setFilters(f => ({ ...f, search: localSearch }));
    setCurrentPage(1);
  };

  // KPI
  const kpiTotal = processedData.length;
  const kpiCountries = [...new Set(processedData.map(r => r.Country))].length;
  const kpiJournals = [...new Set(processedData.map(r => r.Journal))].length;
  const kpiRetraction = processedData.filter(r => r.RetractionNature === 'Retraction').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">加载 Retraction Watch 数据中...</p>
          <p className="text-slate-600 text-xs mt-1">69,000+ 条记录</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-sans p-4 lg:p-8">
      {/* ── Header ── */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-center">
            <AlertTriangle className="w-7 h-7 text-rose-500" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">学术诚信撤稿数据监测仪表盘</h1>
            <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-mono">Retraction Watch Professional Intelligence</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
            <input
              className="bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-rose-500/40 transition-all placeholder:text-slate-600"
              placeholder="搜索研究、作者、DOI..."
              value={localSearch}
              onChange={e => setLocalSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <button onClick={handleSearch} className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-sm font-medium rounded-lg transition-colors">
            搜索
          </button>
        </div>
      </header>

      {/* ── KPI Strip ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: '总撤稿数', value: kpiTotal.toLocaleString(), sub: `${allData.length.toLocaleString()} 条记录`, color: 'text-rose-500' },
          { label: 'Retraction', value: kpiRetraction.toLocaleString(), sub: '撤稿', color: 'text-rose-400' },
          { label: '涉及国家', value: kpiCountries, sub: '全球分布', color: 'text-blue-400' },
          { label: '涉及期刊', value: kpiJournals, sub: '学术期刊', color: 'text-emerald-400' },
        ].map(({ label, value, sub, color }) => (
          <div key={label} className="bg-slate-900/60 border border-slate-800 rounded-xl px-5 py-4">
            <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{label}</div>
            <div className={`text-2xl font-black mt-1 ${color}`}>{typeof value === 'number' ? value.toLocaleString() : value}</div>
            <div className="text-[10px] text-slate-600 mt-0.5">{sub}</div>
          </div>
        ))}
      </div>

      {/* ── Filter Bar ── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8 bg-slate-900/30 p-4 border border-slate-800/50 rounded-2xl">
        <div className="space-y-1.5">
          <label className="text-[10px] text-slate-500 uppercase font-bold ml-1">撤稿年份</label>
          <select value={filters.year} onChange={e => setFilters(f => ({ ...f, year: e.target.value }))} className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-3 text-sm">
            {filterOptions.years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] text-slate-500 uppercase font-bold ml-1">撤稿类型</label>
          <select value={filters.nature} onChange={e => setFilters(f => ({ ...f, nature: e.target.value }))} className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-3 text-sm">
            {filterOptions.natures.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] text-slate-500 uppercase font-bold ml-1">国家/地区</label>
          <select value={filters.country} onChange={e => setFilters(f => ({ ...f, country: e.target.value }))} className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-3 text-sm">
            {filterOptions.countries.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] text-slate-500 uppercase font-bold ml-1">学科领域</label>
          <select value={filters.subject} onChange={e => setFilters(f => ({ ...f, subject: e.target.value }))} className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-3 text-sm">
            {filterOptions.subjects.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="flex items-end">
          <button onClick={resetFilters} className="w-full h-[38px] bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-lg transition-colors border border-slate-700">
            重置所有条件
          </button>
        </div>
      </div>

      {/* ── Charts Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">

        {/* Trend */}
        <Panel title="时间：撤稿趋势演变" icon={TrendingUp} className="md:col-span-8 h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 10 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="count" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>

        {/* Radar */}
        <Panel title="学科：研究领域画像" icon={Layers} className="md:col-span-4 h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={subjectRadar}>
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 9 }} />
              <Tooltip content={<CustomTooltip />} />
              <Radar name="撤稿数" dataKey="count" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
            </RadarChart>
          </ResponsiveContainer>
        </Panel>

        {/* Country */}
        <Panel title="地域：受影响国家分布" icon={Globe} className="md:col-span-4 h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={countryData} layout="vertical">
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" stroke="#94a3b8" tick={{ fontSize: 10 }} width={80} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {countryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        {/* Reason */}
        <Panel title="原因：多重成因深度拆解" icon={ShieldAlert} className="md:col-span-4 h-[300px]">
          <div className="flex flex-col gap-3 overflow-y-auto max-h-full pr-1">
            {reasonData.map((item, i) => (
              <div key={i}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[11px] text-slate-300 truncate w-3/4">{item.name}</span>
                  <span className="text-xs font-mono text-rose-400">{item.count}</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500" style={{ width: `${(item.count / processedData.length) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Panel>

        {/* Sources */}
        <Panel title="来源：高频重灾期刊/机构" icon={Database} className="md:col-span-4 h-[300px]">
          <div className="space-y-3 overflow-y-auto max-h-full pr-1">
            <div>
              <p className="text-[10px] text-slate-500 font-bold mb-2 uppercase flex items-center gap-1">
                <Newspaper className="w-3 h-3" /> 重灾期刊 TOP 3
              </p>
              {journalSource.slice(0, 3).map((item, i) => (
                <div key={i} className="flex items-center justify-between py-1 border-b border-slate-800/30">
                  <span className="text-[11px] text-slate-300 truncate w-40">{item.name}</span>
                  <span className="text-[10px] px-2 bg-slate-800 rounded text-slate-400">{item.count} 篇</span>
                </div>
              ))}
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold mb-2 uppercase flex items-center gap-1">
                <Building2 className="w-3 h-3" /> 重灾机构 TOP 3
              </p>
              {institutionSource.slice(0, 3).map((item, i) => (
                <div key={i} className="flex items-center justify-between py-1 border-b border-slate-800/30">
                  <span className="text-[11px] text-slate-300 truncate w-40">{item.name}</span>
                  <span className="text-[10px] px-2 bg-slate-800 rounded text-slate-400">{item.count} 篇</span>
                </div>
              ))}
            </div>
          </div>
        </Panel>
      </div>

      {/* ── Data Table ── */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-6 py-5 bg-slate-800/20 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-rose-500" />
            <h2 className="text-lg font-bold text-white tracking-tight">明细数据记录底稿</h2>
          </div>
          <div className="text-xs font-mono text-slate-500">
            SHOWING <span className="text-white">{(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, processedData.length)}</span>
            {' OF '}<span className="text-white">{processedData.length.toLocaleString()}</span> RECORDS
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-950/50 text-slate-500 text-[10px] uppercase font-black border-b border-slate-800">
              <tr>
                <SortHeader label="论文标题" sortKey="Title" sortConfig={sortConfig} onSort={handleSort} className="min-w-[280px]" />
                <th className="px-4 py-3">DOI / 信息</th>
                <SortHeader label="期刊" sortKey="Journal" sortConfig={sortConfig} onSort={handleSort} className="min-w-[150px]" />
                <SortHeader label="国家" sortKey="Country" sortConfig={sortConfig} onSort={handleSort} className="min-w-[100px]" />
                <SortHeader label="撤稿日期" sortKey="RetractionDate" sortConfig={sortConfig} onSort={handleSort} className="min-w-[110px]" />
                <SortHeader label="发表日期" sortKey="OriginalPaperDate" sortConfig={sortConfig} onSort={handleSort} className="min-w-[110px]" />
                <th className="px-4 py-3">核心原因分析</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {pageData.map((row) => (
                <tr key={row['Record ID']} className="hover:bg-rose-500/5 transition-all group">
                  <td className="px-4 py-4">
                    <div className="max-w-[260px]">
                      <div className="text-slate-100 font-bold leading-snug line-clamp-2 group-hover:text-rose-400 transition-colors">{row.Title}</div>
                      <div className="text-[10px] text-slate-600 mt-1 uppercase font-mono">{row.Author}</div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Link className="w-3 h-3 text-rose-500/50" />
                        <span className="font-mono">{row.DOI || '—'}</span>
                      </div>
                      <div className="text-[9px] bg-slate-800 px-1.5 py-0.5 rounded w-fit text-slate-500 uppercase">{row.Institution}</div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-xs text-slate-400 italic">{row.Journal}</td>
                  <td className="px-4 py-4 text-xs">
                    <div className="flex items-center gap-1 text-slate-500">
                      <MapPin className="w-3 h-3" />{row.Country}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-rose-500 font-bold font-mono text-xs">{row.RetractionDate}</div>
                    <div className="text-[9px] text-slate-600 uppercase tracking-tighter mt-0.5">{row.RetractionNature}</div>
                  </td>
                  <td className="px-4 py-4 text-slate-600 font-mono text-xs">{row.OriginalPaperDate}</td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {row.Reason.split(';').filter(Boolean).map((r, i) => (
                        <span key={i} className="bg-slate-800/80 border border-slate-700/50 px-1.5 py-0.5 rounded text-[9px] text-slate-400 leading-tight">
                          {r.trim()}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 bg-slate-950/20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}
              className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 disabled:opacity-20 transition-all">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex gap-1.5">
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let page = i + 1;
                if (totalPages > 7 && currentPage > 4) page = currentPage - 3 + i;
                if (page < 1 || page > totalPages) return null;
                return (
                  <button key={page} onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${currentPage === page ? 'bg-rose-500 text-white' : 'bg-slate-900 text-slate-500 hover:bg-slate-800'}`}>
                    {page}
                  </button>
                );
              })}
            </div>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}
              className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 disabled:opacity-20 transition-all">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="text-xs text-slate-600">PAGE <span className="text-slate-300 font-bold">{currentPage}</span> OF {totalPages}</div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 text-xs text-slate-600 border-t border-slate-800/50 mt-8">
        数据来源: Retraction Watch (Crossref) | 仅供研究和教育目的
      </footer>
    </div>
  );
}
