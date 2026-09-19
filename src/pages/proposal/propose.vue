<template>
  <view class="container" :class="themeStore.themeClass">
    <TopNavBar
      :title="
        isApproveMode
          ? '最终确认提案'
          : editProposalId
          ? '重新编辑提案'
          : '新增提案'
      "
      :intercept-back="true"
      @back="handleBack"
    />

    <view :style="{ height: navBarHeight + 'px' }" />

    <view class="form-body">
      <!-- 管理员审批模式提示 -->
      <view v-if="isApproveMode" class="mode-banner mwp-fade-down">
        <text class="mode-banner__icon">⚙️</text>
        <text class="mode-banner__text">
          管理员审批模式：可修改课程信息作为最终发布版本
        </text>
      </view>

      <view
        v-else-if="editProposalId"
        class="mode-banner mode-banner--edit mwp-fade-down"
      >
        <text class="mode-banner__icon">📝</text>
        <text class="mode-banner__text">
          重新编辑模式：原提案状态保留，新提交将作为新提案
        </text>
      </view>

      <!-- Section 1: 基本信息 -->
      <view class="card">
        <view class="section-header">
          <text class="section-title">基本信息</text>
        </view>

        <view
          v-for="f in basicFields"
          :key="f.kind"
          class="inline-field"
          :class="{ 'is-editing-item': editKind === f.kind }"
        >
          <!-- 同一结构：展示/编辑只切换边框与颜色，标签不位移 -->
          <view
            class="float-field"
            :class="{
              'is-editing': editKind === f.kind,
              'is-float': editKind === f.kind && !!editValue
            }"
            :hover-class="editKind === f.kind ? 'none' : 'mwp-hover'"
            @click="openEditor(f.kind)"
          >
            <view class="float-field__box">
              <template v-if="editKind === f.kind">
                <input
                  class="float-field__input"
                  :value="editValue"
                  :focus="autoFocus"
                  confirm-type="search"
                  @input="onSingleInput"
                  @confirm="confirmEditor"
                />
                <text class="float-field__label">{{ f.label }}</text>
              </template>
              <view v-else class="float-field__main">
                <text class="float-field__name">{{ f.label }}</text>
                <text class="float-field__value">{{ formData[f.kind] }}</text>
                <view class="float-field__arrow" />
              </view>
            </view>
          </view>

          <!-- 搜索结果与操作以浮层出现，不改变整体布局 -->
          <view
            v-if="
              editKind === f.kind &&
              (editValue.trim() || editSuggestions.length)
            "
            class="inline-layer"
          >
            <scroll-view
              v-if="editValue.trim() || editSuggestions.length"
              scroll-y
              :show-scrollbar="false"
              class="inline-suggest"
              :style="{ height: suggestHeight(singleSuggestCount) }"
            >
              <view
                v-if="editValue.trim()"
                class="inline-suggest__item"
                hover-class="mwp-hover"
                @click="confirmEditor"
              >
                <text class="inline-suggest__label">{{
                  editValue.trim()
                }}</text>
                <text class="inline-suggest__hint">（新增）</text>
              </view>
              <view
                v-for="(s, i) in editSuggestions"
                :key="i"
                class="inline-suggest__item"
                hover-class="mwp-hover"
                @click="selectSingleSuggestion(s)"
              >
                <text class="inline-suggest__label">{{
                  s.label || s.value
                }}</text>
              </view>
            </scroll-view>
          </view>
        </view>
      </view>

      <!-- Section 2: 教学信息 -->
      <view class="card">
        <view class="section-header">
          <text class="section-title">教学信息</text>
        </view>

        <view
          class="inline-field"
          :class="{ 'is-editing-item': editKind === 'teacher' }"
        >
          <view
            class="float-field"
            :class="{
              'is-editing': editKind === 'teacher',
              'is-float': editKind === 'teacher' && !!editValue
            }"
            :hover-class="editKind === 'teacher' ? 'none' : 'mwp-hover'"
            @click="openEditor('teacher')"
          >
            <view class="float-field__box">
              <template v-if="editKind === 'teacher'">
                <input
                  class="float-field__input"
                  :class="{ 'is-shrunk': teacherPicked }"
                  :value="editValue"
                  :focus="autoFocus"
                  confirm-type="search"
                  @input="onNameInput"
                  @confirm="onNameConfirm"
                />
                <!-- 选中教师后：姓名左侧缩短，右侧并排院系输入 + 不填 -->
                <view v-if="teacherPicked" class="teacher-dept">
                  <input
                    class="teacher-dept__input"
                    :value="editDept"
                    placeholder="所属院系"
                    placeholder-class="mwp-placeholder"
                    confirm-type="done"
                    @input="onDeptInput"
                    @focus="onDeptFocus"
                    @confirm="confirmDeptSelection"
                  />
                  <view
                    class="teacher-dept__skip"
                    hover-class="mwp-hover"
                    @click.stop="skipDept"
                  >
                    <text>不填</text>
                  </view>
                </view>
                <text class="float-field__label">授课教师</text>
              </template>
              <view v-else class="float-field__main">
                <text class="float-field__name">授课教师</text>
                <text class="float-field__value">{{
                  formData.teachers.length
                    ? `${formData.teachers.length} 位教师`
                    : ''
                }}</text>
                <view class="float-field__arrow" />
              </view>
            </view>
          </view>

          <view v-if="formData.teachers.length" class="teacher-summary">
            <view
              v-for="(t, idx) in formData.teachers"
              :key="idx"
              class="teacher-summary__chip mwp-stagger-item"
              :style="{ animationDelay: `${Math.min(idx * 60, 240)}ms` }"
            >
              <text>{{ t.name }}</text>
              <text v-if="t.title" class="teacher-summary__title"
                >· {{ t.title }}</text
              >
              <view
                class="teacher-summary__remove"
                hover-class="mwp-hover"
                @click.stop="handleRemoveTeacher(idx)"
              >
                <text>×</text>
              </view>
            </view>
          </view>

          <!-- 姓名建议（未选中教师时） -->
          <view
            v-if="
              editKind === 'teacher' &&
              !teacherPicked &&
              (editValue.trim() || teacherNameSuggestions.length)
            "
            class="inline-layer"
          >
            <scroll-view
              v-if="editValue.trim() || teacherNameSuggestions.length"
              scroll-y
              :show-scrollbar="false"
              class="inline-suggest"
              :style="{ height: suggestHeight(teacherNameSuggestCount) }"
            >
              <view
                v-if="editValue.trim()"
                class="inline-suggest__item"
                hover-class="mwp-hover"
                @click="onNameConfirm"
              >
                <text class="inline-suggest__label">{{
                  editValue.trim()
                }}</text>
                <text class="inline-suggest__hint">（新增）</text>
              </view>
              <view
                v-for="(s, i) in teacherNameSuggestions"
                :key="i"
                class="inline-suggest__item"
                hover-class="mwp-hover"
                @click="selectNameSuggestion(s)"
              >
                <text class="inline-suggest__label">{{
                  s.label || s.value
                }}</text>
              </view>
            </scroll-view>
          </view>

          <!-- 院系建议（选中教师后） -->
          <view
            v-if="
              editKind === 'teacher' &&
              teacherPicked &&
              teacherDeptSuggestions.length
            "
            class="inline-layer"
          >
            <scroll-view
              v-if="teacherDeptSuggestions.length"
              scroll-y
              :show-scrollbar="false"
              class="inline-suggest"
              :style="{ height: suggestHeight(deptSuggestCount) }"
            >
              <view
                v-for="(s, i) in teacherDeptSuggestions"
                :key="i"
                class="inline-suggest__item"
                hover-class="mwp-hover"
                @click="selectDeptSuggestion(s)"
              >
                <text class="inline-suggest__label">{{
                  s.label || s.value
                }}</text>
              </view>
            </scroll-view>
          </view>
        </view>

        <view class="inline-field">
          <view class="campus-field">
            <view class="campus-field__label">
              <text>开课校区</text>
              <text class="campus-field__hint">可多选</text>
            </view>
            <view class="tags-group tags-group--center">
              <view
                v-for="campus in campusOptions"
                :key="campus"
                class="tag-item mwp-pressable"
                :class="{ active: formData.campuses.includes(campus) }"
                hover-class="mwp-hover"
                @click="toggleCampus(campus)"
              >
                {{ campus }}
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- Section 3: 提案理由 -->
      <view class="card">
        <view class="section-header">
          <text class="section-title">提案理由</text>
          <text class="section-subtitle">最多 300 字</text>
        </view>
        <view class="input-box">
          <textarea
            v-model="formData.reason"
            class="reason-area"
            placeholder="请详细描述新增该课程的理由"
            placeholder-class="mwp-placeholder"
            :maxlength="300"
          />
          <text class="word-count">{{ formData.reason.length }}/300</text>
        </view>
      </view>

      <!-- Section 4: 展示昵称 (管理员模式与编辑模式不显示) -->
      <view v-if="!isApproveMode && !editProposalId" class="card">
        <view class="section-header">
          <text class="section-title">展示设置</text>
        </view>
        <view class="form-row">
          <view class="label">展示昵称</view>
          <view class="show-username-options">
            <view
              class="tag-item mwp-pressable"
              :class="{ active: formData.showUsername === true }"
              hover-class="mwp-hover"
              @click="formData.showUsername = true"
              >展示</view
            >
            <view
              class="tag-item mwp-pressable"
              :class="{ active: formData.showUsername === false }"
              hover-class="mwp-hover"
              @click="formData.showUsername = false"
              >不展示</view
            >
          </view>
        </view>
        <text class="field-hint">通过后展示你的昵称；选择"否"将匿名</text>
      </view>

      <!-- 发布按钮 -->
      <MwpButton
        class="submit-btn"
        :class="{ 'is-muted': !canPublish }"
        tone="brand"
        size="lg"
        block
        :loading="submitting"
        :disabled="submitting"
        @click="handlePublish"
      >
        {{
          submitting
            ? '提交中...'
            : isApproveMode
            ? '通过提案'
            : editProposalId
            ? '重新提交'
            : '发布提案'
        }}
      </MwpButton>
      <view class="safe-area-bottom" />
    </view>

    <!-- 提交中蒙层 -->
    <view v-if="submitting" class="loading-overlay">
      <view class="loading-spinner" />
      <text class="loading-text">提交中...</text>
    </view>

    <!-- 点击字段与浮层之外的区域：教师已填写则默认不填院系并添加，否则取消 -->
    <view v-if="editKind" class="edit-catcher" @click="handleCatcherClick" />

    <!-- 通用操作弹窗（发布 / 存草稿 / 恢复草稿） -->
    <MwpActionSheet
      v-model:visible="sheetVisible"
      :title="sheetTitle"
      :description="sheetDescription"
      :actions="sheetActions"
      :cancel-text="sheetCancelText"
      @select="handleSheetSelect"
    />
  </view>
