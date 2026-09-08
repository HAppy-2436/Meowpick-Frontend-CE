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
  uni.navigateBack({
    delta: 1,
    fail: () => {
      uni.switchTab({
        url: '/pages/home/home'
      });
    }
  });
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

.css-back-arrow {
  width: 22rpx;
  height: 22rpx;
  transform: rotate(45deg);
  margin-left: 2rpx;
  border-bottom: 4.5rpx solid $brand-red;
  border-left: 4.5rpx solid $brand-red;
  border-radius: 4rpx;
  transition: border-color $dur-fast $ease-standard;

  &.is-light {
    border-bottom-color: $bg-card-light;
    border-left-color: $bg-card-light;
  }
}
</style>