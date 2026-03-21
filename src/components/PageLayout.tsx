import React from 'react';
import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface PageLayoutProps {
  icon: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}

const navLinks = [
  { to: '/', label: '首页' },
  { to: '/countries', label: '国家' },
  { to: '/journals', label: '期刊' },
  { to: '/institutions', label: '机构' },
  { to: '/years', label: '年份' },
  { to: '/reasons', label: '原因' },
  { to: '/publishers', label: '出版商' },
];

export const PageLayout: React.FC<PageLayoutProps> = ({ icon, title, subtitle, children }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-slate-900 text-white sticky top-0 z-50 shadow-md">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <span className="text-2xl">{icon}</span>
                <div>
                  <div className="text-xl font-bold">{title}</div>
                  <div className="text-xs text-slate-400">{subtitle}</div>
                </div>
              </Link>
            </div>
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    location.pathname === link.to
                      ? 'bg-rose-500 text-white'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile nav */}
      <div className="md:hidden bg-slate-800 text-white overflow-x-auto">
        <div className="flex px-4 py-2 gap-1">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-3 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors ${
                location.pathname === link.to
                  ? 'bg-rose-500 text-white'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
};
