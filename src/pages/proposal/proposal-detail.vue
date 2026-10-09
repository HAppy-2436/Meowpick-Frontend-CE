<template>
  <view class="proposal-detail-page" :class="themeStore.themeClass">
    <TopNavBar title="提案详情" />

    <view :style="{ height: navBarHeight + 'px' }" />

    <scroll-view scroll-y class="content-scroll">
      <view class="proposal-card" :class="{ 'is-guest': isGuestView }">
        <!-- 头部：标题 + 贡献者/贡献值（右上角），品牌极淡底 + 角落光晕 -->
        <view class="card-hero">
          <view class="title-row">
            <text
              class="proposal-title"
              :class="{
                'is-clickable': proposalStatus === 'approved' && courseId
              }"
              @click="goToCourse(courseId)"
              >{{ displayName || '未命名提案' }}</text
            >
            <view class="hero-meta">
              <text v-if="contributorName" class="hero-contributor"
                >贡献者：{{ contributorName }}</text
              >
              <view v-if="contribution > 0" class="contribution-display">
                <text class="contribution-label">贡献值</text>
                <text class="contribution-value">+{{ contribution }}</text>
              </view>
            </view>
          </view>
          <text v-if="nameChanged" class="proposal-original">
            （原：{{ originalName }}）
          </text>
        </view>

        <view class="card-body">
          <view v-if="hasRevision" class="revision-tip">
            <MwpIcon
              name="square-pen"
              size="26rpx"
              class="revision-tip__icon"
            />
            <text class="revision-tip__text">
              管理员以「修改后通过」发布：上架版本为下方内容，删除线为提案原始内容
            </text>
          </view>

          <!-- 关键信息：图标 + 标签 + 值 -->
          <view class="meta-list">
            <view class="meta-item">
              <view class="meta-icon">
                <MwpIcon name="user-round" size="30rpx" />
              </view>
              <view class="meta-text">
                <text class="meta-label">提案教师</text>
                <text class="meta-value">{{ displayTeachers || '待定' }}</text>
                <text v-if="teachersChanged" class="meta-original">
                  原：{{ originalTeachers }}
                </text>
              </view>
            </view>

            <view v-if="displayDepartment" class="meta-item">
              <view class="meta-icon">
                <MwpIcon name="building-2" size="30rpx" />
              </view>
              <view class="meta-text">
                <text class="meta-label">开课院系</text>
                <text class="meta-value">{{ displayDepartment }}</text>
                <text v-if="departmentChanged" class="meta-original">
                  原：{{ originalDepartment }}
                </text>
              </view>
            </view>

            <view class="meta-item">
              <view class="meta-icon">
                <MwpIcon name="map-pin" size="30rpx" />
              </view>
              <view class="meta-text">
                <text class="meta-label">开课校区</text>
                <text class="meta-value">{{ displayCampus || '全校' }}</text>
                <text v-if="campusChanged" class="meta-original">
                  原：{{ originalCampus }}
                </text>
              </view>
            </view>

            <view class="meta-item">
              <view class="meta-icon">
                <MwpIcon name="tag" size="30rpx" />
              </view>
              <view class="meta-text">
                <text class="meta-label">课程类型</text>
                <text class="meta-value">{{
                  displayCategory || '通识课'
                }}</text>
                <text v-if="categoryChanged" class="meta-original">
                  原：{{ originalCategory }}
                </text>
              </view>
            </view>

            <view v-if="displayCode" class="meta-item">
              <view class="meta-icon">
                <MwpIcon name="file-text" size="30rpx" />
              </view>
              <view class="meta-text">
                <text class="meta-label">课程代码</text>
                <text class="meta-value">{{ displayCode }}</text>
              </view>
            </view>
          </view>

          <!-- 提案理由 -->
          <view class="reason-section">
            <text class="section-title">提案理由</text>
            <view class="proposal-reason-box">
              <text class="reason-content">{{
                proposalData.reason || '该用户未填写详细理由。'
              }}</text>
            </view>
          </view>
        </view>

        <!-- 支持区（仅普通用户视角）：显眼的一键支持 -->
        <view v-if="isGuestView" class="vote-area">
          <view class="vote-info">
            <text class="vote-count-big">{{
              proposalData.voteCount || 0
            }}</text>
            <text class="vote-text">人支持此提案</text>
          </view>
          <text class="vote-hint">喜欢这门课？点个支持，帮它早日开课</text>
          <MwpButton
            :tone="isVoted ? 'plain' : 'brand'"
            size="lg"
            block
            :loading="voting"
            @click="handleVote"
          >
            <template #icon>
              <MwpIcon
                :name="isVoted ? 'heart-filled' : 'heart'"
                size="34rpx"
              />
            </template>
            {{ isVoted ? '已支持' : '支持提案' }}
          </MwpButton>
        </view>
      </view>

      <!-- 进度：本人看「审核进度」，管理员看「时间日志」 -->
      <view v-if="!isGuestView" class="timeline-card">
        <view class="timeline-card__head">
          <text class="section-title">操作日志</text>
          <view class="timeline-card__status">
            <StatusBadge
              :status="proposalStatus || 'pending'"
              :label="badgeText"
              pill
            />
            <StatusBadge v-if="hasRevision" tone="info" label="已修订" pill />
          </view>
        </view>

        <view class="timeline">
          <view
            v-for="node in timelineNodes"
            :key="node.key"
            class="timeline-item"
            :class="{
              'is-done': node.state === 'done',
              'is-rejected': node.state === 'rejected',
              'is-active': node.state === 'active',
              'is-revise': node.state === 'revise'
            }"
          >
            <view class="timeline-dot">
              <MwpIcon v-if="node.icon" :name="node.icon" size="22rpx" />
            </view>
            <view class="timeline-body">
              <text class="timeline-title">{{ node.title }}</text>
              <text v-if="node.time" class="timeline-time">{{
                node.time
              }}</text>
              <text v-if="node.desc" class="timeline-desc">{{
                node.desc
              }}</text>
            </view>
          </view>
        </view>

        <view
          v-if="proposalStatus === 'rejected' && rejectReason"
          class="reject-reason"
        >
          <text class="reject-reason__label">拒绝理由</text>
          <text class="reject-reason__text">{{ rejectReason }}</text>
        </view>
      </view>

      <view
        class="bottom-spacer"
        :class="{
          'bottom-spacer--actions': showAdminActions || showOwnerActions
        }"
      />
    </scroll-view>

    <!-- 本人操作栏（仅未审核时）：撤回提案 / 修改 -->
    <view
      v-if="showOwnerActions"
      class="action-bar"
      :class="themeStore.themeClass"
    >
      <MwpButton
        class="action-btn"
        tone="danger-outline"
        size="lg"
        block
        @click="withdrawOwnProposal"
        >撤回提案</MwpButton
      >
      <MwpButton
        class="action-btn"
        tone="brand"
        size="lg"
        block
        @click="goEditProposal"
        >修改</MwpButton
      >
    </view>

    <!-- 管理员审批操作栏：待审核提案才展示 -->
    <view
      v-if="showAdminActions"
      class="action-bar"
      :class="themeStore.themeClass"
    >
      <MwpButton
        class="action-btn"
        tone="danger-outline"
        size="lg"
        block
        @click="openRejectModal"
        >拒绝</MwpButton
      >
      <MwpButton
        class="action-btn"
        tone="plain"
        size="lg"
        block
        @click="goModifyApprove"
        >修改后通过</MwpButton
      >
      <MwpButton
        class="action-btn"
        tone="brand"
        size="lg"
        block
        :disabled="originalCourseMissing"
        @click="approveDirectly"
        >原样通过</MwpButton
      >
    </view>

    <RejectModal
      v-model:visible="showRejectModal"
      @confirm="handleRejectConfirm"
    />

    <MwpConfirmDialog
      v-model:visible="showApproveConfirm"
      title="原样通过提案"
      description="将基于用户提交的原始内容上架课程，不做任何修改。确定通过吗？"
      confirm-text="原样通过"
      tone="brand"
      @confirm="performApprove"
    />

    <MwpConfirmDialog
      v-model:visible="showWithdrawConfirm"
      title="撤回提案"
      description="撤回后提案将被移除，且无法恢复，确定撤回提案吗？"
      confirm-text="撤回提案"
      tone="danger"
      @confirm="performWithdraw"
    />

    <!-- 全局状态弹窗宿主 -->
    <MwpStatusOverlay />
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { onLoad, onShow } from '@dcloudio/uni-app';
import TopNavBar from '@/components/common/TopNavBar.vue';
import RejectModal from '@/components/common/RejectModal.vue';
import { showSuccess, showError, showInfo } from '@/composables/useStatus';
import { http, useThemeStore, useTokenStore } from '@/config';
import { useMenuButton } from '@/composables/useMenuButton';
import { errorMessageOf } from '@/utils/review-error';
import {
  actionTextForLog,
  actionTextOf,
  parseLogTime,
  type LogItem
} from '@/utils/proposal-log';
import { parseBackendTime } from '@/utils/time';
import type { IconName } from '@/icons';
import type { DtoProposalCourseVO, DtoTeacherVO } from '@/api/data-contracts';

