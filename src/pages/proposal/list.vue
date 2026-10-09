<template>
  <view class="proposal-container" :class="themeStore.themeClass">
    <!-- 动态 Header：搜索栏与胶囊同行 -->
    <view class="dynamic-header" :style="{ height: headerHeight + 'px' }">
      <view class="search-bar-wrapper" :style="searchBarWrapperStyle">
        <view
          class="nav-back-btn"
          :style="{
            height: contentHeight + 'px',
            width: contentHeight + 'px'
          }"
        >
          <BackBtn />
        </view>
        <view
          class="search-input-box"
          :class="{ 'is-focused': isFocused }"
          :style="{ height: contentHeight + 'px' }"
        >
          <MwpIcon name="search" size="34rpx" class="search-icon" />
          <input
            v-model="keyword"
            class="search-input"
            placeholder="搜索课程、教师"
            placeholder-class="mwp-placeholder"
            :focus="false"
            confirm-type="search"
            @focus="isFocused = true"
            @blur="isFocused = false"
            @input="onInputChange"
            @confirm="doSearch(true)"
          />
          <view
            v-if="keyword"
            class="clear-icon"
            hover-class="mwp-hover"
            :hover-start-time="0"
            :hover-stay-time="0"
            @click="clearSearch"
          >
            <MwpIcon name="x" size="26rpx" class="clear-text" />
          </view>
        </view>

        <!-- PC 端：独立常驻的搜索按钮（无系统胶囊时，搜索框右端为其让位） -->
        <MwpButton
          v-if="!viewport.hasCapsule"
          class="search-pc-btn"
          tone="brand"
          size="md"
          @click="doSearch(true)"
          >搜索</MwpButton
        >
      </view>
    </view>

    <!-- 筛选条 -->
    <view
      class="filter-bar-wrapper"
      :class="{ 'is-hidden': isFilterHidden }"
      :style="{ top: headerHeight + 'px' }"
    >
      <view class="filter-chip-bar">
        <view
          class="filter-chip"
          style="flex: 1 1 auto; min-width: 0"
          :class="{
            'has-value': filterForm.campus.length,
            'is-open': openDropdown === 'campus' || openDropdown === 'all'
          }"
          hover-class="mwp-hover"
          :hover-start-time="0"
          :hover-stay-time="0"
          @click="toggleDropdown('campus')"
        >
          <text class="chip-text">{{
            filterForm.campus.length ? filterForm.campus.join('+') : '校区'
          }}</text>
          <MwpIcon name="chevron-down" size="24rpx" class="chip-arrow" />
        </view>
        <view
          class="filter-chip"
          style="flex: 1 1 auto; min-width: 0"
          :class="{
            'has-value': filterForm.department.length,
            'is-open': openDropdown === 'department' || openDropdown === 'all'
          }"
          hover-class="mwp-hover"
          :hover-start-time="0"
          :hover-stay-time="0"
          @click="toggleDropdown('department')"
        >
          <text class="chip-text">{{
            filterForm.department.length
              ? filterForm.department.length > 1
                ? filterForm.department.length + '个院系'
                : filterForm.department[0]
              : '院系'
          }}</text>
          <MwpIcon name="chevron-down" size="24rpx" class="chip-arrow" />
        </view>
        <view
          class="filter-chip"
          style="flex: 1 1 auto; min-width: 0"
          :class="{
            'has-value': filterForm.category.length,
            'is-open': openDropdown === 'category' || openDropdown === 'all'
          }"
          hover-class="mwp-hover"
          :hover-start-time="0"
          :hover-stay-time="0"
          @click="toggleDropdown('category')"
        >
          <text class="chip-text">{{
            filterForm.category.length
              ? filterForm.category.length > 1
                ? filterForm.category.length + '个分类'
                : filterForm.category[0]
              : '分类'
          }}</text>
          <MwpIcon name="chevron-down" size="24rpx" class="chip-arrow" />
        </view>
        <view
          v-if="isAdminView"
          class="filter-chip"
          style="flex: 1 1 auto; min-width: 0"
          :class="{
            'has-value': filterForm.status.length,
            'is-open': openDropdown === 'status' || openDropdown === 'all'
          }"
          hover-class="mwp-hover"
          :hover-start-time="0"
          :hover-stay-time="0"
          @click="toggleDropdown('status')"
        >
          <text class="chip-text">{{
            filterForm.status.length
              ? filterForm.status.map((s) => statusLabel(s)).join('+')
              : '状态'
          }}</text>
          <MwpIcon name="chevron-down" size="24rpx" class="chip-arrow" />
        </view>
        <view
          class="filter-chip filter-chip--expand"
          :class="{ 'is-open': openDropdown === 'all' }"
          hover-class="mwp-hover"
          :hover-start-time="0"
          :hover-stay-time="0"
          @click="toggleDropdown('all')"
        >
          <MwpIcon name="chevron-down" size="24rpx" class="chip-arrow" />
        </view>
      </view>

      <!-- 下拉面板 -->
      <view
        v-if="isDropdownOpen"
        class="filter-dropdown-mask"
        @click="closeDropdown"
      />
      <view v-if="isDropdownOpen" class="filter-dropdown" @click.stop>
        <view class="fd-scroll">
          <view
            v-if="openDropdown === 'campus' || openDropdown === 'all'"
            class="fd-group"
          >
            <text class="fd-label">校区</text>
            <view class="fd-tags">
              <view
                v-for="c in campusOptions"
                :key="c"
                class="fd-tag"
                :class="{ active: filterForm.campus.includes(c) }"
                hover-class="mwp-hover"
                :hover-start-time="0"
                :hover-stay-time="0"
                @click="toggleFilter('campus', c)"
                >{{ c }}</view
              >
            </view>
          </view>
          <view
            v-if="openDropdown === 'department' || openDropdown === 'all'"
            class="fd-group"
          >
            <text class="fd-label">院系</text>
            <view v-if="filterForm.department.length" class="fd-selected-tags">
              <view
                v-for="d in filterForm.department"
                :key="d"
                class="fd-selected"
              >
                <text class="fd-selected-text">{{ d }}</text>
                <view
                  class="fd-selected-clear"
                  hover-class="mwp-hover-sm"
                  :hover-start-time="0"
                  :hover-stay-time="0"
                  @click="toggleFilterArray('department', d)"
                >
                  <MwpIcon name="x" size="24rpx" />
                </view>
              </view>
            </view>
            <view class="fd-search">
              <input
                v-model="deptKeyword"
                class="fd-search-input"
                placeholder="搜索院系..."
                placeholder-class="mwp-placeholder--sm"
                @input="onDeptSearch"
              />
              <view v-if="deptResults.length" class="fd-suggest-list">
                <view
                  v-for="item in deptResults"
                  :key="item.value"
                  class="fd-suggest-item"
                  hover-class="mwp-hover"
                  :hover-start-time="0"
                  :hover-stay-time="0"
                  @click="selectDept(item)"
                  >{{ item.label || item.value }}</view
                >
              </view>
            </view>
          </view>
          <view
            v-if="openDropdown === 'category' || openDropdown === 'all'"
            class="fd-group"
          >
            <text class="fd-label">分类</text>
            <view v-if="filterForm.category.length" class="fd-selected-tags">
              <view
                v-for="cat in filterForm.category"
                :key="cat"
                class="fd-selected"
              >
                <text class="fd-selected-text">{{ cat }}</text>
                <view
                  class="fd-selected-clear"
                  hover-class="mwp-hover-sm"
                  :hover-start-time="0"
                  :hover-stay-time="0"
                  @click="toggleFilterArray('category', cat)"
                >
                  <MwpIcon name="x" size="24rpx" />
                </view>
              </view>
            </view>
            <view class="fd-search">
              <input
                v-model="categoryKeyword"
                class="fd-search-input"
                placeholder="搜索分类..."
                placeholder-class="mwp-placeholder--sm"
                @input="onCategorySearch"
              />
              <view v-if="categoryResults.length" class="fd-suggest-list">
                <view
                  v-for="item in categoryResults"
                  :key="item.value"
                  class="fd-suggest-item"
                  hover-class="mwp-hover"
                  :hover-start-time="0"
                  :hover-stay-time="0"
                  @click="selectCategory(item)"
                  >{{ item.label || item.value }}</view
                >
              </view>
            </view>
          </view>
          <view
            v-if="
              isAdminView &&
              (openDropdown === 'status' || openDropdown === 'all')
            "
            class="fd-group"
          >
            <text class="fd-label">状态</text>
            <view class="fd-tags">
              <view
                v-for="s in statusOptions"
                :key="s.value"
                class="fd-tag"
                :class="{ active: filterForm.status.includes(s.value) }"
                hover-class="mwp-hover"
                :hover-start-time="0"
                :hover-stay-time="0"
                @click="toggleFilter('status', s.value)"
                >{{ s.label }}</view
              >
            </view>
          </view>
        </view>
        <view class="fd-footer">
          <MwpButton class="fd-btn" tone="plain" size="sm" @click="resetFilters"
            >重置</MwpButton
          >
          <MwpButton
            class="fd-btn fd-btn--confirm"
            tone="brand"
            size="sm"
            @click="applyFilters"
            >确定</MwpButton
          >
        </view>
      </view>
    </view>

    <!-- 内容区 -->
    <MwpScrollView
      v-model:refreshing="refreshing"
      class="content-scroll"
      enhanced
      :show-scrollbar="false"
      :content-offset="firstCardTop"
      :indicator-min="refreshTopOffset"
      @refresh="onRefresh"
      @scroll="onScroll"
      @scrolltolower="loadMore"
    >
      <!-- 顶部占位（可滚动，保证滚动时内容顶到 header 下方） -->
      <view class="content-spacer" :style="{ height: contentPaddingTop }" />

      <!-- Loading -->
      <SkeletonCard
        v-if="loading && proposals.length === 0"
        :count="4"
        class="skeleton-wrap"
      />

      <!-- 加载失败（仅首屏无数据时整页展示） -->
      <EmptyState
        v-else-if="error && proposals.length === 0"
        tone="danger"
        title="加载失败"
        :min-height="emptyMinHeight"
      >
        <template #action>
          <MwpButton tone="brand" @click="fetchProposals(1)">重试</MwpButton>
        </template>
      </EmptyState>

      <!-- 空状态 -->
      <EmptyState
        v-else-if="!loading && proposals.length === 0"
        title="暂无提案"
        desc="投票中的提案会显示在这里；通过的提案已上架为课程"
        :min-height="emptyMinHeight"
      >
        <template #action>
          <MwpButton tone="brand" @click="goToPropose">发起提案</MwpButton>
        </template>
      </EmptyState>

      <!-- 提案列表 -->
      <view v-else class="result-section">
        <view
          v-for="(item, idx) in proposals"
          :key="item.id"
          class="result-card"
          hover-class="result-hover"
          :hover-start-time="0"
          :hover-stay-time="0"
          :style="{ animationDelay: `${Math.min(idx * 60, 300)}ms` }"
          @click="goToDetail(item)"
        >
          <CourseCard
            :name="item.courseName"
            :teachers="item.teachers"
            :department="item.department"
          >
            <template #top-right>
              <view
                v-if="item.hasRevision"
                class="revision-tag"
                :hover-stop-propagation="true"
              >
                <text>已修订</text>
              </view>
              <StatusBadge
                v-if="item.status"
                :status="item.status"
                :label="statusLabel(item.status)"
                pill
              />
            </template>

            <!-- 卡片底部：左侧（支持人数 + 贡献者）/ 右侧管理员操作 -->
            <template #footer>
              <view class="card-footer">
                <view class="card-meta">
                  <view
                    class="support-count"
                    :class="{
                      'is-voted': item.isVoted,
                      'is-popping': poppingId === item.id
                    }"
                    :hover-stop-propagation="true"
                    hover-class="mwp-hover-sm"
                    :hover-start-time="0"
                    :hover-stay-time="0"
                    @click.stop="handleQuickSupport(item)"
                  >
                    <MwpIcon
                      :name="item.isVoted ? 'heart-filled' : 'heart'"
                      size="28rpx"
                      class="support-icon"
                    />
                    <text class="support-num">{{ item.voteCount || 0 }}</text>
                    <text class="support-label">人支持</text>
                  </view>
                  <text v-if="item.contributor" class="contributor-text"
                    >贡献者：{{ item.contributor }}</text
                  >
                </view>
                <view
                  v-if="isAdminView"
                  class="admin-actions"
                  :hover-stop-propagation="true"
                  @click.stop
                >
                  <template v-if="item.status === 'pending'">
                    <!-- 通过/修改后通过统一收敛到详情页，卡片只保留快速拒绝 -->
                    <MwpButton
                      class="admin-btn"
                      tone="danger-outline"
                      size="sm"
                      @click="handleReject(item)"
                      >快速拒绝</MwpButton
                    >
                  </template>
                  <view
                    v-else-if="isRevokeExpired(item)"
                    class="admin-btn admin-btn--expired"
                    :hover-stop-propagation="true"
                    @click.stop
                    >已超24小时</view
                  >
                  <MwpButton
                    v-else
                    class="admin-btn admin-btn--withdraw"
                    tone="plain"
                    size="sm"
                    @click="handleWithdraw(item)"
                    >撤回审批</MwpButton
                  >
                </view>
              </view>
            </template>
          </CourseCard>
        </view>
        <view v-if="noMore && proposals.length > 0" class="bottom-prompt">
          <text>— 到底了 —</text>
        </view>
      </view>
    </MwpScrollView>

    <!-- FAB：普通用户=加号，管理员=日志 -->
    <view class="fab-group">
      <view
        v-if="isAdminView"
        class="fab-btn"
        hover-class="mwp-hover"
        :hover-start-time="0"
        :hover-stay-time="0"
        @click="goToLogs"
      >
        <MwpIcon name="clipboard-list" size="48rpx" />
      </view>
      <view
        v-else
        class="fab-btn"
        hover-class="mwp-hover"
        :hover-start-time="0"
        :hover-stay-time="0"
        @click="goToPropose"
      >
        <PlusIcon class="fab-icon" size="52rpx" thickness="6rpx" />
      </view>
    </view>

    <!-- 拒绝弹窗 -->
    <RejectModal
      v-model:visible="showRejectModal"
      @confirm="handleRejectConfirm"
    />

    <!-- 管理员撤回审批确认：解释会下架课程 / 扣回贡献值，避免与「修改后通过」混淆 -->
    <MwpConfirmDialog
      v-model:visible="showRevokeConfirm"
      title="撤回审批"
      :description="revokeDescription"
      confirm-text="撤回审批"
      tone="danger"
      @confirm="performRevoke"
    />

    <!-- 全局状态弹窗宿主 -->
    <MwpStatusOverlay />

    <!-- 筛选未带入提示：纯告知，居中单按钮 -->
    <MwpConfirmDialog
      v-model:visible="showFilterNotice"
      title="部分筛选未能带入"
      :description="filterNoticeText"
      confirm-text="知道了"
      cancel-text=""
    />
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onUnmounted } from 'vue';
import { onLoad, onShow } from '@dcloudio/uni-app';
import { http, useThemeStore } from '@/config';
import { useScrollDirection } from '@/composables/useScrollDirection';
import { useMenuButton } from '@/composables/useMenuButton';
import { useViewport } from '@/composables/useViewport';
import { showSuccess, showError, showInfo } from '@/composables/useStatus';
import {
  DEFAULT_PAGE_SIZE,
  CAMPUS_OPTIONS,
  PROPOSAL_CATEGORY_OPTIONS
} from '@/utils/constants';
import { errorMessageOf } from '@/utils/review-error';
import { hasCourseRevision } from '@/utils/proposal-revision';
import type {
  DtoFieldSuggestionVO,
  DtoProposalCourseVO,
  DtoProposalVO,
  DtoTeacherVO
} from '@/api/data-contracts';
import RejectModal from '@/components/common/RejectModal.vue';
import BackBtn from '@/components/common/BackBtn.vue';
import CourseCard from '@/components/choose/CourseCard.vue';

