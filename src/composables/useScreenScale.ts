import { useViewport } from './useViewport';

export interface ScreenScale {
  /** 全页统一缩放因子（由可用视口高度推导，上限 1.2） */
  r: number;
  /** 扣除底部 tab bar 后的可用高度（px） */
  available: number;
  /** 底部 tab bar 高度（px） */
  tabBarH: number;
  /** 底部安全区（px） */
  safeBottom: number;
  /** 屏幕宽高比（windowWidth / windowHeight），用于识别接近平板的宽屏形态 */
  aspect: number;
  /** 可用窗口宽度（px） */
  windowWidth: number;
  /** 1rpx 对应的 px 值 */
  pxPerRpx: number;
  /** 动态圆角（rpx 口径） */
  radiusRpx: number;
  /** 动态圆角（px，可直接用于 inline style） */
  radius: number;
}

const RADIUS_BASE_RPX = 36;
const RADIUS_MIN_RPX = 32;
const RADIUS_MAX_RPX = 44;
const SCALE_REFERENCE = 762;
const SCALE_MAX = 1.2;

/**
 * 推导统一的缩放因子与圆角。
 *
 * 供不可滚动、需精确填满视口的面板复用（首页 HomeView / 底部 tab bar），
 * 保证父子圆角同源，避免两处各算一套导致打架。
 *
 * 数据源是响应式的 useViewport()，所以：
 * - 放在 `computed` / `watchEffect` 里调用 → 窗口变化会自动重算；
 * - 放在普通函数里调用 → 读取调用当下的值（需要自行触发重算）。
 *
 * 用法：
 *   const scale = computed(() => useScreenScale());
 *   scale.value.radius
 */
export function useScreenScale(): ScreenScale {
  const vp = useViewport();
  const pxPerRpx = vp.width / 750;
  const safeBottom = vp.safeBottom;

  // 有小白条用真实安全区，没有的补 24rpx 让视觉间距一致
  const tabBarH =
    Math.round(100 * pxPerRpx) +
    safeBottom +
    (safeBottom > 0 ? 0 : Math.round(24 * pxPerRpx));

  const available = vp.height - tabBarH;
  const r = Math.min(available / SCALE_REFERENCE, SCALE_MAX);
  const aspect = vp.width / vp.height;

  const radiusRpx = Math.min(
    Math.max(RADIUS_BASE_RPX * r, RADIUS_MIN_RPX),
    RADIUS_MAX_RPX
  );
  const radius = Math.round(radiusRpx * pxPerRpx);

  return {
    r,
    available,
    tabBarH,
    safeBottom,
    aspect,
    windowWidth: vp.width,
    pxPerRpx,
    radiusRpx,
    radius
  };
}
