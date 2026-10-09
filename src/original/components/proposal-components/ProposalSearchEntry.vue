<template>
  <view class="proposal-entry">
    <text class="proposal-hint">没有找到想要的课程？</text>
    <view
      class="proposal-action"
      hover-class="proposal-action-active"
      @click="goToPropose"
    >
      <text class="proposal-label">新增课程</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { navigateToPage } from '@/original/utils/navigation';

const goToPropose = () => {
  navigateToPage({
    url: "/original/pages/proposal/propose"
  });
};
</script>

<style scoped lang="scss">
.proposal-entry {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4vw;
  margin: 30rpx auto 8rpx;
  padding: 16rpx 24rpx;
  text-align: center;
}

.proposal-hint {
  color: #8a8a8a;
  font-size: 26rpx;
  line-height: 1.4;
}

.proposal-action {
  padding: 2vw 8vw;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  background-color: #b70030;
  border: none;
  border-radius: var(--app-component-radius, 5vw);
  box-shadow: 0 4px 12px rgba(183, 0, 48, 0.2);
}

.proposal-action-active {
  background-color: #9a0028;
  transform: scale(0.98);
}

.proposal-label {
  color: #ffffff;
  font-size: 3.5vw;
  font-weight: 400;
  line-height: 1;
}
</style>
