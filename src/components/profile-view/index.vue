<template>
  <view class="profile-container" :class="themeStore.themeClass" :style="{ paddingTop: topReservedHeight + 'px', minHeight: containerHeight + 'px' }">
    <!-- 头像层：sticky 固定在视觉位置，不随内容滚动 -->
    <view class="user-info-sticky" :style="{ top: topReservedHeight + 'px' }">
      <button class="sticky-avatar-btn" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
        <image v-if="!isDefaultAvatar && avatarUrl" :src="avatarUrl" class="sticky-avatar-img" mode="aspectFill" />
        <image v-else :src="avatarUrl || defaultCatAvatar" class="sticky-avatar-default" mode="aspectFill" />
      </button>
      <view class="sticky-avatar-meta">
        <view class="sticky-avatar-name" hover-class="mwp-hover-sm" @click="openNicknameModal">{{ userName }}</view>
        <text class="sticky-avatar-contrib">贡献值：{{ contribution }}</text>
      </view>
      <!-- 更多按钮 -->
      <view class="user-more-btn" @click="toggleMoreMenu" hover-class="mwp-hover">
        <view class="line"></view>
        <view class="line"></view>
        <view class="line"></view>
      </view>
    </view>

    <!-- 更多菜单弹出层 -->
    <view v-if="showMoreMenu" class="more-menu-mask" @click="showMoreMenu = false" />
    <view v-if="showMoreMenu" class="more-menu-popover" :class="themeStore.themeClass">
      <view class="menu-item" @click="handleMenuClick('theme')" hover-class="mwp-hover">
        <text class="menu-icon">{{ themeStore.isDark ? '☀️' : '🌙' }}</text>
        <text class="menu-text">{{ themeStore.isDark ? '浅色模式' : '深色模式' }}</text>
      </view>
      <view class="menu-item" @click="handleMenuClick('nickname')" hover-class="mwp-hover">
        <text class="menu-icon">✏️</text>
        <text class="menu-text">更改昵称</text>
      </view>
      <view class="menu-item" @click="handleMenuClick('feed')" hover-class="mwp-hover">
        <text class="menu-icon">📋</text>
        <text class="menu-text">提案广场</text>
      </view>
      <view class="menu-item" @click="handleMenuClick('feedback')" hover-class="mwp-hover">
        <text class="menu-icon">💬</text>
        <text class="menu-text">我要反馈</text>
      </view>
      <!-- 管理员专属菜单 -->
      <template v-if="isAdmin">
        <view class="menu-item" @click="handleMenuClick('admin')" hover-class="mwp-hover">
          <text class="menu-icon">{{ adminMode ? '✅' : '❌' }}</text>
          <text class="menu-text">管理员{{ adminMode ? '' : '(已关闭)' }}</text>
        </view>
        <template v-if="adminMode">
          <view class="menu-item" @click="handleMenuClick('logs')" hover-class="mwp-hover">
            <text class="menu-icon">📑</text>
            <text class="menu-text">提案日志</text>
          </view>
          <view class="menu-item" @click="handleMenuClick('test')" hover-class="mwp-hover">
            <text class="menu-icon">🧪</text>
            <text class="menu-text" :class="{ 'text-danger': testMode }">测试模式{{ testMode ? '(已开启)' : '' }}</text>
          </view>
        </template>
      </template>
      <!-- 非管理员显示更新日志 -->
      <view v-if="!isAdmin" class="menu-item" @click="handleMenuClick('changelog')" hover-class="mwp-hover">
        <text class="menu-icon">📝</text>
        <text class="menu-text">更新日志</text>
      </view>
    </view>

    <!-- "我的发布"（position: relative，z-index 高于头像层，滚动时覆盖） -->
    <view class="my-publish-card">
      <!-- 标题 -->
      <view class="my-publish-header">
        <text class="page-title">我的发布</text>
      </view>

      <!-- 筛选胶囊（sticky，与系统胶囊居中对齐时停住） -->
      <view class="sticky-bar" :style="{ top: filterCenterTop + 'px' }">
        <!-- 左侧：条数胶囊（与系统胶囊视觉对称） -->
        <view class="count-pill">
          <text>{{ loading ? '...' : filteredList.length }}条</text>
        </view>
        <!-- 居中：筛选胶囊 -->
        <view class="filter-row-wrapper">
          <view class="filter-pill"
            :class="{ active: currentFilter === 'all' }"
            @click="setFilter('all')"
           hover-class="mwp-hover">
            <text>全部</text>
          </view>
          <view class="filter-pill"
            :class="{ active: currentFilter === 'comment' }"
            @click="setFilter('comment')"
           hover-class="mwp-hover">
            <text>吐槽</text>
          </view>
          <view class="filter-pill"
            :class="{ active: currentFilter === 'proposal' }"
            @click="setFilter('proposal')"
           hover-class="mwp-hover">
            <text>提案</text>
          </view>
        </view>
      </view>

      <!-- 列表（my-publish-card 用 sticky 整体悬停，列表在内部自然展开） -->
      <view class="list-container" :style="{ minHeight: listMinHeight + 'px' }">
        <SkeletonCard v-if="loading" :count="3" />

        <EmptyState v-else-if="error" tone="danger" emoji="⚠️" title="加载失败" compact>
          <template #action>
            <MwpButton tone="danger" @click="loadData">重试</MwpButton>
          </template>
        </EmptyState>

        <EmptyState v-else-if="filteredList.length === 0" emoji="🐾" title="这里空空如也~" compact />

        <view
          v-else
          v-for="(item, index) in filteredList"
          :key="item.id"
          class="list-item mwp-pressable mwp-fade-in" hover-class="result-hover"
          :style="{ animationDelay: Math.min(index * 60, 300) + 'ms' }"
          @click="onItemClick(item)"
          @longpress="onCardMenu(item)"
        >
          <view v-if="item.type === 'comment'" class="card comment-card">
            <view class="card-main">
              <view class="course-row-top">
                <text class="course-name">{{ item.courseName }}</text>
                <text class="time-text">{{ item.time }}</text>
              </view>
              <view class="course-row-middle">
                <view class="course-info-item">
                  <image src="@/images/depart-icon.png" class="info-icon" />
                  <text>未知院系</text>
                </view>
              </view>
              <text class="content-text">{{ item.content }}</text>
              <view class="footer-row">
                <view class="likes-box">
                  <image src="@/images/like-icon.png" class="like-icon" />
                  <text class="likes-text">{{ item.likes || 0 }}</text>
                </view>
                <view class="card-more-btn" @click.stop="onCardMenu(item)" hover-class="mwp-hover">
                  <text>⋯</text>
                </view>
              </view>
            </view>
          </view>

          <view v-if="item.type === 'proposal'" class="card proposal-card">
            <view class="card-main">
              <view class="course-row-top">
                <text class="course-name">{{ item.courseName }}</text>
                <text class="time-text">{{ item.time }}</text>
              </view>
              <view class="course-row-middle">
                <view class="course-info-item">
                  <image src="@/images/depart-icon.png" class="info-icon" />
                  <text>未知院系</text>
                </view>
              </view>
              <text class="content-text">{{ item.reason }}</text>
              <view class="footer-row">
                <view class="vote-count-box">
                  <image src="@/images/like_active.png" class="vote-icon" />
                  <text class="vote-num">{{ item.voteCount || 0 }}</text>
                  <text class="vote-label">支持</text>
                </view>
                <view class="footer-right">
                  <StatusBadge
                    :status="item.status"
                    :label="item.status === 'approved' ? '已采纳' : item.status === 'rejected' ? '已拒绝' : '投票中'"
                    pill
                  />
                  <view class="card-more-btn" @click.stop="onCardMenu(item)" hover-class="mwp-hover">
                    <text>⋯</text>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>

        <view v-if="filteredList.length > 0 && !loading" class="end-hint">
          <text>—— 到底了 ——</text>
        </view>
        <view style="height: 160rpx;"></view>
      </view>
    </view>

    <!-- 引导弹窗 -->
    <view v-if="showGuide" class="guide-overlay" :class="themeStore.themeClass">
      <view class="guide-content" @click.stop>
        <view class="guide-header">
          <text class="guide-title">个性化你的主页</text>
          <text class="guide-subtitle">选择头像和昵称，展现你的个性</text>
        </view>
        <view class="guide-steps">
          <view class="guide-step">
            <view class="step-icon">🎨</view>
            <view class="step-body">
              <text class="step-title">选择头像</text>
              <text class="step-desc">从微信头像中选择，或使用随机默认头像</text>
            </view>
          </view>
          <view class="guide-step">
            <view class="step-icon">✏️</view>
            <view class="step-body">
              <text class="step-title">设置昵称</text>
              <text class="step-desc">使用微信昵称或自定义，发布提案时作为贡献记录</text>
            </view>
          </view>
        </view>
        <view class="guide-footer">
          <button class="avatar-btn" open-type="chooseAvatar" @chooseavatar="onGuideChooseAvatar">
            选择头像
          </button>
          <view class="guide-skip" @click="onGuideSkip" hover-class="mwp-hover">跳过，使用默认</view>
        </view>
      </view>
    </view>
  </view>

  <!-- Floating Action Button -->
  <view class="fab-btn" @click="onAddClick" hover-class="mwp-hover">
    <view class="plus-icon">+</view>
  </view>

  <!-- Nickname Edit Modal -->
  <view v-if="showNicknameModal" class="modal-overlay" @click="closeNicknameModal">
    <view class="modal-card" :class="themeStore.themeClass" @click.stop>
      <view class="modal-header">
        <text class="modal-title">设置你的昵称</text>
        <view class="modal-close" @click="closeNicknameModal" hover-class="mwp-hover">×</view>
      </view>

      <view class="modal-body">
        <view class="nickname-avatar-preview">
          <image :src="(!isDefaultAvatar && avatarUrl) ? avatarUrl : defaultCatAvatar" class="preview-avatar" mode="aspectFill" />
        </view>
        <text class="field-label">输入昵称（点击输入框可获取微信昵称建议）</text>
        <input
          class="nickname-input"
          v-model="newNickname"
          type="nickname"
          :maxlength="20"
          placeholder="请输入昵称"
        />
        <text class="word-count">{{ newNickname.length }}/20</text>
      </view>

      <view class="modal-footer">
        <view class="btn-cancel" @click="closeNicknameModal" hover-class="mwp-hover">取消</view>
        <view class="btn-confirm" :class="{ disabled: submittingNickname }" @click="confirmNicknameChange" hover-class="mwp-hover">
          {{ submittingNickname ? '提交中...' : '确认' }}
        </view>
      </view>
    </view>
  </view>

  <feedback-modal v-model:visible="showFeedbackModal" />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { waitForLogin } from '@/utils/init';
