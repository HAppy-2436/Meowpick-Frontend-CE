import { useThemeStore, useSkinStore } from '@/config';
import { THEME_COLORS } from '@/config/theme-colors';
import type { ResolvedTheme } from '@/utils/system-theme';

/**
 * 同步微信原生导航栏 / 窗口背景色。
 *
 * 项目使用 navigationStyle: custom 自定义导航栏，但页面跳转转场动画
 * 与松手刷新仍使用微信原生 backgroundColor，若不随主题更新，深色模式下
 * 转场会闪过 app.json 中硬编码的浅灰色。原生 API 需要页面上下文，
 * 因此除 onLaunch 外还必须在每个页面 onLoad / onShow 时调用。
 */
export function applyThemeToNativeBar(mode: ResolvedTheme) {
  // 「旧版（原始版）」皮肤强制使用浅色原生配色：
  // 原版 UI 没有深色适配，若跟随主题会把导航栏 / 窗口底色刷成深色，
  // 与页面内的浅色内容冲突。这里在源头把 resolved 收敛为 light。
  let resolved: ResolvedTheme = mode;
  try {
    if (useSkinStore().current === 'original') resolved = 'light';
  } catch (e) {}

  const colors = THEME_COLORS[resolved];
  try {
    uni.setNavigationBarColor({
      // 微信原生 API 的 frontColor 仅接受 #ffffff / #000000，非设计 token
      frontColor: resolved === 'dark' ? '#ffffff' : '#000000',
      backgroundColor: colors.card,
      animation: { duration: 0, timingFunc: 'linear' }
    });
    uni.setBackgroundColor?.({
      backgroundColor: colors.page,
      backgroundColorTop: colors.page,
      backgroundColorBottom: colors.page
    });
    // 松手刷新指示器：深色背景需配浅色文案，否则深色圆点不可见
    uni.setBackgroundTextStyle?.({
      textStyle: resolved === 'dark' ? 'light' : 'dark'
    });
  } catch (e) {}
}

export function syncNativeTheme() {
  const store = useThemeStore();
  store.syncSystemTheme();
  applyThemeToNativeBar(store.effectiveTheme);
}
