export interface RetractionRecord {
  'Record ID': number;
  DOI: string;
  Title: string;
  Subject: string;
  Institution: string;
  Journal: string;
  Publisher: string;
  Country: string;
  Author: string;
  ArticleType: string;
  RetractionDate: string;
  OriginalPaperDate: string;
  RetractionNature: string;
  Reason: string;
  Paywalled: string;
}

export interface PrecomputedData {
  total: number;
  uniqueCountries: number;
  uniqueJournals: number;
  years: [string, number][];
  countries: [string, number][];
  subjects: [string, number][];
  reasons: [string, number][];
  journals: [string, number][];
  institutions: [string, number][];
  natures: [string, number][];
}

export interface CountryDetail {
  name: string;
  count: number;
  topJournals: [string, number][];
  topInstitutions: [string, number][];
  topReasons: [string, number][];
  topSubjects: [string, number][];
  yearTrend: [string, number][];
  retractionNatures: [string, number][];
}

export interface FilterState {
  year: string;
  nature: string;
  country: string;
  subject: string;
  search: string;
}
