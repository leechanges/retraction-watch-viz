import React, { useState, useEffect } from 'react';

export const Header: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="flex items-center px-5 h-14 bg-[rgba(6,9,20,0.95)] border-b border-[#1e2d4a] backdrop-blur-xl z-100 gap-4 shrink-0">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 bg-gradient-to-br from-[#00D4AA] to-[#00a882] rounded-md flex items-center justify-center text-sm">
          📊
        </div>
        <div>
          <div className="text-base font-extrabold bg-gradient-to-r from-[#00D4AA] to-[#7dd3c0] bg-clip-text text-transparent tracking-wide">
            RetractionWatch Viz
          </div>
          <div className="text-[10px] text-[#64748b] tracking-[1px] uppercase font-mono">
            学术撤稿智能监测平台
          </div>
        </div>
      </div>
      <div className="flex-1" />
      <div className="flex items-center gap-1.5 text-[11px] text-[#94a3b8] font-mono">
        <span className="w-1.5 h-1.5 bg-[#FF3B5C] rounded-full animate-pulse" />
        <span>LIVE DATA</span>
      </div>
      <div className="px-2.5 py-1 text-[11px] text-[#94a3b8] font-mono bg-[#0b1120] border border-[#1e2d4a] rounded-md">
        {time.toLocaleTimeString('zh-CN', { hour12: false })}
      </div>
    </header>
  );
};
