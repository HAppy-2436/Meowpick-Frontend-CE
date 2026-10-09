<template>
  <view class="main-container" :class="themeStore.themeClass">
    <!-- 顶部内容区 -->
    <swiper
      class="content-swiper"
      :current="currentIndex"
      :duration="300"
      @change="onSwiperChange"
      @transition="onSwiperTransition"
      @animationfinish="onSwiperAnimationFinish"
    >
      <!-- 首页（无刷新语义） -->
      <swiper-item>
        <MwpScrollView class="scroll-view" :enabled="false">
          <HomeView />
        </MwpScrollView>
      </swiper-item>

      <!-- 我的（无刷新语义） -->
      <swiper-item>
        <MwpScrollView class="scroll-view" :enabled="false">
          <ProfileView :active="profileActive" :entering="profileEntering" />
        </MwpScrollView>
      </swiper-item>
    </swiper>

    <!-- 头像层已移至 profile-view 内部（sticky 实现覆盖效果） -->

    <!-- 底部导航栏 -->
    <view
      class="bottom-tab-bar safe-area-bottom"
      :class="themeStore.themeClass"
      :style="[
        safeBottom === 0 ? { paddingBottom: '24rpx' } : {},
        {
          borderTopLeftRadius: radius + 'px',
          borderTopRightRadius: radius + 'px'
        }
      ]"
    >
      <!-- 文字容器 -->
      <view class="tabs-container">
        <view
          class="tab-item"
          :class="[themeStore.themeClass, { active: currentIndex === 0 }]"
          hover-class="mwp-hover"
          :hover-start-time="0"
          :hover-stay-time="0"
          @click="switchTab(0)"
        >
          首页
        </view>
        <view
          class="tab-item"
          :class="[themeStore.themeClass, { active: currentIndex === 1 }]"
          hover-class="mwp-hover"
          :hover-start-time="0"
          :hover-stay-time="0"
          @click="switchTab(1)"
        >
          我的
        </view>
      </view>

      <!-- 指示条 (独立图层) -->
      <view class="indicator-line" :style="{ left: indicatorLeft + '%' }" />
    </view>

    <!-- More Button - 移至 profile-view 内部，与筛选胶囊同步滚动 -->

    <!-- Popover 由 profile-view 触发 -->

    <!-- 全局状态弹窗宿主 -->
    <MwpStatusOverlay />
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import HomeView from '@/components/home/HomeView.vue';
import ProfileView from '@/components/profile/ProfileView.vue';
import { useThemeStore } from '@/config';
import { useScreenScale } from '@/composables/useScreenScale';
import { useViewport } from '@/composables/useViewport';
const themeStore = useThemeStore();

// 启动视口监听：窗口尺寸变化时下面的 computed 会自动重算
const viewport = useViewport();

const currentIndex = ref(0);
// 「我的」页是否已稳定激活：swiper 动画结束后才置真，
// 保证引导弹窗里的原生 chooseAvatar 按钮在无 transform 位移时创建
const profileActive = ref(false);
// 「我的」页正在滑入（点击切 tab 或滑动方向指向它时提前置真），
// 用于让引导浮层随页面一起出现，避免停稳后才弹出造成闪烁
const profileEntering = ref(false);
const indicatorLeft = ref(25); // 初始值 25%
// 滑动距离基准：跟随窗口宽度变化
const windowWidth = computed(() => viewport.width);
// 菜单栏底部补偿：有小白条用 CSS safe-area，没有的补 24rpx
// 圆角与首页卡片/搜索框同源，避免父子圆角打架
const radius = computed(() => useScreenScale().radius);
const safeBottom = computed(() => useScreenScale().safeBottom);

// ⋯ 按钮已迁回 profile-view 内部，与筛选胶囊同步滚动
// showMoreMenu / toggleMoreMenu / handleMenuClick 在 profile-view 中定义

function switchTab(index: number) {
  currentIndex.value = index;
  profileEntering.value = index === 1;
  if (index !== 1) profileActive.value = false;
}

