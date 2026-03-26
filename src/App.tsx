import { HashRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import GlobalDashboard from './pages/GlobalDashboard';

// Lazy load CountryPage for better performance
const CountryPage = lazy(() => import('./pages/CountryPage'));

// Loading fallback for lazy-loaded routes
function PageLoader() {
  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-5">
          <div className="absolute inset-0 border-2 border-rose-500/20 rounded-full" />
          <div className="absolute inset-0 border-2 border-transparent border-t-rose-500 rounded-full animate-spin" />
        </div>
        <p className="text-slate-400 text-sm font-medium">加载页面中...</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      {/* Skip link for keyboard navigation */}
      <a href="#main-content" className="skip-link">
        跳转到主要内容
      </a>
      
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<GlobalDashboard />} />
          <Route 
            path="/country/:name" 
            element={<CountryPage />} 
          />
        </Routes>
      </Suspense>
    </HashRouter>
  );
}
