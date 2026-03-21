import React, { useEffect, useState } from 'react';
import { loadData } from '../data/loader';
import { getPublisherStats } from '../data/parser';
import { PageLayout } from '../components/PageLayout';

export const PublishersPage: React.FC = () => {
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

  const publisherStats = getPublisherStats(records);
  const maxCount = publisherStats[0]?.[1] || 1;

  return (
    <PageLayout icon="🏢" title="出版商" subtitle={`共 ${publisherStats.length} 家出版商`}>
      <div className="space-y-2">
        {publisherStats.map(([publisher, count], i) => {
          const percentage = (count / maxCount) * 100;
          return (
            <div
              key={publisher}
              className="flex items-center gap-4 bg-white border border-slate-200 rounded-lg p-4"
            >
              <span className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-sm font-bold text-slate-500">
                {i + 1}
              </span>
              <span className="flex-1 font-medium text-slate-900 truncate" title={publisher}>{publisher}</span>
              <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden hidden sm:block">
                <div
                  className="h-full bg-rose-500 rounded-full"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-rose-500 font-bold text-lg">{count.toLocaleString()}</span>
              <span className="text-slate-400">篇</span>
            </div>
          );
        })}
      </div>
    </PageLayout>
  );
};
