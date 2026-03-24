/** Format a large number with K/M suffix */
export function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

/** Truncate string with ellipsis */
export function truncate(str: string, maxLen: number): string {
  if (!str || str.length <= maxLen) return str;
  return str.slice(0, maxLen) + '…';
}

/** Debounce function */
export function debounce<T extends (...args: unknown[]) => unknown>(fn: T, delay: number): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/** Format a date string YYYY-MM-DD to locale string */
export function formatDate(dateStr: string): string {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return '—';
  const [year, month, day] = dateStr.split('-');
  return `${year}年${parseInt(month)}月${parseInt(day)}日`;
}
