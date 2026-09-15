<template>
  <view class="proposal-container" :class="themeStore.themeClass">
    <!-- 动态 Header：搜索栏与胶囊同行 -->
    <view class="dynamic-header" :style="{ height: headerHeight + 'px' }">
      <view class="search-bar-wrapper" :style="searchBarWrapperStyle">
        <view class="nav-back-btn" :style="{ height: menuButtonInfo.height + 'px', width: menuButtonInfo.height + 'px' }">
          <BackBtn />
        </view>
        <view class="search-input-box" :class="{ 'is-focused': isFocused }">
          <text class="search-icon">🔍</text>
          <input
            v-model="keyword"
            class="search-input"
            placeholder="搜索课程或教师"
            placeholder-class="placeholder-style"
            :focus="false"
            @focus="isFocused = true"
            @blur="isFocused = false"
            @input="onInputChange"
            @confirm="doSearch(true)"
            confirm-type="search"
          />
          <view v-if="keyword" class="clear-icon" @click="clearSearch">
            <text class="clear-text">×</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 筛选条 -->
    <view class="filter-bar-wrapper" :class="{ 'is-hidden': isFilterHidden }" :style="{ top: headerHeight + 'px' }">
      <view class="filter-chip-bar">
        <view class="filter-chip" style="flex:1 1 auto;min-width:0" :class="{ 'has-value': filterForm.campus.length, 'is-open': openDropdown === 'campus' || openDropdown === 'all' }" @click="toggleDropdown('campus')">
          <text class="chip-text">{{ filterForm.campus.length ? filterForm.campus.map(c => c.replace('校区','')).join('+') : '校区' }}</text>
          <text class="chip-arrow">▾</text>
        </view>
        <view class="filter-chip" style="flex:1 1 auto;min-width:0" :class="{ 'has-value': filterForm.department.length, 'is-open': openDropdown === 'department' || openDropdown === 'all' }" @click="toggleDropdown('department')">
          <text class="chip-text">{{ filterForm.department.length ? (filterForm.department.length > 1 ? filterForm.department.length + '个院系' : filterForm.department[0]) : '院系' }}</text>
          <text class="chip-arrow">▾</text>
        </view>
        <view class="filter-chip" style="flex:1 1 auto;min-width:0" :class="{ 'has-value': filterForm.category.length, 'is-open': openDropdown === 'category' || openDropdown === 'all' }" @click="toggleDropdown('category')">
          <text class="chip-text">{{ filterForm.category.length ? (filterForm.category.length > 1 ? filterForm.category.length + '个分类' : filterForm.category[0]) : '分类' }}</text>
          <text class="chip-arrow">▾</text>
        </view>
        <view v-if="isAdmin" class="filter-chip" style="flex:1 1 auto;min-width:0" :class="{ 'has-value': filterForm.status.length, 'is-open': openDropdown === 'status' || openDropdown === 'all' }" @click="toggleDropdown('status')">
          <text class="chip-text">{{ filterForm.status.length ? filterForm.status.map(s => statusLabel(s)).join('+') : '状态' }}</text>
          <text class="chip-arrow">▾</text>
        </view>
        <view class="filter-chip filter-chip--expand" :class="{ 'is-open': openDropdown === 'all' }" @click="toggleDropdown('all')">
          <text class="chip-arrow">▾</text>
        </view>
      </view>

      <!-- 下拉面板 -->
      <view v-if="isDropdownOpen" class="filter-dropdown-mask" @click="closeDropdown" />
      <view v-if="isDropdownOpen" class="filter-dropdown" @click.stop>
        <view class="fd-scroll">
          <view class="fd-group" v-if="openDropdown === 'campus' || openDropdown === 'all'">
            <text class="fd-label">校区</text>
            <view class="fd-tags">
              <view v-for="c in campusOptions" :key="c" class="fd-tag" :class="{ active: filterForm.campus.includes(c) }" @click="toggleFilter('campus', c)">{{ c }}</view>
            </view>
          </view>
          <view class="fd-group" v-if="openDropdown === 'department' || openDropdown === 'all'">
            <text class="fd-label">院系</text>
            <view v-if="filterForm.department.length" class="fd-selected-tags">
              <view v-for="d in filterForm.department" :key="d" class="fd-selected">
                <text class="fd-selected-text">{{ d }}</text>
                <text class="fd-selected-clear" @click="toggleFilterArray('department', d)">×</text>
              </view>
            </view>
            <view class="fd-search">
              <input class="fd-search-input" placeholder="搜索院系..." placeholder-class="fd-placeholder" v-model="deptKeyword" @input="onDeptSearch" />
              <view v-if="deptResults.length" class="fd-suggest-list">
                <view v-for="item in deptResults" :key="item.value" class="fd-suggest-item" @click="selectDept(item)">{{ item.label || item.value }}</view>
              </view>
            </view>
          </view>
          <view class="fd-group" v-if="openDropdown === 'category' || openDropdown === 'all'">
            <text class="fd-label">分类</text>
            <view class="fd-tags">
              <view v-for="c in categoryOptions" :key="c" class="fd-tag" :class="{ active: filterForm.category.includes(c) }" @click="toggleFilterArray('category', c)">{{ c }}</view>
            </view>
          </view>
          <view class="fd-group" v-if="isAdmin && (openDropdown === 'status' || openDropdown === 'all')">
            <text class="fd-label">状态</text>
            <view class="fd-tags">
              <view v-for="s in statusOptions" :key="s.value" class="fd-tag" :class="{ active: filterForm.status.includes(s.value) }" @click="toggleFilter('status', s.value)">{{ s.label }}</view>
            </view>
          </view>
        </view>
        <view class="fd-footer">
          <view class="fd-btn fd-btn--reset" @click="resetFilters">重置</view>
          <view class="fd-btn fd-btn--confirm" @click="applyFilters">确定</view>
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
      <SkeletonCard v-if="loading && proposals.length === 0" :count="4" class="skeleton-wrap" />

      <!-- 空状态 -->
      <EmptyState
        v-else-if="!loading && proposals.length === 0"
        emoji="🐾"
        title="暂无提案"
        desc="快来发起第一个吧"
      >
        <template #action>
          <MwpButton tone="brand" @click="goToPropose">发起提案</MwpButton>
        </template>
      </EmptyState>

      <!-- 提案列表 -->
      <view v-else class="result-section">
        <view v-for="(item, idx) in proposals" :key="item.id" class="result-card" :style="{ animationDelay: `${Math.min(idx * 60, 300)}ms` }" @click="goToDetail(item)">
          <view class="result-card-wrapper proposal-card">
            <view class="proposal-content">
              <view class="proposal-row-top">
                <text class="proposal-name">{{ item.courseName }}</text>
                <StatusBadge v-if="item.status" :status="item.status" :label="statusLabel(item.status)" pill />
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
                <text class="contributor-text">贡献者：{{ item.contributor }}</text>
              </view>
            </view>
            <!-- 管理员操作 -->
            <view v-if="isAdmin && adminMode" class="admin-actions" @click.stop>
              <template v-if="item.status === 'pending'">
                <view class="admin-btn admin-btn--approve" @click="handleApprove(item)">通过</view>
                <view class="admin-btn admin-btn--reject" @click="handleReject(item)">拒绝</view>
              </template>
              <view v-else class="admin-btn admin-btn--withdraw" @click="handleWithdraw(item)">
                {{ item.status === 'approved' ? '撤回审批' : '撤回' }}
              </view>
            </view>
            <!-- 已通过：查看课程 -->
            <view v-if="item.status === 'approved' && item.courseId" class="view-course-row" @click.stop="goToCourse(item.courseId)">
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
      <view v-if="isAdmin && adminMode" class="fab-btn" @click="goToLogs">
        <text class="fab-icon">📑</text>
      </view>
      <view v-else class="fab-btn" @click="goToPropose">
        <text class="fab-icon">+</text>
      </view>
    </view>



    <!-- 拒绝弹窗 -->
    <RejectModal v-model:visible="showRejectModal" @confirm="handleRejectConfirm" />
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { onLoad, onShow } from '@dcloudio/uni-app';
import { http, useThemeStore } from '@/config';
import { useMenuButton } from '@/composables/useMenuButton';
import { useScrollDirection } from '@/composables/useScrollDirection';
import { DEFAULT_PAGE_SIZE } from '@/utils/constants';
import type { DtoFieldSuggestionVO } from '@/api/data-contracts';
import RejectModal from '@/components/common/RejectModal.vue';
import BackBtn from '@/components/common/BackBtn.vue';

