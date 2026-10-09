<template>
  <view class="container" :class="themeStore.themeClass">
    <TopNavBar
      :title="
        isApproveMode
          ? '修改后通过'
          : editProposalId
          ? '重新编辑提案'
          : '新增提案'
      "
    />

    <view :style="{ height: navBarHeight + 'px' }" />

    <view class="form-body">
      <!-- 管理员审批模式提示 -->
      <view v-if="isApproveMode" class="mode-banner mwp-fade-down">
        <MwpIcon name="settings" size="34rpx" class="mode-banner__icon" />
        <text class="mode-banner__text">
          修改后通过：下方内容将作为正式课程发布，提案原始内容保持不变
        </text>
      </view>

      <view
        v-else-if="editProposalId"
        class="mode-banner mode-banner--edit mwp-fade-down"
      >
        <MwpIcon name="file-text" size="34rpx" class="mode-banner__icon" />
        <text class="mode-banner__text">
          重新编辑模式：发布后将自动撤回原提案并重新发布
        </text>
      </view>

      <!-- 审批模式：原始提案信息（只读，不可修改） -->
      <view v-if="isApproveMode" class="card readonly-card">
        <view class="section-header">
          <text class="section-title">原始提案信息</text>
          <view class="readonly-badge">审批时不可修改</view>
        </view>
        <view class="readonly-row">
          <text class="readonly-label">提案人</text>
          <text class="readonly-value">{{
            proposalContributor || '匿名'
          }}</text>
        </view>
        <view v-if="proposalContribution !== null" class="readonly-row">
          <text class="readonly-label">贡献值</text>
          <text class="readonly-value">{{ proposalContribution }}</text>
        </view>
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
            :hover-start-time="0"
            :hover-stay-time="0"
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
                :hover-start-time="0"
                :hover-stay-time="0"
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
                :hover-start-time="0"
                :hover-stay-time="0"
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
            :hover-start-time="0"
            :hover-stay-time="0"
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
                <!-- 选中教师后：姓名左侧缩短，右侧并排职称输入 + 不填 -->
                <view v-if="teacherPicked" class="teacher-dept">
                  <input
                    class="teacher-dept__input"
                    :value="editTitle"
                    placeholder="教师职称"
                    placeholder-class="mwp-placeholder"
                    confirm-type="done"
                    @input="onTitleInput"
                    @focus="onTitleFocus"
                    @confirm="confirmTitleSelection"
                  />
                  <view
                    class="teacher-dept__skip"
                    hover-class="mwp-hover"
                    :hover-start-time="0"
                    :hover-stay-time="0"
                    @click.stop="skipTitle"
                  >
                    <text>不填</text>
                  </view>
                </view>
                <text class="float-field__label">授课教师</text>
              </template>
              <view v-else class="float-field__main">
                <text class="float-field__name">授课教师</text>
                <text class="float-field__hint">可多选</text>
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
                :hover-start-time="0"
                :hover-stay-time="0"
                @click.stop="handleRemoveTeacher(idx)"
              >
                <MwpIcon name="x" size="26rpx" />
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
                :hover-start-time="0"
                :hover-stay-time="0"
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
                :hover-start-time="0"
                :hover-stay-time="0"
                @click="selectNameSuggestion(s)"
              >
                <text class="inline-suggest__label">{{
                  s.label || s.value
                }}</text>
              </view>
            </scroll-view>
          </view>

          <!-- 职称建议（选中教师后）：常见职称可选，也可直接输入 -->
          <view
            v-if="
              editKind === 'teacher' &&
              teacherPicked &&
              (editTitle.trim() || teacherTitleSuggestions.length)
            "
            class="inline-layer inline-layer--right"
          >
            <scroll-view
              v-if="editTitle.trim() || teacherTitleSuggestions.length"
              scroll-y
              :show-scrollbar="false"
              class="inline-suggest"
              :style="{ height: suggestHeight(titleSuggestCount) }"
            >
              <view
                v-if="editTitle.trim()"
                class="inline-suggest__item"
                hover-class="mwp-hover"
                :hover-start-time="0"
                :hover-stay-time="0"
                @click="confirmTitleSelection"
              >
                <text class="inline-suggest__label">{{
                  editTitle.trim()
                }}</text>
                <text class="inline-suggest__hint">（新增）</text>
              </view>
              <view
                v-for="(s, i) in teacherTitleSuggestions"
                :key="i"
                class="inline-suggest__item"
                hover-class="mwp-hover"
                :hover-start-time="0"
                :hover-stay-time="0"
                @click="selectTitleSuggestion(s)"
              >
                <text class="inline-suggest__label">{{ s }}</text>
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
            <view class="tags-group tags-group--campus">
              <view
                v-for="campus in campusOptions"
                :key="campus"
                class="tag-item"
                :class="{ active: formData.campuses.includes(campus) }"
                hover-class="mwp-hover"
                :hover-start-time="0"
                :hover-stay-time="0"
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
        </view>
        <view class="input-box" :class="{ 'is-locked': isApproveMode }">
          <textarea
            v-model="formData.reason"
            class="reason-area"
            placeholder="请详细描述新增该课程的理由"
            placeholder-class="mwp-placeholder--area"
            :maxlength="300"
            :disabled="isApproveMode"
          />
          <text class="word-count">{{ formData.reason.length }}/300 字</text>
          <!-- 审批接口不支持修改提案理由，用遮罩明确标注 -->
          <view v-if="isApproveMode" class="readonly-mask">
            <text class="readonly-mask__text">提案理由审批时不可修改</text>
          </view>
        </view>
      </view>

      <!-- Section 4: 展示昵称 (管理员模式与编辑模式不显示) -->
      <view v-if="!isApproveMode && !editProposalId" class="card">
        <view class="section-header">
          <text class="section-title">展示设置</text>
        </view>
        <view class="form-row">
          <view class="label">展示昵称</view>
          <view class="su-toggle-wrapper">
            <view
              class="su-indicator"
              :class="{ ready: suIndicatorReady }"
              :style="suIndicatorStyle"
            />
            <view
              class="su-pill"
              :class="{ active: formData.showUsername === true }"
              hover-class="mwp-hover"
              :hover-start-time="0"
              :hover-stay-time="0"
              @click="selectShowUsername"
              >展示</view
            >
            <view
              class="su-pill"
              :class="{ active: formData.showUsername === false }"
              hover-class="mwp-hover"
              :hover-start-time="0"
              :hover-stay-time="0"
              @click="selectHideUsername"
              >不展示</view
            >
          </view>
        </view>
        <text class="field-hint">通过后展示你的昵称；选择"不展示"将匿名</text>
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
            ? '发布中...'
            : isApproveMode
            ? '通过提案'
            : editProposalId
            ? '重新发布'
            : '发布提案'
        }}
      </MwpButton>
      <view class="safe-area-bottom" />
    </view>

    <!-- 点击字段与浮层之外的区域：教师已填写则默认不填院系并添加，否则取消 -->
    <view v-if="editKind" class="edit-catcher" @click="handleCatcherClick" />

    <!-- 通用操作弹窗（发布 / 存草稿 / 恢复草稿）：多选项，用底部弹窗 -->
    <MwpActionSheet
      v-model:visible="sheetVisible"
      :title="sheetTitle"
      :description="sheetDescription"
      :actions="sheetActions"
      :cancel-text="sheetCancelText"
      @select="handleSheetSelect"
    />

    <!-- 修改后通过：二次确认，用居中弹窗 -->
    <MwpConfirmDialog
      v-model:visible="showApproveConfirm"
      title="通过提案"
      description="确定通过该提案并上架课程吗？"
      confirm-text="确认通过"
      tone="brand"
      @confirm="submit"
    />

    <!-- 丢弃草稿：破坏性操作，二次确认 -->
    <MwpConfirmDialog
      v-model:visible="showDiscardConfirm"
      title="丢弃草稿"
      description="丢弃后已填写的内容将无法恢复，确定丢弃草稿吗？"
      confirm-text="丢弃"
      tone="danger"
      @confirm="confirmDiscardDraft"
    />

    <!-- 未设置昵称却选择「展示」：先文字告知，再引导去设置昵称 -->
    <MwpConfirmDialog
      v-model:visible="showNeedNicknameDialog"
      title="需要修改昵称"
      description="尚未设置昵称，无法选择展示。请先设置昵称后再选择展示。"
      confirm-text="去设置"
      cancel-text="取消"
      @confirm="openNicknameDialog"
    />

    <!-- 设置昵称弹窗：保存成功后自动切到「展示」 -->
    <NicknameDialog
      v-model:visible="showNicknameDialog"
      @saved="onNicknameSaved"
    />

    <!-- 全局状态弹窗宿主 -->
    <MwpStatusOverlay />
  </view>
