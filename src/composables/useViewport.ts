import { reactive } from 'vue';

/**
 * 宽高比达到该值即视为「宽屏 / 平板形态」（手机竖屏约 0.46~0.56，平板约 0.62+）。
 * 供顶部导航、首页构图等判断是否需要放大留白/收起元素。
 */
export const WIDE_ASPECT = 0.6;

export interface ViewportState {
  /** 可用窗口宽度（px） */
  width: number;
  /** 可用窗口高度（px） */
  height: number;
  statusBarHeight: number;
  /** 底部安全区（px） */
  safeBottom: number;
  /** 当前环境是否存在系统胶囊（PC 端没有，可把右上角空间让给业务按钮） */
  hasCapsule: boolean;
  /** 系统胶囊上沿（px） */
  menuTop: number;
  /** 系统胶囊高度（px） */
  menuHeight: number;
  menuLeft: number;
  menuRight: number;
  menuWidth: number;
}

/**
 * 全局唯一的视口状态（单例，响应式）。
 *
 * 小程序在 PC 端 / 开发者工具里可以被拖动改变窗口大小，`uni.onWindowResize`
 * 会触发；这里统一监听一次并写入响应式 state，所有依赖它的 composable
 * （useScreenScale / useMenuButton）与组件都会自动重算。
 *
 * 注意：不要在各组件里自行 `uni.getSystemInfoSync()` 缓存结果——那样窗口
 * 变化后拿到的是旧值（CSS 的 rpx 会实时更新，JS 的 px 不会，两者会打架）。
 */
const state = reactive<ViewportState>({
  width: 375,
  height: 667,
  statusBarHeight: 20,
  safeBottom: 0,
  hasCapsule: false,
  menuTop: 48,
  menuHeight: 32,
  menuLeft: 278,
  menuRight: 365,
  menuWidth: 87
});

let started = false;

function read(): void {
  const sys = uni.getSystemInfoSync();
  if (sys.windowWidth) state.width = sys.windowWidth;
  if (sys.windowHeight) state.height = sys.windowHeight;
  state.statusBarHeight = sys.statusBarHeight || 0;
  state.safeBottom = sys.safeAreaInsets?.bottom || 0;

  // 胶囊几何：位置依赖窗口宽度，必须跟着刷新
  const fallbackTop = state.statusBarHeight ? state.statusBarHeight + 4 : 48;
  let top = fallbackTop;
  let height = 32;
  let left = state.width - 97;
  let right = state.width - 10;
  let width = 87;
  let hasCapsule = false;
  try {
    const res = uni.getMenuButtonBoundingClientRect();
    if (res && res.top) {
      hasCapsule = true;
      top = res.top;
      height = res.height;
      left = res.left;
      right = res.right;
      width = res.width;
    }
  } catch (e) {
    // 兼容测试 / 非微信环境
  }
  // PC 端（windows/mac）没有胶囊，即使接口返回了值也不算
  const platform = sys.platform || '';
  const isPC = platform === 'windows' || platform === 'mac';
  // 读不到胶囊时，右上角是空出来的，可给业务按钮用
  state.hasCapsule = !isPC && hasCapsule;
  state.menuTop = top;
  state.menuHeight = height;
  state.menuLeft = left;
  state.menuRight = right;
  state.menuWidth = width;
}

function start(): void {
  if (started) return;
  started = true;
  read();
  try {
    uni.onWindowResize(() => {
      read();
    });
  } catch (e) {
    // 非小程序环境没有该 API
  }
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', () => {
      read();
    });
  }
}

export function useViewport(): ViewportState {
  start();
  return state;
}
