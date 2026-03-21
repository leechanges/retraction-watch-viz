import { parseCSV } from './parser';
import type { RetractionRecord } from './parser';
import rawData from './retraction_watch.csv?raw';

let cachedRecords: RetractionRecord[] | null = null;

export async function loadData(): Promise<RetractionRecord[]> {
  if (cachedRecords) return cachedRecords;
  
  try {
    cachedRecords = parseCSV(rawData);
    return cachedRecords;
  } catch (error) {
    console.error('Failed to load data:', error);
    return [];
  }
}

export function getCachedData(): RetractionRecord[] {
  return cachedRecords || [];
}