</template>

<script setup lang="ts">
import {
  reactive,
  ref,
  computed,
  nextTick,
  watch,
  onMounted,
  getCurrentInstance
} from 'vue';
import { onLoad, onUnload } from '@dcloudio/uni-app';
import TopNavBar from '@/components/common/TopNavBar.vue';
import { http, useThemeStore } from '@/config';
import { useMenuButton } from '@/composables/useMenuButton';
import {
  showLoading,
  hideLoading,
  showSuccess,
  showError,
  showInfo
} from '@/composables/useStatus';
import { TOAST_DURATION_MS, CAMPUS_OPTIONS } from '@/utils/constants';
import { errorMessageOf } from '@/utils/review-error';
import {
  readProposalDraft,
  writeProposalDraft,
  clearProposalDraft,
  type ProposalDraft
} from '@/utils/proposal-draft';
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
// 发布/通过成功后离开页面，不再把已提交内容当作草稿存回
const submittedSuccessfully = ref(false);

// 管理员模式：approveProposalId  /  重新编辑：editProposalId
const isApproveMode = ref(false);
const approveProposalId = ref('');
const editProposalId = ref('');
const editingStatus = ref('');

// 审批模式下的只读原始信息（不可修改）
const proposalContributor = ref('');
const proposalContribution = ref<number | null>(null);

