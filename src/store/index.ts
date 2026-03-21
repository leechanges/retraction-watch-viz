import { create } from 'zustand';
import type { RetractionRecord } from '../data/mockData';
import { MOCK_DATA, getFilterOptions } from '../data/mockData';

interface FilterState {
  years: number[];
  reasons: string[];
  countries: string[];
  journals: string[];
  institutions: string[];
  fields: string[];
}

interface AppState {
  data: RetractionRecord[];
  filteredData: RetractionRecord[];
  filters: FilterState;
  filterOptions: FilterState;
  selectedRecord: RetractionRecord | null;
  activeTab: 'dashboard' | 'leaderboard' | 'database';
  sidebarCollapsed: boolean;
  
  // Actions
  setFilter: (key: keyof FilterState, values: string[] | number[]) => void;
  clearFilters: () => void;
  setSelectedRecord: (record: RetractionRecord | null) => void;
  setActiveTab: (tab: 'dashboard' | 'leaderboard' | 'database') => void;
  toggleSidebar: () => void;
  applyFilters: () => void;
}

const filterData = (data: RetractionRecord[], filters: FilterState): RetractionRecord[] => {
  return data.filter(d => {
    if (filters.years.length > 0 && !filters.years.includes(d.year)) return false;
    if (filters.reasons.length > 0 && !filters.reasons.includes(d.reason)) return false;
    if (filters.countries.length > 0 && !filters.countries.includes(d.country)) return false;
    if (filters.journals.length > 0 && !filters.journals.includes(d.journal)) return false;
    if (filters.institutions.length > 0 && !filters.institutions.includes(d.institution)) return false;
    if (filters.fields.length > 0 && !filters.fields.includes(d.field)) return false;
    return true;
  });
};

export const useAppStore = create<AppState>((set, get) => ({
  data: MOCK_DATA,
  filteredData: MOCK_DATA,
  filters: {
    years: [],
    reasons: [],
    countries: [],
    journals: [],
    institutions: [],
    fields: [],
  },
  filterOptions: getFilterOptions(MOCK_DATA),
  selectedRecord: null,
  activeTab: 'dashboard',
  sidebarCollapsed: false,

  setFilter: (key, values) => {
    const { filters, data } = get();
    const newFilters = { ...filters, [key]: values };
    const filteredData = filterData(data, newFilters);
    set({ filters: newFilters, filteredData });
  },

  clearFilters: () => {
    const { data } = get();
    set({
      filters: { years: [], reasons: [], countries: [], journals: [], institutions: [], fields: [] },
      filteredData: data,
    });
  },

  setSelectedRecord: (record) => set({ selectedRecord: record }),
  
  setActiveTab: (tab) => set({ activeTab: tab }),
  
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  
  applyFilters: () => {
    const { filters, data } = get();
    const filteredData = filterData(data, filters);
    set({ filteredData });
  },
}));