function onSwiperChange(e: { detail: { current?: number } }) {
  // 仅仅处理 current 更新，不处理 UI 逻辑，避免冲突
  currentIndex.value = e.detail.current ?? 0;
}

function onSwiperTransition(e: { detail: { dx?: number } }) {
  // 核心逻辑：指示条跟随滑动
  // 两个 Tab 中心点距离为 50% (25 -> 75)
  // 滑动全程 (dx = windowWidth) 对应指示条移动 50%
  if (!windowWidth.value) return;

  const dx = e.detail.dx ?? 0;
  // 计算移动百分比
  const movePercent = (dx / windowWidth.value) * 50;

  // 基础位置：根据当前的 currentIndex 决定
  const baseLeft = currentIndex.value === 0 ? 25 : 75;

  let targetLeft = baseLeft + movePercent;

  // 边界限制，防止快速滑动时因 currentIndex 切换导致计算值飞出
  // 强制限制在 [25, 75] 区间内
  targetLeft = Math.max(25, Math.min(75, targetLeft));

  indicatorLeft.value = targetLeft;

  // 从首页滑向「我的」时提前标记进入，让引导浮层先于动画结束渲染
  if (currentIndex.value === 0 && dx > 0) {
    profileEntering.value = true;
  }
}

function onSwiperAnimationFinish(e: { detail: { current?: number } }) {
  // 动画结束后，强制校正位置，消除可能的浮点数误差
  currentIndex.value = e.detail.current ?? 0;
  profileEntering.value = currentIndex.value === 1;
  profileActive.value = currentIndex.value === 1;
  indicatorLeft.value = currentIndex.value === 0 ? 25 : 75;
}
</script>

<style lang="scss" scoped>
.main-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: $bg-page-light;
  transition: background-color $dur-medium $ease-standard;

  &.dark-theme {
    background-color: $bg-page-dark;
  }
}

.content-swiper {
  flex: 1;
  height: 100%;
  // swiper 默认白底，暗色下会露出一圈白边，显式跟随主题
  background-color: $bg-page-light;

  .dark-theme & {
    background-color: $bg-page-dark;
  }
}

.scroll-view {
  height: 100%;
  background-color: $bg-page-light;

  .dark-theme & {
    background-color: $bg-page-dark;
  }
}

.tab-bar-placeholder {
  height: 160rpx;
  width: 100%;
}

.bottom-tab-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: auto;
  min-height: 100rpx;
  background-color: rgba($bg-card-light, 0.98);
  border-top-left-radius: $radius-2xl;
  border-top-right-radius: $radius-2xl;
  @include safe-area-bottom;
  padding-bottom: calc(env(safe-area-inset-bottom) * 0.5);
  box-shadow: $shadow-up-light;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  border-top: none;
  transition: background-color $dur-medium $ease-standard,
    box-shadow $dur-medium $ease-standard;

  &.dark-theme {
    background-color: rgba($bg-card-dark, 0.98);
    box-shadow: $shadow-up-dark;
  }

  .tabs-container {
    display: flex;
    width: 100%;
    height: 100rpx;
    align-items: center;
    margin-top: 0;
    position: relative;
    z-index: $z-base;
  }

  .tab-item {
    flex: 1;
    padding-top: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: $font-lg-plus;
    color: $text-tertiary-light;
    font-weight: $weight-medium;
    @include mwp-transition($dur-instant, $ease-emphasized);
    cursor: pointer;

    .dark-theme & {
      color: $text-secondary-dark;

      &.active {
        color: $text-primary-dark;
      }
    }

    &:active {
      transform: scale($press-scale-md);
    }

    &.active {
      font-weight: $weight-bold;
      color: $text-primary-light;
      font-size: $font-xl;
    }
  }

  .indicator-line {
    position: absolute;
    top: 86rpx;
    bottom: auto;
    width: 48rpx;
    height: 8rpx;
    background: $gradient-brand-horizontal;
    border-radius: $radius-pill;
    transform: translateX(-50%);
    transition: left $dur-instant linear;
    z-index: $z-base + 1;
    box-shadow: $shadow-brand-sm;
  }
}
</style>
