import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

interface KpiCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: ReactNode;
  accentColor: string;
  trend?: string;
}

/**
 * Animates a number from 0 to the target value
 */
function AnimatedNumber({ target, duration = 1200 }: { target: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number>(0);

  useEffect(() => {
    const from = 0;
    const to = target;
    startRef.current = performance.now();

    const step = (now: number) => {
      const elapsed = now - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      }
    };

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return <span>{display.toLocaleString()}</span>;
}

export default function KpiCard({ label, value, sub, icon, accentColor, trend }: KpiCardProps) {
  const isNumeric = typeof value === 'number';

  return (
    <div className="group relative overflow-hidden bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-white/[0.14] rounded-2xl p-5 transition-all duration-300 cursor-default">
      {/* Glow orb */}
      <div
        className="absolute -top-16 -right-16 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
        style={{ background: accentColor, opacity: 0.12 }}
        aria-hidden="true"
      />

      <div className="flex items-start justify-between">
        <div>
          <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{label}</div>
          <div
            className="text-3xl font-black mt-1.5 tabular-nums tracking-tight"
            style={{ color: accentColor }}
          >
            {isNumeric ? (
              <AnimatedNumber target={value} />
            ) : (
              value
            )}
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
