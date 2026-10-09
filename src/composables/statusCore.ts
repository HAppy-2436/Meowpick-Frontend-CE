import { reactive } from 'vue';

/**
 * 状态弹窗的底层单例（无业务依赖）。
 *
 * 只负责「当前该显示什么状态」这一份模块级状态与显隐原语；
 * 失败文案的后端不可用改写逻辑放在上层 useStatus，避免与 backend-status 形成循环依赖。
 */
export type StatusType = 'loading' | 'success' | 'error' | 'info';

export interface StatusState {
  visible: boolean;
  type: StatusType;
  text: string;
  /** 是否显示全屏遮罩并阻断交互（loading 为 true，结果提示为 false） */
  mask: boolean;
}

export const statusState = reactive<StatusState>({
  visible: false,
  type: 'loading',
  text: '',
  mask: true
});

let timer: ReturnType<typeof setTimeout> | undefined;
/** 自增序号：每次新状态使旧的自动消失定时器失效，避免误关新弹窗 */
let seq = 0;

function clearTimer() {
  if (timer) {
    clearTimeout(timer);
    timer = undefined;
  }
}

/** 关闭当前任意状态 */
export function hideStatus() {
  clearTimer();
  seq += 1;
  statusState.visible = false;
}

/** 通用显隐原语：duration > 0 时到时自动消失 */
export function showStatus(
  type: StatusType,
  text: string,
  mask: boolean,
  duration: number
) {
  clearTimer();
  statusState.type = type;
  statusState.text = text;
  statusState.mask = mask;
  statusState.visible = true;

  if (duration > 0) {
    const id = ++seq;
    timer = setTimeout(() => {
      if (id === seq) statusState.visible = false;
    }, duration);
  }
}

/** 常驻加载：全屏遮罩 + spinner，需显式调用 hideLoading */
export function showLoading(text = '加载中...') {
  showStatus('loading', text, true, 0);
}

/** 关闭加载态；若当前展示的是结果提示则忽略，避免误关刚弹出的成功/失败 */
export function hideLoading() {
  if (statusState.type !== 'loading') return;
  hideStatus();
}

/** 成功提示（自动消失） */
export function showSuccess(text: string, duration = 1500) {
  showStatus('success', text, false, duration);
}

/** 失败提示（自动消失，不做改写，改写见 useStatus.showError） */
export function showStatusError(text: string, duration = 2200) {
  showStatus('error', text, false, duration);
}

/** 中性提示（自动消失） */
export function showInfo(text: string, duration = 1600) {
  showStatus('info', text, false, duration);
}
