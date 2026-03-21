import React from 'react';
import { Header } from './components/Header';
import { KPIBar } from './components/KPIBar';
import { Sidebar } from './components/Sidebar';
import { TabBar, TabContent } from './components/TabContent';
import { useAppStore } from './store';

const Drawer: React.FC = () => {
  const { selectedRecord, setSelectedRecord } = useAppStore();

  if (!selectedRecord) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 z-200"
        onClick={() => setSelectedRecord(null)}
      />
      <div className="fixed top-0 right-0 bottom-0 w-80 bg-[#0b1120] border-l border-[#1e2d4a] z-201 flex flex-col overflow-hidden animate-slide-in">
        <div className="flex items-center justify-between p-4 border-b border-[#1e2d4a]">
          <div className="text-sm font-bold text-[#e2e8f0]">Record Details</div>
          <button 
            onClick={() => setSelectedRecord(null)}
            className="text-[#94a3b8] hover:text-[#FF3B5C] text-lg"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="mb-4">
            <div className="text-[10px] text-[#64748b] uppercase tracking-wider font-mono mb-1">Title</div>
            <div className="text-sm text-[#e2e8f0] leading-relaxed">{selectedRecord.title}</div>
          </div>
          
          <div className="mb-4">
            <div className="text-[10px] text-[#64748b] uppercase tracking-wider font-mono mb-1">Authors</div>
            <div className="text-xs text-[#94a3b8]">{selectedRecord.author}</div>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="bg-[#101828] border border-[#1e2d4a] rounded-md p-2">
              <div className="text-[9px] text-[#64748b] uppercase">Journal</div>
              <div className="text-xs font-medium">{selectedRecord.journal}</div>
            </div>
            <div className="bg-[#101828] border border-[#1e2d4a] rounded-md p-2">
              <div className="text-[9px] text-[#64748b] uppercase">Year</div>
              <div className="text-xs font-mono">{selectedRecord.year}</div>
            </div>
            <div className="bg-[#101828] border border-[#1e2d4a] rounded-md p-2">
              <div className="text-[9px] text-[#64748b] uppercase">Country</div>
              <div className="text-xs">{selectedRecord.flag} {selectedRecord.country}</div>
            </div>
            <div className="bg-[#101828] border border-[#1e2d4a] rounded-md p-2">
              <div className="text-[9px] text-[#64748b] uppercase">Citations</div>
              <div className="text-xs font-mono">{selectedRecord.citations}</div>
            </div>
          </div>

          <div className="mb-4">
            <div className="text-[10px] text-[#64748b] uppercase tracking-wider font-mono mb-1">Institution</div>
            <div className="text-xs text-[#94a3b8]">{selectedRecord.institution}</div>
          </div>

          <div className="mb-4">
            <div className="text-[10px] text-[#64748b] uppercase tracking-wider font-mono mb-1">Reason</div>
            <span className={`inline-block px-2 py-1 rounded text-xs ${
              selectedRecord.reason === 'Fraud' 
                ? 'bg-[rgba(255,59,92,0.15)] text-[#FF3B5C] border border-[rgba(255,59,92,0.3)]'
                : 'bg-[rgba(96,125,139,0.15)] text-[#90A4AE] border border-[rgba(96,125,139,0.3)]'
            }`}>
              {selectedRecord.reason}
            </span>
          </div>

          <div className="mb-4">
            <div className="text-[10px] text-[#64748b] uppercase tracking-wider font-mono mb-1">Field</div>
            <div className="text-xs text-[#94a3b8]">{selectedRecord.field}</div>
          </div>

          <div className="mb-4">
            <div className="text-[10px] text-[#64748b] uppercase tracking-wider font-mono mb-1">DOI</div>
            <div className="text-xs font-mono text-[#00D4AA]">{selectedRecord.doi}</div>
          </div>

          <div>
            <div className="text-[10px] text-[#64748b] uppercase tracking-wider font-mono mb-1">PMID</div>
            <div className="text-xs font-mono text-[#94a3b8]">{selectedRecord.pmid}</div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes slide-in {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

function App() {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header />
      <KPIBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          <TabBar />
          <TabContent />
        </main>
      </div>
      <Drawer />
    </div>
  );
}

export default App;
