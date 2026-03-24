import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Globe, AlertTriangle, Loader2, ChevronDown, ExternalLink, Search
} from 'lucide-react';
import {
  fetchPrecomputed, fetchCSV, splitMulti
} from '../lib/data';
import type { PrecomputedData, RetractionRecord } from '../lib/types';

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

  const detail = useMemo(() => {
    if (!allRecords.length) return null;
    const filtered = allRecords.filter(r => splitMulti(r.Country).includes(decodedName));
    if (!filtered.length) return null;

    const count = filtered.length;
    const yearMap = new Map<string, number>();
    const journalMap = new Map<string, number>();
    const instMap = new Map<string, number>();
    const reasonMap = new Map<string, number>();
    const natureMap = new Map<string, number>();

    for (const r of filtered) {
      const year = r.RetractionDate?.slice(0, 4);
      if (year && /^\d{4}$/.test(year)) yearMap.set(year, (yearMap.get(year) ?? 0) + 1);
      for (const j of splitMulti(r.Journal)) if (j) journalMap.set(j, (journalMap.get(j) ?? 0) + 1);
      for (const i of splitMulti(r.Institution)) if (i) instMap.set(i, (instMap.get(i) ?? 0) + 1);
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
      yearTrend: Array.from(yearMap.entries()).sort((a, b) => a[0].localeCompare(b[0])),
      retractionNatures: top(natureMap, 5),
    };
  }, [allRecords, decodedName]);

  const filteredRecords = useMemo(() => {
    let recs = allRecords.filter(r => splitMulti(r.Country).includes(decodedName));
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      recs = recs.filter(r =>
        r.Title.toLowerCase().includes(q) ||
        r.Author.toLowerCase().includes(q) ||
        r.Journal.toLowerCase().includes(q) ||
        r.DOI.toLowerCase().includes(q)
      );
    }
    return recs;
  }, [allRecords, decodedName, searchQuery]);

  const globalPct = precomputed ? ((detail?.count ?? 0) / precomputed.total * 100).toFixed(2) : '—';

  if (!precomputed) {
    return (
      <div className="min-h-screen bg-[#000] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white/30 animate-spin" />
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="min-h-screen bg-[#000] flex items-center justify-center flex-col gap-4">
        <Globe className="w-16 h-16 text-white/10" />
        <p className="text-white/60 text-lg">未找到 "{decodedName}" 的数据</p>
        <Link to="/" className="text-blue-400 text-sm hover:text-blue-300">← 返回</Link>
      </div>
    );
  }

  const { count } = detail;
  const maxReason = detail.topReasons[0]?.[1] ?? 1;
  const maxJournal = detail.topJournals[0]?.[1] ?? 1;

  return (
    <div className="bg-black text-white min-h-screen font-sans">
      {/* ── Navigation ── */}
      <nav className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl bg-black/70 border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6 h-12 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">全球概览</span>
            </button>
            <span className="text-white/20">/</span>
            <span className="text-sm font-medium text-white">{decodedName}</span>
          </div>
          <div className="flex items-center gap-1">
            <Globe className="w-4 h-4 text-rose-400" />
            <span className="text-xs text-white/40 ml-1.5 font-mono uppercase tracking-widest">Retraction Watch</span>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-12 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-rose-950/40 via-black to-black" />
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(244,63,94,0.12) 0%, transparent 70%)' }} />

        <div className="relative z-10 max-w-4xl">
          <p className="text-[11px] text-white/40 uppercase tracking-[0.3em] font-medium mb-6">
            Retraction Watch · {decodedName} 学术诚信报告
          </p>

          <h1 className="text-7xl md:text-9xl font-black text-white leading-none tracking-tight mb-6">
            {decodedName}
          </h1>

          <p className="text-xl text-white/50 font-light mb-2">学术撤稿数据国家画像</p>

          <div className="flex items-center justify-center gap-12 mt-10">
            <div className="text-center">
              <div className="text-5xl md:text-6xl font-black text-white">{count.toLocaleString()}</div>
              <div className="text-[11px] text-white/40 uppercase tracking-widest mt-1">总撤稿数</div>
            </div>
            <div className="w-px h-16 bg-white/10" />
            <div className="text-center">
              <div className="text-5xl md:text-6xl font-black text-rose-400">#{precomputed.countries.findIndex(([c]) => c === decodedName) + 1}</div>
              <div className="text-[11px] text-white/40 uppercase tracking-widest mt-1">全球排名</div>
            </div>
            <div className="w-px h-16 bg-white/10" />
            <div className="text-center">
              <div className="text-5xl md:text-6xl font-black text-white/80">{globalPct}%</div>
              <div className="text-[11px] text-white/40 uppercase tracking-widest mt-1">占全球</div>
            </div>
          </div>
        </div>

        <a
          href="#trend"
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/30 hover:text-white/60 transition-colors"
        >
          <ChevronDown className="w-6 h-6 animate-bounce" />
        </a>
      </section>

      {/* ── Trend ── */}
      <section id="trend" className="py-32 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <p className="text-[11px] text-gray-300 uppercase tracking-[0.25em] mb-3 font-medium">Timeline</p>
            <h2 className="text-5xl md:text-6xl font-black text-black leading-none tracking-tight">
              撤稿时间趋势
            </h2>
            <p className="text-gray-400 text-lg mt-3 font-light">历年撤稿数量演变 · {detail.yearTrend.length > 0 ? `${detail.yearTrend[0][0]}–${detail.yearTrend[detail.yearTrend.length - 1][0]}` : '暂无数据'}</p>
          </div>

          <div className="relative h-20 overflow-hidden">
            <div className="flex items-end gap-1 h-full">
              {detail.yearTrend.map(([year, c]) => {
                const maxCount = detail.yearTrend[detail.yearTrend.length - 1]?.[1] ?? 1;
                const heightPct = (c / maxCount) * 100;
                return (
                  <div key={year} className="flex-1 group flex flex-col items-center justify-end gap-1 cursor-default">
                    <div className="text-[9px] text-gray-300 font-mono opacity-0 group-hover:opacity-100 transition-opacity">{c.toLocaleString()}</div>
                    <div
                      className="w-full bg-black hover:bg-rose-500 transition-colors rounded-t"
                      style={{ height: `${Math.max(heightPct, 4)}%` }}
                      title={`${year}: ${c} 篇`}
                    />
                    <div className="text-[9px] text-gray-400 font-mono">{year}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── Journals ── */}
      <section className="py-32 px-6 bg-[#f5f5f7]">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <p className="text-[11px] text-gray-400 uppercase tracking-[0.25em] mb-3 font-medium">Top Journals</p>
            <h2 className="text-5xl md:text-6xl font-black text-black leading-none tracking-tight">
              高频撤稿期刊
            </h2>
            <p className="text-gray-400 text-lg mt-3 font-light">撤稿记录最多的学术期刊 TOP {detail.topJournals.length}</p>
          </div>

          <div className="space-y-0">
            {detail.topJournals.map(([journal, c], i) => {
              const pct = (c / maxJournal) * 100;
              return (
                <div key={journal} className="group flex items-center gap-6 py-5 border-b border-black/5 last:border-0 hover:border-black/10 transition-colors">
                  <span className="text-[11px] text-gray-300 font-mono w-6 shrink-0">{String(i + 1).padStart(2, '0')}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between mb-1.5">
                      <span className="text-base font-semibold text-black truncate group-hover:text-rose-600 transition-colors">{journal || '未知期刊'}</span>
                      <span className="text-sm text-gray-400 font-mono ml-4 shrink-0">{c.toLocaleString()} 篇</span>
                    </div>
                    <div className="h-[3px] bg-black/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-black rounded-full transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Institutions ── */}
      <section className="py-32 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <p className="text-[11px] text-gray-400 uppercase tracking-[0.25em] mb-3 font-medium">Top Institutions</p>
            <h2 className="text-5xl md:text-6xl font-black text-black leading-none tracking-tight">
              高频撤稿机构
            </h2>
            <p className="text-gray-400 text-lg mt-3 font-light">涉及撤稿最多的研究机构</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-2">
            {detail.topInstitutions.map(([inst, c], i) => (
              <div key={inst} className="group flex items-center gap-4 py-4 border-b border-black/[0.06] last:border-0">
                <span className="text-[11px] text-gray-300 font-mono w-6 shrink-0">{String(i + 1).padStart(2, '0')}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-black truncate group-hover:text-rose-600 transition-colors leading-snug">{inst || '未知机构'}</div>
                </div>
                <span className="text-xs text-gray-400 font-mono shrink-0">{c.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Reasons ── */}
      <section className="py-32 px-6 bg-black">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <p className="text-[11px] text-white/40 uppercase tracking-[0.25em] mb-3 font-medium">Retraction Reasons</p>
            <h2 className="text-5xl md:text-6xl font-black text-white leading-none tracking-tight">
              撤稿原因分析
            </h2>
            <p className="text-white/40 text-lg mt-3 font-light">多重撤稿原因占比分布</p>
          </div>

          <div className="space-y-5">
            {detail.topReasons.map(([reason, c]) => {
              const pct = (c / maxReason) * 100;
              return (
                <div key={reason} className="group">
                  <div className="flex items-start justify-between mb-2 gap-4">
                    <span className="text-sm text-white/70 group-hover:text-white transition-colors leading-snug max-w-2xl">
                      {reason}
                    </span>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-lg font-black text-white font-mono">{c.toLocaleString()}</span>
                      <span className="text-[11px] text-white/30 font-mono w-12 text-right">{((c / count) * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000 ease-out"
                      style={{
                        width: `${pct}%`,
                        background: `linear-gradient(to right, #f43f5e, #fb7185)`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Records ── */}
      <section className="py-32 px-6 bg-[#f5f5f7]">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-[11px] text-gray-400 uppercase tracking-[0.25em] mb-3 font-medium">Record Archive</p>
              <h2 className="text-5xl md:text-6xl font-black text-black leading-none tracking-tight">
                撤稿明细
              </h2>
              <p className="text-gray-400 text-lg mt-3 font-light">
                共 {count.toLocaleString()} 条记录
              </p>
            </div>
            <div className="hidden md:flex items-center gap-2 bg-white border border-black/10 rounded-full px-4 py-2">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                className="bg-transparent text-sm text-black placeholder:text-gray-400 outline-none w-64"
                placeholder="搜索论文、作者、期刊..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {tableLoading ? (
            <div className="py-24 text-center">
              <Loader2 className="w-8 h-8 text-black/20 animate-spin mx-auto mb-3" />
              <p className="text-gray-400 text-sm">加载数据中...</p>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="py-24 text-center">
              <p className="text-gray-400 text-sm">未找到匹配结果</p>
            </div>
          ) : (
            <div className="bg-white border border-black/5 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-black/[0.06]">
                    <th className="text-left text-[10px] uppercase tracking-widest text-gray-300 font-black px-6 py-4">论文标题</th>
                    <th className="text-left text-[10px] uppercase tracking-widest text-gray-300 font-black px-6 py-4">期刊</th>
                    <th className="text-left text-[10px] uppercase tracking-widest text-gray-300 font-black px-6 py-4">机构</th>
                    <th className="text-left text-[10px] uppercase tracking-widest text-gray-300 font-black px-6 py-4">撤稿日期</th>
                    <th className="text-left text-[10px] uppercase tracking-widest text-gray-300 font-black px-6 py-4">原因</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.slice(0, 50).map(row => (
                    <tr key={row['Record ID']} className="border-b border-black/[0.04] last:border-0 hover:bg-black/[0.02] transition-colors">
                      <td className="px-6 py-5">
                        <div className="text-sm font-semibold text-black leading-snug line-clamp-2 max-w-md">{row.Title || '—'}</div>
                        <div className="text-[10px] text-gray-400 mt-0.5 font-mono truncate max-w-md">{row.Author || '—'}</div>
                        {row.DOI && (
                          <a
                            href={`https://doi.org/${row.DOI}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] text-blue-500 hover:text-blue-600 mt-1 font-mono"
                          >
                            <ExternalLink className="w-2.5 h-2.5" />
                            DOI
                          </a>
                        )}
                      </td>
                      <td className="px-6 py-5 text-sm text-gray-500 italic max-w-[140px]">
                        <div className="truncate">{row.Journal || '—'}</div>
                      </td>
                      <td className="px-6 py-5 text-xs text-gray-400 max-w-[140px]">
                        <div className="truncate" title={row.Institution}>{row.Institution || '—'}</div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-sm font-mono font-semibold text-rose-600">{row.RetractionDate || '—'}</div>
                        <div className="text-[9px] text-gray-400 mt-0.5">{row.RetractionNature || '—'}</div>
                      </td>
                      <td className="px-6 py-5 max-w-[200px]">
                        <div className="flex flex-wrap gap-1">
                          {splitMulti(row.Reason).slice(0, 2).map((r, ri) => (
                            <span key={ri} className="text-[10px] bg-black/[0.04] px-2 py-0.5 rounded-full text-gray-500 leading-tight">
                              {r.length > 24 ? r.slice(0, 24) + '…' : r}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredRecords.length > 50 && (
                <div className="py-4 text-center text-sm text-gray-400 border-t border-black/[0.04]">
                  仅显示前 50 条（共 {filteredRecords.length.toLocaleString()} 条）
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-16 px-6 bg-black border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-500" />
            <span className="text-xs text-white/30 font-mono">Retraction Watch · {decodedName}</span>
          </div>
          <p className="text-xs text-white/20">
            数据来源：Retraction Watch（Crossref 开放数据）· 仅供研究与教育目的
          </p>
          <button
            onClick={() => navigate('/')}
            className="text-xs text-white/40 hover:text-white transition-colors flex items-center gap-1"
          >
            ← 返回全球概览
          </button>
        </div>
      </footer>
    </div>
  );
}
