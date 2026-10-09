import {
  statusState,
  showLoading,
  hideLoading,
  showSuccess,
  showInfo,
  showStatusError,
  hideStatus
} from '@/composables/statusCore';
import { resolveFailureTitle } from '@/utils/backend-status';

/**
 * 全局状态弹窗（居中卡片）对外 API。
 *
 * 设计目标：把「加载/提交/更新中」与「成功/失败提示」统一成**同一张居中卡片、同一坐标**，
 * 彻底消除各处自定义遮罩 + 原生 showLoading/showToast 风格与位置不一致的问题。
 *
 * - loading：带全屏遮罩、阻断交互、不自动消失，需显式 hideLoading；
 * - success/error/info：无遮罩、不阻断交互、到时自动消失。
 *
 * 页面通过挂载一次 <MwpStatusOverlay /> 作为宿主即可接收。
 */
export type { StatusType, StatusState } from '@/composables/statusCore';
export {
  showLoading,
  hideLoading,
  showSuccess,
  showInfo,
  hideStatus
} from '@/composables/statusCore';

/**
 * 失败提示（自动消失）。
 * 复用 backend-status 的统一引导：后端不可用时把失败文案改写成「点首页 Hello 刷新登录」，
 * 节流窗口内的重复失败则直接丢弃。
 */
export function showError(text: string, duration = 2200) {
  const resolved = resolveFailureTitle(text);
  if (resolved === null) return;
  showStatusError(resolved, duration);
}

export function useStatus() {
  return {
    state: statusState,
    showLoading,
    hideLoading,
    showSuccess,
    showError,
    showInfo,
    hideStatus
  };
}
