import type { RetractionRecord, PrecomputedData, CountryDetail } from './types';

const BASE = import.meta.env.BASE_URL ?? '/';

export async function fetchPrecomputed(): Promise<PrecomputedData> {
  const res = await fetch(`${BASE}chart-data.json`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<PrecomputedData>;
}

export async function fetchCSV(): Promise<RetractionRecord[]> {
  const res = await fetch(`${BASE}retraction_watch.csv`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const text = await res.text();
  return parseCSV(text);
}

export async function fetchCountryDetail(countryName: string): Promise<CountryDetail> {
  const records = await fetchCSV();
  const filtered = records.filter(r =>
    splitMulti(r.Country).includes(countryName)
  );

  const count = filtered.length;
  const yearTrend = computeYearTrend(filtered);
  const topJournals = computeTop(filtered, 'Journal', 8);
  const topInstitutions = computeTop(filtered, 'Institution', 8);
  const topReasons = computeTopReasons(filtered, 8);
  const topSubjects = computeTopSubjects(filtered, 8);
  const retractionNatures = computeTop(filtered, 'RetractionNature', 5);

  return {
    name: countryName,
    count,
    topJournals,
    topInstitutions,
    topReasons,
    topSubjects,
    yearTrend,
    retractionNatures,
  };
}

// ─── CSV Parser ────────────────────────────────────────────────────────────────

export function parseCSV(text: string): RetractionRecord[] {
  const lines = text.split('\n').filter(l => l.trim());
  if (lines.length < 2) return [];
  const header = splitCSVLine(lines[0]);
  const records: RetractionRecord[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = splitCSVLine(lines[i]);
    if (!values.length) continue;
    const get = (field: string) => {
      const idx = header.indexOf(field);
      return idx >= 0 ? (values[idx] ?? '') : '';
    };
    const id = parseInt(get('Record ID'));
    if (!id) continue;
    records.push({
      'Record ID': id,
      DOI: get('DOI'),
      Title: get('Title'),
      Subject: get('Subject'),
      Institution: get('Institution'),
      Journal: get('Journal'),
      Publisher: get('Publisher'),
      Country: get('Country'),
      Author: get('Author'),
      ArticleType: get('ArticleType'),
      RetractionDate: parseDate(get('RetractionDate')),
      OriginalPaperDate: parseDate(get('OriginalPaperDate')),
      RetractionNature: get('RetractionNature'),
      Reason: get('Reason'),
      Paywalled: get('Paywalled'),
    });
  }
  return records;
}

function splitCSVLine(line: string): string[] {
  const values: string[] = [];
  let inQuotes = false;
  let fieldStart = 0;
  for (let j = 0; j <= line.length; j++) {
    const char = j < line.length ? line[j] : ',';
    if (char === '"') { inQuotes = !inQuotes; }
    else if (char === ',' && !inQuotes) {
      values.push(line.slice(fieldStart, j).trim().replace(/^"|"$/g, ''));
      fieldStart = j + 1;
    }
  }
  return values;
}

export function parseDate(dateStr: string): string {
  if (!dateStr || dateStr === '0:00') return '';
  const datePart = dateStr.split(' ')[0];
  const parts = datePart.split('/');
  if (parts.length === 3) {
    const [month, day, year] = parts;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  return dateStr;
}

// ─── Computations ─────────────────────────────────────────────────────────────

export function splitMulti(val: string): string[] {
  if (!val) return [];
  return val.split(';').map(s => s.trim()).filter(Boolean);
}

function computeTop(records: RetractionRecord[], field: keyof RetractionRecord, limit: number): [string, number][] {
  const map = new Map<string, number>();
  for (const r of records) {
    const vals = splitMulti(String(r[field]));
    for (const v of vals) {
      map.set(v, (map.get(v) ?? 0) + 1);
    }
  }
  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);
}

function computeTopReasons(records: RetractionRecord[], limit: number): [string, number][] {
  const map = new Map<string, number>();
  for (const r of records) {
    const reasons = splitMulti(r.Reason);
    for (const reason of reasons) {
      map.set(reason, (map.get(reason) ?? 0) + 1);
    }
  }
  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);
}

function computeTopSubjects(records: RetractionRecord[], limit: number): [string, number][] {
  return computeTop(records, 'Subject', limit);
}

function computeYearTrend(records: RetractionRecord[]): [string, number][] {
  const map = new Map<string, number>();
  for (const r of records) {
    const year = r.RetractionDate?.slice(0, 4);
    if (year && /^\d{4}$/.test(year)) {
      map.set(year, (map.get(year) ?? 0) + 1);
    }
  }
  return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
}
