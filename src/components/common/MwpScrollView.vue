<template>
  <view class="mwp-scroll-wrap" :class="themeStore.themeClass">
    <!-- 独立指示器：位置由下拉距离驱动，始终落在 [minTop, 第一张卡片上方] 区间 -->
    <view
      v-if="enabled && indicatorVisible"
      class="mwp-refresher"
      :style="{ top: indicatorTop + 'px' }"
    >
      <view class="mwp-refresher__body">
        <view
          class="mwp-refresher__spinner"
          :class="{ 'is-spinning': refreshing }"
        />
        <text class="mwp-refresher__text">{{
          refreshing ? '刷新中…' : '松手刷新'
        }}</text>
      </view>
    </view>

    <scroll-view
      scroll-y
      class="mwp-scroll-view"
      :refresher-enabled="enabled"
      :refresher-threshold="threshold"
      refresher-default-style="none"
      :refresher-background="refresherBackground"
      :refresher-triggered="refreshing"
      :lower-threshold="lowerThreshold"
      :enhanced="enhanced"
      :show-scrollbar="showScrollbar"
      @refresherpulling="onRefresherPulling"
      @refresherstatuschange="onRefresherPulling"
      @refresherrefresh="onRefresherRefresh"
      @refresherrestore="onRefresherRestore"
      @refresherabort="onRefresherRestore"
      @scroll="onScroll"
      @scrolltolower="onScrollToLower"
    >
      <!-- 仅用于撑出下拉区域，真实指示器在上面 -->
      <view
        slot="refresher"
        class="mwp-refresher-slot"
        :style="{ height: threshold + 'px' }"
      />
      <slot />
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useThemeStore } from '@/config';
import { THEME_COLORS } from '@/config/theme-colors';

const themeStore = useThemeStore();

const props = withDefaults(
  defineProps<{
    /** 受控刷新状态（v-model:refreshing） */
    refreshing?: boolean;
    /** 关闭后不响应下拉（例如非结果态） */
    enabled?: boolean;
    /** 指示器下边界：不得高于该值（如固定筛选栏下沿），px */
    indicatorMin?: number;
    /** 第一张内容距滚动区顶部的距离（px）：指示器贴到它上方 */
    contentOffset?: number;
    /** 触发松手刷新所需距离（px） */
    threshold?: number;
    lowerThreshold?: number;
    enhanced?: boolean;
    showScrollbar?: boolean;
  }>(),
  {
    refreshing: false,
    enabled: true,
    indicatorMin: 0,
    contentOffset: 0,
    threshold: 60,
    lowerThreshold: 50,
    enhanced: false,
    showScrollbar: true
  }
);

const emit = defineEmits<{
  (e: 'update:refreshing', value: boolean): void;
  (e: 'refresh'): void;
  (e: 'scroll' | 'scrolltolower', ev: unknown): void;
}>();

const INDICATOR_PX = 56;

// 当前下拉距离：refresherpulling / refresherstatuschange 都可能带 dy
const pullDy = ref(0);
const refresherBackground = computed(
  () => THEME_COLORS[themeStore.effectiveTheme].page
);
const indicatorVisible = computed(() => props.refreshing || pullDy.value > 0);
// 指示器顶部 = 第一张卡片上方；同时不低于 indicatorMin（筛选栏下沿）
const indicatorTop = computed(() =>
  Math.max(
    props.indicatorMin,
    props.contentOffset + pullDy.value - INDICATOR_PX
  )
);

function onRefresherPulling(e: unknown) {
  const dy = (e as { detail?: { dy?: number } } | undefined)?.detail?.dy;
  if (typeof dy === 'number') {
    pullDy.value = Math.max(dy, 0);
  }
}

function onRefresherRefresh() {
  pullDy.value = props.threshold;
  emit('update:refreshing', true);
  emit('refresh');
}

function onRefresherRestore() {
  pullDy.value = 0;
}

function onScroll(e: unknown) {
  emit('scroll', e);
}

function onScrollToLower(e: unknown) {
  emit('scrolltolower', e);
}
</script>

<style lang="scss">
// 组件宿主节点默认是 inline，父级给的 width/height:100% 在非 flex 容器里会失效
:host {
  display: block;
}
</style>

<style lang="scss" scoped>
.mwp-scroll-wrap {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.mwp-scroll-view {
  width: 100%;
  height: 100%;
}

.mwp-refresher-slot {
  width: 100%;
}

.mwp-refresher {
  position: absolute;
  left: 0;
  right: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 112rpx;
  pointer-events: none;
}

.mwp-refresher__body {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $space-3;
}

.mwp-refresher__spinner {
  width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
  // 刚下拉时是空圈；只有真正刷新时才出现彩色缺口并旋转
  border: 4rpx solid $border-color-light;
  box-sizing: border-box;

  .dark-theme & {
    border-color: $border-color-medium-dark;
  }

  &.is-spinning {
    border-top-color: $brand-red;
    animation: mwp-refresh-spin $motion-spin linear infinite;

    .dark-theme & {
      border-top-color: $brand-red-soft;
    }
  }
}

.mwp-refresher__text {
  font-size: $font-sm;
  color: $text-tertiary-light;

  .dark-theme & {
    color: $text-tertiary-dark;
  }
}

@keyframes mwp-refresh-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .mwp-refresher__spinner.is-spinning {
    animation: none;
  }
}
</style>
