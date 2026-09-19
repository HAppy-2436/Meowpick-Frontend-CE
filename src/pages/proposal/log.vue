<template>
  <view class="log-page" :class="themeStore.themeClass">
    <view class="log-header" :style="{ paddingTop: menuButtonInfo.top + 'px' }">
      <view
        class="header-row"
        :style="{
          height: contentHeight + 'px',
          paddingRight: headerRightPad + 'px'
        }"
      >
        <view
          class="header-back"
          :style="{ width: contentHeight + 'px', height: contentHeight + 'px' }"
        >
          <BackBtn />
        </view>

        <view class="switch-track">
          <view
            class="switch-thumb"
            :style="{ transform: `translateX(${currentIndex * 100}%)` }"
          />
          <view
            class="switch-item"
            :class="{ active: currentIndex === 0 }"
            hover-class="mwp-hover-sm"
            @click="switchTo(0)"
            >聚合展示</view
          >
          <view
            class="switch-item"
            :class="{ active: currentIndex === 1 }"
            hover-class="mwp-hover-sm"
            @click="switchTo(1)"
            >原始日志</view
          >
        </view>

        <view
          class="search-toggle"
          :class="{ on: panelOpen }"
          :style="{ width: contentHeight + 'px', height: contentHeight + 'px' }"
          hover-class="mwp-hover"
          @click="togglePanel"
        >
          <MwpIcon name="search" size="36rpx" />
        </view>
      </view>

      <view v-if="panelOpen" class="filter-mask" @click="togglePanel" />

      <view v-if="panelOpen" class="filter-panel">
        <view class="search-box">
          <MwpIcon name="search" size="34rpx" class="search-icon" />
          <input
            v-model="keyword"
            class="search-input"
            placeholder="搜索课程、操作者或理由"
            placeholder-class="search-placeholder"
            confirm-type="search"
          />
          <view
            v-if="keyword"
            class="search-clear"
            hover-class="mwp-hover"
            @click="keyword = ''"
          >
            <MwpIcon name="x" size="26rpx" />
          </view>
        </view>

        <view class="filter-row">
          <view
            class="filter-chip"
            :class="{
              active: typeFilter !== 'all',
              open: openDropdown === 'type'
            }"
            hover-class="mwp-hover"
            @click="toggleDropdown('type')"
          >
            <text class="chip-text">{{ typeChipText }}</text>
            <MwpIcon name="chevron-down" size="24rpx" class="chip-arrow" />
          </view>
          <view
            class="filter-chip"
            :class="{
              active: actionFilter.length > 0,
              open: openDropdown === 'action'
            }"
            hover-class="mwp-hover"
            @click="toggleDropdown('action')"
          >
            <text class="chip-text">{{ actionChipText }}</text>
            <MwpIcon name="chevron-down" size="24rpx" class="chip-arrow" />
          </view>
          <view
            v-if="filtersActive"
            class="filter-reset"
            hover-class="mwp-hover"
            @click="resetFilters"
            >重置</view
          >
        </view>

        <view v-if="openDropdown" class="filter-options">
          <view class="option-tags">
            <view
              v-for="opt in currentOptions"
              :key="opt.value"
              class="option-tag"
              :class="{ active: isOptionActive(opt.value) }"
              hover-class="mwp-hover"
              @click="toggleOption(opt.value)"
              >{{ opt.label }}</view
            >
          </view>
        </view>

        <text class="filter-hint"
          >筛选与搜索作用于已加载的记录，继续下滑会加载更多</text
        >
      </view>
    </view>

    <swiper
      class="log-swiper"
      :current="currentIndex"
      :duration="300"
      @change="onSwiperChange"
    >
      <swiper-item>
        <scroll-view
          scroll-y
          class="log-scroll"
          enhanced
          :show-scrollbar="false"
          @scrolltolower="loadMore"
        >
          <ProposalLogGroups
            :groups="groups"
            :loading="loading && logs.length === 0"
            :error="error"
            :no-more="noMore && !filtersActive"
            :filtered="filtersActive"
            @retry="reload"
            @proposal-click="goToProposal"
          />
        </scroll-view>
      </swiper-item>

      <swiper-item>
        <scroll-view
          scroll-y
          class="log-scroll"
          enhanced
          :show-scrollbar="false"
          @scrolltolower="loadMore"
        >
          <ProposalLogRaw
            :logs="filteredLogs"
            :loading="loading && logs.length === 0"
            :error="error"
            :no-more="noMore && !filtersActive"
            :filtered="filtersActive"
            @retry="reload"
            @proposal-click="goToProposal"
          />
        </scroll-view>
      </swiper-item>
    </swiper>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { http, useThemeStore } from '@/config';
import { useMenuButton } from '@/composables/useMenuButton';
import { useViewport } from '@/composables/useViewport';
import { ADMIN_LOG_PAGE_SIZE_DEFAULT } from '@/utils/constants';
import BackBtn from '@/components/common/BackBtn.vue';
import ProposalLogGroups from '@/components/proposal/ProposalLogGroups.vue';
import ProposalLogRaw from '@/components/proposal/ProposalLogRaw.vue';
import { actionTextOf, groupLogs, type LogItem } from '@/utils/proposal-log';

type TypeFilter = 'all' | 'proposal' | 'permission';

const TYPE_FILTERS: { label: string; value: TypeFilter }[] = [
  { label: '全部', value: 'all' },
  { label: '提案', value: 'proposal' },
  { label: '权限变更', value: 'permission' }
];

