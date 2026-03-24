import { useMemo, useState } from 'react';
import {
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  ArrowUpDown, MapPin, ExternalLink, FileText, Loader2
} from 'lucide-react';
import type { RetractionRecord, FilterState } from '../lib/types';
import { splitMulti } from '../lib/data';

interface RetractionTableProps {
  data: RetractionRecord[];
  loading: boolean;
  filters: FilterState;
  sortConfig: { key: string; dir: 'asc' | 'desc' };
  onSort: (key: string) => void;
}

const PAGE_SIZE = 20;

type SortConfig = { key: string; dir: 'asc' | 'desc' };

function SortHeader({
  label, sortKey, sortConfig, onSort, className = ''
}: {
  label: string; sortKey: string; sortConfig: SortConfig;
  onSort: (k: string) => void; className?: string;
}) {
  const active = sortConfig.key === sortKey;
  return (
    <th
      className={`px-4 py-3.5 cursor-pointer hover:bg-white/5 transition-colors group ${className}`}
      onClick={() => onSort(sortKey)}
    >
      <div className={`flex items-center gap-1.5 text-[10px] uppercase font-black tracking-widest ${active ? 'text-rose-400' : 'text-slate-500'} group-hover:text-rose-400 transition-colors`}>
        {label}
        <ArrowUpDown className={`w-3 h-3 ${active ? 'opacity-100' : 'opacity-20 group-hover:opacity-70'}`} />
      </div>
    </th>
  );
}

function DateCell({ value }: { value: string }) {
  if (!value) return <span className="text-slate-600">—</span>;
  return (
    <div>
      <div className="text-rose-400 font-mono text-xs font-bold">{value}</div>
    </div>
  );
}

function ReasonTags({ reason }: { reason: string }) {
  const reasons = splitMulti(reason).filter(Boolean).slice(0, 3);
  if (!reasons.length) return <span className="text-slate-600 text-xs">—</span>;
  return (
    <div className="flex flex-wrap gap-1 max-w-[180px]">
      {reasons.map((r, i) => (
        <span
          key={i}
          className="bg-white/5 hover:bg-rose-500/20 border border-white/8 hover:border-rose-500/30 px-1.5 py-0.5 rounded text-[9px] text-slate-400 hover:text-rose-300 transition-all leading-tight cursor-default"
          title={r}
        >
          {r.length > 28 ? r.slice(0, 28) + '…' : r}
        </span>
      ))}
    </div>
  );
}

