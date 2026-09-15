<template>
  <view class="home-view-container" :class="themeStore.themeClass" :style="{ height: L.container + 'px', padding: L.paddingTop + 'px 40rpx 0' }">
    <!-- 顶部欢迎语区域 -->
    <view class="header-welcome" :style="{ marginBottom: L.gap + 'px' }">
      <view class="welcome-Line">
        <text class="hello-text" :style="{ fontSize: L.helloSize + 'px' }">Hello,</text>
        <text class="name-text" :style="{ fontSize: L.nameSize + 'px' }">{{ greetingText() }}</text>
      </view>
      <image src="/src/images/logo.png" mode="heightFix" class="brand-logo" :style="{ height: L.logoHeight + 'px', marginTop: L.gap + 'px' }" />
    </view>
    
    <!-- 搜索区域 -->
    <view class="search-section mwp-fade-down" @click="goToSearch" :style="{ marginBottom: L.gap + 'px' }">
      <view class="search-box mwp-pressable" :style="{ height: L.searchHeight + 'px' }">
        <text class="search-icon">🔍</text>
        <text class="search-placeholder">搜索课程、老师或吐槽...</text>
      </view>
    </view>

    <!-- 功能区域 -->
    <view class="toolbox-section" :style="{ height: L.toolboxHeight + 'px', gap: L.cardGap + 'px', padding: '0 10rpx' }">
      <view class="left-group" :style="{ gap: L.cardGap + 'px' }">
        <view
          class="card-item letter-card mwp-pressable mwp-stagger-item"
          @click="goToLetter"
          :style="{ animationDelay: '60ms' }"
        >
          <text class="card-title">致用户的一封信</text>
          <text class="card-subtitle" :style="{ marginTop: L.cardTitleGap + 'px' }">To Users</text>
          <text class="card-bg-icon">✉️</text>
          <view v-if="showNewIcon" class="new-tag">NEW</view>
        </view>

        <view
          class="card-item log-card mwp-pressable mwp-stagger-item"
          @click="goToProposalFeed"
          :style="{ animationDelay: '120ms' }"
        >
          <text class="card-title">提案广场</text>
          <text class="card-subtitle" :style="{ marginTop: L.cardTitleGap + 'px' }">Proposals</text>
          <text class="card-bg-icon">📋</text>
        </view>
      </view>

      <view class="right-group">
        <view class="stat-card mwp-stagger-item" :style="{ animationDelay: '180ms' }">
          <view class="stat-title">已收录吐槽</view>
          <view class="stat-number" :style="{ fontSize: L.statNumSize + 'px', marginBottom: L.cardTitleGap + 'px' }">{{ totalComment }}</view>
          <view class="stat-unit" :style="{ fontSize: L.statUnitSize + 'px' }">条</view>
        </view>
      </view>
    </view>

    <!-- 反馈弹窗（共用组件） -->
    <feedback-modal v-model:visible="showFeedback" />

    <!-- 首次使用引导弹窗 -->
    <view v-if="showGuide" class="guide-overlay" :class="themeStore.themeClass" @click="onGuideDismiss">
      <view class="guide-content" @click.stop>
        <view class="guide-header">
          <text class="guide-title">欢迎来到选课猫</text>
          <text class="guide-subtitle">华东师范大学课程评价社区</text>
        </view>
        <view class="guide-steps">
          <view class="guide-step">
            <view class="step-icon">🔍</view>
            <view class="step-body">
              <text class="step-title">搜索课程，查看评价</text>
              <text class="step-desc">在首页搜索框输入课程名或教师名，查看同学们的真实评价</text>
            </view>
          </view>
          <view class="guide-step">
            <view class="step-icon">✏️</view>
            <view class="step-body">
              <text class="step-title">发布吐槽，分享体验</text>
              <text class="step-desc">选过课后，在课程详情页发布你的课程体验，帮助学弟学妹</text>
            </view>
          </view>
          <view class="guide-step">
            <view class="step-icon">📝</view>
            <view class="step-body">
              <text class="step-title">提案新课，投票支持</text>
              <text class="step-desc">搜索不到想要的课？发起提案让大家投票，通过后将收录进数据库</text>
            </view>
          </view>
        </view>
        <view class="guide-footer">
          <button class="guide-btn guide-btn--auth" @click="onGuideDismiss">我知道了</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { waitForLogin } from '@/utils/init';
