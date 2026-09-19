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
          @click="goBack"
        >
          <BackBtn />
        </view>

        <!-- 中间：搜索框（高度 = 胶囊高度，见 useMenuButton.contentHeight）-->
        <view
          class="search-input-box"
          :class="{ 'is-focused': isFocused }"
          :style="{ height: contentHeight + 'px' }"
        >
          <text class="search-icon">🔍</text>
          <input
            v-model="searchText"
            class="search-input"
            :placeholder="placeHolder"
            :focus="!isResultMode"
            confirm-type="search"
            placeholder-class="placeholder-style"
            @focus="onInputFocus"
            @blur="onInputBlur"
            @input="onInputChange"
            @confirm="handleSearch"
          />
          <view
            v-if="searchText"
            class="clear-icon"
            hover-class="mwp-hover"
            @click="clearSearch"
          >
            <text class="clear-text">×</text>
          </view>
        </view>

        <!-- 右侧搜索按钮：仅在没有系统胶囊（PC 端）时出现，
             手机/平板右上角被胶囊占用，放不下 -->
        <view
          v-if="!viewport.hasCapsule"
          class="nav-search-btn"
          hover-class="mwp-hover"
          @click="handleSearch"
          >搜索</view
        >
      </view>
    </view>

    <!-- 模糊搜索建议：紧贴输入框下方的浮层 -->
    <view
      v-if="searchText && showSuggest"
      class="suggest-panel"
      :style="{ top: headerHeight + 'px' }"
    >
      <!-- 等待建议返回时先显示加载态，避免空白白条闪现 -->
      <view v-if="!suggestList.length" class="suggest-panel__loading">
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
          @click="handleSuggestClick(item)"
        >
          <text class="suggest-panel__label">{{ item.name }}</text>
          <text class="suggest-panel__hint">
            {{
              item.type === 'input'
                ? '（直接搜索）'
                : `（${suggestLabel(item.type)}）`
            }}
          </text>
        </view>
      </template>
    </view>

    <!-- 筛选条（仅结果模式，移至dynamic-header外部） -->
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
          @click="toggleDropdown('campus')"
        >
          <text class="chip-text">{{
            filterState.campuses.length
              ? filterState.campuses.map((c) => c.replace('校区', '')).join('+')
              : '校区'
          }}</text>
          <text class="chip-arrow">▾</text>
        </view>
        <view
          class="filter-chip"
          style="flex: 1 1 auto; min-width: 0"
          :class="{
            'has-value': filterState.departments.length,
            'is-open': openDropdown === 'department' || openDropdown === 'all'
          }"
          hover-class="mwp-hover"
          @click="toggleDropdown('department')"
        >
          <text class="chip-text">{{
            filterState.departments.length
              ? filterState.departments.length > 1
                ? filterState.departments.length + '个院系'
                : filterState.departments[0]
              : '院系'
          }}</text>
          <text class="chip-arrow">▾</text>
        </view>
        <view
          class="filter-chip"
          style="flex: 1 1 auto; min-width: 0"
          :class="{
            'has-value': filterState.categories.length,
            'is-open': openDropdown === 'category' || openDropdown === 'all'
          }"
          hover-class="mwp-hover"
          @click="toggleDropdown('category')"
        >
          <text class="chip-text">{{
            filterState.categories.length
              ? filterState.categories.length > 1
                ? filterState.categories.length + '个分类'
                : filterState.categories[0]
              : '分类'
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
                @click="toggleCampus(campus)"
                >{{ campus.replace('校区', '') }}</view
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
                  @click="removeDepartment(d)"
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
                  @click="removeCategory(cat)"
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

    <!-- 内容区域 -->
    <scroll-view
      scroll-y
      class="content-scroll"
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

        <!-- 空状态：搜索无结果 -->
        <EmptyState
          v-else-if="!loading && groupedRows.courses.length === 0"
          title="没有找到相关课程"
          desc="换个关键词试试，或去广场看看"
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
              @click="onResultClick(item)"
            >
              <view class="result-card-wrapper course-card">
                <ChooseCourse :data="item" variant="course" />
              </view>
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
          <text>请搜索并选择你要吐槽的课程</text>
        </view>

        <!-- 历史记录 -->
        <view class="section-header">
          <text class="section-title">历史搜索</text>
          <view
            class="clear-history"
            hover-class="mwp-hover"
            @click="clearHistory"
          >
            🗑️
            <!-- 暂时用 emoji 替代图标 -->
          </view>
        </view>

        <view class="history-tags">
          <view
            v-for="(tag, index) in historyList"
            :key="index"
            class="tag-item"
            hover-class="mwp-hover"
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
              @click="clickRecommend(name)"
            >
              <view class="recommend-icon">
                <text class="mini-icon">🔍</text>
              </view>
              <text class="recommend-word">{{ name }}</text>
            </view>
          </view>
        </template>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import BackBtn from '@/components/common/BackBtn.vue';
import { onMounted, onUnmounted, ref, computed, watch } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { http, useThemeStore } from '@/config';
import { useScrollDirection } from '@/composables/useScrollDirection';
import { useMenuButton } from '@/composables/useMenuButton';
import { useViewport } from '@/composables/useViewport';
import { useInput, useSuggest } from '@/composables/useFind';
import { useChoose } from '@/composables/useChoose';
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

const { suggestList, suggestContent } = useSuggest(searchText);

const {
  keyword: resultKeyword,
  jump,
  rows,
  page,
  loading,
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
  }
};

// 暴露给父组件
defineExpose({
  resumeState
});

// Restore from Storage on Show (Might not trigger in Component)
// onShow(() => { ... }) // Removed component level onShow to define proper flow from page

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
  openDropdown.value = openDropdown.value === name ? '' : name;
};

