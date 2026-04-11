import { Newspaper, Building2 } from 'lucide-react';

interface SourceListProps {
  title: string;
  icon: 'journal' | 'institution';
  items: [string, number][];
  maxItems?: number;
}

export default function SourceList({ title, icon: IconComponent, items, maxItems = 5 }: SourceListProps) {
  const Icon = IconComponent === 'journal' ? Newspaper : Building2;
  const displayItems = items.slice(0, maxItems);

  return (
    <div>
      <p className="text-[10px] text-slate-500 font-black mb-3 uppercase tracking-widest flex items-center gap-1.5">
        <Icon className="w-3 h-3" />
        {title}
      </p>
      <div className="space-y-2.5">
        {displayItems.map(([name, count], i) => (
          <div key={i} className="flex items-center justify-between gap-3 group">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="text-[10px] font-mono text-slate-600 w-4 shrink-0">{i + 1}</span>
              <span
                className="text-[11px] text-slate-300 group-hover:text-white transition-colors truncate"
                title={name}
              >
                {name || '—'}
              </span>
            </div>
            <span className="text-[10px] px-2 py-0.5 bg-white/5 border border-white/8 rounded-lg text-emerald-400/80 font-mono shrink-0">
              {count.toLocaleString()}
            </span>
          </div>
        ))}
        {displayItems.length === 0 && (
          <p className="text-xs text-slate-600 italic">暂无数据</p>
        )}
      </div>
    </div>
  );
}
