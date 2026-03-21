import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { loadData } from '../data/loader';
import { getJournalStats } from '../data/parser';
import { PageLayout } from '../components/PageLayout';
import type { RetractionRecord } from '../data/parser';

export const JournalsPage: React.FC = () => {
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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const journalStats = getJournalStats(records);
  const maxCount = journalStats[0]?.[1] || 1;

  return (
    <PageLayout icon="📚" title="学术期刊" subtitle={`共 ${journalStats.length} 种期刊`}>
      <div className="space-y-2">
        {journalStats.map(([journal, count], i) => {
          const percentage = (count / maxCount) * 100;
          return (
            <Link
              key={journal}
              to={`/journal/${encodeURIComponent(journal)}`}
              className="flex items-center gap-4 bg-white border border-slate-200 rounded-lg p-4 hover:border-rose-300 hover:shadow-sm transition-all"
            >
              <span className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-sm font-bold text-slate-500">
                {i + 1}
              </span>
              <span className="flex-1 font-medium text-slate-900 truncate" title={journal}>{journal}</span>
              <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden hidden sm:block">
                <div
                  className="h-full bg-rose-500 rounded-full"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-rose-500 font-bold text-lg">{count.toLocaleString()}</span>
              <span className="text-slate-400">篇</span>
            </Link>
          );
        })}
      </div>
    </PageLayout>
  );
};
