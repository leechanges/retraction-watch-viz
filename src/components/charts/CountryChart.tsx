import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts';
import type { PrecomputedData } from '../../lib/types';

const COLORS = ['#f43f5e', '#fb7185', '#fb923c', '#fbbf24', '#a3e635', '#34d399', '#22d3ee', '#60a5fa'];

interface CountryChartProps {
  data: PrecomputedData;
  onCountryClick?: (country: string) => void;
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const { name, count } = payload[0].payload;
  return (
    <div className="bg-slate-950/95 border border-white/10 p-3 rounded-xl shadow-2xl">
      <div className="text-xs font-black text-white mb-1">{name}</div>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: payload[0].fill }} />
        <span className="text-xs text-slate-300">撤稿数</span>
        <span className="text-sm font-black text-slate-100 ml-auto">{count.toLocaleString()}</span>
      </div>
    </div>
  );
}

export default function CountryChart({ data, onCountryClick }: CountryChartProps) {
  const chartData = data.countries.slice(0, 8).map(([name, count]) => ({ name, count }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
        <XAxis type="number" hide />
        <YAxis
          dataKey="name"
          type="category"
          width={90}
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: '#94a3b8' }}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
        <Bar
          dataKey="count"
          radius={[0, 6, 6, 0]}
          cursor="pointer"
          onClick={(data) => onCountryClick && onCountryClick(data.name)}
        >
          {chartData.map((_, i) => (
            <Cell
              key={i}
              fill={COLORS[i % COLORS.length]}
              fillOpacity={0.85}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
