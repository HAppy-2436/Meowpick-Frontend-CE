<template>
  <view
    class="status-badge"
    :class="[`status-${tone}`, { 'is-pill': pill }, themeStore.themeClass]"
  >
    <view v-if="dot" class="status-dot" />
    <text class="status-text">{{ label }}</text>
  </view>
</template>

<script setup lang="ts">
/**
 * 状态徽标（统一提案/评论/审批状态展示）
 *
 * tone: pending | approved | rejected | info | warning | neutral
 * pill: 胶囊样式（默认，符合「标签一律胶囊」规范）；传 false 可退化为圆角矩形
 */
import { computed } from 'vue';
import { useThemeStore } from '@/config';

const themeStore = useThemeStore();

const props = withDefaults(
  defineProps<{
    status?: string;
    tone?: string;
    label?: string;
    pill?: boolean;
    dot?: boolean;
  }>(),
  { pill: true, dot: false }
);

const TONE_MAP: Record<string, { label: string; tone: string }> = {
  pending: { label: '投票中', tone: 'neutral' },
  approved: { label: '已通过', tone: 'success' },
  rejected: { label: '已拒绝', tone: 'danger' },
  info: { label: '信息', tone: 'info' },
  warning: { label: '提醒', tone: 'warning' },
  danger: { label: '异常', tone: 'danger' },
  success: { label: '成功', tone: 'success' },
  neutral: { label: '中性', tone: 'neutral' }
};

const tone = computed(() => {
  if (props.tone) return props.tone;
  if (props.status) return TONE_MAP[props.status]?.tone ?? 'neutral';
  return 'neutral';
});

const label = computed(() => {
  if (props.label) return props.label;
  if (props.status) return TONE_MAP[props.status]?.label ?? props.status;
  return '';
});
</script>

<style lang="scss" scoped>
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6rpx;
  padding: 6rpx 14rpx;
  border-radius: $radius-xs;
  font-size: $font-xs;
  font-weight: $weight-semibold;
  line-height: 1;
  transition: background-color $dur-fast $ease-standard;

  &.is-pill {
    border-radius: $radius-pill;
  }
}

.status-dot {
  width: 8rpx;
  height: 8rpx;
  border-radius: 50%;
  background: currentColor;
  animation: mwp-pulse $motion-pulse $ease-standard infinite;
}

.status-text {
  white-space: nowrap;
}

// tone 变体
.status-success {
  color: $success;
  background: $success-soft;
  border: 1rpx solid $success-border;
  &.dark-theme {
    color: $success-text-dark;
    background: $success-soft-dark;
    border-color: $success-border-dark;
  }
}
.status-warning {
  color: $warning-text;
  background: $warning-soft;
  border: 1rpx solid $warning-border;
  &.dark-theme {
    color: $warning-text-dark;
    background: $warning-soft-dark;
    border-color: $warning-border-dark;
  }
}
.status-danger {
  color: $danger;
  background: $danger-soft;
  border: 1rpx solid $danger-border;
  &.dark-theme {
    color: $brand-red-soft;
    background: $danger-soft-dark;
    border-color: $danger-border-dark;
  }
}
.status-info {
  color: $info;
  background: $info-soft;
  border: 1rpx solid $info-border;
  &.dark-theme {
    color: $info-text-dark;
    background: $info-soft-dark;
    border-color: $info-border-dark;
  }
}
.status-brand {
  color: $brand-red;
  background: $brand-red-tint;
  border: 1rpx solid $border-color-brand;
  &.dark-theme {
    color: $brand-red-soft;
    background: $brand-red-tint-dark;
    border-color: $border-color-brand-dark;
  }
}
.status-neutral {
  color: $text-secondary-light;
  background: $bg-muted-light;
  border: 1rpx solid $border-color-light;
  &.dark-theme {
    color: $text-secondary-dark;
    background: $bg-muted-dark;
    border-color: $border-color-medium-dark;
  }
}

@media (prefers-reduced-motion: reduce) {
  .status-dot {
    animation: none;
  }
}
</style>
