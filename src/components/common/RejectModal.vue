<template>
  <view v-if="visible" class="reject-modal" @click="handleCancel">
    <view class="reject-modal__sheet" @click.stop>
      <view class="reject-modal__header">
        <text class="reject-modal__title">拒绝提案</text>
        <view class="reject-modal__close" @click="handleCancel">×</view>
      </view>

      <view class="reject-modal__body">
        <text class="reject-modal__label">
          拒绝原因
          <text class="reject-modal__required">*</text>
        </text>
        <textarea
          v-model="reason"
          class="reject-modal__textarea"
          placeholder="请填写拒绝原因，将展示给提案提交者"
          placeholder-class="mwp-placeholder"
          :maxlength="200"
          auto-height
        />
        <view class="reject-modal__counter">{{ reason.length }}/200</view>
      </view>

      <view class="reject-modal__footer">
        <view class="reject-modal__btn reject-modal__btn--ghost mwp-pressable" @click="handleCancel">
          <text>取消</text>
        </view>
        <view
          class="reject-modal__btn reject-modal__btn--primary mwp-pressable"
          :class="{ 'is-disabled': !reason.trim() }"
          @click="handleConfirm"
        >
          <text>确认拒绝</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
/**
 * 拒绝理由弹窗（管理员拒绝提案）
 *
 * 用法：
 *   <RejectModal v-model:visible="show" @confirm="onConfirm" />
 */
import { ref, watch } from "vue";

const props = defineProps<{ visible: boolean }>();
const emit = defineEmits<{
  "update:visible": [val: boolean];
  confirm: [reason: string];
  cancel: [];
}>();

const reason = ref("");

watch(
  () => props.visible,
  (val) => {
    if (val) reason.value = "";
  }
);

const handleCancel = () => {
  emit("update:visible", false);
  emit("cancel");
};

const handleConfirm = () => {
  const trimmed = reason.value.trim();
  if (!trimmed) return;
  emit("update:visible", false);
  emit("confirm", trimmed);
};
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
  animation: mwp-fade-in 240ms $ease-standard both;
}

.reject-modal__sheet {
  width: 100%;
  background: $bg-card-light;
  border-radius: $radius-lg $radius-lg 0 0;
  padding-bottom: calc(#{$space-7} + env(safe-area-inset-bottom));
  display: flex;
  flex-direction: column;
  animation: mwp-slide-up 360ms $ease-decelerate both;
  transition: background-color $dur-medium $ease-standard;

  .dark-theme & {
    background: $bg-card-dark;
  }
}

.reject-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $space-7;
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
  transition: color $dur-fast $ease-standard;

  .dark-theme & {
    color: $text-primary-dark;
  }
}

.reject-modal__close {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: $font-2xl;
  color: $text-tertiary-light;
  @include mwp-transition($dur-fast, $ease-standard);

  .dark-theme & {
    color: $text-tertiary-dark;
  }

  &:active {
    background: $bg-muted-light;
    transform: scale($press-scale-lg);
    .dark-theme & {
      background: $bg-muted-dark;
    }
  }
}

.reject-modal__body {
  padding: $space-7;
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
}

.reject-modal__textarea {
  width: 100%;
  min-height: 200rpx;
  padding: $space-5;
  font-size: $font-base;
  line-height: 1.6;
  color: $text-primary-light;
  background: $bg-muted-light;
  border: 1rpx solid $divider-light;
  border-radius: $radius-sm;
  box-sizing: border-box;
  @include mwp-transition($dur-fast, $ease-standard);

  .dark-theme & {
    color: $text-primary-dark;
    background: $bg-muted-dark;
    border-color: $divider-dark;
  }

  &:focus {
    background: $bg-card-light;
    border-color: rgba(178, 0, 53, 0.30);
    box-shadow: 0 0 0 4rpx rgba(178, 0, 53, 0.08);
    .dark-theme & {
      background: $bg-card-dark;
    }
  }
}

.reject-modal__counter {
  text-align: right;
  font-size: $font-xs;
  color: $text-tertiary-light;
  margin-top: $space-2;
  transition: color $dur-fast $ease-standard;

  .dark-theme & {
    color: $text-tertiary-dark;
  }
}

.reject-modal__footer {
  display: flex;
  gap: $space-5;
  padding: 0 $space-7;
}

.reject-modal__btn {
  flex: 1;
  height: 88rpx;
  border-radius: $radius-pill;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: $font-base;
  font-weight: $weight-semibold;
  @include mwp-transition($dur-fast, $ease-standard);

  &--ghost {
    background: $bg-muted-light;
    color: $text-secondary-light;

    .dark-theme & {
      background: $bg-muted-dark;
      color: $text-secondary-dark;
    }
  }

  &--primary {
    background: linear-gradient(135deg, #ff4d4f, #ff7875);
    color: $pure-white;
    box-shadow: 0 4rpx 12rpx rgba(255, 77, 79, 0.30);
  }

  &.is-disabled {
    opacity: 0.45;
    pointer-events: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .reject-modal,
  .reject-modal__sheet {
    animation: none;
  }
}
</style>