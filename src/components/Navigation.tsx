import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

export const Navigation: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: '概览', path: '/' },
    { label: '国家', path: '/countries' },
    { label: '期刊', path: '/journals' },
    { label: '机构', path: '/institutions' },
    { label: '年份', path: '/years' },
    { label: '撤稿原因', path: '/reasons' },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-[rgba(255,255,255,0.8)] backdrop-blur-xl border-b border-[#d2d2d7]' : 'bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl">📊</span>
          <span className="font-semibold text-[15px]">RetractionWatch</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`text-[13px] transition-opacity ${
                location.pathname === item.path 
                  ? 'text-[#0071e3]' 
                  : 'text-[#1d1d1f] opacity-80 hover:opacity-100'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-[#d2d2d7]">
          <div className="px-6 py-4 space-y-3">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className="block text-[15px] py-2"
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};
