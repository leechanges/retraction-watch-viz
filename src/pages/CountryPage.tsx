import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Globe, BookOpen, Building2, ShieldAlert, TrendingUp,
  Layers, AlertTriangle, Loader2
} from 'lucide-react';
import {
  fetchPrecomputed, fetchCSV, splitMulti
} from '../lib/data';
import type { PrecomputedData, RetractionRecord, CountryDetail } from '../lib/types';
import KpiCard from '../components/KpiCard';
import ChartPanel from '../components/charts/ChartPanel';
import TrendChart from '../components/charts/TrendChart';
import ReasonBarChart from '../components/charts/ReasonBarChart';
import JournalChart from '../components/charts/JournalChart';

export default function CountryPage() {
  const { name } = useParams<{ name: string }>();
  const decodedName = decodeURIComponent(name ?? '');
  const navigate = useNavigate();

  const [precomputed, setPrecomputed] = useState<PrecomputedData | null>(null);
  const [allRecords, setAllRecords] = useState<RetractionRecord[]>([]);
  const [tableLoading, setTableLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPrecomputed().then(setPrecomputed).catch(console.error);
    fetchCSV()
      .then(data => { setAllRecords(data); setTableLoading(false); })
      .catch(() => setTableLoading(false));
  }, []);

  const detail = useMemo((): CountryDetail | null => {
    if (!allRecords.length) return null;
    const filtered = allRecords.filter(r => splitMulti(r.Country).includes(decodedName));
    if (!filtered.length) return null;

    const count = filtered.length;
    const yearMap = new Map<string, number>();
    const journalMap = new Map<string, number>();
    const instMap = new Map<string, number>();
    const reasonMap = new Map<string, number>();
    const subjectMap = new Map<string, number>();
    const natureMap = new Map<string, number>();

    for (const r of filtered) {
      const year = r.RetractionDate?.slice(0, 4);
      if (year && /^\d{4}$/.test(year)) yearMap.set(year, (yearMap.get(year) ?? 0) + 1);
      for (const j of splitMulti(r.Journal)) if (j) journalMap.set(j, (journalMap.get(j) ?? 0) + 1);
      for (const i of splitMulti(r.Institution)) if (i) instMap.set(i, (instMap.get(i) ?? 0) + 1);
      for (const s of splitMulti(r.Subject)) if (s) subjectMap.set(s, (subjectMap.get(s) ?? 0) + 1);
      for (const n of splitMulti(r.RetractionNature)) if (n) natureMap.set(n, (natureMap.get(n) ?? 0) + 1);
      for (const reason of splitMulti(r.Reason)) if (reason) reasonMap.set(reason, (reasonMap.get(reason) ?? 0) + 1);
    }

    const top = (map: Map<string, number>, n: number) =>
      Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, n);

    return {
      name: decodedName,
      count,
      topJournals: top(journalMap, 8),
      topInstitutions: top(instMap, 8),
      topReasons: top(reasonMap, 8),
      topSubjects: top(subjectMap, 8),
      yearTrend: Array.from(yearMap.entries()).sort((a, b) => a[0].localeCompare(b[0])),
      retractionNatures: top(natureMap, 5),
    };
  }, [allRecords, decodedName]);

  const filteredRecords = useMemo(() => {
    if (!searchQuery) return allRecords.filter(r => splitMulti(r.Country).includes(decodedName));
    const q = searchQuery.toLowerCase();
    return allRecords.filter(r => {
      if (!splitMulti(r.Country).includes(decodedName)) return false;
      return (
        r.Title.toLowerCase().includes(q) ||
        r.Author.toLowerCase().includes(q) ||
        r.Journal.toLowerCase().includes(q) ||
        r.DOI.toLowerCase().includes(q)
      );
    });
  }, [allRecords, decodedName, searchQuery]);

  const topCountryRank = useMemo(() => {
    if (!precomputed) return null;
    const idx = precomputed.countries.findIndex(([c]) => c === decodedName);
    return idx >= 0 ? idx + 1 : null;
  }, [precomputed, decodedName]);

  if (!precomputed) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-rose-500 animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-sm">加载 {decodedName} 数据中...</p>
        </div>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="text-center">
          <Globe className="w-12 h-12 text-slate-700 mx-auto mb-4" />
          <p className="text-slate-400 text-lg font-bold">未找到 "{decodedName}" 的数据</p>
          <Link to="/" className="text-rose-400 text-sm mt-3 inline-block hover:text-rose-300">
            ← 返回全球概览
          </Link>
        </div>
      </div>
    );
  }

  const { count } = detail;
  const rank = topCountryRank;
  const globalPct = ((count / precomputed.total) * 100).toFixed(2);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 p-5 lg:p-8">
      {/* ── Header ── */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-rose-500/20 to-blue-500/20 border border-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Globe className="w-6 h-6 text-rose-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white tracking-tight">{decodedName}</h1>
                <span className="px-2 py-0.5 bg-rose-500/10 border border-rose-500/20 rounded-full text-[10px] text-rose-400 font-black uppercase tracking-widest">
                  学术撤稿监测
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 tracking-widest font-mono uppercase">
                Retraction Watch · Country Intelligence Report
              </p>
            </div>
          </div>
        </div>

        <div className="relative">
          <input
            className="w-full md:w-72 bg-white/5 hover:bg-white/10 border border-white/10 focus:border-rose-500/50 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 outline-none transition-all"
            placeholder="搜索该国家论文..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </header>

      {/* ── Breadcrumb & Global Context ── */}
      <div className="flex items-center gap-2 mb-6 text-xs text-slate-600">
        <Link to="/" className="hover:text-rose-400 transition-colors">全球概览</Link>
        <span>/</span>
        <span className="text-slate-400">{decodedName}</span>
        {rank !== null && (
          <>
            <span>/</span>
            <span>全球第 <span className="text-rose-400 font-bold">{rank}</span> 大撤稿来源国</span>
          </>
        )}
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <KpiCard
          label={`${decodedName} 撤稿总数`}
          value={count}
          sub={`占全球 ${globalPct}%`}
          icon={<AlertTriangle className="w-5 h-5 text-rose-400" />}
          accentColor="#f43f5e"
        />
        <KpiCard
          label="涉及期刊"
          value={detail.topJournals.length}
          sub="有撤稿记录的期刊"
          icon={<BookOpen className="w-5 h-5 text-blue-400" />}
          accentColor="#60a5fa"
        />
        <KpiCard
          label="涉及机构"
          value={detail.topInstitutions.length}
          sub="有撤稿记录的机构"
          icon={<Building2 className="w-5 h-5 text-emerald-400" />}
          accentColor="#34d399"
        />
        <KpiCard
          label="撤稿原因类型"
          value={detail.topReasons.length}
          sub="不同撤稿原因"
          icon={<ShieldAlert className="w-5 h-5 text-amber-400" />}
          accentColor="#fbbf24"
        />
      </div>

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mb-8">
        {/* Year Trend */}
        <ChartPanel
          title={`${decodedName} · 撤稿时间趋势`}
          icon={<TrendingUp className="w-3.5 h-3.5 text-rose-400" />}
          className="md:col-span-8 h-[300px]"
        >
          <TrendChart data={{ ...precomputed, years: detail.yearTrend, total: count }} />
        </ChartPanel>

        {/* Nature breakdown */}
        <ChartPanel
          title="撤稿类型分布"
          icon={<ShieldAlert className="w-3.5 h-3.5 text-amber-400" />}
          className="md:col-span-4 h-[300px]"
        >
          <div className="flex flex-col gap-3 h-full justify-center">
            {detail.retractionNatures.map(([n, c]) => (
              <div key={n}>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-slate-300">{n}</span>
                  <span className="text-xs font-mono text-rose-400">{c.toLocaleString()}</span>
                </div>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-rose-500 to-amber-400 rounded-full"
                    style={{ width: `${(c / count) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </ChartPanel>

        {/* Journals */}
        <ChartPanel
          title={`${decodedName} · 高频撤稿期刊`}
          icon={<BookOpen className="w-3.5 h-3.5 text-blue-400" />}
          className="md:col-span-6 h-[280px]"
        >
          <JournalChart title="" icon="journal" items={detail.topJournals} maxItems={8} />
        </ChartPanel>

        {/* Institutions */}
        <ChartPanel
          title={`${decodedName} · 高频撤稿机构`}
          icon={<Building2 className="w-3.5 h-3.5 text-emerald-400" />}
          className="md:col-span-6 h-[280px]"
        >
          <JournalChart title="" icon="institution" items={detail.topInstitutions} maxItems={8} />
        </ChartPanel>

        {/* Reasons */}
        <ChartPanel
          title="撤稿原因详细分析"
          icon={<ShieldAlert className="w-3.5 h-3.5 text-rose-400" />}
          className="md:col-span-6 h-[280px]"
        >
          <ReasonBarChart reasons={detail.topReasons} total={count} />
        </ChartPanel>

        {/* Subjects */}
        <ChartPanel
          title="学科领域分布"
          icon={<Layers className="w-3.5 h-3.5 text-blue-400" />}
          className="md:col-span-6 h-[280px]"
        >
          <ReasonBarChart
            reasons={detail.topSubjects}
            total={count}
          />
        </ChartPanel>
      </div>

      {/* ── Record List ── */}
      <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl overflow-hidden mb-8">
        <div className="px-6 py-4 bg-white/[0.02] border-b border-white/[0.06] flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-rose-400" />
          <h2 className="text-sm font-black text-slate-200">{decodedName} 撤稿明细</h2>
          {tableLoading ? (
            <Loader2 className="w-3.5 h-3.5 text-slate-500 animate-spin" />
          ) : (
            <span className="text-xs font-mono text-slate-600 ml-1">
              {filteredRecords.length.toLocaleString()} 条记录
            </span>
          )}
        </div>

        {tableLoading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 text-rose-500 animate-spin mx-auto mb-3" />
            <p className="text-sm text-slate-500">加载数据中...</p>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-80 overflow-y-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950/50 sticky top-0 text-slate-500 text-[10px] uppercase font-black tracking-widest border-b border-white/[0.05]">
                <tr>
                  <th className="px-4 py-3 min-w-[200px]">论文标题</th>
                  <th className="px-4 py-3 min-w-[120px]">期刊</th>
                  <th className="px-4 py-3 min-w-[90px]">机构</th>
                  <th className="px-4 py-3 min-w-[100px]">撤稿日期</th>
                  <th className="px-4 py-3 min-w-[160px]">撤稿原因</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredRecords.slice(0, 100).map(row => (
                  <tr key={row['Record ID']} className="hover:bg-rose-500/[0.04] transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="text-slate-100 text-[12px] font-semibold leading-snug line-clamp-2 max-w-[200px]">
                        {row.Title || '—'}
                      </div>
                      <div className="text-[9px] text-slate-600 mt-0.5 font-mono truncate max-w-[200px]">{row.Author || '—'}</div>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-400 italic">{row.Journal || '—'}</td>
                    <td className="px-4 py-3.5">
                      <div className="text-[10px] bg-white/5 px-1.5 py-0.5 rounded text-slate-500 truncate max-w-[90px]" title={row.Institution}>
                        {row.Institution || '—'}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-rose-400 font-mono text-xs">{row.RetractionDate || '—'}</td>
                    <td className="px-4 py-3.5 max-w-[160px]">
                      <div className="flex flex-wrap gap-1">
                        {splitMulti(row.Reason).slice(0, 2).map((r, i) => (
                          <span key={i} className="bg-white/5 border border-white/8 px-1.5 py-0.5 rounded text-[9px] text-slate-400 leading-tight">
                            {r.length > 24 ? r.slice(0, 24) + '…' : r}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredRecords.length > 100 && (
              <div className="text-center py-3 text-xs text-slate-600 bg-slate-950/30">
                仅显示前 100 条（共 {filteredRecords.length.toLocaleString()} 条）
              </div>
            )}
          </div>
        )}
      </div>

      <footer className="text-center py-8 text-xs text-slate-700 border-t border-white/[0.03]">
        数据来源：Retraction Watch（Crossref 开放数据）· 仅供研究与教育目的
      </footer>
    </div>
  );
}
