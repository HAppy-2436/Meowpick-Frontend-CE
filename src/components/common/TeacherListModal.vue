<template>
  <view v-if="visible" class="teacher-list-modal" @click="handleClose">
    <view class="teacher-list-modal__sheet" @click.stop>
      <view class="teacher-list-modal__header">
        <text class="teacher-list-modal__title">授课教师</text>
        <view
          class="teacher-list-modal__close"
          hover-class="mwp-hover"
          @click="handleClose"
          >×</view
        >
      </view>

      <scroll-view scroll-y class="teacher-list-modal__body">
        <view class="teacher-list-modal__inner">
          <!-- 已添加教师 -->
          <view v-if="teachers.length" class="teacher-list">
            <view v-for="(t, idx) in teachers" :key="idx" class="teacher-item">
              <view class="teacher-info">
                <text class="teacher-name">{{ t.name }}</text>
                <text v-if="t.title" class="teacher-title">{{ t.title }}</text>
                <text v-if="t.department" class="teacher-dept">{{
                  t.department
                }}</text>
              </view>
              <view
                class="teacher-remove mwp-pressable"
                hover-class="mwp-hover"
                @click.stop="handleRemove(idx)"
              >
                <text>×</text>
              </view>
            </view>
          </view>

          <EmptyState
            v-else
            title="暂无教师信息"
            desc="请在下方添加授课教师"
            compact
          />

          <!-- 内联添加表单 -->
          <view class="add-form">
            <text class="add-form__title">添加教师</text>

            <text class="form-label">教师姓名</text>
            <view class="form-input-wrapper">
              <text class="form-input-icon">🔍</text>
              <input
                v-model="nameKeyword"
                class="form-input"
                placeholder="请输入教师姓名"
                placeholder-class="mwp-placeholder"
                @input="handleNameSearch"
              />
            </view>
            <scroll-view
              v-if="nameOptions.length || nameLoading"
              scroll-y
              class="form-options"
            >
              <view v-if="nameLoading" class="form-loading">
                <view class="form-spinner" />
                <text class="form-loading-text">搜索中...</text>
              </view>
              <template v-else>
                <view
                  v-for="(name, idx) in nameOptions"
                  :key="idx"
                  class="form-option mwp-pressable"
                  :class="{ 'is-selected': selectedName === name }"
                  hover-class="mwp-hover"
                  @click="selectName(name)"
                >
                  <text>{{ name }}</text>
                  <text v-if="selectedName === name" class="form-option__check"
                    >✓</text
                  >
                </view>
              </template>
            </scroll-view>

            <text class="form-label">所属院系 (选填)</text>
            <view class="form-input-wrapper">
              <text class="form-input-icon">🔍</text>
              <input
                v-model="deptKeyword"
                class="form-input"
                placeholder="搜索院系"
                placeholder-class="mwp-placeholder"
                @input="handleDeptSearch"
              />
            </view>
            <scroll-view
              v-if="deptOptions.length || deptLoading"
              scroll-y
              class="form-options"
            >
              <view v-if="deptLoading" class="form-loading">
                <view class="form-spinner" />
                <text class="form-loading-text">搜索中...</text>
              </view>
              <template v-else>
                <view
                  v-for="(dept, idx) in deptOptions"
                  :key="idx"
                  class="form-option mwp-pressable"
                  :class="{ 'is-selected': selectedDept === dept }"
                  hover-class="mwp-hover"
                  @click="selectDept(dept)"
                >
                  <text>{{ dept }}</text>
                  <text v-if="selectedDept === dept" class="form-option__check"
                    >✓</text
                  >
                </view>
              </template>
            </scroll-view>
          </view>
        </view>
      </scroll-view>

      <view class="teacher-list-modal__footer">
        <view
          class="add-btn mwp-pressable"
          :class="{ 'is-disabled': !canAdd }"
          hover-class="mwp-hover"
          @click="handleAdd"
        >
          <PlusIcon class="add-icon" size="32rpx" thickness="4rpx" />
          <text class="add-text">确定添加</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
/**
 * 授课教师弹窗（提案填写用）
 * 列表 + 内联添加表单合一，避免叠层弹窗。
 */
import { ref, watch, computed } from 'vue';
import { http } from '@/config';
import type { DtoTeacherVO } from '@/api/data-contracts';

export interface TeacherDraft {
  name: string;
  title?: string;
  department: string;
  teacherId?: string;
}

const props = defineProps<{
  visible: boolean;
  teachers: DtoTeacherVO[];
}>();

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void;
  (e: 'add', teacher: TeacherDraft): void;
  (e: 'remove', index: number): void;
  (e: 'close'): void;
}>();

