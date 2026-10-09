/**
 * 后端时间解析工具。
 *
 * 后端部分字段（如 ProposalTimelineLogVO.actionTime）是无时区的
 * "YYYY-MM-DD HH:mm:ss" 字符串，且实际为 UTC 时间。若直接交给
 * `new Date()`，JS 会按本地时区解析，导致显示时间比北京时间少 8 小时。
 * 这里统一在缺省时区时补上 `Z`，按 UTC 解析后再由本地 getter 转为东八区。
 *
 * 已带时区信息的字符串（RFC3339 的 `Z` / `±HH:MM`）与 Date 对象按原样解析。
 */
const TZ_SUFFIX = /(?:Z|[+-]\d{2}:?\d{2})$/i;
const DATE_TIME_RE = /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}/;

export const parseBackendTime = (value?: string | Date | null): Date | null => {
  if (value === undefined || value === null || value === '') return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  const raw = String(value).trim();
  if (!raw) return null;
  const normalized =
    DATE_TIME_RE.test(raw) && !TZ_SUFFIX.test(raw)
      ? `${raw.replace(' ', 'T')}Z`
      : raw;
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
};

const pad = (n: number) => String(n).padStart(2, '0');

export const formatDate = (value?: string | Date | null): string => {
  const date = parseBackendTime(value);
  if (!date) return '';
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}`;
};
