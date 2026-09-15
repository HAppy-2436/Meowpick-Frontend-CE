<template>
  <view
    class="status-badge"
    :class="[`status-${tone}`, { 'is-pill': pill }]"
  >
    <view v-if="dot" class="status-dot"></view>
    <text class="status-text">{{ label }}</text>
  </view>
</template>

<script setup lang="ts">
/**
 * 状态徽标（统一提案/评论/审批状态展示）
 *
 * tone: pending | approved | rejected | info | warning | neutral
 * pill: 是否胶囊样式（默认直角徽标）
 */
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    status?: "pending" | "approved" | "rejected" | string;
    tone?: string;
    label?: string;
    pill?: boolean;
    dot?: boolean;
  }>(),
  { pill: false, dot: false }
);

const TONE_MAP: Record<string, { label: string; tone: string }> = {
  pending: { label: "审批中", tone: "warning" },
  approved: { label: "已通过", tone: "success" },
  rejected: { label: "已拒绝", tone: "danger" },
  info: { label: "信息", tone: "info" },
  warning: { label: "提醒", tone: "warning" },
  danger: { label: "异常", tone: "danger" },
  success: { label: "成功", tone: "success" },
  neutral: { label: "中性", tone: "neutral" },
};

const tone = computed(() => {
  if (props.tone) return props.tone;
  if (props.status) return TONE_MAP[props.status]?.tone ?? "neutral";
  return "neutral";
});

const label = computed(() => {
  if (props.label) return props.label;
  if (props.status) return TONE_MAP[props.status]?.label ?? props.status;
  return "";
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
  animation: mwp-pulse 2s ease infinite;
}

.status-text {
  white-space: nowrap;
}

// tone 变体
.status-success {
  color: $success;
  background: $success-soft;
  .dark-theme & { color: $success-text-dark; }
}
.status-warning {
  color: $warning-text;
  background: $warning-soft;
  .dark-theme & { color: $warning-text-dark; }
}
.status-danger {
  color: $danger;
  background: $danger-soft;
  .dark-theme & { color: $brand-red-soft; }
}
.status-info {
  color: $info;
  background: $info-soft;
  .dark-theme & { color: $info-text-dark; }
}
.status-neutral {
  color: $text-secondary-light;
  background: $bg-muted-light;
  .dark-theme & {
    color: $text-secondary-dark;
    background: $bg-muted-dark;
  }
}

@media (prefers-reduced-motion: reduce) {
  .status-dot {
    animation: none;
  }
}
</style>