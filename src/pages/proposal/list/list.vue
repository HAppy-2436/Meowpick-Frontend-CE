<template>
  <view class="proposal-list-page" :class="themeStore.themeClass">

    <TopNavBar :title="navTitle" :subtitle="navSubtitle" @back="goBack" />

    <view :style="{ height: navBarHeight + 'px' }"></view>

    <!-- Tab 切换 -->
    <view class="tabs">
      <view
        v-for="(tab, idx) in tabs"
        :key="tab.key"
        class="tab-item mwp-pressable"
        :class="{ active: activeTab === tab.key }"
        @click="switchTab(tab.key)"
      >
        <text class="tab-text">{{ tab.label }}</text>
        <view v-if="tab.badge && tab.badge > 0" class="tab-badge">
          <text>{{ tab.badge > 99 ? '99+' : tab.badge }}</text>
        </view>
      </view>
      <view
        class="tab-indicator"
        :style="{ left: `${tabIndicatorLeft}%` }"
      ></view>
    </view>

    <!-- Tab: 提案列表 -->
    <scroll-view
      v-if="activeTab === 'list'"
      scroll-y
      class="list-scroll"
      @scrolltolower="onScrollBottom"
    >
      <view class="search-bar">
        <view class="search-input-box">
          <text class="search-icon">🔍</text>
          <input
            v-model="keyword"
            class="search-input"
            type="text"
            placeholder="搜索课程或教师"
            placeholder-class="mwp-placeholder"
            confirm-type="search"
            @input="handleSearchDebounce"
            @confirm="handleSearchConfirm"
          />
          <view v-if="keyword" class="clear-btn mwp-pressable" @click="clearSearch">
            <text>✕</text>
          </view>
        </view>
        <view
          class="filter-btn mwp-pressable"
          :class="{ active: isFiltered }"
          @click="showFilterModal = true"
        >
          <text class="filter-icon">⚙</text>
          <text class="filter-text">筛选</text>
        </view>
      </view>

      <view class="list-container">
        <view v-if="loading && proposals.length === 0" class="loading-state">
          <SkeletonCard :count="3" />
        </view>

        <EmptyState
          v-else-if="error"
          title="加载失败"
          desc="网络或服务异常，请稍后重试"
          emoji="😿"
          tone="danger"
        >
          <template #action>
            <view class="retry-btn mwp-pressable" @click="reload">
              <text>重试</text>
            </view>
          </template>
        </EmptyState>

        <EmptyState
          v-else-if="proposals.length === 0"
          :title="isAdmin ? '暂无提案' : '快来发起第一个吧～'"
          desc="所有用户提交的提案都会出现在这里"
          emoji="🐾"
        >
          <template #action>
            <view class="empty-btn mwp-pressable" @click="goToPropose">
              <text>发起提案</text>
            </view>
          </template>
        </EmptyState>

        <view v-else>
          <view
            v-for="(item, idx) in proposals"
            :key="item.id"
            class="proposal-card mwp-stagger-item"
            :class="`status-${item.status}`"
            :style="{ animationDelay: `${Math.min(idx * 50, 400)}ms` }"
            @click="goToDetail(item)"
          >
            <view class="card-header">
              <text class="course-name">{{ item.courseName }}</text>
              <StatusBadge
                v-if="item.status"
                :status="item.status"
                pill
              />
            </view>

            <view class="card-body">
              <view class="info-row" v-if="item.campus">
                <text class="info-label">校区</text>
                <text class="info-value">{{ item.campus }}</text>
              </view>
              <view class="info-row" v-if="item.department">
                <text class="info-label">院系</text>
                <text class="info-value">{{ item.department }}</text>
              </view>
              <view class="info-row" v-if="item.category">
                <text class="info-label">分类</text>
                <text class="info-value">{{ item.category }}</text>
              </view>
              <view class="info-row" v-if="item.teachers">
                <text class="info-label">教师</text>
                <text class="info-value">{{ item.teachers }}</text>
              </view>
              <view class="contributor-row" v-if="item.contributor">
                <text class="contributor-text">贡献者：{{ item.contributor }}</text>
              </view>
            </view>

            <!-- 已通过提案：查看课程按钮 -->
            <view v-if="item.status === 'approved' && item.courseId" class="view-course-row" @click.stop="goToCourse(item.courseId)">
              <text class="view-course-text">查看课程</text>
              <text class="view-course-arrow">→</text>
            </view>

            <view v-if="isAdmin" class="admin-actions" @click.stop>
              <template v-if="item.status === 'pending'">
                <view class="admin-btn admin-btn--approve mwp-pressable" @click="handleApprove(item)">
                  <text>通过</text>
                </view>
                <view class="admin-btn admin-btn--reject mwp-pressable" @click="handleReject(item)">
                  <text>拒绝</text>
                </view>
              </template>
              <view v-else class="admin-btn admin-btn--withdraw mwp-pressable" @click="handleWithdraw(item)">
                <text>{{ item.status === 'approved' ? '撤回审批' : '撤回' }}</text>
              </view>
            </view>
          </view>

          <view v-if="noMore && proposals.length" class="no-more">
            <text class="no-more-text">没有更多了</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- Tab: 操作记录（仅管理员） -->
    <scroll-view
      v-else-if="activeTab === 'logs' && isAdmin"
      scroll-y
      class="list-scroll"
      @scrolltolower="loadMoreLogs"
    >
      <view class="logs-container">
        <ProposalLogTimeline
          :logs="logs"
          :loading="logsLoading && logs.length === 0"
          :error="logsError"
          :no-more="logsNoMore"
          @retry="reloadLogs"
          @proposal-click="goToProposalDetail"
        />
      </view>
    </scroll-view>

    <!-- Tab: 我的提案 -->
    <scroll-view
      v-else-if="activeTab === 'mine'"
      scroll-y
      class="list-scroll"
    >
      <view class="my-proposals-container">
        <SkeletonCard v-if="myProposalsLoading && myProposals.length === 0" :count="2" />

        <EmptyState
          v-else-if="myProposalsError"
          title="加载失败"
          desc="网络或服务异常，请稍后重试"
          emoji="😿"
          tone="danger"
        >
          <template #action>
            <view class="empty-btn mwp-pressable" @click="loadMyProposals">
              <text>重试</text>
            </view>
          </template>
        </EmptyState>

        <EmptyState
          v-else-if="myProposals.length === 0"
          title="你还没发起过提案"
          emoji="📝"
        >
          <template #action>
            <view class="empty-btn mwp-pressable" @click="goToPropose">
              <text>发起提案</text>
            </view>
          </template>
        </EmptyState>

        <view v-else class="my-proposal-list">
          <view
            v-for="(item, idx) in myProposals"
            :key="item.id"
            class="proposal-card mwp-stagger-item"
            :class="`status-${item.status}`"
            :style="{ animationDelay: `${Math.min(idx * 50, 300)}ms` }"
            @click="goToDetail(item)"
          >
            <view class="card-header">
              <text class="course-name">{{ item.courseName }}</text>
              <StatusBadge v-if="item.status" :status="item.status" pill />
            </view>
            <view v-if="item.reviewTime" class="review-time">
              <text class="review-time-label">
                {{ item.status === 'approved' ? '通过时间' : (item.status === 'rejected' ? '拒绝时间' : '提交时间') }}：
              </text>
              <text class="review-time-value">{{ item.reviewTime }}</text>
            </view>
            <view v-if="item.rejectReason && item.status === 'rejected'" class="reject-reason">
              <text class="reject-reason-label">拒绝原因：</text>
              <text class="reject-reason-content">{{ item.rejectReason }}</text>
            </view>
            <view class="card-body">
              <view class="info-row" v-if="item.department">
                <text class="info-label">院系</text>
                <text class="info-value">{{ item.department }}</text>
              </view>
              <view class="info-row" v-if="item.teachers">
                <text class="info-label">教师</text>
                <text class="info-value">{{ item.teachers }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 浮动操作按钮 -->
    <view class="fab-group">
      <view v-if="isAdmin && adminMode" class="fab-btn fab-btn--log mwp-pressable" @click="goToLogs">
        <text class="fab-icon">📑</text>
      </view>
      <view class="fab-btn fab-btn--add mwp-pressable" @click="goToPropose">
        <text class="fab-icon">+</text>
      </view>
    </view>

    <!-- 筛选弹窗 -->
    <view v-if="showFilterModal" class="filter-modal" @click="showFilterModal = false">
      <view class="filter-modal__sheet" @click.stop>
        <view class="filter-modal__header">
          <text class="filter-modal__title">筛选条件</text>
          <view class="filter-modal__close mwp-pressable" @click="showFilterModal = false">×</view>
        </view>

        <view class="filter-modal__body">
          <view class="filter-section">
            <text class="filter-label">提案状态 <text class="filter-required">(多选)</text></text>
            <view class="tags-group">
              <view
                class="tag-item mwp-pressable"
                v-for="status in statusOptions"
                :key="status.value"
                :class="{ active: filterForm.status.includes(status.value) }"
                @click="toggleStatus(status.value)"
              >
                {{ status.label }}
              </view>
            </view>
          </view>

          <view class="filter-section">
            <text class="filter-label">校区 <text class="filter-required">(多选)</text></text>
            <view class="tags-group">
              <view
                class="tag-item mwp-pressable"
                v-for="campus in campusOptions"
                :key="campus"
                :class="{ active: filterForm.campus.includes(campus) }"
                @click="toggleCampus(campus)"
              >
                {{ campus }}
              </view>
            </view>
          </view>

          <view class="filter-section">
            <text class="filter-label">开课院系</text>
            <view class="form-row mwp-pressable" @click="openDeptSearch">
              <text class="form-row-display" :class="{ 'is-empty': !filterForm.department }">
                {{ filterForm.department || '请输入开课院系' }}
              </text>
              <text class="arrow">›</text>
            </view>
          </view>

          <view class="filter-section">
            <text class="filter-label">课程分类</text>
            <view class="form-row mwp-pressable" @click="openCategorySearch">
              <text class="form-row-display" :class="{ 'is-empty': !filterForm.category }">
                {{ filterForm.category || '请输入课程分类' }}
              </text>
              <text class="arrow">›</text>
            </view>
          </view>
        </view>

        <view class="filter-modal__footer">
          <view class="filter-modal__btn filter-modal__btn--ghost mwp-pressable" @click="resetFilter">
            <text>重置</text>
          </view>
          <view class="filter-modal__btn filter-modal__btn--primary mwp-pressable" @click="applyFilter">
            <text>确定</text>
          </view>
        </view>
      </view>
    </view>

    <SearchModal
      v-model:visible="showSearchModal"
      :title="modalTitle"
      :placeholder="searchPlaceholder"
      :field="currentField"
      :allow-add="true"
      @select="handleSearchSelect"
    />

    <RejectModal v-model:visible="showRejectModal" @confirm="handleRejectConfirm" />
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { onLoad, onShow } from '@dcloudio/uni-app';
import TopNavBar from '@/components/common/TopNavBar.vue';
import SearchModal from '@/components/common/SearchModal.vue';
import RejectModal from '@/components/common/RejectModal.vue';
import ProposalLogTimeline from '@/components/proposal/ProposalLogTimeline.vue';
import { http, useThemeStore } from '@/config';
import { useMenuButton } from '@/composables/useMenuButton';
import { DEFAULT_PAGE_SIZE } from '@/utils/constants';
import type { FieldSuggestionVO, DtoProposalTimelineLogVO } from '@/api/data-contracts';

const themeStore = useThemeStore();
const { navBarHeight } = useMenuButton();

interface Proposal {
  id: string;
  courseName: string;
  campus?: string;
  department?: string;
  category?: string;
  teachers?: string;
  status?: 'pending' | 'approved' | 'rejected';
  rejectReason?: string;
  reviewTime?: string;
  courseId?: string;
}

interface MyProposal extends Proposal {}

type TabKey = 'list' | 'logs' | 'mine';

const isAdmin = ref(false);
const adminMode = ref(true);
const activeTab = ref<TabKey>('list');

const tabs = computed<Array<{ key: TabKey; label: string; badge?: number }>>(() => {
  const list: Array<{ key: TabKey; label: string; badge?: number }> = [
    { key: 'list', label: isAdmin.value ? '全部提案' : '提议广场', badge: total.value || undefined },
  ];
  if (isAdmin.value) list.push({ key: 'logs', label: '操作记录' });
  list.push({ key: 'mine', label: '我的提案', badge: myProposals.value.length || undefined });
  return list;
});

const tabIndicatorLeft = computed(() => {
  const idx = tabs.value.findIndex((t) => t.key === activeTab.value);
  const n = tabs.value.length;
  if (n === 0) return 0;
  const step = 100 / n;
  return step * idx + step / 2;
});

const navTitle = computed(() => {
  switch (activeTab.value) {
    case 'logs': return '操作记录';
    case 'mine': return '我的提案';
    default: return isAdmin.value ? '提案管理' : '提议广场';
  }
});

const navSubtitle = computed(() => {
  switch (activeTab.value) {
    case 'logs': return `${logs.value.length} 条记录`;
    case 'mine': return `${myProposals.value.length} 条`;
    default:
      return isAdmin.value
        ? `共 ${total.value} 条`
        : `${proposals.value.length} 个已通过提议`;
  }
});

const switchTab = (key: TabKey) => {
  activeTab.value = key;
  if (key === 'logs' && logs.value.length === 0) reloadLogs();
  if (key === 'mine' && myProposals.value.length === 0) loadMyProposals();
};

const keyword = ref('');
const proposals = ref<Proposal[]>([]);
const total = ref(0);
const loading = ref(false);
const error = ref(false);
const noMore = ref(false);
const currentPage = ref(0);

const showFilterModal = ref(false);
const showSearchModal = ref(false);
const showRejectModal = ref(false);
const rejectTargetId = ref('');
const currentField = ref<'department' | 'category' | 'campus' | 'courseName' | 'courseCode' | 'teacherName'>('department');
let searchTimer: ReturnType<typeof setTimeout> | null = null;

const statusOptions = [
  { label: '待审核', value: 'pending' as const },
  { label: '已通过', value: 'approved' as const },
  { label: '已拒绝', value: 'rejected' as const },
];
const campusOptions = ['普陀校区', '闵行校区', '滴水湖校区'];

// 关键修复：管理员默认看全部状态，普通用户默认看 approved
const filterForm = reactive({
  status: [] as Array<'pending' | 'approved' | 'rejected'>,
  campus: [] as string[],
  department: '',
  category: '',
});

const isFiltered = computed(
  () =>
    filterForm.status.length > 0 ||
    filterForm.campus.length > 0 ||
    !!filterForm.department ||
    !!filterForm.category
);

const modalTitle = computed(() => {
  const titles: Record<string, string> = {
    department: '选择开课院系',
    category: '选择课程分类',
  };
  return titles[currentField.value] || '搜索';
});

const searchPlaceholder = computed(() => {
  const placeholders: Record<string, string> = {
    department: '请输入开课院系',
    category: '请输入课程分类',
  };
  return placeholders[currentField.value] || '请输入关键词';
});

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
    const saved = uni.getStorageSync('meowpick_admin_mode');
    adminMode.value = saved !== false;
  }
  // 关键修复：管理员默认看到全部状态（不传 status 即全部）
  // 普通用户默认看 approved
  if (!isAdmin.value && filterForm.status.length === 0) {
    filterForm.status = ['approved'];
  }
};