const themeStore = useThemeStore();
const tokenStore = useTokenStore();
const { navBarHeight } = useMenuButton();

interface PassedProposalData {
  id?: string;
  userId?: string;
  name?: string;
  teacher?: string;
  campus?: string;
  category?: string;
  reason?: string;
  date?: string;
  updatedAt?: string;
  voteCount?: number;
  isVoted?: boolean;
  likeCnt?: number;
  status?: string;
  // 列表页带入的原始 / 上架版本（普通用户详情接口拿不到 finalCourse）
  course?: DtoProposalCourseVO | null;
  finalCourse?: DtoProposalCourseVO | null;
}

const proposalData = ref<PassedProposalData>({});
const isVoted = ref(false);
const voting = ref(false);
const proposalStatus = ref('');
const rejectReason = ref('');
const contribution = ref(0);
// 贡献者昵称：来源提案允许展示且已设置昵称时才有值，否则为空（匿名）
const contributorName = ref('');

// 提案创建者用户ID（详情接口返回；用于判定本人视角）
const ownerUserId = ref('');

// 管理员身份与「管理员模式」开关
const isAdmin = ref(false);
const adminMode = ref(true);

// 管理员审批时可提交修订后的课程（finalCourse），而提案原始 course 不会被覆盖。
// 详情接口同时返回两者，这里用「上架版本 + 括号内原始提交」体现管理员的修改。
const originalCourse = ref<DtoProposalCourseVO | null>(null);
const finalCourse = ref<DtoProposalCourseVO | null>(null);

