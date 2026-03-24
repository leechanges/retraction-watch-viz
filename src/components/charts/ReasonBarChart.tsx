interface ReasonBarChartProps {
  reasons: [string, number][];
  total?: number;
}

export default function ReasonBarChart({ reasons }: ReasonBarChartProps) {
  const maxCount = reasons[0]?.[1] ?? 1;

  return (
    <div className="flex flex-col gap-3 overflow-y-auto max-h-full pr-1">
      {reasons.map(([name, count], i) => {
        const widthPct = (count / maxCount) * 100;
        return (
          <div key={i} className="group/item">
            <div className="flex items-start justify-between mb-1.5 gap-2">
              <span
                className="text-[11px] text-slate-300 leading-snug group-hover/item:text-white transition-colors cursor-default"
                title={name}
              >
                {name.length > 42 ? name.slice(0, 42) + '…' : name}
              </span>
              <span className="text-xs font-mono text-rose-400 shrink-0 mt-0.5">{count.toLocaleString()}</span>
            </div>
            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
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
