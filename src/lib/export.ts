import type { RetractionRecord, FilterState } from './types';

/**
 * Convert filtered data to CSV string
 */
export function toCSV(records: RetractionRecord[]): string {
  if (records.length === 0) return '';

  const headers = [
    'Record ID', 'DOI', 'Title', 'Subject', 'Institution',
    'Journal', 'Publisher', 'Country', 'Author', 'ArticleType',
    'RetractionDate', 'OriginalPaperDate', 'RetractionNature', 'Reason', 'Paywalled'
  ];

  const rows = records.map(r => [
    r['Record ID'],
    r['DOI'],
    `"${(r['Title'] || '').replace(/"/g, '""')}"`,
    r['Subject'],
    `"${(r['Institution'] || '').replace(/"/g, '""')}"`,
    r['Journal'],
    r['Publisher'],
    r['Country'],
    `"${(r['Author'] || '').replace(/"/g, '""')}"`,
    r['ArticleType'],
    r['RetractionDate'],
    r['OriginalPaperDate'],
    r['RetractionNature'],
    `"${(r['Reason'] || '').replace(/"/g, '""')}"`,
    r['Paywalled'],
  ].join(','));

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Convert filtered data to JSON string
 */
export function toJSON(records: RetractionRecord[]): string {
  return JSON.stringify(records, null, 2);
}

/**
 * Download string as file
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Apply filters to records (same logic as RetractionTable)
 */
export function applyFilters(
  records: RetractionRecord[],
  filters: FilterState
): RetractionRecord[] {
  return records.filter(record => {
    if (filters.year !== '全部' && !record.RetractionDate.includes(filters.year)) return false;
    if (filters.nature !== '全部' && record.RetractionNature !== filters.nature) return false;
    if (filters.country !== '全部' && record.Country !== filters.country) return false;
    if (filters.subject !== '全部' && record.Subject !== filters.subject) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const match =
        record.Title?.toLowerCase().includes(q) ||
        record.Author?.toLowerCase().includes(q) ||
        record.DOI?.toLowerCase().includes(q) ||
        record.Journal?.toLowerCase().includes(q) ||
        record.Institution?.toLowerCase().includes(q) ||
        record.Reason?.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });
}

/**
 * Export filtered data as CSV
 */
export function exportCSV(records: RetractionRecord[], filters: FilterState, filename = 'retraction_data'): void {
  const filtered = applyFilters(records, filters);
  const csv = toCSV(filtered);
  const ts = new Date().toISOString().slice(0, 10);
  downloadFile(csv, `${filename}_${ts}.csv`, 'text/csv;charset=utf-8');
}

/**
 * Export filtered data as JSON
 */
export function exportJSON(records: RetractionRecord[], filters: FilterState, filename = 'retraction_data'): void {
  const filtered = applyFilters(records, filters);
  const json = toJSON(filtered);
  const ts = new Date().toISOString().slice(0, 10);
  downloadFile(json, `${filename}_${ts}.json`, 'application/json');
}
