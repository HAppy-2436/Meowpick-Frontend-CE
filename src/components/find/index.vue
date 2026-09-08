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
            <!-- 左侧：返回按钮 (直接上移) -->
            <view class="nav-back-btn" @click="goBack" :style="navBackBtnStyle">
                <BackBtn />
            </view>

            <!-- 中间：搜索框 (上移同时控制右边距) -->
            <view class="search-input-box" :style="searchInputBoxStyle">
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
                <view v-if="searchText" class="clear-icon" @click="clearSearch">
                    <text class="clear-text">×</text>
                </view>
            </view>

            <!-- 移除右侧搜索按钮 -->
        </view>
        
        <!-- Filter Bar (Only in Result Mode) -->
        <!-- Inject into header so it stays fixed if needed, or put in scroll view? -->
        <!-- Design choice: usually filter bar is below header. -->
        <!-- But to stick, we can put it here if we want sticky header behavior easily. -->
        <!-- Let's put it in the header container but only visible when Result Mode -->
                <view v-if="isResultMode" class="filter-bar-wrapper" :style="{ top: headerHeight + 'px' }">
                    <view class="filter-bar">
                        <view 
                            class="filter-item" 
                            :class="{ active: currentSort === 'default' }"
                            @click="changeSort('default')"
                        >综合</view>
                        <view 
                            class="filter-item" 
                            :class="{ active: currentSort === 'hot' }"
                            @click="changeSort('hot')"
                        >热度</view>
                        <view 
                            class="filter-item" 
                            :class="{ active: currentSort === 'time' }"
                            @click="changeSort('time')"
                        >时间</view>

                        <view class="filter-action" @click="toggleFilterPanel">
                            <image src="@/images/choose-icon.png" style="width:28rpx;height:28rpx;margin-right:8rpx;" />
                            <text>筛选</text>
                        </view>
                    </view>

                    <!-- Filter panel overlay -->
                    <!-- 修改：Dropdown 模式 -->
                    <!-- 遮罩层：top offset by headerHeight + filterBarHeight (approx 44px) -->
                    <!-- 其实可以直接放在 filter-bar-wrapper 内部，利用 absolute 定位 -->
                    <view v-if="showFilterPanel" 
                        class="mask-overlay" 
                        @click="toggleFilterPanel"
                        :style="{ top: (headerHeight + 44) + 'px' }"
                    >
                        <view class="dropdown-panel" @click.stop>
                            <!-- Remove Header with title/close as it's a dropdown now -->
                            
                            <scroll-view scroll-y class="dropdown-scroll-content">
                                <view class="filter-group">
                                    <text class="group-title">校区选择</text>
                                    <view class="tags-container">
                                        <view 
                                            class="filter-tag" 
                                            :class="{ active: filterState.campuses.includes('闵行') }" 
                                            @click="toggleCampus('闵行')"
                                        >闵行校区</view>
                                        <view 
                                            class="filter-tag" 
                                            :class="{ active: filterState.campuses.includes('普陀') }" 
                                            @click="toggleCampus('普陀')"
                                        >普陀校区</view>
                                    </view>
                                </view>

                                <view class="filter-group">
                                    <text class="group-title">内容类型</text>
                                    <view class="tags-container">
                                        <view 
                                            class="filter-tag" 
                                            :class="{ active: filterState.types.includes('course') }" 
                                            @click="toggleType('course')"
                                        >课程评价</view>
                                        <view 
                                            class="filter-tag" 
                                            :class="{ active: filterState.types.includes('proposal') }" 
                                            @click="toggleType('proposal')"
                                        >新课提议</view>
                                    </view>
                                </view>
                            </scroll-view>

                            <view class="dropdown-footer">
                                <button class="btn-common btn-reset" @click="resetFilters">重置</button>
                                <button class="btn-common btn-confirm" @click="applyFilters">确定</button>
                            </view>
                        </view>
                    </view>

                </view>
    </view>

    <!-- 内容区域 -->
    <scroll-view 
        scroll-y 
        class="content-scroll" 
        :style="{ paddingTop: isResultMode ? (headerHeight + 44) + 'px' : headerHeight + 'px' }" 
        @scroll="onScroll"
        @scrolltolower="isResultMode ? handleScrollBottom : () => {}"
    >
      
      <!-- 场景 A: 有搜索词且不在结果模式 -> 显示建议列表 -->
      <view v-if="searchText && !isResultMode" class="suggest-section">
          <!-- 这里使用真实的模糊搜索列表展示 -->
        <view
          v-for="(item, index) in suggestList"
          :key="index"
          class="suggest-item"
          :class="{ 'suggest-item-input': item.type === 'input' }"
          @click="handleSuggestClick(item)"
        >
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
        <view v-if="loading" class="loading-section">
          <view class="loading-spinner" />
          <text class="loading-text">搜索中...</text>
        </view>
        <view v-else class="list-content" style="padding-top: 15rpx;">
                <!-- Courses Section -->
                <view class="group-section" v-if="groupedRows.courses.length">
                    <view class="group-title">课程</view>
                    <view v-for="(item, idx) in groupedRows.courses" :key="item.id" class="result-card" @click="onResultClick(item)">
                        <view class="result-card-wrapper course-card">
                            <choose-course :data="item" variant="course" />
                        </view>
                    </view>
                </view>

                <!-- 课程列表底部（无课程时也显示到底了） -->
                <template v-if="!showProposalsList">
                    <view class="bottom">--- 到底了哟 ---</view>
                    <view class="transition-text">没有找到心仪的课程？</view>
                    <view class="show-proposals-tip" @click="toggleProposalsList">
                        <text>查看其他同学的建课提议</text>
                        <image src="@/images/go-back.png" class="tip-arrow" />
                    </view>
                </template>

                <!-- Proposals Section (点击后，始终显示底部按钮) -->
                <template v-if="showProposalsList">
                    <view class="group-section" v-if="groupedRows.proposals.length">
                        <view class="group-title">提议</view>
                        <view v-for="(item, idx) in groupedRows.proposals" :key="item.id" class="result-card" @click="onResultClick(item)">
                            <view class="result-card-wrapper proposal-card">
                                <choose-course :data="item" variant="proposal" />
                            </view>
                        </view>
                    </view>
                    <view class="bottom">--- 到底了哟 ---</view>
                    <view class="transition-text">以上提议都不是你想要的？</view>
                    <view class="new-card" @click="goToProposal">
                        <text class="new-card-text">亲自提议新课程</text>
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
          <view class="clear-history" @click="clearHistory">
             🗑️ <!-- 暂时用 emoji 替代图标 -->
          </view>
        </view>
        
        <view class="history-tags">
            <view 
              v-for="(tag, index) in historyList" 
              :key="index" 
              class="tag-item"
              @click="clickHistory(tag)"
            >
              {{ tag }}
            </view>
            <view v-if="historyList.length === 0" class="no-history">暂无搜索记录</view>
        </view>
        
        <!-- 猜你想搜 -->
        <view class="section-header" style="margin-top: 60rpx;">
          <text class="section-title">猜你想搜</text>
        </view>
        <view class="recommend-list">
           <view 
              v-for="(item, index) in hotList" 
              :key="index" 
              class="recommend-item"
              @click="clickRecommend(item.keyword)"
            >
              <view class="recommend-icon">
                 <text class="mini-icon">🔍</text>
              </view>
              <text class="recommend-word">{{ item.keyword }}</text>
              <text class="recommend-tag" v-if="item.tag">{{ item.tag }}</text>
           </view>
        </view>

      </view>

    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import BackBtn from "@/components/common/BackBtn.vue";
