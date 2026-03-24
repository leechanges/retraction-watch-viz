import { AlertTriangle, Search } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSearchSubmit: () => void;
}

export default function Header({ searchQuery, onSearchChange, onSearchSubmit }: HeaderProps) {
  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 bg-gradient-to-br from-rose-500/20 to-blue-500/20 border border-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-lg shadow-rose-500/10">
            <AlertTriangle className="w-6 h-6 text-rose-400" />
          </div>
          <div className="absolute -inset-1 bg-gradient-to-r from-rose-500/30 to-blue-500/30 rounded-2xl blur-sm -z-10" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight leading-tight">
            学术诚信撤稿监测
            <span className="ml-2 text-xs font-mono text-slate-500 align-top">PRO</span>
          </h1>
          <p className="text-[11px] text-slate-500 mt-0.5 tracking-widest font-mono uppercase">
            Retraction Watch · Professional Intelligence Dashboard
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            className="w-full bg-white/5 hover:bg-white/10 border border-white/10 focus:border-rose-500/50 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 outline-none transition-all duration-200"
            placeholder="搜索论文、作者、DOI、期刊..."
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && onSearchSubmit()}
          />
        </div>
      </div>
    </header>
  );
}
