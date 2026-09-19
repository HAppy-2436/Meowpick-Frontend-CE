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
          <text class="search-icon">🔍</text>
          <input
            v-model="keyword"
            class="search-input"
            placeholder="搜索课程或教师"
            placeholder-class="placeholder-style"
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
            @click="clearSearch"
          >
            <text class="clear-text">×</text>
          </view>
        </view>

        <!-- 右侧搜索按钮：仅在没有系统胶囊（PC 端）时出现 -->
        <view
          v-if="!viewport.hasCapsule"
          class="nav-search-btn"
          hover-class="mwp-hover"
          @click="doSearch(true)"
          >搜索</view
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
          @click="toggleDropdown('campus')"
        >
          <text class="chip-text">{{
            filterForm.campus.length
              ? filterForm.campus.map((c) => c.replace('校区', '')).join('+')
              : '校区'
          }}</text>
          <text class="chip-arrow">▾</text>
        </view>
        <view
          class="filter-chip"
          style="flex: 1 1 auto; min-width: 0"
          :class="{
            'has-value': filterForm.department.length,
            'is-open': openDropdown === 'department' || openDropdown === 'all'
          }"
          hover-class="mwp-hover"
          @click="toggleDropdown('department')"
        >
          <text class="chip-text">{{
            filterForm.department.length
              ? filterForm.department.length > 1
                ? filterForm.department.length + '个院系'
                : filterForm.department[0]
              : '院系'
          }}</text>
          <text class="chip-arrow">▾</text>
        </view>
        <view
          class="filter-chip"
          style="flex: 1 1 auto; min-width: 0"
          :class="{
            'has-value': filterForm.category.length,
            'is-open': openDropdown === 'category' || openDropdown === 'all'
          }"
          hover-class="mwp-hover"
          @click="toggleDropdown('category')"
        >
          <text class="chip-text">{{
            filterForm.category.length
              ? filterForm.category.length > 1
                ? filterForm.category.length + '个分类'
                : filterForm.category[0]
              : '分类'
          }}</text>
          <text class="chip-arrow">▾</text>
        </view>
        <view
          v-if="isAdmin"
          class="filter-chip"
          style="flex: 1 1 auto; min-width: 0"
          :class="{
            'has-value': filterForm.status.length,
            'is-open': openDropdown === 'status' || openDropdown === 'all'
          }"
          hover-class="mwp-hover"
          @click="toggleDropdown('status')"
        >
          <text class="chip-text">{{
            filterForm.status.length
              ? filterForm.status.map((s) => statusLabel(s)).join('+')
              : '状态'
          }}</text>
          <text class="chip-arrow">▾</text>
        </view>
        <view
          class="filter-chip filter-chip--expand"
          :class="{ 'is-open': openDropdown === 'all' }"
          hover-class="mwp-hover"
          @click="toggleDropdown('all')"
        >
          <text class="chip-arrow">▾</text>
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
                  @click="toggleFilterArray('department', d)"
                  >×</view
                >
              </view>
            </view>
            <view class="fd-search">
              <input
                v-model="deptKeyword"
                class="fd-search-input"
                placeholder="搜索院系..."
                placeholder-class="fd-placeholder"
                @input="onDeptSearch"
              />
              <view v-if="deptResults.length" class="fd-suggest-list">
                <view
                  v-for="item in deptResults"
                  :key="item.value"
                  class="fd-suggest-item"
                  hover-class="mwp-hover"
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
                  @click="toggleFilterArray('category', cat)"
                  >×</view
                >
              </view>
            </view>
            <view class="fd-search">
              <input
                v-model="categoryKeyword"
                class="fd-search-input"
                placeholder="搜索分类..."
                placeholder-class="fd-placeholder"
                @input="onCategorySearch"
              />
              <view v-if="categoryResults.length" class="fd-suggest-list">
                <view
                  v-for="item in categoryResults"
                  :key="item.value"
                  class="fd-suggest-item"
                  hover-class="mwp-hover"
                  @click="selectCategory(item)"
                  >{{ item.label || item.value }}</view
                >
              </view>
            </view>
          </view>
          <view
            v-if="
              isAdmin && (openDropdown === 'status' || openDropdown === 'all')
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
                @click="toggleFilter('status', s.value)"
                >{{ s.label }}</view
              >
            </view>
          </view>
        </view>
        <view class="fd-footer">
          <view
            class="fd-btn fd-btn--reset"
            hover-class="mwp-hover"
            @click="resetFilters"
            >重置</view
          >
          <view
            class="fd-btn fd-btn--confirm"
            hover-class="mwp-hover"
            @click="applyFilters"
            >确定</view
          >
        </view>
      </view>
    </view>

    <!-- 内容区 -->
    <scroll-view
      scroll-y
      class="content-scroll"
      enhanced
      :show-scrollbar="false"
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

      <!-- 空状态 -->
      <EmptyState
        v-else-if="!loading && proposals.length === 0"
        title="暂无提案"
        desc="快来发起第一个吧"
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
          :style="{ animationDelay: `${Math.min(idx * 60, 300)}ms` }"
          @click="goToDetail(item)"
        >
          <view class="result-card-wrapper proposal-card">
            <view class="proposal-content">
              <view class="proposal-row-top">
                <text class="proposal-name">{{ item.courseName }}</text>
                <StatusBadge
                  v-if="item.status"
                  :status="item.status"
                  :label="statusLabel(item.status)"
                  pill
                />
              </view>
              <view class="proposal-row-middle">
                <view v-if="item.teachers" class="proposal-info-item">
                  <image src="@/images/teacher-icon.png" class="info-icon" />
                  <text>{{ item.teachers }}</text>
                </view>
                <view v-if="item.department" class="proposal-info-item">
                  <image src="@/images/depart-icon.png" class="info-icon" />
                  <text>{{ item.department }}</text>
                </view>
                <view v-if="item.campus" class="proposal-info-item">
                  <image src="@/images/campus-icon.png" class="info-icon" />
                  <text>{{ item.campus }}</text>
                </view>
              </view>
              <view v-if="item.contributor" class="proposal-row-contributor">
                <text class="contributor-text"
                  >贡献者：{{ item.contributor }}</text
                >
              </view>
            </view>
            <!-- 管理员操作 -->
            <view v-if="isAdmin && adminMode" class="admin-actions" @click.stop>
              <template v-if="item.status === 'pending'">
                <view
                  class="admin-btn admin-btn--approve"
                  hover-class="mwp-hover"
                  @click="handleApprove(item)"
                  >通过</view
                >
                <view
                  class="admin-btn admin-btn--reject"
                  hover-class="mwp-hover"
                  @click="handleReject(item)"
                  >拒绝</view
                >
              </template>
              <view
                v-else
                class="admin-btn admin-btn--withdraw"
                hover-class="mwp-hover"
                @click="handleWithdraw(item)"
              >
                {{ item.status === 'approved' ? '撤回审批' : '撤回' }}
              </view>
            </view>
            <!-- 已通过：查看课程 -->
            <view
              v-if="item.status === 'approved' && item.courseId"
              class="view-course-row"
              hover-class="mwp-hover"
              @click.stop="goToCourse(item.courseId)"
            >
              <text class="view-course-text">查看课程</text>
              <text class="view-course-arrow">→</text>
            </view>
          </view>
        </view>
        <view v-if="noMore && proposals.length > 0" class="bottom-prompt">
          <text>— 到底了 —</text>
        </view>
      </view>
    </scroll-view>

    <!-- FAB：普通用户=加号，管理员=日志 -->
    <view class="fab-group">
      <view
        v-if="isAdmin && adminMode"
        class="fab-btn"
        hover-class="mwp-hover"
        @click="goToLogs"
      >
        <text class="fab-icon">📑</text>
      </view>
      <view v-else class="fab-btn" hover-class="mwp-hover" @click="goToPropose">
        <PlusIcon class="fab-icon" size="52rpx" thickness="6rpx" />
      </view>
    </view>

    <!-- 拒绝弹窗 -->
    <RejectModal
      v-model:visible="showRejectModal"
      @confirm="handleRejectConfirm"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onUnmounted } from 'vue';