</template>

<script setup lang="ts">
import { reactive, ref, computed, nextTick } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import TopNavBar from '@/components/common/TopNavBar.vue';
import { http, useThemeStore } from '@/config';
import { useMenuButton } from '@/composables/useMenuButton';
import { TOAST_DURATION_MS } from '@/utils/constants';
import type {
  DtoTeacherVO,
  DtoProposalVO,
  DtoProposalCourseVO,
  DtoFieldSuggestionVO
} from '@/api/data-contracts';

const themeStore = useThemeStore();
const { navBarHeight } = useMenuButton();

interface TeacherEntry {
  name: string;
  title: string;
  department?: string;
  teacherId?: string;
}
const formData = reactive({
  courseName: '',
  courseCode: '',
  department: '',
  category: '',
  teachers: [] as TeacherEntry[],
  campuses: [] as string[],
  reason: '',
  // 后端 showUsername 选填，默认匿名，不阻塞发布
  showUsername: false as boolean | null
});

const submitting = ref(false);

// 管理员模式：approveProposalId  /  重新编辑：editProposalId
const isApproveMode = ref(false);
const approveProposalId = ref('');
const editProposalId = ref('');

const campusOptions = ['普陀校区', '闵行校区', '滴水湖校区'];

interface QuotaInfo {
  remaining: number;
  limit: number;
}
const quotaInfo = ref<QuotaInfo | null>(null);

