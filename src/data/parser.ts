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
  
  const records: RetractionRecord[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    
    // Parse CSV line properly
    const values: string[] = [];
    let inQuotes = false;
    let fieldStart = 0;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(line.slice(fieldStart, j).trim().replace(/^"|"$/g, ''));
        fieldStart = j + 1;
      }
    }
    // Last field
    values.push(line.slice(fieldStart).trim().replace(/^"|"$/g, ''));
    
    const getValue = (idx: number): string => values[idx] || '';
    
    const id = parseInt(getValue(0)) || 0;
    if (id === 0) continue;
    
    records.push({
      id,
      title: getValue(1) || '',
      subjects: parseMultiValue(getValue(2)),
      institution: getValue(3) || '',
      journal: getValue(4) || '',
      publisher: getValue(5) || '',
      country: getValue(6) || '',
      authors: parseMultiValue(getValue(7)),
      retractionDate: parseDate(getValue(10)),
      originalPaperDate: parseDate(getValue(13)),
      retractionNature: getValue(15) || '',
      reasons: parseMultiValue(getValue(16)),
      paywalled: getValue(17) === 'Yes',
    });
  }
  
  return records;
}

export function getCountryStats(records: RetractionRecord[]) {
  const map: Record<string, number> = {};
  records.forEach(r => {
    // Split multi-country entries (e.g., "China;United States")
    const countries = r.country.split(';').map(c => c.trim()).filter(c => c && c.length < 50);
    countries.forEach(c => {
      map[c] = (map[c] || 0) + 1;
    });
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

export function getNatureStats(records: RetractionRecord[]) {
  const map: Record<string, number> = {};
  records.forEach(r => {
    if (r.retractionNature) map[r.retractionNature] = (map[r.retractionNature] || 0) + 1;
  });
  return Object.entries(map).sort((a, b) => b[1] - a[1]);
}

// Export data for testing
export function getUniqueCountryCount(records: RetractionRecord[]): number {
  const countries = new Set<string>();
  records.forEach(r => {
    r.country.split(';').map(c => c.trim()).filter(c => c && c.length < 50).forEach(c => countries.add(c));
  });
  return countries.size;
}
