import { useEffect, useRef } from 'react';
import { AlertTriangle, Search, Share2, Check } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSearchSubmit: () => void;
}

export default function Header({ searchQuery, onSearchChange, onSearchSubmit }: HeaderProps) {
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // "/" to focus search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape' && document.activeElement === inputRef.current) {
        inputRef.current?.blur();
        onSearchChange('');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onSearchChange]);

  // Share current URL with filters
  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: prompt
      prompt('复制以下链接分享当前筛选状态:', window.location.href);
    }
  };

  return (
    <header
      className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6"
      role="banner"
    >
      <div className="flex items-center gap-4">
        <div className="relative">
          <div
            className="w-12 h-12 bg-gradient-to-br from-rose-500/20 to-purple-500/20 border border-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-lg"
            role="img"
            aria-label="学术诚信图标"
          >
            <AlertTriangle className="w-6 h-6 text-rose-400" aria-hidden="true" />
          </div>
          <div className="absolute -inset-1 bg-gradient-to-r from-rose-500/20 to-purple-500/20 rounded-2xl blur-sm -z-10 opacity-60" aria-hidden="true" />
        </div>

        <div>
          <h1 className="text-2xl font-black text-white tracking-tight leading-tight flex items-center gap-2">
            学术诚信撤稿监测
            <span className="text-[10px] font-mono text-slate-500 tracking-widest align-top mt-1.5">PRO</span>
          </h1>
          <p className="text-[11px] text-slate-500 mt-0.5 tracking-widest font-mono uppercase">
            Retraction Watch · Professional Intelligence Dashboard
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Share button */}
        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/15 rounded-xl transition-all"
          aria-label="分享当前筛选状态"
          title="复制链接分享当前筛选"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">已复制</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5" />
              <span>分享</span>
            </>
          )}
        </button>

        {/* Search */}
        <div className="relative flex-1 md:w-72">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"
            aria-hidden="true"
          />
          <input
            ref={inputRef}
            type="search"
            role="searchbox"
            aria-label="搜索论文、作者、DOI、期刊"
            aria-placeholder="搜索论文、作者、DOI、期刊..."
            className="w-full bg-white/5 hover:bg-white/[0.08] border border-white/10 focus:border-rose-500/50 rounded-xl pl-9 pr-16 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 outline-none transition-all duration-200"
            placeholder="搜索论文、作者、DOI、期刊..."
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && onSearchSubmit()}
          />
          {/* Keyboard hint */}
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:inline-flex items-center justify-center w-5 h-5 bg-white/10 border border-white/15 rounded text-[10px] text-slate-500 font-mono pointer-events-none">
            /
          </kbd>
        </div>
      </div>
    </header>
  );
}