const themeStore = useThemeStore();
const { menuButtonInfo, navBarHeight } = useMenuButton();
const headerHeight = computed(() => menuButtonInfo.bottom + 12);

// 滚动方向检测
const { isScrollingDown, onScroll: handleScrollDirection } = useScrollDirection(30)
const isFilterHidden = ref(false)

// 筛选条实际高度 = 上下 padding(12rpx*2) + 胶囊高度(56rpx)
const FILTER_BAR_HEIGHT = uni.upx2px(80);
// 目标可见留白：与搜索栏底部 padding(12px) 一致。
// 筛选栏自带的 12rpx 底部内边距已含在 FILTER_BAR_HEIGHT 中，需要扣除。
const FIRST_CARD_GAP = Math.max(0, 12 - uni.upx2px(12));
const contentPaddingTop = computed(() => {
  const filterHeight = isFilterHidden.value ? 0 : FILTER_BAR_HEIGHT;
  return (headerHeight.value + filterHeight + FIRST_CARD_GAP) + 'px';
});

const onScroll = (e: { detail?: { scrollTop?: number } }) => {
  const top = e.detail?.scrollTop ?? 0
  handleScrollDirection(e)
  if (top > 50) {
    isFilterHidden.value = isScrollingDown.value
  } else {
    isFilterHidden.value = false
  }
}