import { onMounted, onUnmounted, ref, watch, computed } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { http, useThemeStore } from "@/config";
const themeStore = useThemeStore();
import type { DtoSearchHistoryVO, DtoSearchSuggestionsVO } from "@/api/data-contracts";
import { DEBOUNCE_DELAY_MS, COLLAPSE_SCROLL_THRESHOLD, EXPAND_SCROLL_THRESHOLD, MAX_HISTORY_SIZE, DEFAULT_HOT_RECOMMENDATIONS, EXPANDED_ROW_HEIGHT, HEADER_EXPANDED_PADDING } from "@/utils/constants";
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
const isResultMode = ref(false); // New State: Toggle between Search/Explore and Results
const _resumeGuard = ref(false); // 从详情页返回时的保护标记，防止 onInputFocus 误切模式
const currentSort = ref('default'); // From Result Page
const showProposalsList = ref(false);

// Import searchText and placeHolder from useInput
const { searchText, placeHolder } = useInput();

// Import useSuggest
import { useSuggest } from "./index";
const { suggestList, suggestContent } = useSuggest(searchText);

// Merge logic from useChoose
import { useChoose } from "@/pages/find/choose/index";
const { keyword: resultKeyword, jump, rows, page, loading, doSearch, loadProposals, loadMoreProposals, proposalLoading, proposalsLoaded, filterCampus, filterDepart, proposalRows } = useChoose();

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
    if (!proposalsLoaded.value) {
        loadProposals(true);
    }
    showProposalsList.value = true;
};

