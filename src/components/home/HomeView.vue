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
      class="header-welcome mwp-fade-in"
      :style="{ marginBottom: L.gapTight + 'px' }"
    >
      <view v-if="L.headerMode === 'full'" class="welcome-Line">
        <text
          class="hello-text"
          :class="{ 'is-refreshing': refreshingAuth }"
          :style="{ fontSize: L.helloSize + 'px' }"
          hover-class="mwp-hover-sm"
          :hover-start-time="0"
          :hover-stay-time="0"
          @click="onHelloTap"
          >Hello</text
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
        class="search-box"
        hover-class="search-hover"
        :hover-start-time="0"
        :hover-stay-time="0"
        :style="{
          height: L.searchHeight + 'px',
          borderRadius: L.radius + 'px'
        }"
      >
        <MwpIcon name="search" size="34rpx" class="search-icon" />
        <text class="search-placeholder">搜索课程或老师...</text>
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
          :hover-start-time="0"
          :hover-stay-time="0"
          :style="{
            animationDelay: '60ms',
            borderRadius: L.radius + 'px'
          }"
          @click="goToProposalFeed"
        >
          <view class="card-inner" :style="{ padding: L.cardPadding + 'px' }">
            <text class="card-title">提案广场</text>
            <text
              class="card-subtitle"
              :style="{ marginTop: L.cardTitleGap + 'px' }"
              >Proposals</text
            >
          </view>
          <view class="card-bg-icon">
            <MwpIcon name="clipboard-list" :size="L.cardIconSize + 'px'" />
          </view>
        </view>

        <view
          class="card-wrap mwp-pressable mwp-fade-in"
          hover-class="card-hover"
          :hover-start-time="0"
          :hover-stay-time="0"
          :style="{ animationDelay: '120ms' }"
          @click="goToLetter"
        >
          <view
            class="card-item letter-card"
            :style="{
              padding: L.cardPadding + 'px',
              borderRadius: L.radius + 'px'
            }"
          >
            <text class="card-title">致用户的一封信</text>
            <text
              class="card-subtitle"
              :style="{ marginTop: L.cardTitleGap + 'px' }"
              >To Users</text
            >
            <view class="card-bg-icon">
              <MwpIcon name="mail" :size="L.cardIconSize + 'px'" />
            </view>
          </view>
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
            class="stat-number-row"
            :style="{ marginBottom: L.cardTitleGap + 'px' }"
          >
            <text
              v-for="(digit, i) in statDigitsList"
              :key="i"
              class="stat-number"
              :style="{
                fontSize: L.statNumSize + 'px',
                width: L.statSlotWidth + 'px'
              }"
              >{{ digit }}</text
            >
          </view>
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
            <view class="step-icon">
              <MwpIcon name="search" size="34rpx" />
            </view>
            <view class="step-body">
              <text class="step-title">搜索课程，查看评价</text>
              <text class="step-desc"
                >在首页搜索框输入课程名或教师名，查看同学们的真实评价</text
              >
            </view>
          </view>
          <view class="guide-step">
            <view class="step-icon">
              <MwpIcon name="square-pen" size="34rpx" />
            </view>
            <view class="step-body">
              <text class="step-title">发布吐槽，分享体验</text>
              <text class="step-desc"
                >选过课后，在课程详情页发布你的课程体验，帮助学弟学妹</text
              >
            </view>
          </view>
          <view class="guide-step">
            <view class="step-icon">
              <MwpIcon name="file-text" size="34rpx" />
            </view>
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

    <!-- 旧版迁移欢迎弹窗 -->
    <view
      v-if="showMigrationWelcome"
      class="guide-overlay"
      :class="themeStore.themeClass"
      @click="onMigrationDismiss"
    >
      <view class="guide-content" @click.stop>
        <view class="guide-header">
          <text class="guide-badge">全新版本</text>
          <text class="guide-title">欢迎回来</text>
          <text class="guide-subtitle">选课猫换新装啦，这些变化别错过</text>
        </view>
        <view class="guide-steps">
          <view class="guide-step">
            <view class="step-icon">
              <MwpIcon name="palette" size="34rpx" />
            </view>
            <view class="step-body">
              <text class="step-title">全新页面</text>
              <text class="step-desc"
                >首页、课程、提案等页面全面重绘，信息更清晰、操作更顺手</text
              >
            </view>
          </view>
          <view class="guide-step">
            <view class="step-icon">
              <MwpIcon name="moon" size="34rpx" />
            </view>
            <view class="step-body">
              <text class="step-title">深色模式</text>
              <text class="step-desc"
                >跟随系统或手动切换深色主题，夜间使用更护眼</text
              >
            </view>
          </view>
          <view class="guide-step">
            <view class="step-icon">
              <MwpIcon name="clipboard-list" size="34rpx" />
            </view>
            <view class="step-body">
              <text class="step-title">提案广场</text>
              <text class="step-desc"
                >「新增」标签页迁移至首页「提案广场」，提案的发起与投票都从这里进入</text
              >
            </view>
          </view>
          <view class="guide-step">
            <view class="step-icon">
              <MwpIcon name="settings" size="34rpx" />
            </view>
            <view class="step-body">
              <text class="step-title">回退方式</text>
              <text class="step-desc"
                >用不习惯？在「我的」更多菜单可一键切回旧版外观</text
              >
            </view>
          </view>
        </view>
        <view class="guide-footer">
          <MwpButton tone="brand" block size="lg" @click="onMigrationDismiss"
            >开始体验</MwpButton
          >
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import {
  ref,
  reactive,
  computed,
  onMounted,
  onUnmounted,
  watchEffect
} from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { waitForLogin, relogin } from '@/utils/init';
import {
  showLoading,
  hideLoading,
  showSuccess,
  showError
} from '@/composables/useStatus';
import { http, useThemeStore } from '@/config';
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
// 数字按字符拆分，模板里每个字符占一个等宽槽位
const statDigitsList = computed(() =>
  String(totalComment.value ?? 0).split('')
);
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
  statSlotWidth: 23,
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
  const { r, available, radius, aspect, windowWidth, pxPerRpx, safeBottom } =
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
  L.helloSize = Math.min(Math.round(34 * scale), 40);
  L.nameSize = Math.min(Math.round(36 * scale), 44);
  L.searchHeight = Math.round(56 * scale);
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

  // 「已收录吐槽」数字采用等分槽位排布：模板中每个字符占一个固定宽度槽位，
  // 整排宽度由槽宽 × 位数决定，与字体字形宽度无关（旧方案按 0.66em 估算字形宽度，
  // 在字形偏窄的系统字体下会把数字算小）。字号只由卡片可用高度决定，并以槽宽的
  // 0.58em 作横向安全线，避免极宽字形溢出到相邻槽位。手机比例不设上限；仅宽屏保留上限。
  const statLen = Math.max(String(totalComment.value ?? 0).length, 1);
  const statContentW = Math.max(colWidth - L.statPadding * 2, 0);
  const statInnerH = Math.max(L.toolboxHeight - L.statPadding * 2, 0);
  L.statSlotWidth = statContentW / statLen;
  const STAT_GLYPH_EM = 0.58;
  const statNumSizeRaw = Math.min(
    L.statSlotWidth / STAT_GLYPH_EM,
    statInnerH * 0.46
  );
  L.statNumSize = Math.round(
    L.isWide ? Math.min(statNumSizeRaw, 40 * WIDE_SCALE_MAX) : statNumSizeRaw
  );

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
    // ===== 手机：严格三对齐构图 =====
    // 1) 搜索框上沿 = 可用区竖直中线
    // 2) logo 与上方文字、与搜索框上沿的间距相等（两侧同取 gapTight）
    // 3) 卡片上沿距搜索框下沿 = 卡片下沿距菜单栏上沿（两侧同取 gapLoose）
    // 有小白条时：useScreenScale.available 预留了整个安全区，
    // 而底部菜单栏 CSS 只占半个安全区（padding-bottom: env * 0.5）。
    // 补回差额，使首页容器底边对齐菜单栏真实上沿，三对齐才成立。
    const barStrip =
      safeBottom > 0 ? safeBottom - Math.round(safeBottom * 0.5) : 0;
    const regionH = available + barStrip;
    L.container = regionH;

    const helloArea = Math.round(36 * r);
    const nameArea = Math.round(40 * r);
    const searchTop = Math.round(regionH / 2);

    // 规则2：gapTight 同时作为 logo 上/下间距（模板已复用）。短屏下收窄，
    // 保证顶部留白不低于系统胶囊上沿，从而使规则1 可精确成立。
    const maxLogoGap = Math.floor(
      (searchTop - helloArea - nameArea - L.logoHeight - L.paddingTop) / 2
    );
    L.gapTight = Math.max(0, Math.min(L.gapTight, maxLogoGap));

    // 规则1：反推顶部留白，使搜索框上沿恰好落在中线
    const headerH = helloArea + nameArea + L.gapTight + L.logoHeight;
    L.paddingTop = Math.max(L.paddingTop, searchTop - headerH - L.gapTight);

    // 规则3：中线以下、搜索框以外的高度 belowH = 卡片高 + 两侧等距
    const belowH = Math.max(regionH - searchTop - L.searchHeight, 0);
    const minGap = Math.round(8 * scale);
    let box = Math.round(regionH * 0.3);
    box = Math.min(box, Math.max(belowH - minGap * 2, 0));
    box = Math.max(box, 0);
    // 取整后反推卡片高度，保证上下间距严格相等（消除 1px 余数）
    L.gapLoose = Math.max(Math.floor((belowH - box) / 2), 0);
    L.toolboxHeight = Math.max(belowH - L.gapLoose * 2, 0);
    L.bottomGap = L.gapLoose;
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
    isAdmin.value = false;
  }
};

