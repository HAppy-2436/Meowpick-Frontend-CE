<template>
  <view class="nav-bar" :style="{ height: navBarHeight + 'px', paddingTop: menuButtonInfo.top + 'px' }">
    <view class="nav-content" :style="{ height: menuButtonInfo.height + 'px' }">
      <view
        v-if="showBack"
        class="back-btn-wrapper"
        :style="{ width: menuButtonInfo.height + 'px', height: '100%' }"
      >
        <BackBtn />
      </view>
      <view class="nav-title-container" :class="{ 'has-back': showBack }">
        <text v-if="title" class="nav-title">{{ title }}</text>
        <text v-if="subtitle" class="nav-subtitle">{{ subtitle }}</text>
      </view>
      <view v-if="$slots.right" class="nav-right">
        <slot name="right" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
/**
 * 统一顶部导航栏：自动适配胶囊、显隐返回按钮、可附 subtitle、可附右侧操作
 * 用法：
 *   <TopNavBar title="提案广场" :subtitle="`${total} 条记录`" />
 *   <TopNavBar title="详情" @back="goBack">
 *     <template #right><view @click="onShare">分享</view></template>
 *   </TopNavBar>
 */
import { computed } from "vue";
import BackBtn from "./BackBtn.vue";

const props = withDefaults(
  defineProps<{
    title?: string;
    subtitle?: string;
    showBack?: boolean;
    /** 强制 light 样式（避免某些深色渐变背景吃掉白字） */
    forceLight?: boolean;
  }>(),
  { showBack: true }
);

const emit = defineEmits<{ back: [] }>();

// 胶囊位置计算
const sysInfo = uni.getSystemInfoSync();
let menuButtonInfo = {
  top: sysInfo.statusBarHeight ? sysInfo.statusBarHeight + 4 : 48,
  height: 32
};
try {
  const res = uni.getMenuButtonBoundingClientRect();
  if (res && res.top) {
    menuButtonInfo = { top: res.top, height: res.height };
  }
} catch (e) {}

const navBarHeight = computed(() => (menuButtonInfo.top || 0) + (menuButtonInfo.height || 0) + 12);
</script>

<style lang="scss" scoped>

.nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background: rgba(255, 255, 255, 0.95);
  z-index: $z-navbar;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.04);

  .dark-theme & {
    background: rgba(30, 30, 30, 0.95);
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.20);
  }
}

.nav-content {
  display: flex;
  align-items: center;
  padding: 0 $space-7;
  box-sizing: border-box;
}

.back-btn-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.nav-title-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
  animation: mwp-fade-in $motion-pop ease backwards;

  &.has-back {
    margin-left: $space-4;
  }
  &:not(.has-back) {
    align-items: center;
  }
}

.nav-title {
  font-size: $font-xl;
  font-weight: $weight-bold;
  color: $text-primary-light;
  line-height: 1.2;
  letter-spacing: -1rpx;
  @include ellipsis;

  .dark-theme & {
    color: $text-primary-dark;
  }
}

.nav-subtitle {
  font-size: $font-xs;
  color: $text-tertiary-light;
  margin-top: 4rpx;
  @include ellipsis;

  .dark-theme & {
    color: $text-tertiary-dark;
  }
}

.nav-right {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: $space-3;
}
</style>