const loadQuota = async () => {
  try {
    const res = await http.UserController.userProfileList();
    const data = res.data?.data;
    if (data) {
      // dailyQuota 是「今日已创建数量」，剩余 = 上限 - 已用
      const limit = data.dailyQuotaLimit ?? 0;
      const used = data.dailyQuota ?? 0;
      quotaInfo.value = {
        remaining: Math.max(limit - used, 0),
        limit
      };
    }
  } catch (e) {
    console.warn('[propose] loadQuota failed:', e);
  }
};

const fillFormFromProposal = (proposal: DtoProposalVO) => {
  const course = proposal.course || {};
  formData.courseName = course.name || proposal.title || '';
  formData.courseCode = course.code || '';
  formData.department = course.department || '';
  formData.category = course.category || '';
  formData.teachers = (course.teachers || []).map(
    (t: (DtoTeacherVO & { teacherId?: string }) | string) => ({
      name: typeof t === 'string' ? t : t.name || '',
      title: typeof t === 'string' ? '' : t.title || '',
      department: typeof t === 'string' ? '' : t.department || '',
      teacherId: typeof t === 'string' ? '' : t.teacherId || t.id || ''
    })
  );
  formData.campuses = Array.isArray(course.campuses)
    ? [...course.campuses]
    : [];
  formData.reason = proposal.content || '';
};

