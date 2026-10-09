/**
 * 相对时间格式化（上游 useTime 的本地实现，避免依赖缺失的全局函数）。
 */
export function caculateTimeago(dateTimeStamp: any) {
  const date = new Date(dateTimeStamp);
  const time = date.getTime();
  if (Number.isNaN(time)) return '';

  const diff = Date.now() - time;
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) return '刚刚';
  if (diff < hour) return `${Math.floor(diff / minute)}分钟前`;
  if (diff < day) return `${Math.floor(diff / hour)}小时前`;
  if (diff < 30 * day) return `${Math.floor(diff / day)}天前`;
  if (diff < 365 * day) return `${Math.floor(diff / (30 * day))}个月前`;
  return `${Math.floor(diff / (365 * day))}年前`;
}
