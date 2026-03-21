import React, { useEffect, useState } from 'react';
import { loadData } from '../data/loader';
import { getInstitutionStats } from '../data/parser';

export const InstitutionsPage: React.FC = () => {
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

  const institutionStats = getInstitutionStats(records);
  const maxCount = institutionStats[0]?.[1] || 1;

  return (
    <div className="pt-14">
      <section className="hero-gradient py-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <p className="eyebrow mb-4">数据分析</p>
          <h1 className="headline-xl mb-6">研究机构</h1>
          <p className="text-[17px] text-[#86868b] max-w-2xl mx-auto">
            追踪全球研究机构的撤稿历史和趋势
          </p>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-3 gap-8 text-center mb-16">
            <div>
              <div className="stat-number text-[#1d1d1f]">{institutionStats.length}</div>
              <p className="text-[15px] text-[#86868b]">研究机构</p>
            </div>
            <div>
              <div className="stat-number text-[#1d1d1f]">{records.length.toLocaleString()}</div>
              <p className="text-[15px] text-[#86868b]">总撤稿数</p>
            </div>
            <div>
              <div className="stat-number text-[#0071e3]">{Math.round(records.length / institutionStats.length)}</div>
              <p className="text-[15px] text-[#86868b]">每机构平均</p>
            </div>
          </div>

          <div className="space-y-4">
            {institutionStats.slice(0, 50).map(([institution, count], i) => {
              const percentage = (count / maxCount) * 100;
              return (
                <div
                  key={institution}
                  className="bg-[#f5f5f7] rounded-2xl p-6"
                >
                  <div className="flex items-center gap-6 mb-3">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[18px] font-semibold text-[#86868b]">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <div className="text-[17px] font-semibold">{institution}</div>
                    </div>
                    <div className="text-[28px] font-semibold text-[#0071e3]">{count}</div>
                  </div>
                  <div className="h-2 bg-[#e8e8ed] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#0071e3] rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};