// Auto-show proposals when they load and no courses exist
watch(() => groupedRows.value.proposals.length, (proposalCount) => {
    if (proposalCount > 0 && groupedRows.value.courses.length === 0) {
        showProposalsList.value = true;
    }
});

// Local filter panel state
const showFilterPanel = ref(false)
const filterState = reactive({
    campuses: [] as string[],
    types: [] as string[]
})

const toggleFilterPanel = () => {
    showFilterPanel.value = !showFilterPanel.value
}

const toggleCampus = (c: string) => {
    const idx = filterState.campuses.indexOf(c)
    if (idx > -1) filterState.campuses.splice(idx, 1)
    else filterState.campuses.push(c)
}

const toggleType = (t: string) => {
    const idx = filterState.types.indexOf(t)
    if (idx > -1) filterState.types.splice(idx, 1)
    else filterState.types.push(t)
}

const resetFilters = () => {
    filterState.campuses = []
    filterState.types = []
    showFilterPanel.value = false
    // 重置后重新搜索
    if (searchText.value && isResultMode.value) {
        performSearch(searchText.value)
    }
}

const applyFilters = () => {
    showFilterPanel.value = false
    // 筛选后重新搜索（会带上新的 filterState）
    if (searchText.value && isResultMode.value) {
        performSearch(searchText.value)
    }
}

// 4. 动态样式计算
const headerHeight = computed(() => {
    // 增加一点底部间距，避免紧贴胶囊
    return menuButtonInfo.bottom + 12;
});

const refinedSearchBarWrapperStyle = computed(() => {
    const gap = uni.upx2px(32);
    // 右侧留白 = 胶囊区域宽度 (windowWidth - menuButtonInfo.left) + 32rpx 间距
    const paddingRight = (sysInfo.windowWidth - menuButtonInfo.left) + gap;
    
    return {
        // 修改：这里原来似乎有问题，height 设为 headerHeight 会导致它被挤扁如果父容器也是这个高度
        // 其实父容器 dynamic-header 的高度也是 headerHeight
        // wrapper 应该也是这个高度
        height: headerHeight.value + 'px',
        display: 'flex',
        alignItems: 'center', // 修正：垂直居中，而不是 flex-start
        // paddingTop: menuButtonInfo.top + 'px', // 修正：移除 paddingTop，改用 top 定位或 flex 居中
        // 如果用 paddingTop 顶下来，内容高度会被挤压。
        // 我们应该让 search-bar-wrapper 绝对定位或者充满 header
        // 实际上 search-bar-wrapper 已经是 absolute left 0 width 100%。
        // 它的高度完全等于 headerHeight。
        // 它的内容应该位于 menuButton 的水平线上。
        // menuButton 的 top 是已知的。
        // 我们可以让 search-input-box 的 marginTop 等于 menuButton.top
        // 或者更简单的，让 wrapper 顶对齐，paddingTop = menuButton.top, height = bottom + 12
        paddingTop: menuButtonInfo.top + 'px', 
        paddingBottom: '12px', // 底部留白
        paddingLeft: '32rpx', 
        paddingRight: paddingRight + 'px',
        boxSizing: 'border-box'
    };
});

const navBackBtnStyle = computed(() => {
    return {
        height: menuButtonInfo.height + 'px',
        width: menuButtonInfo.height + 'px', 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: '12rpx'
    };
});