const campusOptions = [...CAMPUS_OPTIONS];

// 仅保留后端认可的校区，避免历史草稿/旧提案里已失效的校区导致发布被拒
const sanitizeCampuses = (list: string[] | undefined) =>
  (Array.isArray(list) ? list : []).filter((c) => CAMPUS_OPTIONS.includes(c));

interface QuotaInfo {
  remaining: number;
  limit: number;
}
const quotaInfo = ref<QuotaInfo | null>(null);

// 当前账号昵称：为空时不允许选择「展示」
const displayUsername = ref('');
// 未设置昵称却点「展示」时的告知弹窗
const showNeedNicknameDialog = ref(false);

const loadProfile = async () => {
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
      displayUsername.value = String(data.username || '').trim();
    }
  } catch (e) {
    console.warn('[propose] loadProfile failed:', e);
  }
};

// 选择「展示」：昵称为空则不写入选择，仅提示去设置
const selectShowUsername = () => {
  if (displayUsername.value) {
    formData.showUsername = true;
    return;
  }
  showNeedNicknameDialog.value = true;
};

const selectHideUsername = () => {
  formData.showUsername = false;
};

// 指示块弹窗：选「展示」但昵称为空时，引导直接设置昵称
const showNicknameDialog = ref(false);
const openNicknameDialog = () => {
  showNicknameDialog.value = true;
};
// 昵称保存成功后，自动切到「展示」
const onNicknameSaved = (username: string) => {
  displayUsername.value = username;
  formData.showUsername = true;
};

