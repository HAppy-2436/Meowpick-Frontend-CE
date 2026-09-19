<template>
  <view class="find-page" :class="themeStore.themeClass">
    <FindView ref="findRef" :initial-mode="mode" />
  </view>
</template>

<script setup lang="ts">
import FindView from '@/components/find/FindView.vue';
import { onShow, onLoad } from '@dcloudio/uni-app';
import { ref } from 'vue';
import { useThemeStore } from '@/config';

const themeStore = useThemeStore();

const mode = ref('');
const findRef = ref<{ resumeState?: () => void } | null>(null);

onLoad((options: Record<string, string> = {}) => {
  if (options && options.mode) {
    mode.value = options.mode;
  }
});

onShow(() => {
  try {
    uni.hideTabBar();
  } catch (e) {}
  if (findRef.value && findRef.value.resumeState) {
    findRef.value.resumeState();
  }
});
</script>

<style lang="scss" scoped src="./index.scss" />
