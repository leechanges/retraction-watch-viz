import { FileJson, FileSpreadsheet } from 'lucide-react';
import { exportCSV, exportJSON } from '../lib/export';
import type { RetractionRecord, FilterState } from '../lib/types';

interface ExportBarProps {
  records: RetractionRecord[];
  filters: FilterState;
}

export default function ExportBar({ records, filters }: ExportBarProps) {
  const handleExportCSV = () => {
    try {
      exportCSV(records, filters);
    } catch (e) {
      console.error('CSV export failed:', e);
    }
  };

  const handleExportJSON = () => {
    try {
      exportJSON(records, filters);
    } catch (e) {
      console.error('JSON export failed:', e);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleExportCSV}
        className="export-btn"
        title="导出为 CSV"
        aria-label="导出筛选数据为 CSV 文件"
      >
        <FileSpreadsheet className="w-3.5 h-3.5" />
        导出 CSV
      </button>
      <button
        onClick={handleExportJSON}
        className="export-btn"
        title="导出为 JSON"
        aria-label="导出筛选数据为 JSON 文件"
      >
        <FileJson className="w-3.5 h-3.5" />
        导出 JSON
      </button>
    </div>
  );
}
