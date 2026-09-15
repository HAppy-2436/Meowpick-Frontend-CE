<template>
  <view class="container" :class="themeStore.themeClass">
    <TopNavBar
      :title="isApproveMode ? '最终确认提案' : (editProposalId ? '重新编辑提案' : '新增提案')"
      :subtitle="quotaSubtitle"
    />

    <view :style="{ height: navBarHeight + 'px' }"></view>

    <view v-if="quotaInfo && !isApproveMode && !editProposalId" class="quota-banner">
      <text class="quota-text">
        今日剩余可提交 {{ quotaInfo.remaining }}/{{ quotaInfo.limit }} 个提案
      </text>
    </view>

    <view class="form-body">

      <!-- 管理员审批模式提示 -->
      <view v-if="isApproveMode" class="mode-banner mwp-fade-down">
        <text class="mode-banner__icon">⚙️</text>
        <text class="mode-banner__text">
          管理员审批模式：可修改课程信息作为最终发布版本
        </text>
      </view>

      <view v-else-if="editProposalId" class="mode-banner mode-banner--edit mwp-fade-down">
        <text class="mode-banner__icon">📝</text>
        <text class="mode-banner__text">
          重新编辑模式：原提案状态保留，新提交将作为新提案
        </text>
      </view>

      <!-- Section 1: 基本信息 -->
      <view class="card">
         <view class="card-title">基本信息</view>

         <view class="form-row" @click="openSearchModal('courseName')">
            <view class="label">课程名称</view>
            <view class="input-display">
              <text class="input-display__text" :class="{ 'is-empty': !formData.courseName }">
                {{ formData.courseName || '请输入课程名称' }}
              </text>
              <text class="arrow">›</text>
            </view>
         </view>

         <view class="form-row" @click="openSearchModal('courseCode')">
            <view class="label">课程代码</view>
            <view class="input-display">
              <text class="input-display__text" :class="{ 'is-empty': !formData.courseCode }">
                {{ formData.courseCode || '请输入课程代码 (选填)' }}
              </text>
              <text class="arrow">›</text>
            </view>
         </view>

         <view class="form-row" @click="openSearchModal('department')">
            <view class="label">开课院系</view>
            <view class="input-display">
              <text class="input-display__text" :class="{ 'is-empty': !formData.department }">
                {{ formData.department || '请选择开课院系' }}
              </text>
              <text class="arrow">›</text>
            </view>
         </view>

         <view class="form-row" @click="openSearchModal('category')">
            <view class="label">课程类别</view>
            <view class="input-display">
              <text class="input-display__text" :class="{ 'is-empty': !formData.category }">
                {{ formData.category || '请选择课程类别' }}
              </text>
              <text class="arrow">›</text>
            </view>
         </view>
      </view>

      <!-- Section 2: 教学信息 -->
      <view class="card">
         <view class="card-title">教学信息</view>

         <view class="form-row" @click="openTeacherListModal">
            <view class="label">授课教师</view>
            <view class="input-display">
              <text class="input-display__text" :class="{ 'is-empty': !formData.teachers.length }">
                {{ formData.teachers.length ? `${formData.teachers.length} 位教师` : '请添加授课教师' }}
              </text>
              <text class="arrow">›</text>
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
             <text v-if="t.title" class="teacher-summary__title">· {{ t.title }}</text>
           </view>
         </view>

         <view class="form-col">
            <view class="label" style="margin-bottom: 20rpx;">开课校区 (多选)</view>
            <view class="tags-group">
                <view
                    class="tag-item mwp-pressable"
                    v-for="campus in campusOptions"
                    :key="campus"
                    :class="{ active: formData.campuses.includes(campus) }"
                    @click="toggleCampus(campus)"
                >
                    {{ campus }}
                </view>
            </view>
         </view>
      </view>

      <!-- Section 3: 提案理由 -->
      <view class="card">
         <view class="card-title">提案理由</view>
          <textarea
            class="reason-area"
            v-model="formData.reason"
            placeholder="请详细描述新增该课程的理由"
            placeholder-class="mwp-placeholder"
            maxlength="300"
          />
         <view class="word-count">{{ formData.reason.length }}/300</view>
      </view>

      <!-- Section 4: 展示昵称 (管理员模式与编辑模式不显示) -->
      <view v-if="!isApproveMode && !editProposalId" class="card">
         <view class="card-title">展示设置</view>
         <view class="form-row">
            <view class="label">展示昵称</view>
            <view class="show-username-options">
                <view
                  class="tag-item mwp-pressable"
                  :class="{ active: formData.showUsername === true }"
                  @click="formData.showUsername = true"
                >展示</view>
                <view
                  class="tag-item mwp-pressable"
                  :class="{ active: formData.showUsername === false }"
                  @click="formData.showUsername = false"
                >不展示</view>
            </view>
         </view>
         <text class="field-hint">通过后展示你的昵称；选择"否"将匿名</text>
      </view>

      <!-- 提交按钮 -->
      <Button
        class="submit-btn"
        tone="brand"
        size="lg"
        block
        :loading="submitting"
        :disabled="submitting || (quotaInfo?.remaining ?? 1) <= 0"
        @click="submit"
      >
        {{ submitting ? '提交中...' : (isApproveMode ? '通过提案' : (editProposalId ? '重新提交' : '发布提案')) }}
      </Button>
      <view class="safe-area-bottom"></view>

    </view>

    <!-- 字段搜索弹窗 -->
    <SearchModal
      v-model:visible="showSearchModal"
      :title="modalTitle"
      :placeholder="searchPlaceholder"
      :field="currentField"
      :allow-add="true"
      @select="handleSearchSelect"
    />

    <!-- 教师列表弹窗 -->
    <TeacherListModal
      v-model:visible="showTeacherListModal"
      :teachers="formData.teachers"
      @add="showAddTeacherModal = true"
      @remove="handleRemoveTeacher"
    />

    <!-- 添加教师表单弹窗 -->
    <AddTeacherModal
      v-model:visible="showAddTeacherModal"
      @confirm="handleConfirmAddTeacher"
    />
  </view>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import TopNavBar from '@/components/common/TopNavBar.vue';
