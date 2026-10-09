<template>
  <!-- root-portal：脱离 swiper / scroll-view 等被 transform 的祖先，避免 fixed 被 tab bar 遮挡 -->
  <root-portal>
    <view
      v-if="visible"
      class="reject-modal"
      :class="themeStore.themeClass"
      :style="{ paddingBottom: keyboardHeight + 'px' }"
      @click="handleCancel"
    >
      <view class="reject-modal__sheet" :style="panelStyle" @click.stop>
        <view
          class="reject-modal__grabber"
          @touchstart="onTouchStart"
          @touchmove.stop.prevent="onTouchMove"
          @touchend="onTouchEnd"
          @touchcancel="onTouchEnd"
        >
          <view class="reject-modal__handle" />
        </view>
        <view class="reject-modal__header">
          <text class="reject-modal__title">拒绝提案</text>
        </view>

        <view class="reject-modal__body">
          <text class="reject-modal__label">
            拒绝原因
            <text class="reject-modal__required">*</text>
          </text>
          <view class="reject-modal__input-box">
            <textarea
              v-model="reason"
              class="reject-modal__textarea"
              placeholder="请填写拒绝原因，将展示给提案发布者"
              placeholder-class="mwp-placeholder--area"
              :maxlength="200"
              :adjust-position="false"
              auto-height
              @keyboardheightchange="onKeyboardHeightChange"
            />
            <text class="reject-modal__counter"
              >{{ reason.length }}/200 字</text
            >
          </view>
        </view>

        <view class="reject-modal__footer">
          <MwpButton
            class="reject-modal__btn"
            tone="plain"
            size="lg"
            block
            @click="handleCancel"
            >取消</MwpButton
          >
          <MwpButton
            class="reject-modal__btn"
            tone="brand"
            size="lg"
            block
            :disabled="!reason.trim()"
            @click="handleConfirm"
            >确认拒绝</MwpButton
          >
        </view>
      </view>
    </view>
  </root-portal>
</template>

<script setup lang="ts">
/**
 * 拒绝理由弹窗（管理员拒绝提案）
 *
 * 用法：
 *   <RejectModal v-model:visible="show" @confirm="onConfirm" />
 */
import { ref, watch } from 'vue';
import { useThemeStore } from '@/config';
import { useSwipeDownClose } from '@/composables/useSwipeDownClose';

const themeStore = useThemeStore();

const props = defineProps<{ visible: boolean }>();
const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void;
  (e: 'confirm', reason: string): void;
  (e: 'cancel'): void;
}>();

const reason = ref('');
// 键盘弹起高度（px）：底部 sheet 被 fixed 定位，adjust-position 顶不动，只能自己避让
const keyboardHeight = ref(0);

const onKeyboardHeightChange = (e: { detail: { height: number } }) => {
  keyboardHeight.value = e.detail.height || 0;
};

watch(
  () => props.visible,
  (val) => {
    if (val) reason.value = '';
    else keyboardHeight.value = 0;
  }
);

const handleCancel = () => {
  emit('update:visible', false);
  emit('cancel');
};

const handleConfirm = () => {
  const trimmed = reason.value.trim();
  if (!trimmed) return;
  emit('update:visible', false);
  emit('confirm', trimmed);
};

const { panelStyle, onTouchStart, onTouchMove, onTouchEnd } = useSwipeDownClose(
  {
    onClose: handleCancel
  }
);
</script>

<style lang="scss" scoped>
.reject-modal {
  position: fixed;
  inset: 0;
  background: $bg-overlay-light;
  z-index: $z-modal;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  animation: mwp-fade-in $motion-pop $ease-standard backwards;
  transition: padding-bottom $dur-medium $ease-standard;

  &.dark-theme {
    background: $bg-overlay-dark;
  }
}

.reject-modal__sheet {
  width: 100%;
  box-sizing: border-box;
  // 宽屏/矮视口下 rpx 会放大，限制高度并让内容区滚动，避免顶部被裁
  max-height: 85vh;
  background: $bg-card-light;
  border-radius: $radius-2xl $radius-2xl 0 0;
  padding: $space-4 0 calc(#{$space-7} + env(safe-area-inset-bottom));
  display: flex;
  flex-direction: column;
  animation: mwp-slide-up $motion-enter-lg $ease-decelerate backwards;
  transition: background-color $dur-medium $ease-standard;

  .dark-theme & {
    background: $bg-card-dark;
  }
}

.reject-modal__grabber {
  display: flex;
  justify-content: center;
  padding: $space-3 0 $space-5;
}

.reject-modal__handle {
  width: 72rpx;
  height: 8rpx;
  border-radius: $radius-pill;
  background: $divider-light;

  .dark-theme & {
    background: $divider-dark;
  }
}

.reject-modal__header {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 $space-7 $space-5;
  border-bottom: 1rpx solid $divider-light;
  transition: border-color $dur-fast $ease-standard;

  .dark-theme & {
    border-bottom-color: $divider-dark;
  }
}

.reject-modal__title {
  font-size: $font-lg;
  font-weight: $weight-bold;
  color: $text-primary-light;
  text-align: center;
  transition: color $dur-fast $ease-standard;

  .dark-theme & {
    color: $text-primary-dark;
  }
}

.reject-modal__body {
  padding: $space-7;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  min-height: 0;
}

.reject-modal__label {
  font-size: $font-base;
  font-weight: $weight-medium;
  color: $text-primary-light;
  margin-bottom: $space-4;
  display: block;
  transition: color $dur-fast $ease-standard;

  .dark-theme & {
    color: $text-primary-dark;
  }
}

.reject-modal__required {
  color: $brand-red;
  font-size: $font-sm;
  margin-left: 4rpx;

  .dark-theme & {
    color: $brand-red-soft;
  }
}

.reject-modal__input-box {
  @include textarea-box;
}

.reject-modal__textarea {
  @include textarea-field($min-height: 200rpx);
}

.reject-modal__counter {
  @include textarea-counter;
}

.reject-modal__footer {
  display: flex;
  gap: $space-5;
  padding: 0 $space-7;
}

.reject-modal__btn {
  flex: 1;
}

@media (prefers-reduced-motion: reduce) {
  .reject-modal,
  .reject-modal__sheet {
    animation: none;
  }
}
</style>

<!-- 原生 textarea 的 placeholder 不带 scoped 的 data-v 类，组件的 scoped 规则匹配不到；
     且自定义组件样式隔离后收不到 app.wxss 的全局工具类，故用非 scoped 块单独定义。 -->
<style lang="scss">
.mwp-placeholder--area {
  color: $text-placeholder-light;
  font-weight: 400;
  font-size: $font-base;
  line-height: 1.6;
  font-family: inherit;
}

.dark-theme .mwp-placeholder--area {
  color: $text-placeholder-dark;
}
</style>
