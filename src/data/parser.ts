export interface RetractionRecord {
  id: number;
  title: string;
  subjects: string[];
  institution: string;
  journal: string;
  publisher: string;
  country: string;
  authors: string[];
  retractionDate: string;
  originalPaperDate: string;
  retractionNature: string;
  reasons: string[];
  paywalled: boolean;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function parseDate(dateStr: string): string {
  if (!dateStr || dateStr === '0:00') return '';
  const parts = dateStr.split(' ')[0].split('/');
  if (parts.length === 3) {
    const [month, day, year] = parts;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  return dateStr;
}

function parseMultiValue(str: string): string[] {
  if (!str) return [];
  return str.split(';').map(s => s.trim()).filter(Boolean);
}

export function parseCSV(csvContent: string): RetractionRecord[] {
  const lines = csvContent.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];
  
  const headers = parseCSVLine(lines[0]);
  const records: RetractionRecord[] = [];
  
  for (let i = 1; i < Math.min(lines.length, 10000); i++) {
    const values = parseCSVLine(lines[i]);
    const row: Record<string, string> = {};
    headers.forEach((header, idx) => {
      row[header] = values[idx] || '';
    });
    
    const id = parseInt(row['Record ID']) || 0;
    if (id === 0) continue;
    
    records.push({
      id,
      title: row['Title'] || '',
      subjects: parseMultiValue(row['Subject']),
      institution: row['Institution'] || '',
      journal: row['Journal'] || '',
      publisher: row['Publisher'] || '',
      country: row['Country'] || '',
      authors: parseMultiValue(row['Author']),
      retractionDate: parseDate(row['RetractionDate']),
      originalPaperDate: parseDate(row['OriginalPaperDate']),
      retractionNature: row['RetractionNature'] || '',
      reasons: parseMultiValue(row['Reason']),
      paywalled: row['Paywalled'] === 'Yes',
    });
  }
  
  return records;
}

export function getCountryStats(records: RetractionRecord[]) {
  const map: Record<string, number> = {};
  records.forEach(r => {
    if (r.country) map[r.country] = (map[r.country] || 0) + 1;
  });
  return Object.entries(map).sort((a, b) => b[1] - a[1]);
}

export function getJournalStats(records: RetractionRecord[]) {
  const map: Record<string, number> = {};
  records.forEach(r => {
    if (r.journal) map[r.journal] = (map[r.journal] || 0) + 1;
  });
  return Object.entries(map).sort((a, b) => b[1] - a[1]);
}

export function getYearStats(records: RetractionRecord[]) {
  const map: Record<number, number> = {};
  records.forEach(r => {
    const year = new Date(r.retractionDate).getFullYear();
    if (year && year > 1900 && year < 2100) {
      map[year] = (map[year] || 0) + 1;
    }
  });
  return Object.entries(map).map(([year, count]) => ({ year: Number(year), count }))
    .sort((a, b) => a.year - b.year);
}

export function getReasonStats(records: RetractionRecord[]) {
  const map: Record<string, number> = {};
  records.forEach(r => {
    r.reasons.forEach(reason => {
      if (reason) map[reason] = (map[reason] || 0) + 1;
    });
  });
  return Object.entries(map).sort((a, b) => b[1] - a[1]);
}

export function getInstitutionStats(records: RetractionRecord[]) {
  const map: Record<string, number> = {};
  records.forEach(r => {
    if (r.institution) map[r.institution] = (map[r.institution] || 0) + 1;
  });
  return Object.entries(map).sort((a, b) => b[1] - a[1]);
}

export function getPublisherStats(records: RetractionRecord[]) {
  const map: Record<string, number> = {};
  records.forEach(r => {
    if (r.publisher) map[r.publisher] = (map[r.publisher] || 0) + 1;
  });
  return Object.entries(map).sort((a, b) => b[1] - a[1]);
}

export function getSubjectStats(records: RetractionRecord[]) {
  const map: Record<string, number> = {};
  records.forEach(r => {
    r.subjects.forEach(subject => {
      if (subject) map[subject] = (map[subject] || 0) + 1;
    });
  });
  return Object.entries(map).sort((a, b) => b[1] - a[1]);
}
