<template>
  <view class="find-container" :class="themeStore.themeClass">
    <!-- 顶部动态 Header -->
    <view 
      class="dynamic-header"
      :class="{ 'is-collapsed': isCollapsed }"
      :style="{ height: headerHeight + 'px' }"
    >
        <!-- 搜索功能区容器 -->
        <view 
            class="search-bar-wrapper"
            :style="searchBarWrapperStyle"
        >
            <!-- 左侧：返回按钮 -->
            <view class="nav-back-btn" @click="goBack" :style="{ height: menuButtonInfo.height + 'px', width: menuButtonInfo.height + 'px' }" hover-class="mwp-hover">
                <BackBtn />
            </view>

            <!-- 中间：搜索框 -->
            <view class="search-input-box" :class="{ 'is-focused': isFocused }">
                <text class="search-icon">🔍</text>
                <input
                v-model="searchText"
                class="search-input"
                :placeholder="placeHolder"
                :focus="!isResultMode"
                @focus="onInputFocus"
                @blur="isFocused = false"
                @input="onInputChange"
                confirm-type="search"
                @confirm="handleSearch"
                placeholder-class="placeholder-style"
                />
                <view v-if="searchText" class="clear-icon" @click="clearSearch" hover-class="mwp-hover">
                    <text class="clear-text">×</text>
                </view>
            </view>

            <!-- 移除右侧搜索按钮 -->
        </view>
    </view>
    
    <!-- 筛选条（仅结果模式，移至dynamic-header外部） -->
    <view v-if="isResultMode" class="filter-bar-wrapper" :class="{ 'is-hidden': isFilterHidden }" :style="{ top: headerHeight + 'px' }">
        <view class="filter-chip-bar">
                <view class="filter-chip" style="flex:1 1 auto;min-width:0" :class="{ 'has-value': filterState.campuses.length, 'is-open': openDropdown === 'campus' || openDropdown === 'all' }" @click="toggleDropdown('campus')" hover-class="mwp-hover">
                    <text class="chip-text">{{ filterState.campuses.length ? filterState.campuses.map(c => c.replace('校区','')).join('+') : '校区' }}</text>
                    <text class="chip-arrow">▾</text>
                </view>
                <view class="filter-chip" style="flex:1 1 auto;min-width:0" :class="{ 'has-value': filterState.departments.length, 'is-open': openDropdown === 'department' || openDropdown === 'all' }" @click="toggleDropdown('department')" hover-class="mwp-hover">
                    <text class="chip-text">{{ filterState.departments.length ? (filterState.departments.length > 1 ? filterState.departments.length + '个院系' : filterState.departments[0]) : '院系' }}</text>
                    <text class="chip-arrow">▾</text>
                </view>
                <view class="filter-chip" style="flex:1 1 auto;min-width:0" :class="{ 'has-value': filterState.categories.length, 'is-open': openDropdown === 'category' || openDropdown === 'all' }" @click="toggleDropdown('category')" hover-class="mwp-hover">
                    <text class="chip-text">{{ filterState.categories.length ? (filterState.categories.length > 1 ? filterState.categories.length + '个分类' : filterState.categories[0]) : '分类' }}</text>
                    <text class="chip-arrow">▾</text>
                </view>
                <view class="filter-chip filter-chip--expand" :class="{ 'is-open': openDropdown === 'all' }" @click="toggleDropdown('all')" hover-class="mwp-hover">
                    <text class="chip-arrow">▾</text>
                </view>
            </view>

            <!-- 下拉面板（从筛选条下方展开） -->
            <view v-if="isDropdownOpen" class="filter-dropdown-mask" @click="closeDropdown" />
            <view v-if="isDropdownOpen" class="filter-dropdown" @click.stop>
                <view class="fd-scroll">
                    <view class="fd-group" v-if="openDropdown === 'campus' || openDropdown === 'all'">
                        <text class="fd-label">校区</text>
                        <view class="fd-tags">
                            <view
                                v-for="campus in campusOptions"
                                :key="campus"
                                class="fd-tag"
                                :class="{ active: filterState.campuses.includes(campus) }"
                                @click="toggleCampus(campus)"
                             hover-class="mwp-hover">{{ campus.replace('校区', '') }}</view>
                        </view>
                    </view>
                    <view class="fd-group" v-if="openDropdown === 'department' || openDropdown === 'all'">
                        <text class="fd-label">院系</text>
                        <view v-if="filterState.departments.length" class="fd-selected-tags">
                            <view v-for="d in filterState.departments" :key="d" class="fd-selected">
                                <text class="fd-selected-text">{{ d }}</text>
                                <view class="fd-selected-clear" hover-class="mwp-hover-sm" @click="removeDepartment(d)">×</view>
                            </view>
                        </view>
                        <view class="fd-search">
                            <input class="fd-search-input" placeholder="搜索院系..." placeholder-class="fd-placeholder" v-model="deptKeyword" @input="onDeptSearch" />
                            <view v-if="deptResults.length" class="fd-suggest-list">
                                <view v-for="item in deptResults" :key="item.value" class="fd-suggest-item" @click="selectDept(item)" hover-class="mwp-hover">{{ item.label || item.value }}</view>
                            </view>
                        </view>
                    </view>
                    <view class="fd-group" v-if="openDropdown === 'category' || openDropdown === 'all'">
                        <text class="fd-label">分类</text>
                        <view v-if="filterState.categories.length" class="fd-selected-tags">
                            <view v-for="cat in filterState.categories" :key="cat" class="fd-selected">
                                <text class="fd-selected-text">{{ cat }}</text>
                                <view class="fd-selected-clear" hover-class="mwp-hover-sm" @click="removeCategory(cat)">×</view>
                            </view>
                        </view>
                        <view class="fd-search">
                            <input class="fd-search-input" placeholder="搜索分类..." placeholder-class="fd-placeholder" v-model="categoryKeyword" @input="onCategorySearch" />
                            <view v-if="categoryResults.length" class="fd-suggest-list">
                                <view v-for="item in categoryResults" :key="item.value" class="fd-suggest-item" @click="selectCategory(item)" hover-class="mwp-hover">{{ item.label || item.value }}</view>
                            </view>
                        </view>
                    </view>
                </view>
                <view class="fd-footer">
                    <view class="fd-btn fd-btn--reset" @click="resetFilters" hover-class="mwp-hover">重置</view>
                    <view class="fd-btn fd-btn--confirm" @click="applyFilters" hover-class="mwp-hover">确定</view>
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

      <!-- 场景 A: 有搜索词且不在结果模式 -> 显示建议列表 -->
      <view v-if="searchText && !isResultMode" class="suggest-section">
          <!-- 这里使用真实的模糊搜索列表展示 -->
        <view
          v-for="(item, index) in suggestList"
          :key="index"
          class="suggest-item"
          :class="{ 'suggest-item-input': item.type === 'input' }"
          @click="handleSuggestClick(item)"
         hover-class="mwp-hover">
          <!-- 左侧图标/类型 -->
          <view class="item-icon-wrapper">
             <text class="mini-search-icon">🔍</text>
          </view>

          <!-- 右侧内容 -->
          <view class="item-content">
             <!-- 渲染内容 -->
             <text class="item-name">{{ item.name }}</text>
             <!-- 模糊搜索通常没有 subInfo，或者 subInfo 是"搜索" -->
             <text v-if="item.type === 'input'" class="item-sub">直接搜索</text>
          </view>

          <!-- 箭头 -->
          <view class="item-arrow">
              <image src="@/images/go-back.png" style="width:24rpx;height:24rpx;transform:rotate(180deg);opacity:0.3;" />
          </view>
        </view>
      </view>

      <!-- 场景 C: 结果模式 -> 显示 Result List -->
      <view v-else-if="isResultMode" class="result-section">
        <SkeletonCard v-if="loading && groupedRows.courses.length === 0" :count="3" />
        <view v-else class="list-content">
                <!-- Courses Section -->
                <view class="group-section" v-if="groupedRows.courses.length">
                    <view v-for="(item, idx) in groupedRows.courses" :key="item.id" class="result-card" hover-class="result-hover" @click="onResultClick(item)">
                        <view class="result-card-wrapper course-card">
                            <choose-course :data="item" variant="course" />
                        </view>
                    </view>
                </view>

                <!-- 课程列表底部 -->
                <template v-if="!showProposalsList">
                    <view v-if="loading" class="loading-more">
                        <view class="loading-spinner loading-spinner--sm" />
                        <text class="loading-text">加载中...</text>
                    </view>
                    <view v-else class="bottom">--- 到底了哟 ---</view>
                    <view class="show-proposals-tip" @click="toggleProposalsList" hover-class="mwp-hover">
                        <text>查看广场提案</text>
                        <image src="@/images/go-back.png" class="tip-arrow" />
                    </view>
                </template>

                <!-- Proposals Section（点击后显示在下方） -->
                <template v-if="showProposalsList">
                    <view v-if="proposalLoading && groupedRows.proposals.length === 0" class="loading-section">
                        <view class="loading-spinner" />
                        <text class="loading-text">加载提案中...</text>
                    </view>
                    <view class="group-section" v-if="groupedRows.proposals.length">
                        <view class="group-title">提案</view>
                        <view v-for="(item, idx) in groupedRows.proposals" :key="item.id" class="result-card" hover-class="result-hover" @click="onResultClick(item)">
                            <view class="result-card-wrapper proposal-card">
                                <choose-course :data="item" variant="proposal" />
                            </view>
                        </view>
                    </view>
                    <view v-if="!proposalLoading" class="bottom">--- 到底了哟 ---</view>
                    <view v-if="!proposalLoading" class="new-card" @click="goToProposal" hover-class="mwp-hover">
                        <text class="new-card-text">新建提案</text>
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
          <view class="clear-history" @click="clearHistory" hover-class="mwp-hover">
             🗑️ <!-- 暂时用 emoji 替代图标 -->
          </view>
        </view>
        
        <view class="history-tags">
            <view 
              v-for="(tag, index) in historyList" 
              :key="index" 
              class="tag-item"
              @click="clickHistory(tag)"
             hover-class="mwp-hover">
              {{ tag }}
            </view>
            <view v-if="historyList.length === 0" class="no-history">暂无搜索记录</view>
        </view>
        
        <!-- 猜你想搜：最近审核通过的提案课程 -->
        <template v-if="guessList.length">
          <view class="section-header" style="margin-top: 60rpx;">
            <text class="section-title">猜你想搜</text>
          </view>
          <view class="recommend-list">
            <view
              v-for="(name, index) in guessList"
              :key="index"
              class="recommend-item" hover-class="result-hover"
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
import BackBtn from "@/components/common/BackBtn.vue";
import { onMounted, onUnmounted, ref, watch, computed } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { http, useThemeStore } from "@/config";
import { useScrollDirection } from "@/composables/useScrollDirection";
const themeStore = useThemeStore();
import type { DtoSearchHistoryVO, DtoProposalVO } from "@/api/data-contracts";
import { DEBOUNCE_DELAY_MS, COLLAPSE_SCROLL_THRESHOLD, EXPAND_SCROLL_THRESHOLD, MAX_HISTORY_SIZE, EXPANDED_ROW_HEIGHT, HEADER_EXPANDED_PADDING, CAMPUS_OPTIONS } from "@/utils/constants";
import type { MixedResult, SuggestItem } from "@/utils/types/search";