import { onLoad, onShow } from '@dcloudio/uni-app';
import { http, useThemeStore } from '@/config';
import { useMenuButton } from '@/composables/useMenuButton';
import { useViewport } from '@/composables/useViewport';
import { useScrollDirection } from '@/composables/useScrollDirection';
import {
  DEFAULT_PAGE_SIZE,
  CAMPUS_OPTIONS,
  PROPOSAL_CATEGORY_OPTIONS
} from '@/utils/constants';
import type {
  DtoFieldSuggestionVO,
  DtoProposalVO,
  DtoTeacherVO,
  HandlerResponseDtoListProposalResp
} from '@/api/data-contracts';
import type { AxiosResponse } from 'axios';
import RejectModal from '@/components/common/RejectModal.vue';
import BackBtn from '@/components/common/BackBtn.vue';

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
const contentPaddingTop = computed(() => {
  const filterHeight = isFilterHidden.value ? 0 : FILTER_BAR_HEIGHT.value;
  const filterOffset = isFilterHidden.value ? 0 : FILTER_BAR_TOP_OFFSET.value;
  return (
    headerHeight.value +
    filterOffset +
    filterHeight +
    FIRST_CARD_GAP.value +
    'px'
  );
});

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
const isFocused = ref(false);
const keyword = ref('');
const loading = ref(false);
const noMore = ref(false);
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
  createdAt: string;
};