const teachersText = (course?: DtoProposalCourseVO | null) => {
  const list = course?.teachers;
  if (!Array.isArray(list)) return '';
  return list
    .map((t: DtoTeacherVO | string) =>
      typeof t === 'string' ? t : t.name || ''
    )
    .filter(Boolean)
    .join('、');
};

const campusesText = (course?: DtoProposalCourseVO | null) => {
  const campuses = course?.campuses;
  return Array.isArray(campuses) ? campuses.join('、') : '';
};

const publishedCourse = computed(
  () => finalCourse.value || originalCourse.value
);

const displayName = computed(
  () => publishedCourse.value?.name || proposalData.value.name || ''
);
const originalName = computed(
  () => originalCourse.value?.name || proposalData.value.name || ''
);
const nameChanged = computed(
  () =>
    !!finalCourse.value &&
    !!originalName.value &&
    displayName.value !== originalName.value
);

const displayTeachers = computed(
  () => teachersText(publishedCourse.value) || proposalData.value.teacher || ''
);
const originalTeachers = computed(
  () => teachersText(originalCourse.value) || proposalData.value.teacher || ''
);
const teachersChanged = computed(
  () =>
    !!finalCourse.value &&
    !!originalTeachers.value &&
    displayTeachers.value !== originalTeachers.value
);