// 防抖定时器
let suggestDebounceTimer: ReturnType<typeof setTimeout> | null = null;
const SUGGEST_DEBOUNCE_MS = DEBOUNCE_DELAY_MS; 

const props = defineProps<{
    initialMode?: string
}>();

const mode = computed(() => props.initialMode || ''); // 'add-comment' or empty

// 1. 获取胶囊信息 & 系统信息
const sysInfo = uni.getSystemInfoSync();
// 默认胶囊信息
let menuButtonInfo = { 
    width: 87, 
    height: 32, 
    left: sysInfo.windowWidth - 87 - 10, 
    top: sysInfo.statusBarHeight ? sysInfo.statusBarHeight + 4 : 48, 
    bottom: (sysInfo.statusBarHeight ? sysInfo.statusBarHeight + 4 : 48) + 32, 
    right: sysInfo.windowWidth - 10 
};
try {
    const res = uni.getMenuButtonBoundingClientRect();
    if (res && res.width) {
        menuButtonInfo = {
            width: res.width,
            height: res.height,
            left: res.left,
            top: res.top,
            bottom: res.bottom,
            right: res.right
        };
    }
} catch (e) {}

// 2. 布局常量计算
const NAV_BAR_HEIGHT = menuButtonInfo.bottom + 12; // 胶囊底部 + 间距 = 导航栏高度 (收起态高度)
const HEADER_EXPANDED_HEIGHT = NAV_BAR_HEIGHT + EXPANDED_ROW_HEIGHT + HEADER_EXPANDED_PADDING; // 展开态总高度

