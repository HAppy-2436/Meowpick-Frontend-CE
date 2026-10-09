<template>
  <view
    class="profile-container"
    :class="themeStore.themeClass"
    :style="{
      paddingTop: topReservedHeight + 'px',
      minHeight: containerHeight + 'px'
    }"
  >
    <!-- 头像层：sticky 固定在视觉位置，不随内容滚动 -->
    <view class="user-info-sticky" :style="{ top: topReservedHeight + 'px' }">
      <button
        :key="stickyAvatarKey"
        class="sticky-avatar-btn"
        open-type="chooseAvatar"
        @chooseavatar="onChooseAvatar"
        @error="onChooseAvatarError"
      >
        <image
          v-if="!isDefaultAvatar && avatarUrl"
          :src="avatarUrl"
          class="sticky-avatar-img"
          mode="aspectFill"
        />
        <image
          v-else
          :src="avatarUrl || defaultCatAvatar"
          class="sticky-avatar-default"
          mode="aspectFill"
        />
      </button>
      <view class="sticky-avatar-meta">
        <view class="sticky-avatar-name-row">
          <text
            class="sticky-avatar-name"
            hover-class="mwp-hover-sm"
            :hover-start-time="0"
            :hover-stay-time="0"
            @click="openNicknameModal"
            >{{ userName }}</text
          >
          <view
            class="nickname-edit-icon"
            hover-class="mwp-hover-sm"
            :hover-start-time="0"
            :hover-stay-time="0"
            @click="openNicknameModal"
          >
            <MwpIcon name="square-pen" size="28rpx" />
          </view>
        </view>
        <text class="sticky-avatar-contrib">贡献值：{{ contribution }}</text>
      </view>
      <!-- 更多按钮 -->
      <view
        class="user-more-btn"
        hover-class="mwp-hover"
        :hover-start-time="0"
        :hover-stay-time="0"
        @click="toggleMoreMenu"
      >
        <view class="line" />
        <view class="line" />
        <view class="line" />
      </view>
    </view>

    <!-- 更多菜单弹出层 -->
    <view
      v-if="showMoreMenu"
      class="more-menu-mask"
      @click="showMoreMenu = false"
    />
    <view
      v-if="showMoreMenu"
      class="more-menu-popover"
      :class="themeStore.themeClass"
      :style="{ top: moreMenuTop + 'px' }"
    >
      <view
        class="menu-item"
        hover-class="mwp-hover"
        :hover-start-time="0"
        :hover-stay-time="0"
        @click="handleMenuClick('theme')"
      >
        <MwpIcon class="menu-icon" :name="themeIcon" size="36rpx" />
        <text class="menu-text">{{ themeLabel }}</text>
      </view>
      <!-- 更新日志 -->
      <view
        class="menu-item"
        hover-class="mwp-hover"
        :hover-start-time="0"
        :hover-stay-time="0"
        @click="handleMenuClick('changelog')"
      >
        <MwpIcon name="file-text" size="36rpx" class="menu-icon" />
        <text class="menu-text">更新日志</text>
      </view>
      <view
        class="menu-item"
        hover-class="mwp-hover"
        :hover-start-time="0"
        :hover-stay-time="0"
        @click="handleMenuClick('feedback')"
      >
        <MwpIcon name="message-circle" size="36rpx" class="menu-icon" />
        <text class="menu-text">我要反馈</text>
      </view>
      <!-- 切换皮肤 -->
      <view
        class="menu-item"
        hover-class="mwp-hover"
        :hover-start-time="0"
        :hover-stay-time="0"
        @click="handleMenuClick('skin')"
      >
        <MwpIcon name="palette" size="36rpx" class="menu-icon" />
        <text class="menu-text">使用旧版</text>
      </view>
      <!-- 管理员专属菜单 -->
      <template v-if="isAdmin">
        <view
          class="menu-item"
          hover-class="mwp-hover"
          :hover-start-time="0"
          :hover-stay-time="0"
          @click="handleMenuClick('admin')"
        >
          <MwpIcon
            class="menu-icon"
            :name="adminMode ? 'circle-check' : 'circle-x'"
            size="36rpx"
          />
          <text class="menu-text">管理员</text>
        </view>
        <template v-if="adminMode">
          <view
            class="menu-item"
            hover-class="mwp-hover"
            :hover-start-time="0"
            :hover-stay-time="0"
            @click="handleMenuClick('logs')"
          >
            <MwpIcon name="clipboard-list" size="36rpx" class="menu-icon" />
            <text class="menu-text">提案日志</text>
          </view>
          <!-- 重置昵称：清除本期昵称冷却限制并置空昵称，随管理员模式一同显隐 -->
          <view
            class="menu-item"
            hover-class="mwp-hover"
            :hover-start-time="0"
            :hover-stay-time="0"
            @click="handleMenuClick('reset-nickname')"
          >
            <MwpIcon name="user-round" size="36rpx" class="menu-icon" />
            <text class="menu-text">重置昵称</text>
          </view>
          <!-- 撤销管理员身份：彻底失去权限，不可自行恢复；随管理员模式一同显隐 -->
          <view
            class="menu-item"
            hover-class="mwp-hover"
            :hover-start-time="0"
            :hover-stay-time="0"
            @click="handleMenuClick('revoke-admin')"
          >
            <MwpIcon name="circle-x" size="36rpx" class="menu-icon" />
            <text class="menu-text text-danger">撤销身份</text>
          </view>
        </template>
      </template>
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
          <!-- 滑动红色指示块 -->
          <view
            class="filter-indicator"
            :class="{ ready: indicatorReady }"
            :style="indicatorStyle"
          />
          <view
            class="filter-pill"
            :class="{ active: currentFilter === 'all' }"
            hover-class="mwp-hover"
            :hover-start-time="0"
            :hover-stay-time="0"
            @click="setFilter('all')"
          >
            <text>全部</text>
          </view>
          <view
            class="filter-pill"
            :class="{ active: currentFilter === 'comment' }"
            hover-class="mwp-hover"
            :hover-start-time="0"
            :hover-stay-time="0"
            @click="setFilter('comment')"
          >
            <text>吐槽</text>
          </view>
          <view
            class="filter-pill"
            :class="{ active: currentFilter === 'proposal' }"
            hover-class="mwp-hover"
            :hover-start-time="0"
            :hover-stay-time="0"
            @click="setFilter('proposal')"
          >
            <text>提案</text>
          </view>
        </view>
      </view>

      <!-- 列表（my-publish-card 用 sticky 整体悬停，列表在内部自然展开） -->
      <view class="list-container" :style="{ minHeight: listMinHeight + 'px' }">
        <SkeletonCard v-if="loading" :count="3" />

        <EmptyState v-else-if="error" tone="danger" title="加载失败" compact>
          <template #action>
            <MwpButton tone="brand" @click="loadData()">重试</MwpButton>
          </template>
        </EmptyState>

        <EmptyState
          v-else-if="filteredList.length === 0"
          title="这里空空如也~"
          compact
        />

        <template v-else>
          <view
            v-for="(item, index) in filteredList"
            :key="item.id"
            class="list-item mwp-fade-in"
            :class="{ 'is-pressed': pressedId === item.id }"
            :style="{ animationDelay: Math.min(index * 60, 300) + 'ms' }"
            @touchstart="onCardPressStart($event, item.id)"
            @touchmove="onCardPressEnd"
            @touchend="onCardPressEnd"
            @touchcancel="onCardPressEnd"
            @click="onItemClick(item)"
            @longpress="onCardMenu(item)"
          >
            <CourseCard
              v-if="item.type === 'comment'"
              :name="item.courseName"
              :teachers="item.teachers"
              :department="item.department"
              info-box
              bordered
            >
              <template #top-right>
                <StatusBadge
                  v-if="currentFilter === 'all'"
                  tone="info"
                  label="吐槽"
                  pill
                />
              </template>

              <text class="content-text">{{ item.content }}</text>

              <template #footer>
                <view class="footer-row">
                  <view class="likes-box">
                    <MwpIcon name="heart" size="36rpx" class="like-icon" />
                    <text class="likes-text">{{ item.likes || 0 }}</text>
                  </view>
                  <view class="footer-right">
                    <text class="time-text">{{ item.time }}</text>
                    <view
                      class="card-more-btn"
                      data-card-more="1"
                      hover-class="mwp-hover"
                      :hover-start-time="0"
                      :hover-stay-time="0"
                      @click.stop="onCardMenu(item)"
                    >
                      <text data-card-more="1">⋯</text>
                    </view>
                  </view>
                </view>
              </template>
            </CourseCard>

            <CourseCard
              v-if="item.type === 'proposal'"
              :name="item.courseName"
              :teachers="item.teachers"
              :department="item.department"
              tone="brand"
              info-box
            >
              <template #top-right>
                <StatusBadge
                  :status="item.status"
                  :label="
                    item.status === 'approved'
                      ? '已通过'
                      : item.status === 'rejected'
                      ? '已拒绝'
                      : '投票中'
                  "
                  pill
                />
                <StatusBadge
                  v-if="currentFilter === 'all'"
                  tone="brand"
                  label="提案"
                  pill
                />
              </template>

              <text class="content-text">{{ item.reason }}</text>

              <template #footer>
                <view class="footer-row">
                  <view class="vote-count-box">
                    <MwpIcon name="heart" size="30rpx" class="vote-icon" />
                    <text class="vote-num">{{ item.voteCount || 0 }}</text>
                    <text class="vote-label">人支持</text>
                  </view>
                  <view class="footer-right">
                    <text class="time-text">{{ item.time }}</text>
                    <view
                      class="card-more-btn"
                      data-card-more="1"
                      hover-class="mwp-hover"
                      :hover-start-time="0"
                      :hover-stay-time="0"
                      @click.stop="onCardMenu(item)"
                    >
                      <text data-card-more="1">⋯</text>
                    </view>
                  </view>
                </view>
              </template>
            </CourseCard>
          </view>
        </template>

        <view v-if="filteredList.length > 0 && !loading" class="end-hint">
          <text>—— 到底了 ——</text>
        </view>
        <view style="height: 160rpx" />
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
            <view class="step-icon">
              <MwpIcon name="palette" size="34rpx" />
            </view>
            <view class="step-body">
              <text class="step-title">选择头像</text>
              <text class="step-desc"
                >从微信头像中选择，或使用随机默认头像。仅用于该页面展示，不会上传到服务器</text
              >
            </view>
          </view>
          <view class="guide-step">
            <view class="step-icon">
              <MwpIcon name="square-pen" size="34rpx" />
            </view>
            <view class="step-body">
              <text class="step-title">设置昵称</text>
              <text class="step-desc"
                >使用微信昵称或自定义，发布提案时可被记录为贡献者</text
              >
            </view>
          </view>
        </view>
        <view class="guide-footer">
          <button
            v-if="guideReady"
            :key="guideAvatarKey"
            class="avatar-btn"
            open-type="chooseAvatar"
            @chooseavatar="onGuideChooseAvatar"
            @error="onGuideChooseAvatarError"
          >
            选择头像
          </button>
          <view v-else class="avatar-btn-placeholder">选择头像</view>
          <view
            class="guide-skip"
            hover-class="mwp-hover"
            :hover-start-time="0"
            :hover-stay-time="0"
            @click="onGuideSkip"
            >跳过，使用默认</view
          >
        </view>
      </view>
    </view>
  </view>

  <!-- Floating Action Button -->
  <view
    class="fab-btn"
    :class="themeStore.themeClass"
    hover-class="mwp-hover"
    :hover-start-time="0"
    :hover-stay-time="0"
    @click="onAddClick"
  >
    <PlusIcon class="plus-icon" size="52rpx" thickness="6rpx" />
  </view>

  <!-- Nickname Edit Modal -->
  <view
    v-if="showNicknameModal"
    class="modal-overlay"
    @click="closeNicknameModal"
  >
    <view class="modal-card" :class="themeStore.themeClass" @click.stop>
      <view class="modal-header">
        <text class="modal-title">设置你的昵称</text>
        <view
          class="modal-close"
          hover-class="mwp-hover"
          :hover-start-time="0"
          :hover-stay-time="0"
          @click="closeNicknameModal"
        >
          <MwpIcon name="x" size="30rpx" />
        </view>
      </view>

      <view class="modal-body">
        <text class="field-label"
          >输入昵称（点击输入框可获取微信昵称建议）</text
        >
        <input
          v-model="newNickname"
          class="nickname-input"
          type="nickname"
          :maxlength="15"
          placeholder="请输入昵称"
          placeholder-class="mwp-placeholder--lg"
        />
        <text class="word-count">已输入 {{ newNickname.length }}/15 字</text>
        <text class="nickname-cooldown-tip"
          >昵称设置后 30 天内仅能修改一次，请谨慎填写</text
        >
      </view>

      <view class="modal-footer">
        <MwpButton
          class="modal-btn"
          tone="plain"
          size="lg"
          block
          @click="closeNicknameModal"
        >
          取消
        </MwpButton>
        <MwpButton
          class="modal-btn"
          tone="brand"
          size="lg"
          block
          :loading="submittingNickname"
          :disabled="submittingNickname"
          @click="confirmNicknameChange"
        >
          {{ submittingNickname ? '保存中...' : '确认' }}
        </MwpButton>
      </view>
    </view>
  </view>

  <FeedbackModal v-model:visible="showFeedbackModal" />

  <!-- 卡片长按/三点菜单：纯选择，用底部弹窗 -->
  <MwpActionSheet
    v-model:visible="showCardMenu"
    :actions="cardMenuActions"
    @select="handleCardMenuSelect"
  />

  <!-- 右上角「+」新增菜单：纯选择，用底部弹窗 -->
  <MwpActionSheet
    v-model:visible="showAddMenu"
    :actions="addMenuActions"
    @select="handleAddMenuSelect"
  />

  <!-- 撤回提案 / 撤回吐槽：破坏性确认，用居中弹窗 -->
  <MwpConfirmDialog
    v-model:visible="showDeleteConfirm"
    :title="deleteTitle"
    :description="deleteDescription"
    :confirm-text="deleteConfirmText"
    tone="danger"
    @confirm="confirmDeleteItem"
  />

  <!-- 已拒绝提案：纯告知浮窗（显示拒绝理由），详情需长按卡片 -->
  <MwpConfirmDialog
    v-model:visible="showRejectedModal"
    title="提案未通过"
    confirm-text="知道了"
    cancel-text=""
  >
    <view class="rejected-reason" :class="themeStore.themeClass">
      <text class="rejected-reason__label">拒绝理由</text>
      <text class="rejected-reason__text">{{ rejectedReasonText }}</text>
    </view>
    <text class="rejected-reason__hint" :class="themeStore.themeClass">{{
      rejectedHintText
    }}</text>
  </MwpConfirmDialog>

  <!-- 作为草稿：覆盖已有草稿确认 -->
  <MwpConfirmDialog
    v-model:visible="showOverwriteDraftConfirm"
    title="覆盖草稿"
    description="已有一份未使用的草稿，设为草稿将覆盖原草稿，确定继续？"
    confirm-text="覆盖"
    tone="danger"
    @confirm="confirmOverwriteDraft"
  />

  <!-- 撤销管理员身份：破坏性确认，需填授权密钥并键入「确认撤销」方可提交 -->
  <MwpConfirmDialog
    v-model:visible="showRevokeDialog"
    title="撤销管理员身份"
    description="撤销后将彻底失去管理员权限，且无法自行恢复。请输入管理员授权密钥，并键入「确认撤销」以继续。"
    confirm-text="确认撤销"
    tone="danger"
    :confirm-disabled="!canRevokeAdmin"
    @confirm="performRevokeAdmin"
  >
    <view class="revoke-field" :class="themeStore.themeClass">
      <text class="revoke-field__label">管理员授权密钥</text>
      <input
        v-model="revokeKey"
        class="revoke-input"
        :password="true"
        placeholder="请输入管理员授权密钥"
        placeholder-class="mwp-placeholder"
      />
    </view>
    <view class="revoke-field" :class="themeStore.themeClass">
      <text class="revoke-field__label">请输入「确认撤销」</text>
      <input
        v-model="revokeConfirmInput"
        class="revoke-input"
        type="text"
        placeholder="确认撤销"
        placeholder-class="mwp-placeholder"
      />
    </view>
  </MwpConfirmDialog>

  <!-- 管理员重置昵称：清除冷却并置空昵称，破坏性确认 -->
  <MwpConfirmDialog
    v-model:visible="showResetNicknameConfirm"
    title="重置昵称"
    description="将清除你的昵称并解除 30 天冷却限制，之后可立即重新设置昵称。确定继续？"
    confirm-text="重置"
    tone="danger"
    @confirm="performResetNickname"
  />

  <!-- 切换到旧版外观：普通确认，用居中弹窗 -->
  <MwpConfirmDialog
    v-model:visible="showLegacyConfirm"
    title="使用旧版"
    description="将切换到「旧版外观」并重新进入首页，确定继续？"
    confirm-text="确定"
    @confirm="confirmSwitchLegacy"
  />
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  onMounted,
  onUnmounted,
  nextTick,
  watch,
  getCurrentInstance
} from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { waitForLogin, relogin } from '@/utils/init';
import { http, useThemeStore, useTokenStore, PubSub } from '@/config';
import { HISTORY_PAGE_SIZE } from '@/utils/constants';
import { errorMessageOf } from '@/utils/review-error';
import { formatDate } from '@/utils/time';
import {
  readProposalDraft,
  writeProposalDraft,
  type ProposalDraft
} from '@/utils/proposal-draft';
import { useViewport } from '@/composables/useViewport';
import { useMenuButton } from '@/composables/useMenuButton';
import {
  showSuccess,
  showError,
  showInfo,
  showLoading,
  hideLoading
} from '@/composables/useStatus';
import type {
  DtoCommentVO,
  DtoProposalCourseVO,
  DtoProposalVO,
  DtoTeacherVO
} from '@/api/data-contracts';
import FeedbackModal from '@/components/feedback/FeedbackModal.vue';
import defaultCatAvatar from '@/images/cat-emoji/cat_face.png';
import { getRandomDefaultAvatar, isDefaultAvatarUrl } from '@/utils/avatar';
import type { ThemeMode } from '@/config/store/theme';
import type { IconName } from '@/icons';
const themeStore = useThemeStore();

