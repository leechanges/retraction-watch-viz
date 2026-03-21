import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { CountriesPage } from './pages/CountriesPage';
import { CountryDetailPage } from './pages/CountryDetailPage';
import { JournalsPage } from './pages/JournalsPage';
import { JournalDetailPage } from './pages/JournalDetailPage';
import { InstitutionsPage } from './pages/InstitutionsPage';
import { YearsPage } from './pages/YearsPage';
import { FieldsPage } from './pages/FieldsPage';

function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col h-screen overflow-hidden">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/countries" element={<CountriesPage />} />
          <Route path="/country/:country" element={<CountryDetailPage />} />
          <Route path="/journals" element={<JournalsPage />} />
          <Route path="/journal/:journal" element={<JournalDetailPage />} />
          <Route path="/institutions" element={<InstitutionsPage />} />
          <Route path="/years" element={<YearsPage />} />
          <Route path="/fields" element={<FieldsPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
