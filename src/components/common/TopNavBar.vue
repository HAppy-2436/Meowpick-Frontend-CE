<template>
  <view
    class="nav-bar"
    :class="themeStore.themeClass"
    :style="{
      height: navBarHeight + 'px',
      paddingTop: menuButtonInfo.top + 'px'
    }"
  >
    <!-- 用 minHeight：手机端行高 = 胶囊高度，标题带副标题时可撑高到下方留白里 -->
    <view class="nav-content" :style="{ minHeight: contentHeight + 'px' }">
      <view
        v-if="showBack"
        class="back-btn-wrapper"
        :style="{ width: contentHeight + 'px', height: '100%' }"
      >
        <BackBtn :intercept="interceptBack" @back="emit('back')" />
      </view>
      <view class="nav-title-container" :class="{ 'has-back': showBack }">
        <text v-if="title" class="nav-title">{{ title }}</text>
        <text v-if="subtitle" class="nav-subtitle">{{ subtitle }}</text>
      </view>
      <view v-if="$slots.right" class="nav-right">
        <slot name="right" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
/**
 * 统一顶部导航栏：自动适配胶囊、显隐返回按钮、可附 subtitle、可附右侧操作
 * 用法：
 *   <TopNavBar title="提案广场" :subtitle="`${total} 条记录`" />
 *   <TopNavBar title="详情" @back="goBack">
 *     <template #right><view @click="onShare" hover-class="mwp-hover" :hover-start-time="0" :hover-stay-time="0">分享</view></template>
 *   </TopNavBar>
 */
import BackBtn from './BackBtn.vue';
import { useMenuButton } from '@/composables/useMenuButton';
import { useThemeStore } from '@/config';

const themeStore = useThemeStore();

withDefaults(
  defineProps<{
    title?: string;
    subtitle?: string;
    showBack?: boolean;
    /** 强制 light 样式（避免某些深色渐变背景吃掉白字） */
    forceLight?: boolean;
    /** 拦截返回按钮，改为抛出 back 事件由页面自行处理 */
    interceptBack?: boolean;
  }>(),
  { showBack: true, interceptBack: false }
);

const emit = defineEmits<{ (e: 'back'): void }>();

// 胶囊位置与高度：统一走 composable，留白/行高按 rpx 换算，宽屏下不会被压扁
const { menuButtonInfo, navBarHeight, contentHeight } = useMenuButton();
</script>

<style lang="scss" scoped>
.nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background: rgba($bg-card-light, 0.95);
  border-radius: 0 0 $radius-card $radius-card;
  z-index: $z-navbar;
  box-shadow: $shadow-sm;

  &.dark-theme {
    background: rgba($bg-card-dark, 0.95);
    box-shadow: $shadow-sm-dark;
  }
}

.nav-content {
  display: flex;
  align-items: center;
  padding: 0 $space-7;
  box-sizing: border-box;
}

.back-btn-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.nav-title-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
  animation: mwp-fade-in $motion-pop $ease-standard backwards;

  &.has-back {
    margin-left: $space-4;
  }
  &:not(.has-back) {
    align-items: center;
  }
}

.nav-title {
  font-size: $font-xl;
  font-weight: $weight-bold;
  color: $text-primary-light;
  line-height: 1.2;
  @include ellipsis;

  .dark-theme & {
    color: $text-primary-dark;
  }
}

.nav-subtitle {
  font-size: $font-xs;
  color: $text-tertiary-light;
  margin-top: 4rpx;
  @include ellipsis;

  .dark-theme & {
    color: $text-tertiary-dark;
  }
}

.nav-right {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: $space-3;
}

@media (prefers-reduced-motion: reduce) {
  .nav-title-container {
    animation: none;
  }
}
</style>
