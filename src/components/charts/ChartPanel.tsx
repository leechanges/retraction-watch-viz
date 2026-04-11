import type { ReactNode } from 'react';

interface ChartPanelProps {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
  glow?: 'rose' | 'purple' | 'blue' | 'emerald';
}

const glowMap = {
  rose: 'hover:glow-rose',
  purple: 'hover:glow-purple',
  blue: 'hover:glow-blue',
  emerald: 'hover:glow-emerald',
};

export default function ChartPanel({ title, icon, children, className = '', action, glow }: ChartPanelProps) {
  return (
    <div
      className={`
        group relative
        bg-white/[0.03] hover:bg-white/[0.05]
        border border-white/[0.07] hover:border-white/[0.12]
        rounded-2xl p-5
        transition-all duration-300
        ${glow ? glowMap[glow] : ''}
        ${className}
      `}
    >
      {/* Subtle top glow line on hover */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-rose-500/10 border border-rose-500/20 rounded-lg">
            {icon}
          </div>
          <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest">{title}</h3>
        </div>
        {action && <div>{action}</div>}
      </div>

      <div className="flex-1 min-h-0">{children}</div>
    </div>
  );
}