// ===== 手动刷新登录（点击 Hello, 触发）=====
// 方便真机上遇到鉴权问题时一键强制重新登录并刷新数据
const onHelloTap = async () => {
  if (refreshingAuth.value) return;
  refreshingAuth.value = true;
  showLoading('更新登录中...');
  try {
    // 手动刷新登录：跳过重登冷却，强制走一次完整登录
    const token = await relogin(true);
    if (token) {
      showSuccess('登录已更新');
      // 广播刷新首页与「我的」的数据，并清除 Hello 高亮
      uni.$emit('authRefreshed');
    } else {
      showError('登录更新失败：请检查网络或后端登录接口');
    }
  } catch (err) {
    console.error('[home-view] onHelloTap error:', err);
    showError('登录更新异常');
  } finally {
    hideLoading();
    refreshingAuth.value = false;
  }
};

// ===== 旧版迁移欢迎弹窗 =====
// 新版与旧版共用 storage、无版本号可依，改用「旧版使用痕迹」判断：
// 命中任一旧版会写入的 key，且尚未写过迁移标记，即认为是从旧版迁移过来。
// 注意：全新用户走新手引导（onGuideDismiss）时也会写入迁移标记，从而不会误触发。
const MIGRATION_KEY = 'meowpick_new_version_welcome_seen';
const LEGACY_KEYS = [
  'meowpick_guide_seen',
  'meowpick_profile_guide_seen',
  'hasReadLetter',
  'searchHistory',
  'find_page_state'
];
const showMigrationWelcome = ref(false);

