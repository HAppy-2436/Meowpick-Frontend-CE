<script setup lang="ts">
import { Init } from '@/utils/init';
import { useThemeStore } from '@/config';
import { applyThemeToNativeBar } from '@/utils/native-theme';
const themeStore = useThemeStore();

onLaunch(() => {
  themeStore.syncSystemTheme();
  applyThemeToNativeBar(themeStore.effectiveTheme);
  // 系统深浅色切换（需 app.json 声明 darkmode: true 才会触发）
  uni.onThemeChange((res) => {
    themeStore.setSystemTheme(res.theme);
  });
  Init();
});
onShow(() => {
  // onLaunch 时可能尚无页面上下文，原生 API 会静默失败；
  // 首屏 onShow 再同步一次，避免冷启动深色模式转场闪浅色。
  // 同时重新读取系统主题，覆盖 App 后台期间错过的切换事件。
  themeStore.syncSystemTheme();
  applyThemeToNativeBar(themeStore.effectiveTheme);
});
onHide(() => {});

/**
 * 打开不存在的页面（例如入口带了已废弃的路径）时触发。
 * 不注册它微信会直接弹原生「页面不存在」页（手机端没有「进入首页」按钮，会卡死）。
 * 这里记录真实缺失路径，并兜底跳主包定制版首页，保证用户不会被困住。
 */
onPageNotFound((res) => {
  console.error(
    '[app] 页面不存在',
    res.path,
    res.query,
    'entry=',
    res.isEntryPage
  );
  try {
    uni.setStorageSync('__not_found_path', res.path || '');
  } catch (e) {}
  // 回到入口网关，让它按当前皮肤正常分流（而不是写死进定制版）。
  // 若连网关都不存在（极端情况），再退到主包定制版，避免二次进入不存在页。
  const fallback =
    res.path === 'pages/gateway/gateway'
      ? '/pages/layout/main'
      : '/pages/gateway/gateway';
  uni.reLaunch({ url: fallback });
});

watch(
  () => themeStore.effectiveTheme,
  (theme) => {
    applyThemeToNativeBar(theme);
  }
);
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
