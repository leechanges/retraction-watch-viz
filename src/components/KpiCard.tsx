import type { ReactNode } from 'react';

interface KpiCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: ReactNode;
  accentColor: string;
  trend?: string;
}

export default function KpiCard({ label, value, sub, icon, accentColor, trend }: KpiCardProps) {
  return (
    <div className="group relative overflow-hidden bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-white/[0.14] rounded-2xl p-5 transition-all duration-300 cursor-default">
      {/* Glow effect */}
      <div
        className="absolute -top-12 -right-12 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ backgroundColor: accentColor }}
      />

      <div className="flex items-start justify-between">
        <div>
          <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{label}</div>
          <div className="text-3xl font-black mt-1.5 tabular-nums" style={{ color: accentColor }}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </div>
          {sub && <div className="text-[10px] text-slate-600 mt-1">{sub}</div>}
          {trend && (
            <div className="text-[10px] text-emerald-400 mt-1 font-mono">{trend}</div>
          )}
        </div>
        <div
          className="p-2.5 rounded-xl border border-white/10"
          style={{ backgroundColor: `${accentColor}18` }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
