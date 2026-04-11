import type { RetractionRecord, FilterState } from '../lib/types';
import { splitMulti } from './data';

export function applyFilters(records: RetractionRecord[], filters: FilterState): RetractionRecord[] {
  return records.filter(item => {
    if (filters.year !== '全部' && !item.RetractionDate?.startsWith(filters.year)) return false;
    if (filters.nature !== '全部' && item.RetractionNature !== filters.nature) return false;
    if (filters.country !== '全部' && !splitMulti(item.Country).includes(filters.country)) return false;
    if (filters.subject !== '全部' && !splitMulti(item.Subject).some(s => s.includes(filters.subject))) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (
        !(item.Title?.toLowerCase().includes(q)) &&
        !(item.Author?.toLowerCase().includes(q)) &&
        !(item.Journal?.toLowerCase().includes(q)) &&
        !(item.DOI?.toLowerCase().includes(q)) &&
        !(item.Reason?.toLowerCase().includes(q))
      ) return false;
    }
    return true;
  });
}

export interface FilteredStats {
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

export function computeStats(records: RetractionRecord[]): FilteredStats {
  const counts = <T>(arr: T[]): Map<T, number> => {
    const m = new Map<T, number>();
    for (const v of arr) m.set(v, (m.get(v) ?? 0) + 1);
    return m;
  };

  const sortDesc = <T>(m: Map<T, number>): [T, number][] =>
    [...m.entries()].sort((a, b) => b[1] - a[1]);

  const yearRecords = records.map(r => r.RetractionDate?.slice(0, 4)).filter(Boolean) as string[];
  const countryRecords = records.flatMap(r => splitMulti(r.Country).filter(Boolean)) as string[];
  const subjectRecords = records.flatMap(r => splitMulti(r.Subject).filter(Boolean)) as string[];
  const reasonRecords = records.flatMap(r => splitMulti(r.Reason).filter(Boolean)) as string[];
  const journalRecords = records.map(r => r.Journal).filter(Boolean) as string[];
  const institutionRecords = records.map(r => r.Institution).filter(Boolean) as string[];
  const natureRecords = records.map(r => r.RetractionNature).filter(Boolean) as string[];

  return {
    total: records.length,
    uniqueCountries: new Set(countryRecords).size,
    uniqueJournals: new Set(journalRecords).size,
    years: sortDesc(counts(yearRecords)),
    countries: sortDesc(counts(countryRecords)),
    subjects: sortDesc(counts(subjectRecords)),
    reasons: sortDesc(counts(reasonRecords)),
    journals: sortDesc(counts(journalRecords)),
    institutions: sortDesc(counts(institutionRecords)),
    natures: sortDesc(counts(natureRecords)),
  };
}
