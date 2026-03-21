// 模拟数据 - 从原始 HTML 提取
export interface RetractionRecord {
  id: number;
  title: string;
  author: string;
  journal: string;
  institution: string;
  country: string;
  flag: string;
  reason: string;
  year: number;
  month: number;
  day: number;
  field: string;
  citations: number;
  doi: string;
  pmid: string;
}

export const MOCK_DATA: RetractionRecord[] = [
  {"id": 1, "title": "Population-based analysis of safety", "author": "Nina Johnson, Lisa Cohen, Ming Tanaka", "journal": "Cell", "institution": "Max Planck Institute", "country": "United States", "flag": "🇺🇸", "reason": "Plagiarism", "year": 2019, "month": 1, "day": 3, "field": "Physics", "citations": 8, "doi": "10.4582/343962", "pmid": "PMID:26956909"},
  {"id": 2, "title": "Multicenter analysis of epidemiology", "author": "Anna Lee, Alex Larsson, Sophia Zhang, et al.", "journal": "JAMA", "institution": "Columbia University", "country": "Poland", "flag": "🇵🇱", "reason": "Fraud", "year": 2019, "month": 3, "day": 7, "field": "Environmental Science", "citations": 71, "doi": "10.6514/207175", "pmid": "PMID:13112034"},
  {"id": 3, "title": "Comprehensive analysis of efficacy", "author": "Nina Andersson", "journal": "Journal of Clinical Oncology", "institution": "NIH", "country": "Brazil", "flag": "🇧🇷", "reason": "Duplicate", "year": 2015, "month": 9, "day": 10, "field": "Neuroscience", "citations": 20, "doi": "10.6925/705397", "pmid": "PMID:16452134"},
  {"id": 4, "title": "Long-term analysis of risk factors", "author": "Sophia Johnson, Mei Brown, Anna Nielsen, et al.", "journal": "JAMA", "institution": "Stanford University", "country": "China", "flag": "🇨🇳", "reason": "Plagiarism", "year": 2020, "month": 11, "day": 9, "field": "Computer Science", "citations": 53, "doi": "10.2169/738720", "pmid": "PMID:31306335"},
  {"id": 5, "title": "Meta-analytic analysis of pathways", "author": "Laura Nielsen, Hassan Tanaka, Chen Santos, Priya Ali, et al.", "journal": "Science", "institution": "Yale University", "country": "Indonesia", "flag": "🇮🇩", "reason": "Fraud", "year": 2009, "month": 7, "day": 9, "field": "Materials Science", "citations": 80, "doi": "10.2084/321231", "pmid": "PMID:29031404"},
  {"id": 6, "title": "Retrospective analysis of neuroscience", "author": "Yuki Brown, Yuki Liu, Nina Tanaka, Omar Brown, Nina Lee, David Park, Sara Chen, et al.", "journal": "The Lancet", "institution": "Yale University", "country": "Iran", "flag": "🇮🇷", "reason": "Fraud", "year": 2023, "month": 1, "day": 28, "field": "Materials Science", "citations": 23, "doi": "10.2796/260265", "pmid": "PMID:31053595"},
  {"id": 7, "title": "Cross-sectional analysis of epidemiology", "author": "Raj Andersson, Emma Brown, Omar Fernandez, Wei Santos, Nina Johnson, Lisa Park, et al.", "journal": "PLoS ONE", "institution": "Yale University", "country": "Mexico", "flag": "🇲🇽", "reason": "Error", "year": 2009, "month": 5, "day": 14, "field": "Medicine", "citations": 28, "doi": "10.3591/575763", "pmid": "PMID:10108894"},
  {"id": 8, "title": "Population-based analysis of treatment outcomes", "author": "Emma Muller, Sarah Fernandez, Kenji Hassan", "journal": "Neuron", "institution": "University of Michigan", "country": "Indonesia", "flag": "🇮🇩", "reason": "Fraud", "year": 2024, "month": 6, "day": 25, "field": "Environmental Science", "citations": 39, "doi": "10.3646/665579", "pmid": "PMID:36126369"},
  {"id": 9, "title": "Meta-analytic analysis of pathways", "author": "Laura Silva, Ming Ali", "journal": "Nature Medicine", "institution": "Harvard Medical School", "country": "United States", "flag": "🇺🇸", "reason": "Error", "year": 2024, "month": 10, "day": 3, "field": "Materials Science", "citations": 61, "doi": "10.2403/867460", "pmid": "PMID:26307133"},
  {"id": 10, "title": "Cross-sectional analysis of risk factors", "author": "Omar Mueller, Alex Dubois, Sophia Khan, David Rossi, Laura Tanaka, Peng Cohen, Hassan Rossi, et al.", "journal": "Angewandte Chemie", "institution": "Shanghai Jiao Tong University", "country": "Poland", "flag": "🇵🇱", "reason": "Duplicate", "year": 2022, "month": 9, "day": 15, "field": "Chemistry", "citations": 112, "doi": "10.2982/359947", "pmid": "PMID:17539591"},
];

// 获取筛选选项
export const getFilterOptions = (data: RetractionRecord[]) => {
  const years = [...new Set(data.map(d => d.year))].sort((a, b) => b - a);
  const reasons = [...new Set(data.map(d => d.reason))].sort();
  const countries = [...new Set(data.map(d => d.country))].sort();
  const journals = [...new Set(data.map(d => d.journal))].sort();
  const institutions = [...new Set(data.map(d => d.institution))].sort();
  const fields = [...new Set(data.map(d => d.field))].sort();

  return { years, reasons, countries, journals, institutions, fields };
};

// 按撤稿原因统计
export const getReasonStats = (data: RetractionRecord[]) => {
  const stats: Record<string, number> = {};
  data.forEach(d => {
    stats[d.reason] = (stats[d.reason] || 0) + 1;
  });
  return stats;
};

// 按年份统计
export const getYearStats = (data: RetractionRecord[]) => {
  const stats: Record<number, number> = {};
  data.forEach(d => {
    stats[d.year] = (stats[d.year] || 0) + 1;
  });
  return stats;
};

// 按期刊统计
export const getJournalStats = (data: RetractionRecord[]) => {
  const stats: Record<string, { count: number; fraud: number }> = {};
  data.forEach(d => {
    if (!stats[d.journal]) {
      stats[d.journal] = { count: 0, fraud: 0 };
    }
    stats[d.journal].count++;
    if (d.reason === 'Fraud') {
      stats[d.journal].fraud++;
    }
  });
  return stats;
};

// KPI 计算
export const calculateKPIs = (data: RetractionRecord[]) => {
  const total = data.length;
  const fraudCount = data.filter(d => d.reason === 'Fraud').length;
  const journals = new Set(data.map(d => d.journal)).size;
  const institutions = new Set(data.map(d => d.institution)).size;
  const currentYear = new Date().getFullYear();
  const monthlyNew = data.filter(d => d.year === currentYear).length;

  return {
    total,
    retractionRate: ((fraudCount / total) * 100).toFixed(2),
    fraudCount,
    journalCount: journals,
    institutionCount: institutions,
    monthlyNew,
  };
};