const fetchProposalForForm = async (id: string) => {
  const res = await http.ProposalController.proposalDetail(id);
  const proposal = res.data?.data?.proposal;
  if (proposal) {
    fillFormFromProposal(proposal);
  } else {
    uni.showToast({ title: '获取提案信息失败', icon: 'none' });
  }
};

// ===== 本地草稿（纯前端 storage，不依赖后端）=====
const PROPOSAL_DRAFT_KEY = 'meowpick_proposal_draft';

interface ProposalDraft {
  courseName: string;
  courseCode: string;
  department: string;
  category: string;
  teachers: TeacherEntry[];
  campuses: string[];
  reason: string;
  showUsername: boolean | null;
  savedAt: number;
}

const hasDraftContent = () =>
  !!(
    formData.courseName.trim() ||
    formData.courseCode.trim() ||
    formData.department ||
    formData.category ||
    formData.teachers.length ||
    formData.campuses.length ||
    formData.reason.trim()
  );

const clearDraft = () => {
  try {
    uni.removeStorageSync(PROPOSAL_DRAFT_KEY);
  } catch (e) {
    console.warn('[propose] clearDraft failed:', e);
  }
};

const saveDraft = () => {
  if (!hasDraftContent()) {
    uni.showToast({ title: '还没有可保存的内容', icon: 'none' });
    return;
  }
  const draft: ProposalDraft = {
    courseName: formData.courseName,
    courseCode: formData.courseCode,
    department: formData.department,
    category: formData.category,
    teachers: formData.teachers,
    campuses: formData.campuses,
    reason: formData.reason,
    showUsername: formData.showUsername,
    savedAt: Date.now()
  };
  try {
    uni.setStorageSync(PROPOSAL_DRAFT_KEY, draft);
    uni.showToast({ title: '草稿已保存', icon: 'success' });
  } catch (e) {
    console.error('[propose] saveDraft failed:', e);
    uni.showToast({ title: '草稿保存失败', icon: 'none' });
  }
};

const applyDraft = (draft: ProposalDraft) => {
  formData.courseName = draft.courseName || '';
  formData.courseCode = draft.courseCode || '';
  formData.department = draft.department || '';
  formData.category = draft.category || '';
  formData.teachers = Array.isArray(draft.teachers) ? draft.teachers : [];
  formData.campuses = Array.isArray(draft.campuses) ? [...draft.campuses] : [];
  formData.reason = draft.reason || '';
  formData.showUsername =
    typeof draft.showUsername === 'boolean' ? draft.showUsername : null;
};

const maybeRestoreDraft = () => {
  let draft: ProposalDraft | null = null;
  try {
    const stored = uni.getStorageSync(PROPOSAL_DRAFT_KEY);
    if (stored && typeof stored === 'object') draft = stored as ProposalDraft;
  } catch (e) {
    console.warn('[propose] readDraft failed:', e);
  }
  if (!draft) return;
  pendingDraft.value = draft;
  openSheet('restore');
};

