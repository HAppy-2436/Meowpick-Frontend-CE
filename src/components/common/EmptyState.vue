<template>
  <view
    class="empty-state"
    :class="[`tone-${tone}`, { compact }]"
    @click="$emit('click')"
  >
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
withDefaults(
  defineProps<{
    title?: string;
    desc?: string;
    tone?: 'neutral' | 'danger' | 'info';
    compact?: boolean;
  }>(),
  { tone: 'neutral', compact: false }
);

defineEmits<{ (e: 'click'): void }>();
</script>

<style lang="scss" scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1 1 auto;
  width: 100%;
  box-sizing: border-box;
  padding: 96rpx 32rpx;
  text-align: center;
  animation: mwp-fade-in $dur-slow ease backwards;

  &:active {
    transform: scale($press-scale-sm);
  }

  &.compact {
    padding: 48rpx 24rpx;
  }
}

.empty-title {
  font-size: $font-lg;
  font-weight: $weight-semibold;
  color: $text-secondary-light;
  margin-bottom: $space-3;
  text-align: center;
  .dark-theme & {
    color: $text-secondary-dark;
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