// ===== 展示昵称滑块指示块（与「我的」筛选胶囊同款）=====
const suInstance = getCurrentInstance();
const suIndicatorStyle = ref<{ left: string; width: string }>({
  left: '0px',
  width: '0px'
});
const suIndicatorReady = ref(false);

const updateSuIndicator = () => {
  const proxy = suInstance?.proxy;
  if (!proxy) return;
  const query = uni.createSelectorQuery().in(proxy);
  query.select('.su-toggle-wrapper').boundingClientRect();
  query.select('.su-pill.active').boundingClientRect();
  query.exec((res) => {
    const result = (res || []) as unknown[];
    const wrapper = result[0] as { left?: number } | null;
    const pill = result[1] as { left?: number; width?: number } | null;
    if (!wrapper || !pill || pill.left === undefined || !pill.width) return;
    suIndicatorStyle.value = {
      left: `${pill.left - (wrapper.left || 0)}px`,
      width: `${pill.width}px`
    };
    suIndicatorReady.value = true;
  });
};

watch(
  () => formData.showUsername,
  () => nextTick(updateSuIndicator)
);
onMounted(() => nextTick(updateSuIndicator));

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
  formData.campuses = sanitizeCampuses(course.campuses);
  formData.reason = proposal.content || '';
  // 编辑/重新发布时该区块被隐藏，但必须原样保留用户此前的展示选择，否则会被默认值改写成匿名
  formData.showUsername = proposal.showUsername === true;
};

const fetchProposalForForm = async (id: string) => {
  const res = await http.ProposalController.proposalDetail(id);
  const proposal = res.data?.data?.proposal;
  if (proposal) {
    editingStatus.value = proposal.status || '';
    fillFormFromProposal(proposal);
    if (isApproveMode.value) {
      await loadReadonlyProposalInfo(id, proposal);
    }
  } else {
    showError('获取提案信息失败');
  }
};

// 审批页展示的只读信息：提案人 / 贡献值（后端审批接口不支持修改）
const loadReadonlyProposalInfo = async (
  proposalId: string,
  proposal: DtoProposalVO
) => {
  proposalContribution.value =
    typeof proposal.contribution === 'number' && proposal.contribution >= 0
      ? proposal.contribution
      : null;

  if (proposal.showUsername === false || !proposal.userId) {
    proposalContributor.value = '匿名';
    return;
  }
  try {
    const res = await http.UserController.userUsernameDetail(proposal.userId, {
      proposalId
    });
    proposalContributor.value = res.data?.data?.username?.trim() || '匿名';
  } catch {
    proposalContributor.value = '匿名';
  }
};

// ===== 本地草稿（纯前端 storage，不依赖后端）=====
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
  clearProposalDraft();
};

const buildDraft = (): ProposalDraft => ({
  courseName: formData.courseName,
  courseCode: formData.courseCode,
  department: formData.department,
  category: formData.category,
  teachers: formData.teachers,
  campuses: formData.campuses,
  reason: formData.reason,
  showUsername: formData.showUsername,
  savedAt: Date.now()
});

// 静默写入草稿（不弹提示），供离开页面时自动保存使用
const persistDraftSilently = (): boolean => writeProposalDraft(buildDraft());

const saveDraft = () => {
  if (!hasDraftContent()) {
    showInfo('还没有可保存的内容');
    return;
  }
  if (persistDraftSilently()) {
    showSuccess('草稿已保存');
  } else {
    showError('草稿保存失败');
  }
};

// 返回时自动存草稿：无论点返回按钮还是系统手势/物理键返回，都会走 onUnload。
// 此时页面已回到上一页，再用全局状态弹窗提示「已存为草稿」。
const autoSaveDraftOnLeave = () => {
  if (submittedSuccessfully.value) return;
  if (isApproveMode.value || editProposalId.value) return;
  if (!hasDraftContent()) return;
  if (!persistDraftSilently()) return;
  setTimeout(() => {
    showInfo('已存为草稿');
  }, 0);
};

