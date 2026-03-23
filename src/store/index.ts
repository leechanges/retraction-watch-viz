import { create } from 'zustand';
import type { RetractionRecord } from '../data/parser';

interface FilterState {
  year: string;
  nature: string;
  country: string;
  subject: string;
  reason: string;
  search: string;
  page: number;
  sortKey: keyof RetractionRecord | '';
  sortDir: 'asc' | 'desc';
}

interface AppStore {
  allData: RetractionRecord[];
  filteredData: RetractionRecord[];
  loading: boolean;
  filters: FilterState;
  setAllData: (data: RetractionRecord[]) => void;
  setLoading: (v: boolean) => void;
  setFilter: (key: keyof FilterState, value: string) => void;
  resetFilters: () => void;
  setPage: (p: number) => void;
  setSort: (key: keyof RetractionRecord | '', dir: 'asc' | 'desc') => void;
}

const defaultFilters: FilterState = {
  year: '全部',
  nature: '全部',
  country: '全部',
  subject: '全部',
  reason: '全部',
  search: '',
  page: 1,
  sortKey: 'retractionDate',
  sortDir: 'desc',
};

function applyFilters(data: RetractionRecord[], filters: FilterState): RetractionRecord[] {
  return data.filter(item => {
    const year = item.retractionDate?.split('-')[0] || '';
    if (filters.year !== '全部' && year !== filters.year) return false;
    if (filters.nature !== '全部' && item.retractionNature !== filters.nature) return false;
    if (filters.country !== '全部' && !item.country.includes(filters.country)) return false;
    if (filters.subject !== '全部' && !item.subjects.some(s => s.includes(filters.subject))) return false;
    if (filters.reason !== '全部' && !item.reasons.some(r => r.includes(filters.reason))) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (!item.title.toLowerCase().includes(q) &&
          !item.authors.some((a: string) => a.toLowerCase().includes(q)) &&
          !item.journal.toLowerCase().includes(q)) return false;
    }
    return true;
  });
}

export const useAppStore = create<AppStore>((set, get) => ({
  allData: [],
  filteredData: [],
  loading: true,
  filters: { ...defaultFilters },
  setAllData: (data) => {
    const filtered = applyFilters(data, get().filters);
    set({ allData: data, filteredData: filtered });
  },
  setLoading: (v) => set({ loading: v }),
  setFilter: (key, value) => {
    const newFilters = { ...get().filters, [key]: value, page: key === 'page' ? get().filters.page : 1 };
    const filtered = applyFilters(get().allData, newFilters);
    set({ filters: newFilters, filteredData: filtered });
  },
  resetFilters: () => {
    const filtered = applyFilters(get().allData, defaultFilters);
    set({ filters: { ...defaultFilters }, filteredData: filtered });
  },
  setPage: (p) => {
    set({ filters: { ...get().filters, page: p } });
  },
  setSort: (key, dir) => {
    set({ filters: { ...get().filters, sortKey: key, sortDir: dir } });
  },
}));
