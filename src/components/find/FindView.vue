<template>
  <view class="find-container" :class="themeStore.themeClass">
    <!-- 顶部动态 Header -->
    <view
      class="dynamic-header"
      :class="{ 'is-collapsed': isCollapsed }"
      :style="{ height: headerHeight + 'px' }"
    >
      <!-- 搜索功能区容器 -->
      <view class="search-bar-wrapper" :style="searchBarWrapperStyle">
        <!-- 左侧：返回按钮 -->
        <view
          class="nav-back-btn"
          :style="{
            height: contentHeight + 'px',
            width: contentHeight + 'px'
          }"
          hover-class="mwp-hover"
          :hover-start-time="0"
          :hover-stay-time="0"
          @click="goBack"
        >
          <BackBtn :intercept="true" />
        </view>

        <!-- 中间：搜索框（高度 = 胶囊高度，见 useMenuButton.contentHeight）-->
        <view
          class="search-input-box"
          :class="{ 'is-focused': isFocused }"
          :style="{ height: contentHeight + 'px' }"
        >
          <MwpIcon name="search" size="34rpx" class="search-icon" />
          <input
            v-model="searchText"
            class="search-input"
            :placeholder="placeHolder"
            :focus="!isResultMode"
            confirm-type="search"
            placeholder-class="mwp-placeholder"
            @focus="onInputFocus"
            @blur="onInputBlur"
            @input="onInputChange"
            @confirm="handleSearch"
          />
          <view
            v-if="searchText"
            class="clear-icon"
            hover-class="mwp-hover"
            :hover-start-time="0"
            :hover-stay-time="0"
            @click="clearSearch"
          >
            <MwpIcon name="x" size="26rpx" class="clear-text" />
          </view>
          <!-- 搜索框内部右侧：直接点击搜索（手机端聚焦时显示；PC 端改用右侧独立常驻按钮） -->
          <view
            v-if="isFocused && viewport.hasCapsule"
            class="search-submit"
            hover-class="mwp-hover"
            :hover-start-time="0"
            :hover-stay-time="0"
            @click="handleSearch"
          >
            <text>搜索</text>
          </view>
        </view>

        <!-- PC 端：独立常驻的搜索按钮（无系统胶囊时，搜索框右端为其让位） -->
        <MwpButton
          v-if="!viewport.hasCapsule"
          class="search-pc-btn"
          tone="brand"
          size="md"
          @click="handleSearch"
          >搜索</MwpButton
        >
      </view>
    </view>

    <!-- 模糊搜索建议：紧贴输入框下方的浮层 -->
    <view
      v-if="searchText && showSuggest && (isLoading || suggestList.length)"
      class="suggest-panel"
      :style="{ top: headerHeight + 'px' }"
    >
      <!-- 等待建议返回时先显示加载态，避免空白白条闪现 -->
      <view
        v-if="isLoading && !suggestList.length"
        class="suggest-panel__loading"
      >
        <view class="suggest-panel__spinner" />
        <text class="suggest-panel__loading-text">请稍候...</text>
      </view>

      <template v-else>
        <view
          v-for="(item, index) in suggestList"
          :key="item.id || index"
          class="suggest-panel__item mwp-stagger-item"
          :style="{ animationDelay: `${Math.min(index * 60, 300)}ms` }"
          hover-class="mwp-hover"
          :hover-start-time="0"
          :hover-stay-time="0"
          @click="handleSuggestClick(item)"
        >
          <text class="suggest-panel__label">{{ item.name }}</text>
          <text v-if="suggestLabel(item.type)" class="suggest-panel__hint">
            {{ `（${suggestLabel(item.type)}）` }}
          </text>
        </view>
      </template>
    </view>

    <!-- 筛选条（仅结果模式，移至 dynamic-header 外部） -->
    <view
      v-if="isResultMode"
      class="filter-bar-wrapper"
      :class="{ 'is-hidden': isFilterHidden }"
      :style="{ top: headerHeight + 'px' }"
    >
      <view class="filter-chip-bar">
        <view
          class="filter-chip"
          style="flex: 1 1 auto; min-width: 0"
          :class="{
            'has-value': filterState.campuses.length,
            'is-open': openDropdown === 'campus' || openDropdown === 'all'
          }"
          hover-class="mwp-hover"
          :hover-start-time="0"
          :hover-stay-time="0"
          @click="toggleDropdown('campus')"
        >
          <text class="chip-text">{{
            filterState.campuses.length
              ? filterState.campuses.join('+')
              : '校区'
          }}</text>
          <MwpIcon name="chevron-down" size="24rpx" class="chip-arrow" />
        </view>
        <view
          class="filter-chip"
          style="flex: 1 1 auto; min-width: 0"
          :class="{
            'has-value': filterState.departments.length,
            'is-open': openDropdown === 'department' || openDropdown === 'all'
          }"
          hover-class="mwp-hover"
          :hover-start-time="0"
          :hover-stay-time="0"
          @click="toggleDropdown('department')"
        >
          <text class="chip-text">{{
            filterState.departments.length
              ? filterState.departments.length > 1
                ? filterState.departments.length + '个院系'
                : filterState.departments[0]
              : '院系'
          }}</text>
          <MwpIcon name="chevron-down" size="24rpx" class="chip-arrow" />
        </view>
        <view
          class="filter-chip"
          style="flex: 1 1 auto; min-width: 0"
          :class="{
            'has-value': filterState.categories.length,
            'is-open': openDropdown === 'category' || openDropdown === 'all'
          }"
          hover-class="mwp-hover"
          :hover-start-time="0"
          :hover-stay-time="0"
          @click="toggleDropdown('category')"
        >
          <text class="chip-text">{{
            filterState.categories.length
              ? filterState.categories.length > 1
                ? filterState.categories.length + '个分类'
                : filterState.categories[0]
              : '分类'
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

      <!-- 下拉面板（从筛选条下方展开） -->
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
                v-for="campus in campusOptions"
                :key="campus"
                class="fd-tag"
                :class="{ active: filterState.campuses.includes(campus) }"
                hover-class="mwp-hover"
                :hover-start-time="0"
                :hover-stay-time="0"
                @click="toggleCampus(campus)"
                >{{ campus }}</view
              >
            </view>
          </view>
          <view
            v-if="openDropdown === 'department' || openDropdown === 'all'"
            class="fd-group"
          >
            <text class="fd-label">院系</text>
            <view
              v-if="filterState.departments.length"
              class="fd-selected-tags"
            >
              <view
                v-for="d in filterState.departments"
                :key="d"
                class="fd-selected"
              >
                <text class="fd-selected-text">{{ d }}</text>
                <view
                  class="fd-selected-clear"
                  hover-class="mwp-hover-sm"
                  :hover-start-time="0"
                  :hover-stay-time="0"
                  @click="removeDepartment(d)"
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
            <view v-if="filterState.categories.length" class="fd-selected-tags">
              <view
                v-for="cat in filterState.categories"
                :key="cat"
                class="fd-selected"
              >
                <text class="fd-selected-text">{{ cat }}</text>
                <view
                  class="fd-selected-clear"
                  hover-class="mwp-hover-sm"
                  :hover-start-time="0"
                  :hover-stay-time="0"
                  @click="removeCategory(cat)"
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

    <!-- 内容区域 -->
    <MwpScrollView
      v-model:refreshing="refreshing"
      class="content-scroll"
      :enabled="isResultMode"
      :content-offset="firstCardTop"
      :indicator-min="refreshTopOffset"
      @refresh="onRefresh"
      @scroll="onScroll"
      @scrolltolower="onScrollToLower"
    >
      <!-- 顶部占位（用可滚动元素而非 padding，保证滚动时内容能顶到 header 下方） -->
      <view class="content-spacer" :style="{ height: contentPaddingTop }" />

      <!-- 结果模式 -> 显示 Result List -->
      <view v-if="isResultMode" class="result-section">
        <SkeletonCard
          v-if="loading && groupedRows.courses.length === 0"
          :count="3"
        />

        <!-- 加载失败（仅首屏无数据时整页展示） -->
        <EmptyState
          v-else-if="error && groupedRows.courses.length === 0"
          tone="danger"
          title="加载失败"
          :min-height="emptyMinHeight"
        >
          <template #action>
            <MwpButton tone="brand" @click="doSearch(true)">重试</MwpButton>
          </template>
        </EmptyState>

        <!-- 空状态：搜索无结果 -->
        <EmptyState
          v-else-if="!loading && groupedRows.courses.length === 0"
          title="没有找到相关课程"
          desc="换个关键词试试，或去广场看看"
          :min-height="emptyMinHeight"
        >
          <template #action>
            <MwpButton tone="brand" @click="goToProposalPlaza"
              >查看广场提案</MwpButton
            >
          </template>
        </EmptyState>

        <view v-else class="list-content">
          <!-- Courses Section -->
          <view v-if="groupedRows.courses.length" class="group-section">
            <view
              v-for="item in groupedRows.courses"
              :key="item.id"
              class="result-card"
              hover-class="result-hover"
              :hover-start-time="0"
              :hover-stay-time="0"
              @click="onResultClick(item)"
            >
              <ChooseCourse :data="item" />
            </view>
          </view>

          <!-- 课程列表底部 -->
          <view v-if="loading" class="loading-more">
            <view class="loading-spinner loading-spinner--sm" />
            <text class="loading-text">加载中...</text>
          </view>
          <template v-else-if="reachedEnd">
            <view class="bottom">--- 到底了哟 ---</view>
            <view class="tip-center">
              <MwpButton tone="brand" @click="onTipClick"
                >查看广场提案</MwpButton
              >
            </view>
          </template>
        </view>
      </view>

      <!-- 场景 B: 无搜索词 -> 显示历史记录 & 热门推荐 (Default) -->
      <view v-else class="empty-section">
        <!-- Add Comment Search Guide Banner -->
        <view v-if="mode === 'add-comment'" class="search-guide-banner">
          <text class="search-guide-banner__text">
            请搜索并选择你要吐槽的课程
          </text>
        </view>

        <!-- 历史记录 -->
        <view class="section-header">
          <text class="section-title">历史搜索</text>
          <view
            class="clear-history"
            hover-class="mwp-hover"
            :hover-start-time="0"
            :hover-stay-time="0"
            @click="showClearConfirm = true"
          >
            <MwpIcon name="trash-2" size="34rpx" />
          </view>
        </view>

        <view class="history-tags">
          <view
            v-for="(tag, index) in historyList"
            :key="index"
            class="tag-item"
            hover-class="mwp-hover"
            :hover-start-time="0"
            :hover-stay-time="0"
            @click="clickHistory(tag)"
          >
            {{ tag }}
          </view>
          <view v-if="historyList.length === 0" class="no-history"
            >暂无搜索记录</view
          >
        </view>

        <!-- 猜你想搜：最近审核通过的提案课程 -->
        <template v-if="guessList.length">
          <view class="section-header" style="margin-top: 60rpx">
            <text class="section-title">猜你想搜</text>
          </view>
          <view class="recommend-list">
            <view
              v-for="(name, index) in guessList"
              :key="index"
              class="recommend-item"
              hover-class="result-hover"
              :hover-start-time="0"
              :hover-stay-time="0"
              @click="clickRecommend(name)"
            >
              <view class="recommend-icon">
                <MwpIcon name="search" size="30rpx" class="mini-icon" />
              </view>
              <text class="recommend-word">{{ name }}</text>
            </view>
          </view>
        </template>
      </view>
    </MwpScrollView>

    <!-- 清空搜索历史确认 -->
    <MwpConfirmDialog
      v-model:visible="showClearConfirm"
      title="清空搜索历史"
      description="清空后无法恢复，确定清空全部搜索历史吗？"
      confirm-text="清空"
      tone="danger"
      @confirm="clearHistory"
    />
  </view>
</template>

<script setup lang="ts">
import BackBtn from '@/components/common/BackBtn.vue';
import { onMounted, onUnmounted, ref, computed, watch } from 'vue';
import { http, useThemeStore } from '@/config';
import { waitForLogin } from '@/utils/init';
import { useScrollDirection } from '@/composables/useScrollDirection';
import { useMenuButton } from '@/composables/useMenuButton';
import { useViewport } from '@/composables/useViewport';
import { useInput, useSuggest } from '@/composables/useFind';
import { useChoose } from '@/composables/useChoose';
import { showInfo } from '@/composables/useStatus';
const themeStore = useThemeStore();
import type {
  DtoSearchHistoryVO,
  DtoProposalVO,
  DtoFieldSuggestionVO
} from '@/api/data-contracts';
import {
  DEBOUNCE_DELAY_MS,
  COLLAPSE_SCROLL_THRESHOLD,
  EXPAND_SCROLL_THRESHOLD,
  MAX_HISTORY_SIZE,
  CAMPUS_OPTIONS
} from '@/utils/constants';
import type { MixedResult, SuggestItem } from '@/utils/types/search';

// 防抖定时器
let suggestDebounceTimer: ReturnType<typeof setTimeout> | null = null;
const SUGGEST_DEBOUNCE_MS = DEBOUNCE_DELAY_MS;

// 模糊搜索建议类型中文标签
const SUGGEST_TYPE_LABELS: Record<string, string> = {
  input: '搜索',
  course: '课程',
  teacher: '教师',
  category: '分类',
  department: '院系'
};

const suggestLabel = (type?: string) => SUGGEST_TYPE_LABELS[type || ''] ?? '';

const props = defineProps<{
  initialMode?: string;
}>();

const mode = computed(() => props.initialMode || ''); // 'add-comment' or empty

// 1. 胶囊信息 & 视口（统一走 composable，留白/行高按 rpx 换算，宽屏不会被压扁）
const viewport = useViewport();
const {
  menuButtonInfo,
  navBarHeight: NAV_BAR_HEIGHT,
  contentHeight
} = useMenuButton();

// 2. 布局常量计算（依赖视口宽度，窗口变化会自动重算）
const SEARCH_BAR_PADDING_BOTTOM = computed(() => (viewport.width / 750) * 24);

// 3. 状态管理
const isCollapsed = ref(false); // 是否收起
const isFocused = ref(false); // 新增：是否聚焦
const isResultMode = ref(false);
// 模糊建议浮层是否展开（与结果模式解耦，结果页聚焦搜索框时原地展开）
const showSuggest = ref(false);
const _resumeGuard = ref(false);

// Import searchText and placeHolder from useInput
const { searchText, placeHolder } = useInput();

const { suggestList, suggestContent, isLoading } = useSuggest(searchText);

const {
  keyword: resultKeyword,
  jump,
  rows,
  page,
  loading,
  error,
  reachedEnd,
  doSearch,
  filterForm,
  filterOptions
} = useChoose();

// 校区：基础列表 + 搜索结果中出现的校区（避免遗漏后端新增校区）
const campusOptions = computed(() => {
  const set = new Set<string>([...CAMPUS_OPTIONS, ...filterOptions.campuses]);
  return Array.from(set);
});

// Add exposed method for parent page to call onShow
const resumeState = () => {
  const savedState = uni.getStorageSync('find_page_state');
  if (savedState && savedState.searchText && savedState.isResultMode) {
    searchText.value = savedState.searchText;
    // 恢复结果模式
    isResultMode.value = true;
    showSuggest.value = false;
    _resumeGuard.value = true; // 设置保护标记，防止 onInputFocus 误切模式

    // 如果数据丢失（如页面被重载），重新搜索
    // 增加 forceRefresh 判断
    if (!rows.value || rows.value.length === 0) {
      performSearch(savedState.searchText);
    }
  } else if (guessList.value.length === 0) {
    // 无待恢复状态（首次进入 / 上次请求未拿到数据）时兜底拉取「猜你想搜」
    waitForLogin().then(fetchGuessProposals);
  }
  // 状态只消费一次：从详情页返回时恢复，之后再次进入搜索框不再带上旧关键词
  uni.removeStorageSync('find_page_state');
};

// 暴露给父组件
defineExpose({
  resumeState
});

const groupedRows = computed(() => {
  const list = rows.value || [];
  const courses: MixedResult[] = [];
  for (const item of list) {
    if (item.resultType !== 'proposal') courses.push(item);
  }
  return { courses };
});

// 筛选状态
const filterState = reactive({
  campuses: [] as string[],
  departments: [] as string[],
  categories: [] as string[]
});
const openDropdown = ref('');
const isDropdownOpen = computed(() => openDropdown.value !== '');

// 院系 / 分类：均通过后端字段建议接口按关键词搜索（后端无全量列表接口，避免硬编码）
const deptKeyword = ref('');
const deptResults = ref<DtoFieldSuggestionVO[]>([]);
const categoryKeyword = ref('');
const categoryResults = ref<DtoFieldSuggestionVO[]>([]);
let deptTimer: ReturnType<typeof setTimeout> | null = null;
let categoryTimer: ReturnType<typeof setTimeout> | null = null;

const toggleDropdown = (name: string) => {
  // 再次点击已展开的筛选项 -> 视为「确定」，应用当前选择
  if (openDropdown.value === name) {
    applyFilters();
    return;
  }
  openDropdown.value = name;
};

const closeDropdown = () => {
  // 点击空白处关闭筛选栏 -> 视为「确定」，应用当前选择
  applyFilters();
};

const toggleCampus = (c: string) => {
  const idx = filterState.campuses.indexOf(c);
  if (idx > -1) filterState.campuses.splice(idx, 1);
  else filterState.campuses.push(c);
};

const removeDepartment = (d: string) => {
  const idx = filterState.departments.indexOf(d);
  if (idx > -1) filterState.departments.splice(idx, 1);
};

const removeCategory = (c: string) => {
  const idx = filterState.categories.indexOf(c);
  if (idx > -1) filterState.categories.splice(idx, 1);
};

async function fetchFieldSuggestions(
  field: 'department' | 'category',
  keyword: string
): Promise<DtoFieldSuggestionVO[]> {
  try {
    const res = await http.ProposalController.proposalFieldSuggestionsList({
      keyword,
      field
    });
    return res.data?.data?.suggestions ?? [];
  } catch {
    return [];
  }
}

const onDeptSearch = () => {
  if (deptTimer) clearTimeout(deptTimer);
  const kw = deptKeyword.value.trim();
  deptTimer = setTimeout(async () => {
    deptResults.value = kw ? await fetchFieldSuggestions('department', kw) : [];
  }, 300);
};

const selectDept = (item: DtoFieldSuggestionVO) => {
  const val = item.value || item.label || '';
  if (val && !filterState.departments.includes(val))
    filterState.departments.push(val);
  deptKeyword.value = '';
  deptResults.value = [];
};

const onCategorySearch = () => {
  if (categoryTimer) clearTimeout(categoryTimer);
  const kw = categoryKeyword.value.trim();
  categoryTimer = setTimeout(async () => {
    categoryResults.value = kw
      ? await fetchFieldSuggestions('category', kw)
      : [];
  }, 300);
};

const selectCategory = (item: DtoFieldSuggestionVO) => {
  const val = item.value || item.label || '';
  if (val && !filterState.categories.includes(val))
    filterState.categories.push(val);
  categoryKeyword.value = '';
  categoryResults.value = [];
};

const resetFilters = () => {
  const isAll = openDropdown.value === 'all';
  if (isAll || openDropdown.value === 'campus') filterState.campuses = [];
  if (isAll || openDropdown.value === 'department')
    filterState.departments = [];
  if (isAll || openDropdown.value === 'category') filterState.categories = [];
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

const sameStringSet = (a: string[], b: string[]) =>
  a.length === b.length && a.every((x) => b.includes(x));

// 编辑中的筛选与已应用的筛选是否一致
const filtersUnchanged = () =>
  sameStringSet(filterState.campuses, filterForm.campus) &&
  sameStringSet(filterState.departments, filterForm.department) &&
  sameStringSet(filterState.categories, filterForm.category);

const applyFilters = () => {
  if (blockUnmatchedFieldInput()) return;
  openDropdown.value = '';
  const unchanged = filtersUnchanged();
  filterForm.campus = [...filterState.campuses];
  filterForm.department = [...filterState.departments];
  filterForm.category = [...filterState.categories];
  // 筛选没变化：不重搜、不清空结果，保留当前滚动位置
  if (unchanged) return;
  if (searchText.value && isResultMode.value) performSearch(searchText.value);
};

// 4. 动态样式计算
const headerHeight = NAV_BAR_HEIGHT;

const refinedSearchBarWrapperStyle = computed(() => {
  const gap = (viewport.width / 750) * 32;
  // 有胶囊时为其预留空间（搜索框停在胶囊左侧）；PC 端没有胶囊，
  // 不用预留，右侧空间刚好给「搜索」按钮
  const paddingRight = viewport.hasCapsule
    ? viewport.width - menuButtonInfo.value.left + gap
    : gap;

  return {
    height: headerHeight.value + 'px',
    paddingTop: menuButtonInfo.value.top + 'px',
    paddingBottom: SEARCH_BAR_PADDING_BOTTOM.value + 'px',
    paddingRight: paddingRight + 'px'
  };
});

const searchBarWrapperStyle = refinedSearchBarWrapperStyle;

// 5. 滚动监听
const { isScrollingDown, onScroll: handleScrollDirection } =
  useScrollDirection(30);
const isFilterHidden = ref(false);

// 筛选条实际高度 = 上下 padding(12rpx*2) + 胶囊高度(56rpx)
const FILTER_BAR_HEIGHT = computed(() => (viewport.width / 750) * 80);
// 筛选栏下移量：与模糊搜索浮层上边缘对齐（浮层 margin-top = $space-5）
const FILTER_BAR_TOP_OFFSET = computed(() => (viewport.width / 750) * 20);
// 目标可见留白：与搜索栏底部 padding 一致。
// 筛选栏自身还带有 12rpx 底部内边距（已含在 FILTER_BAR_HEIGHT 中），需扣除，
// 这样「筛选栏→首卡」的可见间距才真正等于「搜索栏→筛选栏」。
const FIRST_CARD_GAP = computed(() =>
  Math.max(0, SEARCH_BAR_PADDING_BOTTOM.value - (viewport.width / 750) * 12)
);
// 第一张卡片距滚动区顶部的高度（可滚动占位块的高度）
const firstCardTop = computed(() => {
  const filterHeight = isFilterHidden.value ? 0 : FILTER_BAR_HEIGHT.value;
  const filterOffset = isFilterHidden.value ? 0 : FILTER_BAR_TOP_OFFSET.value;
  return (
    headerHeight.value + filterOffset + filterHeight + FIRST_CARD_GAP.value
  );
});
const contentPaddingTop = computed(() =>
  isResultMode.value ? firstCardTop.value + 'px' : headerHeight.value + 'px'
);
// 搜索结果页空状态：相对「整个页面」垂直居中。
// 空状态排在 content-spacer（高 firstCardTop）之后，故其中心 =
// firstCardTop + minHeight/2，令其等于 viewport.height/2 即可。
const emptyMinHeight = computed(() =>
  Math.max(0, viewport.height - firstCardTop.value * 2)
);

// 松手刷新指示器的下限：筛选栏下沿
const refreshTopOffset = computed(
  () =>
    headerHeight.value + FILTER_BAR_TOP_OFFSET.value + FILTER_BAR_HEIGHT.value
);
const refreshing = ref(false);
const onRefresh = () => {
  if (!isResultMode.value || !searchText.value.trim()) {
    refreshing.value = false;
    return;
  }
  doSearch(true).finally(() => {
    refreshing.value = false;
  });
};

interface ScrollDetail {
  detail?: { scrollTop?: number };
}
const onScroll = (e: ScrollDetail) => {
  const top = e.detail?.scrollTop ?? 0;

  // 滚动结果列表时收起建议浮层
  if (top > 0 && showSuggest.value && isResultMode.value) {
    showSuggest.value = false;
  }

  // 检测滚动方向
  handleScrollDirection(e);

  // 根据滚动方向控制筛选栏显隐
  if (top > 50) {
    isFilterHidden.value = isScrollingDown.value;
  } else {
    isFilterHidden.value = false;
  }

  // 原有的 header 收起逻辑
  if (top > COLLAPSE_SCROLL_THRESHOLD && !isCollapsed.value) {
    isCollapsed.value = true;
  } else if (top < EXPAND_SCROLL_THRESHOLD && isCollapsed.value) {
    isCollapsed.value = false;
  }
};

// 获取搜索历史
const historyList = ref<string[]>(uni.getStorageSync('searchHistory') || []);

function fetchSearchHistory() {
  return http.SearchController.searchRecentList()
    .then((res) => {
      const histories = res.data?.data?.histories || [];
      historyList.value = histories
        .map((h: DtoSearchHistoryVO) => {
          if (typeof h === 'string') return h;
          return h?.query;
        })
        .filter((h): h is string => !!h && typeof h === 'string');
    })
    .catch((err: unknown) => {
      console.error('[find] fetchSearchHistory error:', err);
    });
}

// 猜你想搜：展示最近审核通过的提案对应课程，确保能搜到且便于评论
const GUESS_PROPOSAL_LIMIT = 6;
const guessList = ref<string[]>([]);

function fetchGuessProposals() {
  return http.ProposalController.proposalListList({
    status: 'approved',
    page: 1,
    pageSize: 20
  })
    .then((res) => {
      const proposals: DtoProposalVO[] = res.data?.data?.proposals ?? [];
      const sorted = [...proposals].sort((a, b) => {
        const ta = new Date(b.updatedAt || b.createdAt || 0).getTime();
        const tb = new Date(a.updatedAt || a.createdAt || 0).getTime();
        return ta - tb;
      });
      const names: string[] = [];
      const seen = new Set<string>();
      for (const p of sorted) {
        const name = (
          p.finalCourse?.name ||
          p.course?.name ||
          p.title ||
          ''
        ).trim();
        if (!name) continue;
        const key = name.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        names.push(name);
        if (names.length >= GUESS_PROPOSAL_LIMIT) break;
      }
      guessList.value = names;
    })
    .catch((err: unknown) => {
      console.error('[find] fetchGuessProposals error:', err);
      guessList.value = [];
    });
}

onMounted(async () => {
  fetchSearchHistory();
  await waitForLogin();
  fetchGuessProposals();
});

onUnmounted(() => {
  if (suggestDebounceTimer) clearTimeout(suggestDebounceTimer);
  if (deptTimer) clearTimeout(deptTimer);
  if (categoryTimer) clearTimeout(categoryTimer);
  if (tipTimer) clearTimeout(tipTimer);
  if (blurCloseTimer) clearTimeout(blurCloseTimer);
});

// 方法定义
const goBack = () => {
  // 结果模式：不返回上一页，等同点击搜索框的叉，清空搜索栏回到搜索页
  if (isResultMode.value) {
    clearSearch();
    return;
  }

  // Check back size
  const pages = getCurrentPages();
  if (pages.length > 1) {
    uni.navigateBack();
  } else {
    // 如果没有上一页（例如分享卡片进入或刷新后），则重定向到首页
    uni.reLaunch({
      url: '/pages/layout/main'
    });
  }
};

const handleSearch = () => {
  isFocused.value = false; // Hide focus ring on search
  performSearch(searchText.value);
};

// Clear Search Logic Update
const clearSearch = () => {
  searchText.value = '';
  isResultMode.value = false; // Return to explore mode
  showSuggest.value = false;
  uni.removeStorageSync('find_page_state'); // Clear stored state
  // Focus optional - actually we might want to focus input
  // so user can type immediately
};

let blurCloseTimer: ReturnType<typeof setTimeout> | null = null;

const onInputFocus = () => {
  isFocused.value = true;
  if (blurCloseTimer) {
    clearTimeout(blurCloseTimer);
    blurCloseTimer = null;
  }
  // 如果刚从详情页返回，保护标记生效，不要展开建议
  if (_resumeGuard.value) {
    _resumeGuard.value = false;
    return;
  }

  // 原地展开模糊建议浮层（结果页也保留结果列表，不再跳回历史页）
  showSuggest.value = true;

  // 结果页聚焦时，直接用当前关键词立即搜一次
  if (isResultMode.value && searchText.value) {
    suggestContent();
  }
};

const onInputBlur = () => {
  // 延迟收起，避免点击建议项 / 搜索按钮时因失焦先行卸载导致点击丢失
  if (blurCloseTimer) clearTimeout(blurCloseTimer);
  blurCloseTimer = setTimeout(() => {
    isFocused.value = false;
    showSuggest.value = false;
    blurCloseTimer = null;
  }, 200);
};

// 用户输入时触发模糊搜索建议（带防抖）
const onInputChange = () => {
  showSuggest.value = true;
  if (suggestDebounceTimer) {
    clearTimeout(suggestDebounceTimer);
  }
  suggestDebounceTimer = setTimeout(() => {
    if (searchText.value && searchText.value.length > 0) {
      suggestContent();
    }
  }, SUGGEST_DEBOUNCE_MS);
};

// 提取通用搜索逻辑，允许传入特定关键词而不改变输入框内容
const performSearch = (keyword: string) => {
  if (!keyword) return;

  // 收起建议浮层
  isFocused.value = false;
  showSuggest.value = false;
  if (blurCloseTimer) {
    clearTimeout(blurCloseTimer);
    blurCloseTimer = null;
  }

  // 1. Add History (persist to storage)
  const historySet = new Set(historyList.value);
  if (!historySet.has(keyword)) {
    historyList.value.unshift(keyword);
    if (historyList.value.length > MAX_HISTORY_SIZE) {
      historyList.value.pop();
    }
    uni.setStorageSync('searchHistory', historyList.value);
  }

  // 2. Switch to Result Mode
  isResultMode.value = true;
  searchText.value = keyword; // Sync input

  // 3. Reset Pagination & List
  page.value = 1;
  if (rows && rows.value) rows.value = [];

  // 4. Trigger Search Logic
  if (resultKeyword && resultKeyword.value !== undefined) {
    resultKeyword.value = keyword;
  }
  doSearch(true);
};

// 清空历史记录（需二次确认）
const showClearConfirm = ref(false);
const clearHistory = () => {
  historyList.value = [];
  uni.removeStorageSync('searchHistory');
};

// 滚动到底部加载更多
// 到底提示：出现后延迟一小段时间才可点击，避免滚动时的“点击穿透”
const tipReady = ref(false);
let tipTimer: ReturnType<typeof setTimeout> | null = null;
watch(
  [loading, reachedEnd],
  () => {
    if (tipTimer) {
      clearTimeout(tipTimer);
      tipTimer = null;
    }
    if (!loading.value && reachedEnd.value) {
      tipReady.value = false;
      tipTimer = setTimeout(() => {
        tipReady.value = true;
      }, 300);
    } else {
      tipReady.value = false;
    }
  },
  { immediate: true }
);

const onTipClick = () => {
  if (!tipReady.value) return;
  goToProposalPlaza();
};

const onScrollToLower = () => {
  if (!isResultMode.value) return;
  handleScrollBottom();
};

const handleScrollBottom = () => {
  if (loading.value || reachedEnd.value) return;
  page.value++;
  doSearch(false);
};

// 跳转到提案广场，携带搜索词与已应用筛选（广场侧校验后带入）
const goToProposalPlaza = () => {
  const kw = searchText.value || '';
  if (!kw) return;
  const params = [
    `keyword=${encodeURIComponent(kw)}`,
    `campus=${encodeURIComponent(JSON.stringify(filterForm.campus))}`,
    `department=${encodeURIComponent(JSON.stringify(filterForm.department))}`,
    `category=${encodeURIComponent(JSON.stringify(filterForm.category))}`
  ].join('&');
  uni.navigateTo({ url: `/pages/proposal/list?${params}` });
};

// 提案卡片点击
const clickProposal = (proposal: MixedResult) => {
  const dataStr = encodeURIComponent(JSON.stringify(proposal));
  // 强制跳转到 proposal/proposal-detail
  uni.navigateTo({
    url: `/pages/proposal/proposal-detail?data=${dataStr}`,
    fail: (err) => {
      console.error('[FindPage] Jump to proposal failed:', err);
    }
  });
};

/*
  Debug: onResultClick 里的 item 结构是什么样的？
  如果 item 是 { type: 'proposal', ... } 那就能跳对。
  如果 item 是 { resultType: 'proposal', ... } 呢？
  之前代码写的是 item.type === 'proposal'
*/
const onResultClick = (item: MixedResult) => {
  // 兼容多种可能的字段名
  if (
    item.type === 'proposal' ||
    item.resultType === 'proposal' ||
    item.voteCount !== undefined
  ) {
    clickProposal(item);
  } else {
    clickCourse(item);
  }
};

// 课程卡片点击
const clickCourse = (course: MixedResult) => {
  // 保存当前状态
  uni.setStorageSync('find_page_state', {
    searchText: searchText.value,
    isResultMode: true
  });

  if (mode.value === 'add-comment') {
    // 直接把课程信息传递给吐槽页，不经过课程详情页
    const dataStr = encodeURIComponent(JSON.stringify(course));
    uni.navigateTo({
      url: `/pages/course/comment?data=${dataStr}`
    });
    return;
  }

  // useChoose.jump expects the full item (to inspect resultType etc.)
  jump(course);
};

// 页面级 onShow 会调用 resumeState()，此处不再注册组件级 onShow（不可靠且重复）。

// 点击历史记录
const clickHistory = (tag: string) => {
  searchText.value = tag; // 先设置 input
  performSearch(tag);
};

// 点击推荐词
const clickRecommend = (keyword: string) => {
  searchText.value = keyword;
  performSearch(keyword);
};

// 处理建议项点击
const handleSuggestClick = (item: SuggestItem) => {
  searchText.value = item.name || '';
  performSearch(item.name || '');
};
</script>

<style lang="scss" scoped src="./FindView.scss" />
