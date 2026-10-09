<template>
  <view
    class="mwp-btn"
    :class="[
      `tone-${tone}`,
      `size-${size}`,
      { 'is-block': block, 'is-loading': loading, 'is-disabled': disabled },
      themeStore.themeClass
    ]"
    hover-class="mwp-hover"
    :hover-start-time="0"
    :hover-stay-time="0"
    @click="handleClick"
  >
    <view v-if="loading" class="mwp-btn-spinner" />
    <slot v-else name="icon" />
    <text v-if="icon && !loading" class="mwp-btn-icon">{{ icon }}</text>
    <text class="mwp-btn-label"><slot /></text>
  </view>
</template>

<script setup lang="ts">
/**
 * 通用按钮
 *
 * tone:  brand（红渐变） | primary（实色） | ghost（红描边） | danger（淡红底） | danger-outline（白底红边框） | plain
 * size:  sm | md | lg
 * block: 通栏
 * slots: 默认 = 文案；#icon = 前置图标（可放 <MwpIcon> 等自定义节点）
 */
import { withDefaults } from 'vue';
import { useThemeStore } from '@/config';

const themeStore = useThemeStore();

const props = withDefaults(
  defineProps<{
    tone?:
      | 'brand'
      | 'primary'
      | 'ghost'
      | 'danger'
      | 'danger-outline'
      | 'plain';
    size?: 'sm' | 'md' | 'lg';
    block?: boolean;
    disabled?: boolean;
    loading?: boolean;
    icon?: string;
  }>(),
  { tone: 'brand', size: 'md', block: false, disabled: false, loading: false }
);

const emit = defineEmits<{ (e: 'click', ev: { detail?: unknown }): void }>();

const handleClick = (e: { detail?: unknown }) => {
  if (props.disabled || props.loading) return;
  emit('click', e);
};
</script>

<style lang="scss" scoped>
.mwp-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: $space-2;
  font-weight: $weight-semibold;
  border: 1rpx solid transparent;
  border-radius: $radius-pill;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  transition: transform $dur-fast $ease-emphasized,
    box-shadow $dur-base $ease-standard,
    background-color $dur-fast $ease-standard, opacity $dur-fast $ease-standard;

  &.is-block {
    display: flex;
    width: 100%;
  }

  &.is-disabled,
  &[disabled] {
    opacity: 0.5;
    pointer-events: none;
  }

  &.is-loading {
    .mwp-btn-label {
      opacity: 0.85;
    }
  }

  &:active:not(.is-disabled):not([disabled]) {
    transform: scale($press-scale-sm);
  }

  // 涟漪效果（点击时扩散）
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle, $ripple-white 10%, transparent 70%);
    opacity: 0;
    transform: scale(0);
    transition: opacity $dur-medium $ease-standard,
      transform $dur-medium $ease-standard;
    pointer-events: none;
  }

  &:active::after {
    opacity: 1;
    transform: scale(1);
    transition: 0s;
  }
}

// 尺寸
.size-sm {
  height: 56rpx;
  padding: 0 $space-5;
  font-size: $font-sm;
}
.size-md {
  height: 72rpx;
  padding: 0 $space-7;
  font-size: $font-base;
}
.size-lg {
  height: 88rpx;
  padding: 0 $space-8;
  font-size: $font-lg;
  font-weight: $weight-bold;
}

// tone 变体
.tone-brand {
  background: $gradient-brand;
  color: $pure-white;
  box-shadow: $shadow-brand-sm;
  &.dark-theme {
    background: $gradient-brand-dark;
  }
  &:active:not(.is-disabled):not([disabled]) {
    box-shadow: $shadow-brand-md;
  }
}

.tone-primary {
  background: $bg-card-light;
  color: $text-primary-light;
  border-color: $divider-light;
  &.dark-theme {
    background: $bg-card-dark;
    color: $text-primary-dark;
    border-color: $divider-card-dark;
  }
}

.tone-ghost {
  background: transparent;
  color: $brand-red;
  border-color: $border-color-brand-strong;
  &.dark-theme {
    color: $brand-red-soft;
    border-color: $border-color-brand-strong-dark;
  }
}

.tone-danger {
  background: $danger-soft;
  color: $brand-red;
  border-color: $danger-border;
  &.dark-theme {
    background: $danger-soft-dark;
    color: $brand-red-soft;
    border-color: $danger-border-dark;
  }
}

// 白底红边框：与提案页「拒绝」动作按钮一致，用于破坏性操作的确认键
.tone-danger-outline {
  background: $bg-card-light;
  color: $danger;
  border-color: $danger;
  &.dark-theme {
    background: $bg-card-dark;
    color: $brand-red-soft;
    border-color: $brand-red-soft;
  }
}

.tone-plain {
  background: $bg-muted-light;
  color: $text-secondary-light;
  &.dark-theme {
    background: $bg-muted-dark;
    color: $text-secondary-dark;
  }
}

// 加载 spinner
.mwp-btn-spinner {
  width: 32rpx;
  height: 32rpx;
  border: 3rpx solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: mwp-spin $motion-spin linear infinite;
}

.mwp-btn-icon {
  font-size: 1.1em;
  line-height: 1;
}

.mwp-btn-label {
  white-space: nowrap;
}

@media (prefers-reduced-motion: reduce) {
  .mwp-btn {
    transition: none;
    &::after {
      transition: none;
    }
    &:active {
      transform: none;
    }
  }
  .mwp-btn-spinner {
    animation: none;
  }
}
</style>