const mapProposalItem = (item: any): Proposal => {
  const course = item.course || item.finalCourse || {};
  const teachers = Array.isArray(course.teachers)
    ? course.teachers.map((t: any) => (typeof t === 'string' ? t : t.name || '')).join('、')
    : '';
  return {
    id: item.id || '',
    courseName: item.title || course.name || '未知课程',
    campus: Array.isArray(course.campuses) ? course.campuses.join('、') : '',
    department: course.department || '',
    teachers,
    category: course.category || '',
    status: item.status || 'pending',
    courseId: course.id || '',
  };
};

const fetchProposals = async (page: number = 1) => {
  if (loading.value && page > 1) return;
  loading.value = true;
  error.value = false;
  try {
    const res: any = await http.ProposalController.proposalFilterList({
      // 关键修复：管理员不传 status = 全部状态
      status: isAdmin.value && filterForm.status.length === 0
        ? undefined
        : filterForm.status,
      campus: filterForm.campus,
      department: filterForm.department || undefined,
      category: filterForm.category || undefined,
      page,
      pageSize: DEFAULT_PAGE_SIZE,
    });
    const data = res.data?.data;
    const list = (data?.proposals ?? data?.data?.proposals ?? []) as any[];
    const mapped = list.filter((i) => i).map(mapProposalItem);
    if (page === 1) proposals.value = mapped;
    else proposals.value = [...proposals.value, ...mapped];
    total.value = data?.total ?? mapped.length;
    noMore.value = proposals.value.length >= total.value;
    currentPage.value = page;
  } catch (err) {
    console.error('[proposal-list] fetch error:', err);
    if (page === 1) {
      error.value = true;
      uni.showToast({ title: '加载失败，请重试', icon: 'none' });
    }
  } finally {
    loading.value = false;
  }
};