import { http, useThemeStore } from '@/config';
import defaultCatAvatar from '@/images/cat-emoji/cat_face.png';
import FeedbackModal from '@/components/feedback/feedback-modal.vue';
const themeStore = useThemeStore();

// 状态定义
const totalComment = ref(0);
const showNewIcon = ref(true);
const userName = ref('同学');
const isAdmin = ref(false);
const showFeedback = ref(false);

// ===== 比例布局计算 =====
const L = reactive({
  container: 600,
  paddingTop: 50,
  gap: 10,
  logoHeight: 150,
  helloSize: 16,
  nameSize: 32,
  searchHeight: 48,
  toolboxHeight: 300,
  statNumSize: 36,
  statUnitSize: 14,
  cardGap: 8,
  cardTitleGap: 4,
});

const calcLayout = () => {
  const sys = uni.getSystemInfoSync();
  const h = sys.windowHeight;
  const pxPerRpx = sys.windowWidth / 750;
  const safeBottom = sys.safeAreaInsets?.bottom || 0;
  // 有小白条用真实安全区，没有的补 24rpx 让视觉间距一致
  const tabBarH = Math.round(100 * pxPerRpx) + safeBottom + (safeBottom > 0 ? 0 : Math.round(24 * pxPerRpx));
  const available = h - tabBarH;
  const r = Math.min(available / 762, 1.2);

  L.container = available;
  L.paddingTop = Math.round(60 * r);
  L.gap = Math.round(36 * r);
  L.logoHeight = Math.min(Math.round(180 * r), 220);
  L.helloSize = Math.min(Math.round(28 * r), 34);
  L.nameSize = Math.min(Math.round(36 * r), 44);
  L.searchHeight = Math.min(Math.round(56 * r), 66);
  L.statNumSize = Math.min(Math.round(40 * r), 48);
  L.statUnitSize = Math.min(Math.round(28 * r), 34);
  L.cardGap = Math.round(Math.max(L.gap * 0.5, 8));
  L.cardTitleGap = Math.round(Math.max(8 * r, 4));

  const helloArea = Math.round(30 * r);
  const nameArea = Math.round(40 * r);
  const logoArea = L.logoHeight;
  const headerH = helloArea + nameArea + logoArea + L.gap * 2;
  const toolboxH = available - L.paddingTop - headerH - L.gap * 2 - L.searchHeight - Math.round(L.gap * 0.5);
  L.toolboxHeight = Math.max(toolboxH, 100);
};

const greetingText = () => {
  const suffix = isAdmin.value ? '管理员' : '同学';
  if (userName.value && userName.value !== '同学') return userName.value + ' ' + suffix;
  return suffix;
};

const openFeedback = () => {
  showFeedback.value = true;
};

// 首次使用引导弹窗
const showGuide = ref(false);
const GUIDE_KEY = 'meowpick_guide_seen';

const loadUserInfo = () => {
  const storedUser = uni.getStorageSync('userInfo');
  if (storedUser && storedUser.nickName) {
    userName.value = storedUser.nickName;
  } else {
    applyDefaults();
  }
};

const detectAdmin = async () => {
  try {
    const res: any = await http.AuthController.authIsAdminList();
    isAdmin.value = !!(res.data?.data?.isAdmin ?? res.data?.isAdmin ?? false);
  } catch {
    const tempAdmin = uni.getStorageSync('meowpick_temp_admin');
    isAdmin.value = !!tempAdmin;
  }
};

// ===== 引导弹窗 =====
const onGuideDismiss = () => {
  applyDefaults();
  showGuide.value = false;
  uni.setStorageSync(GUIDE_KEY, true);
};

const generateDefaultName = () => {
  return '华师喵' + Math.floor(1000 + Math.random() * 9000);
};