const nameKeyword = ref('');
const deptKeyword = ref('');
const selectedName = ref('');
const selectedDept = ref('');
const nameOptions = ref<string[]>([]);
const deptOptions = ref<string[]>([]);
const nameLoading = ref(false);
const deptLoading = ref(false);
let nameTimer: ReturnType<typeof setTimeout> | null = null;
let deptTimer: ReturnType<typeof setTimeout> | null = null;

// 姓名必填；院系选填（后端 department 可为空）
const canAdd = computed(() => nameKeyword.value.trim() !== '');

const resetForm = () => {
  nameKeyword.value = '';
  deptKeyword.value = '';
  selectedName.value = '';
  selectedDept.value = '';
  nameOptions.value = [];
  deptOptions.value = [];
  nameLoading.value = false;
  deptLoading.value = false;
};

watch(
  () => props.visible,
  (val) => {
    if (val) resetForm();
  }
);

const fetchName = async (keyword: string) => {
  if (!keyword) {
    nameOptions.value = [];
    return;
  }
  nameLoading.value = true;
  try {
    const res = await http.ProposalController.proposalFieldSuggestionsList({
      field: 'teacherName',
      keyword,
      page: 0,
      pageSize: 50
    });
    const list = res.data?.data?.suggestions ?? [];
    nameOptions.value = list.map((s) => s.value || s.label || '');
  } catch (e) {
    nameOptions.value = [];
  } finally {
    nameLoading.value = false;
  }
};

const handleNameSearch = () => {
  if (nameTimer) clearTimeout(nameTimer);
  nameTimer = setTimeout(() => fetchName(nameKeyword.value.trim()), 300);
};

const selectName = (name: string) => {
  selectedName.value = name;
  nameKeyword.value = name;
  nameOptions.value = [];
};

const fetchDept = async (keyword: string) => {
  if (!keyword) {
    deptOptions.value = [];
    return;
  }
  deptLoading.value = true;
  try {
    const res = await http.ProposalController.proposalFieldSuggestionsList({
      field: 'department',
      keyword,
      page: 0,
      pageSize: 50
    });
    const list = res.data?.data?.suggestions ?? [];
    deptOptions.value = list.map((s) => s.value || s.label || '');
  } catch (e) {
    deptOptions.value = [];
  } finally {
    deptLoading.value = false;
  }
};

const handleDeptSearch = () => {
  if (deptTimer) clearTimeout(deptTimer);
  deptTimer = setTimeout(() => fetchDept(deptKeyword.value.trim()), 300);
};

const selectDept = (dept: string) => {
  selectedDept.value = dept;
  deptKeyword.value = dept;
  deptOptions.value = [];
};

const handleAdd = () => {
  const name = nameKeyword.value.trim();
  if (!name) {
    uni.showToast({ title: '请输入教师姓名', icon: 'none' });
    return;
  }
  emit('add', {
    name,
    department: deptKeyword.value.trim(),
    teacherId: ''
  });
  resetForm();
};

const handleRemove = (idx: number) => {
  emit('remove', idx);
};

const handleClose = () => {
  emit('close');
  emit('update:visible', false);
};
</script>

<style lang="scss" scoped>
.teacher-list-modal {
  position: fixed;
  inset: 0;
  background: $bg-overlay-light;
  z-index: $z-modal;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  animation: mwp-fade-in $motion-pop $ease-standard backwards;

  .dark-theme & {
    background: $bg-overlay-dark;
  }
}

.teacher-list-modal__sheet {
  width: 100%;
  // 固定高度：建议列表出现/消失时不改变弹窗尺寸，避免输入时抖动
  height: 80vh;
  background: $bg-card-light;
  border-radius: $radius-2xl $radius-2xl 0 0;
  display: flex;
  flex-direction: column;
  animation: mwp-slide-up $motion-enter-lg $ease-decelerate backwards;
  transition: background-color $dur-medium $ease-standard;

  .dark-theme & {
    background: $bg-card-dark;
  }
}

.teacher-list-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $space-7;
  flex-shrink: 0;
}

.teacher-list-modal__title {
  font-size: $font-xl;
  font-weight: $weight-bold;
  color: $text-primary-light;
  transition: color $dur-fast $ease-standard;

  .dark-theme & {
    color: $text-primary-dark;
  }
}

.teacher-list-modal__close {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: $font-2xl;
  color: $text-tertiary-light;
  @include mwp-transition($dur-fast, $ease-standard);

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

.teacher-list-modal__body {
  width: 100%;
  flex: 1;
  min-height: 0;
}

// padding 放在内层：scroll-view 自身的 padding 会导致内容整体偏移
.teacher-list-modal__inner {
  padding: $space-7;
}

.teacher-list {
  display: flex;
  flex-direction: column;
  gap: $space-4;
}

.teacher-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $space-5 $space-7;
  background: $bg-muted-light;
  border-radius: $radius-md;
  @include mwp-transition($dur-fast, $ease-standard);

  .dark-theme & {
    background: $bg-muted-dark;
  }

  &:active {
    transform: scale($press-scale-sm);
  }
}