const themeStore = useThemeStore();
const viewport = useViewport();
const { menuButtonInfo, navBarHeight, contentHeight } = useMenuButton();
// header 高度与图标行高统一由 composable 给出（含 rpx 缩放），避免宽屏下装不下
const headerHeight = navBarHeight;

// 滚动方向检测
const { isScrollingDown, onScroll: handleScrollDirection } =
  useScrollDirection(30);
const isFilterHidden = ref(false);

// 以下都依赖视口宽度，用 computed 保证窗口变化时重算
const rpx = (n: number) => (viewport.width / 750) * n;
// 筛选条实际高度 = 上下 padding(12rpx*2) + 胶囊高度(56rpx)
const FILTER_BAR_HEIGHT = computed(() => rpx(80));
// 筛选栏下移量：与模糊搜索浮层上边缘对齐（浮层 margin-top = $space-5）
const FILTER_BAR_TOP_OFFSET = computed(() => rpx(20));
// 目标可见留白：与搜索栏底部 padding 一致。
// 筛选栏自带的 12rpx 底部内边距已含在 FILTER_BAR_HEIGHT 中，需要扣除。
const SEARCH_BAR_PADDING_BOTTOM = computed(() => rpx(24));
const FIRST_CARD_GAP = computed(() =>
  Math.max(0, SEARCH_BAR_PADDING_BOTTOM.value - rpx(12))
);
// 第一张卡片距滚动区顶部的高度（可滚动占位块的高度）
const firstCardTop = computed(() => {
  const filterHeight = isFilterHidden.value ? 0 : FILTER_BAR_HEIGHT.value;
  const filterOffset = isFilterHidden.value ? 0 : FILTER_BAR_TOP_OFFSET.value;
  return (
    headerHeight.value + filterOffset + filterHeight + FIRST_CARD_GAP.value
  );
});
const contentPaddingTop = computed(() => firstCardTop.value + 'px');
// 空状态相对「整个页面」垂直居中：空状态排在 content-spacer（高 firstCardTop）
// 之后，令 firstCardTop + minHeight/2 = viewport.height/2。
const emptyMinHeight = computed(() =>
  Math.max(0, viewport.height - firstCardTop.value * 2)
);