const reload = () => fetchProposals(1);

const onScrollBottom = () => {
  if (!noMore.value && !loading.value) fetchProposals(currentPage.value + 1);
};

const handleSearchDebounce = () => {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    if (keyword.value.trim()) reload();
    else if (proposals.value.length === 0) reload();
  }, 300);
};

const handleSearchConfirm = () => reload();
const clearSearch = () => { keyword.value = ''; reload(); };

const toggleStatus = (value: 'pending' | 'approved' | 'rejected') => {
  const idx = filterForm.status.indexOf(value);
  if (idx > -1) filterForm.status.splice(idx, 1);
  else filterForm.status.push(value);
};

const toggleCampus = (campus: string) => {
  const idx = filterForm.campus.indexOf(campus);
  if (idx > -1) filterForm.campus.splice(idx, 1);
  else filterForm.campus.push(campus);
};

const resetFilter = () => {
  // 重置为初始状态（管理员全选 / 普通用户 approved）
  filterForm.status = isAdmin.value ? [] : ['approved'];
  filterForm.campus = [];
  filterForm.department = '';
  filterForm.category = '';
};

const applyFilter = () => { showFilterModal.value = false; reload(); };

const openDeptSearch = () => { currentField.value = 'department'; showSearchModal.value = true; };
const openCategorySearch = () => { currentField.value = 'category'; showSearchModal.value = true; };

