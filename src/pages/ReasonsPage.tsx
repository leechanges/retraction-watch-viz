import React, { useEffect, useState } from 'react';
import { loadData } from '../data/loader';
import { getReasonStats } from '../data/parser';
import { PageLayout } from '../components/PageLayout';

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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const reasonStats = getReasonStats(records);
  const maxCount = reasonStats[0]?.[1] || 1;

  return (
    <PageLayout icon="⚠️" title="撤稿原因" subtitle={`共 ${reasonStats.length} 种原因类型`}>
      <div className="space-y-2">
        {reasonStats.map(([reason, count], i) => {
          const percentage = (count / maxCount) * 100;
          return (
            <div
              key={reason}
              className="bg-white border border-slate-200 rounded-lg p-4"
            >
              <div className="flex items-center gap-4 mb-2">
                <span className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-sm font-bold text-slate-500">
                  {i + 1}
                </span>
                <span className="flex-1 font-medium text-slate-900">{reason}</span>
                <span className="text-rose-500 font-bold">{count.toLocaleString()}</span>
                <span className="text-slate-400">({percentage.toFixed(1)}%)</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </PageLayout>
  );
};
