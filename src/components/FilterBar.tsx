import type { FilterState } from '../lib/types';
import { RotateCcw } from 'lucide-react';

interface FilterBarProps {
  filters: FilterState;
  onChange: (f: FilterState) => void;
  options: {
    years: string[];
    countries: string[];
    subjects: string[];
    natures: string[];
  };
}

export default function FilterBar({ filters, onChange, options }: FilterBarProps) {
  const set = (key: keyof FilterState) => (e: React.ChangeEvent<HTMLSelectElement>) =>
    onChange({ ...filters, [key]: e.target.value });

  const reset = () => onChange({ year: '全部', nature: '全部', country: '全部', subject: '全部', search: '' });

  const hasActiveFilter = filters.year !== '全部' || filters.nature !== '全部' ||
    filters.country !== '全部' || filters.subject !== '全部';

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8 bg-white/[0.02] border border-white/[0.06] p-4 rounded-2xl backdrop-blur-sm">
      <div className="space-y-1.5">
        <label className="text-[10px] text-slate-500 uppercase font-black tracking-wider ml-1">撤稿年份</label>
        <select
          value={filters.year}
          onChange={set('year')}
          className="w-full bg-white/5 hover:bg-white/10 border border-white/10 focus:border-rose-500/50 rounded-xl py-2.5 px-3 text-sm text-slate-200 outline-none transition-all cursor-pointer appearance-none"
        >
          {options.years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] text-slate-500 uppercase font-black tracking-wider ml-1">撤稿类型</label>
        <select
          value={filters.nature}
          onChange={set('nature')}
          className="w-full bg-white/5 hover:bg-white/10 border border-white/10 focus:border-rose-500/50 rounded-xl py-2.5 px-3 text-sm text-slate-200 outline-none transition-all cursor-pointer appearance-none"
        >
          {options.natures.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] text-slate-500 uppercase font-black tracking-wider ml-1">国家 / 地区</label>
        <select
          value={filters.country}
          onChange={set('country')}
          className="w-full bg-white/5 hover:bg-white/10 border border-white/10 focus:border-rose-500/50 rounded-xl py-2.5 px-3 text-sm text-slate-200 outline-none transition-all cursor-pointer appearance-none"
        >
          {options.countries.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] text-slate-500 uppercase font-black tracking-wider ml-1">学科领域</label>
        <select
          value={filters.subject}
          onChange={set('subject')}
          className="w-full bg-white/5 hover:bg-white/10 border border-white/10 focus:border-rose-500/50 rounded-xl py-2.5 px-3 text-sm text-slate-200 outline-none transition-all cursor-pointer appearance-none"
        >
          {options.subjects.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="flex items-end">
        <button
          onClick={reset}
          disabled={!hasActiveFilter}
          className="w-full h-[46px] flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed border border-white/10 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-200 transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          重置筛选
        </button>
      </div>
    </div>
  );
}
