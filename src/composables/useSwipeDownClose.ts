import { computed, ref } from 'vue';

interface TouchLikeEvent {
  touches?: Array<{ clientY?: number }>;
  changedTouches?: Array<{ clientY?: number }>;
}

interface SwipeDownCloseOptions {
  onClose: () => void;
  /** 触发关闭的下拉距离阈值（px），默认 80 */
  threshold?: number;
}

/** 滑出动画时长（ms），需与下面 transition 时长一致 */
const CLOSE_DURATION_MS = 200;

/**
 * 底部弹窗下拉关闭手势。
 *
 * 用法：
 *   const { panelStyle, onTouchStart, onTouchMove, onTouchEnd } =
 *     useSwipeDownClose({ onClose: handleCancel });
 *   <view class="sheet__panel" :style="panelStyle"
 *     @touchstart="onTouchStart" @touchmove.stop.prevent="onTouchMove"
 *     @touchend="onTouchEnd" @touchcancel="onTouchEnd">
 *
 * 说明：
 * - 仅响应从触发元素开始的下拉；上滑会被钳制为 0，不影响内容滚动。
 * - 超过阈值不会立即消失，而是先沿动画滑出屏幕，动画结束后再回调 onClose。
 */
export function useSwipeDownClose(options: SwipeDownCloseOptions) {
  const threshold = options.threshold ?? 80;

  const dragY = ref(0);
  const dragging = ref(false);
  const closing = ref(false);
  let startY = 0;

  const readClientY = (e: TouchLikeEvent) =>
    e.touches?.[0]?.clientY ?? e.changedTouches?.[0]?.clientY ?? 0;

  const onTouchStart = (e: TouchLikeEvent) => {
    if (closing.value) return;
    startY = readClientY(e);
    dragging.value = true;
    dragY.value = 0;
  };

  const onTouchMove = (e: TouchLikeEvent) => {
    if (!dragging.value || closing.value) return;
    dragY.value = Math.max(readClientY(e) - startY, 0);
  };

  const onTouchEnd = () => {
    if (!dragging.value || closing.value) return;
    dragging.value = false;
    if (dragY.value > threshold) {
      closing.value = true;
      setTimeout(() => {
        options.onClose();
        closing.value = false;
        dragY.value = 0;
      }, CLOSE_DURATION_MS);
    } else {
      // 未达阈值：回弹复位
      dragY.value = 0;
    }
  };

  // 拖动中跟手（无过渡）；未达阈值回弹；达阈值滑出屏幕
  const panelStyle = computed(() => {
    if (dragging.value) {
      return { transform: `translateY(${dragY.value}px)`, transition: 'none' };
    }
    if (closing.value) {
      return {
        transform: 'translateY(100%)',
        transition: `transform ${CLOSE_DURATION_MS}ms ease-in`
      };
    }
    return { transition: `transform ${CLOSE_DURATION_MS}ms ease-out` };
  });

  return {
    dragging,
    closing,
    panelStyle,
    onTouchStart,
    onTouchMove,
    onTouchEnd
  };
}