import { http, useThemeStore } from '@/config';
import { HISTORY_PAGE_SIZE } from '@/utils/constants';
import FeedbackModal from '@/components/feedback/feedback-modal.vue';
import { useRouteStore } from '@/config';
import defaultCatAvatar from '@/images/cat-emoji/cat_face.png';
import catGrinning from '@/images/cat-emoji/grinning_cat.png';
import catHeartEyes from '@/images/cat-emoji/heart-eyes-cat.png';
import catGrinningEyes from '@/images/cat-emoji/grinning_cat_with_smiling_eyes.png';
import catKissing from '@/images/cat-emoji/kissing_cat.png';
import catCrying from '@/images/cat-emoji/crying_cat.png';
import catPouting from '@/images/cat-emoji/pouting_cat.png';
import catHardcore from '@/images/cat-emoji/hardcore-cat.png';
const themeStore = useThemeStore();

const props = defineProps<{
  scrollTop?: number;
}>();

// 胶囊位置信息（顶部留白计算用）
const sysInfo = uni.getSystemInfoSync();
const pxPerRpx = sysInfo.windowWidth / 750;
const safeBottom = sysInfo.safeAreaInsets?.bottom || 0;
let menuButtonInfo = {
    top: sysInfo.statusBarHeight ? sysInfo.statusBarHeight + 4 : 48,
    height: 32,
    width: 87
};
try {
    const res = uni.getMenuButtonBoundingClientRect();
    if (res && res.top) {
        menuButtonInfo = { top: res.top, height: res.height, width: res.width };
    }
} catch (e) {}