// 计算 input box 的宽度和位置
const refinedSearchInputBoxStyle = computed((): Record<string, string> => {
    return {
        height: menuButtonInfo.height + 'px',
        flex: '1',
        borderRadius: (menuButtonInfo.height / 2) + 'px',
        backgroundColor: '#f5f5f5',
        display: 'flex',
        alignItems: 'center',
        padding: '0 24rpx',
        border: isFocused.value ? '2rpx solid #b20035' : '2rpx solid #e0e0e0',
        boxShadow: isFocused.value ? '0 4rpx 12rpx rgba(178, 0, 53, 0.1)' : 'none',
        transition: 'all 0.12s ease',
        boxSizing: 'border-box'
    }
});

const searchBarWrapperStyle = refinedSearchBarWrapperStyle;
const searchInputBoxStyle = refinedSearchInputBoxStyle;

// 5. 滚动监听
interface ScrollDetail { detail?: { scrollTop?: number } }
const onScroll = (e: ScrollDetail) => {
    // 简单的阈值判定：下滑超过 20px 即收起
    const top = e.detail.scrollTop;
    
    // 防抖或节流可以优化性能，这里简化直接判断
    if (top > COLLAPSE_SCROLL_THRESHOLD && !isCollapsed.value) {
        isCollapsed.value = true;
    } else if (top < EXPAND_SCROLL_THRESHOLD && isCollapsed.value) {
        // 只有回到顶部才展开
        isCollapsed.value = false;
    }
};

// 获取搜索历史
const historyList = ref<string[]>(uni.getStorageSync('searchHistory') || []);
const hotList = ref<{ keyword: string; tag: string }[]>([]);

function fetchSearchHistory() {
    http.SearchController.searchRecentList().then((res) => {
        const histories = res.data?.data?.histories || [];
        historyList.value = histories.map((h: DtoSearchHistoryVO) => {
            if (typeof h === 'string') return h;
            return h?.query;
        }).filter((h: string | undefined) => h && typeof h === 'string');
    }).catch((err) => {
        console.error('[find] fetchSearchHistory error:', err);
    });
}

// 获取猜你想搜的推荐（从搜索建议 API 获取）
function fetchHotRecommendations() {
    const defaultKeywords = ['课程', '老师', '必修', '选修'];
    const recommendations: { keyword: string; tag: string }[] = [];

    Promise.all(defaultKeywords.map(keyword =>
        http.SearchController.searchSuggestList({ keyword })
            .then((res) => res?.data?.data?.suggestions || [])
            .catch(() => [])
    )).then(results => {
        results.forEach((suggestions: DtoSearchSuggestionsVO[]) => {
            if (Array.isArray(suggestions)) {
                suggestions.slice(0, 3).forEach((item: DtoSearchSuggestionsVO) => {
                    if (item?.name) {
                        recommendations.push({ keyword: item.name, tag: item.type === 'course' ? '课程' : '教师' });
                    }
                });
            }
        });
        // Use API results if available, even if fewer than expected
        if (recommendations.length > 0) {
            hotList.value = recommendations.slice(0, 6);
        } else {
            hotList.value = DEFAULT_HOT_RECOMMENDATIONS;
        }
    }).catch(() => {
        // Only use fallback if API call failed
        hotList.value = DEFAULT_HOT_RECOMMENDATIONS;
    });
}

onMounted(() => {
    fetchSearchHistory();
    fetchHotRecommendations();
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

// 排序方式切换
const changeSort = (sortType: string) => {
    if (currentSort.value === sortType) return;
    uni.showToast({ title: '功能正在开发中', icon: 'none' });
};

// 滚动到底部加载更多（加 loading 守卫防止重复触发）
const handleScrollBottom = () => {
    if (!isResultMode.value || loading.value) return;
    if (showProposalsList.value) {
        loadMoreProposals();
    } else {
        page.value++;
        doSearch(false, currentSort.value);
    }
};

// 跳转到提议页面
const goToProposal = () => {
    uni.navigateTo({
        url: '/pages/proposal/propose/propose' 
    });
};

// 提议卡片点击
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
