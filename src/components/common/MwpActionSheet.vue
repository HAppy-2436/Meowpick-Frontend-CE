<template>
  <!--
    root-portal：提升到页面根节点，脱离 swiper / scroll-view 等被 transform 的祖先。
    否则 fixed 会以 swiper-item 为包含块，弹窗底部被底部 tab bar 遮挡。
  -->
  <root-portal>
    <view
      v-if="visible"
      class="mwp-sheet"
      :class="themeStore.themeClass"
      @click="handleCancel"
    >
      <view
        class="mwp-sheet__panel"
        :style="[
          panelStyle,
          viewport.safeBottom === 0 ? { paddingBottom: '32rpx' } : {}
        ]"
        @click.stop
      >
        <view
          class="mwp-sheet__grabber"
          @touchstart="onTouchStart"
          @touchmove.stop.prevent="onTouchMove"
          @touchend="onTouchEnd"
          @touchcancel="onTouchEnd"
        >
          <view class="mwp-sheet__handle" />
        </view>
        <text v-if="title" class="mwp-sheet__title">{{ title }}</text>
        <text v-if="description" class="mwp-sheet__desc">{{
          description
        }}</text>

        <view class="mwp-sheet__actions">
          <view
            v-for="action in actions"
            :key="action.value"
            class="mwp-sheet__action"
            :class="`tone-${action.tone || 'default'}`"
            hover-class="mwp-hover"
            :hover-start-time="0"
            :hover-stay-time="0"
            @click="handleSelect(action)"
          >
            <text class="mwp-sheet__action-text">{{ action.label }}</text>
          </view>
        </view>

        <view
          v-if="cancelText"
          class="mwp-sheet__cancel"
          hover-class="mwp-hover"
          :hover-start-time="0"
          :hover-stay-time="0"
          @click="handleCancel"
        >
          <text>{{ cancelText }}</text>
        </view>

        <view class="mwp-sheet__safe" />
      </view>
    </view>
  </root-portal>
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
import { useThemeStore } from '@/config';
import { useSwipeDownClose } from '@/composables/useSwipeDownClose';
import { useViewport } from '@/composables/useViewport';

const themeStore = useThemeStore();
// 无小白条设备 env(safe-area-inset-bottom) 为 0，需补一段底部距离
const viewport = useViewport();

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

const { panelStyle, onTouchStart, onTouchMove, onTouchEnd } = useSwipeDownClose(
  {
    onClose: handleCancel
  }
);
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

  &.dark-theme {
    background: $bg-overlay-dark;
  }
}

.mwp-sheet__panel {
  width: 100%;
  box-sizing: border-box;
  // 有小白条：$space-4 + env()（原始位置）；无小白条：由内联样式补 32rpx
  padding: $space-5 $space-7 $space-4;
  background: $bg-card-light;
  border-radius: $radius-2xl $radius-2xl 0 0;
  animation: mwp-slide-up $motion-enter-lg $ease-decelerate backwards;

  .dark-theme & {
    background: $bg-card-dark;
  }
}

.mwp-sheet__grabber {
  display: flex;
  justify-content: center;
  padding: $space-3 0 $space-6;
}

.mwp-sheet__handle {
  width: 72rpx;
  height: 8rpx;
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

  .dark-theme & {
    background: $gradient-brand-dark;
  }

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

// 白底红边框：与确认弹窗的破坏性确认键一致，用于删除/撤回/不保存等操作
.mwp-sheet__action.tone-danger {
  box-sizing: border-box;
  background: $bg-card-light;
  border: 1rpx solid $danger;

  .mwp-sheet__action-text {
    color: $brand-red;
  }

  .dark-theme & {
    background: $bg-card-dark;
    border-color: $brand-red-soft;

    .mwp-sheet__action-text {
      color: $brand-red-soft;
    }
  }
}

.mwp-sheet__cancel {
  margin-top: $space-4;
  height: 64rpx;
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