// 3. 状态管理
const isCollapsed = ref(false); // 是否收起
const isFocused = ref(false); // 新增：是否聚焦
const isResultMode = ref(false);
const _resumeGuard = ref(false);
const showProposalsList = ref(false);

// Import searchText and placeHolder from useInput
const { searchText, placeHolder } = useInput();

// Import useSuggest
import { useSuggest } from "./index";
const { suggestList, suggestContent } = useSuggest(searchText);

// Merge logic from useChoose
import { useChoose } from "@/pages/find/choose/index";
const { keyword: resultKeyword, jump, rows, page, loading, doSearch, loadProposals, loadMoreProposals, proposalLoading, proposalsLoaded, filterForm, filterOptions, proposalRows } = useChoose();

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
        _resumeGuard.value = true; // 设置保护标记，防止 onInputFocus 误切模式
        
        // 如果数据丢失（如页面被重载），重新搜索
        // 增加 forceRefresh 判断
        if (!rows.value || rows.value.length === 0) {
            performSearch(savedState.searchText);
        }
    }
}

// 暴露给父组件
defineExpose({
    resumeState
});

// Restore from Storage on Show (Might not trigger in Component)
// onShow(() => { ... }) // Removed component level onShow to define proper flow from page

const groupedRows = computed(() => {
    const list = rows.value || [];
    const courses: MixedResult[] = [];
    const proposals: MixedResult[] = [];
    for (const item of list) {
        if (item.resultType === 'proposal') {
            proposals.push(item);
        } else {
            courses.push(item);
        }
    }
    if (showProposalsList.value && proposalRows.value.length > 0) {
        proposals.push(...proposalRows.value);
    }
    return { courses, proposals };
});

