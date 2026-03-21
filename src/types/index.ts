export interface RetractionRecord {
  id: number;
  title: string;
  authors: string;
  journal: string;
  institution: string;
  country: string;
  publicationYear: number;
  retractionYear: number;
  citationCount: number;
  reason: 'Fraud' | 'Error' | 'Plagiarism' | 'Duplicate' | 'Ethics' | 'Other';
  impact: 'High' | 'Medium' | 'Low';
  subject: string;
  pubmedId: string;
  doi: string;
}

export interface FilterState {
  years: number[];
  reasons: string[];
  countries: string[];
  journals: string[];
  institutions: string[];
  subjects: string[];
  impacts: string[];
}

export interface KPIStats {
  total: number;
  retractionRate: number;
  fraudCount: number;
  journalCount: number;
  institutionCount: number;
  monthlyNew: number;
}