const applyDefaults = () => {
  const stored = uni.getStorageSync('userInfo');
  if (!stored || !stored.nickName) {
    const info = {
      nickName: generateDefaultName(),
      avatarUrl: defaultCatAvatar,
      avatarIsDefault: true,
    };
    uni.setStorageSync('userInfo', info);
    userName.value = info.nickName;
  }
};

// 生命周期
onMounted(async () => {
  calcLayout();
  uni.onWindowResize(() => calcLayout());
  // PC 开发者工具拖动窗口时触发
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', () => calcLayout());
  }
  await waitForLogin();
  fetchTotalComment();
  loadUserInfo();
  detectAdmin();
  // 监听授权成功事件，实时更新昵称
  uni.$on('userInfoUpdated', loadUserInfo);

  const hasReadLetter = uni.getStorageSync('hasReadLetter');
  showNewIcon.value = !hasReadLetter;

  // 检查是否首次使用
  const hasSeenGuide = uni.getStorageSync(GUIDE_KEY);
  if (!hasSeenGuide) {
    showGuide.value = true;
  }
});

onShow(() => {
  loadUserInfo();
  detectAdmin();
});

onUnmounted(() => {
  uni.offWindowResize(() => calcLayout());
  uni.$off('userInfoUpdated', loadUserInfo);
});

const fetchTotalComment = () => {
  http.CommentController.searchTotalList().then((res: any) => {
    totalComment.value = res?.data?.data?.count || res?.data?.count || 0;
  }).catch((err: any) => {
    console.error('[home-view] fetchTotalComment error:', err);
  });
};

// 路由跳转
const goToSearch = () => {
  // 原有逻辑：导向搜索页面
  uni.navigateTo({ url: "/pages/find/index/index" });
};

const goToLetter = () => {
  // 1. 先记录状态，确保 UI 立即响应
  showNewIcon.value = false;
  try {
      uni.setStorageSync('hasReadLetter', true);
  } catch (e) {
      console.error('[home-view] setStorageSync error:', e);
  }
  
  // 2. 然后立即跳转，不等待 storage 写入
  uni.navigateTo({ url: "/pages/home/letter" });
};

const goToUpdate = () => {
  uni.navigateTo({ url: "/pages/home/update-log" });
};

const goToProposalFeed = () => {
  uni.navigateTo({ url: "/pages/proposal/list/list" });
};
</script>

<style scoped lang="scss">

.home-view-container {
  box-sizing: border-box;
  background-color: $bg-page-light;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  position: relative;
  overflow: hidden;
}

.dark-theme {
  background-color: $bg-page-dark;
}

// 新增：顶部欢迎语样式
.header-welcome {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  
  .welcome-Line {
    display: flex;
    flex-direction: column;
    align-items: flex-start; 
    justify-content: flex-start; 
    padding-left: 20rpx; 
  }

  .hello-text {
    font-weight: 300;
    color: $text-tertiary-light;
    font-family: sans-serif;
    font-style: normal;
  }

  .name-text {
    font-weight: 900;
    color: $text-primary-light;
    letter-spacing: -2rpx;
  }

  .brand-logo {
    width: auto;
    max-width: 80%;
    object-fit: contain;
    display: block;
    align-self: center; 
    filter: $shadow-logo; 
    transform: scale(1.05); 
  }
}

.dark-theme .header-welcome {
  .hello-text { color: $text-secondary-light; }
  .name-text { color: $text-primary-dark; }
}

// 1. Logo 区域
.logo-section {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 60rpx;
  position: relative;
  z-index: 2;

  .logo-img {
    width: 380rpx; // 稍微放大
    height: auto;
    // 增加一点通透感
    opacity: 0.95; 
  }
}

// 2. 搜索框区域 - 悬浮胶囊
.search-section {
  flex-shrink: 0;
  position: relative;
  z-index: 2;
  padding: 0 10rpx;

  .search-box {
    display: flex;
    align-items: center;
    background-color: $bg-card-light;
    border-radius: $radius-control;
    padding: 0 $space-7;

    box-shadow: $shadow-brand-md;
    border: none;

    .search-icon {
      font-size: $font-xl;
      margin-right: 24rpx;
      opacity: 0.4;
      line-height: 1;
    }

    .search-placeholder {
      flex: 1;
      font-size: $font-lg;
      color: $text-tertiary-light;
      letter-spacing: 1rpx;
      font-weight: 400;
    }
  }

  &:active {
      transform: scale($press-scale-md);
  }
}

