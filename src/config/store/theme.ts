import { getSystemTheme, type ResolvedTheme } from '@/utils/system-theme';
import useSkinStore from './skin';

export type ThemeMode = 'system' | 'light' | 'dark';

export default defineStore('theme-store', {
  unistorage: true,
  state() {
    return {
      /** 用户选择：跟随系统 / 浅色 / 深色 */
      mode: 'system' as ThemeMode,
      /** 当前系统主题，仅在 mode === 'system' 时参与计算 */
      systemTheme: 'light' as ResolvedTheme
    };
  },
  getters: {
    /** 实际生效的主题（把"跟随系统"解析为具体深浅色） */
    effectiveTheme(state): ResolvedTheme {
      // 「旧版（原始版）」皮肤没有任何深色适配，运行旧版时始终收敛为浅色，
      // 从源头避免深色主题渗入旧版页面。
      try {
        if (useSkinStore().current === 'original') return 'light';
      } catch (e) {}
      return state.mode === 'system' ? state.systemTheme : state.mode;
    },
    themeClass(): string {
      return this.effectiveTheme === 'dark' ? 'dark-theme' : 'light-theme';
    },
    isDark(): boolean {
      return this.effectiveTheme === 'dark';
    }
  },
  actions: {
    setTheme(mode: ThemeMode) {
      this.mode = mode;
    },
    /** 按 跟随系统 → 深色 → 浅色 循环 */
    cycleTheme() {
      const order: ThemeMode[] = ['system', 'dark', 'light'];
      const next = order[(order.indexOf(this.mode) + 1) % order.length];
      this.mode = next;
    },
    setSystemTheme(theme: ResolvedTheme) {
      this.systemTheme = theme;
    },
    /** 读取一次当前系统主题 */
    syncSystemTheme() {
      this.systemTheme = getSystemTheme();
    },
    toggleTheme() {
      this.mode = this.isDark ? 'light' : 'dark';
    }
  }
});
