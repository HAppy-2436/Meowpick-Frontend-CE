<template>
  <view class="gateway" :class="themeStore.themeClass">
    <view class="gateway-logo">选课猫</view>
    <view class="gateway-hint">正在进入…</view>
  </view>
</template>

<script setup lang="ts">
import { relogin } from '@/utils/init';

const themeStore = useThemeStore();
const skinStore = useSkinStore();

onLoad(() => {
  // 旧版没有登录态维护能力：进入前强制重新登录一次，避免复用过期 token 导致无数据。
  // 不 await：旧版 http 的 waitForLogin 会等待这次登录完成后再发请求。
  if (skinStore.current === 'original') {
    relogin(true);
  }

  // 皮肤网关：仅作为主包启动页，读取当前皮肤后 reLaunch 到对应根页面。
  uni.reLaunch({
    url: skinStore.entryRoute,
    fail: (err) => {
      console.error('[gateway] 进入皮肤失败', skinStore.current, err);
      // 兜底：定制版始终存在于主包，避免卡死在网关页
      uni.reLaunch({ url: '/pages/layout/main' });
    }
  });
});
</script>

<style lang="scss" scoped>
.gateway {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: $bg-page-light;

  &.dark-theme {
    background-color: $bg-page-dark;
  }

  &-logo {
    font-size: $font-2xl;
    font-weight: $weight-bold;
    color: $brand-red;
    letter-spacing: 4rpx;

    .dark-theme & {
      color: $brand-red-soft;
    }
  }

  &-hint {
    margin-top: $space-6;
    font-size: $font-sm;
    color: $text-tertiary-light;

    .dark-theme & {
      color: $text-tertiary-dark;
    }
  }
}
</style>