import SearchModal from '@/components/common/SearchModal.vue';
import TeacherListModal from '@/components/common/TeacherListModal.vue';
import AddTeacherModal, { type TeacherDraft } from '@/components/common/AddTeacherModal.vue';
import { http, useThemeStore } from '@/config';
import { useMenuButton } from '@/composables/useMenuButton';
import { TOAST_DURATION_MS } from '@/utils/constants';
import type { DtoProposalTeacherVO, DtoProposalCourseVO, FieldSuggestionVO } from '@/api/data-contracts';

const themeStore = useThemeStore();
const { navBarHeight } = useMenuButton();

interface TeacherEntry { name: string; title: string; department?: string; teacherId?: string }
const formData = reactive({
  courseName: '',
  courseCode: '',
  department: '',
  category: '',
  teachers: [] as TeacherEntry[],
  campuses: [] as string[],
  reason: '',
  showUsername: null as boolean | null,
});

const submitting = ref(false);
const showSearchModal = ref(false);
const showTeacherListModal = ref(false);
const showAddTeacherModal = ref(false);
const currentField = ref<'courseName' | 'courseCode' | 'department' | 'category' | 'campus' | 'teacherName'>('courseName');

// 管理员模式：approveProposalId  /  重新编辑：editProposalId
const isApproveMode = ref(false);
const approveProposalId = ref('');
const editProposalId = ref('');

const campusOptions = ['普陀校区', '闵行校区', '滴水湖校区'];

interface QuotaInfo { remaining: number; limit: number }
const quotaInfo = ref<QuotaInfo | null>(null);
const quotaSubtitle = computed(() => {
  if (quotaInfo.value) {
    return `今日剩余 ${quotaInfo.value.remaining}/${quotaInfo.value.limit}`;
  }
  return '加载中...';
});

const loadQuota = async () => {
  try {
    const res: any = await http.UserController.userProfileList();
    const data = res.data?.data;
    if (data) {
      quotaInfo.value = {
        remaining: data.dailyQuota ?? 0,
        limit: data.dailyQuotaLimit ?? 0,
      };
    }
  } catch (e) {
    console.warn('[propose] loadQuota failed:', e);
  }
};

const fillFormFromProposal = (proposal: any) => {
  const course = proposal.course || {};
  formData.courseName = course.name || proposal.title || '';
  formData.courseCode = course.code || '';
  formData.department = course.department || '';
  formData.category = course.category || '';
  formData.teachers = (course.teachers || []).map((t: any) => ({
    name: typeof t === 'string' ? t : (t.name || ''),
    title: typeof t === 'string' ? '' : (t.title || ''),
    department: typeof t === 'string' ? '' : (t.department || ''),
    teacherId: typeof t === 'string' ? '' : (t.teacherId || ''),
  }));
  formData.campuses = Array.isArray(course.campuses) ? [...course.campuses] : [];
  formData.reason = proposal.content || '';
};

const fetchProposalForForm = async (id: string) => {
  const res: any = await http.ProposalController.proposalDetail(id, id);
  const data = res.data?.data;
  const proposal = data?.proposal || data?.data?.proposal;
  if (proposal) {
    fillFormFromProposal(proposal);
  } else {
    uni.showToast({ title: '获取提案信息失败', icon: 'none' });
  }
};