const sysInfo = uni.getSystemInfoSync();
const searchBarWrapperStyle = computed(() => {
  const gap = uni.upx2px(32);
  const paddingRight = (sysInfo.windowWidth - (menuButtonInfo.left || sysInfo.windowWidth - 97)) + gap;
  return {
    height: headerHeight.value + 'px',
    paddingTop: menuButtonInfo.top + 'px',
    paddingBottom: '12px',
    paddingLeft: '32rpx',
    paddingRight: paddingRight + 'px',
    boxSizing: 'border-box' as const,
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
const proposals = ref<any[]>([]);
const total = ref(0);

// 筛选
const openDropdown = ref('');
const showRejectModal = ref(false);
const rejectTargetId = ref('');

// 内联搜索（院系）
const deptKeyword = ref('');
const deptResults = ref<DtoFieldSuggestionVO[]>([]);
let deptTimer: ReturnType<typeof setTimeout> | null = null;

const campusOptions = ['普陀校区', '闵行校区', '滴水湖校区'];
const categoryOptions = ['通识必修', '通识选修', '专业必修', '专业选修', '公共基础', '实践环节'];
const statusOptions = [
  { label: '待审核', value: 'pending' as const },
  { label: '已通过', value: 'approved' as const },
  { label: '已拒绝', value: 'rejected' as const },
];

const filterForm = reactive({
  status: [] as string[],
  campus: [] as string[],
  department: [] as string[],
  category: [] as string[],
});

// ===== 管理员检测 =====
const detectAdmin = async () => {
  try {
    const res: any = await http.AuthController.authIsAdminList();
    isAdmin.value = !!(res.data?.data?.isAdmin ?? res.data?.isAdmin ?? false);
  } catch { isAdmin.value = false; }
  if (!isAdmin.value && uni.getStorageSync('meowpick_temp_admin')) isAdmin.value = true;
  if (isAdmin.value) {
    adminMode.value = uni.getStorageSync('meowpick_admin_mode') !== false;
  }
  // 普通用户默认只看 approved
  if (!isAdmin.value && filterForm.status.length === 0) {
    filterForm.status = ['approved'];
  }
};

// ===== 数据 =====
const mapProposal = (item: any) => {
  const course = item.course || item.finalCourse || {};
  const teachers = Array.isArray(course.teachers)
    ? course.teachers.map((t: any) => typeof t === 'string' ? t : t.name || '').join('、')
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
    contributor: item.showUsername !== false ? (item.userId || '匿名') : '匿名',
    reason: item.content || '',
    voteCount: item.likeCnt || 0,
    isVoted: !!item.like,
    createdAt: item.createdAt || '',
  };
};

const hasActiveFilters = computed(() =>
  filterForm.campus.length > 0 || filterForm.department.length > 0 || filterForm.category.length > 0 ||
  (isAdmin.value && filterForm.status.length > 0)
);

const fetchProposals = async (page = 1) => {
  if (loading.value && page > 1) return;
  loading.value = true;
  try {
    let res: any;
    if (hasActiveFilters.value || keyword.value.trim()) {
      // 有筛选条件或搜索关键词时用 suggest 接口
      res = await http.ProposalController.proposalSuggestList({
        keyword: keyword.value.trim() || undefined,
        status: filterForm.status.length ? filterForm.status : undefined,
        campus: filterForm.campus.length ? filterForm.campus : undefined,
        department: filterForm.department.length ? filterForm.department[0] : undefined,
        category: filterForm.category.length ? filterForm.category[0] : undefined,
        page,
        pageSize: DEFAULT_PAGE_SIZE,
      });
    } else {
      // 无筛选条件时用简单列表接口（后端自动按权限过滤）
      res = await http.ProposalController.proposalListList({
        page,
        pageSize: DEFAULT_PAGE_SIZE,
      });
    }
    const data = res.data?.data;
    const list = (data?.proposals ?? []) as any[];
    const mapped = list.filter(Boolean).map(mapProposal);
    if (page === 1) proposals.value = mapped;
    else proposals.value = [...proposals.value, ...mapped];
    total.value = data?.total ?? proposals.value.length;
    noMore.value = proposals.value.length >= total.value;
    currentPage.value = page;
  } catch (err) {
    console.error('[proposal] fetch error:', err);
    if (page === 1) uni.showToast({ title: '加载失败', icon: 'none' });
  } finally {
    loading.value = false;
  }
};

const doSearch = (reset = false) => {
  if (reset) { proposals.value = []; currentPage.value = 1; noMore.value = false; }
  fetchProposals(reset ? 1 : currentPage.value);
};

const loadMore = () => {
  if (!noMore.value && !loading.value) fetchProposals(currentPage.value + 1);
};

let searchTimer: ReturnType<typeof setTimeout> | null = null;
const onInputChange = () => {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => doSearch(true), 300);
};

const clearSearch = () => { keyword.value = ''; doSearch(true); };



// ===== 筛选 =====
const isDropdownOpen = computed(() => openDropdown.value !== '');

const toggleDropdown = (name: string) => {
  openDropdown.value = openDropdown.value === name ? '' : name;
};

const closeDropdown = () => { openDropdown.value = ''; };

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
  if (isAll || openDropdown.value === 'status') filterForm.status = isAdmin.value ? [] : ['approved'];
};