const handleSearchSelect = (item: FieldSuggestionVO) => {
  const value = item.value || item.label || '';
  if (currentField.value === 'department') filterForm.department = value;
  else if (currentField.value === 'category') filterForm.category = value;
};

const goToDetail = (item: Proposal) => {
  uni.navigateTo({ url: `/pages/course/proposal-detail/index?id=${item.id}` });
};

const goToCourse = (courseId: string) => {
  uni.navigateTo({ url: `/pages/course/index/index?id=${courseId}` });
};

const goToPropose = () => uni.navigateTo({ url: '/pages/proposal/propose/propose' });
const goToLogs = () => {
  if (activeTab.value === 'logs') return;
  activeTab.value = 'logs';
  fetchLogs(1);
};
const goToProposalDetail = (id?: string) => {
  if (!id) return;
  uni.navigateTo({ url: `/pages/course/proposal-detail/index?id=${id}` });
};

const goBack = () => uni.navigateBack();

const handleApprove = (item: Proposal) => {
  uni.navigateTo({ url: `/pages/proposal/propose/propose?approveProposalId=${item.id}` });
};

const handleReject = (item: Proposal) => {
  rejectTargetId.value = item.id;
  showRejectModal.value = true;
};

const handleRejectConfirm = async (reason: string) => {
  const proposalId = rejectTargetId.value;
  if (!proposalId) return;
  try {
    const res: any = await http.ProposalController.proposalRejectCreate(proposalId, { proposalId, reason });
    const code = res.data?.code;
    if (code === 0 || code === 200) {
      uni.showToast({ title: '已拒绝', icon: 'success' });
      reload();
    } else {
      uni.showToast({ title: res.data?.msg || '操作失败', icon: 'none' });
    }
  } catch (err) {
    console.error('[proposal-list] reject error:', err);
    uni.showToast({ title: '拒绝失败', icon: 'none' });
  } finally {
    rejectTargetId.value = '';
  }
};