const proposals = ref<ProposalVM[]>([]);
const total = ref(0);

// 筛选
const openDropdown = ref('');
const showRejectModal = ref(false);
const rejectTargetId = ref('');

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
  if (!isAdmin.value && uni.getStorageSync('meowpick_temp_admin'))
    isAdmin.value = true;
  if (isAdmin.value) {
    adminMode.value = uni.getStorageSync('meowpick_admin_mode') !== false;
  }
  // 普通用户默认只看审核中（待审核）的提案
  if (!isAdmin.value && filterForm.status.length === 0) {
    filterForm.status = ['pending'];
  }
};

// ===== 数据 =====
const mapProposal = (item: DtoProposalVO): ProposalVM => {
  const course = item.course || item.finalCourse || {};
  const teachers = Array.isArray(course.teachers)
    ? course.teachers
        .map((t: DtoTeacherVO | string) =>
          typeof t === 'string' ? t : t.name || ''
        )
        .join('、')
    : '';
  return {
    id: item.id || '',
    courseName: item.title || course.name || '未知课程',
    campus: Array.isArray(course.campuses) ? course.campuses.join('、') : '',
    department: course.department || '',
    category: course.category || '',
    teachers,
    status: item.status || 'pending',
    courseId: item.finalCourse?.id || course.id || '',
    contributor: item.showUsername === false ? '匿名' : '',
    userId: item.userId || '',
    showUsername: item.showUsername !== false,
    reason: item.content || '',
    voteCount: item.likeCnt || 0,
    isVoted: !!item.like,
    createdAt: item.createdAt || ''
  };
};

const hasActiveFilters = computed(
  () =>
    filterForm.campus.length > 0 ||
    filterForm.department.length > 0 ||
    filterForm.category.length > 0 ||
    filterForm.status.length > 0
);

// 提案列表接口不返回创建者昵称，需按 userId 补充查询
const fillContributors = async (list: ProposalVM[]) => {
  await Promise.all(
    list
      .filter((p) => p.showUsername && p.userId)
      .map(async (p) => {
        try {
          const res = await http.UserController.userUsernameDetail(p.userId, {
            proposalId: p.id
          });
          const name = res.data?.data?.username?.trim();
          p.contributor = name || '匿名';
        } catch {
          p.contributor = '匿名';
        }
      })
  );
};

