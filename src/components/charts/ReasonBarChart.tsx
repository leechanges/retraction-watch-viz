

interface ReasonBarChartProps {
  reasons: [string, number][];
  total?: number;
}

export default function ReasonBarChart({ reasons, total = 1 }: ReasonBarChartProps) {
  const maxCount = reasons[0]?.[1] ?? 1;
  const maxShow = reasons.slice(0, 8);

  return (
    <div className="flex flex-col gap-3 overflow-y-auto max-h-full pr-1">
      {maxShow.map(([name, count], i) => {
        const widthPct = (count / maxCount) * 100;
        const pct = total > 0 ? ((count / total) * 100).toFixed(1) : '0';
        return (
          <div key={i} className="group/item">
            <div className="flex items-start justify-between mb-1.5 gap-2">
              <span
                className="text-[11px] text-slate-300 leading-snug group-hover/item:text-white transition-colors cursor-default"
                title={name}
              >
                {name.length > 38 ? name.slice(0, 38) + '…' : name}
              </span>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] text-slate-600 font-mono">{pct}%</span>
                <span className="text-xs font-mono text-rose-400">{count.toLocaleString()}</span>
              </div>
            </div>
            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out group-hover/item:shadow-[0_0_8px_rgba(244,63,94,0.5)]"
                style={{
                  width: `${widthPct}%`,
                  background: `linear-gradient(to right, #f43f5e, #fb7185)`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
