<template>
  <view v-if="visible" class="teacher-modal" @click="handleClose">
    <view class="teacher-modal__sheet" @click.stop>
      <view class="teacher-modal__header">
        <text class="teacher-modal__title">添加教师</text>
        <view class="teacher-modal__close" @click="handleClose">×</view>
      </view>

      <scroll-view scroll-y class="teacher-modal__body">
        <!-- 教师姓名搜索 -->
        <view class="form-group">
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
          <scroll-view v-if="nameOptions.length || nameLoading" scroll-y class="form-options">
            <view v-if="nameLoading" class="form-loading">
              <view class="form-spinner"></view>
              <text class="form-loading-text">搜索中...</text>
            </view>
            <template v-else>
              <view
                v-for="(name, idx) in nameOptions"
                :key="idx"
                class="form-option mwp-stagger-item mwp-pressable"
                :class="{ 'is-selected': draft.name === name }"
                :style="{ animationDelay: `${Math.min(idx * 60, 180)}ms` }"
                @click="selectName(name)"
              >
                <text>{{ name }}</text>
                <text v-if="draft.name === name" class="form-option__check">✓</text>
              </view>
            </template>
          </scroll-view>
        </view>

        <!-- 所属院系搜索 -->
        <view class="form-group">
          <text class="form-label">所属院系</text>
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
          <scroll-view v-if="deptOptions.length || deptLoading" scroll-y class="form-options">
            <view v-if="deptLoading" class="form-loading">
              <view class="form-spinner"></view>
              <text class="form-loading-text">搜索中...</text>
            </view>
            <template v-else>
              <view
                v-for="(dept, idx) in deptOptions"
                :key="idx"
                class="form-option mwp-stagger-item mwp-pressable"
                :class="{ 'is-selected': draft.department === dept }"
                :style="{ animationDelay: `${Math.min(idx * 60, 180)}ms` }"
                @click="selectDept(dept)"
              >
                <text>{{ dept }}</text>
                <text v-if="draft.department === dept" class="form-option__check">✓</text>
              </view>
            </template>
          </scroll-view>
        </view>
      </scroll-view>

      <view class="teacher-modal__footer">
        <view class="teacher-modal__btn teacher-modal__btn--ghost mwp-pressable" @click="handleClose">
          <text>取消</text>
        </view>
        <view
          class="teacher-modal__btn teacher-modal__btn--primary mwp-pressable"
          :class="{ 'is-disabled': !canConfirm }"
          @click="handleConfirm"
        >
          <text>确认添加</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
/**
 * 添加教师弹窗（提案填写用）
 * 包含教师姓名 + 院系两项搜索联动。
 */
import { ref, reactive, watch, computed } from "vue";
import { http } from "@/config";

export interface TeacherDraft {
  name: string;
  title?: string;
  department: string;
  teacherId?: string;
}

const props = defineProps<{ visible: boolean }>();
const emit = defineEmits<{
  "update:visible": [val: boolean];
  confirm: [teacher: TeacherDraft];
  close: [];
}>();

const draft = reactive<TeacherDraft>({ name: "", department: "" });
const nameKeyword = ref("");
const deptKeyword = ref("");
const nameOptions = ref<string[]>([]);
const deptOptions = ref<string[]>([]);
const nameLoading = ref(false);
const deptLoading = ref(false);
let nameTimer: ReturnType<typeof setTimeout> | null = null;
let deptTimer: ReturnType<typeof setTimeout> | null = null;

const canConfirm = computed(() => {
  return draft.name.trim() !== "" && draft.department !== "";
});

watch(
  () => props.visible,
  (val) => {
    if (val) {
      draft.name = "";
      draft.department = "";
      draft.title = "";
      draft.teacherId = "";
      nameKeyword.value = "";
      deptKeyword.value = "";
      nameOptions.value = [];
      deptOptions.value = [];
    }
  }
);