const fetchProposals = async (page = 1) => {
  if (loading.value && page > 1) return;
  loading.value = true;
  try {
    let res: AxiosResponse<HandlerResponseDtoListProposalResp>;
    if (hasActiveFilters.value || keyword.value.trim()) {
      // 有筛选条件或搜索关键词时用 suggest 接口
      res = await http.ProposalController.proposalSuggestList({
        keyword: keyword.value.trim() || undefined,
        status: filterForm.status.length ? filterForm.status : undefined,
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
    } else {
      // 无筛选条件时用简单列表接口（后端自动按权限过滤）
      res = await http.ProposalController.proposalListList({
        page,
        pageSize: DEFAULT_PAGE_SIZE
      });
    }
    const data = res.data?.data;
    const list = data?.proposals ?? [];
    const mapped = list.filter(Boolean).map(mapProposal);
    if (page === 1) proposals.value = mapped;
    else proposals.value = [...proposals.value, ...mapped];
    total.value = data?.total ?? proposals.value.length;
    noMore.value = proposals.value.length >= total.value;
    currentPage.value = page;
    await fillContributors(mapped);
  } catch (err) {
    console.error('[proposal] fetch error:', err);
    if (page === 1) uni.showToast({ title: '加载失败', icon: 'none' });
  } finally {
    loading.value = false;
  }
};

const doSearch = (reset = false) => {
  if (reset) {
    proposals.value = [];
    currentPage.value = 1;
    noMore.value = false;
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
  openDropdown.value = openDropdown.value === name ? '' : name;
};

const closeDropdown = () => {
  openDropdown.value = '';
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
    filterForm.status = isAdmin.value ? [] : ['pending'];
};

const applyFilters = () => {
  openDropdown.value = '';
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
const handleApprove = (item: ProposalVM) => {
  uni.navigateTo({
    url: `/pages/proposal/propose?approveProposalId=${String(item.id)}`
  });
};

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
      uni.showToast({ title: '已拒绝', icon: 'success' });
      doSearch(true);
    } else {
      uni.showToast({ title: res.data?.msg || '操作失败', icon: 'none' });
    }
  } catch {
    uni.showToast({ title: '拒绝失败', icon: 'none' });
  } finally {
    rejectTargetId.value = '';
  }
};

const handleWithdraw = async (item: ProposalVM) => {
  const actionType =
    item.status === 'approved'
      ? 'approve'
      : item.status === 'rejected'
      ? 'reject'
      : 'delete';
  try {
    const res = await http.ProposalController.proposalRevokeCreate(item.id, {
      actionType
    });
    if (res.data?.code === 0 || res.data?.code === 200) {
      uni.showToast({ title: '已撤回', icon: 'success' });
      doSearch(true);
    } else {
      uni.showToast({ title: res.data?.msg || '操作失败', icon: 'none' });
    }
  } catch {
    uni.showToast({ title: '撤回失败', icon: 'none' });
  }
};

// ===== 导航 =====
const statusLabel = (s: string) =>
  ({ pending: '待审核', approved: '已通过', rejected: '已拒绝' }[s] || s);

const goToDetail = (item: ProposalVM) => {
  const dataStr = encodeURIComponent(
    JSON.stringify({
      id: item.id,
      name: item.courseName,
      teacher: item.teachers,
      campus: item.campus,
      category: item.category,
      reason: item.reason,
      voteCount: item.voteCount,
      isVoted: item.isVoted,
      date: item.createdAt
    })
  );
  uni.navigateTo({
    url: `/pages/course/proposal-detail?data=${dataStr}`
  });
};
const goToCourse = (courseId: string) => {
  uni.navigateTo({ url: `/pages/course/detail?id=${courseId}` });
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
    uni.showModal({
      title: '部分筛选未能带入',
      content: `${dropped.join('、')} 在当前提案广场不可用，已忽略。`,
      showCancel: false
    });
  }
};

// ===== 生命周期 =====
onLoad(async (options: Record<string, string> = {}) => {
  await detectAdmin();
  await applyIncomingFilters(options);
  doSearch(true);
});

onShow(() => {
  const tempAdmin = uni.getStorageSync('meowpick_temp_admin');
  if (tempAdmin && !isAdmin.value) {
    isAdmin.value = true;
    adminMode.value = uni.getStorageSync('meowpick_admin_mode') !== false;
  }
  if (isAdmin.value)
    adminMode.value = uni.getStorageSync('meowpick_admin_mode') !== false;
  if (proposals.value.length > 0) doSearch(true);
});

onUnmounted(() => {
  if (searchTimer) clearTimeout(searchTimer);
  if (deptTimer) clearTimeout(deptTimer);
});
</script>

<style lang="scss" scoped src="./list.scss" />
