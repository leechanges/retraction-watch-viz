import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts';
import type { PrecomputedData } from '../../lib/types';

interface TrendChartProps {
  data: PrecomputedData;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <div className="text-xs font-black text-white mb-1.5">{label} 年</div>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-rose-500" />
        <span className="text-xs text-slate-300">撤稿数</span>
        <span className="text-sm font-black text-rose-400 ml-auto">{payload[0]?.value?.toLocaleString()}</span>
      </div>
    </div>
  );
}

export default function TrendChart({ data }: TrendChartProps) {
  const chartData = data.years.map(([name, count]) => ({ name, count }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="gradTrend" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.4} />
            <stop offset="85%" stopColor="#f43f5e" stopOpacity={0.02} />
            <stop offset="100%" stopColor="#f43f5e" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradTrendLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.5} />
            <stop offset="100%" stopColor="#fb7185" stopOpacity={1} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
        <XAxis
          dataKey="name"
          stroke="#475569"
          tick={{ fontSize: 11, fill: '#64748b' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          stroke="#475569"
          tick={{ fontSize: 11, fill: '#64748b' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
        />
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ stroke: '#f43f5e', strokeWidth: 1, strokeDasharray: '4 4' }}
        />
        <Area
          type="monotone"
          dataKey="count"
          stroke="url(#gradTrendLine)"
          strokeWidth={2.5}
          fill="url(#gradTrend)"
          dot={false}
          activeDot={{
            r: 6,
            fill: '#f43f5e',
            stroke: '#020617',
            strokeWidth: 3,
          }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
