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
      result.push(current.trim().replace(/^"|"$/g, ''));
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim().replace(/^"|"$/g, ''));
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

// List of valid countries to filter noise
const VALID_COUNTRIES = new Set([
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda', 'Argentina', 
  'Armenia', 'Australia', 'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 
  'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan', 'Bolivia', 
  'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 
  'Burundi', 'Cabo Verde', 'Cambodia', 'Cameroon', 'Canada', 'Central African Republic', 
  'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo', 'Costa Rica', 
  'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 'Denmark', 'Djibouti', 'Dominica', 
  'Dominican Republic', 'East Timor', 'Ecuador', 'Egypt', 'El Salvador', 
  'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia', 'Fiji', 
  'Finland', 'France', 'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 
  'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana', 
  'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 
  'Iraq', 'Ireland', 'Israel', 'Italy', 'Ivory Coast', 'Jamaica', 'Japan', 
  'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Kosovo', 'Kuwait', 'Kyrgyzstan', 
  'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 
  'Lithuania', 'Luxembourg', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 
  'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 
  'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 
  'Mozambique', 'Myanmar', 'Namibia', 'Nauru', 'Nepal', 'Netherlands', 
  'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Korea', 'North Macedonia', 
  'Norway', 'Oman', 'Pakistan', 'Palau', 'Palestine', 'Panama', 'Papua New Guinea', 
  'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar', 
  'Romania', 'Russia', 'Rwanda', 'Saint Kitts and Nevis', 'Saint Lucia', 
  'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe', 
  'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 
  'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa', 
  'South Korea', 'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 
  'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tajikistan', 'Tanzania', 
  'Thailand', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 
  'Turkmenistan', 'Tuvalu', 'Uganda', 'Ukraine', 'United Arab Emirates', 
  'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan', 'Vanuatu', 
  'Vatican', 'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe',
  // Common variations
  'USA', 'UK', 'UAE', 'PRC'
]);

export function parseCSV(csvContent: string): RetractionRecord[] {
  const lines = csvContent.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];
  
  const headers = parseCSVLine(lines[0]);
  
  // Find column indices
  const colIndex: Record<string, number> = {};
  headers.forEach((h, i) => {
    colIndex[h] = i;
  });
  
  const records: RetractionRecord[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    
    const getValue = (col: string): string => {
      const idx = colIndex[col];
      return idx !== undefined ? (values[idx] || '') : '';
    };
    
    const id = parseInt(getValue('Record ID')) || 0;
    if (id === 0) continue;
    
    const country = getValue('Country').replace(/[;"]/g, '').trim();
    
    // Skip invalid country entries
    if (country && !VALID_COUNTRIES.has(country) && country.length > 30) {
      // Likely garbage data, skip
      continue;
    }
    
    records.push({
      id,
      title: getValue('Title') || '',
      subjects: parseMultiValue(getValue('Subject')),
      institution: getValue('Institution').replace(/[;"]/g, '').trim(),
      journal: getValue('Journal') || '',
      publisher: getValue('Publisher') || '',
      country: country,
      authors: parseMultiValue(getValue('Author')),
      retractionDate: parseDate(getValue('RetractionDate')),
      originalPaperDate: parseDate(getValue('OriginalPaperDate')),
      retractionNature: getValue('RetractionNature') || '',
      reasons: parseMultiValue(getValue('Reason')),
      paywalled: getValue('Paywalled') === 'Yes',
    });
  }
  
  return records;
}

export function getCountryStats(records: RetractionRecord[]) {
  const map: Record<string, number> = {};
  records.forEach(r => {
    if (!r.country) return;
    // Split multi-country entries (e.g. "China;United States") and count each country
    const countries = r.country.split(';').map(c => c.trim()).filter(c => c && c !== 'Unknown');
    countries.forEach(c => {
      if (VALID_COUNTRIES.has(c)) {
        map[c] = (map[c] || 0) + 1;
      }
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

const NOISE_INSTITUTIONS = new Set([
  'Unknown', 'unavailable', 'No affiliation available',
  'N/A', 'None', 'NA', 'Pending', ' undisclosed'
]);

export function getInstitutionStats(records: RetractionRecord[]) {
  const map: Record<string, number> = {};
  records.forEach(r => {
    if (!r.institution) return;
    const inst = r.institution.trim();
    if (!inst || NOISE_INSTITUTIONS.has(inst)) return;
    map[inst] = (map[inst] || 0) + 1;
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
