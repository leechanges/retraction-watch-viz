import React, { useEffect, useState } from 'react';
import { loadData } from '../data/loader';
import { getYearStats } from '../data/parser';

export const YearsPage: React.FC = () => {
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

  const yearStats = getYearStats(records);
  const maxCount = yearStats.length > 0 ? Math.max(...yearStats.map(y => y.count)) : 1;
  const totalRetractions = yearStats.reduce((sum, y) => sum + y.count, 0);

  return (
    <div className="pt-14">
      <section className="hero-gradient py-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <p className="eyebrow mb-4">数据分析</p>
          <h1 className="headline-xl mb-6">年度趋势</h1>
          <p className="text-[17px] text-[#86868b] max-w-2xl mx-auto">
            学术撤稿数量随时间的演变趋势
          </p>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-3 gap-8 text-center mb-16">
            <div>
              <div className="stat-number text-[#1d1d1f]">{yearStats.length}</div>
              <p className="text-[15px] text-[#86868b]">覆盖年份</p>
            </div>
            <div>
              <div className="stat-number text-[#1d1d1f]">{totalRetractions.toLocaleString()}</div>
              <p className="text-[15px] text-[#86868b]">总撤稿数</p>
            </div>
            <div>
              <div className="stat-number text-[#0071e3]">{Math.round(totalRetractions / yearStats.length)}</div>
              <p className="text-[15px] text-[#86868b]">年均撤稿</p>
            </div>
          </div>

          {/* Main Chart */}
          <div className="bg-[#f5f5f7] rounded-3xl p-10 mb-16">
            <h2 className="text-[21px] font-semibold mb-8">撤稿数量趋势</h2>
            <div className="flex items-end gap-3 h-80">
              {yearStats.map(({ year, count }) => (
                <div key={year} className="flex-1 flex flex-col items-center gap-3 group cursor-pointer">
                  <div className="w-full flex flex-col items-center relative">
                    <div 
                      className="w-full bg-[#0071e3] rounded-t-xl transition-all duration-300 hover:bg-[#0077ED] group-hover:opacity-90"
                      style={{ height: `${(count / maxCount) * 280}px` }}
                    />
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-[#1d1d1f] text-white text-[12px] px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {year}: {count.toLocaleString()} 篇
                    </div>
                  </div>
                  <span className="text-[13px] text-[#86868b]">{year}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Year Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {yearStats.slice(-8).reverse().map(({ year, count }) => (
              <div key={year} className="bg-[#f5f5f7] rounded-2xl p-6 text-center">
                <div className="text-3xl font-semibold mb-1">{year}</div>
                <div className="text-[28px] font-semibold text-[#0071e3]">{count.toLocaleString()}</div>
                <p className="text-[12px] text-[#86868b]">篇撤稿</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