const toggleProposalsList = () => {
    showProposalsList.value = true;
    loadProposals(true);
};

// Auto-show proposals when they load and no courses exist
watch(() => groupedRows.value.proposals.length, (proposalCount) => {
    if (proposalCount > 0 && groupedRows.value.courses.length === 0) {
        showProposalsList.value = true;
    }
});

// 筛选状态
const filterState = reactive({
    campuses: [] as string[],
    departments: [] as string[],
    categories: [] as string[]
})
const openDropdown = ref('')
const isDropdownOpen = computed(() => openDropdown.value !== '')

// 院系 / 分类：均通过后端字段建议接口按关键词搜索（后端无全量列表接口，避免硬编码）
const deptKeyword = ref('')
const deptResults = ref<any[]>([])
const categoryKeyword = ref('')
const categoryResults = ref<any[]>([])
let deptTimer: ReturnType<typeof setTimeout> | null = null
let categoryTimer: ReturnType<typeof setTimeout> | null = null

const toggleDropdown = (name: string) => {
    openDropdown.value = openDropdown.value === name ? '' : name
}

const closeDropdown = () => { openDropdown.value = '' }

const toggleCampus = (c: string) => {
    const idx = filterState.campuses.indexOf(c)
    if (idx > -1) filterState.campuses.splice(idx, 1)
    else filterState.campuses.push(c)
}

const removeDepartment = (d: string) => {
    const idx = filterState.departments.indexOf(d)
    if (idx > -1) filterState.departments.splice(idx, 1)
}

const removeCategory = (c: string) => {
    const idx = filterState.categories.indexOf(c)
    if (idx > -1) filterState.categories.splice(idx, 1)
}

async function fetchFieldSuggestions(field: 'department' | 'category', keyword: string): Promise<any[]> {
    try {
        const res: any = await http.ProposalController.proposalFieldSuggestionsList({ keyword, field })
        return (res.data?.data?.suggestions ?? [])
    } catch {
        return []
    }
}