// ===== 通用操作弹窗 =====
type SheetContext = 'publish' | 'quota' | 'back' | 'restore' | 'missing';

interface SheetAction {
  label: string;
  value: string;
  tone?: 'brand' | 'default' | 'danger';
}

const sheetVisible = ref(false);
const sheetContext = ref<SheetContext>('publish');
const pendingDraft = ref<ProposalDraft | null>(null);

const sheetTitle = computed(() => {
  switch (sheetContext.value) {
    case 'quota':
      return '今日额度已用完';
    case 'back':
      return '保存草稿';
    case 'restore':
      return '恢复草稿';
    case 'missing':
      return '还差这些信息';
    default:
      return '发布提案';
  }
});

const sheetDescription = computed(() => {
  const q = quotaInfo.value;
  switch (sheetContext.value) {
    case 'quota':
      return q
        ? `今日可提交 ${q.limit} 个提案，已用完，可先保存草稿。`
        : '今日额度已用完，可先保存草稿。';
    case 'back':
      return '当前填写的内容尚未发布，是否保存为草稿？';
    case 'restore':
      return '检测到上次未提交的草稿，是否恢复？';
    case 'missing':
      return `请先完善：${missingFields.value.join('、')}`;
    default:
      return q ? `今日剩余可提交 ${q.remaining}/${q.limit} 个提案。` : '';
  }
});

const sheetActions = computed<SheetAction[]>(() => {
  switch (sheetContext.value) {
    case 'quota':
      return [{ label: '存草稿', value: 'draft', tone: 'brand' }];
    case 'back':
      return [
        { label: '存草稿', value: 'draft', tone: 'brand' },
        { label: '不保存', value: 'discard', tone: 'danger' }
      ];
    case 'restore':
      return [
        { label: '恢复', value: 'restore', tone: 'brand' },
        { label: '不用了', value: 'discard-draft', tone: 'default' }
      ];
    case 'missing':
      return [{ label: '知道了', value: 'dismiss', tone: 'brand' }];
    default:
      return [
        { label: '确认发布', value: 'publish', tone: 'brand' },
        { label: '存草稿', value: 'draft', tone: 'default' }
      ];
  }
});

// 恢复 / 缺项提示不提供「取消」，点遮罩或按钮关闭即可
const sheetCancelText = computed(() =>
  sheetContext.value === 'restore' || sheetContext.value === 'missing'
    ? ''
    : '取消'
);

const openSheet = (context: SheetContext) => {
  sheetContext.value = context;
  sheetVisible.value = true;
};

const handleSheetSelect = (value: string) => {
  switch (value) {
    case 'publish':
      submit();
      break;
    case 'draft':
      saveDraft();
      if (sheetContext.value === 'back') setTimeout(goBack, TOAST_DURATION_MS);
      break;
    case 'discard':
      clearDraft();
      goBack();
      break;
    case 'restore':
      if (pendingDraft.value) {
        applyDraft(pendingDraft.value);
        uni.showToast({ title: '已恢复草稿', icon: 'none' });
      }
      pendingDraft.value = null;
      break;
    case 'discard-draft':
      clearDraft();
      pendingDraft.value = null;
      break;
  }
};

// ===== 内联展开编辑（就地展开 + 模糊建议，不遮罩、不锁滚动）=====
type SingleKind = 'courseName' | 'courseCode' | 'department' | 'category';
type EditKind = SingleKind | 'teacher';

interface BasicField {
  kind: SingleKind;
  label: string;
  field: string;
}

const basicFields: BasicField[] = [
  { kind: 'courseName', label: '课程名称', field: 'courseName' },
  { kind: 'courseCode', label: '课程代码', field: 'courseCode' },
  { kind: 'department', label: '开课院系', field: 'department' },
  { kind: 'category', label: '课程类别', field: 'category' }
];

const editKind = ref<EditKind | null>(null);
const autoFocus = ref(false);
const editValue = ref('');
const editDept = ref('');
// 是否已「选中教师」（选中后才展开院系输入）
const teacherPicked = ref(false);
const editSuggestions = ref<DtoFieldSuggestionVO[]>([]);
const editLoading = ref(false);
const teacherNameSuggestions = ref<DtoFieldSuggestionVO[]>([]);
const teacherDeptSuggestions = ref<DtoFieldSuggestionVO[]>([]);
const teacherNameLoading = ref(false);
const teacherDeptLoading = ref(false);
let editTimer: ReturnType<typeof setTimeout> | null = null;

