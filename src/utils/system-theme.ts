/**
 * 系统主题读取工具。
 *
 * 微信小程序需在 app.json 中声明 "darkmode": true，`uni.getSystemInfoSync()`
 * 才会返回 `theme` 字段（详见 DarkMode 适配指南）。未声明或基础库过低时
 * 回退为浅色，保证逻辑始终有确定值。
 */
export type ResolvedTheme = 'light' | 'dark';

export function getSystemTheme(): ResolvedTheme {
  try {
    const info = uni.getSystemInfoSync() as { theme?: string };
    if (info.theme === 'dark' || info.theme === 'light') {
      return info.theme;
    }
  } catch (e) {}
  return 'light';
}
