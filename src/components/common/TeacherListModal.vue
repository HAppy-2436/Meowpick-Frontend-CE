<template>
  <view v-if="visible" class="teacher-list-modal" @click="handleClose">
    <view class="teacher-list-modal__sheet" @click.stop>
      <view class="teacher-list-modal__header">
        <text class="teacher-list-modal__title">授课教师</text>
        <view class="teacher-list-modal__close" @click="handleClose">×</view>
      </view>

      <scroll-view scroll-y class="teacher-list-modal__body">
        <view v-if="teachers.length" class="teacher-list">
          <view
            v-for="(t, idx) in teachers"
            :key="idx"
            class="teacher-item mwp-stagger-item"
            :style="{ animationDelay: `${Math.min(idx * 60, 240)}ms` }"
          >
            <view class="teacher-info">
              <text class="teacher-name">{{ t.name }}</text>
              <text v-if="t.title" class="teacher-title">{{ t.title }}</text>
              <text v-if="t.department" class="teacher-dept">{{ t.department }}</text>
            </view>
            <view class="teacher-remove mwp-pressable" @click.stop="handleRemove(idx)">
              <text>×</text>
            </view>
          </view>
        </view>

        <view v-else class="empty-tip">
          <text class="empty-text">暂无教师信息</text>
          <text class="empty-hint">请点击下方按钮添加</text>
        </view>
      </scroll-view>

      <view class="teacher-list-modal__footer">
        <view class="add-btn mwp-pressable" @click="handleAdd">
          <text class="add-icon">+</text>
          <text class="add-text">添加教师</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
/**
 * 教师列表弹窗（提案填写页打开）
 * 接受受控的 teachers 数组 + add/remove 事件。
 */
import type { DtoProposalTeacherVO } from "@/api/data-contracts";

const props = defineProps<{
  visible: boolean;
  teachers: DtoProposalTeacherVO[];
}>();

const emit = defineEmits<{
  "update:visible": [val: boolean];
  add: [];
  remove: [index: number];
  close: [];
}>();

const handleAdd = () => emit("add");
const handleRemove = (idx: number) => emit("remove", idx);
const handleClose = () => {
  emit("close");
  emit("update:visible", false);
};
</script>

<style lang="scss" scoped>

.teacher-list-modal {
  position: fixed;
  inset: 0;
  background: $bg-overlay-light;
  z-index: $z-modal;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  animation: mwp-fade-in $motion-pop $ease-standard both;
}

.teacher-list-modal__sheet {
  width: 100%;
  max-height: 85vh;
  background: $bg-card-light;
  border-radius: $radius-2xl $radius-2xl 0 0;
  display: flex;
  flex-direction: column;
  animation: mwp-slide-up $motion-enter-lg $ease-decelerate both;
  transition: background-color $dur-medium $ease-standard;

  .dark-theme & {
    background: $bg-card-dark;
  }
}

.teacher-list-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $space-7;
  border-bottom: 1rpx solid $divider-light;
  flex-shrink: 0;
  transition: border-color $dur-fast $ease-standard;

  .dark-theme & {
    border-bottom-color: $divider-dark;
  }
}

.teacher-list-modal__title {
  font-size: $font-xl;
  font-weight: $weight-bold;
  color: $text-primary-light;
  transition: color $dur-fast $ease-standard;

  .dark-theme & {
    color: $text-primary-dark;
  }
}

.teacher-list-modal__close {
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

.teacher-list-modal__body {
  flex: 1;
  padding: $space-7;
  max-height: 60vh;
}

.teacher-list {
  display: flex;
  flex-direction: column;
  gap: $space-4;
}

.teacher-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $space-5 $space-7;
  background: $bg-muted-light;
  border-radius: $radius-md;
  @include mwp-transition($dur-fast, $ease-standard);

  .dark-theme & {
    background: $bg-muted-dark;
  }

  &:active {
    transform: scale($press-scale-sm);
  }
}

.teacher-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
  min-width: 0;
}

.teacher-name {
  font-size: $font-base;
  font-weight: $weight-semibold;
  color: $text-primary-light;
  @include ellipsis;
  transition: color $dur-fast $ease-standard;

  .dark-theme & {
    color: $text-primary-dark;
  }
}

.teacher-title {
  font-size: $font-xs;
  color: $brand-red;
  background: $danger-soft;
  padding: 2rpx $space-2;
  border-radius: $radius-xs;
  text-align: center;
  align-self: flex-start;
  align-self: flex-start;
}

.teacher-dept {
  font-size: $font-xs;
  color: $text-tertiary-light;
  @include ellipsis;
  transition: color $dur-fast $ease-standard;

  .dark-theme & {
    color: $text-tertiary-dark;
  }
}

.teacher-remove {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: transparent;
  color: $text-tertiary-light;
  font-size: $font-2xl;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: $space-4;
  @include mwp-transition($dur-fast, $ease-standard);

  .dark-theme & {
    color: $text-tertiary-dark;
  }

  &:active {
    background: $danger-soft;
    color: $brand-red;
    transform: scale(0.88);
  }
}

.empty-tip {
  text-align: center;
  padding: $space-12 $space-7;
  display: flex;
  flex-direction: column;
  gap: $space-3;
  animation: mwp-fade-in $motion-enter-lg $ease-decelerate both;
}

.empty-text {
  font-size: $font-base;
  color: $text-secondary-light;
  font-weight: $weight-medium;
  text-align: center;

  .dark-theme & {
    color: $text-secondary-dark;
  }
}

.empty-hint {
  font-size: $font-sm;
  color: $text-tertiary-light;

  .dark-theme & {
    color: $text-tertiary-dark;
  }
}

.teacher-list-modal__footer {
  padding: $space-5 $space-7 calc(#{$space-7} + env(safe-area-inset-bottom));
  flex-shrink: 0;
}

.add-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $space-3;
  height: 96rpx;
  border-radius: $radius-md;
  @include brand-button;
  font-size: $font-base;
  font-weight: $weight-semibold;
}

.add-icon {
  font-size: $font-2xl;
  line-height: 1;
}

.add-text {
  font-size: $font-base;
  text-align: center;
}

@media (prefers-reduced-motion: reduce) {
  .teacher-list-modal,
  .teacher-list-modal__sheet,
  .teacher-item {
    animation: none;
  }
}
</style>