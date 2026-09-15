<template>
  <view class="back-btn" @click="handleBack" :style="customStyle">
    <view class="css-back-arrow" :class="{ 'is-light': color === '$bg-card-light' || color === 'white' }"></view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  customStyle?: string | Record<string, string>;
  color?: string;
}>();

const emit = defineEmits<{
  click: [];
  back: [];
}>();

const handleBack = () => {
  const pages = getCurrentPages();
  if (pages.length > 1) {
    uni.navigateBack({ delta: 1 });
  } else {
    uni.reLaunch({ url: '/pages/layout/main' });
  }
  emit('click');
};

const arrowStyle = computed(() => ({
  borderBottomColor: props.color || '$brand-red',
  borderLeftColor: props.color || '$brand-red'
}));
</script>

<style scoped lang="scss">

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  @include pressable(0.92);
}

// 圆头 chevron：两根圆角短棒绕同一顶点旋转，比「旋转方框」更精致
.css-back-arrow {
  position: relative;
  width: 24rpx;
  height: 24rpx;

  &::before,
  &::after {
    content: "";
    position: absolute;
    left: 4rpx;
    top: 10rpx;
    width: 14rpx;
    height: 4rpx;
    border-radius: 4rpx;
    background: $brand-red;
    transform-origin: 0 50%;
    transition: background-color $dur-fast $ease-standard;
  }

  &::before {
    transform: rotate(-45deg);
  }
  &::after {
    transform: rotate(45deg);
  }

  // 暗色下品牌红对比度偏低，提亮一档
  .dark-theme & {
    &::before,
    &::after {
      background: $brand-red-soft;
    }
  }

  &.is-light {
    &::before,
    &::after {
      background: $bg-card-light;
    }
  }
}
</style>