.dark-theme .search-section {
  .search-box {
    background-color: $bg-muted-dark;
    border-color: $brand-red;
    box-shadow: $shadow-brand-lg;
    .search-placeholder { color: $text-secondary-light; }
  }
}

// 3. 功能区域 - Bento Grid (便当盒 layout)
// 优化：右侧统计卡片不再是简单的色块，而是精细的数据面板
.toolbox-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr;
  flex-shrink: 0;
  
  position: relative;
  z-index: 2;

  .left-group {
      grid-column: 1 / 2;
      display: flex;
      flex-direction: column;
  }
  
  .right-group {
      grid-column: 2 / 3;
      display: flex;
      flex-direction: column;
  }
}

// 通用卡片 - 面板风格
.card-item {
  background-color: $bg-card-light;
  border-radius: $radius-xl;
  padding: $space-7;
  position: relative;
  overflow: hidden;
  box-shadow: $shadow-comp-glow;
  border: 1rpx solid rgba(178, 0, 53, 0.04);

  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  @include mwp-transition($dur-instant, $ease-standard);

  .card-title {
    font-size: $font-md;
    font-weight: 700;
    color: $text-primary-light;
    margin-bottom: 2rpx;
    z-index: 2;
    display: block;
  }

  .card-subtitle {
    font-size: $font-xs;
    color: $text-tertiary-light;
    letter-spacing: 1rpx;
    text-transform: uppercase;
    z-index: 2;
    display: block;
    margin-top: 4rpx;
  }

  .card-bg-icon {
    position: absolute;
    right: -10rpx;
    bottom: -10rpx;
    font-size: 90rpx;
    line-height: 1;
    opacity: 0.15;
    z-index: 1;
    transform: rotate(-15deg);
  }

  &:active {
      transform: scale($press-scale-sm);
  }

  &.letter-card {
      background: linear-gradient(135deg, $pure-white 0%, $brand-red-tint 100%);
      .card-title { color: $brand-red; }
  }
}

.dark-theme .card-item {
  background-color: $bg-muted-dark;
  border-color: $bg-muted-darker;
  box-shadow: $shadow-sm-dark;

  .card-title { color: $text-primary-dark; }
  .card-subtitle { color: $text-tertiary-light; }
}

.dark-theme .letter-card {
  background: linear-gradient(135deg, $bg-muted-dark 0%, $text-primary-light 100%);
  .card-title { color: $brand-red; }
}

.new-tag {
  position: absolute;
  top: 16rpx;
  right: 16rpx;
  background: linear-gradient(135deg, $brand-red, $brand-red-soft);
  color: $pure-white;
  font-size: $font-xs;
  font-weight: 700;
  padding: 4rpx 12rpx;
  border-radius: $radius-pill;
  z-index: 3;
}

// 统计卡片：纵向大卡片
.stat-card {
  flex: 1;
  min-height: 0;
  background-color: $bg-card-light;
  border: 1rpx solid rgba(0,0,0,0.03);
  color: $text-primary-light;
  border-radius: $radius-xl;
  padding: $space-8;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  box-shadow: $shadow-comp-glow;

  .stat-title {
      font-size: $font-md;
      font-weight: 700;
      opacity: 1;
      color: $text-tertiary-light;
  }

  .stat-number {
      font-size: 80rpx;
      font-weight: 900;
      line-height: 1;
      margin: 20rpx 0;
      letter-spacing: -2rpx;
      color: $brand-red;
      text-shadow: none;
  }

  .stat-unit {
      font-size: $font-sm;
      opacity: 0.5;
      color: $text-tertiary-light;
      align-self: flex-end;
  }

  &::before { display: none; }
  &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 12rpx;
      background: linear-gradient(90deg, $pure-white 0%, $brand-red-tint 100%);
      display: none;
  }
}

.dark-theme .stat-card {
  background-color: $bg-muted-dark;
  border-color: $bg-muted-darker;
  box-shadow: $shadow-sm-dark;
  .stat-title { color: $text-tertiary-light; }
  .stat-number { color: $brand-red; }
  .stat-unit { color: $text-secondary-light; }
}