const displayCampus = computed(
  () => campusesText(publishedCourse.value) || proposalData.value.campus || ''
);
const originalCampus = computed(
  () => campusesText(originalCourse.value) || proposalData.value.campus || ''
);
const campusChanged = computed(
  () =>
    !!finalCourse.value &&
    !!originalCampus.value &&
    displayCampus.value !== originalCampus.value
);

const displayCategory = computed(
  () => publishedCourse.value?.category || proposalData.value.category || ''
);
const originalCategory = computed(
  () => originalCourse.value?.category || proposalData.value.category || ''
);
const categoryChanged = computed(
  () =>
    !!finalCourse.value &&
    !!originalCategory.value &&
    displayCategory.value !== originalCategory.value
);

const displayDepartment = computed(
  () => publishedCourse.value?.department || ''
);
const originalDepartment = computed(
  () => originalCourse.value?.department || ''
);
const departmentChanged = computed(
  () =>
    !!finalCourse.value &&
    !!originalDepartment.value &&
    displayDepartment.value !== originalDepartment.value
);

// 课程代码：仅展示上架/提交版本，不做修订对照
const displayCode = computed(() => publishedCourse.value?.code || '');

// 已上架课程可跳转（finalCourse 携带正式课程 ID）
const courseId = computed(
  () => finalCourse.value?.id || originalCourse.value?.id || ''
);

const hasRevision = computed(
  () =>
    nameChanged.value ||
    teachersChanged.value ||
    campusChanged.value ||
    categoryChanged.value ||
    departmentChanged.value
);

// 「原样通过」会上架提案原始课程，后端审批会重新校验必填项：
// 课程名称 / 代码 / 开课院系 / 分类 / 至少一个校区。早期提案的课程代码为选填，
// 缺少时后端会以业务错误码 108000015 拒绝，因此提前拦截并引导走「修改后通过」。
const originalCourseMissingLabels = computed<string[]>(() => {
  const course = originalCourse.value;
  if (!course) return [];
  const missing: string[] = [];
  if (!(course.name || '').trim()) missing.push('课程名称');
  if (!(course.code || '').trim()) missing.push('课程代码');
  if (!(course.department || '').trim()) missing.push('开课院系');
  if (!(course.category || '').trim()) missing.push('课程分类');
  if (!Array.isArray(course.campuses) || course.campuses.length === 0) {
    missing.push('开课校区');
  }
  return missing;
});

const originalCourseMissing = computed(
  () => originalCourseMissingLabels.value.length > 0
);

// ===== 视角判定 =====
// guest：游客/普通用户（他人提案）
// owner：本人提案（含已通过 / 已拒绝），可查看审核进度与时间戳
// admin：管理员，可审批
// 规则：本人始终是 owner 视角（即使已被处理），但不代表拥有撤回提案 / 修改权限
const isOwner = computed(
  () => !!ownerUserId.value && ownerUserId.value === tokenStore.userId
);

const isPending = computed(
  () => !proposalStatus.value || proposalStatus.value === 'pending'
);

const viewMode = computed<'guest' | 'owner' | 'admin'>(() => {
  // 管理员关闭「管理员模式」时，按普通用户体验浏览
  if (isAdmin.value && adminMode.value) return 'admin';
  if (isOwner.value) return 'owner';
  return 'guest';
});

const isGuestView = computed(() => viewMode.value === 'guest');
const isOwnerView = computed(() => viewMode.value === 'owner');
const isAdminView = computed(() => viewMode.value === 'admin');