const ACTION_FILTERS = [
  { label: '发起提案', value: 'CREATE' },
  { label: '通过', value: 'APPROVE' },
  { label: '拒绝', value: 'REJECT' },
  { label: '撤回', value: 'DELETE' },
  { label: '更新', value: 'UPDATE' },
  { label: '授权管理员', value: 'GRANT_ADMIN' },
  { label: '撤销管理员', value: 'REVOKE_ADMIN' }
];

const PROPOSAL_ACTIONS = ['CREATE', 'APPROVE', 'REJECT', 'DELETE', 'UPDATE'];
const PERMISSION_ACTIONS = ['GRANT_ADMIN', 'REVOKE_ADMIN'];

const themeStore = useThemeStore();
const { menuButtonInfo, contentHeight } = useMenuButton();
const viewport = useViewport();

const currentIndex = ref(0);

const panelOpen = ref(false);
const openDropdown = ref<'' | 'type' | 'action'>('');
const typeFilter = ref<TypeFilter>('all');
const actionFilter = ref<string[]>([]);
const keyword = ref('');

const logs = ref<LogItem[]>([]);
const loading = ref(false);
const error = ref(false);
const noMore = ref(false);
const page = ref(1);

// 与 .header-row 的 gap（$space-6）保持一致，保证搜索按钮到分栏胶囊、系统胶囊的间距相同
const HEADER_GAP_RPX = 24;

const headerRightPad = computed(() => {
  const gap = (viewport.width / 750) * HEADER_GAP_RPX;
  if (viewport.hasCapsule) {
    const left = menuButtonInfo.value.left || viewport.width - 97;
    return Math.max(viewport.width - left + gap, gap);
  }
  return gap;
});

const filtersActive = computed(
  () =>
    typeFilter.value !== 'all' ||
    actionFilter.value.length > 0 ||
    keyword.value.trim() !== ''
);

const matchKeyword = (log: LogItem, kw: string) => {
  const text = [
    log.proposalSnapshot?.courseName,
    log.proposalSnapshot?.title,
    log.proposalSnapshot?.department,
    log.proposalSnapshot?.category,
    log.operatorName,
    log.operatorId,
    log.proposalId,
    log.details?.reason,
    log.details?.contribution,
    actionTextOf(log.actionType)
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return text.includes(kw);
};

const filteredLogs = computed<LogItem[]>(() => {
  const kw = keyword.value.trim().toLowerCase();
  return logs.value.filter((log) => {
    const action = log.actionType || '';
    if (typeFilter.value === 'proposal' && !PROPOSAL_ACTIONS.includes(action))
      return false;
    if (
      typeFilter.value === 'permission' &&
      !PERMISSION_ACTIONS.includes(action)
    )
      return false;
    if (actionFilter.value.length && !actionFilter.value.includes(action))
      return false;
    if (kw && !matchKeyword(log, kw)) return false;
    return true;
  });
});

const groups = computed(() => groupLogs(filteredLogs.value));

const typeChipText = computed(
  () => TYPE_FILTERS.find((t) => t.value === typeFilter.value)?.label || '类型'
);
const actionChipText = computed(() => {
  if (!actionFilter.value.length) return '操作';
  if (actionFilter.value.length === 1) {
    return (
      ACTION_FILTERS.find((a) => a.value === actionFilter.value[0])?.label ||
      '操作'
    );
  }
  return `${actionFilter.value.length} 项操作`;
});
const currentOptions = computed(() =>
  openDropdown.value === 'type' ? TYPE_FILTERS : ACTION_FILTERS
);

const togglePanel = () => {
  panelOpen.value = !panelOpen.value;
  if (!panelOpen.value) openDropdown.value = '';
};

const toggleDropdown = (name: 'type' | 'action') => {
  openDropdown.value = openDropdown.value === name ? '' : name;
};

const isOptionActive = (value: string) => {
  if (openDropdown.value === 'type') return typeFilter.value === value;
  return actionFilter.value.includes(value);
};

const toggleOption = (value: string) => {
  if (openDropdown.value === 'type') {
    typeFilter.value = value as TypeFilter;
    return;
  }
  const idx = actionFilter.value.indexOf(value);
  if (idx > -1) actionFilter.value.splice(idx, 1);
  else actionFilter.value.push(value);
};

const resetFilters = () => {
  typeFilter.value = 'all';
  actionFilter.value = [];
  keyword.value = '';
};

const fetchLogs = async (p = 1) => {
  if (loading.value && p > 1) return;
  loading.value = true;
  error.value = false;
  try {
    const res = await http.ChangeLogController.changelogProposalTimelineList(
      {},
      { page: p, pageSize: ADMIN_LOG_PAGE_SIZE_DEFAULT }
    );
    const data = res.data?.data;
    const list = (data?.logs ?? []) as LogItem[];
    if (p === 1) logs.value = list;
    else logs.value = [...logs.value, ...list];
    const total = data?.total ?? logs.value.length;
    noMore.value = logs.value.length >= total;
    page.value = p;
  } catch {
    if (p === 1) error.value = true;
  } finally {
    loading.value = false;
  }
};

const reload = () => fetchLogs(1);
const loadMore = () => {
  if (!noMore.value && !loading.value) fetchLogs(page.value + 1);
};

const switchTo = (index: number) => {
  currentIndex.value = index;
};

const onSwiperChange = (e: { detail: { current?: number } }) => {
  currentIndex.value = e.detail.current ?? 0;
};

const goToProposal = (id?: string) => {
  if (!id) return;
  uni.navigateTo({ url: `/pages/course/proposal-detail?id=${id}` });
};

onLoad(() => {
  reload();
});
</script>

<style lang="scss" scoped src="./log.scss" />