const handleWithdraw = async (item: Proposal) => {
  const actionType =
    item.status === 'approved' ? 'approve' :
    item.status === 'rejected' ? 'reject' :
    'delete';
  try {
    const res: any = await http.ProposalController.proposalRevokeCreate(item.id, { actionType });
    const code = res.data?.code;
    if (code === 0 || code === 200) {
      uni.showToast({ title: '已撤回', icon: 'success' });
      reload();
    } else {
      uni.showToast({ title: res.data?.msg || '操作失败', icon: 'none' });
    }
  } catch (err) {
    console.error('[proposal-list] withdraw error:', err);
    uni.showToast({ title: '撤回失败', icon: 'none' });
  }
};

const logs = ref<DtoProposalTimelineLogVO[]>([]);
const logsLoading = ref(false);
const logsError = ref(false);
const logsNoMore = ref(false);
const logsPage = ref(1);

const fetchLogs = async (page: number = 1) => {
  if (logsLoading.value && page > 1) return;
  logsLoading.value = true;
  logsError.value = false;
  try {
    const res: any = await http.ProposalLogsController.changelogProposalTimelineList({ page, pageSize: 20 });
    const data = res.data?.data;
    const list = (data?.logs ?? data?.data?.logs ?? []) as DtoProposalTimelineLogVO[];
    if (page === 1) logs.value = list;
    else logs.value = [...logs.value, ...list];
    const total = data?.total ?? logs.value.length;
    logsNoMore.value = logs.value.length >= total;
    logsPage.value = page;
  } catch (err) {
    if (page === 1) {
      logsError.value = true;
      uni.showToast({ title: '加载失败', icon: 'none' });
    }
  } finally {
    logsLoading.value = false;
  }
};

