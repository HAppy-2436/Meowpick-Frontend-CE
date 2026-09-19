import { computed } from 'vue';
import { useViewport, WIDE_ASPECT } from './useViewport';

export interface MenuButtonInfo {
  top: number;
  height: number;
  bottom: number;
  left: number;
  right: number;
  width: number;
}

/** 胶囊下方留白（rpx）——必须用 rpx 口径，才能和 header 里的文字一起随屏宽缩放 */
const CAPSULE_GAP_RPX = 24;
/** 内容行最小高度（rpx）——与搜索框 .search-input-box 的 72rpx 对齐 */
const CONTENT_MIN_RPX = 72;

/**
 * 胶囊位置信息 + 顶部导航栏高度（响应式）。
 *
 * 用法：
 *   const { menuButtonInfo, navBarHeight, contentHeight } = useMenuButton();
 *
 * 行为说明：
 * - menuButtonInfo 是 computed，窗口尺寸变化时自动重算（胶囊位置依赖窗口宽度）
 * - contentHeight = max(胶囊高度, 随屏宽缩放的最小行高)
 * - navBarHeight = 胶囊顶部 + contentHeight + 胶囊下方留白
 *
 * 注意：留白与最小行高都以 rpx 口径换算（用 viewport.width 而非 uni.upx2px），
 * 否则窗口变化时不会重算，平板/宽屏下文字会放大而 header 高度不变。
 */
export function useMenuButton() {
  const vp = useViewport();

  /** rpx → px，基于响应式宽度，保证窗口变化时能触发重算 */
  const rpx = (n: number) => (vp.width / 750) * n;

  const menuButtonInfo = computed<MenuButtonInfo>(() => ({
    top: vp.menuTop,
    height: vp.menuHeight,
    bottom: vp.menuTop + vp.menuHeight,
    left: vp.menuLeft,
    right: vp.menuRight,
    width: vp.menuWidth
  }));

  /**
   * 顶部导航行内控件（搜索框、返回按钮）的高度：
   * - 真机手机（有胶囊 + 手机比例）：与系统胶囊完全等高，严丝合缝
   * - 其它（平板 / PC / 横屏）：按 rpx 比例放大。
   *   注意 PC 没有胶囊，此时 menuHeight 只是兜底值，绝不能拿它当高度，
   *   否则 rpx 放大的文字会挤在 32px 的小框里。
   */
  const contentHeight = computed(() => {
    const isWide = vp.width / vp.height >= WIDE_ASPECT;
    const matchCapsule = vp.hasCapsule && !isWide;
    return matchCapsule
      ? vp.menuHeight
      : Math.max(vp.menuHeight, rpx(CONTENT_MIN_RPX));
  });

  const navBarHeight = computed(
    () => vp.menuTop + contentHeight.value + rpx(CAPSULE_GAP_RPX)
  );
  const contentSpacerHeight = computed(() => navBarHeight.value);

  return {
    menuButtonInfo,
    navBarHeight,
    contentSpacerHeight,
    contentHeight
  };
}
