import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  Tooltip, ResponsiveContainer
} from 'recharts';

interface SubjectRadarChartProps {
  subjects: [string, number][];
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <div className="text-xs font-black text-white mb-1">{label}</div>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-blue-400" />
        <span className="text-xs text-slate-300">撤稿数</span>
        <span className="text-sm font-black text-blue-400 ml-auto">{payload[0]?.value?.toLocaleString()}</span>
      </div>
    </div>
  );
}

export default function SubjectRadarChart({ subjects }: SubjectRadarChartProps) {
  const data = subjects.slice(0, 8).map(([name, count]) => ({ name, count }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart cx="50%" cy="50%" outerRadius="78%" data={data}>
        <PolarGrid stroke="#1e293b" strokeWidth={1} />
        <PolarAngleAxis
          dataKey="name"
          tick={{ fill: '#94a3b8', fontSize: 10 }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Radar
          name="撤稿数"
          dataKey="count"
          stroke="#60a5fa"
          strokeWidth={2}
          fill="#60a5fa"
          fillOpacity={0.18}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