// 松手刷新指示器的下限：筛选栏下沿
const refreshTopOffset = computed(
  () =>
    headerHeight.value + FILTER_BAR_TOP_OFFSET.value + FILTER_BAR_HEIGHT.value
);
const refreshing = ref(false);
const onRefresh = async () => {
  try {
    await fetchProposals(1);
  } finally {
    refreshing.value = false;
  }
};

const onScroll = (e: { detail?: { scrollTop?: number } }) => {
  const top = e.detail?.scrollTop ?? 0;
  handleScrollDirection(e);
  if (top > 50) {
    isFilterHidden.value = isScrollingDown.value;
  } else {
    isFilterHidden.value = false;
  }
};

const searchBarWrapperStyle = computed(() => {
  const gap = rpx(32);
  // 有胶囊时为其预留空间；PC 端没有胶囊，右侧空间给「搜索」按钮
  const paddingRight = viewport.hasCapsule
    ? viewport.width - (menuButtonInfo.value.left || viewport.width - 97) + gap
    : gap;
  return {
    height: headerHeight.value + 'px',
    paddingTop: menuButtonInfo.value.top + 'px',
    paddingBottom: SEARCH_BAR_PADDING_BOTTOM.value + 'px',
    paddingLeft: '32rpx',
    paddingRight: paddingRight + 'px',
    boxSizing: 'border-box' as const
  };
});