// 顶部预留：胶囊底部 + 胶囊下方间距
const topReservedHeight = computed(() => menuButtonInfo.top + menuButtonInfo.height);

// 布局计算（与 home-view 同策略：JS 算出精确高度，确保填满视口无灰色空白）
const tabBarH = Math.round(100 * pxPerRpx) + safeBottom + (safeBottom > 0 ? 0 : Math.round(24 * pxPerRpx));
const containerHeight = sysInfo.windowHeight - tabBarH;
const paddingTopPx = topReservedHeight.value;
const stickyHeaderPx = paddingTopPx + 24 * pxPerRpx;
const cardHeaderPx = 8 * pxPerRpx + 20 * pxPerRpx + 52 * pxPerRpx;
const filterBarPx = 16 * pxPerRpx + 64 * pxPerRpx + 8 * pxPerRpx;
const listPaddingPx = 24 * pxPerRpx + 40 * pxPerRpx;
const listMinHeight = Math.max(0, containerHeight - stickyHeaderPx - cardHeaderPx - filterBarPx - listPaddingPx);

// 筛选胶囊与系统胶囊居中对齐的 top 值
// 胶囊高度64rpx，换算为px
const filterCapsuleHeightPx = 64 * (sysInfo.windowWidth / 750);
const filterCenterTop = computed(() => {
  const capsuleCenter = menuButtonInfo.top + menuButtonInfo.height / 2;
  return capsuleCenter - filterCapsuleHeightPx / 2;
});

// 用户信息
const userName = ref('同学');
const avatarUrl = ref('');
const contribution = ref(0);

const generateDefaultName = () => {
    return '华师喵' + Math.floor(1000 + Math.random() * 9000);
};

const DEFAULT_AVATARS = [
    defaultCatAvatar,
    catGrinning,
    catHeartEyes,
    catGrinningEyes,
    catKissing,
    catCrying,
    catPouting,
    catHardcore,
];
const DEFAULT_AVATAR_SET = new Set<string>(DEFAULT_AVATARS);

const generateDefaultAvatar = () => {
    return DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)];
};

// 是否正在使用随机默认头像（用户主动选择过微信头像后为 false）
const isDefaultAvatar = ref(true);

const loadUserInfo = () => {
    const stored = uni.getStorageSync('userInfo');
    if (stored) {
        if (stored.nickName) userName.value = stored.nickName;
        if (stored.avatarUrl) avatarUrl.value = stored.avatarUrl;
        if (stored.contribution !== undefined) contribution.value = stored.contribution;
        if (typeof stored.avatarIsDefault === 'boolean') {
            isDefaultAvatar.value = stored.avatarIsDefault;
        } else if (stored.avatarUrl) {
            // 兼容旧数据：本地默认头像资源视为默认，其余视为用户头像
            isDefaultAvatar.value = DEFAULT_AVATAR_SET.has(stored.avatarUrl);
        }
    }
    if (!userName.value || userName.value === '同学') {
        userName.value = generateDefaultName();
    }
    if (!avatarUrl.value) {
        avatarUrl.value = generateDefaultAvatar();
        isDefaultAvatar.value = true;
    }
};

// ===== 核心数据 =====
const listData = ref<any[]>([]);
const loading = ref(false);
const error = ref(false);

type ItemType = 'comment' | 'proposal';
interface ListItem {
    id: string;
    type: ItemType;
    time: string;
    courseName: string;
    content?: string;
    likes?: number;
    reason?: string;
    voteCount?: number;
    status?: 'pending' | 'approved' | 'rejected';
}

const currentFilter = ref<'all' | 'comment' | 'proposal'>('all');

const filteredList = computed(() => {
    let result = [...listData.value];
    if (currentFilter.value !== 'all') {
        result = result.filter(item => item.type === currentFilter.value);
    }
    return result.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
});

const setFilter = (filter: 'all' | 'comment' | 'proposal') => {
    currentFilter.value = filter;
};

// ===== 首次使用引导 =====
const showGuide = ref(false);
const GUIDE_KEY = 'meowpick_profile_guide_seen';

const hideGuide = () => {
    showGuide.value = false;
    uni.setStorageSync(GUIDE_KEY, true);
};

const onGuideChooseAvatar = (e: any) => {
    const avatarUrlRes = e.detail?.avatarUrl;
    if (avatarUrlRes) {
        avatarUrl.value = avatarUrlRes;
        isDefaultAvatar.value = false;
        const stored = uni.getStorageSync('userInfo') || {};
        stored.avatarUrl = avatarUrlRes;
        stored.avatarIsDefault = false;
        uni.setStorageSync('userInfo', stored);
    }
    // 头像选完后打开昵称输入（type="nickname" 会自动建议微信昵称）
    showGuide.value = false;
    nextTick(() => openNicknameModal());
};

const onGuideSkip = () => {
    showGuide.value = false;
    // 不标记 GUIDE_KEY，下次进入"我的"还会弹
};

const checkGuide = () => {
    // 首次进入"我的"页时显示引导
    const hasSeen = uni.getStorageSync(GUIDE_KEY);
    if (!hasSeen) {
        showGuide.value = true;
    }
};

// ===== 头像选择（微信官方组件触发） =====
const onChooseAvatar = (e: any) => {
    const url = e.detail?.avatarUrl;
    if (url) {
        avatarUrl.value = url;
        isDefaultAvatar.value = false;
        const stored = uni.getStorageSync('userInfo') || {};
        stored.avatarUrl = url;
        stored.avatarIsDefault = false;
        uni.setStorageSync('userInfo', stored);
        uni.$emit('userInfoUpdated');
    }
};

// ===== 首次引导已合并到首页 home-view =====

// ===== Modals =====
const showNicknameModal = ref(false);
const showFeedbackModal = ref(false);
const newNickname = ref('');
const submittingNickname = ref(false);

const openNicknameModal = () => {
    newNickname.value = '';
    showNicknameModal.value = true;
};

const closeNicknameModal = () => {
    showNicknameModal.value = false;
};

