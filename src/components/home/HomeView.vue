<template>
  <view
    class="home-view-container"
    :class="themeStore.themeClass"
    :style="{
      height: L.container + 'px',
      padding: L.paddingTop + 'px 40rpx 0',
      maxWidth: L.contentWidth + 'px',
      marginLeft: 'auto',
      marginRight: 'auto'
    }"
  >
    <!-- 顶部区域三档：full(问候语+logo) / logo(仅 logo) / none(都不显示) -->
    <view
      v-if="L.headerMode !== 'none'"
      class="header-welcome"
      :style="{ marginBottom: L.gapTight + 'px' }"
    >
      <view v-if="L.headerMode === 'full'" class="welcome-Line">
        <text
          class="hello-text"
          :class="{ 'is-refreshing': refreshingAuth }"
          :style="{ fontSize: L.helloSize + 'px' }"
          hover-class="mwp-hover-sm"
          @click="onHelloTap"
          >Hello,</text
        >
        <text class="name-text" :style="{ fontSize: L.nameSize + 'px' }">{{
          greetingText()
        }}</text>
      </view>
      <image
        src="@/images/logo.png"
        mode="heightFix"
        class="brand-logo"
        :style="{
          height: L.logoHeight + 'px',
          marginTop: (L.headerMode === 'full' ? L.gapTight : 0) + 'px'
        }"
      />
    </view>

    <!-- 搜索区域 -->
    <view
      class="search-section mwp-fade-down"
      :style="{ marginBottom: L.gapLoose + 'px' }"
      @click="goToSearch"
    >
      <view
        class="search-box mwp-pressable"
        hover-class="search-hover"
        :style="{
          height: L.searchHeight + 'px',
          borderRadius: L.radius + 'px'
        }"
      >
        <text class="search-icon">🔍</text>
        <text class="search-placeholder">搜索课程、老师或吐槽...</text>
      </view>
    </view>

    <!-- 功能区域 -->
    <view
      class="toolbox-section"
      :style="{
        height: L.toolboxHeight + 'px',
        gap: L.cardGap + 'px',
        padding: '0 10rpx'
      }"
    >
      <view class="left-group" :style="{ gap: L.cardGap + 'px' }">
        <view
          class="card-item log-card mwp-pressable mwp-fade-in"
          hover-class="card-hover"
          :style="{
            animationDelay: '60ms',
            padding: L.cardPadding + 'px',
            borderRadius: L.radius + 'px'
          }"
          @click="goToProposalFeed"
        >
          <text class="card-title">提案广场</text>
          <text
            class="card-subtitle"
            :style="{ marginTop: L.cardTitleGap + 'px' }"
            >Proposals</text
          >
          <text
            class="card-bg-icon"
            :style="{ fontSize: L.cardIconSize + 'px' }"
            >📋</text
          >
        </view>

        <view
          class="card-item letter-card mwp-pressable mwp-fade-in"
          hover-class="card-hover"
          :style="{
            animationDelay: '120ms',
            padding: L.cardPadding + 'px',
            borderRadius: L.radius + 'px'
          }"
          @click="goToLetter"
        >
          <text class="card-title">致用户的一封信</text>
          <text
            class="card-subtitle"
            :style="{ marginTop: L.cardTitleGap + 'px' }"
            >To Users</text
          >
          <text
            class="card-bg-icon"
            :style="{ fontSize: L.cardIconSize + 'px' }"
            >✉️</text
          >
          <view v-if="showNewIcon" class="new-tag">NEW</view>
        </view>
      </view>

      <view class="right-group">
        <view
          class="stat-card mwp-stagger-item"
          :style="{
            animationDelay: '180ms',
            padding: L.statPadding + 'px',
            borderRadius: L.radius + 'px'
          }"
        >
          <view class="stat-title">已收录吐槽</view>
          <view
            class="stat-number"
            :style="{
              fontSize: L.statNumSize + 'px',
              marginBottom: L.cardTitleGap + 'px'
            }"
            >{{ totalComment }}</view
          >
          <view class="stat-unit">条</view>
        </view>
      </view>
    </view>

    <!-- 底部气口：刚性 flex 项（不收缩），保证卡片底部与 tab bar 的间距不被内容挤压/裁切 -->
    <view class="bottom-spacer" :style="{ minHeight: L.bottomGap + 'px' }" />

    <!-- 反馈弹窗（共用组件） -->
    <FeedbackModal v-model:visible="showFeedback" />

    <!-- 首次使用引导弹窗 -->
    <view
      v-if="showGuide"
      class="guide-overlay"
      :class="themeStore.themeClass"
      @click="onGuideDismiss"
    >
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
              <text class="step-desc"
                >在首页搜索框输入课程名或教师名，查看同学们的真实评价</text
              >
            </view>
          </view>
          <view class="guide-step">
            <view class="step-icon">✏️</view>
            <view class="step-body">
              <text class="step-title">发布吐槽，分享体验</text>
              <text class="step-desc"
                >选过课后，在课程详情页发布你的课程体验，帮助学弟学妹</text
              >
            </view>
          </view>
          <view class="guide-step">
            <view class="step-icon">📝</view>
            <view class="step-body">
              <text class="step-title">提案新课，投票支持</text>
              <text class="step-desc"
                >搜索不到想要的课？发起提案让大家投票，通过后将收录进数据库</text
              >
            </view>
          </view>
        </view>
        <view class="guide-footer">
          <MwpButton tone="brand" block size="lg" @click="onGuideDismiss"
            >我知道了</MwpButton
          >
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, watchEffect } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { waitForLogin, relogin } from '@/utils/init';
import { http, useThemeStore, useTokenStore } from '@/config';
import { useScreenScale } from '@/composables/useScreenScale';
import { useMenuButton } from '@/composables/useMenuButton';
import { WIDE_ASPECT } from '@/composables/useViewport';
import { getRandomDefaultAvatar } from '@/utils/avatar';
import FeedbackModal from '@/components/feedback/FeedbackModal.vue';
const themeStore = useThemeStore();
// 系统胶囊位置：问候语上沿与之对齐
const { menuButtonInfo } = useMenuButton();