const reloadLogs = () => fetchLogs(1);
const loadMoreLogs = () => {
  if (!logsNoMore.value && !logsLoading.value) fetchLogs(logsPage.value + 1);
};

const myProposals = ref<MyProposal[]>([]);
const myProposalsLoading = ref(false);
const myProposalsError = ref(false);

const mapMyProposal = (item: any): MyProposal => {
  const course = item.course || item.finalCourse || {};
  const teachers = Array.isArray(course.teachers)
    ? course.teachers.map((t: any) => (typeof t === 'string' ? t : t.name || '')).join('、')
    : '';
  return {
    id: item.id || '',
    courseName: item.title || course.name || '未知课程',
    department: course.department || '',
    teachers,
    status: item.status || 'pending',
    rejectReason: item.rejectReason,
    reviewTime: item.updatedAt || item.createdAt,
    courseId: course.id || '',
  };
};

const loadMyProposals = async () => {
  myProposalsLoading.value = true;
  myProposalsError.value = false;
  try {
    const res: any = await http.ProposalController.proposalHistoryList({ page: 1, pageSize: 50 });
    const data = res.data?.data;
    const list = (data?.proposals ?? data?.data?.proposals ?? []) as any[];
    myProposals.value = list.filter((i) => i).map(mapMyProposal);
  } catch (err) {
    console.error('[my-proposals] load error:', err);
    myProposalsError.value = true;
    uni.showToast({ title: '加载失败，请重试', icon: 'none' });
  } finally {
    myProposalsLoading.value = false;
  }
};

onLoad(async (options) => {
  await detectAdmin();
  reload();
  loadMyProposals();
  // 支持 ?tab=logs 直接跳转日志 Tab
  if (options?.tab === 'logs' && isAdmin.value) {
    activeTab.value = 'logs';
    fetchLogs(1);
  }
});

onShow(() => {
  // 同步管理员状态（可能通过临时验证获得/失去）
  const tempAdmin = uni.getStorageSync('meowpick_temp_admin');
  if (tempAdmin && !isAdmin.value) {
    isAdmin.value = true;
    const saved = uni.getStorageSync('meowpick_admin_mode');
    adminMode.value = saved !== false;
  }
  if (isAdmin.value) {
    const saved = uni.getStorageSync('meowpick_admin_mode');
    adminMode.value = saved !== false;
  }
  if (proposals.value.length > 0) reload();
  if (activeTab.value === 'mine' && myProposals.value.length > 0) loadMyProposals();
  if (activeTab.value === 'logs' && logs.value.length > 0) reloadLogs();
});
</script>

<style lang="scss" scoped src="./_style.scss" />