import { computed } from "vue";

export interface MenuButtonInfo {
  top: number;
  height: number;
  bottom: number;
  left?: number;
  right?: number;
  width?: number;
}

/**
 * 读取胶囊位置信息，供顶部导航栏使用。
 *
 * 用法：
 *   const { menuButtonInfo, navBarHeight, contentSpacerHeight } = useMenuButton();
 *
 *   <view :style="{ paddingTop: menuButtonInfo.top + 'px' }">...</view>
 *
 * 行为说明：
 * - 胶囊信息只读一次（运行时不变化），不引入 ref
 * - navBarHeight = 胶囊底 + 12px
 * - contentSpacerHeight = navBarHeight（用于页面顶部的占位 view）
 */
export function useMenuButton() {
  const sysInfo = uni.getSystemInfoSync();

  const fallbackTop = sysInfo.statusBarHeight ? sysInfo.statusBarHeight + 4 : 48;
  const fallbackHeight = 32;

  const menuButtonInfo: MenuButtonInfo = {
    top: fallbackTop,
    height: fallbackHeight,
    bottom: fallbackTop + fallbackHeight,
  };

  try {
    const res = uni.getMenuButtonBoundingClientRect();
    if (res && res.top) {
      menuButtonInfo.top = res.top;
      menuButtonInfo.height = res.height;
      menuButtonInfo.bottom = res.bottom;
      menuButtonInfo.left = res.left;
      menuButtonInfo.right = res.right;
      menuButtonInfo.width = res.width;
    }
  } catch (e) {
    // 兼容测试/非微信环境
  }

  const navBarHeight = computed(() => menuButtonInfo.bottom + 12);
  const contentSpacerHeight = computed(() => navBarHeight.value);

  return {
    menuButtonInfo,
    navBarHeight,
    contentSpacerHeight,
  };
}