// ===== 状态 =====
const isAdmin = ref(false);
const adminMode = ref(true);
// 管理员退出管理模式后即视为普通用户，广场只展示投票中的提案
const isAdminView = computed(() => isAdmin.value && adminMode.value);
const isFocused = ref(false);
const keyword = ref('');
const loading = ref(false);
const error = ref(false);
const noMore = ref(false);
// 请求序号：慢响应回来时若已有更新请求，则丢弃，避免旧结果覆盖新结果
let fetchVersion = 0;
// 刚被支持的心形 id（用于播放一次性心跳动画，避免已支持项在加载时误播）
const poppingId = ref('');
const currentPage = ref(1);

type ProposalVM = {
  id: string;
  courseName: string;
  campus: string;
  department: string;
  category: string;
  teachers: string;
  status: string;
  courseId: string;
  contributor: string;
  userId: string;
  showUsername: boolean;
  reason: string;
  voteCount: number;
  isVoted: boolean;
  // 一键支持进行中（防连点）
  supporting?: boolean;
  createdAt: string;
  // 最近一次编辑 / 审批时间；用于判断「通过超过 24 小时不可撤回审批」
  updatedAt: string;
  // 未合并的校区数组，供普通用户客户端筛选使用
  campusList: string[];
  // 管理员「修改后通过」时 finalCourse 与原始 course 存在差异
  hasRevision: boolean;
  // 原始提交 / 管理员最终确认版本，随路由带到详情页用于区分修订
  courseSnapshot?: DtoProposalCourseVO;
  finalCourseSnapshot?: DtoProposalCourseVO;
};

const proposals = ref<ProposalVM[]>([]);
const total = ref(0);

// 筛选
const openDropdown = ref('');
const showRejectModal = ref(false);
const rejectTargetId = ref('');

// 管理员撤回审批（revoke）确认
const showRevokeConfirm = ref(false);
const revokeTargetId = ref('');
const revokeActionType = ref<'' | 'approve' | 'reject'>('');

// 内联搜索（院系 / 分类）
const deptKeyword = ref('');
const deptResults = ref<DtoFieldSuggestionVO[]>([]);
const categoryKeyword = ref('');
const categoryResults = ref<DtoFieldSuggestionVO[]>([]);
let deptTimer: ReturnType<typeof setTimeout> | null = null;
let categoryTimer: ReturnType<typeof setTimeout> | null = null;

const campusOptions = [...CAMPUS_OPTIONS];
const categoryOptions = [...PROPOSAL_CATEGORY_OPTIONS];
const statusOptions = [
  { label: '待审核', value: 'pending' as const },
  { label: '已通过', value: 'approved' as const },
  { label: '已拒绝', value: 'rejected' as const }
];

const filterForm = reactive({
  status: [] as string[],
  campus: [] as string[],
  department: [] as string[],
  category: [] as string[]
});

// ===== 管理员检测 =====
const detectAdmin = async () => {
  try {
    const res = await http.AuthController.authIsAdminList();
    isAdmin.value = !!(res.data?.data?.isAdmin ?? false);
  } catch {
    isAdmin.value = false;
  }
  if (isAdmin.value) {
    adminMode.value = uni.getStorageSync('meowpick_admin_mode') !== false;
  }
  // 普通视角（含管理员退出管理模式）默认只看审核中（待审核）的提案
  if (!isAdminView.value && filterForm.status.length === 0) {
    filterForm.status = ['pending'];
  }
};

