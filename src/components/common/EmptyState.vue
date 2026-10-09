<template>
  <view
    class="empty-state"
    :class="[`tone-${tone}`, { compact }, themeStore.themeClass]"
    :style="minHeight ? { minHeight: minHeight + 'px' } : undefined"
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
import { useThemeStore } from '@/config';

const themeStore = useThemeStore();

withDefaults(
  defineProps<{
    title?: string;
    desc?: string;
    tone?: 'neutral' | 'danger' | 'info';
    compact?: boolean;
    /** 撑高自身，使其在无自由空间的滚动容器里也能相对可视区域居中（px） */
    minHeight?: number;
  }>(),
  { tone: 'neutral', compact: false, minHeight: 0 }
);
</script>

<style lang="scss">
/*
 * 小程序会把组件包一层自定义元素，内部根节点的 flex:1 无法让宿主撑开，
 * 导致空状态贴在容器顶部。这里直接作用于宿主节点，使其能在 flex 父容器中占满剩余空间。
 */
:host {
  display: flex;
  flex: 1 1 auto;
  min-height: 0;
  width: 100%;
}
</style>

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

  // 错误态：标题用品牌红区分「加载失败」与「暂无数据」
  .tone-danger & {
    color: $brand-red;

    .dark-theme & {
      color: $brand-red-soft;
    }
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