.dark-theme .feedback-entry {
  .feedback-entry-text { color: $text-tertiary-light; &:active { color: $brand-red-soft; } }
}

/* 底部"我要反馈"小字入口 - 紧贴内容末尾 */
.feedback-entry {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 120rpx 0 20rpx;

  .feedback-entry-text {
    font-size: $font-base;
    color: $text-tertiary-light;
    text-decoration: underline;
    transition: color 0.15s;

    &:active {
      color: $brand-red;
    }
  }
}
</style>


<style lang="scss" scoped>

// ===== 引导弹窗 =====

.guide-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.60);
  z-index: $z-modal + 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $space-9;
  box-sizing: border-box;
  animation: mwp-fade-in $motion-enter-sm $ease-standard both;
}

.guide-content {
  width: 100%;
  max-width: 600rpx;
  background: $bg-card-light;
  border-radius: $radius-2xl;
  padding: $space-10 $space-8;
  box-shadow: $shadow-xl;
  animation: mwp-bounce-in $motion-heart $ease-spring both;
  transition: background-color $dur-medium $ease-standard;
}

.guide-header {
  text-align: center;
  margin-bottom: $space-10;

  .guide-title {
    display: block;
    font-size: $font-3xl;
    font-weight: $weight-black;
    color: $text-primary-light;
    margin-bottom: $space-4;
    text-align: center;
  }

  .guide-subtitle {
    display: block;
    font-size: $font-sm + 2rpx;
    color: $text-tertiary-light;
    text-align: center;
  }
}

.guide-steps {
  margin-bottom: $space-10;
}

.guide-step {
  display: flex;
  align-items: flex-start;
  margin-bottom: $space-8;
  gap: $space-5;

  &:last-child {
    margin-bottom: 0;
  }

  .step-icon {
    width: 64rpx;
    height: 64rpx;
    background: $brand-red-tint;
    border-radius: $radius-lg;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: $font-2xl;
    flex-shrink: 0;
  }

  .step-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: $space-2;
  }

  .step-title {
    font-size: $font-md;
    font-weight: $weight-semibold;
    color: $text-primary-light;
    display: block;
  }

  .step-desc {
    font-size: $font-sm;
    color: $text-tertiary-light;
    line-height: 1.5;
    display: block;
  }
}

.guide-footer {
  .guide-btn {
    width: 100%;
    height: 88rpx;
    line-height: 88rpx;
    border-radius: $radius-pill;
    font-size: $font-lg;
    font-weight: $weight-semibold;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    @include pressable($press-scale-sm);

    &--auth {
      background: $gradient-brand;
      color: $pure-white;
      box-shadow: $shadow-brand-md;

      &:active {
        transform: scale($press-scale-sm);
        opacity: 0.92;
      }
    }

    &--skip {
      background: transparent;
      color: $text-secondary-light;
      font-size: $font-base;
      font-weight: $weight-medium;
      height: 72rpx;
      line-height: 72rpx;
      margin-top: $space-3;
    }
  }

  .guide-dont-ask {
    text-align: center;
    font-size: $font-xs;
    color: $text-tertiary-light;
    padding: $space-3 0;
    margin-top: $space-2;
  }
}

// 暗色模式（统一 .dark-theme 嵌套）
.dark-theme {
  .guide-overlay {
    background-color: rgba(0, 0, 0, 0.75);
  }
  .guide-content {
    background: $bg-card-dark;
  }
  .guide-header .guide-title { color: $text-primary-dark; }
  .guide-header .guide-subtitle { color: $text-tertiary-dark; }
  .guide-step {
    .step-title { color: $text-primary-dark; }
    .step-desc { color: $text-tertiary-dark; }
  }
  .guide-btn--skip { color: $text-secondary-dark; }
  .guide-dont-ask { color: $text-tertiary-dark; }
}

@media (prefers-reduced-motion: reduce) {
  .guide-overlay,
  .guide-content,
  .guide-btn {
    animation: none;
    transition: none;
  }
}
</style>