// ===== 数据 =====
const mapProposal = (item: DtoProposalVO): ProposalVM => {
  // 已通过提案：展示管理员最终确认并上架的版本（finalCourse），
  // 未上架/拿不到 finalCourse 时回退到用户原始内容
  const published = item.finalCourse || item.course || {};
  const teachers = Array.isArray(published.teachers)
    ? published.teachers
        .map((t: DtoTeacherVO | string) =>
          typeof t === 'string' ? t : t.name || ''
        )
        .join('、')
    : '';
  return {
    id: item.id || '',
    // 已通过提案展示上架版本名称（可能被管理员修订），无上架版本时回退提案标题
    courseName: published.name || item.title || '未知课程',
    campus: Array.isArray(published.campuses)
      ? published.campuses.join('、')
      : '',
    department: published.department || '',
    category: published.category || '',
    teachers,
    status: item.status || 'pending',
    courseId: item.finalCourse?.id || item.course?.id || '',
    contributor: item.showUsername === false ? '匿名' : '',
    userId: item.userId || '',
    showUsername: item.showUsername !== false,
    reason: item.content || '',
    voteCount: item.likeCnt || 0,
    isVoted: !!item.like,
    createdAt: item.createdAt || '',
    updatedAt: item.updatedAt || '',
    campusList: Array.isArray(published.campuses) ? published.campuses : [],
    hasRevision: hasCourseRevision(item.course, item.finalCourse),
    courseSnapshot: item.course,
    finalCourseSnapshot: item.finalCourse
  };
};

const hasActiveFilters = computed(
  () =>
    filterForm.campus.length > 0 ||
    filterForm.department.length > 0 ||
    filterForm.category.length > 0 ||
    filterForm.status.length > 0
);

// 当前筛选选择的指纹，用于判断再次「确定」时筛选是否真的变化
const filterSignature = () =>
  JSON.stringify({
    campus: [...filterForm.campus].sort(),
    department: [...filterForm.department].sort(),
    category: [...filterForm.category].sort(),
    status: [...filterForm.status].sort()
  });

// 打开筛选面板时的筛选快照；「确定」时与当前一致则不重搜，保留滚动位置
let filterSnapshot = '';

// 管理员视角的状态筛选；普通用户固定走 pending 接口，不用该字段
const effectiveStatus = computed<string[] | undefined>(() =>
  filterForm.status.length ? filterForm.status : undefined
);

// 已通过提案：审批通过满 24 小时后后端不再允许撤回审批。
// updatedAt 可能因点赞被推后，因此仅当它已超过 24 小时才判定为过期（此时必定过期）。
const REVOKE_WINDOW_MS = 24 * 60 * 60 * 1000;
const isRevokeExpired = (item: ProposalVM): boolean => {
  if (item.status !== 'approved') return false;
  const t = new Date(item.updatedAt || '').getTime();
  if (Number.isNaN(t)) return false;
  return Date.now() - t >= REVOKE_WINDOW_MS;
};

// 普通用户广场固定在 pending 列表上，关键词 / 筛选在客户端完成
const matchesClientFilters = (p: ProposalVM): boolean => {
  const kw = keyword.value.trim().toLowerCase();
  if (kw) {
    const hay = [p.courseName, p.teachers, p.department, p.category]
      .join(' ')
      .toLowerCase();
    if (!hay.includes(kw)) return false;
  }
  if (
    filterForm.campus.length &&
    !filterForm.campus.some((c) => p.campusList.includes(c))
  ) {
    return false;
  }
  if (
    filterForm.department.length &&
    !filterForm.department.includes(p.department)
  ) {
    return false;
  }
  if (filterForm.category.length && !filterForm.category.includes(p.category)) {
    return false;
  }
  return true;
};

// 普通用户 pending 广场的分页大小；pending 接口最大支持 100
const PENDING_PAGE_SIZE = 50;
// 客户端筛选时最多汇总的页数，避免极端情况下无限翻页
const PENDING_FILTER_MAX_PAGES = 5;

// 已加载的原始条目数（客户端筛选前），用于判断是否还有更多
let loadedRawCount = 0;

// 提案列表接口不返回创建者昵称，需按 userId 补充查询
const fillContributors = async (list: ProposalVM[]) => {
  const targets = list.filter((p) => p.showUsername && p.userId);
  const names = await Promise.all(
    targets.map(async (p) => {
      try {
        const res = await http.UserController.userUsernameDetail(p.userId, {
          proposalId: p.id
        });
        return res.data?.data?.username?.trim() || '匿名';
      } catch {
        return '匿名';
      }
    })
  );
  // 汇总后一次性写入，避免每个响应各触发一次整列表重渲染
  targets.forEach((p, i) => {
    p.contributor = names[i];
  });
};