const closeDropdown = () => {
  openDropdown.value = '';
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

const applyFilters = () => {
  openDropdown.value = '';
  filterForm.campus = [...filterState.campuses];
  filterForm.department = [...filterState.departments];
  filterForm.category = [...filterState.categories];
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
let lastScrollTop = 0;

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
const contentPaddingTop = computed(() => {
  if (!isResultMode.value) return headerHeight.value + 'px';
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

onMounted(() => {
  fetchSearchHistory();
  fetchGuessProposals();
});

onUnmounted(() => {
  if (suggestDebounceTimer) clearTimeout(suggestDebounceTimer);
  if (deptTimer) clearTimeout(deptTimer);
  if (categoryTimer) clearTimeout(categoryTimer);
  if (tipTimer) clearTimeout(tipTimer);
});

// 方法定义
const goBack = () => {
  // If in result mode, go back to explore mode
  if (isResultMode.value) {
    isResultMode.value = false;
    showSuggest.value = false;
    // searchText.value = ''; // Keep text to allow refinement
    uni.removeStorageSync('find_page_state'); // Clear stored state
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
    suggestContent(0);
  }
};

const onInputBlur = () => {
  isFocused.value = false;
  // 延迟收起，避免点击建议项时因失焦先行卸载导致点击丢失
  if (blurCloseTimer) clearTimeout(blurCloseTimer);
  blurCloseTimer = setTimeout(() => {
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
      suggestContent(0);
    }
  }, SUGGEST_DEBOUNCE_MS);
};

// 提取通用搜索逻辑，允许传入特定关键词而不改变输入框内容
const performSearch = (keyword: string) => {
  if (!keyword) return;

  // 收起建议浮层
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

// 清空历史记录
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
  // 强制跳转到 course/proposal-detail
  uni.navigateTo({
    url: `/pages/course/proposal-detail?data=${dataStr}`,
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

// 组件挂载后，检查是否有存储的搜索状态
onShow(() => {
  // 检查是否有存储的搜索状态
  const savedState = uni.getStorageSync('find_page_state');
  if (savedState && savedState.searchText) {
    searchText.value = savedState.searchText;
    // 恢复结果模式
    isResultMode.value = true;
    showSuggest.value = false;
    _resumeGuard.value = true; // 设置保护标记，防止 onInputFocus 误切模式

    // 可选：如果不希望每次回来都重新搜索，可以不调用 performSearch
    // 但如果不调用，列表可能是空的（因为页面被销毁了？）
    // 如果 find 页面作为 TabBar 页面，组件可能并未销毁，状态还在
    // 但如果从详情页返回，onShow 会触发
    // 如果 rows 还在，就不需要重新搜索
    if ((!rows.value || rows.value.length === 0) && searchText.value) {
      performSearch(searchText.value);
    }
  }
});

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