// 状态文案：用户侧说「投票」，管理侧说「审核」
const badgeText = computed(() => {
  if (proposalStatus.value === 'approved') return '已通过';
  if (proposalStatus.value === 'rejected') {
    return isAdminView.value ? '已拒绝' : '未通过';
  }
  return isAdminView.value ? '待审核' : '投票中';
});

// ===== 进度时间线 =====
const pad2 = (n: number) => String(n).padStart(2, '0');

const formatDateTime = (raw?: string) => {
  if (!raw) return '';
  // 无时区的 "2026-05-12 08:55:00" 为 UTC，需转为本地；ISO 原样解析
  const d = parseBackendTime(raw);
  if (!d) return raw;
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(
    d.getDate()
  )} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
};

const createdAtText = computed(() =>
  formatDateTime(proposalData.value.date || '')
);

const updatedAtText = computed(() =>
  formatDateTime(proposalData.value.updatedAt || '')
);

interface TimelineNode {
  key: string;
  title: string;
  time?: string;
  desc?: string;
  icon?: IconName;
  state: 'done' | 'rejected' | 'active' | 'revise' | 'muted';
}

// 管理员真实日志 -> 节点元信息（撤回类动作后端统一落到 DELETE/未知，标题由 actionTextForLog 区分）
const LOG_NODE_META: Record<
  string,
  { title: string; state: TimelineNode['state']; icon: IconName }
> = {
  CREATE: { title: '发起提案', state: 'muted', icon: 'file-text' },
  UPDATE: { title: '管理员修改提案', state: 'revise', icon: 'square-pen' },
  APPROVE: { title: '审核通过，课程已上架', state: 'done', icon: 'check' },
  REJECT: { title: '审核拒绝', state: 'rejected', icon: 'x' },
  DELETE: { title: '撤回', state: 'muted', icon: 'trash-2' },
  UNKNOWN: { title: '撤回', state: 'muted', icon: 'trash-2' }
};

// 管理员拉取到的该提案真实日志
const adminLogs = ref<LogItem[]>([]);

// 待审核但 updatedAt 明显晚于 createdAt：只可能是管理员撤回审批（本人重编辑会生成新提案）
const wasRevoked = computed(() => {
  if (!isPending.value) return false;
  const created = parseLogTime(proposalData.value.date);
  const updated = parseLogTime(proposalData.value.updatedAt);
  return created > 0 && updated > 0 && updated - created > 60 * 1000;
});

// 用户侧：由提案字段推导出的可见节点
const derivedTimelineNodes = computed<TimelineNode[]>(() => {
  const nodes: TimelineNode[] = [
    {
      key: 'create',
      title: '发起提案',
      time: createdAtText.value || '时间未知',
      icon: 'file-text',
      state: 'muted'
    }
  ];

  if (proposalStatus.value === 'approved') {
    if (hasRevision.value) {
      nodes.push({
        key: 'revise',
        title: '管理员修改后通过',
        time: updatedAtText.value,
        desc: '以修订后的内容创建并上架了正式课程',
        icon: 'square-pen',
        state: 'revise'
      });
    } else {
      nodes.push({
        key: 'approve',
        title: '提案已通过',
        time: updatedAtText.value,
        icon: 'check',
        state: 'done'
      });
    }
  } else if (proposalStatus.value === 'rejected') {
    nodes.push({
      key: 'reject',
      title: '提案未通过',
      time: updatedAtText.value,
      icon: 'x',
      state: 'rejected'
    });
  } else if (wasRevoked.value) {
    nodes.push({
      key: 'revoke',
      title: '管理员撤回审批，重新进入审核',
      time: updatedAtText.value,
      desc: '已下架课程并扣回贡献值',
      icon: 'trash-2',
      state: 'revise'
    });
  } else {
    nodes.push({
      key: 'pending',
      title: '等待管理员审核',
      state: 'active'
    });
  }

  return nodes;
});