const fetchProposals = async (page = 1) => {
  if (loading.value && page > 1) return;
  const version = ++fetchVersion;
  loading.value = true;
  if (page === 1) error.value = false;
  try {
    // 普通用户 + 关键词/筛选：pending 接口不支持查询，改成一次性汇总后客户端过滤，
    // 避免过滤后首屏为空却还藏有后续页
    const clientFilterMode =
      !isAdminView.value && (hasActiveFilters.value || !!keyword.value.trim());
    if (clientFilterMode && page > 1) return;

    let rawList: DtoProposalVO[] = [];
    let serverTotal = 0;

    if (clientFilterMode) {
      const collected: DtoProposalVO[] = [];
      let p = 1;
      let total = 0;
      while (p <= PENDING_FILTER_MAX_PAGES) {
        const res = await http.ProposalController.proposalPendingList({
          page: p,
          pageSize: PENDING_PAGE_SIZE
        });
        const list = res.data?.data?.proposals ?? [];
        total = res.data?.data?.total ?? collected.length + list.length;
        collected.push(...list);
        if (list.length < PENDING_PAGE_SIZE || collected.length >= total) break;
        p++;
      }
      rawList = collected;
      serverTotal = total;
    } else if (!isAdminView.value) {
      // 普通用户只能看「投票中」的提案，固定调用 pending 接口
      const res = await http.ProposalController.proposalPendingList({
        page,
        pageSize: PENDING_PAGE_SIZE
      });
      rawList = res.data?.data?.proposals ?? [];
      serverTotal = res.data?.data?.total ?? rawList.length;
    } else if (hasActiveFilters.value || keyword.value.trim()) {
      // 管理员有筛选条件或搜索关键词时用 suggest 接口
      const res = await http.ProposalController.proposalSuggestList({
        keyword: keyword.value.trim() || undefined,
        status: effectiveStatus.value,
        campus: filterForm.campus.length ? filterForm.campus : undefined,
        department: filterForm.department.length
          ? filterForm.department[0]
          : undefined,
        category: filterForm.category.length
          ? filterForm.category[0]
          : undefined,
        page,
        pageSize: DEFAULT_PAGE_SIZE
      });
      rawList = res.data?.data?.proposals ?? [];
      serverTotal = res.data?.data?.total ?? rawList.length;
    } else {
      // 管理员无筛选条件时用简单列表接口
      const res = await http.ProposalController.proposalListList({
        status: undefined,
        page,
        pageSize: DEFAULT_PAGE_SIZE
      });
      rawList = res.data?.data?.proposals ?? [];
      serverTotal = res.data?.data?.total ?? rawList.length;
    }

    const mapped = rawList
      .filter(Boolean)
      .map(mapProposal)
      // 非管理模式：pending 接口已保证状态，再兜底并按客户端条件筛选
      .filter(
        (p) =>
          isAdminView.value ||
          (p.status === 'pending' && matchesClientFilters(p))
      );

    if (version !== fetchVersion) return; // 过期响应丢弃

    const pageSizeUsed = isAdminView.value
      ? DEFAULT_PAGE_SIZE
      : PENDING_PAGE_SIZE;
    if (page === 1) {
      proposals.value = mapped;
      loadedRawCount = rawList.length;
    } else {
      proposals.value = [...proposals.value, ...mapped];
      loadedRawCount += rawList.length;
    }
    total.value = serverTotal;
    noMore.value = clientFilterMode
      ? true
      : loadedRawCount >= serverTotal || rawList.length < pageSizeUsed;
    currentPage.value = page;
    await fillContributors(mapped);
  } catch (err) {
    if (version !== fetchVersion) return; // 过期响应丢弃
    console.error('[proposal] fetch error:', err);
    if (page === 1) {
      // 首屏失败：走整页错误态（不再用 toast，避免与空状态混淆）
      error.value = true;
    } else {
      showError('加载失败');
    }
  } finally {
    if (version === fetchVersion) loading.value = false;
  }
};

const doSearch = (reset = false, silent = false) => {
  // silent：保留现有列表（不切骨架屏、不塌缩内容），用于返回本页时的静默刷新，
  // 避免 scroll-view 因内容清空而丢失滚动位置
  if (reset && !silent) {
    proposals.value = [];
    currentPage.value = 1;
    noMore.value = false;
    loadedRawCount = 0;
  }
  fetchProposals(reset ? 1 : currentPage.value);
};

const loadMore = () => {
  if (!noMore.value && !loading.value) fetchProposals(currentPage.value + 1);
};

let searchTimer: ReturnType<typeof setTimeout> | null = null;
const onInputChange = () => {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    doSearch(true);
  }, 300);
};

const clearSearch = () => {
  keyword.value = '';
  doSearch(true);
};

// ===== 筛选 =====
const isDropdownOpen = computed(() => openDropdown.value !== '');

const toggleDropdown = (name: string) => {
  // 再次点击已展开的筛选项 -> 视为「确定」，应用当前选择
  if (openDropdown.value === name) {
    applyFilters();
    return;
  }
  // 从关闭态打开时记录快照（面板内切换标签不重记，避免漏掉之前的改动）
  if (!openDropdown.value) filterSnapshot = filterSignature();
  openDropdown.value = name;
};

const closeDropdown = () => {
  // 点击空白处关闭筛选栏 -> 视为「确定」，应用当前选择
  applyFilters();
};

const toggleFilter = (type: 'campus' | 'status', value: string) => {
  const arr = type === 'campus' ? filterForm.campus : filterForm.status;
  const idx = arr.indexOf(value);
  if (idx > -1) arr.splice(idx, 1);
  else arr.push(value);
};

const toggleFilterArray = (type: 'department' | 'category', value: string) => {
  const arr = filterForm[type];
  const idx = arr.indexOf(value);
  if (idx > -1) arr.splice(idx, 1);
  else arr.push(value);
};

const resetFilters = () => {
  const isAll = openDropdown.value === 'all';
  if (isAll || openDropdown.value === 'campus') filterForm.campus = [];
  if (isAll || openDropdown.value === 'department') filterForm.department = [];
  if (isAll || openDropdown.value === 'category') filterForm.category = [];
  if (isAll || openDropdown.value === 'status')
    filterForm.status = isAdminView.value ? [] : ['pending'];
};

// 输入框有内容但没有任何模糊匹配项时，提示并清空输入框，阻止本次应用
const blockUnmatchedFieldInput = () => {
  const unmatched: string[] = [];
  if (deptKeyword.value.trim() && deptResults.value.length === 0) {
    deptKeyword.value = '';
    deptResults.value = [];
    unmatched.push('院系');
  }
  if (categoryKeyword.value.trim() && categoryResults.value.length === 0) {
    categoryKeyword.value = '';
    categoryResults.value = [];
    unmatched.push('分类');
  }
  if (!unmatched.length) return false;
  showInfo(`未找到匹配的${unmatched.join('、')}`);
  return true;
};

