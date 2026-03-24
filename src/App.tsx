import { BrowserRouter, Routes, Route } from 'react-router-dom';
import GlobalDashboard from './pages/GlobalDashboard';
import CountryPage from './pages/CountryPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<GlobalDashboard />} />
        <Route path="/country/:name" element={<CountryPage />} />
      </Routes>
    </BrowserRouter>
  );
}