const confirmNicknameChange = async () => {
    const trimmed = newNickname.value.trim();
    if (!trimmed) {
        return uni.showToast({ title: '昵称不能为空', icon: 'none' });
    }
    if (trimmed.length > 20) {
        return uni.showToast({ title: '昵称不超过20字符', icon: 'none' });
    }
    submittingNickname.value = true;
    try {
        const stored = uni.getStorageSync('userInfo') || {};
        stored.nickName = trimmed;
        if (!stored.avatarUrl) {
            stored.avatarUrl = generateDefaultAvatar();
            stored.avatarIsDefault = true;
            isDefaultAvatar.value = true;
        }
        uni.setStorageSync('userInfo', stored);
        userName.value = trimmed;
        uni.$emit('userInfoUpdated');
        uni.showToast({ title: '修改成功', icon: 'success' });
        closeNicknameModal();
    } catch (err) {
        uni.showToast({ title: '修改失败，请重试', icon: 'none' });
    } finally {
        submittingNickname.value = false;
    }
};

// ===== 管理员权限 =====
const isAdmin = ref(false);
const adminMode = ref(true); // 管理员模式，默认开启
const testMode = ref(false); // 测试模式，默认关闭（一次性）

const detectAdmin = async () => {
    try {
        const res: any = await http.AuthController.authIsAdminList();
        const flag = res.data?.data?.isAdmin ?? res.data?.isAdmin ?? false;
        isAdmin.value = !!flag;
    } catch {
        isAdmin.value = false;
    }
    // 临时管理员（长按"我的" tab 10秒 + 密码验证）
    if (!isAdmin.value) {
        const tempAdmin = uni.getStorageSync('meowpick_temp_admin');
        if (tempAdmin) isAdmin.value = true;
    }
    if (isAdmin.value) {
        // 读取上次管理员模式状态，默认开启
        const saved = uni.getStorageSync('meowpick_admin_mode');
        adminMode.value = saved !== false;
    }
};

const toggleAdminMode = () => {
    adminMode.value = !adminMode.value;
    uni.setStorageSync('meowpick_admin_mode', adminMode.value);
    if (!adminMode.value) {
        testMode.value = false; // 关闭管理员模式时同步关闭测试模式
    }
};

const toggleTestMode = () => {
    testMode.value = !testMode.value;
};

// ===== More Menu (⋯ 按钮) =====
const showMoreMenu = ref(false);

const toggleMoreMenu = () => {
    showMoreMenu.value = !showMoreMenu.value;
};

const handleMenuClick = (action: 'theme' | 'feed' | 'nickname' | 'feedback' | 'changelog' | 'admin' | 'logs' | 'test') => {
    switch (action) {
        case 'theme':
            themeStore.toggleTheme();
            break;
        case 'feed':
            showMoreMenu.value = false;
            uni.navigateTo({ url: '/pages/proposal/list/list' });
            break;
        case 'nickname':
            showMoreMenu.value = false;
            openNicknameModal();
            break;
        case 'feedback':
            showMoreMenu.value = false;
            showFeedbackModal.value = true;
            break;
        case 'changelog':
            showMoreMenu.value = false;
            uni.navigateTo({ url: '/pages/home/update-log' });
            break;
        case 'admin':
            toggleAdminMode();
            break;
        case 'logs':
            showMoreMenu.value = false;
            uni.navigateTo({ url: '/pages/proposal/log/log' });
            break;
        case 'test':
            toggleTestMode();
            break;
    }
};

// ===== 滚动覆盖效果 =====
// 现在依赖外层 scroll-view 滚动：user-info-layer 滚出屏幕后 my-publish-card 视觉上覆盖
// 筛选胶囊 sticky 在 my-publish-card 顶部，滚动时一直可见

// ===== 数据加载 =====
const loadData = async () => {
    loading.value = true;
    error.value = false;
    try {
        const [commentRes, proposalRes] = await Promise.all([
            http.CommentController.commentHistoryCreate({ page: 1, pageSize: HISTORY_PAGE_SIZE }),
            http.ProposalController.proposalHistoryList({ page: 1, pageSize: HISTORY_PAGE_SIZE })
        ]);

        const comments = (commentRes.data?.data?.comments || commentRes.data?.comments || []).map((c: any) => ({
            id: c.id || c.courseId,
            type: 'comment' as ItemType,
            time: c.createdAt ? new Date(c.createdAt).toISOString().split('T')[0] : '',
            courseName: c.name || c.courseName || '未知课程',
            content: c.content || c.text || '',
            likes: c.likeCnt || 0
        }));

        const proposals = (proposalRes.data?.data?.proposals || proposalRes.data?.proposals || []).map((p: any) => ({
            id: p.id,
            type: 'proposal' as ItemType,
            time: p.createdAt ? new Date(p.createdAt).toISOString().split('T')[0] : '',
            courseName: p.title || p.courseName || '未知提案',
            reason: p.content || p.reason || '',
            voteCount: p.likeCnt || p.agreeCount || 0,
            status: p.status === 'approved' ? 'approved' : p.status === 'rejected' ? 'rejected' : 'pending'
        }));

        listData.value = [...comments, ...proposals];
    } catch (err) {
        console.error('[profile-view] loadData error:', err);
        error.value = true;
        uni.showToast({ title: '加载失败，请重试', icon: 'none' });
    } finally {
        loading.value = false;
    }
};

// ===== 路由跳转 =====
const onItemClick = (item: ListItem) => {
    if (item.type === 'comment') {
        uni.navigateTo({
            url: `/pages/course/index/index?id=${item.id}`
        });
    } else {
        const dataStr = encodeURIComponent(JSON.stringify(item));
        uni.navigateTo({
            url: `/pages/course/proposal-detail/index?data=${dataStr}`
        });
    }
};

// ===== 长按/三点按钮菜单 =====
let actionTarget: ListItem | null = null;