// 状态定义
const totalComment = ref(0);
const showNewIcon = ref(true);
const userName = ref('同学');
const isAdmin = ref(false);
const showFeedback = ref(false);
const refreshingAuth = ref(false);

// ===== 比例布局计算 =====
// 说明：卡片内距/图标属于"盒子"，跟随 r 缩放；文字保持 rpx 字阶不跟 r
// （rpx 本身已随屏宽缩放，再乘 r 会双重缩放且轴向错误）
const L = reactive({
  container: 600,
  paddingTop: 50,
  gapTight: 10,
  gapLoose: 20,
  bottomGap: 12,
  logoHeight: 150,
  helloSize: 16,
  nameSize: 32,
  searchHeight: 48,
  toolboxHeight: 300,
  statNumSize: 36,
  cardGap: 8,
  cardTitleGap: 4,
  cardPadding: 16,
  statPadding: 20,
  cardIconSize: 45,
  radius: 18,
  isWide: false,
  contentWidth: 375,
  headerMode: 'full' as 'full' | 'logo' | 'none'
});

// 宽高比 ≥ WIDE_ASPECT（见 useViewport）视为"宽屏 / 平板形态"：
// 收起问候语，改用居中构图
// 再宽于此值则连 logo 也收起（很宽的窗口/横屏本身不空，不需要 logo 填补）
const LOGO_ASPECT_MAX = 1;
// 宽屏下内容列的最大宽度（px），超过则在屏幕中居中
const CONTENT_MAX_WIDTH = 750;
// 手机参考宽度：宽屏下的缩放基准（rpx 也是按屏宽等比，二者口径一致）
const PHONE_REF_WIDTH = 375;
// 宽屏缩放上限
const WIDE_SCALE_MAX = 2;

