<template>
  <view v-if="visible" class="mwp-sheet" @click="handleCancel">
    <view class="mwp-sheet__panel" @click.stop>
      <view class="mwp-sheet__handle" />
      <text v-if="title" class="mwp-sheet__title">{{ title }}</text>
      <text v-if="description" class="mwp-sheet__desc">{{ description }}</text>

      <view class="mwp-sheet__actions">
        <view
          v-for="action in actions"
          :key="action.value"
          class="mwp-sheet__action"
          :class="`tone-${action.tone || 'default'}`"
          hover-class="mwp-hover"
          @click="handleSelect(action)"
        >
          <text class="mwp-sheet__action-text">{{ action.label }}</text>
        </view>
      </view>

      <view
        v-if="cancelText"
        class="mwp-sheet__cancel"
        hover-class="mwp-hover"
        @click="handleCancel"
      >
        <text>{{ cancelText }}</text>
      </view>

      <view class="mwp-sheet__safe" />
    </view>
  </view>
</template>

<script setup lang="ts">
/**
 * 通用底部操作弹窗（替代原生 showActionSheet / showModal，统一品牌设计语言）
 *
 * 用法：
 *   <MwpActionSheet
 *     v-model:visible="show"
 *     title="发布提案"
 *     description="今日剩余可提交 2/3 个提案"
 *     :actions="[{ label: '确认发布', value: 'publish', tone: 'brand' }]"
 *     cancel-text="取消"
 *     @select="onSelect"
 *   />
 */
interface ActionItem {
  label: string;
  value: string;
  tone?: 'brand' | 'default' | 'danger';
}

withDefaults(
  defineProps<{
    visible: boolean;
    title?: string;
    description?: string;
    actions: ActionItem[];
    /** 传空字符串则不显示取消按钮 */
    cancelText?: string;
  }>(),
  { title: '', description: '', cancelText: '取消' }
);

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void;
  (e: 'select', value: string): void;
  (e: 'cancel'): void;
}>();

const close = () => {
  emit('update:visible', false);
};

const handleSelect = (action: ActionItem) => {
  emit('select', action.value);
  close();
};

const handleCancel = () => {
  emit('cancel');
  close();
};
</script>

<style lang="scss" scoped>
.mwp-sheet {
  position: fixed;
  inset: 0;
  z-index: $z-modal;
  background: $bg-overlay-light;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  animation: mwp-fade-in $motion-pop $ease-standard backwards;

  .dark-theme & {
    background: $bg-overlay-dark;
  }
}

.mwp-sheet__panel {
  width: 100%;
  box-sizing: border-box;
  padding: $space-4 $space-7 $space-4;
  background: $bg-card-light;
  border-radius: $radius-2xl $radius-2xl 0 0;
  animation: mwp-slide-up $motion-enter-lg $ease-decelerate backwards;

  .dark-theme & {
    background: $bg-card-dark;
  }
}

.mwp-sheet__handle {
  width: 72rpx;
  height: 8rpx;
  margin: 0 auto $space-5;
  border-radius: $radius-pill;
  background: $divider-light;

  .dark-theme & {
    background: $divider-dark;
  }
}

.mwp-sheet__title {
  display: block;
  font-size: $font-lg;
  font-weight: $weight-bold;
  color: $text-primary-light;
  text-align: center;
  margin-bottom: $space-4;

  .dark-theme & {
    color: $text-primary-dark;
  }
}

.mwp-sheet__desc {
  display: block;
  font-size: $font-sm;
  line-height: 1.6;
  color: $text-secondary-light;
  text-align: center;
  margin-bottom: $space-6;

  .dark-theme & {
    color: $text-secondary-dark;
  }
}

.mwp-sheet__actions {
  display: flex;
  flex-direction: column;
  gap: $space-4;
}

.mwp-sheet__action {
  height: 88rpx;
  border-radius: $radius-pill;
  display: flex;
  align-items: center;
  justify-content: center;
  @include mwp-transition($dur-fast, $ease-standard);

  &:active {
    transform: scale($press-scale-sm);
  }
}

.mwp-sheet__action-text {
  font-size: $font-lg;
  font-weight: $weight-semibold;
}

.mwp-sheet__action.tone-brand {
  background: $gradient-brand;
  box-shadow: $shadow-brand-sm;

  .mwp-sheet__action-text {
    color: $pure-white;
  }
}

.mwp-sheet__action.tone-default {
  background: $bg-muted-light;

  .mwp-sheet__action-text {
    color: $text-secondary-light;
  }

  .dark-theme & {
    background: $bg-muted-dark;

    .mwp-sheet__action-text {
      color: $text-secondary-dark;
    }
  }
}

.mwp-sheet__action.tone-danger {
  background: $danger-soft;

  .mwp-sheet__action-text {
    color: $brand-red;
  }

  .dark-theme & {
    .mwp-sheet__action-text {
      color: $brand-red-soft;
    }
  }
}

.mwp-sheet__cancel {
  margin-top: $space-5;
  height: 88rpx;
  border-radius: $radius-pill;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: $font-base;
  line-height: 1;
  color: $text-tertiary-light;
  @include mwp-transition($dur-fast, $ease-standard);

  .dark-theme & {
    color: $text-tertiary-dark;
  }

  &:active {
    background: $bg-muted-light;

    .dark-theme & {
      background: $bg-muted-dark;
    }
  }
}

.mwp-sheet__safe {
  height: env(safe-area-inset-bottom);
}

@media (prefers-reduced-motion: reduce) {
  .mwp-sheet,
  .mwp-sheet__panel {
    animation: none;
  }
}
</style>