const onDeptSearch = () => {
    if (deptTimer) clearTimeout(deptTimer)
    const kw = deptKeyword.value.trim()
    deptTimer = setTimeout(async () => {
        deptResults.value = kw ? await fetchFieldSuggestions('department', kw) : []
    }, 300)
}

const selectDept = (item: any) => {
    const val = item.value || item.label || ''
    if (val && !filterState.departments.includes(val)) filterState.departments.push(val)
    deptKeyword.value = ''
    deptResults.value = []
}

const onCategorySearch = () => {
    if (categoryTimer) clearTimeout(categoryTimer)
    const kw = categoryKeyword.value.trim()
    categoryTimer = setTimeout(async () => {
        categoryResults.value = kw ? await fetchFieldSuggestions('category', kw) : []
    }, 300)
}

const selectCategory = (item: any) => {
    const val = item.value || item.label || ''
    if (val && !filterState.categories.includes(val)) filterState.categories.push(val)
    categoryKeyword.value = ''
    categoryResults.value = []
}

const resetFilters = () => {
    const isAll = openDropdown.value === 'all'
    if (isAll || openDropdown.value === 'campus') filterState.campuses = []
    if (isAll || openDropdown.value === 'department') filterState.departments = []
    if (isAll || openDropdown.value === 'category') filterState.categories = []
}

const applyFilters = () => {
    openDropdown.value = ''
    filterForm.campus = [...filterState.campuses]
    filterForm.department = [...filterState.departments]
    filterForm.category = [...filterState.categories]
    if (searchText.value && isResultMode.value) performSearch(searchText.value)
}

// 4. 动态样式计算
const headerHeight = computed(() => {
    // 增加一点底部间距，避免紧贴胶囊
    return menuButtonInfo.bottom + 12;
});

const refinedSearchBarWrapperStyle = computed(() => {
    const gap = uni.upx2px(32);
    const paddingRight = (sysInfo.windowWidth - menuButtonInfo.left) + gap;
    
    return {
        height: headerHeight.value + 'px',
        paddingTop: menuButtonInfo.top + 'px',
        paddingBottom: '12px',
        paddingRight: paddingRight + 'px',
    };
});

const searchBarWrapperStyle = refinedSearchBarWrapperStyle;

// 5. 滚动监听
const { isScrollingDown, onScroll: handleScrollDirection } = useScrollDirection(30)
const isFilterHidden = ref(false)
let lastScrollTop = 0

// 筛选条实际高度 = 上下 padding(12rpx*2) + 胶囊高度(56rpx)
const FILTER_BAR_HEIGHT = uni.upx2px(80)
// 目标可见留白：与搜索栏底部 padding(12px) 一致。
// 筛选栏自身还带有 12rpx 底部内边距（已含在 FILTER_BAR_HEIGHT 中），需扣除，
// 这样「筛选栏→首卡」的可见间距才真正等于「搜索栏→筛选栏」。
const FIRST_CARD_GAP = Math.max(0, 12 - uni.upx2px(12))
const contentPaddingTop = computed(() => {
    if (!isResultMode.value) return headerHeight.value + 'px'
    const filterHeight = isFilterHidden.value ? 0 : FILTER_BAR_HEIGHT
    return (headerHeight.value + filterHeight + FIRST_CARD_GAP) + 'px'
})

interface ScrollDetail { detail?: { scrollTop?: number } }
const onScroll = (e: ScrollDetail) => {
    const top = e.detail.scrollTop ?? 0
    
    // 检测滚动方向
    handleScrollDirection(e)
    
    // 根据滚动方向控制筛选栏显隐
    if (top > 50) {
        isFilterHidden.value = isScrollingDown.value
    } else {
        isFilterHidden.value = false
    }
    
    // 原有的 header 收起逻辑
    if (top > COLLAPSE_SCROLL_THRESHOLD && !isCollapsed.value) {
        isCollapsed.value = true;
    } else if (top < EXPAND_SCROLL_THRESHOLD && isCollapsed.value) {
        isCollapsed.value = false;
    }
}

// 获取搜索历史
const historyList = ref<string[]>(uni.getStorageSync('searchHistory') || []);