export default function RetractionTable({
  data, loading, filters, sortConfig, onSort
}: RetractionTableProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(() => {
    let result = data.filter(item => {
      if (filters.year !== '全部' && !item.RetractionDate?.startsWith(filters.year)) return false;
      if (filters.nature !== '全部' && item.RetractionNature !== filters.nature) return false;
      if (filters.country !== '全部' && !splitMulti(item.Country).includes(filters.country)) return false;
      if (filters.subject !== '全部' && !splitMulti(item.Subject).some(s => s.includes(filters.subject))) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (
          !item.Title.toLowerCase().includes(q) &&
          !item.Author.toLowerCase().includes(q) &&
          !item.Journal.toLowerCase().includes(q) &&
          !item.DOI.toLowerCase().includes(q) &&
          !item.Reason.toLowerCase().includes(q)
        ) return false;
      }
      return true;
    });

    if (sortConfig.key) {
      result = [...result].sort((a, b) => {
        const av = String((a as any)[sortConfig.key] ?? '').slice(0, 100);
        const bv = String((b as any)[sortConfig.key] ?? '').slice(0, 100);
        const cmp = av.localeCompare(bv);
        return sortConfig.dir === 'asc' ? cmp : -cmp;
      });
    }
    return result;
  }, [data, filters, sortConfig]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageData = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Reset page when filters change
  const handleSort = (key: string) => {
    onSort(key);
    setCurrentPage(1);
  };

  const pageNumbers = useMemo(() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | '...')[] = [1];
    if (currentPage > 3) pages.push('...');
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
    return pages;
  }, [currentPage, totalPages]);

  return (
    <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl overflow-hidden">
      {/* Table Header */}
      <div className="px-6 py-4 bg-white/[0.02] border-b border-white/[0.06] flex justify-between items-center">
        <div className="flex items-center gap-2.5">
          <FileText className="w-4 h-4 text-rose-400" />
          <h2 className="text-sm font-black text-slate-200 tracking-tight">明细记录</h2>
          {loading && <Loader2 className="w-3.5 h-3.5 text-slate-500 animate-spin ml-1" />}
        </div>
        <div className="text-xs font-mono text-slate-500">
          <span className="text-slate-300 font-bold">{filtered.length.toLocaleString()}</span> 条记录
          {loading && '（加载中）'}
        </div>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="p-12 text-center">
          <Loader2 className="w-8 h-8 text-rose-500 animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500">正在加载明细数据...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center">
          <p className="text-sm text-slate-600">未找到匹配条件的数据</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950/50 text-slate-500 text-[10px] uppercase font-black tracking-widest border-b border-white/[0.05]">
              <tr>
                <SortHeader label="论文标题" sortKey="Title" sortConfig={sortConfig} onSort={handleSort} className="min-w-[240px]" />
                <th className="px-4 py-3.5 min-w-[140px]">DOI / 机构</th>
                <SortHeader label="期刊" sortKey="Journal" sortConfig={sortConfig} onSort={handleSort} className="min-w-[120px]" />
                <SortHeader label="国家" sortKey="Country" sortConfig={sortConfig} onSort={handleSort} className="min-w-[90px]" />
                <SortHeader label="撤稿日期" sortKey="RetractionDate" sortConfig={sortConfig} onSort={handleSort} className="min-w-[100px]" />
                <SortHeader label="发表日期" sortKey="OriginalPaperDate" sortConfig={sortConfig} onSort={handleSort} className="min-w-[100px]" />
                <th className="px-4 py-3.5 min-w-[160px]">撤稿原因</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {pageData.map((row) => (
                <tr
                  key={row['Record ID']}
                  className="hover:bg-rose-500/[0.04] group transition-colors"
                >
                  <td className="px-4 py-4">
                    <div className="max-w-[240px]">
                      <div className="text-slate-100 font-semibold text-[13px] leading-snug line-clamp-2 group-hover:text-rose-300 transition-colors">
                        {row.Title || '—'}
                      </div>
                      <div className="text-[9px] text-slate-600 mt-1 font-mono truncate">
                        {row.Author || '—'}
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex flex-col gap-1.5 max-w-[130px]">
                      {row.DOI && (
                        <a
                          href={`https://doi.org/${row.DOI}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[10px] text-blue-400/70 hover:text-blue-400 transition-colors font-mono"
                        >
                          <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                          <span className="truncate">{row.DOI}</span>
                        </a>
                      )}
                      <div className="text-[9px] bg-white/5 px-1.5 py-0.5 rounded truncate text-slate-500" title={row.Institution}>
                        {row.Institution || '—'}
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4 text-xs text-slate-400 italic max-w-[120px]">
                    <div className="truncate" title={row.Journal}>{row.Journal || '—'}</div>
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <MapPin className="w-3 h-3 text-slate-600" />
                      <span className="text-[11px]">{row.Country || '—'}</span>
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <DateCell value={row.RetractionDate} />
                    <div className="text-[9px] text-slate-600 uppercase tracking-tighter mt-0.5">{row.RetractionNature || '—'}</div>
                  </td>

                  <td className="px-4 py-4">
                    <DateCell value={row.OriginalPaperDate} />
                  </td>

                  <td className="px-4 py-4">
                    <ReasonTags reason={row.Reason} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!loading && filtered.length > 0 && (
        <div className="px-6 py-3.5 bg-slate-950/40 border-t border-white/[0.05] flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(1)}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-20 text-slate-400 hover:text-white transition-all"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-20 text-slate-400 hover:text-white transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {pageNumbers.map((p, i) =>
              p === '...' ? (
                <span key={`ellipsis-${i}`} className="px-1 text-slate-600 text-xs">…</span>
              ) : (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p as number)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                    currentPage === p
                      ? 'bg-rose-500 text-white'
                      : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {p}
                </button>
              )
            )}

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-20 text-slate-400 hover:text-white transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(totalPages)}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-20 text-slate-400 hover:text-white transition-all"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>

          <div className="text-[11px] text-slate-600 font-mono">
            第 <span className="text-slate-300 font-bold">{currentPage}</span> / {totalPages} 页
          </div>
        </div>
      )}
    </div>
  );
}