// active：tab 已稳定激活（swiper 动画结束）。
// entering：tab 正在滑入，浮层可提前渲染，但原生 chooseAvatar 按钮仍等 active 后再创建，
// 否则 button 在带 transform 的 swiper-item 上创建会导致热区错位、点击无响应。
const props = withDefaults(
  defineProps<{ active?: boolean; entering?: boolean }>(),
  {
    active: true,
    entering: false
  }
);

// 胶囊与视口信息统一走 composable（响应式，窗口变化会自动重算）
const viewport = useViewport();
const { menuButtonInfo } = useMenuButton();
const pxPerRpx = computed(() => viewport.width / 750);

// 顶部预留：胶囊底部 + 胶囊下方间距
const topReservedHeight = computed(
  () => menuButtonInfo.value.top + menuButtonInfo.value.height
);

// 更多菜单弹出层顶部：紧贴"更多"按钮下方（按钮底边距 header 顶 98rpx）
const moreMenuTop = computed(
  () => topReservedHeight.value + (98 + 10) * pxPerRpx.value
);

// 布局计算（与 home-view 同策略：JS 算出精确高度，确保填满视口无灰色空白）
const tabBarH = computed(
  () =>
    Math.round(100 * pxPerRpx.value) +
    viewport.safeBottom +
    (viewport.safeBottom > 0 ? 0 : Math.round(24 * pxPerRpx.value))
);
const containerHeight = computed(() => viewport.height - tabBarH.value);
const stickyHeaderPx = computed(
  () => topReservedHeight.value + 24 * pxPerRpx.value
);
const cardHeaderPx = computed(
  () => 8 * pxPerRpx.value + 20 * pxPerRpx.value + 52 * pxPerRpx.value
);
const filterBarPx = computed(
  () => 16 * pxPerRpx.value + 64 * pxPerRpx.value + 8 * pxPerRpx.value
);
const listPaddingPx = computed(() => 24 * pxPerRpx.value + 40 * pxPerRpx.value);
const listMinHeight = computed(() =>
  Math.max(
    0,
    containerHeight.value -
      stickyHeaderPx.value -
      cardHeaderPx.value -
      filterBarPx.value -
      listPaddingPx.value
  )
);