const calcLayout = () => {
  const { r, available, radius, aspect, windowWidth, pxPerRpx } =
    useScreenScale();

  L.container = available;
  L.isWide = aspect >= WIDE_ASPECT;
  // 顶部与系统胶囊上沿对齐（随机型自适应，不参与缩放与冗余分配）
  L.paddingTop = menuButtonInfo.value.top;

  // 手机：随可用高度缩放（封顶 1.2）；宽屏：随内容列宽缩放，与 rpx 口径一致，
  // 这样平板上元素会跟着屏幕一起放大，而不是缩成一小块手机界面
  L.contentWidth = Math.min(windowWidth, CONTENT_MAX_WIDTH);
  const scale = L.isWide
    ? Math.min(L.contentWidth / PHONE_REF_WIDTH, WIDE_SCALE_MAX)
    : r;

  // 纵向节奏：hero 组内留出呼吸，hero→卡片再拉开一档
  const gap = Math.round(34 * scale);
  L.gapTight = Math.round(gap * 0.9);
  L.gapLoose = Math.round(gap * 1.15);
  // 卡片与 tab bar 之间要留出更大气口（含 tab bar 上投阴影）
  L.bottomGap = Math.round(gap * 1.4);

  L.logoHeight = Math.min(Math.round(180 * scale), 220);
  L.helloSize = Math.min(Math.round(28 * scale), 34);
  L.nameSize = Math.min(Math.round(36 * scale), 44);
  L.searchHeight = Math.round(56 * scale);
  // 展示层数字：保留动态，手机下上限收紧到 42
  L.statNumSize = Math.min(
    Math.round(40 * scale),
    L.isWide ? Math.round(40 * WIDE_SCALE_MAX) : 42
  );
  L.cardGap = Math.round(Math.max(gap * 0.5, 8));
  L.cardTitleGap = Math.round(Math.max(8 * scale, 4));
  // 盒子尺寸：32rpx / 40rpx / 90rpx 的 px 口径基准
  L.cardPadding = Math.round(Math.max(16 * scale, 12));
  L.statPadding = Math.round(Math.max(20 * scale, 14));
  L.cardIconSize = Math.min(
    Math.round(45 * scale),
    L.isWide ? Math.round(45 * WIDE_SCALE_MAX) : 48
  );

  // 三档顶部：手机 full（问候语+logo）/ 过渡比例 logo（仅 logo）/ 很宽 none。
  // 另要求 logo 占高不超过可用高度的 40%，否则矮视口下会把内容挤没。
  const logoFits = L.logoHeight + L.gapTight <= available * 0.4;
  L.headerMode = !L.isWide
    ? 'full'
    : aspect < LOGO_ASPECT_MAX && logoFits
    ? 'logo'
    : 'none';

  // 卡片列宽（容器 40rpx×2 + toolbox 10rpx×2 内距，再对半分）
  const colWidth = (L.contentWidth - 100 * pxPerRpx - L.cardGap) / 2;

  if (L.isWide) {
    // ===== 宽屏 / 平板：内容列居中；过渡比例下只留 logo（不含问候语）=====
    // headerH：logo 高度 + 其下方间距（logo 无上边距）
    const headerH = L.headerMode === 'logo' ? L.logoHeight + L.gapTight : 0;
    const minBottom = Math.round(gap * 1.4);
    const boxCap = Math.round(colWidth * 1.5);
    // 先给底部留出最小气口，再据此定卡片高度
    const box = Math.max(
      Math.min(
        available -
          L.paddingTop -
          headerH -
          L.searchHeight -
          L.gapLoose -
          minBottom,
        boxCap
      ),
      0
    );
    L.toolboxHeight = box;

    // 剩余空间上下平分（底部不再额外叠加 minBottom，否则会明显偏大）
    const leftover = Math.max(
      available - L.paddingTop - headerH - L.searchHeight - L.gapLoose - box,
      0
    );
    // 底部取「剩余的一半」与 minBottom 的较大者，但不超过 leftover，
    // 否则极矮视口下 paddingTop 会被推成负数、顶部内容被裁
    const bottom = Math.min(
      Math.max(Math.round(leftover * 0.5), minBottom),
      leftover
    );
    L.bottomGap = bottom;
    L.paddingTop += leftover - bottom;
  } else {
    // ===== 手机：问候语 + logo hero =====
    const helloArea = Math.round(30 * r);
    const nameArea = Math.round(40 * r);
    // headerH 含 logo 上边距（gapTight）
    const headerH = helloArea + nameArea + L.gapTight + L.logoHeight;

    const reserved =
      L.paddingTop +
      headerH +
      L.gapTight + // header 下边距（logo → 搜索）
      L.searchHeight +
      L.gapLoose + // 搜索 → 卡片
      L.bottomGap;

    const slack = available - reserved;
    // 卡片区最多占可用高度的 30%
    const box = Math.max(Math.min(slack, Math.round(available * 0.3)), 0);
    L.toolboxHeight = box;

    // 冗余分配：先松开间距（带上限）
    // gapTight 占两个槽位（logo 上边距 + header 下边距）
    let rest = Math.max(slack - box, 0);

    const addTight = Math.min(
      Math.round(rest * 0.2),
      Math.max(Math.round(gap * 1.5) - L.gapTight, 0)
    );
    L.gapTight += addTight;
    rest -= addTight * 2;

    const addLoose = Math.min(
      Math.round(rest * 0.3),
      Math.max(Math.round(gap * 2.0) - L.gapLoose, 0)
    );
    L.gapLoose += addLoose;

    // 上下留白对称：让 Hello 上沿到屏幕顶的间距 ≈ 卡片底到菜单栏顶的间距，
    // 避免首页整体视觉重心偏上。顶部不得高于系统胶囊，故取其较大值。
    const headerHFinal = helloArea + nameArea + L.gapTight + L.logoHeight;
    const contentH =
      headerHFinal + L.gapTight + L.searchHeight + L.gapLoose + box;
    const balanced = Math.round((available - contentH) / 2);
    L.paddingTop = Math.max(L.paddingTop, balanced);
    L.bottomGap = Math.max(available - contentH - L.paddingTop, 0);
  }

  // 圆角安全夹：不超过卡片短边的 25%，避免极矮视口下变成水泡
  const cardShortSide = (L.toolboxHeight - L.cardGap) / 2;
  L.radius = Math.max(
    Math.min(radius, Math.round(cardShortSide * 0.25)),
    Math.round(8 * pxPerRpx)
  );
};