const applyFilters = () => {
  openDropdown.value = '';
  doSearch(true);
};

// ===== 内联搜索 =====
const searchField = async (keyword: string, field: 'department' | 'category') => {
  if (!keyword.trim()) return [];
  try {
    const res: any = await http.ProposalController.proposalFieldSuggestionsList({ keyword: keyword.trim(), field });
    return (res.data?.data?.suggestions ?? []) as DtoFieldSuggestionVO[];
  } catch { return []; }
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

// ===== 管理员操作 =====
const handleApprove = (item: any) => {
  uni.navigateTo({ url: `/pages/proposal/propose/propose?approveProposalId=${item.id}` });
};

const handleReject = (item: any) => {
  rejectTargetId.value = item.id;
  showRejectModal.value = true;
};

const handleRejectConfirm = async (reason: string) => {
  if (!rejectTargetId.value) return;
  try {
    const res: any = await http.ProposalController.proposalRejectCreate(rejectTargetId.value, { proposalId: rejectTargetId.value, reason });
    if (res.data?.code === 0 || res.data?.code === 200) {
      uni.showToast({ title: '已拒绝', icon: 'success' });
      doSearch(true);
    } else {
      uni.showToast({ title: res.data?.msg || '操作失败', icon: 'none' });
    }
  } catch { uni.showToast({ title: '拒绝失败', icon: 'none' }); }
  finally { rejectTargetId.value = ''; }
};

const handleWithdraw = async (item: any) => {
  const actionType = item.status === 'approved' ? 'approve' : item.status === 'rejected' ? 'reject' : 'delete';
  try {
    const res: any = await http.ProposalController.proposalRevokeCreate(item.id, { actionType });
    if (res.data?.code === 0 || res.data?.code === 200) {
      uni.showToast({ title: '已撤回', icon: 'success' });
      doSearch(true);
    } else {
      uni.showToast({ title: res.data?.msg || '操作失败', icon: 'none' });
    }
  } catch { uni.showToast({ title: '撤回失败', icon: 'none' }); }
};

// ===== 导航 =====
const statusLabel = (s: string) => ({ pending: '待审核', approved: '已通过', rejected: '已拒绝' }[s] || s);

const goToDetail = (item: any) => {
  const dataStr = encodeURIComponent(JSON.stringify({
    id: item.id,
    name: item.courseName,
    teacher: item.teachers,
    campus: item.campus,
    category: item.category,
    reason: item.reason,
    voteCount: item.voteCount,
    isVoted: item.isVoted,
    date: item.createdAt,
  }));
  uni.navigateTo({ url: `/pages/course/proposal-detail/index?data=${dataStr}` });
};
const goToCourse = (courseId: string) => {
  uni.navigateTo({ url: `/pages/course/index/index?id=${courseId}` });
};
const goToPropose = () => uni.navigateTo({ url: '/pages/proposal/propose/propose' });
const goToLogs = () => uni.navigateTo({ url: '/pages/proposal/log/log' });

// ===== 生命周期 =====
onLoad(async () => {
  await detectAdmin();
  doSearch(true);
});

onShow(() => {
  const tempAdmin = uni.getStorageSync('meowpick_temp_admin');
  if (tempAdmin && !isAdmin.value) {
    isAdmin.value = true;
    adminMode.value = uni.getStorageSync('meowpick_admin_mode') !== false;
  }
  if (isAdmin.value) adminMode.value = uni.getStorageSync('meowpick_admin_mode') !== false;
  if (proposals.value.length > 0) doSearch(true);
});
</script>

<style lang="scss" scoped src="./_style.scss" />