// 建议列表需要确定高度才能在 scroll-view 中滚动
const suggestHeight = (count: number) =>
  `${Math.min(Math.max(count, 1), 6) * 68}rpx`;
const singleSuggestCount = computed(
  () => (editValue.value.trim() ? 1 : 0) + editSuggestions.value.length
);
const teacherNameSuggestCount = computed(
  () => (editValue.value.trim() ? 1 : 0) + teacherNameSuggestions.value.length
);
const deptSuggestCount = computed(() => teacherDeptSuggestions.value.length);

const openEditor = (kind: EditKind) => {
  // 已在编辑该栏则忽略（点击输入框冒泡到这里时不重置内容）
  if (editKind.value === kind) return;
  editKind.value = kind;
  teacherPicked.value = false;
  editSuggestions.value = [];
  editLoading.value = false;
  teacherNameSuggestions.value = [];
  teacherDeptSuggestions.value = [];
  teacherNameLoading.value = false;
  teacherDeptLoading.value = false;
  editDept.value = '';
  editValue.value = kind === 'teacher' ? '' : formData[kind] || '';
  // 点击即搜索：已有值时立即按当前值拉一次推荐（修改场景）
  if (kind !== 'teacher' && editValue.value.trim()) {
    fetchSingleSuggestions(editValue.value.trim());
  }
  // 挂载后再触发聚焦，避免常量 focus 在重渲染时抢焦点
  autoFocus.value = false;
  nextTick(() => {
    autoFocus.value = true;
  });
};

const onDeptFocus = () => {
  // 释放姓名输入框的 focus，避免抢回焦点
  autoFocus.value = false;
};

const closeEditor = () => {
  if (editTimer) clearTimeout(editTimer);
  autoFocus.value = false;
  editKind.value = null;
  editSuggestions.value = [];
  editLoading.value = false;
  teacherNameSuggestions.value = [];
  teacherDeptSuggestions.value = [];
  teacherNameLoading.value = false;
  teacherDeptLoading.value = false;
};

const querySuggestions = async (
  field: string,
  keyword: string
): Promise<DtoFieldSuggestionVO[]> => {
  if (!keyword) return [];
  try {
    const res = await http.ProposalController.proposalFieldSuggestionsList({
      field,
      keyword,
      page: 0,
      pageSize: 50
    });
    return res.data?.data?.suggestions ?? [];
  } catch (e) {
    console.error('[propose] suggestions failed:', e);
    return [];
  }
};

const fetchSingleSuggestions = async (keyword: string) => {
  const kind = editKind.value;
  if (!kind || kind === 'teacher' || !keyword) return;
  const field = basicFields.find((f) => f.kind === kind)?.field ?? kind;
  editLoading.value = true;
  editSuggestions.value = await querySuggestions(field, keyword);
  editLoading.value = false;
};

const onSingleInput = (e: { detail: { value: string } }) => {
  editValue.value = e.detail.value;
  if (editTimer) clearTimeout(editTimer);
  const keyword = editValue.value.trim();
  if (!keyword) {
    editSuggestions.value = [];
    return;
  }
  editTimer = setTimeout(() => fetchSingleSuggestions(keyword), 300);
};

const onNameInput = (e: { detail: { value: string } }) => {
  editValue.value = e.detail.value;
  // 重新编辑姓名即撤销「已选中」，院系输入收起
  teacherPicked.value = false;
  teacherDeptSuggestions.value = [];
  if (editTimer) clearTimeout(editTimer);
  const keyword = editValue.value.trim();
  if (!keyword) {
    teacherNameSuggestions.value = [];
    return;
  }
  editTimer = setTimeout(async () => {
    teacherNameLoading.value = true;
    teacherNameSuggestions.value = await querySuggestions(
      'teacherName',
      keyword
    );
    teacherNameLoading.value = false;
  }, 300);
};