const greetingText = () => {
  const suffix = isAdmin.value ? '管理员' : '同学';
  if (userName.value && userName.value !== '同学')
    return userName.value + ' ' + suffix;
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
    const res = await http.AuthController.authIsAdminList();
    isAdmin.value = !!(res.data?.data?.isAdmin ?? false);
  } catch {
    const tempAdmin = uni.getStorageSync('meowpick_temp_admin');
    isAdmin.value = !!tempAdmin;
  }
};

// ===== 手动刷新登录（点击 Hello, 触发）=====
// 方便真机上遇到鉴权问题时一键强制重新登录并刷新数据
const onHelloTap = async () => {
  if (refreshingAuth.value) return;
  refreshingAuth.value = true;
  uni.showLoading({ title: '更新登录中...', mask: true });
  try {
    const token = await relogin();
    uni.hideLoading();
    if (token) {
      const userId = useTokenStore().userId || '-';
      uni.showModal({
        title: '登录已更新',
        content: `token: ${token.slice(0, 10)}...\n用户ID: ${userId}`,
        showCancel: false
      });
      // 刷新首页与「我的」的数据
      fetchTotalComment();
      loadUserInfo();
      detectAdmin();
      uni.$emit('authRefreshed');
    } else {
      uni.showModal({
        title: '登录更新失败',
        content: '未拿到 token，请检查网络/合法域名/后端登录接口',
        showCancel: false
      });
    }
  } catch (err) {
    uni.hideLoading();
    uni.showModal({
      title: '登录更新异常',
      content: String((err as Error)?.message || err),
      showCancel: false
    });
  } finally {
    refreshingAuth.value = false;
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
      avatarUrl: getRandomDefaultAvatar(),
      avatarIsDefault: true
    };
    uni.setStorageSync('userInfo', info);
    userName.value = info.nickName;
  }
};

// 布局跟随视口：calcLayout 内读取的都是响应式视口数据，
// watchEffect 会在窗口尺寸变化（PC 端拖动窗口 / 旋转屏幕）时自动重算
watchEffect(() => {
  calcLayout();
});

// 生命周期
onMounted(async () => {
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
  uni.$off('userInfoUpdated', loadUserInfo);
});

const fetchTotalComment = () => {
  http.CommentController.searchTotalList()
    .then((res) => {
      totalComment.value = res.data?.data?.count ?? 0;
    })
    .catch((err: unknown) => {
      console.error('[home-view] fetchTotalComment error:', err);
    });
};

// 路由跳转
const goToSearch = () => {
  // 原有逻辑：导向搜索页面
  uni.navigateTo({ url: '/pages/find/index' });
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
  uni.navigateTo({ url: '/pages/home/letter' });
};

const goToUpdate = () => {
  uni.navigateTo({ url: '/pages/home/update-log' });
};

