/**
 * 主题色常量（JS 上下文用）
 * 与 _tokens.scss 中的灰度 token 保持同步
 * 用于 uni.setNavigationBarColor / uni.setBackgroundColor 等原生 API
 */

export const THEME_COLORS = {
  light: {
    page: '#f7f8fa',
    card: '#ffffff',
    textPrimary: '#1f1f1f',
    textSecondary: '#666666',
  },
  dark: {
    page: '#121212',
    card: '#1e1e1e',
    textPrimary: '#e0e0e0',
    textSecondary: '#bbbbbb',
  },
} as const;
