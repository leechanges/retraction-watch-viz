import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { loadData } from '../data/loader';
import { getCountryStats, getYearStats } from '../data/parser';
import type { RetractionRecord } from '../data/parser';

export const CountriesPage: React.FC = () => {
  const [records, setRecords] = useState<RetractionRecord[]>([]);
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

  const countryStats = getCountryStats(records);
  const yearStats = getYearStats(records);
  const maxCount = countryStats[0]?.[1] || 1;

  return (
    <div className="pt-14">
      {/* Hero */}
      <section className="hero-gradient py-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <p className="eyebrow mb-4">数据分析</p>
          <h1 className="headline-xl mb-6">国家/地区分布</h1>
          <p className="text-[17px] text-[#86868b] max-w-2xl mx-auto">
            分析全球各国家和地区的学术撤稿情况，了解撤稿行为的地理分布
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-3 gap-8 text-center mb-16">
            <div>
              <div className="stat-number text-[#1d1d1f]">{countryStats.length}</div>
              <p className="text-[15px] text-[#86868b]">涉及国家</p>
            </div>
            <div>
              <div className="stat-number text-[#1d1d1f]">{records.length.toLocaleString()}</div>
              <p className="text-[15px] text-[#86868b]">总撤稿数</p>
            </div>
            <div>
              <div className="stat-number text-[#0071e3]">{yearStats[yearStats.length - 1]?.year}</div>
              <p className="text-[15px] text-[#86868b]">最新数据年</p>
            </div>
          </div>

          {/* Country List */}
          <div className="space-y-4">
            {countryStats.slice(0, 30).map(([country, count]) => {
              const percentage = (count / maxCount) * 100;
              return (
                <Link
                  key={country}
                  to={`/country/${encodeURIComponent(country)}`}
                  className="block bg-[#f5f5f7] rounded-2xl p-6 hover:bg-[#e8e8ed] transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-[21px] font-semibold">{country}</div>
                    <div className="text-[21px] font-semibold text-[#0071e3]">{count.toLocaleString()}</div>
                  </div>
                  <div className="h-2 bg-[#e8e8ed] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#0071e3] rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};