const goToProposalFeed = () => {
  uni.navigateTo({ url: '/pages/proposal/list' });
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

// 底部气口：可增长吸收冗余，但永不收缩，防止被内容顶掉
.bottom-spacer {
  flex: 1 0 auto;
  width: 100%;
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
    transition: opacity $dur-fast $ease-standard;

    &.is-refreshing {
      opacity: 0.4;
    }
  }

  .name-text {
    font-weight: 900;
    color: $text-primary-light;
    letter-spacing: -2rpx;
    // 长昵称必须单行，否则会撑高 header、挤掉底部气口
    max-width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
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
  .hello-text {
    color: $text-secondary-dark;
  }
  .name-text {
    color: $text-primary-dark;
  }
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
    @include mwp-transition($dur-fast, $ease-emphasized);

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
    border-color: $brand-red-soft;
    box-shadow: $shadow-brand-lg;
    .search-placeholder {
      color: $text-secondary-dark;
    }
  }
}

// 3. 功能区域 - Bento Grid (便当盒 layout)
// 优化：右侧统计卡片不再是简单的色块，而是精细的数据面板
.toolbox-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr;
  // 允许在内容估算偏大时收缩，把误差吃在卡片区，而不是顶掉底部气口
  flex-shrink: 1;
  min-height: 0;

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
  border-radius: $radius-card;
  padding: $space-7;
  position: relative;
  overflow: hidden;
  box-shadow: $shadow-comp;
  border: 1rpx solid rgba(0, 0, 0, 0.03);

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

  // 主功能卡：提案广场，品牌渐变 + 品牌标题色
  &.log-card {
    background: $gradient-brand-soft;
    .card-title {
      color: $brand-red;
    }
  }
}

// hover-class 按压态：小程序 `view` 用 hover-class 比 `:active` 更可靠
.card-hover,
.search-hover {
  transform: scale($press-scale-sm);
}

.dark-theme .card-item {
  background-color: $bg-muted-dark;
  border-color: $bg-muted-darker;
  box-shadow: $shadow-sm-dark;

  .card-title {
    color: $text-primary-dark;
  }
  .card-subtitle {
    color: $text-tertiary-dark;
  }
}

.dark-theme .log-card {
  background: $gradient-brand-soft-dark;
  .card-title {
    color: $brand-red-soft;
  }
}

.new-tag {
  position: absolute;
  top: 16rpx;
  right: 16rpx;
  background: $gradient-brand;
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
  border: 1rpx solid rgba(0, 0, 0, 0.03);
  color: $text-primary-light;
  border-radius: $radius-card;
  padding: $space-8;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  box-shadow: $shadow-comp;

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
    font-size: $font-base;
    opacity: 0.6;
    color: $text-tertiary-light;
    align-self: flex-end;
  }
}

.dark-theme .stat-card {
  background-color: $bg-muted-dark;
  border-color: $bg-muted-darker;
  box-shadow: $shadow-sm-dark;
  .stat-title {
    color: $text-tertiary-dark;
  }
  .stat-number {
    color: $brand-red-soft;
  }
  .stat-unit {
    color: $text-secondary-dark;
  }
}

.dark-theme .feedback-entry {
  .feedback-entry-text {
    color: $text-tertiary-dark;
    &:active {
      color: $brand-red-soft;
    }
  }
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
// ===== 引导弹窗 =====

.guide-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: $z-modal + 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $space-9;
  box-sizing: border-box;
  animation: mwp-fade-in $motion-enter-sm $ease-standard backwards;
}

.guide-content {
  width: 100%;
  max-width: 600rpx;
  // 高度超限时在弹窗内部滚动，避免溢出屏幕
  max-height: 100%;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  background: $bg-card-light;
  border-radius: $radius-2xl;
  padding: $space-8 $space-7;
  box-shadow: $shadow-xl;
  animation: mwp-bounce-in $motion-heart $ease-spring backwards;
  transition: background-color $dur-medium $ease-standard;
}

.guide-header {
  text-align: center;
  margin-bottom: $space-7;

  .guide-title {
    display: block;
    font-size: $font-3xl;
    font-weight: $weight-black;
    color: $text-primary-light;
    margin-bottom: $space-2;
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
  margin-bottom: $space-7;
}

.guide-step {
  display: flex;
  align-items: flex-start;
  margin-bottom: $space-6;
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
  .guide-header .guide-title {
    color: $text-primary-dark;
  }
  .guide-header .guide-subtitle {
    color: $text-tertiary-dark;
  }
  .guide-step {
    .step-title {
      color: $text-primary-dark;
    }
    .step-desc {
      color: $text-tertiary-dark;
    }
  }
  .guide-dont-ask {
    color: $text-tertiary-dark;
  }
}

@media (prefers-reduced-motion: reduce) {
  .guide-overlay,
  .guide-content {
    animation: none;
    transition: none;
  }
}
</style>
