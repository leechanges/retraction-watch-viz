import React from 'react';
import { useAppStore } from '../store';
import { ChartsGrid } from './charts/Charts';

export const TabBar: React.FC = () => {
  const { activeTab, setActiveTab } = useAppStore();

  const tabs = [
    { id: 'dashboard', label: '📊 Dashboard', },
    { id: 'leaderboard', label: '🏆 Leaderboard', },
    { id: 'database', label: '📁 Database', },
  ] as const;

  return (
    <div className="flex items-center px-4 gap-0.5 border-b border-[#1e2d4a] bg-[#0b1120] shrink-0">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`px-4 py-2.5 text-xs font-medium transition-colors border-b-2 ${
            activeTab === tab.id
              ? 'text-[#00D4AA] border-[#00D4AA]'
              : 'text-[#94a3b8] border-transparent hover:text-[#e2e8f0]'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export const TabContent: React.FC = () => {
  const { activeTab, filteredData, setSelectedRecord } = useAppStore();

  if (activeTab === 'dashboard') {
    return <ChartsGrid />;
  }

  if (activeTab === 'leaderboard') {
    // 按机构统计
    const instStats: Record<string, { count: number; fraud: number }> = {};
    filteredData.forEach(d => {
      if (!instStats[d.institution]) {
        instStats[d.institution] = { count: 0, fraud: 0 };
      }
      instStats[d.institution].count++;
      if (d.reason === 'Fraud') instStats[d.institution].fraud++;
    });

    const leaderboard = Object.entries(instStats)
      .map(([name, stats]) => ({
        name,
        ...stats,
        fraudRate: ((stats.fraud / stats.count) * 100).toFixed(1)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

    return (
      <div className="flex-1 overflow-auto p-2.5">
        <div className="bg-[#101828] border border-[#1e2d4a] rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-[#162035]">
                <th className="px-3 py-2 text-left text-[10px] font-semibold text-[#64748b] uppercase tracking-wider">#</th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold text-[#64748b] uppercase tracking-wider">Institution</th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold text-[#64748b] uppercase tracking-wider">Retractions</th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold text-[#64748b] uppercase tracking-wider">Fraud Rate</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((item, i) => (
                <tr 
                  key={item.name} 
                  className="border-t border-[#1e2d4a] hover:bg-[#0f1629] cursor-pointer transition-colors"
                  onClick={() => {
                    const record = filteredData.find(d => d.institution === item.name);
                    if (record) setSelectedRecord(record);
                  }}
                >
                  <td className="px-3 py-2">
                    <span className={`w-6 h-6 inline-flex items-center justify-center rounded-full text-[10px] font-mono ${
                      i === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-black font-bold' :
                      i === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-black font-bold' :
                      i === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-white font-bold' :
                      'bg-[#0f1629] text-[#94a3b8]'
                    }`}>
                      {i + 1}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs font-medium">{item.name}</td>
                  <td className="px-3 py-2 text-xs font-mono text-[#00D4AA] font-bold">{item.count}</td>
                  <td className="px-3 py-2 text-xs font-mono text-[#FF3B5C]">{item.fraudRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (activeTab === 'database') {
    return (
      <div className="flex-1 overflow-auto p-2.5">
        <div className="bg-[#101828] border border-[#1e2d4a] rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-[#162035]">
                <th className="px-3 py-2 text-left text-[10px] font-semibold text-[#64748b] uppercase tracking-wider">Title</th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold text-[#64748b] uppercase tracking-wider">Author</th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold text-[#64748b] uppercase tracking-wider">Journal</th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold text-[#64748b] uppercase tracking-wider">Reason</th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold text-[#64748b] uppercase tracking-wider">Year</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.slice(0, 50).map(record => (
                <tr 
                  key={record.id}
                  className="border-t border-[#1e2d4a] hover:bg-[#0f1629] cursor-pointer transition-colors"
                  onClick={() => setSelectedRecord(record)}
                >
                  <td className="px-3 py-2 text-xs max-w-xs truncate">{record.title}</td>
                  <td className="px-3 py-2 text-xs text-[#94a3b8]">{record.author.split(',')[0]}</td>
                  <td className="px-3 py-2 text-xs">{record.journal}</td>
                  <td className="px-3 py-2 text-xs">
                    <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] ${
                      record.reason === 'Fraud' ? 'bg-[rgba(255,59,92,0.15)] text-[#FF3B5C]' :
                      record.reason === 'Error' ? 'bg-[rgba(255,193,7,0.15)] text-[#FFC107]' :
                      'bg-[rgba(96,125,139,0.15)] text-[#90A4AE]'
                    }`}>
                      {record.reason}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs font-mono">{record.year}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return null;
};
