import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useAppStore } from '../../store';
import { getReasonStats, getYearStats } from '../../data/mockData';

export const TrendChart: React.FC = () => {
  const { filteredData } = useAppStore();
  
  const option = useMemo(() => {
    const yearStats = getYearStats(filteredData);
    const years = Object.keys(yearStats).map(Number).sort();
    const values = years.map(y => yearStats[y]);
    
    return {
      tooltip: { trigger: 'axis' },
      grid: { left: 50, right: 20, top: 20, bottom: 30 },
      xAxis: { 
        type: 'category', 
        data: years,
        axisLine: { lineStyle: { color: '#1e2d4a' } },
        axisLabel: { color: '#64748b', fontSize: 10 }
      },
      yAxis: { 
        type: 'value',
        axisLine: { lineStyle: { color: '#1e2d4a' } },
        axisLabel: { color: '#64748b', fontSize: 10 },
        splitLine: { lineStyle: { color: '#1e2d4a', type: 'dashed' } }
      },
      series: [{
        data: values,
        type: 'line',
        smooth: true,
        lineStyle: { color: '#00D4AA', width: 2 },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(0,212,170,0.3)' },
              { offset: 1, color: 'rgba(0,212,170,0)' }
            ]
          }
        },
        symbol: 'circle',
        symbolSize: 6,
        itemStyle: { color: '#00D4AA' }
      }]
    };
  }, [filteredData]);

  return (
    <div className="bg-[#101828] border border-[#1e2d4a] rounded-lg overflow-hidden">
      <div className="px-3 py-2 border-b border-[#1e2d4a]">
        <div className="text-xs font-bold text-[#e2e8f0]">📈 撤稿趋势</div>
        <div className="text-[10px] text-[#64748b] font-mono">Retraction Trend Over Time</div>
      </div>
      <div className="h-48">
        <ReactECharts option={option} style={{ height: '100%' }} />
      </div>
    </div>
  );
};

export const ReasonChart: React.FC = () => {
  const { filteredData } = useAppStore();
  
  const option = useMemo(() => {
    const reasonStats = getReasonStats(filteredData);
    const data = Object.entries(reasonStats).map(([name, value]) => ({ name, value }));
    
    const colors: Record<string, string> = {
      'Fraud': '#FF3B5C',
      'Error': '#FFC107',
      'Plagiarism': '#CE93D8',
      'Duplicate': '#64B5F6',
      'Ethics Violation': '#FFB74D',
      'Unspecified': '#90A4AE'
    };
    
    return {
      tooltip: { trigger: 'item' },
      series: [{
        type: 'pie',
        radius: ['50%', '70%'],
        center: ['50%', '50%'],
        data: data,
        label: { show: false },
        itemStyle: {
          color: (params: any) => colors[params.name] || '#90A4AE'
        }
      }]
    };
  }, [filteredData]);

  return (
    <div className="bg-[#101828] border border-[#1e2d4a] rounded-lg overflow-hidden">
      <div className="px-3 py-2 border-b border-[#1e2d4a]">
        <div className="text-xs font-bold text-[#e2e8f0]">⚠️ 撤稿原因分布</div>
        <div className="text-[10px] text-[#64748b] font-mono">Retraction Reasons</div>
      </div>
      <div className="h-48">
        <ReactECharts option={option} style={{ height: '100%' }} />
      </div>
    </div>
  );
};

export const ChartsGrid: React.FC = () => {
  return (
    <div className="grid grid-cols-2 gap-2 p-2.5 overflow-y-auto flex-1">
      <TrendChart />
      <ReasonChart />
    </div>
  );
};