const onCardMenu = (item: ListItem) => {
    actionTarget = item;
    const itemList = item.type === 'proposal'
        ? ['查看详情', '修改', '删除']
        : ['查看详情', '修改', '删除'];

    uni.showActionSheet({
        itemList,
        success: (res) => {
            const action = itemList[res.tapIndex];
            if (action === '查看详情') {
                onItemClick(item);
            } else if (action === '修改') {
                if (item.type === 'proposal') {
                    uni.navigateTo({ url: `/pages/proposal/propose/propose?editProposalId=${item.id}` });
                } else {
                    uni.showToast({ title: '功能正在开发中', icon: 'none' });
                }
            } else if (action === '删除') {
                deleteItem(item);
            }
        }
    });
};

const deleteItem = async (item: ListItem) => {
    try {
        if (item.type === 'proposal') {
            await http.ProposalController.proposalDeleteCreate(item.id);
        } else {
            uni.showToast({ title: '评论暂不支持删除', icon: 'none' });
            return;
        }
        listData.value = listData.value.filter(i => i.id !== item.id);
        uni.showToast({ title: '已删除', icon: 'success' });
    } catch (err) {
        console.error('Delete failed:', err);
        uni.showToast({ title: '删除失败', icon: 'none' });
    }
};

const onAddClick = () => {
    if (currentFilter.value === 'comment') {
        uni.navigateTo({ url: '/pages/find/index/index?mode=add-comment' });
        return;
    }
    if (currentFilter.value === 'proposal') {
        uni.navigateTo({ url: '/pages/proposal/propose/propose' });
        return;
    }

    uni.showActionSheet({
        itemList: ['新增吐槽', '新增提案'],
        success: (res) => {
            if (res.tapIndex === 0) uni.navigateTo({ url: '/pages/find/index/index?mode=add-comment' });
            else if (res.tapIndex === 1) uni.navigateTo({ url: '/pages/proposal/propose/propose' });
        }
    });
};

// ===== 生命周期 =====
onMounted(async () => {
    await waitForLogin();
    loadUserInfo();
    detectAdmin();
    loadData();
    checkGuide();
    // 监听首页授权成功事件
    uni.$on('userInfoUpdated', loadUserInfo);
});

onShow(() => {
    loadUserInfo();
    if (listData.value.length > 0) {
        loadData();
    }
});
</script>

<style scoped lang="scss">
// 底色：页面级灰（基层），“我的发布”卡片以白底 + 阴影浮于其上
.profile-container {
    position: relative;
    padding: 0 40rpx;
    box-sizing: border-box;
    background-color: $bg-page-light;
    height: 100%;
    overflow: visible;

    .dark-theme & {
        background-color: $bg-page-dark;
    }
}

.user-more-btn {
    position: relative;
    width: 64rpx;
    height: 64rpx;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 7rpx;
    background-color: $bg-card-light;
    border-radius: 100rpx;
    box-shadow: 0 6rpx 16rpx rgba(0, 0, 0, 0.06);
    flex-shrink: 0;
    transition: transform 0.15s $ease-standard, box-shadow 0.15s ease-out;

    &:active {
        transform: scale(0.92);
        box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
    }

    .line {
        width: 30rpx;
        height: 3rpx;
        background-color: $text-secondary-light;
        border-radius: 2rpx;
        display: block;
        transition: background-color 0.15s;
    }
}

/* "我的发布"组件（圆角矩形，紧接底层下方） */
.profile-body {
    flex: 1; /* 占据剩余空间 */
    display: flex;
    flex-direction: column;
    min-height: 0;
}

.user-info-sticky {
    position: sticky;
    z-index: 2;
    padding: 0 0 24rpx;
    display: flex;
    align-items: center;
    gap: 28rpx;
    background-color: $bg-page-light;

    .dark-theme & {
        background-color: $bg-page-dark;
    }
}