function fetchSearchHistory() {
    return http.SearchController.searchRecentList().then((res) => {
        const histories = res.data?.data?.histories || [];
        historyList.value = histories.map((h: DtoSearchHistoryVO) => {
            if (typeof h === 'string') return h;
            return h?.query;
        }).filter((h: string | undefined) => h && typeof h === 'string');
    }).catch((err) => {
        console.error('[find] fetchSearchHistory error:', err);
    });
}

// 猜你想搜：展示最近审核通过的提案对应课程，确保能搜到且便于评论
const GUESS_PROPOSAL_LIMIT = 6;
const guessList = ref<string[]>([]);

function fetchGuessProposals() {
    return http.ProposalController.proposalListList({ status: 'approved', page: 1, pageSize: 20 })
        .then((res) => {
            const proposals = ((res.data as any)?.data?.proposals ?? []) as DtoProposalVO[];
            const sorted = [...proposals].sort((a, b) => {
                const ta = new Date(b.updatedAt || b.createdAt || 0).getTime();
                const tb = new Date(a.updatedAt || a.createdAt || 0).getTime();
                return ta - tb;
            });
            const names: string[] = [];
            const seen = new Set<string>();
            for (const p of sorted) {
                const name = (p.finalCourse?.name || p.course?.name || p.title || '').trim();
                if (!name) continue;
                const key = name.toLowerCase();
                if (seen.has(key)) continue;
                seen.add(key);
                names.push(name);
                if (names.length >= GUESS_PROPOSAL_LIMIT) break;
            }
            guessList.value = names;
        })
        .catch((err) => {
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
});

// 方法定义
const goBack = () => {
    // If in result mode, go back to explore mode
    if (isResultMode.value) {
        isResultMode.value = false;
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
    uni.removeStorageSync('find_page_state'); // Clear stored state
    // Focus optional - actually we might want to focus input
    // so user can type immediately
};

const onInputFocus = () => {
    isFocused.value = true;
    // 如果刚从详情页返回，保护标记生效，不要切走结果模式
    if (_resumeGuard.value) {
        _resumeGuard.value = false;
        return;
    }
    if (isResultMode.value) {
        // Exit result mode to show History/Suggestions
        isResultMode.value = false;
        // The text remains in the box so suggestList will likely show
    }
};

// 用户输入时触发模糊搜索建议（带防抖）
const onInputChange = () => {
    if (suggestDebounceTimer) {
        clearTimeout(suggestDebounceTimer);
    }
    suggestDebounceTimer = setTimeout(() => {
        if (searchText.value && searchText.value.length > 0) {
            if (isResultMode.value) {
                isResultMode.value = false;
            }
            suggestContent(0);
        }
    }, SUGGEST_DEBOUNCE_MS);
};

// 提取通用搜索逻辑，允许传入特定关键词而不改变输入框内容
const performSearch = (keyword: string) => {
    if (!keyword) return;

    // Close toggles from previous search
    showProposalsList.value = false;
    proposalsLoaded.value = false;

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
    if(resultKeyword && resultKeyword.value !== undefined) {
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
const onScrollToLower = () => {
    if (!isResultMode.value) return;
    handleScrollBottom();
};

const handleScrollBottom = () => {
    if (showProposalsList.value) {
        if (proposalLoading.value) return;
        loadMoreProposals();
    } else {
        if (loading.value) return;
        page.value++;
        doSearch(false);
    }
};

// 跳转到提案页面
const goToProposal = () => {
    uni.navigateTo({
        url: '/pages/proposal/propose/propose' 
    });
};

// 提案卡片点击
const clickProposal = (proposal: Record<string, unknown>) => {
    const dataStr = encodeURIComponent(JSON.stringify(proposal));
    // 强制跳转到 course/proposal-detail
    uni.navigateTo({
        url: `/pages/course/proposal-detail/index?data=${dataStr}`,
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
    if (item.type === 'proposal' || item.resultType === 'proposal' || item.voteCount !== undefined) {
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
            url: `/pages/course/comment/index?data=${dataStr}`
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
}

// 处理建议项点击
const handleSuggestClick = (item: SuggestItem) => {
    searchText.value = item.name || '';
    performSearch(item.name || '');
};
</script>


<style lang="scss" scoped src="./_style.scss" />
