/**
 * 主题色常量（JS 上下文用）
 * 与 _tokens.scss 中的灰度 token 保持同步
 * 用于 uni.setNavigationBarColor / uni.setBackgroundColor 等原生 API
 */

export const THEME_COLORS = {
  light: {
    page: '#f6f6f6',
    card: '#ffffff',
    textPrimary: '#1a1a1a',
    textSecondary: '#595959',
  },
  dark: {
    page: '#121212',
    card: '#1e1e1e',
    textPrimary: '#ededed',
    textSecondary: '#c4c4c4',
  },
} as const;