.sticky-avatar-btn {
    width: 108rpx;
    height: 108rpx;
    border-radius: 50%;
    background: linear-gradient(135deg, #ffe2e8 0%, #ffd4d4 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    box-shadow: $shadow-brand-sm;
    border: none;
    padding: 0;
    margin: 0;
    overflow: hidden;
    -webkit-tap-highlight-color: transparent;
    @include pressable($press-scale-lg);

    .dark-theme & {
        background: linear-gradient(135deg, #4a2828 0%, #6a3838 100%);
        box-shadow: $shadow-md-dark;
    }
}

.sticky-avatar-circle {
    width: 108rpx;
    height: 108rpx;
    border-radius: 50%;
    background: linear-gradient(135deg, #ffe2e8 0%, #ffd4d4 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    box-shadow: $shadow-brand-sm;

    .dark-theme & {
        background: linear-gradient(135deg, #4a2828 0%, #6a3838 100%);
        box-shadow: $shadow-md-dark;
    }
}

.sticky-avatar-emoji {
    font-size: 76rpx;
    line-height: 1;
}

.sticky-avatar-img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
}

.sticky-avatar-default {
    width: 82%;
    height: 82%;
    border-radius: 50%;
    margin-top: -10%;
}

.sticky-avatar-meta {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 10rpx;
    min-width: 0;
}

.sticky-avatar-name {
    font-size: 40rpx;
    font-weight: 800;
    color: $text-primary-light;
    letter-spacing: -1rpx;
    line-height: 1.2;
    transition: opacity $dur-fast $ease-standard, transform $dur-fast $ease-emphasized;

    &:active {
        opacity: 0.6;
        transform: scale(0.97);
    }

    .dark-theme & {
        color: $text-primary-dark;
    }
}

.sticky-avatar-contrib {
    font-size: 32rpx;
    color: $text-tertiary-light;
    font-weight: 400;

    &--unauth {
        color: $brand-red;
        font-weight: 500;
    }

    .dark-theme & {
        color: $text-tertiary-dark;
        &--unauth { color: $brand-red-soft; }
    }
}

.my-publish-card {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
    background-color: $bg-card-light;
    border-radius: $radius-2xl $radius-2xl 0 0;
    box-shadow: $shadow-md;
    margin: 0 -40rpx;
    padding-top: $space-7;
    position: relative;
    z-index: 5;

    .dark-theme & {
        background-color: $bg-card-dark;
        box-shadow: $shadow-md-dark;
    }
}

.my-publish-header {
    padding: 8rpx 40rpx 20rpx;
    text-align: center;

    .page-title {
        font-size: 52rpx;
        font-weight: 800;
        color: $text-primary-light;
        letter-spacing: -1rpx;
        display: block;
    }

    .sub-title {
        font-size: 24rpx;
        color: $text-tertiary-light;
        margin-top: 4rpx;
        display: block;
    }
}

/* 2. Filter Bar: sticky，筛选胶囊居中，条数胶囊左侧 */
.sticky-bar {
    position: sticky;
    top: 0;
    z-index: 10;
    padding: 0 40rpx;
    display: flex;
    justify-content: center;
    align-items: center;
}

/* 左侧条数胶囊：absolute 定位，与系统胶囊视觉对称 */
.count-pill {
    position: absolute;
    left: 40rpx;
    top: 50%;
    transform: translateY(-50%);
    padding: 0 24rpx;
    border-radius: 60rpx;
    font-size: 26rpx;
    font-weight: 600;
    color: $pure-white;
    height: 64rpx;
    line-height: 64rpx;
    box-sizing: border-box;
    background: $gradient-brand;
    box-shadow: $shadow-brand-sm;

    .dark-theme & {
        box-shadow: $shadow-brand-md;
    }
}

.filter-row-wrapper {
    display: inline-flex;
    align-items: center;
    height: 64rpx;
    background-color: $bg-card-light;
    border-radius: 60rpx;
    box-shadow: $shadow-sm;
    padding: 0 6rpx;
}

.filter-pill {
    padding: 0 24rpx;
    border-radius: $radius-pill;
    font-size: 28rpx;
    font-weight: 500;
    color: $text-secondary-light;
    @include mwp-transition($dur-fast, $ease-emphasized);
    box-sizing: border-box;
    height: 64rpx;
    line-height: 64rpx;

    &:active {
        transform: scale($press-scale-sm);
    }

    &.active {
        background: $gradient-brand;
        color: $pure-white;
        font-weight: 600;
        box-shadow: 0 6rpx 16rpx rgba(183, 0, 48, 0.3);
    }
}

.more-menu-mask {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 999;
}

.more-menu-popover {
    position: fixed;
    top: 280rpx;
    right: 24rpx;
    background-color: $bg-card-light;
    border-radius: 24rpx;
    box-shadow: 0 12rpx 32rpx rgba(0, 0, 0, 0.15);
    padding: 12rpx 0;
    z-index: 1500;
    min-width: 280rpx;
    overflow: hidden;

    .menu-item {
        display: flex;
        align-items: center;
        gap: 20rpx;
        padding: 24rpx 32rpx;
        font-size: 28rpx;
        color: $text-primary-light;
        transition: background-color 0.1s;

        &:active {
            background-color: $bg-muted-light;
        }
    }

    .menu-icon {
        font-size: 36rpx;
        line-height: 1;
        width: 40rpx;
        text-align: center;
        flex-shrink: 0;
    }

    .menu-text {
        flex: 1;
        font-weight: 500;

        &.text-danger {
            color: #e53935;
        }
    }
}

.list-container {
    padding: 24rpx 40rpx 40rpx;
    min-height: 300rpx;
    flex: 1;
}

.end-hint {
    text-align: center;
    padding: 32rpx 0 16rpx;
    font-size: 24rpx;
    color: $text-tertiary-light;
}

.list-scroll {
    flex: 1;
    height: 100%;
}

/* 滚动覆盖效果：根据 scrollTop 调整 my-publish-card 的视觉 */
.my-publish-card.scrolling {
    /* 上滑时强化阴影，增强层次感 */
    box-shadow: 0 -6rpx 30rpx rgba(0, 0, 0, 0.12);
}

.card {
    background: $bg-card-light;
    border-radius: $radius-card;
    box-shadow: $shadow-card;
    display: flex;
    overflow: hidden;
    position: relative;
    margin-bottom: $space-6;
    transition: transform $dur-base $ease-emphasized,
                box-shadow $dur-base $ease-standard;

    &:active {
        transform: scale($press-scale-sm);
        box-shadow: $shadow-sm;
    }

    &.proposal-card {
        background: linear-gradient(135deg, $brand-red-tint 0%, $bg-card-light 100%);
        box-shadow: $shadow-comp-glow;
        border: 1px solid rgba(178, 0, 53, 0.15);

        .course-row-middle {
            background: rgba(255, 255, 255, 0.8);
            border: 1px solid rgba(178, 0, 53, 0.08);
            box-shadow: inset 0 2rpx 8rpx rgba(0,0,0,0.01);
        }
    }

    .card-main {
        flex: 1;
        padding: 32rpx; 
        display: flex;
        flex-direction: column;
    }

    .course-row-top {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 24rpx;

        .course-name {
            font-size: 36rpx; 
            font-weight: 700;
            color: $text-primary-light;
            line-height: 1.4;
            flex: 1;
            margin-right: 20rpx;
            letter-spacing: 1rpx;
        }
        .time-text {
            font-size: 24rpx;
            color: $text-tertiary-light; 
            font-weight: 400;
            white-space: nowrap;
        }
    }

    .course-row-middle {
        display: flex;
        flex-direction: row; 
        flex-wrap: wrap; 
        align-items: center;
        margin-bottom: 32rpx;
        background: $bg-page-light;
        padding: 20rpx 24rpx;
        border-radius: 16rpx;
        
        .course-info-item {
             display: flex;
             align-items: center;
             font-size: 26rpx;
             color: $text-secondary-light;
             margin-right: 40rpx; 
             font-weight: 500;

             .info-icon {
                  width: 30rpx;
                  height: 30rpx;
                  margin-right: 12rpx;
                  opacity: 0.8; 
             }
        }
    }

    .content-text {
        font-size: 28rpx;
        color: $text-primary-light;
        line-height: 1.6; 
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 3; 
        overflow: hidden;
        margin-bottom: 24rpx;
        text-align: justify;
    }

    .footer-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        @include dashed-divider;
        padding-top: 24rpx;
        
        .likes-box {
            display: flex;
            align-items: center;
            
            .like-icon {
                width: 36rpx;
                height: 36rpx;
                margin-right: 8rpx;
                opacity: 0.6;
            }
            .likes-text {
                font-size: 26rpx;
                color: $text-secondary-light;
            }
        }

        .vote-count-box {
             display: flex;
             align-items: center;
             background: linear-gradient(90deg, #fff0f2, #fff5f6);
             padding: 10rpx 24rpx;
             border-radius: 30rpx;
             border: 1px solid rgba(178, 0, 53, 0.05);
             
             .vote-icon {
                  width: 30rpx;
                  height: 30rpx;
                  margin-right: 12rpx;
             }
             .vote-num {
                  font-size: 32rpx;
                  font-weight: 800;
                  color: $brand-red;
                  margin-right: 6rpx;
             }
             .vote-label {
                  font-size: 24rpx;
                  color: $brand-red;
                  opacity: 0.9;
                  font-weight: 500;
             }
        }

    }
}

.fab-btn {
    position: fixed;
    right: 40rpx;
    bottom: 200rpx; /* Above bottom tab bar */
    width: 110rpx;
    height: 110rpx;
    background: $gradient-brand;
    border-radius: 50%;
    box-shadow: 0 8rpx 30rpx rgba(178, 0, 53, 0.35);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    transition: transform 0.05s;

    &:active {
        transform: scale(0.94);
    }

    .plus-icon {
        color: $pure-white;
        font-size: 60rpx;
        font-weight: 300;
        line-height: 1;
        text-align: center;
    }
}

// ===== 卡片三点按钮 =====
.card-more-btn {
    width: 48rpx;
    height: 48rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    color: $text-tertiary-light;
    font-size: 32rpx;
    font-weight: bold;
    letter-spacing: -4rpx;
    flex-shrink: 0;

    &:active {
        background-color: $bg-muted-light;
    }

    .dark-theme & {
        color: $text-tertiary-dark;
        &:active { background-color: $divider-card-dark; }
    }
}

.footer-right {
    display: flex;
    align-items: center;
    gap: 12rpx;
}

// ===== 自定义操作菜单弹窗（气泡） =====
.card-more-btn {
    width: 48rpx;
    height: 48rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    color: $text-tertiary-light;
    font-size: 32rpx;
    font-weight: bold;
    letter-spacing: -4rpx;
    flex-shrink: 0;

    &:active {
        background-color: $bg-muted-light;
    }

    .dark-theme & {
        color: $text-tertiary-dark;
        &:active { background-color: $divider-card-dark; }
    }
}

.footer-right {
    display: flex;
    align-items: center;
    gap: 12rpx;
}




/* Modal: Nickname & Feedback (shared base styles) */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 2000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40rpx;
}

.modal-card {
    width: 100%;
    max-width: 680rpx;
    background-color: $bg-card-light;
    border-radius: 32rpx;
    overflow: hidden;
    box-shadow: 0 16rpx 48rpx rgba(0, 0, 0, 0.15);
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 36rpx;
    border-bottom: 1rpx solid $divider-light;

    .modal-title {
        font-size: 36rpx;
        font-weight: 700;
        color: $text-primary-light;
    }

    .modal-close {
        font-size: 40rpx;
        color: $text-tertiary-light;
        width: 48rpx;
        height: 48rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        line-height: 1;
        @include pressable($press-scale-md);
    }
}

.modal-body {
    padding: 36rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.nickname-avatar-preview {
    margin-bottom: 24rpx;
}

.preview-avatar {
    width: 120rpx;
    height: 120rpx;
    border-radius: 50%;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
}

.field-label {
    font-size: 28rpx;
    color: $text-secondary-light;
    margin-bottom: 16rpx;
    display: block;
    font-weight: 500;
}

.nickname-input {
    width: 100%;
    height: 96rpx;
    background-color: $bg-muted-light;
    border-radius: 16rpx;
    padding: 0 28rpx;
    font-size: 32rpx;
    color: $text-primary-light;
    box-sizing: border-box;
    border: 2rpx solid transparent;
    transition: border-color 0.2s;

    &:focus {
        border-color: $brand-red;
        background-color: $bg-card-light;

        .dark-theme & {
            background-color: $bg-card-dark;
            border-color: $brand-red-soft;
        }
    }
}

.word-count {
    font-size: 22rpx;
    color: $text-tertiary-light;
    text-align: right;
    margin-top: 8rpx;
    display: block;
}

.modal-footer {
    display: flex;
    border-top: 1rpx solid $divider-light;

    .btn-cancel,
    .btn-confirm {
        flex: 1;
        height: 96rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 30rpx;
        @include pressable($press-scale-sm);
    }

    .btn-cancel {
        color: $text-secondary-light;
    }

    .btn-confirm {
        color: $brand-red;
        font-weight: 600;
        border-left: 1rpx solid $divider-light;

        &:active {
            background-color: rgba(178, 0, 53, 0.05);
        }

        &.disabled {
            opacity: 0.5;
            pointer-events: none;
        }
    }
}

/* Feedback Modal Styles 已迁移至 components/feedback/feedback-modal.vue */
</style>

<style lang="scss" scoped>
.profile-container.dark-theme .user-more-btn { background-color: $bg-muted-dark; box-shadow: 0 6rpx 16rpx rgba(0, 0, 0, 0.3); .line { background-color: $text-primary-dark; } &:active { background-color: $bg-muted-darker; } }

/* Sticky bar dark mode */
.profile-container.dark-theme .sticky-bar .filter-row-wrapper { background-color: rgba(30, 30, 30, 0.95); box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.3); }
.profile-container.dark-theme .sticky-bar .filter-row { background: $bg-muted-dark; }
.profile-container.dark-theme .sticky-bar .filter-pill { color: $text-tertiary-dark; }
.profile-container.dark-theme .list-container { padding: 24rpx 32rpx 40rpx; }
.profile-container.dark-theme .list-item { background: transparent; }
.profile-container.dark-theme .card { background: $bg-card-dark; border-color: $divider-card-dark; box-shadow: 0 8rpx 24rpx rgba(0,0,0,0.3); }
.profile-container.dark-theme .card .card-main { background: transparent; }
.profile-container.dark-theme .card .course-row-top .course-name { color: $text-primary-dark; }
.profile-container.dark-theme .card .course-row-top .time-text { color: $text-secondary-dark; }
.profile-container.dark-theme .card .course-row-middle { background: $bg-muted-dark; }
.profile-container.dark-theme .card .course-row-middle .course-info-item { color: $text-tertiary-dark; }
.profile-container.dark-theme .card .content-text { color: $text-secondary-dark; }
.profile-container.dark-theme .card .footer-row { border-color: rgba(255,255,255,0.05); }
.profile-container.dark-theme .card .footer-row .likes-text { color: $text-tertiary-dark; }
.profile-container.dark-theme .card .footer-row .likes-box { background: transparent; }
.profile-container.dark-theme .card.proposal-card { background: linear-gradient(135deg, #1a0a0e 0%, #{$bg-card-dark} 100%); border-color: rgba(178,0,53,0.2); }
.profile-container.dark-theme .card.proposal-card .course-row-middle { background: rgba(30,30,30,0.5); border-color: rgba(178,0,53,0.1); }
.profile-container.dark-theme .card.proposal-card .vote-count-box { background: linear-gradient(90deg, #2a1a1e, #{$bg-card-dark}); }

.dark-theme .guide-overlay { background-color: rgba(0,0,0,0.45); }
.guide-overlay.dark-theme { background-color: rgba(0,0,0,0.45); }
.guide-overlay.dark-theme .guide-content { background-color: $bg-muted-dark; }
.guide-overlay.dark-theme .guide-header .guide-title { color: $text-primary-dark; }
.guide-overlay.dark-theme .guide-header .guide-subtitle { color: $text-tertiary-dark; }
.guide-overlay.dark-theme .guide-step .step-title { color: $text-primary-dark; }
.guide-overlay.dark-theme .guide-step .step-desc { color: $text-tertiary-dark; }
.dark-theme .guide-overlay.dark-theme .guide-footer .start-btn { opacity: 0.85; }

.profile-container.dark-theme .sticky-bar .filter-pill.active { color: $pure-white; }
.profile-container.dark-theme .fab-btn { box-shadow: 0 8rpx 30rpx rgba(178, 0, 53, 0.5); }

/* More Menu Dark Mode - ⋯ 按钮现已在 user-info-layer 内 */
.profile-container.dark-theme .user-more-btn { background-color: $bg-muted-dark; box-shadow: 0 6rpx 16rpx rgba(0, 0, 0, 0.3); .line { background-color: $text-primary-dark; } &:active { background-color: $bg-muted-darker; } }
.profile-container.dark-theme .more-menu-popover { background-color: $bg-muted-dark; box-shadow: 0 12rpx 32rpx rgba(0, 0, 0, 0.5); }
.profile-container.dark-theme .more-menu-popover .menu-item { color: $text-primary-dark; }
.profile-container.dark-theme .more-menu-popover .menu-item:active { background-color: $bg-muted-darker; }
.profile-container.dark-theme .more-menu-popover .menu-text.text-danger { color: #ff6b6b; }

/* Nickname Modal Dark Mode */
.modal-card.dark-theme { background-color: $bg-card-dark; }
.modal-card.dark-theme .modal-header { border-color: $divider-card-dark; .modal-title { color: $text-primary-dark; } .modal-close { color: $text-tertiary-dark; } }
.modal-card.dark-theme .modal-body { .field-label { color: $text-secondary-dark; } .nickname-input { background-color: $bg-muted-dark; color: $text-primary-dark; } }
.modal-card.dark-theme .modal-footer { border-color: $divider-card-dark; .btn-confirm { border-color: $divider-card-dark; } }

/* Feedback Modal Dark Mode 已迁移至 components/feedback/feedback-modal.vue */

.guide-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
  box-sizing: border-box;
}

.guide-content {
  width: 100%;
  max-width: 600rpx;
  background-color: $bg-card-light;
  border-radius: 32rpx;
  padding: 48rpx 40rpx;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.3);
}

.guide-header {
  text-align: center;
  margin-bottom: 48rpx;

  .guide-title {
    display: block;
    font-size: 44rpx;
    font-weight: 800;
    color: $text-primary-light;
    margin-bottom: 16rpx;
  }

  .guide-subtitle {
    display: block;
    font-size: 26rpx;
    color: $text-tertiary-light;
  }
}

.guide-steps {
  margin-bottom: 48rpx;
}

.guide-step {
  display: flex;
  align-items: flex-start;
  margin-bottom: 32rpx;
  gap: 20rpx;

  &:last-child {
    margin-bottom: 0;
  }

  .step-icon {
    width: 64rpx;
    height: 64rpx;
    background: $brand-red-tint;
    border-radius: 20rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 36rpx;
    flex-shrink: 0;
  }

  .step-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8rpx;
  }

  .step-title {
    font-size: 30rpx;
    font-weight: 600;
    color: $text-primary-light;
    display: block;
  }

  .step-desc {
    font-size: 24rpx;
    color: $text-tertiary-light;
    line-height: 1.5;
    display: block;
  }
}

.guide-footer {
  .start-btn {
    width: 100%;
    height: 88rpx;
    line-height: 88rpx;
    background: $gradient-brand;
    color: $pure-white;
    font-size: 32rpx;
    font-weight: 600;
    border-radius: 44rpx;
    border: none;
    box-shadow: 0 8rpx 24rpx rgba(178, 0, 53, 0.3);

    &:active {
      transform: scale(0.98);
      opacity: 0.9;
    }
  }

  .avatar-btn {
    width: 100%;
    height: 88rpx;
    line-height: 88rpx;
    background: $gradient-brand;
    color: $pure-white;
    font-size: 32rpx;
    font-weight: 600;
    border-radius: 44rpx;
    border: none;
    box-shadow: 0 8rpx 24rpx rgba(178, 0, 53, 0.3);
    text-align: center;
  }

  .guide-skip {
    text-align: center;
    font-size: 28rpx;
    color: $text-tertiary-light;
    padding: 24rpx 0 0;
    @include pressable($press-scale-sm);
  }
}

// hover-class 按压态
.result-hover {
    transform: scale($press-scale-md);
}
</style>
