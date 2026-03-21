import React from 'react';
import { useAppStore } from '../store';

interface KPICardProps {
  label: string;
  value: string | number;
  sub?: string;
  subColor?: 'up' | 'down' | 'neutral';
  delay?: number;
}

export const KPICard: React.FC<KPICardProps> = ({ label, value, sub, subColor = 'neutral', delay = 0 }) => {
  return (
    <div 
      className="bg-[#101828] border border-[#1e2d4a] rounded-lg p-3 relative overflow-hidden hover:border-[#00a882] hover:shadow-[0_0_20px_rgba(0,212,170,0.08)] transition-all"
      style={{ animationDelay: `${delay * 0.1}s` }}
    >
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#00D4AA] to-transparent opacity-60" />
      <div className="text-[10px] text-[#64748b] uppercase tracking-wider mb-1 font-mono">{label}</div>
      <div className="text-2xl font-bold text-[#e2e8f0] leading-tight mb-2">{value}</div>
      {sub && (
        <div className={`text-[10px] ${
          subColor === 'up' ? 'text-[#00D4AA]' : 
          subColor === 'down' ? 'text-[#FF3B5C]' : 
          'text-[#94a3b8]'
        }`}>
          {sub}
        </div>
      )}
    </div>
  );
};

export const KPIBar: React.FC = () => {
  const { filteredData, data } = useAppStore();
  
  const total = filteredData.length;
  const fraudCount = filteredData.filter(d => d.reason === 'Fraud').length;
  const journals = new Set(filteredData.map(d => d.journal)).size;
  const institutions = new Set(filteredData.map(d => d.institution)).size;
  const currentYear = new Date().getFullYear();
  const monthlyNew = filteredData.filter(d => d.year === currentYear).length;
  
  const totalAll = data.length;
  const change = ((total - (totalAll - total)) / totalAll * 100).toFixed(1);

  return (
    <div className="grid grid-cols-6 gap-2 p-4 bg-[#0b1120] border-b border-[#1e2d4a]">
      <KPICard label="总撤稿数" value={total.toLocaleString()} sub={`↑ ${change}% YoY`} subColor="up" delay={1} />
      <KPICard label="撤稿率" value={`${((fraudCount / total) * 100).toFixed(2)}%`} sub="欺诈占比" subColor="neutral" delay={2} />
      <KPICard label="欺诈/伪造" value={fraudCount.toLocaleString()} sub="38.2% of total" subColor="neutral" delay={3} />
      <KPICard label="影响期刊数" value={journals.toLocaleString()} sub={`+${journals > 20 ? 24 : journals} new`} subColor="up" delay={4} />
      <KPICard label="活跃机构" value={institutions.toLocaleString()} sub="112 countries" subColor="neutral" delay={5} />
      <KPICard label="本月新增" value={monthlyNew.toLocaleString()} sub="↑ 8.7% MoM" subColor="up" delay={6} />
    </div>
  );
};