// 管理员：展示真实完整节点；无日志或非管理员时回退到推导节点
const timelineNodes = computed<TimelineNode[]>(() => {
  if (!isAdminView.value || adminLogs.value.length === 0) {
    return derivedTimelineNodes.value;
  }

  const logs = [...adminLogs.value].sort(
    (a, b) => parseLogTime(a.actionTime) - parseLogTime(b.actionTime)
  );

  const nodes: TimelineNode[] = logs.map((log, index) => {
    const type = (log.actionType || '').toUpperCase();
    const meta = LOG_NODE_META[type];
    // 通过日志无法区分「原样通过」与「修改后通过」，用提案的 finalCourse 差异补齐语义
    const revised = type === 'APPROVE' && hasRevision.value;
    // DELETE/UNKNOWN 由操作者与创建者是否为同一人区分「用户撤回提案」/「管理员撤回审批」
    const isRevokeAction = type === 'DELETE' || type === 'UNKNOWN';
    return {
      key: log.logId || `log-${index}`,
      title: revised
        ? '修改后通过，课程已上架'
        : isRevokeAction
        ? actionTextForLog(log, ownerUserId.value)
        : meta?.title || actionTextOf(log.actionType),
      time: formatDateTime(log.actionTime),
      desc: [log.operatorName || log.operatorId, log.details?.reason]
        .filter(Boolean)
        .join(' · '),
      icon: revised ? 'square-pen' : meta?.icon,
      state: revised ? 'revise' : meta?.state || 'muted'
    };
  });

  // 日志分页可能截断，补一个推导出的「发起提案」节点保证时间线完整
  if (!logs.some((log) => (log.actionType || '').toUpperCase() === 'CREATE')) {
    nodes.unshift({
      key: 'create',
      title: '发起提案',
      time: createdAtText.value || '时间未知',
      icon: 'file-text',
      state: 'muted'
    });
  }

  return nodes;
});

// 管理员才可访问变更日志接口；按 proposalId 过滤出本提案的完整历史
const fetchAdminTimeline = async (proposalId: string) => {
  if (!isAdmin.value || !proposalId) {
    adminLogs.value = [];
    return;
  }
  try {
    const res = await http.ChangeLogController.changelogProposalTimelineList(
      {},
      { page: 1, pageSize: 100 }
    );
    const list = (res.data?.data?.logs ?? []) as LogItem[];
    adminLogs.value = list.filter((log) => log.proposalId === proposalId);
  } catch {
    adminLogs.value = [];
  }
};

// ===== 管理员审批操作 =====
const showRejectModal = ref(false);
const showApproveConfirm = ref(false);
const acting = ref(false);

const showAdminActions = computed(
  () => isAdminView.value && adminMode.value && isPending.value
);

// 仅「投票中」的本人提案可撤回提案 / 修改；已通过 / 已拒绝不再展示操作栏
const showOwnerActions = computed(() => isOwnerView.value && isPending.value);

const detectAdmin = async () => {
  try {
    const res = await http.AuthController.authIsAdminList();
    isAdmin.value = !!(res.data?.data?.isAdmin ?? false);
  } catch {
    isAdmin.value = false;
  }
  if (isAdmin.value) {
    adminMode.value = uni.getStorageSync('meowpick_admin_mode') !== false;
  }
};

const afterAdminAction = (msg: string) => {
  showSuccess(msg);
  uni.$emit('proposalListShouldRefresh');
  setTimeout(() => uni.navigateBack(), 800);
};

const approveDirectly = () => {
  if (acting.value || !proposalData.value.id) return;
  if (originalCourseMissing.value) {
    showInfo(
      `该提案缺少${originalCourseMissingLabels.value.join(
        '、'
      )}，请用「修改后通过」补全后再通过`
    );
    return;
  }
  showApproveConfirm.value = true;
};

