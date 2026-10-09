<template>
  <view class="find-page" :class="themeStore.themeClass">
    <FindView ref="findRef" :initial-mode="mode" />
    <MwpStatusOverlay />
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
  // 全新进入搜索页：清掉上次遗留的搜索状态，
  // 只有「从详情页返回」这种页面未销毁的 onShow 才恢复，避免搜索框自带旧关键词
  uni.removeStorageSync('find_page_state');
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