const applyFilters = () => {
  if (blockUnmatchedFieldInput()) return;
  openDropdown.value = '';
  // 筛选没变化（例如打开面板后未选择任何项，或改了又改回来）：不重搜、不清空列表
  if (filterSignature() === filterSnapshot) return;
  doSearch(true);
};

// ===== 内联搜索 =====
const searchField = async (
  keyword: string,
  field: 'department' | 'category'
) => {
  if (!keyword.trim()) return [];
  try {
    const res = await http.ProposalController.proposalFieldSuggestionsList({
      keyword: keyword.trim(),
      field
    });
    return res.data?.data?.suggestions ?? [];
  } catch {
    return [];
  }
};

const onDeptSearch = () => {
  if (deptTimer) clearTimeout(deptTimer);
  const kw = deptKeyword.value;
  deptTimer = setTimeout(async () => {
    deptResults.value = kw.trim() ? await searchField(kw, 'department') : [];
  }, 300);
};

const selectDept = (item: DtoFieldSuggestionVO) => {
  const val = item.value || item.label || '';
  if (val && !filterForm.department.includes(val)) {
    filterForm.department.push(val);
  }
  deptKeyword.value = '';
  deptResults.value = [];
};

const onCategorySearch = () => {
  if (categoryTimer) clearTimeout(categoryTimer);
  const kw = categoryKeyword.value;
  categoryTimer = setTimeout(async () => {
    categoryResults.value = kw.trim() ? await searchField(kw, 'category') : [];
  }, 300);
};

const selectCategory = (item: DtoFieldSuggestionVO) => {
  const val = item.value || item.label || '';
  if (val && !filterForm.category.includes(val)) {
    filterForm.category.push(val);
  }
  categoryKeyword.value = '';
  categoryResults.value = [];
};

// ===== 管理员操作 =====
const handleReject = (item: ProposalVM) => {
  rejectTargetId.value = item.id;
  showRejectModal.value = true;
};

const handleRejectConfirm = async (reason: string) => {
  if (!rejectTargetId.value) return;
  try {
    const res = await http.ProposalController.proposalRejectCreate(
      rejectTargetId.value,
      { proposalId: rejectTargetId.value, reason }
    );
    if (res.data?.code === 0 || res.data?.code === 200) {
      showSuccess('已拒绝');
      doSearch(true);
    } else {
      showError(
        errorMessageOf(res.data?.code, res.data?.msg) ||
          res.data?.msg ||
          '操作失败，请重试'
      );
    }
  } catch (err) {
    const e = err as { response?: { data?: { code?: number; msg?: string } } };
    showError(
      errorMessageOf(e.response?.data?.code, e.response?.data?.msg) ||
        e.response?.data?.msg ||
        '拒绝失败'
    );
  } finally {
    rejectTargetId.value = '';
  }
};

const revokeDescription = computed(() =>
  revokeActionType.value === 'approve'
    ? '撤回审批后，已上架课程将下架、已结算贡献值将扣回，提案回到待审核状态。确定撤回审批吗？'
    : '撤回审批后，拒绝理由将被清空，提案回到待审核状态。确定撤回审批吗？'
);

const handleWithdraw = (item: ProposalVM) => {
  // revoke 仅支持已通过（approve）/ 已拒绝（reject）提案，待审核由本人走 delete 接口
  const actionType =
    item.status === 'approved'
      ? 'approve'
      : item.status === 'rejected'
      ? 'reject'
      : '';
  if (!actionType) return;
  revokeTargetId.value = item.id;
  revokeActionType.value = actionType;
  showRevokeConfirm.value = true;
};

// 卡片左下一键支持/取消（乐观更新，失败回滚）
const handleQuickSupport = async (item: ProposalVM) => {
  if (item.supporting) return;
  const prevVoted = item.isVoted;
  const prevCount = item.voteCount;
  item.supporting = true;
  item.isVoted = !prevVoted;
  item.voteCount = prevCount + (item.isVoted ? 1 : -1);
  // 仅在「变为已支持」时播放心跳，取消不加动画
  if (item.isVoted) {
    poppingId.value = item.id;
    setTimeout(() => {
      if (poppingId.value === item.id) poppingId.value = '';
    }, 520);
  }
  try {
    const res = await http.ActionController.likeCreate(item.id, {
      targetType: 'proposal'
    });
    const result = res.data?.data;
    if (result?.like !== undefined) item.isVoted = result.like;
    if (result?.likeCnt !== undefined) item.voteCount = result.likeCnt;
  } catch (err) {
    console.error('[proposal/list] like error:', err);
    item.isVoted = prevVoted;
    item.voteCount = prevCount;
    showError('操作失败，请稍后重试');
  } finally {
    item.supporting = false;
  }
};

const performRevoke = async () => {
  if (!revokeTargetId.value || !revokeActionType.value) return;
  const actionType = revokeActionType.value;
  const targetId = revokeTargetId.value;
  try {
    const res = await http.ProposalController.proposalRevokeCreate(targetId, {
      actionType
    });
    const code = res.data?.code;
    if (code === 0 || code === 200) {
      showSuccess('已撤回审批');
      doSearch(true);
    } else {
      showError(errorMessageOf(code, res.data?.msg) || '操作失败，请重试');
      // 通过超过 24 小时：后端拒绝撤回审批，刷新列表以同步卡片状态
      if (code === 108000028) doSearch(true, true);
    }
  } catch (err) {
    const e = err as { response?: { data?: { code?: number; msg?: string } } };
    showError(
      errorMessageOf(e.response?.data?.code, e.response?.data?.msg) ||
        e.response?.data?.msg ||
        '撤回审批失败'
    );
  } finally {
    revokeTargetId.value = '';
    revokeActionType.value = '';
  }
};