const fetchName = async (keyword: string) => {
  if (!keyword) {
    nameOptions.value = [];
    return;
  }
  nameLoading.value = true;
  try {
    const res: any = await http.ProposalController.proposalFieldSuggestionsList({
      field: "teacherName",
      keyword,
      page: 0,
      pageSize: 50,
    });
    const data = res.data?.data;
    const list = (data?.suggestions ?? data?.data?.suggestions ?? []) as any[];
    nameOptions.value = list.map((s) => s.value || s.label || "");
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
  draft.name = name;
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
    const res: any = await http.ProposalController.proposalFieldSuggestionsList({
      field: "department",
      keyword,
      page: 0,
      pageSize: 50,
    });
    const data = res.data?.data;
    const list = (data?.suggestions ?? data?.data?.suggestions ?? []) as any[];
    deptOptions.value = list.map((s) => s.value || s.label || "");
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
  draft.department = dept;
  deptKeyword.value = dept;
  deptOptions.value = [];
};

const handleConfirm = () => {
  const name = draft.name || nameKeyword.value.trim();
  if (!name) {
    uni.showToast({ title: "请输入教师姓名", icon: "none" });
    return;
  }
  if (!draft.department) {
    uni.showToast({ title: "请选择所属院系", icon: "none" });
    return;
  }
  emit("confirm", { ...draft, name });
  handleClose();
};

const handleClose = () => {
  emit("close");
  emit("update:visible", false);
};
</script>

<style lang="scss" scoped>

.teacher-modal {
  position: fixed;
  inset: 0;
  background: $bg-overlay-light;
  z-index: $z-modal;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  animation: mwp-fade-in $motion-pop $ease-standard backwards;
}

.teacher-modal__sheet {
  width: 100%;
  max-height: 85vh;
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

.teacher-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $space-7;
  border-bottom: 1rpx solid $divider-light;
  flex-shrink: 0;
  transition: border-color $dur-fast $ease-standard;

  .dark-theme & {
    border-bottom-color: $divider-dark;
  }
}

.teacher-modal__title {
  font-size: $font-xl;
  font-weight: $weight-bold;
  color: $text-primary-light;
  transition: color $dur-fast $ease-standard;

  .dark-theme & {
    color: $text-primary-dark;
  }
}

.teacher-modal__close {
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

.teacher-modal__body {
  flex: 1;
  max-height: 60vh;
  padding: $space-7;
}

.form-group {
  margin-bottom: $space-7;
}

.form-label {
  font-size: $font-base;
  font-weight: $weight-medium;
  color: $text-primary-light;
  margin-bottom: $space-4;
  display: block;
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
  background: $bg-muted-light;
  border: 2rpx solid transparent;
  border-radius: $radius-pill;
  @include mwp-transition($dur-fast, $ease-standard);

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
  margin-top: $space-3;
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
  border: 3rpx solid rgba(178, 0, 53, 0.20);
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
    border: 1rpx solid rgba(178, 0, 53, 0.25);
  }
}

.form-option__check {
  color: $brand-red;
  font-weight: $weight-bold;
  font-size: $font-lg;
}

.teacher-modal__footer {
  display: flex;
  gap: $space-5;
  padding: $space-5 $space-7 calc(#{$space-7} + env(safe-area-inset-bottom));
  border-top: 1rpx solid $divider-light;
  flex-shrink: 0;
  transition: border-color $dur-fast $ease-standard;

  .dark-theme & {
    border-top-color: $divider-dark;
  }
}

.teacher-modal__btn {
  flex: 1;
  height: 88rpx;
  border-radius: $radius-pill;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: $font-base;
  font-weight: $weight-semibold;
  @include mwp-transition($dur-fast, $ease-standard);

  &--ghost {
    background: $bg-muted-light;
    color: $text-secondary-light;
    .dark-theme & {
      background: $bg-muted-dark;
      color: $text-secondary-dark;
    }
  }

  &--primary {
    @include brand-button;
  }

  &.is-disabled {
    opacity: 0.45;
    pointer-events: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .teacher-modal,
  .teacher-modal__sheet,
  .form-spinner,
  .form-option {
    animation: none;
  }
}
</style>