const performApprove = async () => {
  if (acting.value || !proposalData.value.id) return;
  acting.value = true;
  try {
    // 不传 finalCourse：后端以用户原始 course 为准
    const res = await http.ProposalController.proposalApproveCreate(
      proposalData.value.id,
      { proposalID: proposalData.value.id }
    );
    const code = res.data?.code;
    if (code === 200 || code === 0 || code === 201) {
      afterAdminAction('已通过');
    } else {
      console.error('[proposal-detail] approve failed:', {
        code,
        msg: res.data?.msg,
        body: res.data
      });
      showError(
        errorMessageOf(code, res.data?.msg) ||
          res.data?.msg ||
          '操作失败，请重试'
      );
    }
  } catch (err) {
    console.error('[proposal-detail] approve error:', err);
    const e = err as {
      response?: { data?: { code?: number; msg?: string } };
    };
    showError(
      errorMessageOf(e.response?.data?.code, e.response?.data?.msg) ||
        e.response?.data?.msg ||
        '通过失败'
    );
  } finally {
    acting.value = false;
  }
};

const openRejectModal = () => {
  showRejectModal.value = true;
};

const handleRejectConfirm = async (reason: string) => {
  if (acting.value || !proposalData.value.id) return;
  acting.value = true;
  try {
    const res = await http.ProposalController.proposalRejectCreate(
      proposalData.value.id,
      { proposalId: proposalData.value.id, reason }
    );
    const code = res.data?.code;
    if (code === 200 || code === 0 || code === 201) {
      afterAdminAction('已拒绝');
    } else {
      showError('操作失败，请重试');
    }
  } catch {
    showError('拒绝失败');
  } finally {
    acting.value = false;
  }
};

const goModifyApprove = () => {
  if (!proposalData.value.id) return;
  uni.navigateTo({
    url: `/pages/proposal/propose?approveProposalId=${String(
      proposalData.value.id
    )}`
  });
};

// ===== 本人（未审核）操作：撤回提案 / 修改 =====
const goEditProposal = () => {
  if (!proposalData.value.id) return;
  uni.navigateTo({
    url: `/pages/proposal/propose?editProposalId=${String(
      proposalData.value.id
    )}`
  });
};

const showWithdrawConfirm = ref(false);

const withdrawOwnProposal = () => {
  if (acting.value || !proposalData.value.id) return;
  showWithdrawConfirm.value = true;
};

const performWithdraw = async () => {
  const proposalId = proposalData.value.id;
  if (acting.value || !proposalId) return;
  acting.value = true;
  try {
    const res = await http.ProposalController.proposalDeleteCreate(
      proposalId,
      {}
    );
    const code = res.data?.code;
    if (code === 200 || code === 0 || code === 201) {
      afterAdminAction('已撤回提案');
    } else {
      showError(
        errorMessageOf(code, res.data?.msg) ||
          res.data?.msg ||
          '操作失败，请重试'
      );
    }
  } catch (err) {
    const e = err as {
      response?: { data?: { code?: number; msg?: string } };
    };
    showError(
      errorMessageOf(e.response?.data?.code, e.response?.data?.msg) ||
        e.response?.data?.msg ||
        '撤回提案失败'
    );
  } finally {
    acting.value = false;
  }
};

// 来源提案允许展示昵称时，按 userId 补充查询创建者昵称（匿名则不展示）
const fetchContributor = async (
  proposalId: string,
  showUsername?: boolean,
  userId?: string
) => {
  contributorName.value = '';
  if (showUsername !== true || !userId) return;
  try {
    const res = await http.UserController.userUsernameDetail(userId, {
      proposalId
    });
    contributorName.value = res.data?.data?.username?.trim() || '';
  } catch (e) {
    console.error('[proposal-detail] fetch contributor failed:', e);
  }
};

