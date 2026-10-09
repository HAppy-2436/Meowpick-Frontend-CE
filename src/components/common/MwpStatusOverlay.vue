<template>
  <!-- root-portal：脱离 swiper / scroll-view 等被 transform 的祖先，避免 fixed 被 tab bar 遮挡 -->
  <root-portal>
    <view
      v-if="status.visible"
      class="mwp-status mwp-fade-in"
      :class="[themeStore.themeClass, { 'is-blocking': status.mask }]"
    >
      <view v-if="status.mask" class="mwp-status__mask" />

      <view class="mwp-status__card mwp-scale-in">
        <view class="mwp-status__icon-slot">
          <view v-if="status.type === 'loading'" class="mwp-status__spinner" />
          <view v-else class="mwp-status__icon" :class="`is-${status.type}`">
            <MwpIcon :name="iconName" size="64rpx" />
          </view>
        </view>

        <text v-if="status.text" class="mwp-status__text">{{
          status.text
        }}</text>
      </view>
    </view>

    <!-- 常驻登录引导：与瞬态状态弹窗同为居中卡片，重新登录成功 / 后端恢复前一直显示 -->
    <view
      v-if="showGuide"
      class="mwp-guide mwp-fade-in"
      :class="themeStore.themeClass"
    >
      <view class="mwp-guide__card mwp-scale-in">
        <view class="mwp-guide__icon-slot">
          <MwpIcon name="log-in" size="64rpx" class="mwp-guide__icon" />
        </view>
        <text class="mwp-guide__text">{{ BACKEND_GUIDE_TITLE }}</text>
      </view>
    </view>
  </root-portal>
</template>

<script setup lang="ts">
/**
 * 全局状态弹窗宿主 + 视觉。
 *
 * 每个页面在根节点挂载一次 <MwpStatusOverlay />，即可接收 useStatus() 的
 * showLoading / showSuccess / showError / showInfo 调用。
 * 所有状态共用同一张居中卡片与同一坐标：loading 换 spinner + 遮罩，
 * 结果态换图标 + 无遮罩自动消失。
 */
import { computed } from 'vue';
import { useThemeStore } from '@/config';
import { useStatus } from '@/composables/useStatus';
import {
  guideState as guide,
  BACKEND_GUIDE_TITLE
} from '@/utils/backend-status';
import type { IconName } from '@/icons';

const themeStore = useThemeStore();
const { state: status } = useStatus();

// 刷新中（loading）时收起常驻引导；loading 结束且后端仍不可用（guide.visible 仍为 true）时自动回归
const showGuide = computed(
  () => guide.visible && !(status.visible && status.type === 'loading')
);

const iconName = computed<IconName>(() => {
  switch (status.type) {
    case 'success':
      return 'circle-check';
    case 'error':
      return 'circle-x';
    case 'info':
      return 'message-circle';
    default:
      return 'circle-check';
  }
});
</script>

<style lang="scss" scoped>
.mwp-status {
  position: fixed;
  inset: 0;
  z-index: $z-toast;
  display: flex;
  align-items: center;
  justify-content: center;
  // 结果提示不阻断页面交互；loading 通过 is-blocking 打开
  pointer-events: none;
}

.mwp-status.is-blocking {
  pointer-events: auto;
}

// 常驻登录引导：与状态弹窗同坐标的居中卡片，不阻断交互
.mwp-guide {
  position: fixed;
  inset: 0;
  z-index: $z-toast;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;

  &__card {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: $space-6;
    min-width: 200rpx;
    max-width: 520rpx;
    padding: $space-8 $space-9;
    border-radius: $radius-card;
    background: $bg-card-light;
    box-shadow: $shadow-xl;
    transition: background-color $dur-fast $ease-standard;

    .dark-theme & {
      background: $bg-card-dark;
      box-shadow: $shadow-xl-dark;
    }
  }

  &__icon-slot {
    width: 64rpx;
    height: 64rpx;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__icon {
    color: $brand-red;

    .dark-theme & {
      color: $brand-red-soft;
    }
  }

  &__text {
    font-size: $font-md;
    font-weight: $weight-medium;
    color: $text-primary-light;
    text-align: center;

    .dark-theme & {
      color: $text-primary-dark;
    }
  }
}

.mwp-status__mask {
  position: absolute;
  inset: 0;
  background: $bg-overlay-light;

  .dark-theme & {
    background: $bg-overlay-dark;
  }
}

.mwp-status__card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: $space-6;
  min-width: 200rpx;
  max-width: 520rpx;
  padding: $space-8 $space-9;
  border-radius: $radius-card;
  background: $bg-card-light;
  box-shadow: $shadow-xl;
  transition: background-color $dur-fast $ease-standard;

  .dark-theme & {
    background: $bg-card-dark;
    box-shadow: $shadow-xl-dark;
  }
}

// 固定图标槽位，保证 loading 与结果态卡片尺寸一致、切换时不跳动
.mwp-status__icon-slot {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mwp-status__icon {
  display: flex;
  align-items: center;
  justify-content: center;

  &.is-success {
    color: $success;
    .dark-theme & {
      color: $success-text-dark;
    }
  }

  &.is-error {
    color: $brand-red;
    .dark-theme & {
      color: $brand-red-soft;
    }
  }

  &.is-info {
    color: $info;
    .dark-theme & {
      color: $info-text-dark;
    }
  }
}

.mwp-status__spinner {
  width: 64rpx;
  height: 64rpx;
  border: 6rpx solid $brand-red-ring;
  border-top-color: $brand-red;
  border-radius: 50%;
  animation: mwp-spin $motion-spin linear infinite;

  .dark-theme & {
    border-color: $brand-red-ring-dark;
    border-top-color: $brand-red-soft;
  }
}

.mwp-status__text {
  font-size: $font-md;
  font-weight: $weight-medium;
  color: $text-primary-light;
  text-align: center;

  .dark-theme & {
    color: $text-primary-dark;
  }
}

@media (prefers-reduced-motion: reduce) {
  .mwp-status__spinner {
    animation: none;
  }
}
</style>
