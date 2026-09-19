<script setup lang="ts">
import { Init } from '@/utils/init';
import { useThemeStore } from '@/config';
import { THEME_COLORS } from '@/config/theme-colors';
const themeStore = useThemeStore();

onLaunch(() => {
  applyThemeToNativeBar(themeStore.mode);
  Init();
});
onShow(() => {});
onHide(() => {});

watch(
  () => themeStore.mode,
  (mode) => {
    applyThemeToNativeBar(mode);
  }
);

function applyThemeToNativeBar(mode: 'light' | 'dark') {
  const colors = THEME_COLORS[mode];
  try {
    uni.setNavigationBarColor({
      // 微信原生 API 的 frontColor 仅接受 #ffffff / #000000，非设计 token
      frontColor: mode === 'dark' ? '#ffffff' : '#000000',
      backgroundColor: colors.card,
      animation: { duration: 0, timingFunc: 'linear' }
    });
    uni.setBackgroundColor?.({
      backgroundColor: colors.page,
      backgroundColorTop: colors.page,
      backgroundColorBottom: colors.page
    });
  } catch (e) {}
}
</script>
<template>
  <view :class="themeStore.themeClass">
    <slot />
  </view>
</template>
<style lang="scss">
@import 'nutui-uniapp/styles/index';

page {
  width: 100%;
  height: 100%;
}

view {
  box-sizing: border-box;
}

input {
  box-sizing: border-box;
}
</style>
