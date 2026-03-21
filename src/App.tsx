import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { HomePage } from './pages/HomePage';
import { CountriesPage } from './pages/CountriesPage';
import { CountryDetailPage } from './pages/CountryDetailPage';
import { JournalsPage } from './pages/JournalsPage';
import { JournalDetailPage } from './pages/JournalDetailPage';
import { InstitutionsPage } from './pages/InstitutionsPage';
import { YearsPage } from './pages/YearsPage';
import { ReasonsPage } from './pages/ReasonsPage';
import { PublishersPage } from './pages/PublishersPage';

function App() {
  return (
    <BrowserRouter>
      <Navigation />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/countries" element={<CountriesPage />} />
        <Route path="/country/:country" element={<CountryDetailPage />} />
        <Route path="/journals" element={<JournalsPage />} />
        <Route path="/journal/:journal" element={<JournalDetailPage />} />
        <Route path="/institutions" element={<InstitutionsPage />} />
        <Route path="/years" element={<YearsPage />} />
        <Route path="/reasons" element={<ReasonsPage />} />
        <Route path="/publishers" element={<PublishersPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