// 详情接口才会返回原始 course 与管理员最终 finalCourse，用于区分修订
const fetchProposalDetail = async (proposalId: string) => {
  if (!proposalId) return;
  try {
    const res = await http.ProposalController.proposalDetail(proposalId);
    const proposal = res.data?.data?.proposal;
    if (!proposal) return;
    // 原提案被创建者修改/撤回提案后会软删除：此时旧详情不应继续展示，返回上一层
    if (proposal.deleted) {
      uni.showToast({ title: '提案已被重新编辑', icon: 'none' });
      setTimeout(() => uni.navigateBack(), 800);
      return;
    }
    proposalData.value.id = proposal.id || proposalId;
    // 详情接口对创建者/管理员才返回 finalCourse；普通用户沿用列表带入的版本
    if (proposal.course) originalCourse.value = proposal.course;
    if (proposal.finalCourse) finalCourse.value = proposal.finalCourse;
    if (proposal.status) proposalStatus.value = proposal.status;
    if (proposal.content !== undefined) {
      proposalData.value.reason = proposal.content;
    }
    if (proposal.likeCnt !== undefined) {
      proposalData.value.voteCount = proposal.likeCnt;
    }
    if (proposal.like !== undefined) isVoted.value = proposal.like;
    if (proposal.userId) ownerUserId.value = proposal.userId;
    if (proposal.createdAt) proposalData.value.date = proposal.createdAt;
    if (proposal.updatedAt) proposalData.value.updatedAt = proposal.updatedAt;
    if (proposal.rejectReason) rejectReason.value = proposal.rejectReason;
    if (
      typeof proposal.contribution === 'number' &&
      proposal.contribution > 0
    ) {
      contribution.value = proposal.contribution;
    }
    await fetchContributor(proposalId, proposal.showUsername, proposal.userId);
  } catch (e) {
    console.error('[proposal-detail] fetch error:', e);
  }
  await fetchAdminTimeline(proposalData.value.id || proposalId);
};

let hasLoaded = false;

onLoad(async (options: Record<string, string> = {}) => {
  await detectAdmin();

  if (options.data) {
    try {
      proposalData.value = JSON.parse(decodeURIComponent(options.data));
      if (proposalData.value.isVoted) isVoted.value = true;
      if (proposalData.value.status) {
        proposalStatus.value = proposalData.value.status;
      }
      if (proposalData.value.course) {
        originalCourse.value = proposalData.value.course;
      }
      if (proposalData.value.finalCourse) {
        finalCourse.value = proposalData.value.finalCourse;
      }
      if (proposalData.value.userId) {
        ownerUserId.value = proposalData.value.userId;
      }
    } catch (e) {
      console.error('Failed to parse proposal data', e);
    }
  }

  const proposalId = options.id || proposalData.value.id || '';
  await fetchProposalDetail(proposalId);
  hasLoaded = true;
});

// 从发布 / 重新编辑 / 修改后通过页返回时重新拉详情，避免状态未更新而误以为发布失败
onShow(() => {
  if (!hasLoaded) return;
  if (isAdmin.value) {
    adminMode.value = uni.getStorageSync('meowpick_admin_mode') !== false;
  }
  fetchProposalDetail(proposalData.value.id || '');
});

const goToCourse = (id: string) => {
  if (!id) return;
  uni.navigateTo({ url: `/pages/course/detail?id=${id}` });
};

const handleVote = async () => {
  // 后端 POST /api/like/{id} 为 toggle：已支持时再次调用即取消支持
  if (voting.value || !proposalData.value.id) return;
  const wasVoted = isVoted.value;
  voting.value = true;
  try {
    const res = await http.ActionController.likeCreate(proposalData.value.id, {
      targetType: 'proposal'
    });
    const result = res.data?.data;
    if (result !== undefined) {
      if (result.like !== undefined) isVoted.value = result.like;
      if (result.likeCnt !== undefined) {
        proposalData.value.voteCount = result.likeCnt;
      }
      showSuccess(result.like ? '支持成功' : '已取消支持');
    }
  } catch (err) {
    console.error('[proposal-detail] like error:', err);
    showError(wasVoted ? '取消失败' : '支持失败');
  } finally {
    voting.value = false;
  }
};
</script>

<style lang="scss" scoped src="./proposal-detail.scss" />
