<template>
  <view
    class="empty-state"
    :class="[`tone-${tone}`, { compact }]"
    @click="$emit('click')"
  >
    <view class="empty-illust">
      <text class="empty-emoji">{{ emoji }}</text>
    </view>
    <view v-if="title" class="empty-title">{{ title }}</view>
    <view v-if="desc" class="empty-desc">{{ desc }}</view>
    <view v-if="$slots.action" class="empty-action">
      <slot name="action" />
    </view>
  </view>
</template>

<script setup lang="ts">
/**
 * 空状态 / 错误状态 通用组件
 * 替换所有页面里散落的 v-else-if="empty" 模板
 */
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    title?: string;
    desc?: string;
    emoji?: string;
    tone?: "neutral" | "danger" | "info";
    compact?: boolean;
  }>(),
  { tone: "neutral", compact: false, emoji: "🐾" }
);

defineEmits<{ click: [] }>();

const emoji = computed(() => props.emoji);
</script>

<style lang="scss" scoped>

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 96rpx 32rpx;
  text-align: center;
  animation: mwp-fade-in 400ms ease both;

  &:active {
    transform: scale($press-scale-sm);
  }

  &.compact {
    padding: 48rpx 24rpx;
  }
}

.empty-illust {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: $space-6;
  background: $gradient-brand-soft;

  .tone-danger & {
    background: linear-gradient(135deg, rgba(178, 0, 53, 0.08) 0%, rgba(178, 0, 53, 0.02) 100%);
  }
  .tone-info & {
    background: linear-gradient(135deg, rgba(0, 102, 204, 0.08) 0%, rgba(0, 102, 204, 0.02) 100%);
  }
  .tone-neutral & {
    background: linear-gradient(135deg, rgba(0, 0, 0, 0.04) 0%, rgba(0, 0, 0, 0.01) 100%);
  }

  .dark-theme & {
    .tone-neutral & {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.01) 100%);
    }
  }
}

.empty-emoji {
  font-size: 72rpx;
  line-height: 1;
}

.empty-title {
  font-size: $font-lg;
  font-weight: $weight-semibold;
  color: $text-primary-light;
  margin-bottom: $space-3;
  text-align: center;
  .dark-theme & {
    color: $text-primary-dark;
  }
}

.empty-desc {
  font-size: $font-base;
  color: $text-tertiary-light;
  line-height: 1.6;
  max-width: 80%;
  text-align: center;
  .dark-theme & {
    color: $text-tertiary-dark;
  }
}

.empty-action {
  margin-top: $space-7;
  text-align: center;
}

@media (prefers-reduced-motion: reduce) {
  .empty-state {
    animation: none;
  }
}
</style>