const applyDraft = (draft: ProposalDraft) => {
  formData.courseName = draft.courseName || '';
  formData.courseCode = draft.courseCode || '';
  formData.department = draft.department || '';
  formData.category = draft.category || '';
  formData.teachers = Array.isArray(draft.teachers) ? draft.teachers : [];
  formData.campuses = sanitizeCampuses(draft.campuses);
  formData.reason = draft.reason || '';
  // 滑块只有「展示/不展示」两态，历史草稿可能为 null，统一回落到不展示
  formData.showUsername = draft.showUsername === true;
};

const maybeRestoreDraft = () => {
  const draft = readProposalDraft();
  if (!draft) return;
  pendingDraft.value = draft;
  openSheet('restore');
};

// ===== 通用操作弹窗 =====
type SheetContext = 'publish' | 'quota' | 'restore' | 'missing';

interface SheetAction {
  label: string;
  value: string;
  tone?: 'brand' | 'default' | 'danger';
}

const sheetVisible = ref(false);
const sheetContext = ref<SheetContext>('publish');
const pendingDraft = ref<ProposalDraft | null>(null);
const showApproveConfirm = ref(false);
const showDiscardConfirm = ref(false);

const sheetTitle = computed(() => {
  switch (sheetContext.value) {
    case 'quota':
      return '今日额度已用完';
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
        ? `今日可发布 ${q.limit} 个提案，已用完，可先保存草稿。`
        : '今日额度已用完，可先保存草稿。';
    case 'restore':
      return '检测到上次未发布的草稿，是否恢复？';
    case 'missing':
      return `请先完善：${missingFields.value.join('、')}`;
    default:
      return q ? `今日剩余可发布 ${q.remaining}/${q.limit} 个提案。` : '';
  }
});