// 选中教师：完整呈现名称，收起姓名建议，展开院系输入
const pickTeacher = () => {
  if (!editValue.value.trim()) return;
  teacherPicked.value = true;
  teacherNameSuggestions.value = [];
  teacherDeptSuggestions.value = [];
};

const onNameConfirm = () => {
  pickTeacher();
};

const onDeptInput = (e: { detail: { value: string } }) => {
  editDept.value = e.detail.value;
  if (editTimer) clearTimeout(editTimer);
  const keyword = editDept.value.trim();
  if (!keyword) {
    teacherDeptSuggestions.value = [];
    return;
  }
  editTimer = setTimeout(async () => {
    teacherDeptLoading.value = true;
    teacherDeptSuggestions.value = await querySuggestions(
      'department',
      keyword
    );
    teacherDeptLoading.value = false;
  }, 300);
};

const selectSingleSuggestion = (item: DtoFieldSuggestionVO) => {
  editValue.value = item.value || item.label || '';
  editSuggestions.value = [];
  confirmEditor();
};

// 选中教师候选：填入完整名称并展开院系输入
const selectNameSuggestion = (item: DtoFieldSuggestionVO) => {
  editValue.value = item.value || item.label || '';
  pickTeacher();
};

// 选中院系候选 / 点击「不填」→ 添加该教师
const selectDeptSuggestion = (item: DtoFieldSuggestionVO) => {
  editDept.value = item.value || item.label || '';
  teacherDeptSuggestions.value = [];
  addTeacher();
};

const skipDept = () => {
  editDept.value = '';
  addTeacher();
};

const confirmDeptSelection = () => {
  addTeacher();
};

// 点击字段与浮层之外的区域：
// 教师姓名已填写 → 视为「不填所属院系」直接添加，而非取消填写
const handleCatcherClick = () => {
  if (editKind.value === 'teacher' && editValue.value.trim()) {
    addTeacher(false);
    return;
  }
  closeEditor();
};

const addTeacher = (keepEditing = true) => {
  const name = editValue.value.trim();
  if (!name) {
    uni.showToast({ title: '请输入教师姓名', icon: 'none' });
    return;
  }
  formData.teachers.push({
    name,
    title: '',
    department: editDept.value.trim(),
    teacherId: ''
  });
  uni.showToast({
    title: keepEditing ? '已添加，可继续添加' : '已添加',
    icon: 'none'
  });
  editValue.value = '';
  editDept.value = '';
  teacherPicked.value = false;
  teacherNameSuggestions.value = [];
  teacherDeptSuggestions.value = [];
  // 点击外部添加后收起编辑态；从建议/「不填」添加则保持编辑态，方便继续添加
  if (!keepEditing) closeEditor();
};

const confirmEditor = () => {
  const kind = editKind.value;
  if (!kind || kind === 'teacher') return;
  formData[kind] = editValue.value.trim();
  closeEditor();
};

const handleRemoveTeacher = (idx: number) => {
  formData.teachers.splice(idx, 1);
};

const toggleCampus = (campus: string) => {
  const idx = formData.campuses.indexOf(campus);
  if (idx > -1) formData.campuses.splice(idx, 1);
  else formData.campuses.push(campus);
};

// 缺哪些必填项（用于置灰和缺项弹窗）
const missingFields = computed<string[]>(() => {
  const miss: string[] = [];
  if (!formData.courseName.trim()) miss.push('课程名称');
  if (!formData.department) miss.push('开课院系');
  if (!formData.category) miss.push('课程类别');
  if (!formData.campuses.length) miss.push('开课校区');
  if (!formData.teachers.some((t) => (t.name || '').trim()))
    miss.push('授课教师');
  return miss;
});

// 是否满足发布条件（不满足则按钮置灰，但可点击查看缺项）
const canPublish = computed(() => missingFields.value.length === 0);

// 发布入口：缺项 → 提示缺什么；额度用完 → 只能存草稿；否则确认发布
const handlePublish = () => {
  if (!canPublish.value) {
    openSheet('missing');
    return;
  }

  // 审批通过 / 重新编辑：无草稿流程，直接提交
  if (isApproveMode.value || editProposalId.value) {
    submit();
    return;
  }

  openSheet(
    quotaInfo.value && quotaInfo.value.remaining <= 0 ? 'quota' : 'publish'
  );
};