const hasLegacyTrace = () =>
  LEGACY_KEYS.some((key) => {
    const v = uni.getStorageSync(key);
    return v !== '' && v !== null && v !== undefined && v !== false;
  });

// 是否应弹出迁移欢迎：非全新用户、且本次改版尚未欢迎过
const shouldWelcomeMigration = () =>
  !uni.getStorageSync(MIGRATION_KEY) && hasLegacyTrace();

const onMigrationDismiss = () => {
  showMigrationWelcome.value = false;
  uni.setStorageSync(MIGRATION_KEY, true);
};

// ===== 引导弹窗 =====
const onGuideDismiss = () => {
  applyDefaults();
  showGuide.value = false;
  uni.setStorageSync(GUIDE_KEY, true);
  // 全新用户已看过新手引导，视为已欢迎，迁移弹窗不再触发
  uni.setStorageSync(MIGRATION_KEY, true);
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
// 登录刷新成功（首页点 Hello）后刷新首页数据
const onAuthRefreshed = () => {
  fetchTotalComment();
  loadUserInfo();
  detectAdmin();
};

onMounted(async () => {
  await waitForLogin();
  fetchTotalComment();
  loadUserInfo();
  detectAdmin();
  // 监听授权成功事件，实时更新昵称
  uni.$on('userInfoUpdated', loadUserInfo);
  uni.$on('authRefreshed', onAuthRefreshed);

  const hasReadLetter = uni.getStorageSync('hasReadLetter');
  showNewIcon.value = !hasReadLetter;

  // 检查是否首次使用
  const hasSeenGuide = uni.getStorageSync(GUIDE_KEY);
  if (!hasSeenGuide) {
    showGuide.value = true;
  } else if (shouldWelcomeMigration()) {
    // 非全新用户：从旧版迁移过来，欢迎一次新版
    showMigrationWelcome.value = true;
  }
});

onShow(() => {
  loadUserInfo();
  detectAdmin();
});

onUnmounted(() => {
  uni.$off('userInfoUpdated', loadUserInfo);
  uni.$off('authRefreshed', onAuthRefreshed);
});

const fetchTotalComment = () => {
  return http.CommentController.searchTotalList()
    .then((res) => {
      const count = res.data?.data?.count ?? 0;
      totalComment.value = count;
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
    font-weight: $weight-semibold;
    color: $text-placeholder-light;
    font-style: normal;
    opacity: 0.8;
    transition: opacity $dur-fast $ease-standard;

    &.is-refreshing {
      opacity: 0.4;
    }
  }

  .name-text {
    font-weight: $weight-heavy;
    color: $text-primary-light;
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
    color: $text-tertiary-dark;
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
      margin-right: 24rpx;
      color: $text-tertiary-light;

      .dark-theme & {
        color: $text-tertiary-dark;
      }
    }

    .search-placeholder {
      flex: 1;
      font-size: $font-lg;
      color: $text-tertiary-light;
      letter-spacing: 1rpx;
      font-weight: $weight-regular;
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

// 卡片外壳：不裁剪，让 NEW 角标能悬挂到卡片外。
// 纵向 flex，使内部卡片 flex:1 作用在高度上（与直接作为列子项时一致）。
.card-wrap {
  position: relative;
  flex: 3;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

// 通用卡片 - 面板风格
// 注意：flex 子项自身不设 padding（border-box 下 flex-basis:0% 会把 padding
// 计入基准尺寸，导致 flex-grow 比例被破坏），内边距统一交给 .card-inner。
.card-item {
  background-color: $bg-card-light;
  border-radius: $radius-card;
  padding: 0;
  position: relative;
  overflow: hidden;
  box-shadow: $shadow-comp;

  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  @include mwp-transition($dur-instant, $ease-standard);

  // 承载内边距，纵向居中；使 .card-item 自身保持零 padding
  .card-inner {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .card-title {
    font-size: $font-lg;
    font-weight: $weight-bold;
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
    opacity: 0.15;
    z-index: 1;
    color: $brand-red;
    transform: rotate(-15deg);

    .dark-theme & {
      color: $brand-red-soft;
    }
  }

  &:active {
    transform: scale($press-scale-sm);
  }

  // 主功能卡：提案广场，品牌渐变 + 品牌标题色
  // 左列上/下卡高度比 4:3（下方 letter-card 在外壳 .card-wrap 上取 flex:3）
  &.log-card {
    flex: 4;
    background: $gradient-brand-soft;
    .card-title {
      @include text-gradient;
    }
    // 图标略往左上移，避免被卡片边缘裁掉太多
    .card-bg-icon {
      right: -10rpx;
      bottom: -2rpx;
    }
  }

  // 致用户的一封信：标题略小，与主功能卡形成层级
  &.letter-card {
    .card-title {
      font-size: $font-base;
    }
  }
}

// hover-class 按压态：小程序 `view` 用 hover-class 比 `:active` 更可靠
.card-hover {
  transform: scale($press-scale-sm);
}
// 搜索框是整宽大块，缩放位移更明显，单独用更小的幅度
.search-hover {
  transform: scale(0.99);
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
    @include text-gradient($brand-red-soft, $brand-red);
  }
}

.new-tag {
  position: absolute;
  // 越出卡片上/右边界，形成悬挂在右上角的角标
  top: -12rpx;
  right: -12rpx;
  background: $gradient-brand;
  color: $pure-white;
  font-size: $font-xs;
  font-weight: $weight-bold;
  padding: 4rpx 12rpx;
  border-radius: $radius-pill;
  box-shadow: $shadow-sm;
  z-index: 3;

  .dark-theme & {
    background: $gradient-brand-dark;
    box-shadow: $shadow-sm-dark;
  }
}

// 统计卡片：纵向大卡片
.stat-card {
  flex: 1;
  min-height: 0;
  background-color: $bg-card-light;
  color: $text-primary-light;
  border-radius: $radius-card;
  padding: $space-8;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  box-shadow: $shadow-comp;

  .stat-title {
    font-size: $font-lg;
    font-weight: $weight-bold;
    opacity: 1;
    color: $text-tertiary-light;
  }

  // 数字行：等分槽位，每字固定槽宽、整排居中
  .stat-number-row {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .stat-number {
    display: block;
    text-align: center;
    font-weight: $weight-heavy;
    line-height: 1;
    @include text-gradient;
  }

  .stat-unit {
    font-size: $font-md;
    color: $text-secondary-light;
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
    @include text-gradient($brand-red-soft, $brand-red);
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
    transition: color $dur-fast $ease-standard;

    &:active {
      color: $brand-red;
    }
  }
}
// ===== 引导弹窗（样式统一在 styles/_guide.scss） =====
@import '../../styles/guide';
</style>