const sheetActions = computed<SheetAction[]>(() => {
  switch (sheetContext.value) {
    case 'quota':
      return [{ label: '存草稿', value: 'draft', tone: 'brand' }];
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
      break;
    case 'restore':
      if (pendingDraft.value) {
        applyDraft(pendingDraft.value);
        showInfo('已恢复草稿');
      }
      pendingDraft.value = null;
      break;
    case 'discard-draft':
      // 破坏性操作，先二次确认
      showDiscardConfirm.value = true;
      break;
  }
};

const confirmDiscardDraft = () => {
  clearDraft();
  pendingDraft.value = null;
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

// 常见教师职称，既可点选也可直接输入自定义值
const COMMON_TEACHER_TITLES = [
  '教授',
  '副教授',
  '讲师',
  '研究员',
  '副研究员',
  '助理研究员'
];

const editKind = ref<EditKind | null>(null);
const autoFocus = ref(false);
const editValue = ref('');
const editTitle = ref('');
// 是否已「选中教师」（选中后才展开职称输入）
const teacherPicked = ref(false);
const editSuggestions = ref<DtoFieldSuggestionVO[]>([]);
const editLoading = ref(false);
const teacherNameSuggestions = ref<DtoFieldSuggestionVO[]>([]);
const teacherNameLoading = ref(false);
let editTimer: ReturnType<typeof setTimeout> | null = null;

// 职称建议：空输入展示全部常见职称，有输入则前缀/包含过滤
const teacherTitleSuggestions = computed(() => {
  const kw = editTitle.value.trim();
  if (!kw) return COMMON_TEACHER_TITLES;
  return COMMON_TEACHER_TITLES.filter((t) => t.includes(kw));
});

// 建议列表需要确定高度才能在 scroll-view 中滚动
const suggestHeight = (count: number) =>
  `${Math.min(Math.max(count, 1), 6) * 68}rpx`;
const singleSuggestCount = computed(
  () => (editValue.value.trim() ? 1 : 0) + editSuggestions.value.length
);
const teacherNameSuggestCount = computed(
  () => (editValue.value.trim() ? 1 : 0) + teacherNameSuggestions.value.length
);
const titleSuggestCount = computed(
  () => (editTitle.value.trim() ? 1 : 0) + teacherTitleSuggestions.value.length
);

const openEditor = (kind: EditKind) => {
  // 已在编辑该栏则忽略（点击输入框冒泡到这里时不重置内容）
  if (editKind.value === kind) return;
  editKind.value = kind;
  teacherPicked.value = false;
  editSuggestions.value = [];
  editLoading.value = false;
  teacherNameSuggestions.value = [];
  teacherNameLoading.value = false;
  editTitle.value = '';
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

const onTitleFocus = () => {
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
  teacherNameLoading.value = false;
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
      page: 1,
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
  // 重新编辑姓名即撤销「已选中」，职称输入收起
  teacherPicked.value = false;
  editTitle.value = '';
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

// 选中教师：完整呈现名称，收起姓名建议，展开职称输入
const pickTeacher = () => {
  if (!editValue.value.trim()) return;
  teacherPicked.value = true;
  teacherNameSuggestions.value = [];
  editTitle.value = '';
};

const onNameConfirm = () => {
  pickTeacher();
};

const onTitleInput = (e: { detail: { value: string } }) => {
  editTitle.value = e.detail.value;
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

// 选中职称候选 / 输入自定义职称 / 点击「不填」→ 添加该教师
const selectTitleSuggestion = (title: string) => {
  editTitle.value = title;
  addTeacher();
};

const skipTitle = () => {
  editTitle.value = '';
  addTeacher();
};

const confirmTitleSelection = () => {
  addTeacher();
};

// 点击字段与浮层之外的区域：
// 教师姓名已填写 → 视为「不填职称」直接添加，而非取消填写
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
    showInfo('请输入教师姓名');
    return;
  }
  formData.teachers.push({
    name,
    title: editTitle.value.trim(),
    department: '',
    teacherId: ''
  });
  editValue.value = '';
  editTitle.value = '';
  teacherPicked.value = false;
  teacherNameSuggestions.value = [];
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
  if (!formData.courseCode.trim()) miss.push('课程代码');
  if (!formData.department) miss.push('开课院系');
  if (!formData.category) miss.push('课程类别');
  if (!formData.campuses.length) miss.push('开课校区');
  if (!formData.teachers.some((t) => (t.name || '').trim()))
    miss.push('授课教师');
  return miss;
});

// 是否满足发布条件（不满足则按钮置灰，但可点击查看缺项）
const canPublish = computed(() => missingFields.value.length === 0);

// 发布入口：缺项 → 提示缺什么；额度用完 → 拦截；否则确认发布
const handlePublish = () => {
  if (!canPublish.value) {
    openSheet('missing');
    return;
  }

  // 审批通过：二次确认后提交（居中确认弹窗）
  if (isApproveMode.value) {
    showApproveConfirm.value = true;
    return;
  }

  // 额度用完：新增和重新编辑都要创建新提案，统一拦截。
  // 重新编辑会先撤回原提案再发布，若不拦截，额度满时原提案已被撤回却发不出，导致提案丢失。
  if (quotaInfo.value && quotaInfo.value.remaining <= 0) {
    if (editProposalId.value) {
      showInfo(`今日发布已达上限(${quotaInfo.value.limit})，暂时无法修改`);
      return;
    }
    openSheet('quota');
    return;
  }

  // 重新编辑：通过额度校验后直接提交
  if (editProposalId.value) {
    submit();
    return;
  }

  openSheet('publish');
};

// 统一解析后端失败提示：业务错误码中文 > 后端 msg > 兜底文案
const resolveErrorTitle = (
  code: number | undefined,
  msg: string | undefined,
  fallback: string
) => errorMessageOf(code, msg) || (msg || '').trim() || fallback;

const submit = async () => {
  if (
    !isApproveMode.value &&
    quotaInfo.value &&
    quotaInfo.value.remaining <= 0
  ) {
    showInfo(`今日发布已达上限(${quotaInfo.value.limit})`);
    return;
  }

  submitting.value = true;
  showLoading('发布中...');

  try {
    const teachers: DtoTeacherVO[] = formData.teachers
      .filter((t) => (t.name || '').trim())
      .map((t) => ({
        name: (t.name || '').trim(),
        title: (t.title || '').trim(),
        department: t.department || '',
        id: t.teacherId || undefined
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
          finalCourse
          // 不传 title：审批接口会永久改写提案标题，撤回审批后标题与课程内容会不一致
        }
      );
      const code = res.data?.code;
      const msg = res.data?.msg;
      if (code === 200 || code === 0 || code === 201) {
        submittedSuccessfully.value = true;
        hideLoading();
        showSuccess('已通过');
        uni.$emit('proposalListShouldRefresh');
        setTimeout(() => uni.navigateBack(), TOAST_DURATION_MS);
      } else {
        console.error('[propose] approve failed:', {
          code,
          msg,
          body: res.data
        });
        hideLoading();
        showError(resolveErrorTitle(code, msg, '通过失败，请重试'));
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
      let res;
      if (editProposalId.value) {
        // 重新编辑：自动撤回原提案后再发布，避免产生重复提案
        if (editingStatus.value === 'rejected') {
          // rejected 提案由后端在同一事务内软删除原提案并创建新提案
          res = await http.ProposalController.proposalResubmitCreate(
            editProposalId.value,
            reqData
          );
        } else {
          // pending 等其他状态：先发布新提案，成功后再软删除原提案，
          // 避免「先删后建」在中途失败时丢失原提案
          res = await http.ProposalController.proposalAddCreate(reqData);
          const newCode = res.data?.code;
          if (newCode === 200 || newCode === 0 || newCode === 201) {
            const delRes = await http.ProposalController.proposalDeleteCreate(
              editProposalId.value,
              {}
            );
            const delCode = delRes.data?.code;
            if (delCode !== 200 && delCode !== 0 && delCode !== 201) {
              showInfo('新提案已发布，原提案撤回失败，请到广场手动撤回');
            }
          }
        }
      } else {
        res = await http.ProposalController.proposalAddCreate(reqData);
      }
      const code = res.data?.code;
      const msg = res.data?.msg;
      if (code === 200 || code === 0 || code === 201) {
        submittedSuccessfully.value = true;
        if (!editProposalId.value) clearDraft();
        hideLoading();
        showSuccess(editProposalId.value ? '重新发布成功' : '发布成功');
        uni.$emit('proposalListShouldRefresh');
        setTimeout(() => uni.navigateBack(), TOAST_DURATION_MS);
      } else {
        console.error('[propose] submit failed:', {
          code,
          msg,
          body: res.data
        });
        hideLoading();
        showError(resolveErrorTitle(code, msg, '发布失败，请重试'));
      }
    }
  } catch (err) {
    console.error('[propose] submit error:', err);
    const e = err as {
      response?: { data?: { code?: number; msg?: string } };
      message?: string;
    };
    hideLoading();
    showError(
      resolveErrorTitle(
        e.response?.data?.code,
        e.response?.data?.msg,
        '操作失败，请重试'
      )
    );
  } finally {
    hideLoading();
    submitting.value = false;
  }
};

// 页面卸载即视为「返回」：新增模式下已填写内容会自动存为草稿并提示
onUnload(() => {
  if (editTimer) clearTimeout(editTimer);
  autoSaveDraftOnLeave();
});

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
    // 重新编辑本质是撤回后重新发布，同样消耗每日额度，需先拉取额度用于拦截
    loadProfile();
    try {
      await fetchProposalForForm(options.editProposalId);
    } catch (e) {
      console.error('edit form load error:', e);
    }
  } else {
    loadProfile();
    maybeRestoreDraft();
  }
});
</script>

<style lang="scss" scoped src="./propose.scss" />