const submit = async () => {
  if (
    !isApproveMode.value &&
    quotaInfo.value &&
    quotaInfo.value.remaining <= 0
  ) {
    uni.showToast({
      title: `今日提交已达上限(${quotaInfo.value.limit})`,
      icon: 'none'
    });
    return;
  }

  submitting.value = true;

  try {
    const teachers: DtoTeacherVO[] = formData.teachers
      .filter((t) => (t.name || '').trim())
      .map((t) => ({
        name: (t.name || '').trim(),
        title: (t.title || '').trim(),
        department: t.department || '',
        teacherId: t.teacherId || ''
      }));

    if (isApproveMode.value && approveProposalId.value) {
      // 管理员审批通过 - 复用表单填入 finalCourse
      const finalCourse: DtoProposalCourseVO = {
        name: formData.courseName.trim(),
        code: (formData.courseCode || '').trim().toUpperCase() || undefined,
        department: formData.department,
        category: formData.category,
        campuses: formData.campuses,
        teachers
      };
      const res = await http.ProposalController.proposalApproveCreate(
        approveProposalId.value,
        {
          proposalID: approveProposalId.value,
          finalCourse,
          title: formData.courseName.trim()
        }
      );
      const code = res.data?.code;
      const msg = res.data?.msg;
      if (code === 200 || code === 0 || code === 201) {
        uni.showToast({ title: '已通过', icon: 'success' });
        uni.$emit('proposalListShouldRefresh');
        setTimeout(() => uni.navigateBack(), TOAST_DURATION_MS);
      } else {
        uni.showToast({ title: msg || '通过失败', icon: 'none' });
      }
    } else {
      const reqData = {
        title: formData.courseName.trim(),
        content: formData.reason.trim(),
        course: {
          name: formData.courseName.trim(),
          code: (formData.courseCode || '').trim().toUpperCase() || undefined,
          department: formData.department,
          category: formData.category,
          campuses: formData.campuses,
          teachers
        },
        showUsername: formData.showUsername as boolean
      };
      const res = await http.ProposalController.proposalAddCreate(reqData);
      const code = res.data?.code;
      const msg = res.data?.msg;
      if (code === 200 || code === 0 || code === 201) {
        if (!editProposalId.value) clearDraft();
        uni.showToast({
          title: editProposalId.value ? '重新提交成功' : '提交成功',
          icon: 'success'
        });
        uni.$emit('proposalListShouldRefresh');
        setTimeout(() => uni.navigateBack(), TOAST_DURATION_MS);
      } else {
        uni.showToast({
          title: msg || `提交失败(code:${String(code)})`,
          icon: 'none'
        });
      }
    }
  } catch (err) {
    const e = err as {
      response?: { data?: { msg?: string } };
      message?: string;
    };
    const m = e.response?.data?.msg || e.message || '操作失败';
    console.error('[propose] submit error:', err);
    uni.showToast({ title: m, icon: 'none' });
  } finally {
    submitting.value = false;
  }
};

const goBack = () => {
  const pages = getCurrentPages();
  if (pages.length > 1) {
    uni.navigateBack({ delta: 1 });
  } else {
    uni.reLaunch({ url: '/pages/layout/main' });
  }
};

// 返回拦截：新增模式下有内容时询问是否存草稿
const handleBack = () => {
  if (!isApproveMode.value && !editProposalId.value && hasDraftContent()) {
    openSheet('back');
    return;
  }
  goBack();
};

onLoad(async (options: Record<string, string> = {}) => {
  if (options.approveProposalId) {
    isApproveMode.value = true;
    approveProposalId.value = options.approveProposalId;
    try {
      await fetchProposalForForm(options.approveProposalId);
    } catch (e) {
      console.error('approve form load error:', e);
    }
  } else if (options.editProposalId) {
    editProposalId.value = options.editProposalId;
    try {
      await fetchProposalForForm(options.editProposalId);
    } catch (e) {
      console.error('edit form load error:', e);
    }
  } else {
    loadQuota();
    maybeRestoreDraft();
  }
});
</script>

<style lang="scss" scoped src="./propose.scss" />
