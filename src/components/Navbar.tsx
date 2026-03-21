import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface DropdownItem {
  label: string;
  path: string;
  icon: string;
  description: string;
}

const modules: Record<string, { items: DropdownItem[] }> = {
  '国家/地区': {
    items: [
      { label: '美国', path: '/country/United States', icon: '🇺🇸', description: '撤稿数量最多的国家' },
      { label: '中国', path: '/country/China', icon: '🇨🇳', description: '快速增长趋势' },
      { label: '德国', path: '/country/Germany', icon: '🇩🇪', description: '高质量科研产出' },
      { label: '日本', path: '/country/Japan', icon: '🇯🇵', description: '学术诚信监测' },
    ]
  },
  '期刊': {
    items: [
      { label: 'Nature 系列', path: '/journal/Nature', icon: '📚', description: '顶级综合期刊' },
      { label: 'Science 系列', path: '/journal/Science', icon: '🔬', description: '顶级综合期刊' },
      { label: 'Cell 系列', path: '/journal/Cell', icon: '🧬', description: '生命科学顶刊' },
      { label: '医学期刊', path: '/journal/Medical', icon: '⚕️', description: '医学研究期刊' },
    ]
  },
  '机构': {
    items: [
      { label: '顶尖大学', path: '/institution/Top', icon: '🏛', description: '世界顶尖研究机构' },
      { label: '研究机构', path: '/institution/Research', icon: '🔬', description: '专业研究机构' },
      { label: '医院系统', path: '/institution/Hospital', icon: '🏥', description: '医疗研究机构' },
    ]
  },
  '年份': {
    items: [
      { label: '2024年', path: '/year/2024', icon: '📅', description: '最新撤稿数据' },
      { label: '近5年', path: '/year/Recent', icon: '📊', description: '趋势分析' },
      { label: '2010-2020', path: '/year/2010s', icon: '📈', description: '历史数据' },
    ]
  },
  '学科': {
    items: [
      { label: '医学', path: '/field/Medicine', icon: '⚕️', description: '医学研究领域' },
      { label: '生物学', path: '/field/Biology', icon: '🧬', description: '生命科学领域' },
      { label: '化学', path: '/field/Chemistry', icon: '⚗️', description: '化学研究领域' },
      { label: '物理学', path: '/field/Physics', icon: '⚛️', description: '物理研究领域' },
    ]
  }
};

export const Navbar: React.FC = () => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center h-14">
          <Link to="/" className="flex items-center gap-2 mr-8">
            <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm">
              📊
            </div>
            <div>
              <div className="text-sm font-bold text-slate-800">RetractionWatch</div>
              <div className="text-[10px] text-slate-500 -mt-0.5">学术撤稿智能监测平台</div>
            </div>
          </Link>

          <div className="flex items-center gap-1">
            <Link 
              to="/" 
              className={`px-3 py-2 text-sm rounded-md transition-colors ${
                isActive('/') 
                  ? 'bg-teal-50 text-teal-700 font-medium' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              首页概览
            </Link>

            {Object.entries(modules).map(([title, { items }]) => (
              <div 
                key={title}
                className="relative"
                onMouseEnter={() => setOpenDropdown(title)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <button 
                  className={`px-3 py-2 text-sm rounded-md transition-colors flex items-center gap-1 ${
                    openDropdown === title 
                      ? 'bg-teal-50 text-teal-700 font-medium' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {title}
                  <svg className={`w-4 h-4 transition-transform ${openDropdown === title ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {openDropdown === title && (
                  <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50 animate-dropdown-enter">
                    {items.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors"
                        onClick={() => setOpenDropdown(null)}
                      >
                        <span className="text-xl">{item.icon}</span>
                        <div>
                          <div className="text-sm font-medium text-slate-800">{item.label}</div>
                          <div className="text-xs text-slate-500">{item.description}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-3">
            <div className="text-xs text-slate-500 font-mono bg-slate-100 px-2.5 py-1.5 rounded-md">
              {new Date().toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
