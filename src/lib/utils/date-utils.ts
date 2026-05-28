/** 获取今天的 ISO 日期字符串 YYYY-MM-DD */
export function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** 获取当前时间的 ISO 时间戳 */
export function nowISO(): string {
  return new Date().toISOString();
}

/** 格式化日期为 YYYY-MM-DD */
export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** 格式化日期为中文可读格式 */
export function formatDateCN(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

/** 相对日期标签 */
export function relativeDateLabel(days: number): string {
  if (days < 0) return `已过期 ${Math.abs(days)} 天`;
  if (days === 0) return "今天到期";
  if (days === 1) return "明天到期";
  return `${days} 天后到期`;
}