// ===== 导航 =====
// 状态文案：用户侧说「投票」，管理侧说「审核」（与 proposal-detail 保持一致）
const statusLabel = (s: string) => {
  const adminSide = isAdminView.value;
  return (
    {
      pending: adminSide ? '待审核' : '投票中',
      approved: '已通过',
      rejected: adminSide ? '已拒绝' : '未通过'
    }[s] || s
  );
};

const goToDetail = (item: ProposalVM) => {
  const dataStr = encodeURIComponent(
    JSON.stringify({
      id: item.id,
      userId: item.userId,
      name: item.courseName,
      teacher: item.teachers,
      campus: item.campus,
      category: item.category,
      reason: item.reason,
      voteCount: item.voteCount,
      isVoted: item.isVoted,
      date: item.createdAt,
      status: item.status,
      // 普通用户详情接口拿不到 finalCourse，靠列表带过去做「原/改」对照
      course: item.courseSnapshot,
      finalCourse: item.finalCourseSnapshot
    })
  );
  uni.navigateTo({
    url: `/pages/proposal/proposal-detail?data=${dataStr}`
  });
};
const goToPropose = () => uni.navigateTo({ url: '/pages/proposal/propose' });
const goToLogs = () => uni.navigateTo({ url: '/pages/proposal/log' });

// ===== 外部筛选带入（来自搜索结果页「查看广场提案」）=====
const safeDecode = (s: string) => {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
};

const parseArrayParam = (raw?: string): string[] => {
  if (!raw) return [];
  for (const candidate of [raw, safeDecode(raw)]) {
    try {
      const parsed = JSON.parse(candidate);
      if (Array.isArray(parsed)) {
        return parsed.filter((v) => typeof v === 'string' && v.trim());
      }
    } catch {
      /* 尝试下一种解析方式 */
    }
  }
  const plain = safeDecode(raw);
  return plain
    ? plain
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean)
    : [];
};

const matchAgainst = (values: string[], options: string[]) =>
  values.filter((v) => options.includes(v));

// 院系无固定列表，需逐个向后端字段建议接口校验是否存在一致值
const validateDepartments = async (
  values: string[]
): Promise<{ matched: string[]; dropped: string[] }> => {
  const results = await Promise.all(
    values.map(async (v) => {
      try {
        const res = await http.ProposalController.proposalFieldSuggestionsList({
          keyword: v.trim(),
          field: 'department'
        });
        const suggestions = res.data?.data?.suggestions ?? [];
        const hit = suggestions.some(
          (s) =>
            (s.value || s.label || '').trim().toLowerCase() ===
            v.trim().toLowerCase()
        );
        return { value: v, hit };
      } catch {
        return { value: v, hit: true }; // 网络异常时保守保留，避免误丢筛选
      }
    })
  );
  return {
    matched: results.filter((r) => r.hit).map((r) => r.value),
    dropped: results.filter((r) => !r.hit).map((r) => r.value)
  };
};

const showFilterNotice = ref(false);
const filterNoticeText = ref('');

const applyIncomingFilters = async (options: Record<string, string>) => {
  if (!options) return;
  const kw = options.keyword ? safeDecode(options.keyword) : '';
  if (kw) keyword.value = kw;

  const incomingCampus = parseArrayParam(options.campus);
  const incomingCategory = parseArrayParam(options.category);
  const incomingDept = parseArrayParam(options.department);

  const matchedCampus = matchAgainst(incomingCampus, campusOptions);
  const matchedCategory = matchAgainst(incomingCategory, categoryOptions);
  const { matched: matchedDept, dropped: droppedDept } =
    await validateDepartments(incomingDept);

  filterForm.campus = matchedCampus;
  filterForm.category = matchedCategory;
  filterForm.department = matchedDept;

  const dropped = [
    ...incomingCampus.filter((v) => !matchedCampus.includes(v)),
    ...incomingCategory.filter((v) => !matchedCategory.includes(v)),
    ...droppedDept
  ];
  if (dropped.length) {
    filterNoticeText.value = `${dropped.join(
      '、'
    )} 在当前提案广场不可用，已忽略。`;
    showFilterNotice.value = true;
  }
};

// ===== 生命周期 =====
let initialized = false;
let lastAdminView = false;
onLoad(async (options: Record<string, string> = {}) => {
  await detectAdmin();
  lastAdminView = isAdminView.value;
  await applyIncomingFilters(options);
  initialized = true;
  doSearch(true);
});

// 提案提交/审核后由 propose / proposal-detail 发出；标记待刷新，回到本页 onShow 时统一拉取
let pendingRefresh = false;
const handleProposalListRefresh = () => {
  pendingRefresh = true;
};
uni.$on('proposalListShouldRefresh', handleProposalListRefresh);

onShow(() => {
  if (isAdmin.value)
    adminMode.value = uni.getStorageSync('meowpick_admin_mode') !== false;

  // 管理员在「个人中心」切换用户/管理模式后，回到本页需要按新视角重置状态筛选并重拉
  const currentAdminView = isAdminView.value;
  if (initialized && currentAdminView !== lastAdminView) {
    lastAdminView = currentAdminView;
    filterForm.status = currentAdminView ? [] : ['pending'];
    doSearch(true);
    return;
  }

  // 与搜索页一致：从详情页返回时保留列表与滚动位置。
  // 有跨页刷新信号时静默重拉（不清空列表），否则仅在列表为空时重新拉取
  if (pendingRefresh) {
    pendingRefresh = false;
    doSearch(true, true);
  } else if (initialized && proposals.value.length === 0) {
    doSearch(true);
  }
});

onUnmounted(() => {
  if (searchTimer) clearTimeout(searchTimer);
  if (deptTimer) clearTimeout(deptTimer);
  if (categoryTimer) clearTimeout(categoryTimer);
  uni.$off('proposalListShouldRefresh', handleProposalListRefresh);
});
</script>

<style lang="scss" scoped src="./list.scss" />
