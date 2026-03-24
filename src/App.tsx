import { HashRouter, Routes, Route } from 'react-router-dom';
import GlobalDashboard from './pages/GlobalDashboard';
import CountryPage from './pages/CountryPage';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<GlobalDashboard />} />
        <Route path="/country/:name" element={<CountryPage />} />
      </Routes>
    </HashRouter>
  );
}