// 筛选胶囊与系统胶囊居中对齐的 top 值（胶囊高度 64rpx）
const filterCapsuleHeightPx = computed(() => 64 * (viewport.width / 750));
const filterCenterTop = computed(() => {
  const capsuleCenter =
    menuButtonInfo.value.top + menuButtonInfo.value.height / 2;
  return capsuleCenter - filterCapsuleHeightPx.value / 2;
});

// 用户信息
const userName = ref('同学');
const avatarUrl = ref('');
const contribution = ref(0);
// 是否允许设置/修改非空昵称（后端 30 天冷却）
const canEditUsername = ref(true);

const generateDefaultName = () => {
  return '华师喵' + Math.floor(1000 + Math.random() * 9000);
};

const generateDefaultAvatar = () => getRandomDefaultAvatar();

// 是否正在使用随机默认头像（用户主动选择过微信头像后为 false）
const isDefaultAvatar = ref(true);

const loadUserInfo = () => {
  const stored = uni.getStorageSync('userInfo');
  if (stored) {
    if (stored.nickName) userName.value = stored.nickName;
    if (stored.avatarUrl) avatarUrl.value = stored.avatarUrl;
    if (stored.contribution !== undefined)
      contribution.value = stored.contribution;
    if (typeof stored.canEditUsername === 'boolean')
      canEditUsername.value = stored.canEditUsername;
    if (typeof stored.avatarIsDefault === 'boolean') {
      isDefaultAvatar.value = stored.avatarIsDefault;
    } else if (stored.avatarUrl) {
      // 兼容旧数据：本地默认头像资源视为默认，其余视为用户头像
      isDefaultAvatar.value = isDefaultAvatarUrl(stored.avatarUrl);
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

// 贡献值与昵称冷却状态来自后端，需实时拉取并写回本地缓存
const loadProfile = async () => {
  try {
    const res = await http.UserController.userProfileList();
    const data = res.data?.data;
    const stored = uni.getStorageSync('userInfo') || {};
    let dirty = false;
    const value = data?.contribution;
    if (typeof value === 'number' && value >= 0) {
      contribution.value = value;
      stored.contribution = value;
      dirty = true;
    }
    if (typeof data?.canEditUsername === 'boolean') {
      canEditUsername.value = data.canEditUsername;
      stored.canEditUsername = data.canEditUsername;
      dirty = true;
    }
    if (dirty) uni.setStorageSync('userInfo', stored);
  } catch (e) {
    console.warn('[profile] loadProfile failed:', e);
  }
};

// ===== 核心数据 =====
const listData = ref<ListItem[]>([]);
const loading = ref(false);
const error = ref(false);

type ItemType = 'comment' | 'proposal';
interface ListItem {
  id: string;
  type: ItemType;
  time: string;
  createdAt?: string;
  updatedAt?: string;
  courseId?: string;
  courseName: string;
  department?: string;
  category?: string;
  campus?: string;
  teachers?: string;
  content?: string;
  likes?: number;
  reason?: string;
  voteCount?: number;
  status?: 'pending' | 'approved' | 'rejected';
  rejectReason?: string;
  // 提案原始提交内容快照，供「作为草稿」还原结构化字段
  course?: DtoProposalCourseVO | null;
  showUsername?: boolean;
  deleted?: boolean;
}

const currentFilter = ref<'all' | 'comment' | 'proposal'>('all');

const filteredList = computed(() => {
  // 软删除的提案仅在历史接口中保留，个人发布列表不再展示，避免修改后原提案仍可见
  let result = listData.value.filter((item) => !item.deleted);
  if (currentFilter.value !== 'all') {
    result = result.filter((item) => item.type === currentFilter.value);
  }
  return result.sort(
    (a, b) =>
      new Date(b.createdAt || b.time).getTime() -
      new Date(a.createdAt || a.time).getTime()
  );
});

const setFilter = (filter: 'all' | 'comment' | 'proposal') => {
  currentFilter.value = filter;
};

// ===== 筛选指示块滑动（与底部菜单栏同款）=====
const instance = getCurrentInstance();
const indicatorStyle = ref<{ left: string; width: string }>({
  left: '0px',
  width: '0px'
});
const indicatorReady = ref(false);

const updateIndicator = () => {
  const proxy = instance?.proxy;
  if (!proxy) return;
  const query = uni.createSelectorQuery().in(proxy);
  query.select('.filter-row-wrapper').boundingClientRect();
  query.select('.filter-pill.active').boundingClientRect();
  query.exec((res) => {
    const result = (res || []) as unknown[];
    const wrapper = result[0] as { left?: number } | null;
    const pill = result[1] as { left?: number; width?: number } | null;
    if (!wrapper || !pill || pill.left === undefined || !pill.width) return;
    indicatorStyle.value = {
      left: `${pill.left - (wrapper.left || 0)}px`,
      width: `${pill.width}px`
    };
    indicatorReady.value = true;
  });
};

watch(currentFilter, () => {
  nextTick(updateIndicator);
});

// ===== 首次使用引导 =====
// 浮层预渲染在离屏的 swiper-item 内，滑入时它已随页面存在，
// 不需要 v-if 在动画中插入，也就没有闪现。
const GUIDE_KEY = 'meowpick_profile_guide_seen';
// 是否已看过（持久化）
const guideSeen = ref(!!uni.getStorageSync(GUIDE_KEY));
// 本次进入是否已跳过/关闭（不持久化，离开后再进入会重新就绪）
const guideDismissed = ref(false);
// 原生 chooseAvatar 按钮仅在 swiper 动画结束（无 transform）后创建，保证热区正确
const guideReady = ref(false);
// 取消选择后重建按钮，避免残留原生层阻塞交互
const guideAvatarKey = ref(0);

const showGuide = computed(() => !guideSeen.value && !guideDismissed.value);

const closeGuide = () => {
  guideDismissed.value = true;
  guideReady.value = false;
};

const onGuideChooseAvatar = (e: unknown) => {
  const avatarUrlRes = (e as { detail?: { avatarUrl?: string } }).detail
    ?.avatarUrl;
  if (avatarUrlRes) {
    avatarUrl.value = avatarUrlRes;
    isDefaultAvatar.value = false;
    const stored = uni.getStorageSync('userInfo') || {};
    stored.avatarUrl = avatarUrlRes;
    stored.avatarIsDefault = false;
    uni.setStorageSync('userInfo', stored);
  }
  guideAvatarKey.value += 1;
  // 头像选完后打开昵称输入（type="nickname" 会自动建议微信昵称）
  closeGuide();
  nextTick(() => {
    openNicknameModal();
  });
};

const onGuideChooseAvatarError = () => {
  // 用户取消选择头像，重建按钮避免残留原生层导致页面无法交互
  guideAvatarKey.value += 1;
};

const onGuideSkip = () => {
  closeGuide();
  // 跳过也记住，避免每次进入「我的」都再弹；后续仍可点头像设置
  guideSeen.value = true;
  uni.setStorageSync(GUIDE_KEY, true);
};

watch(
  () => props.entering,
  (entering) => {
    if (!entering) {
      // 离开「我的」：重置跳过标记，浮层在屏幕外重新就绪，下次滑入随页面一起出现
      guideDismissed.value = false;
      guideReady.value = false;
    }
  }
);

watch(
  () => props.active,
  (active) => {
    if (active) {
      // 动画结束后再创建原生按钮，此时无 transform 位移
      if (showGuide.value) guideReady.value = true;
    } else {
      guideReady.value = false;
    }
  }
);

// ===== 头像选择（微信官方组件触发） =====
// chooseAvatar 取消（chooseAvatar:fail cancel）后原生按钮可能残留蒙层阻塞交互，
// 通过切换 key 强制重建按钮释放原生层；取消时也需要重建
const stickyAvatarKey = ref(0);
const onChooseAvatar = (e: unknown) => {
  const url = (e as { detail?: { avatarUrl?: string } }).detail?.avatarUrl;
  if (url) {
    avatarUrl.value = url;
    isDefaultAvatar.value = false;
    const stored = uni.getStorageSync('userInfo') || {};
    stored.avatarUrl = url;
    stored.avatarIsDefault = false;
    uni.setStorageSync('userInfo', stored);
    uni.$emit('userInfoUpdated');
  }
  stickyAvatarKey.value += 1;
};

const onChooseAvatarError = () => {
  // 用户取消选择头像，重建按钮避免残留原生层导致页面无法交互
  stickyAvatarKey.value += 1;
};

// ===== 首次引导已合并到首页 home-view =====

// ===== Modals =====
const showNicknameModal = ref(false);
const showFeedbackModal = ref(false);
const newNickname = ref('');
const submittingNickname = ref(false);

const openNicknameModal = () => {
  if (!canEditUsername.value) {
    showInfo('昵称设置后 30 天内仅能修改一次');
    return;
  }
  newNickname.value = '';
  showNicknameModal.value = true;
};

const closeNicknameModal = () => {
  showNicknameModal.value = false;
};

const confirmNicknameChange = async () => {
  const trimmed = newNickname.value.trim();
  if (!trimmed) {
    showInfo('昵称不能为空');
    return;
  }
  // 按 Unicode 码点计数，避免 emoji 被 UTF-16 单元多算
  if (Array.from(trimmed).length > 15) {
    showInfo('昵称不超过15个字符');
    return;
  }
  // 控制字符会被后端拒绝，提交前先拦截
  // eslint-disable-next-line no-control-regex -- 本意即匹配 ASCII 控制字符
  if (/[\u0000-\u001f\u007f-\u009f]/u.test(trimmed)) {
    showInfo('昵称包含不可用字符，请修改后重试');
    return;
  }
  submittingNickname.value = true;
  try {
    const res = await http.UserController.userProfileUpdateCreate({
      username: trimmed
    });
    const code = res.data?.code;
    if (!(code === 200 || code === 0 || code === 201)) {
      // 审核未过 / 服务不可用给专门文案，其余统一兜底；30 天冷却在弹窗已提前提示
      showError(
        errorMessageOf(code, res.data?.msg) || '昵称修改失败，请稍后重试'
      );
      return;
    }
    const savedName = res.data?.data?.username || trimmed;
    const stored = uni.getStorageSync('userInfo') || {};
    stored.nickName = savedName;
    // 修改成功后进入 30 天冷却
    stored.canEditUsername = false;
    canEditUsername.value = false;
    if (!stored.avatarUrl) {
      stored.avatarUrl = generateDefaultAvatar();
      stored.avatarIsDefault = true;
      isDefaultAvatar.value = true;
    }
    uni.setStorageSync('userInfo', stored);
    userName.value = savedName;
    uni.$emit('userInfoUpdated');
    showSuccess('修改成功');
    closeNicknameModal();
  } catch (err) {
    console.error('[profile-view] nickname update error:', err);
    const e = err as {
      response?: { data?: { code?: number; msg?: string } };
    };
    showError(
      errorMessageOf(e.response?.data?.code, e.response?.data?.msg) ||
        '修改失败，请重试'
    );
  } finally {
    submittingNickname.value = false;
  }
};

// ===== 管理员权限 =====
const isAdmin = ref(false);
const adminMode = ref(true); // 管理员模式，默认开启

const detectAdmin = async () => {
  try {
    const res = await http.AuthController.authIsAdminList();
    const flag = res.data?.data?.isAdmin ?? false;
    isAdmin.value = !!flag;
  } catch {
    isAdmin.value = false;
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
  showInfo(adminMode.value ? '已进入管理员模式' : '已退出管理员模式');
};

// 撤销管理员身份：破坏性确认弹窗，需填授权密钥 + 键入「确认撤销」
const showRevokeDialog = ref(false);
const revokeKey = ref('');
const revokeConfirmInput = ref('');
const canRevokeAdmin = computed(
  () =>
    revokeKey.value.trim().length > 0 &&
    revokeConfirmInput.value.trim() === '确认撤销'
);

const revokeAdmin = () => {
  if (!useTokenStore().userId) {
    showError('未获取到用户信息，请重新登录');
    return;
  }
  revokeKey.value = '';
  revokeConfirmInput.value = '';
  showRevokeDialog.value = true;
};

// 调用 grant_admin 切换接口，提交本人 userId + 授权密钥
const performRevokeAdmin = async () => {
  const userId = useTokenStore().userId;
  if (!userId) {
    showError('未获取到用户信息，请重新登录');
    return;
  }
  if (!canRevokeAdmin.value) return;
  const verifyCode = revokeKey.value.trim();
  try {
    const resp = await http.AuthController.authGrantAdminCreate({
      userId,
      verifyCode
    });
    if (resp.data?.data?.isAdmin === false) {
      isAdmin.value = false;
      adminMode.value = false;
      uni.setStorageSync('meowpick_admin_mode', false);
      uni.$emit('userInfoUpdated');
      showSuccess('已撤销管理员身份');
    } else {
      showError('撤销失败，请检查授权密钥');
    }
  } catch (err) {
    console.error('[profile-view] revoke admin error:', err);
    showError('撤销失败，请重试');
  }
};

// 管理员重置昵称：清除 30 天冷却限制并置空昵称
const showResetNicknameConfirm = ref(false);

const performResetNickname = async () => {
  const userId = useTokenStore().userId;
  if (!userId) {
    showError('未获取到用户信息，请重新登录');
    return;
  }
  showLoading('重置中...');
  try {
    const clearRes = await http.UserController.userUsernameCooldownClearCreate(
      userId
    );
    const clearCode = clearRes.data?.code;
    if (!(clearCode === 200 || clearCode === 0 || clearCode === 201)) {
      showError(clearRes.data?.msg || '重置失败，请稍后重试');
      return;
    }
    // 空字符串表示清空昵称，不触发微信审核、不受冷却限制
    const updateRes = await http.UserController.userProfileUpdateCreate({
      username: ''
    });
    const updateCode = updateRes.data?.code;
    if (!(updateCode === 200 || updateCode === 0 || updateCode === 201)) {
      showError(updateRes.data?.msg || '重置失败，请稍后重试');
      return;
    }
    const stored = uni.getStorageSync('userInfo') || {};
    stored.nickName = '';
    // 冷却已解除，可立即重新设置昵称
    stored.canEditUsername = true;
    uni.setStorageSync('userInfo', stored);
    canEditUsername.value = true;
    userName.value = generateDefaultName();
    uni.$emit('userInfoUpdated');
    showSuccess('已重置昵称');
  } catch (err) {
    console.error('[profile-view] reset nickname error:', err);
    showError('重置失败，请重试');
  } finally {
    hideLoading();
  }
};

// ===== More Menu (⋯ 按钮) =====
const showMoreMenu = ref(false);
const showLegacyConfirm = ref(false);

const THEME_LABELS: Record<ThemeMode, string> = {
  system: '跟随系统',
  dark: '深色模式',
  light: '浅色模式'
};
const themeLabel = computed(() => THEME_LABELS[themeStore.mode]);
const themeIcon = computed<IconName>(() => {
  if (themeStore.mode === 'system') return 'smartphone';
  return themeStore.mode === 'dark' ? 'moon' : 'sun';
});

const toggleMoreMenu = () => {
  showMoreMenu.value = !showMoreMenu.value;
};

const handleMenuClick = (
  action:
    | 'theme'
    | 'feedback'
    | 'changelog'
    | 'admin'
    | 'logs'
    | 'skin'
    | 'reset-nickname'
    | 'revoke-admin'
) => {
  switch (action) {
    case 'theme':
      themeStore.cycleTheme();
      break;
    case 'feedback':
      showMoreMenu.value = false;
      showFeedbackModal.value = true;
      break;
    case 'changelog':
      showMoreMenu.value = false;
      uni.navigateTo({ url: '/pages/profile/update-log' });
      break;
    case 'skin':
      showMoreMenu.value = false;
      showLegacyConfirm.value = true;
      break;
    case 'admin':
      toggleAdminMode();
      break;
    case 'logs':
      showMoreMenu.value = false;
      uni.navigateTo({ url: '/pages/proposal/log' });
      break;
    case 'reset-nickname':
      showMoreMenu.value = false;
      showResetNicknameConfirm.value = true;
      break;
    case 'revoke-admin':
      showMoreMenu.value = false;
      revokeAdmin();
      break;
  }
};

// 确认切换旧版：进入旧版前强制刷新登录态，旧版 http 会等待该登录完成
const confirmSwitchLegacy = () => {
  relogin(true);
  useSkinStore().switchTo('original');
};

// ===== 滚动覆盖效果 =====
// 现在依赖外层 scroll-view 滚动：user-info-layer 滚出屏幕后 my-publish-card 视觉上覆盖
// 筛选胶囊 sticky 在 my-publish-card 顶部，滚动时一直可见

// ===== 数据加载 =====
// silent：已有数据时的后台静默刷新。不切换 loading 态，
// 避免列表被 SkeletonCard 顶替后再重建、重放入场动画导致返回时闪动。
const loadData = async (options?: { silent?: boolean }) => {
  const silent = !!options?.silent && listData.value.length > 0;
  if (!silent) loading.value = true;
  error.value = false;
  try {
    const [commentRes, proposalRes] = await Promise.all([
      http.CommentController.commentHistoryCreate({
        page: 1,
        pageSize: HISTORY_PAGE_SIZE
      }),
      http.ProposalController.proposalHistoryList({
        page: 1,
        pageSize: HISTORY_PAGE_SIZE
      })
    ]);

    const comments = (commentRes.data?.data?.comments || []).map(
      (c: DtoCommentVO & { courseName?: string; text?: string }): ListItem => ({
        id: c.id || '',
        type: 'comment' as ItemType,
        time: c.createdAt ? formatDate(c.createdAt) : '',
        createdAt: c.createdAt || '',
        courseId: c.courseId || '',
        courseName: c.name || c.courseName || '未知课程',
        department: c.department || '',
        category: c.category || '',
        teachers: Array.isArray(c.teachers) ? c.teachers.join('、') : '',
        content: c.content || c.text || '',
        likes: c.likeCnt || 0
      })
    );

    const proposals = (proposalRes.data?.data?.proposals || []).map(
      (
        p: DtoProposalVO & {
          courseName?: string;
          reason?: string;
          agreeCount?: number;
        }
      ): ListItem => {
        const finalCourse = p.finalCourse;
        const course = p.course || finalCourse || {};
        const teachers = Array.isArray(course.teachers)
          ? course.teachers
              .map((t: DtoTeacherVO | string) =>
                typeof t === 'string' ? t : t.name || ''
              )
              .filter(Boolean)
              .join('、')
          : '';
        return {
          id: p.id || '',
          type: 'proposal' as ItemType,
          time: p.createdAt ? formatDate(p.createdAt) : '',
          createdAt: p.createdAt || '',
          updatedAt: p.updatedAt || '',
          // 已通过提案的正式课程 ID（finalCourse），用于点击直达课程详情
          courseId: finalCourse?.id || p.course?.id || '',
          courseName: p.title || p.courseName || '未知提案',
          department: course.department || '',
          campus: Array.isArray(course.campuses)
            ? course.campuses.join('、')
            : '',
          teachers,
          reason: p.content || p.reason || '',
          voteCount: p.likeCnt || p.agreeCount || 0,
          status:
            p.status === 'approved'
              ? 'approved'
              : p.status === 'rejected'
              ? 'rejected'
              : 'pending',
          rejectReason: p.rejectReason || '',
          // 原始提交快照（作为草稿时还原结构化字段）
          course: p.course || finalCourse || null,
          showUsername:
            typeof p.showUsername === 'boolean' ? p.showUsername : false,
          deleted: !!p.deleted
        };
      }
    );

    listData.value = [...comments, ...proposals];
  } catch (err) {
    console.error('[profile-view] loadData error:', err);
    // 静默刷新失败时保留已有内容，避免把列表替换成整页错误态
    if (!silent) error.value = true;
  } finally {
    if (!silent) loading.value = false;
  }
};

// ===== 路由跳转 =====
const openProposalDetail = (item: ListItem) => {
  const dataStr = encodeURIComponent(JSON.stringify(item));
  uni.navigateTo({
    url: `/pages/proposal/proposal-detail?data=${dataStr}`
  });
};

// 发布者点击自己的提案：
// - 已通过：直接进入该提案上架后的课程详情
// - 已拒绝：弹出告知浮窗（详情需长按卡片）
// - 投票中：进入提案详情
const onItemClick = (item: ListItem) => {
  if (item.type === 'comment') {
    if (!item.courseId) return;
    uni.navigateTo({
      url: `/pages/course/detail?id=${item.courseId}`
    });
    return;
  }
  if (item.status === 'approved') {
    if (item.courseId) {
      uni.navigateTo({ url: `/pages/course/detail?id=${item.courseId}` });
    } else {
      // 拿不到上架课程 ID 时退回提案详情，避免点击无响应
      openProposalDetail(item);
    }
  } else if (item.status === 'rejected') {
    rejectedTarget.value = item;
    showRejectedModal.value = true;
  } else {
    openProposalDetail(item);
  }
};

// ===== 已拒绝提案告知浮窗 =====
// 已拒绝提案视为「已终结」：点击仅告知拒绝理由，不进入详情；
// 如需回看提案详情，引导用户长按卡片。
const rejectedTarget = ref<ListItem | null>(null);
const showRejectedModal = ref(false);
const rejectedReasonText = computed(
  () => rejectedTarget.value?.rejectReason || '管理员未填写拒绝理由'
);
const rejectedHintText = computed(() => {
  const updatedAt = rejectedTarget.value?.updatedAt;
  const timePart = updatedAt
    ? `于 ${formatDate(updatedAt)} 被拒绝，`
    : '已被拒绝，';
  return `该提案${timePart}想看提案详情请长按卡片`;
});

// ===== 长按/三点按钮菜单（底部弹窗：纯选择）=====
// 吐槽暂不支持修改，支持查看课程 / 再发一条 / 撤回吐槽
const COMMENT_UNSUPPORTED_TIP = '吐槽暂不支持修改';

type ListActionTone = 'brand' | 'default' | 'danger';
interface ListAction {
  label: string;
  value: string;
  tone: ListActionTone;
}

const actionTarget = ref<ListItem | null>(null);
const showCardMenu = ref(false);

const cardMenuActions = computed<ListAction[]>(() => {
  const item = actionTarget.value;
  if (!item) return [];
  const actions: ListAction[] = [];
  const isProposal = item.type === 'proposal';
  const isPendingProposal = isProposal && item.status === 'pending';
  const isProcessedProposal =
    isProposal && !!item.status && item.status !== 'pending';

  // 1) 点击卡片本身的动作，作为菜单第一项
  if (!isProposal) {
    actions.push({ label: '查看课程', value: 'open', tone: 'default' });
  } else if (item.status === 'rejected') {
    actions.push({ label: '查看拒绝理由', value: 'open', tone: 'default' });
  } else if (item.status === 'approved') {
    actions.push({ label: '查看课程', value: 'open', tone: 'default' });
  } else {
    actions.push({ label: '查看详情', value: 'open', tone: 'default' });
  }

  // 2) 吐槽：直接对该课程再发一条
  if (!isProposal) {
    actions.push({ label: '再发一条', value: 'repost', tone: 'default' });
  }

  // 3) 已通过 / 已拒绝：点击卡片不进提案详情，这里提供「查看原提案」
  if (isProcessedProposal) {
    actions.push({ label: '原始提案', value: 'original', tone: 'default' });
  }

  // 4) 仅「投票中」提案支持发布者重新编辑
  if (isPendingProposal) {
    actions.push({ label: '修改', value: 'edit', tone: 'default' });
  }

  // 5) 提案：存为草稿，供下次新建提案时引入后修改
  if (isProposal) {
    actions.push({ label: '设为草稿', value: 'saveDraft', tone: 'default' });
  }

  // 6) 撤回：仅吐槽与投票中提案；已通过/已拒绝作为终结记录不可撤回
  //    自己是发布者：提案用「撤回提案」，吐槽用「撤回吐槽」，均不使用「删除」
  if (!isProposal) {
    actions.push({ label: '撤回吐槽', value: 'delete', tone: 'danger' });
  } else if (isPendingProposal) {
    actions.push({ label: '撤回提案', value: 'delete', tone: 'danger' });
  }

  return actions;
});

const pressedId = ref('');
const onCardPressStart = (
  e: { target?: { dataset?: Record<string, unknown> } },
  id: string
) => {
  // 点按右下角「⋯」时不触发整卡按压态，避免卡片跟着缩放
  if (e?.target?.dataset?.cardMore) return;
  pressedId.value = id;
};
const onCardPressEnd = () => {
  pressedId.value = '';
};

const onCardMenu = (item: ListItem) => {
  // 弹窗会吞掉 touchend，这里主动复位，避免卡片卡在按压态
  pressedId.value = '';
  actionTarget.value = item;
  showCardMenu.value = true;
};

const handleCardMenuSelect = (value: string) => {
  const item = actionTarget.value;
  if (!item) return;
  if (value === 'open') {
    // 点击卡片本身的动作（查看课程 / 查看详情 / 查看拒绝理由）
    onItemClick(item);
  } else if (value === 'original') {
    // 查看原提案（仅已通过 / 已拒绝）
    openProposalDetail(item);
  } else if (value === 'edit') {
    if (item.type === 'proposal') {
      uni.navigateTo({
        url: `/pages/proposal/propose?editProposalId=${item.id}`
      });
    } else {
      showInfo(COMMENT_UNSUPPORTED_TIP);
    }
  } else if (value === 'repost') {
    // 对该课程再发一条吐槽
    if (!item.courseId) {
      showInfo('缺少课程信息，无法再发一条');
      return;
    }
    uni.navigateTo({ url: `/pages/course/comment?id=${item.courseId}` });
  } else if (value === 'saveDraft') {
    saveProposalAsDraft(item);
  } else if (value === 'delete') {
    deleteTarget.value = item;
    showDeleteConfirm.value = true;
  }
};

// ===== 作为草稿：把该提案还原为本地草稿，下次新建提案时引入 =====
const showOverwriteDraftConfirm = ref(false);
const pendingDraftSave = ref<ProposalDraft | null>(null);

const commitProposalDraft = (draft: ProposalDraft) => {
  if (writeProposalDraft(draft)) {
    showSuccess('已存为草稿，新建提案时可引入');
  } else {
    showError('草稿保存失败');
  }
};

const saveProposalAsDraft = (item: ListItem) => {
  const course = item.course || null;
  const draft: ProposalDraft = {
    courseName: (course?.name || item.courseName || '').trim(),
    courseCode: (course?.code || '').trim(),
    department: course?.department || item.department || '',
    category: course?.category || item.category || '',
    teachers: Array.isArray(course?.teachers)
      ? course.teachers.map((t) => {
          if (typeof t === 'string') {
            return { name: t, title: '' };
          }
          return {
            name: t.name || '',
            title: t.title || '',
            department: t.department || '',
            teacherId: t.id || undefined
          };
        })
      : [],
    campuses: Array.isArray(course?.campuses) ? [...course.campuses] : [],
    reason: item.reason || '',
    showUsername:
      typeof item.showUsername === 'boolean' ? item.showUsername : null,
    savedAt: Date.now()
  };

  // 已有草稿时需确认覆盖，避免误删上次未完成的草稿
  if (readProposalDraft()) {
    pendingDraftSave.value = draft;
    showOverwriteDraftConfirm.value = true;
    return;
  }
  commitProposalDraft(draft);
};

const confirmOverwriteDraft = () => {
  if (pendingDraftSave.value) {
    commitProposalDraft(pendingDraftSave.value);
  }
  pendingDraftSave.value = null;
};

// ===== 撤回确认（居中弹窗：破坏性操作）=====
// 这里都是发布者撤回自己的内容：提案叫「撤回提案」，吐槽叫「撤回吐槽」，不使用「删除」
const deleteTarget = ref<ListItem | null>(null);
const showDeleteConfirm = ref(false);
const deleteIsProposal = computed(
  () => deleteTarget.value?.type === 'proposal'
);
const deleteTitle = computed(() =>
  deleteIsProposal.value ? '撤回提案' : '撤回吐槽'
);
const deleteConfirmText = computed(() =>
  deleteIsProposal.value ? '撤回提案' : '撤回吐槽'
);
const deleteDescription = computed(() =>
  deleteIsProposal.value
    ? '撤回后提案将被移除，且无法恢复，确定撤回提案吗？'
    : '撤回后吐槽将被移除，且无法恢复，确定撤回吐槽吗？'
);

const confirmDeleteItem = async () => {
  const item = deleteTarget.value;
  if (!item) return;
  const actionName = item.type === 'proposal' ? '撤回提案' : '撤回吐槽';
  try {
    if (item.type === 'proposal') {
      const res = await http.ProposalController.proposalDeleteCreate(
        item.id,
        {}
      );
      const code = res.data?.code;
      // 业务错误同样是 HTTP 200，必须校验业务 code
      if (!(code === 200 || code === 0 || code === 201)) {
        showError(res.data?.msg || `${actionName}失败，请重试`);
        return;
      }
      uni.$emit('proposalListShouldRefresh');
    } else {
      const res = await http.CommentController.commentDeleteCreate(item.id);
      const code = res.data?.code;
      if (!(code === 200 || code === 0 || code === 201)) {
        showError(`${actionName}失败，请重试`);
        return;
      }
      // 通知已打开的课程详情评论列表刷新，避免缓存不实时
      PubSub.publish('comment-refresh', item.courseId);
    }
    listData.value = listData.value.filter((i) => i.id !== item.id);
    showSuccess(`已${actionName}`);
  } catch (err) {
    console.error('Delete failed:', err);
    showError(`${actionName}失败`);
  }
};

// ===== 右上角「+」新增菜单（底部弹窗：纯选择）=====
const showAddMenu = ref(false);
const addMenuActions: ListAction[] = [
  { label: '新增吐槽', value: 'comment', tone: 'default' },
  { label: '新增提案', value: 'proposal', tone: 'default' }
];

const onAddClick = () => {
  if (currentFilter.value === 'comment') {
    uni.navigateTo({ url: '/pages/find/index?mode=add-comment' });
    return;
  }
  if (currentFilter.value === 'proposal') {
    uni.navigateTo({ url: '/pages/proposal/propose' });
    return;
  }
  showAddMenu.value = true;
};

const handleAddMenuSelect = (value: string) => {
  if (value === 'comment') {
    uni.navigateTo({ url: '/pages/find/index?mode=add-comment' });
  } else if (value === 'proposal') {
    uni.navigateTo({ url: '/pages/proposal/propose' });
  }
};

// ===== 生命周期 =====
// 点击首页 Hello 手动刷新登录后，重新拉取用户与列表数据
const onAuthRefreshed = () => {
  loadUserInfo();
  loadProfile();
  detectAdmin();
  loadData();
};

let indicatorTimer: ReturnType<typeof setTimeout> | null = null;

onMounted(async () => {
  await waitForLogin();
  loadUserInfo();
  loadProfile();
  detectAdmin();
  loadData();
  // 监听首页授权成功事件
  uni.$on('userInfoUpdated', loadUserInfo);
  uni.$on('authRefreshed', onAuthRefreshed);
  // 首次渲染后计算筛选指示块位置
  nextTick(updateIndicator);
  indicatorTimer = setTimeout(updateIndicator, 150);
});

onShow(() => {
  loadUserInfo();
  loadProfile();
  if (listData.value.length > 0) {
    loadData({ silent: true });
  }
});

onUnmounted(() => {
  uni.$off('userInfoUpdated', loadUserInfo);
  uni.$off('authRefreshed', onAuthRefreshed);
  if (indicatorTimer) clearTimeout(indicatorTimer);
});
</script>

<style scoped lang="scss">
// 底色：页面级灰（基层），“我的发布”整体白卡纸浮于其上，卡内白卡片以边框 + 阴影区分
.profile-container {
  position: relative;
  padding: 0 $page-gutter-tab;
  box-sizing: border-box;
  background-color: $bg-page-light;
  height: 100%;
  overflow: visible;

  // 根节点自身带主题类，必须用同元素选择器（.dark-theme & 需要祖先才会命中）
  &.dark-theme {
    background-color: $bg-page-dark;
  }
}

.user-more-btn {
  position: relative;
  // 下移，使按钮竖直居中于「系统胶囊底边」与「我的发布」卡顶之间
  top: 12rpx;
  width: 64rpx;
  height: 64rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 7rpx;
  background-color: $bg-card-light;
  border-radius: $radius-pill;
  box-shadow: $shadow-comp;
  flex-shrink: 0;
  transition: transform $dur-fast $ease-standard,
    box-shadow $dur-fast $ease-standard;

  // 视觉保持 64rpx，热区扩大到 88rpx
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 88rpx;
    height: 88rpx;
    transform: translate(-50%, -50%);
  }

  &:active {
    transform: scale($press-scale-lg);
    box-shadow: $shadow-sm;
  }

  .line {
    width: 30rpx;
    height: 3rpx;
    background-color: $text-secondary-light;
    border-radius: $radius-pill;
    display: block;
    transition: background-color $dur-fast $ease-standard;
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
  background: $gradient-avatar;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: $shadow-brand-sm;
  border: none;
  padding: 0;
  margin: 0;
  overflow: hidden;
  line-height: 1;
  -webkit-tap-highlight-color: transparent;
  @include pressable($press-scale-lg);

  // 去掉原生 button 默认的 ::after 边框圈
  &::after {
    border: none;
  }

  .dark-theme & {
    background: $gradient-avatar-dark;
    box-shadow: $shadow-md-dark;
  }
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

.sticky-avatar-name-row {
  display: flex;
  align-items: flex-end;
  gap: 20rpx;
  min-width: 0;
}

.sticky-avatar-name {
  font-size: $font-2xl;
  font-weight: $weight-black;
  color: $text-primary-light;
  line-height: 1.2;
  transition: opacity $dur-fast $ease-standard,
    transform $dur-fast $ease-emphasized;
  // flex 子项默认 min-width:auto 不会收缩，长昵称会溢出到右侧被「更多」按钮压住；
  // 显式 min-width:0 + display:block 让 text-overflow 生效（正常显示省略号）。
  display: block;
  flex: 0 1 auto;
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &:active {
    opacity: 0.6;
    transform: scale($press-scale-sm);
  }

  .dark-theme & {
    color: $text-primary-dark;
  }
}

.nickname-edit-icon {
  color: $text-tertiary-light;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  margin-bottom: 10rpx;
  @include mwp-transition($dur-fast, $ease-emphasized);

  &:active {
    opacity: 0.6;
  }

  .dark-theme & {
    color: $text-tertiary-dark;
  }
}

.sticky-avatar-contrib {
  font-size: $font-lg;
  color: $text-tertiary-light;
  font-weight: $weight-regular;

  &--unauth {
    color: $brand-red;
    font-weight: $weight-medium;
  }

  .dark-theme & {
    color: $text-tertiary-dark;
    &--unauth {
      color: $brand-red-soft;
    }
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
  margin: 0 (-$page-gutter-tab);
  padding-top: $space-7;
  position: relative;
  z-index: 5;

  .dark-theme & {
    background-color: $bg-card-dark;
    box-shadow: $shadow-md-dark;
  }
}

.my-publish-header {
  padding: 8rpx $page-gutter-tab 20rpx;
  text-align: center;

  .page-title {
    font-size: 52rpx;
    font-weight: $weight-black;
    color: $text-primary-light;
    display: block;

    .dark-theme & {
      color: $text-primary-dark;
    }
  }

  .sub-title {
    font-size: $font-sm;
    color: $text-tertiary-light;
    margin-top: 4rpx;
    display: block;

    .dark-theme & {
      color: $text-tertiary-dark;
    }
  }
}

/* 2. Filter Bar: sticky，筛选胶囊居中，条数胶囊左侧 */
.sticky-bar {
  position: sticky;
  top: 0;
  z-index: 10;
  padding: 0 $page-gutter-tab;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 左侧条数胶囊：absolute 定位，与系统胶囊视觉对称 */
.count-pill {
  position: absolute;
  left: 40rpx;
  top: 0;
  bottom: 0;
  padding: 0 24rpx;
  border-radius: $radius-pill;
  font-size: $font-base;
  font-weight: $weight-semibold;
  color: $pure-white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  background: $gradient-brand;
  box-shadow: $shadow-brand-sm;

  .dark-theme & {
    background: $gradient-brand-dark;
    box-shadow: $shadow-brand-md;
  }
}

.filter-row-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
  height: 64rpx;
  background-color: $bg-card-light;
  border-radius: $radius-pill;
  padding: 0 6rpx;

  // 用绝对定位伪元素画边框，不占据尺寸，保证外框与红色胶囊等高
  // 左右各内缩 6rpx（与 padding 对齐），让选中色块能正好盖住该侧边框
  // 阴影一并放在这里，才能和边框保持同一轮廓
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 6rpx;
    right: 6rpx;
    bottom: 0;
    border: $border-light;
    border-radius: $radius-pill;
    box-shadow: $shadow-sm;
    pointer-events: none;
    z-index: 1;
  }
}

/* 滑动红色指示块：绝对定位，靠 left/width 过渡实现滑动 */
.filter-indicator {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 0;
  background: $gradient-brand;
  border-radius: $radius-pill;
  box-shadow: $shadow-brand-sm;
  z-index: 2;

  &.ready {
    transition: left $dur-instant linear, width $dur-instant linear;
  }

  .dark-theme & {
    background: $gradient-brand-dark;
    box-shadow: $shadow-brand-md;
  }
}

.filter-pill {
  position: relative;
  z-index: 3;
  padding: 0 24rpx;
  border-radius: $radius-pill;
  font-size: $font-base;
  font-weight: $weight-medium;
  color: $text-secondary-light;
  @include mwp-transition($dur-fast, $ease-emphasized);
  box-sizing: border-box;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;

  &:active {
    transform: scale($press-scale-sm);
  }

  &.active {
    color: $pure-white;
    font-weight: $weight-semibold;
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
  right: 40rpx;
  background-color: $bg-card-light;
  border-radius: $radius-lg;
  box-shadow: $shadow-lg;
  padding: 12rpx 0;
  z-index: 1500;
  min-width: 280rpx;
  overflow: hidden;

  .menu-item {
    display: flex;
    align-items: center;
    gap: 20rpx;
    padding: 24rpx 32rpx;
    font-size: $font-base;
    color: $text-primary-light;
    transition: background-color $dur-instant $ease-standard;

    &:active {
      background-color: $bg-muted-light;
    }
  }

  .menu-icon {
    font-size: $font-xl;
    line-height: 1;
    width: 40rpx;
    text-align: center;
    color: $brand-red;
    flex-shrink: 0;

    .dark-theme & {
      color: $brand-red-soft;
    }
  }

  .menu-text {
    flex: 1;
    font-weight: $weight-medium;

    &.text-danger {
      color: $danger;
    }
  }
}

.list-container {
  display: flex;
  flex-direction: column;
  padding: 24rpx $page-gutter-tab 40rpx;
  min-height: 300rpx;
  flex: 1;
}

.list-item {
  margin-bottom: $space-6;
  will-change: transform;
  // 松手立即线性恢复（无过冲，配合 @touchend 清除 is-pressed）
  transition: transform $dur-fast linear;

  &.is-pressed {
    transform: scale($press-scale-sm);
  }
}

.end-hint {
  text-align: center;
  padding: 32rpx 0 16rpx;
  font-size: $font-sm;
  color: $text-tertiary-light;

  .dark-theme & {
    color: $text-tertiary-dark;
  }
}

.list-scroll {
  flex: 1;
  height: 100%;
}

/* 滚动覆盖效果：根据 scrollTop 调整 my-publish-card 的视觉 */
.my-publish-card.scrolling {
  /* 上滑时强化阴影，增强层次感 */
  box-shadow: $shadow-up-light;

  .dark-theme & {
    box-shadow: $shadow-up-dark;
  }
}

// 卡片外壳由共享 CourseCard 提供，这里只保留插槽内容（正文 / 底栏）
.content-text {
  font-size: $font-base;
  color: $text-primary-light;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
  margin-bottom: 24rpx;
  padding: 0 10rpx;
  text-align: justify;

  .dark-theme & {
    color: $text-secondary-dark;
  }
}

.footer-row {
  display: flex;
  justify-content: space-between;
  // 爱心贴到卡片内容底边，与左边距一致
  align-items: flex-end;
  @include dashed-divider;
  padding-top: 24rpx;

  .dark-theme & {
    border-color: rgba($pure-white, 0.05);
  }

  .time-text {
    font-size: $font-sm;
    color: $text-tertiary-light;
    font-weight: $weight-regular;
    white-space: nowrap;

    .dark-theme & {
      color: $text-tertiary-dark;
    }
  }

  .likes-box {
    display: flex;
    align-items: center;
    line-height: 1;

    .like-icon {
      width: 36rpx;
      height: 36rpx;
      margin-right: 8rpx;
      color: $brand-red;

      .dark-theme & {
        color: $brand-red-soft;
      }
    }
    .likes-text {
      font-size: $font-sm-plus;
      line-height: 1;
      @include text-secondary;
    }
  }

  .vote-count-box {
    display: flex;
    align-items: center;
    line-height: 1;

    .vote-icon {
      width: 30rpx;
      height: 30rpx;
      margin-right: 12rpx;
      color: $brand-red;

      .dark-theme & {
        color: $brand-red-soft;
      }
    }
    .vote-num {
      font-size: $font-lg;
      font-weight: $weight-black;
      line-height: 1;
      color: $brand-red;
      margin-right: 6rpx;

      .dark-theme & {
        color: $brand-red-soft;
      }
    }
    .vote-label {
      font-size: $font-sm;
      line-height: 1;
      color: $brand-red;
      opacity: 0.9;
      font-weight: $weight-medium;

      .dark-theme & {
        color: $brand-red-soft;
      }
    }
  }
}

.fab-btn {
  @include fab(110rpx, $shadow-brand-lg, 0.94, $shadow-brand-glow);
  position: fixed;
  right: $page-gutter-tab;
  bottom: 200rpx; /* Above bottom tab bar */
  z-index: 100;

  .plus-icon {
    color: $pure-white;
  }
}

// ===== 卡片三点按钮 =====
.card-more-btn {
  // 视觉仍是小圆点，但把可点区域放大到 88rpx（约 44px）；
  // 负外边距抵消尺寸增量，保证圆点位置与原来一致
  width: 88rpx;
  height: 88rpx;
  margin: -20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $text-tertiary-light;
  font-size: $font-lg;
  font-weight: bold;
  flex-shrink: 0;

  text {
    transform: scale(1);
    transition: transform $dur-fast $ease-emphasized;
  }

  // 仅三个点轻微缩小作为按压反馈，不显示背景色圈
  &.mwp-hover {
    transform: none;
    opacity: 1;

    text {
      transform: scale(0.8);
    }
  }

  .dark-theme & {
    color: $text-tertiary-dark;
  }
}

.footer-right {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

// ===== 自定义操作菜单弹窗（气泡） =====

/* Modal: Nickname & Feedback (shared base styles) */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: $bg-overlay-light;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;

  .dark-theme & {
    background-color: $bg-overlay-dark;
  }
}

.modal-card {
  width: 100%;
  max-width: 680rpx;
  background-color: $bg-card-light;
  border-radius: $radius-card;
  overflow: hidden;
  box-shadow: $shadow-xl;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 36rpx;
  border-bottom: 1rpx solid $divider-light;

  .modal-title {
    font-size: $font-xl;
    font-weight: $weight-bold;
    color: $text-primary-light;
  }

  .modal-close {
    font-size: $font-2xl;
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

.field-label {
  font-size: $font-base;
  color: $text-secondary-light;
  margin-bottom: 16rpx;
  display: block;
  font-weight: $weight-medium;
}

.nickname-input {
  width: 100%;
  height: 96rpx;
  background-color: $bg-muted-light;
  border-radius: $radius-control;
  padding: 0 28rpx;
  font-size: $font-lg;
  color: $text-primary-light;
  box-sizing: border-box;
  border: 2rpx solid transparent;
  transition: border-color $dur-base $ease-standard;

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
  font-size: $font-xs;
  color: $text-tertiary-light;
  text-align: right;
  margin-top: 8rpx;
  display: block;

  .dark-theme & {
    color: $text-tertiary-dark;
  }
}

.nickname-cooldown-tip {
  font-size: $font-xs;
  color: $brand-red;
  margin-top: 12rpx;
  display: block;
  line-height: 1.5;

  .dark-theme & {
    color: $brand-red-soft;
  }
}

.modal-footer {
  display: flex;
  gap: $space-4;
  padding: 24rpx 36rpx 36rpx;
  border-top: 1rpx solid $divider-light;

  .modal-btn {
    flex: 1;
  }
}

/* 撤销管理员身份弹窗：密钥 + 「确认撤销」输入
   同拒绝理由弹窗，插槽内容需自带主题类（子组件作用域的 .dark-theme 无法被
   父组件 scoped 的 `.dark-theme &` 命中）。 */
.revoke-field {
  margin-top: 24rpx;

  &:first-child {
    margin-top: 0;
  }
}

.revoke-field__label {
  display: block;
  font-size: $font-sm;
  font-weight: $weight-medium;
  color: $text-secondary-light;
  margin-bottom: 12rpx;

  .dark-theme & {
    color: $text-secondary-dark;
  }
}

.revoke-input {
  width: 100%;
  height: 88rpx;
  background-color: $bg-muted-light;
  border-radius: $radius-control;
  padding: 0 28rpx;
  font-size: $font-base;
  color: $text-primary-light;
  box-sizing: border-box;
  border: 2rpx solid transparent;
  transition: border-color $dur-base $ease-standard;

  &:focus {
    border-color: $brand-red;
    background-color: $bg-card-light;

    .dark-theme & {
      background-color: $bg-card-dark;
      border-color: $brand-red-soft;
    }
  }

  .dark-theme & {
    background-color: $bg-muted-dark;
    color: $text-primary-dark;
  }
}

/* 已拒绝提案告知弹窗：拒绝理由 + 长按提示
   弹窗内容以插槽传入 MwpConfirmDialog，其 .dark-theme 根在子组件作用域内，
   父组件 scoped 样式无法命中外层祖先；故主题类直接挂在插槽节点自身。 */
.rejected-reason {
  margin-top: 0;
  padding: $space-5 $space-6;
  border-radius: $radius-md;
  background: $danger-soft;

  &.dark-theme {
    background: $danger-soft-dark;
    border: 1rpx solid $danger-border-dark;
  }

  &__label {
    display: block;
    margin-bottom: $space-2;
    font-size: $font-sm;
    font-weight: $weight-semibold;
    color: $danger;

    .dark-theme & {
      color: $brand-red-soft;
    }
  }

  &__text {
    font-size: $font-base;
    line-height: 1.6;
    color: $text-primary-light;

    .dark-theme & {
      color: $text-primary-dark;
    }
  }

  &__hint {
    display: block;
    margin-top: $space-5;
    font-size: $font-sm;
    line-height: 1.5;
    text-align: center;
    color: $text-tertiary-light;

    &.dark-theme {
      color: $text-tertiary-dark;
    }
  }
}

/* Feedback Modal Styles 已迁移至 components/feedback/FeedbackModal.vue */

/* Sticky bar dark mode */
.profile-container.dark-theme .sticky-bar .filter-row-wrapper {
  background-color: rgba($bg-card-dark, 0.95);
}
.profile-container.dark-theme .sticky-bar .filter-row-wrapper::after {
  border-color: $divider-card-dark;
  box-shadow: $shadow-sm-dark;
}
.profile-container.dark-theme .sticky-bar .filter-row {
  background: $bg-muted-dark;
}
.profile-container.dark-theme .sticky-bar .filter-pill {
  color: $text-tertiary-dark;
}
.profile-container.dark-theme .list-item {
  background: transparent;
}
// 卡片外观（含提案卡渐变底 / 信息内嵌条）已由共享 CourseCard 处理主题，
// 这里仅保留「我的」页插槽内容的暗色适配。

.profile-container.dark-theme .sticky-bar .filter-pill.active {
  color: $pure-white;
}

/* More Menu Dark Mode - ⋯ 按钮现已在 user-info-layer 内 */
.profile-container.dark-theme .user-more-btn {
  background-color: $bg-muted-dark;
  box-shadow: $shadow-md-dark;
  .line {
    background-color: $text-primary-dark;
  }
  &:active {
    background-color: $bg-muted-darker;
    box-shadow: $shadow-sm-dark;
  }
}
.profile-container.dark-theme .more-menu-popover {
  background-color: $bg-muted-dark;
  box-shadow: $shadow-lg-dark;
}
.profile-container.dark-theme .more-menu-popover .menu-item {
  color: $text-primary-dark;
}
.profile-container.dark-theme .more-menu-popover .menu-item:active {
  background-color: $bg-muted-darker;
}
.profile-container.dark-theme .more-menu-popover .menu-text.text-danger {
  color: $brand-red-soft;
}

/* Nickname Modal Dark Mode */
.modal-card.dark-theme {
  background-color: $bg-card-dark;
  box-shadow: $shadow-xl-dark;
}
.modal-card.dark-theme .modal-header {
  border-color: $divider-card-dark;
  .modal-title {
    color: $text-primary-dark;
  }
  .modal-close {
    color: $text-tertiary-dark;
  }
}
.modal-card.dark-theme .modal-body {
  .field-label {
    color: $text-secondary-dark;
  }
  .nickname-input {
    background-color: $bg-muted-dark;
    color: $text-primary-dark;

    &:focus {
      background-color: $bg-card-dark;
      border-color: $brand-red-soft;
    }
  }
}
.modal-card.dark-theme .modal-footer {
  border-color: $divider-card-dark;
}

/* Feedback Modal Dark Mode 已迁移至 components/feedback/FeedbackModal.vue */

// ===== 引导弹窗（通用样式统一在 styles/_guide.scss） =====
@import '../../styles/guide';

.guide-footer {
  // 假按钮与真原生按钮视觉一致，等原生按钮就绪后无缝替换
  .avatar-btn,
  .avatar-btn-placeholder {
    width: 100%;
    height: 88rpx;
    line-height: 88rpx;
    background: $gradient-brand;
    color: $pure-white;
    font-size: $font-lg;
    font-weight: $weight-semibold;
    border-radius: $radius-pill;
    box-shadow: $shadow-brand-lg;
    text-align: center;

    .dark-theme & {
      background: $gradient-brand-dark;
    }
  }

  .avatar-btn {
    border: none;

    &::after {
      border: none;
    }
  }

  .avatar-btn-placeholder {
    pointer-events: none;
  }
}

// hover-class 按压态
.result-hover {
  transform: scale($press-scale-md);
}
</style>
