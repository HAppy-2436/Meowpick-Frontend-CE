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
      <!-- 首页 -->
      <swiper-item>
        <scroll-view scroll-y class="scroll-view">
          <HomeView />
        </scroll-view>
      </swiper-item>

      <!-- 我的 -->
      <swiper-item>
        <scroll-view scroll-y class="scroll-view">
          <ProfileView />
        </scroll-view>
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
          @click="switchTab(0)"
        >
          首页
        </view>
        <view
          class="tab-item"
          :class="[themeStore.themeClass, { active: currentIndex === 1 }]"
          hover-class="mwp-hover"
          @click="onMyTabClick"
        >
          我的
        </view>
      </view>

      <!-- 指示条 (独立图层) -->
      <view class="indicator-line" :style="{ left: indicatorLeft + '%' }" />
    </view>

    <!-- More Button (☰) - 移至 profile-view 内部，与筛选胶囊同步滚动 -->

    <!-- Popover 由 profile-view 触发 -->

    <!-- 临时管理员验证弹窗 -->
    <view
      v-if="showAdminVerify"
      class="admin-verify-overlay"
      @click="showAdminVerify = false"
    >
      <view
        class="admin-verify-card"
        :class="themeStore.themeClass"
        @click.stop
      >
        <view class="admin-verify-header">
          <text class="admin-verify-title">管理员验证</text>
          <view
            class="admin-verify-close"
            hover-class="mwp-hover"
            @click="showAdminVerify = false"
            >×</view
          >
        </view>
        <view class="admin-verify-body">
          <text class="admin-verify-label">请输入管理员密码</text>
          <input
            v-model="adminPassword"
            class="admin-verify-input"
            type="text"
            password
            placeholder="请输入密码"
            @confirm="verifyAdminPassword"
          />
        </view>
        <view class="admin-verify-footer">
          <view
            class="admin-verify-btn admin-verify-btn--cancel"
            hover-class="mwp-hover"
            @click="showAdminVerify = false"
            >取消</view
          >
          <view
            class="admin-verify-btn admin-verify-btn--confirm"
            hover-class="mwp-hover"
            @click="verifyAdminPassword"
            >确认</view
          >
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { onShow, onLoad } from '@dcloudio/uni-app';
import HomeView from '@/components/home/HomeView.vue';
import ProfileView from '@/components/profile/ProfileView.vue';
import { useThemeStore } from '@/config';
import { useScreenScale } from '@/composables/useScreenScale';
import { useViewport } from '@/composables/useViewport';
const themeStore = useThemeStore();

// 启动视口监听：窗口尺寸变化时下面的 computed 会自动重算
const viewport = useViewport();

const currentIndex = ref(0);
const indicatorLeft = ref(25); // 初始值 25%
// 滑动距离基准：跟随窗口宽度变化
const windowWidth = computed(() => viewport.width);
// 菜单栏底部补偿：有小白条用 CSS safe-area，没有的补 24rpx
// 圆角与首页卡片/搜索框同源，避免父子圆角打架
const radius = computed(() => useScreenScale().radius);
const safeBottom = computed(() => useScreenScale().safeBottom);

// ⋯ 按钮已迁回 profile-view 内部，与筛选胶囊同步滚动
// showMoreMenu / toggleMoreMenu / handleMenuClick 在 profile-view 中定义

onLoad(() => {
  // 清除上次的临时管理员身份
  uni.removeStorageSync('meowpick_temp_admin');
});

// ===== 临时管理员验证 =====
const showAdminVerify = ref(false);
const adminPassword = ref('');
let tapCount = 0;
let tapTimer: ReturnType<typeof setTimeout> | null = null;

function onMyTabClick() {
  switchTab(1);
  tapCount++;
  if (tapTimer) clearTimeout(tapTimer);
  if (tapCount >= 5) {
    tapCount = 0;
    showAdminVerify.value = true;
    adminPassword.value = '';
  } else {
    tapTimer = setTimeout(() => {
      tapCount = 0;
    }, 2000);
  }
}

function verifyAdminPassword() {
  if (adminPassword.value === '123456') {
    uni.setStorageSync('meowpick_temp_admin', true);
    showAdminVerify.value = false;
    adminPassword.value = '';
    uni.showToast({ title: '临时管理员已激活', icon: 'success' });
  } else {
    uni.showToast({ title: '密码错误', icon: 'none' });
  }
}

function switchTab(index: number) {
  currentIndex.value = index;
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
}

function onSwiperAnimationFinish(e: { detail: { current?: number } }) {
  // 动画结束后，强制校正位置，消除可能的浮点数误差
  currentIndex.value = e.detail.current ?? 0;
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
  background-color: rgba(255, 255, 255, 0.98);
  border-top-left-radius: $radius-2xl;
  border-top-right-radius: $radius-2xl;
  @include safe-area-bottom;
  padding-bottom: calc(env(safe-area-inset-bottom) * 0.5);
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  border-top: none;
  transition: background-color $dur-medium $ease-standard,
    box-shadow $dur-medium $ease-standard;

  &.dark-theme {
    background-color: rgba(30, 30, 30, 0.98);
    box-shadow: 0 -10rpx 40rpx rgba(0, 0, 0, 0.4);
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
    font-size: $font-lg + 2rpx;
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

// ===== 临时管理员验证弹窗 =====
.admin-verify-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $space-9;
  box-sizing: border-box;
}

.admin-verify-card {
  width: 100%;
  max-width: 600rpx;
  max-height: 100%;
  overflow-y: auto;
  background: $bg-card-light;
  border-radius: $radius-card;
  overflow: hidden;

  &.dark-theme {
    background: $bg-card-dark;
  }
}

.admin-verify-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $space-7;
  border-bottom: 1rpx solid $divider-light;

  .dark-theme & {
    border-bottom-color: $divider-card-dark;
  }
}

.admin-verify-title {
  font-size: $font-lg;
  font-weight: $weight-bold;
  color: $text-primary-light;

  .dark-theme & {
    color: $text-primary-dark;
  }
}

.admin-verify-close {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: $font-2xl;
  color: $text-tertiary-light;
  @include pressable($press-scale-md);

  .dark-theme & {
    color: $text-tertiary-dark;
  }
}

.admin-verify-body {
  padding: $space-7;
}

.admin-verify-label {
  font-size: $font-base;
  color: $text-secondary-light;
  display: block;
  margin-bottom: $space-4;

  .dark-theme & {
    color: $text-secondary-dark;
  }
}

.admin-verify-input {
  width: 100%;
  height: 80rpx;
  background: $bg-muted-light;
  border-radius: $radius-sm;
  padding: 0 $space-6;
  font-size: $font-base;
  color: $text-primary-light;
  box-sizing: border-box;

  .dark-theme & {
    background: $bg-muted-dark;
    color: $text-primary-dark;
  }
}

.admin-verify-footer {
  display: flex;
  border-top: 1rpx solid $divider-light;

  .dark-theme & {
    border-top-color: $divider-card-dark;
  }
}

.admin-verify-btn {
  flex: 1;
  height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: $font-md;
  font-weight: $weight-semibold;
  @include pressable($press-scale-sm);

  &--cancel {
    color: $text-secondary-light;
    .dark-theme & {
      color: $text-tertiary-dark;
    }
  }

  &--confirm {
    color: $brand-red;
    border-left: 1rpx solid $divider-light;
    .dark-theme & {
      border-left-color: $divider-card-dark;
    }

    &:active {
      background: $danger-soft;
    }
  }
}
</style>