.teacher-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
  min-width: 0;
}

.teacher-name {
  font-size: $font-base;
  font-weight: $weight-semibold;
  color: $text-primary-light;
  @include ellipsis;
  transition: color $dur-fast $ease-standard;

  .dark-theme & {
    color: $text-primary-dark;
  }
}

.teacher-title {
  font-size: $font-xs;
  color: $brand-red;
  background: $danger-soft;
  padding: 2rpx $space-2;
  border-radius: $radius-xs;
  text-align: center;
  align-self: flex-start;
}

.teacher-dept {
  font-size: $font-xs;
  color: $text-tertiary-light;
  @include ellipsis;
  transition: color $dur-fast $ease-standard;

  .dark-theme & {
    color: $text-tertiary-dark;
  }
}

.teacher-remove {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: transparent;
  color: $text-tertiary-light;
  font-size: $font-2xl;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: $space-4;
  @include mwp-transition($dur-fast, $ease-standard);

  .dark-theme & {
    color: $text-tertiary-dark;
  }

  &:active {
    background: $danger-soft;
    color: $brand-red;
    transform: scale(0.88);
  }
}

// ---------- 内联添加表单 ----------
.add-form {
  margin-top: $space-7;
  padding-top: $space-7;
  @include dashed-divider;

  .dark-theme & {
    border-top-color: $divider-dark;
  }
}

.add-form__title {
  display: block;
  font-size: $font-md;
  font-weight: $weight-semibold;
  color: $brand-red;
  margin-bottom: $space-6;

  .dark-theme & {
    color: $brand-red-soft;
  }
}

.form-label {
  display: block;
  font-size: $font-base;
  font-weight: $weight-medium;
  color: $text-primary-light;
  margin-bottom: $space-4;
  transition: color $dur-fast $ease-standard;

  .dark-theme & {
    color: $text-primary-dark;
  }
}

.form-input-wrapper {
  display: flex;
  align-items: center;
  gap: $space-3;
  height: 80rpx;
  padding: 0 $space-5;
  margin-bottom: $space-5;
  background: $bg-muted-light;
  border: 2rpx solid transparent;
  border-radius: $radius-pill;
  @include mwp-transition($dur-fast, $ease-standard);

  .dark-theme & {
    background: $bg-muted-dark;
  }

  &:focus-within {
    background: $bg-card-light;
    border-color: $brand-red-glow;
    box-shadow: $shadow-brand-sm;

    .dark-theme & {
      background: $bg-card-dark;
    }
  }
}

.form-input-icon {
  font-size: $font-lg;
  opacity: 0.5;
  flex-shrink: 0;
}

.form-input {
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

.form-options {
  width: 100%;
  margin-top: -$space-3;
  margin-bottom: $space-5;
  max-height: 240rpx;
}

.form-loading {
  display: flex;
  align-items: center;
  gap: $space-3;
  padding: $space-4 $space-5;
}

.form-spinner {
  width: 32rpx;
  height: 32rpx;
  border: 3rpx solid rgba(178, 0, 53, 0.2);
  border-top-color: $brand-red;
  border-radius: 50%;
  animation: mwp-spin $motion-spin linear infinite;
}

.form-loading-text {
  font-size: $font-sm;
  color: $text-tertiary-light;
  .dark-theme & {
    color: $text-tertiary-dark;
  }
}

.form-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $space-4 $space-5;
  font-size: $font-base;
  color: $text-primary-light;
  background: $bg-muted-light;
  border-radius: $radius-sm;
  margin-bottom: $space-2;
  @include mwp-transition($dur-fast, $ease-standard);

  .dark-theme & {
    color: $text-primary-dark;
    background: $bg-muted-dark;
  }

  &:active {
    transform: scale($press-scale-sm);
  }

  &.is-selected {
    background: $danger-soft;
    color: $brand-red;
    font-weight: $weight-medium;
    border: 1rpx solid $border-color-brand;
  }
}

.form-option__check {
  color: $brand-red;
  font-weight: $weight-bold;
  font-size: $font-lg;
}

.teacher-list-modal__footer {
  padding: $space-5 $space-7 calc(#{$space-7} + env(safe-area-inset-bottom));
  flex-shrink: 0;
}

.add-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $space-3;
  height: 88rpx;
  border-radius: $radius-pill;
  @include brand-button;
  font-size: $font-base;
  font-weight: $weight-semibold;

  &.is-disabled {
    opacity: 0.45;
    pointer-events: none;
  }
}

.add-icon {
  color: $pure-white;
}

.add-text {
  font-size: $font-base;
  text-align: center;
}

@media (prefers-reduced-motion: reduce) {
  .teacher-list-modal,
  .teacher-list-modal__sheet,
  .form-spinner {
    animation: none;
  }
}
</style>
