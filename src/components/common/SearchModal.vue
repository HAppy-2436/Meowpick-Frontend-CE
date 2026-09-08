<template>
  <view v-if="visible" class="search-modal" @click="handleClose">
    <view class="search-modal__sheet" @click.stop>
      <view class="search-modal__header">
        <text class="search-modal__title">{{ title }}</text>
        <view class="search-modal__close" @click="handleClose">×</view>
      </view>

      <view class="search-modal__input-row">
        <view class="search-modal__input-box">
          <text class="search-modal__input-icon">🔍</text>
          <input
            class="search-modal__input"
            v-model="keyword"
            :placeholder="placeholder"
            placeholder-class="mwp-placeholder"
            confirm-type="search"
            @input="handleSearch"
          />
        </view>
        <view
          v-if="allowAdd && keyword.trim()"
          class="search-modal__add-btn mwp-pressable"
          @click="handleAddNew"
        >
          <text class="search-modal__add-icon">+</text>
          <text class="search-modal__add-text">新增</text>
        </view>
      </view>

      <scroll-view scroll-y class="search-modal__results">
        <view v-if="loading" class="search-modal__loading">
          <view class="search-modal__spinner"></view>
          <text class="search-modal__loading-text">搜索中...</text>
        </view>

        <template v-else-if="results.length">
          <view
            v-for="(item, idx) in results"
            :key="idx"
            class="search-modal__item mwp-stagger-item mwp-pressable"
            :style="{ animationDelay: `${Math.min(idx * 40, 240)}ms` }"
            @click="handleSelect(item)"
          >
            <text class="search-modal__item-label">{{ item.label || item.value }}</text>
            <view v-if="field === 'teacherName' && item.courses && item.courses.length" class="search-modal__courses">
              <text
                v-for="(c, ci) in item.courses.slice(0, 2)"
                :key="ci"
                class="search-modal__course-tag"
              >
                {{ c.name }}
              </text>
            </view>
          </view>
        </template>

        <view v-else-if="keyword.trim()" class="search-modal__no-result">
          <text class="search-modal__no-result-text">
            未找到匹配项
            <text v-if="allowAdd">，可点击"新增"添加</text>
          </text>
        </view>

        <view v-else class="search-modal__placeholder">
          <text class="search-modal__placeholder-text">输入关键词开始搜索</text>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup lang="ts">
/**
 * 通用字段搜索弹窗（提案填写用）
 *
 * 字段：
 *   department / category / campus / courseName / courseCode / teacherName
 *
 * 用法：
 *   <SearchModal
 *     v-model:visible="show"
 *     field="department"
 *     title="选择开课院系"
 *     placeholder="请输入开课院系"
 *     :allow-add="true
 *     @select="(item) => formData.department = item.value"
 *   />
 */
import { ref, watch } from "vue";
import { http } from "@/config";
import type { FieldSuggestionVO } from "@/api/data-contracts";

const props = withDefaults(
  defineProps<{
    visible: boolean;
    field: "department" | "category" | "campus" | "courseName" | "courseCode" | "teacherName";
    title: string;
    placeholder: string;
    /** 是否允许"新增"按钮 */
    allowAdd?: boolean;
    /** 多选模式（未启用，但预留） */
    multiple?: boolean;
  }>(),
  { allowAdd: true, multiple: false }
);

const emit = defineEmits<{
  "update:visible": [val: boolean];
  select: [item: FieldSuggestionVO];
  close: [];
}>();

const keyword = ref("");
const results = ref<FieldSuggestionVO[]>([]);
const loading = ref(false);
let searchTimer: ReturnType<typeof setTimeout> | null = null;

watch(
  () => props.visible,
  (val) => {
    if (val) {
      keyword.value = "";
      results.value = [];
    }
  }
);

const fetchSuggestions = async (kw: string) => {
  if (!kw) {
    results.value = [];
    return;
  }
  loading.value = true;
  try {
    const res: any = await http.ProposalController.proposalFieldSuggestionsList({
      field: props.field,
      keyword: kw,
      page: 0,
      pageSize: 50,
    });
    const data = res.data?.data;
    const list = (data?.suggestions ?? data?.data?.suggestions ?? []) as FieldSuggestionVO[];
    results.value = list;
  } catch (err) {
    console.error("[SearchModal] fetch suggestions failed:", err);
    results.value = [];
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  const kw = keyword.value.trim();
  if (searchTimer) clearTimeout(searchTimer);
  if (!kw) {
    results.value = [];
    return;
  }
  searchTimer = setTimeout(() => fetchSuggestions(kw), 300);
};

const handleSelect = (item: FieldSuggestionVO) => {
  emit("select", item);
  emit("update:visible", false);
};

const handleAddNew = () => {
  const value = keyword.value.trim();
  if (!value) {
    uni.showToast({ title: "请输入内容", icon: "none" });
    return;
  }
  emit("select", { value, label: value });
  emit("update:visible", false);
};

const handleClose = () => {
  emit("close");
  emit("update:visible", false);
};
</script>

<style lang="scss" scoped>
@import "@/styles/index.scss";

.search-modal {
  position: fixed;
  inset: 0;
  background: $bg-overlay-light;
  z-index: $z-modal;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  animation: mwp-fade-in 240ms $ease-standard both;
}

.search-modal__sheet {
  width: 100%;
  max-height: 85vh;
  background: $bg-card-light;
  border-radius: $radius-2xl $radius-2xl 0 0;
  padding: $space-7;
  display: flex;
  flex-direction: column;
  animation: mwp-slide-up 360ms $ease-decelerate both;
  transition: background-color $dur-medium $ease-standard;

  .dark-theme & {
    background: $bg-card-dark;
  }
}

.search-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: $space-7;
  flex-shrink: 0;
}

