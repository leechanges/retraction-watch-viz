import React, { useEffect, useState } from 'react';
import { loadData } from '../data/loader';
import { getReasonStats } from '../data/parser';

export const ReasonsPage: React.FC = () => {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData().then(data => {
      setRecords(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-14">
        <div className="w-12 h-12 border-4 border-[#0071e3] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const reasonStats = getReasonStats(records);
  const maxCount = reasonStats[0]?.[1] || 1;

  // Reason color mapping
  const getReasonColor = (reason: string): string => {
    const lower = reason.toLowerCase();
    if (lower.includes('fraud') || lower.includes('fabrication') || lower.includes(' falsification')) {
      return 'bg-red-500';
    }
    if (lower.includes('duplicate') || lower.includes('plagiarism')) {
      return 'bg-orange-500';
    }
    if (lower.includes('error')) {
      return 'bg-yellow-500';
    }
    if (lower.includes('concern')) {
      return 'bg-purple-500';
    }
    return 'bg-blue-500';
  };

  return (
    <div className="pt-14">
      <section className="hero-gradient py-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <p className="eyebrow mb-4">数据分析</p>
          <h1 className="headline-xl mb-6">撤稿原因</h1>
          <p className="text-[17px] text-[#86868b] max-w-2xl mx-auto">
            分析导致学术撤稿的主要原因分布
          </p>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-3 gap-8 text-center mb-16">
            <div>
              <div className="stat-number text-[#1d1d1f]">{reasonStats.length}</div>
              <p className="text-[15px] text-[#86868b]">撤稿原因类型</p>
            </div>
            <div>
              <div className="stat-number text-[#1d1d1f]">{records.length.toLocaleString()}</div>
              <p className="text-[15px] text-[#86868b]">总撤稿数</p>
            </div>
            <div>
              <div className="stat-number text-[#0071e3]">{Math.round(records.length / reasonStats.length)}</div>
              <p className="text-[15px] text-[#86868b]">每原因平均</p>
            </div>
          </div>

          {/* Reasons Chart */}
          <div className="bg-[#f5f5f7] rounded-3xl p-10 mb-16">
            <h2 className="text-[21px] font-semibold mb-8">原因分布</h2>
            <div className="space-y-4">
              {reasonStats.slice(0, 20).map(([reason, count]) => {
                const percentage = (count / maxCount) * 100;
                return (
                  <div key={reason} className="flex items-center gap-6">
                    <div className="w-48 text-[14px] text-right shrink-0">{reason}</div>
                    <div className="flex-1 h-10 bg-[#e8e8ed] rounded-lg overflow-hidden relative group">
                      <div 
                        className={`h-full ${getReasonColor(reason)} rounded-lg transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                      <div className="absolute inset-0 flex items-center justify-end pr-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[14px] font-semibold text-white drop-shadow-lg">
                          {count.toLocaleString()} ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Reasons Cards */}
          <h2 className="headline-md mb-8">主要撤稿原因</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reasonStats.slice(0, 9).map(([reason, count]) => (
              <div key={reason} className="bg-[#f5f5f7] rounded-2xl p-6">
                <div className={`w-3 h-3 ${getReasonColor(reason)} rounded-full mb-4`} />
                <div className="text-[17px] font-semibold mb-2 line-clamp-2">{reason}</div>
                <div className="text-[32px] font-semibold text-[#0071e3]">{count.toLocaleString()}</div>
                <p className="text-[13px] text-[#86868b]">
                  {((count / records.length) * 100).toFixed(2)}% of total
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