// SearchModal 相关
const modalTitle = computed(() => {
  const titles: Record<string, string> = {
    courseName: '选择课程名称',
    courseCode: '输入课程代码',
    department: '选择开课院系',
    category: '选择课程类别',
    campus: '选择开课校区',
    teacherName: '选择教师',
  };
  return titles[currentField.value] || '搜索';
});

const searchPlaceholder = computed(() => {
  const placeholders: Record<string, string> = {
    courseName: '输入或搜索课程名称',
    courseCode: '输入课程代码',
    department: '输入或搜索开课院系',
    category: '输入或选择课程类别',
    campus: '输入或选择开课校区',
    teacherName: '输入或搜索教师姓名',
  };
  return placeholders[currentField.value] || '请输入关键词';
});

const openSearchModal = (field: typeof currentField.value) => {
  currentField.value = field;
  showSearchModal.value = true;
};

const handleSearchSelect = (item: FieldSuggestionVO) => {
  const value = item.value || item.label || '';
  switch (currentField.value) {
    case 'courseName':
      formData.courseName = value;
      break;
    case 'courseCode':
      formData.courseCode = value;
      break;
    case 'department':
      formData.department = value;
      break;
    case 'category':
      formData.category = value;
      break;
    case 'campus':
      if (!formData.campuses.includes(value)) formData.campuses.push(value);
      break;
  }
};

const openTeacherListModal = () => {
  showTeacherListModal.value = true;
};

const handleRemoveTeacher = (idx: number) => {
  formData.teachers.splice(idx, 1);
};

const handleConfirmAddTeacher = (teacher: TeacherDraft) => {
  formData.teachers.push({
    name: teacher.name,
    title: teacher.title || '',
    department: teacher.department || '',
    teacherId: teacher.teacherId || '',
  });
};

const toggleCampus = (campus: string) => {
  const idx = formData.campuses.indexOf(campus);
  if (idx > -1) formData.campuses.splice(idx, 1);
  else formData.campuses.push(campus);
};

const validate = (): string | null => {
  if (!formData.courseName.trim()) return '请输入课程名称';
  if (!formData.department) return '请选择开课院系';
  if (!formData.category) return '请选择课程类别';
  if (!formData.campuses.length) return '请选择开课校区';
  const validTeachers = formData.teachers.filter((t) => t.name.trim());
  if (!validTeachers.length) return '请填写至少一位授课教师';
  if (!isApproveMode.value && !editProposalId.value && formData.showUsername === null) {
    return '请选择是否展示昵称';
  }
  return null;
};

const submit = async () => {
  const errMsg = validate();
  if (errMsg) {
    uni.showToast({ title: errMsg, icon: 'none' });
    return;
  }
  if (!isApproveMode.value && quotaInfo.value && quotaInfo.value.remaining <= 0) {
    uni.showToast({ title: `今日提交已达上限(${quotaInfo.value.limit})`, icon: 'none' });
    return;
  }

  submitting.value = true;

  const teachers: DtoProposalTeacherVO[] = formData.teachers
    .filter((t) => t.name.trim())
    .map((t) => ({
      name: t.name.trim(),
      title: t.title.trim() || '',
      department: t.department || '',
      teacherId: t.teacherId || '',
    }));

  try {
    if (isApproveMode.value && approveProposalId.value) {
      // 管理员审批通过 - 复用表单填入 finalCourse
      const finalCourse: DtoProposalCourseVO = {
        name: formData.courseName.trim(),
        code: (formData.courseCode || '').trim().toUpperCase() || undefined,
        department: formData.department,
        category: formData.category,
        campuses: formData.campuses,
        teachers,
      };
      const res: any = await http.ProposalController.proposalApproveCreate(
        approveProposalId.value,
        { proposalID: approveProposalId.value, finalCourse, title: formData.courseName.trim() }
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
          teachers,
        },
        showUsername: formData.showUsername as boolean,
      };
      const res: any = await http.ProposalController.proposalAddCreate(reqData);
      const code = res.data?.code;
      const msg = res.data?.msg;
      if (code === 200 || code === 0 || code === 201) {
        uni.showToast({
          title: editProposalId.value ? '重新提交成功' : '提交成功，等待管理员审核',
          icon: 'success',
        });
        uni.$emit('proposalListShouldRefresh');
        setTimeout(() => uni.navigateBack(), TOAST_DURATION_MS);
      } else {
        uni.showToast({ title: msg || `提交失败(code:${code})`, icon: 'none' });
      }
    }
  } catch (err: any) {
    const m = err?.response?.data?.msg || err?.message || '操作失败';
    console.error('[propose] submit error:', err);
    uni.showToast({ title: m, icon: 'none' });
  } finally {
    submitting.value = false;
  }
};

const goBack = () => uni.navigateBack();

onLoad(async (options: any) => {
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
  }
});
</script>

<style lang="scss" scoped src="./_style.scss" />