.search-modal__title {
  font-size: $font-xl;
  font-weight: $weight-bold;
  color: $text-primary-light;
  @include ellipsis;
  transition: color $dur-fast $ease-standard;

  .dark-theme & {
    color: $text-primary-dark;
  }
}

.search-modal__close {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: $font-2xl;
  color: $text-tertiary-light;
  transition: all $dur-fast $ease-standard;

  .dark-theme & {
    color: $text-tertiary-dark;
  }

  &:active {
    background: $bg-muted-light;
    transform: scale($press-scale-lg);
    .dark-theme & {
      background: $bg-muted-dark;
    }
  }
}

.search-modal__input-row {
  display: flex;
  align-items: center;
  gap: $space-4;
  margin-bottom: $space-7;
  flex-shrink: 0;
}

.search-modal__input-box {
  flex: 1;
  display: flex;
  align-items: center;
  gap: $space-3;
  height: 80rpx;
  padding: 0 $space-5;
  background: $bg-muted-light;
  border: 2rpx solid transparent;
  border-radius: $radius-pill;
  transition: all $dur-fast $ease-standard;

  .dark-theme & {
    background: $bg-muted-dark;
  }

  &:focus-within {
    background: $bg-card-light;
    border-color: rgba(178, 0, 53, 0.30);
    box-shadow: 0 0 0 4rpx rgba(178, 0, 53, 0.08);
    .dark-theme & {
      background: $bg-card-dark;
    }
  }
}

.search-modal__input-icon {
  font-size: $font-lg;
  opacity: 0.5;
  flex-shrink: 0;
}

.search-modal__input {
  flex: 1;
  font-size: $font-base;
  color: $text-primary-light;
  background: transparent;
  border: none;
  outline: none;
  height: 100%;

  .dark-theme & {
    color: $text-primary-dark;
  }
}

.search-modal__add-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4rpx;
  padding: $space-2 $space-5;
  background: $danger-soft;
  border: 1rpx solid rgba(178, 0, 53, 0.20);
  border-radius: $radius-md;
  min-width: 96rpx;
  flex-shrink: 0;
  transition: all $dur-fast $ease-standard;

  &:active {
    transform: scale($press-scale-md);
  }
}

.search-modal__add-icon {
  font-size: $font-xl;
  color: $brand-red;
  font-weight: $weight-bold;
  line-height: 1;
}

.search-modal__add-text {
  font-size: $font-xs;
  color: $brand-red;
  font-weight: $weight-medium;
}

.search-modal__results {
  flex: 1;
  max-height: 60vh;
}

.search-modal__loading,
.search-modal__no-result,
.search-modal__placeholder {
  padding: $space-12 $space-7;
  text-align: center;
}

.search-modal__spinner {
  width: 60rpx;
  height: 60rpx;
  margin: 0 auto $space-5;
  border: 4rpx solid rgba(178, 0, 53, 0.20);
  border-top-color: $brand-red;
  border-radius: 50%;
  animation: mwp-spin 800ms linear infinite;
}

.search-modal__loading-text {
  font-size: $font-base;
  color: $text-tertiary-light;
  .dark-theme & {
    color: $text-tertiary-dark;
  }
}

.search-modal__no-result-text,
.search-modal__placeholder-text {
  font-size: $font-base;
  color: $text-tertiary-light;
  .dark-theme & {
    color: $text-tertiary-dark;
  }
}

.search-modal__item {
  padding: $space-7 $space-5;
  border-bottom: 1rpx solid $divider-light;
  border-radius: $radius-md;
  transition: background-color $dur-fast $ease-standard;

  .dark-theme & {
    border-bottom-color: $divider-dark;
  }

  &:active {
    background: $bg-muted-light;
    .dark-theme & {
      background: $bg-muted-dark;
    }
  }

  &:last-child {
    border-bottom: none;
  }
}

.search-modal__item-label {
  font-size: $font-base;
  color: $text-primary-light;
  font-weight: $weight-medium;
  transition: color $dur-fast $ease-standard;

  .dark-theme & {
    color: $text-primary-dark;
  }
}

.search-modal__courses {
  display: flex;
  flex-wrap: wrap;
  gap: $space-2;
  margin-top: $space-3;
  padding-left: $space-4;
}

.search-modal__course-tag {
  font-size: $font-xs;
  color: $text-secondary-light;
  background: $bg-muted-light;
  padding: 4rpx $space-3;
  border-radius: $radius-xs;
  transition: all $dur-fast $ease-standard;

  .dark-theme & {
    color: $text-secondary-dark;
    background: $bg-muted-dark;
  }
}

@media (prefers-reduced-motion: reduce) {
  .search-modal,
  .search-modal__sheet,
  .search-modal__spinner,
  .search-modal__item {
    animation: none;
  }
}
</style>