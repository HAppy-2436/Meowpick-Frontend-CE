<template>
  <top-bar :selected="1" />
  <scroll-view
    scroll-y
    class="content"
    :lower-threshold="80"
    @scroll="handleListScroll"
    @scrolltolower="handleBottom"
  >
    <view class="content-top-spacer" />
    <view class="profile-section">
      <view class="profile-card">
        <view class="profile-main">
          <view class="profile-info">
            <view class="profile-avatar">
              <image v-if="userInfo.avatar" class="avatar-image" :src="userInfo.avatar" mode="aspectFill" />
              <text v-else class="avatar-placeholder">{{ avatarInitial }}</text>
            </view>
            <view class="profile-detail">
              <text class="profile-name">{{ userInfo.username || '加载中...' }}</text>
            </view>
          </view>
          <view
            class="edit-profile-btn"
            :class="{ disabled: !userInfo.canEditUsername }"
            @tap.stop="goToEditNickname"
          >
            <text>编辑昵称</text>
          </view>
        </view>

        <view class="profile-stats">
          <view class="stat-item">
            <text class="stat-value">{{ userInfo.contribution || 0 }}</text>
            <text class="stat-label">贡献值</text>
          </view>
          <view class="stat-divider" />
          <view class="stat-item">
            <text class="stat-value">{{ availableDailyQuota }}</text>
            <text class="stat-label">今日剩余提案</text>
          </view>
        </view>
      </view>
    </view>
    <view class="history-list">
        <template v-if="activeTab === 'comment'">
          <view v-for="item of commentList" :key="item.id" class="item">
            <MyCommentBox :data="item" @like="likeComment" @delete="handleDeleteComment" />
          </view>
          <view v-if="commentsReady && commentList.length === 0 && !commentLoading" class="empty-state">
            <text class="empty-text">暂无吐槽记录</text>
          </view>
        </template>
        <template v-else>
          <view v-for="(item, index) of proposalList" :key="item.id" class="proposal-item" @click="goToProposalDetail(item)">
            <view class="proposal-card">
              <view class="proposal-header">
                <text class="proposal-title" :class="{ 'changed-field': isCourseFieldChanged(item, 'name') }">{{ displayCourse(item).name || item.title || '未知课程' }}</text>
                <view class="status-tag" :class="getProposalDisplayStatus(item)">{{ getProposalStatusText(item) }}</view>
              </view>

              <!-- 提案时间 -->
              <view class="review-time" v-if="item.status || item.deleted">
                <text class="review-time-label">{{ getProposalTimeLabel(item) }}：</text>
                <text class="review-time-value">{{ formatTime(getProposalTime(item)) }}</text>
              </view>

              <!-- 拒绝原因 -->
              <view class="reject-reason" v-if="item.status === 'rejected' && item.rejectReason">
                <text class="reject-label">拒绝原因：</text>
                <text class="reject-text">{{ item.rejectReason }}</text>
              </view>

              <view class="proposal-info" v-if="displayCourse(item)">
                <view class="course-detail" :class="{ 'changed-field': isCourseFieldChanged(item, 'campuses') }" v-if="displayCourse(item).campuses?.length">
                  <span class="detail-item">校区：{{ displayCourse(item).campuses.join('、') }}</span>
                </view>
                <view class="course-detail" :class="{ 'changed-field': isCourseFieldChanged(item, 'department') }" v-if="displayCourse(item).department">
                  <span class="detail-item">院系：{{ displayCourse(item).department }}</span>
                </view>
                <view class="course-detail" :class="{ 'changed-field': isCourseFieldChanged(item, 'category') }" v-if="displayCourse(item).category">
                  <span class="detail-item">分类：{{ displayCourse(item).category }}</span>
                </view>
                <view class="course-detail" :class="{ 'changed-field': isCourseFieldChanged(item, 'teachers') }" v-if="displayCourse(item).teachers?.length">
                  <span class="detail-item">教师：{{ teachersText(displayCourse(item).teachers) }}</span>
                </view>
              </view>

              <view class="proposal-footer">
                <view class="footer-spacer" />
                <view class="delete-area" @click.stop="handleDeleteProposal(index)" v-if="item.status === 'pending' && !item.deleted">
                  <text class="delete-text">删除</text>
                </view>
                <view class="edit-area" @click.stop="handleReEdit(item)" v-if="item.status === 'rejected' && !item.deleted">
                  <text class="edit-area-text">重新编辑</text>
                </view>
              </view>
            </view>
          </view>
          <view v-if="proposalsReady && proposalList.length === 0 && !proposalLoading" class="empty-state">
            <text class="empty-text">暂无提案记录</text>
          </view>
        </template>
        <view v-if="loading" class="loading-more">
          <text class="loading-text">加载中...</text>
        </view>
    </view>
    <view class="content-bottom-spacer" />
  </scroll-view>

  <view class="content-tabs">
    <view
      class="tab-item"
      :class="{ active: activeTab === 'comment' }"
      @click="switchTab('comment')"
    >
      <text class="tab-label">吐槽</text>
    </view>
    <view
      class="tab-item"
      :class="{ active: activeTab === 'proposal' }"
      @click="switchTab('proposal')"
    >
      <text class="tab-label">提案</text>
    </view>
  </view>

  <AppDialog
    v-if="nicknameDialogVisible"
    :visible="true"
    v-model="nicknameDraft"
    title="编辑昵称"
    :message="'昵称将用于展示你的课程贡献。\n请注意：30天内只能修改一次。'"
    placeholder="请输入不超过15个字符的昵称"
    :max-length="15"
    :show-input="true"
    :loading="nicknameSaving"
    :close-on-mask="!nicknameSaving"
    confirm-text="保存昵称"
    @update:visible="nicknameDialogVisible = $event"
    @confirm="saveNickname"
  />

  <AppDialog
    v-model:visible="commentDeleteDialogVisible"
    title="删除这条吐槽？"
    message="删除后无法恢复，请确认是否继续。"
    :loading="commentDeleteLoading"
    :close-on-mask="!commentDeleteLoading"
    confirm-text="确认删除"
    @confirm="confirmDeleteComment"
    @cancel="pendingDeleteCommentId = ''"
  />

  <AppDialog
    v-model:visible="deleteDialogVisible"
    title="删除这条提案？"
    message="删除后无法恢复，请确认是否继续。"
    :loading="deleteLoading"
    :close-on-mask="!deleteLoading"
    confirm-text="确认删除"
    @confirm="confirmDeleteProposal"
    @cancel="pendingDeleteIndex = -1"
  />
</template>

<script setup lang="ts">
import TopBar from '@/original/components/top-bar/top-bar.vue';
import { computed, ref, shallowRef } from "vue";
import { onLoad, onShow, onPageScroll } from "@dcloudio/uni-app";
import { http } from "@/original/config";
import type { DtoCommentVO, DtoProposalVO } from "@/original/api/data-contracts";
import MyCommentBox from "@/original/pages/my-comments/MyCommentBox.vue";
import { formatTeacherNames } from "@/original/utils/teacher";
import AppDialog from "@/original/components/app-dialog/AppDialog.vue";
import { navigateToPage } from "@/original/utils/navigation";
import { getContentReviewError, hasControlCharacters } from "@/original/utils/contentReview";
import { getProposalErrorMessage } from "@/original/utils/proposalError";
import { StorageKeys } from "@/original/utils/const";

const activeTab = ref<'comment' | 'proposal'>('comment');
const commentList = ref<DtoCommentVO[]>([]);
const proposalList = ref<DtoProposalVO[]>([]);
const COMMENT_FIRST_PAGE = 1;
const commentPage = shallowRef(COMMENT_FIRST_PAGE);
const proposalPage = ref(1);
const commentHasMore = ref(true);
const proposalHasMore = ref(true);
const commentLoading = ref(false);
const proposalLoading = ref(false);
const loading = computed(() => commentLoading.value || proposalLoading.value);
const commentsReady = ref(false);
const proposalsReady = ref(false);
const profileLoading = ref(false);
const nicknameDialogVisible = ref(false);
const nicknameDraft = ref('');
const nicknameSaving = ref(false);
const commentDeleteDialogVisible = ref(false);
const commentDeleteLoading = ref(false);
const pendingDeleteCommentId = ref('');
const deleteDialogVisible = ref(false);
const deleteLoading = ref(false);
const pendingDeleteIndex = ref(-1);
const commentPageSize = 5;
const proposalPageSize = 5;
const userInfo = ref({
  username: '加载中...',
  contribution: 0,
  avatar: '',
  dailyQuota: 0,
  dailyQuotaLimit: 0,
  canEditUsername: true
});

const availableDailyQuota = computed(() => Math.max(
  userInfo.value.dailyQuotaLimit - userInfo.value.dailyQuota,
  0
));

const avatarInitial = computed(() => {
  const username = String(userInfo.value.username || '').trim();
  if (!username || username === '加载中...' || username === '默认用户') return '猫';
  return Array.from(username)[0] || '猫';
});

async function fetchUserProfile() {
  if (profileLoading.value) return;
  profileLoading.value = true;
  try {
    const res = await http.UserController.userProfileList();
    if (res.data?.code !== 0) {
      uni.showToast({ title: '获取用户信息失败，请稍后重试', icon: 'none' });
      return;
    }

    const profile = res.data.data || res.data;
    userInfo.value = {
      username: String(profile?.username || '').trim() || '默认用户',
      contribution: profile?.contribution ?? 0,
      avatar: profile?.avatar || '',
      dailyQuota: profile?.dailyQuota ?? profile?.daily_quota ?? 0,
      dailyQuotaLimit: profile?.dailyQuotaLimit ?? profile?.daily_quota_limit ?? 0,
      canEditUsername: profile?.canEditUsername ?? profile?.can_edit_username ?? true
    };
  } catch (err) {
    console.error('[API] 获取用户资料失败:', err);
    uni.showToast({ title: '获取用户信息失败', icon: 'none' });
  } finally {
    profileLoading.value = false;
  }
}

function goToEditNickname() {
  if (!userInfo.value.canEditUsername) {
    uni.showToast({ title: '昵称30天内仅可修改一次', icon: 'none' });
    return;
  }

  nicknameDraft.value = userInfo.value.username === '默认用户' ? '' : userInfo.value.username;
  nicknameDialogVisible.value = true;
}

async function saveNickname(value: string) {
  const username = String(value || '').trim();
  if (!username) {
    uni.showToast({ title: '请输入昵称', icon: 'none' });
    return;
  }
  if (Array.from(username).length > 15) {
    uni.showToast({ title: '昵称不能超过15个字符', icon: 'none' });
    return;
  }
  if (hasControlCharacters(username)) {
    uni.showToast({ title: '昵称包含不可用字符，请修改后重试', icon: 'none' });
    return;
  }

  nicknameSaving.value = true;
  try {
    const res = await http.UserController.userProfileUpdateCreate({ username });
    const errorMessage = getContentReviewError(res.data, 'username', '昵称更新失败，请稍后重试');
    if (!errorMessage) {
      const profile = res.data.data || res.data;
      userInfo.value.username = profile?.username || username;
      userInfo.value.canEditUsername = false;
      nicknameDialogVisible.value = false;
      uni.showToast({ title: '昵称已更新', icon: 'success' });
    } else {
      uni.showToast({ title: errorMessage, icon: 'none', duration: 3500 });
    }
  } catch (err) {
    console.error('[API] 更新昵称失败:', err);
    uni.showToast({ title: '网络异常，昵称内容已保留，请稍后重试', icon: 'none', duration: 3500 });
  } finally {
    nicknameSaving.value = false;
  }
}

function formatTime(dateStr?: string | Date): string {
  if (!dateStr) return '--';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '--';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${day} ${h}:${min}`;
}

function getStatusText(status?: string): string {
  const statusMap: Record<string, string> = {
    'pending': '待审核',
    'approved': '已通过',
    'rejected': '已拒绝'
  };
  return statusMap[status || ''] || status || '';
}

function getProposalDisplayStatus(item: DtoProposalVO): string {
  return item.deleted ? 'deleted' : item.status || '';
}

function getProposalStatusText(item: DtoProposalVO): string {
  return item.deleted ? '已删除' : getStatusText(item.status);
}

function getProposalTimeLabel(item: DtoProposalVO): string {
  if (item.deleted) return '删除时间';
  const labelMap: Record<string, string> = {
    'pending': '发布时间',
    'approved': '通过时间',
    'rejected': '拒绝时间'
  };
  return labelMap[item.status || ''] || '时间';
}

function getProposalTime(item: DtoProposalVO): string | undefined {
  if (item.deleted) {
    return (item as any).deletedAt || item.updatedAt || item.createdAt;
  }
  return item.status === 'pending' ? item.createdAt : item.updatedAt;
}

function displayCourse(item: DtoProposalVO): any {
  return (item as any).finalCourse || item.course || {};
}

function teachersText(teachers: any[] = []): string {
  return formatTeacherNames(teachers);
}

function isCourseFieldChanged(item: DtoProposalVO, field: 'name' | 'campuses' | 'department' | 'category' | 'teachers'): boolean {
  const finalCourse = (item as any).finalCourse;
  if (!finalCourse) return false;
  const stringify = (value: any) => {
    if (field === 'teachers') {
      return formatTeacherNames(value);
    }
    return Array.isArray(value) ? value.join('、') : value || '';
  };
  return stringify(item.course?.[field]) !== stringify(finalCourse[field]);
}

function handleReEdit(item: DtoProposalVO) {
  navigateToPage({
    url: `/original/pages/proposal/propose?editProposalId=${item.id}`
  });
}

onShow(() => {
  const requestedTab = uni.getStorageSync(StorageKeys.MyPageActiveTab);
  if (requestedTab === 'proposal') {
    activeTab.value = 'proposal';
    uni.removeStorageSync(StorageKeys.MyPageActiveTab);
  }

  // Tab 页面会被缓存，因此每次重新显示都在保留旧内容的同时后台刷新第一页。
  fetchUserProfile();
  if (activeTab.value === 'comment') {
    const refreshSize = Math.min(commentPage.value * commentPageSize, 100);
    fetchComments(COMMENT_FIRST_PAGE, true, refreshSize);
  } else {
    const refreshSize = Math.min(proposalPage.value * proposalPageSize, 100);
    fetchProposals(1, true, refreshSize);
  }
});

const switchTab = (tab: 'comment' | 'proposal') => {
  if (activeTab.value === tab) return;
  activeTab.value = tab;
  if (tab === 'comment') {
    const refreshSize = Math.min(commentPage.value * commentPageSize, 100);
    fetchComments(COMMENT_FIRST_PAGE, true, refreshSize);
  } else {
    const refreshSize = Math.min(proposalPage.value * proposalPageSize, 100);
    fetchProposals(1, true, refreshSize);
  }
};

function fetchComments(page: number, forceRefresh = false, requestPageSize = commentPageSize) {
  if (commentLoading.value || (!forceRefresh && !commentHasMore.value && page > COMMENT_FIRST_PAGE)) return;
  commentLoading.value = true;

  if (page === COMMENT_FIRST_PAGE) commentHasMore.value = true;

  http.CommentController.commentHistoryCreate({ page, pageSize: requestPageSize }).then((res) => {
    if (res.data?.code === 0) {
      const responseData = res.data.data || res.data;
      const comments = responseData?.comments || [];
      commentList.value = page === COMMENT_FIRST_PAGE
        ? comments
        : [...commentList.value, ...comments];
      const total = responseData?.total;
      commentHasMore.value = typeof total === 'number' && total >= commentList.value.length
        ? commentList.value.length < total
        : comments.length === requestPageSize;
      commentPage.value = forceRefresh
        ? Math.max(COMMENT_FIRST_PAGE, Math.ceil(requestPageSize / commentPageSize))
        : page;
    }
  }).catch((err) => {
    console.error('[API] 获取评论历史失败:', err);
  }).finally(() => {
    commentLoading.value = false;
    commentsReady.value = true;
  });
}

function fetchProposals(page: number, forceRefresh = false, requestPageSize = proposalPageSize) {
  if (proposalLoading.value || (!forceRefresh && !proposalHasMore.value && page > 1)) return;
  proposalLoading.value = true;

  if (page === 1) proposalHasMore.value = true;

  http.ProposalController.proposalHistoryList({ page, pageSize: requestPageSize }).then((res) => {
    if (res.data?.code === 0) {
      const responseData = res.data.data || res.data;
      const proposals = responseData?.proposals || [];
      const mappedProposals = proposals.map((proposal) => ({
          ...proposal,
          finalCourse: proposal.finalCourse || (proposal as any).final_course
      }));
      proposalList.value = page === 1
        ? mappedProposals
        : [...proposalList.value, ...mappedProposals];
      const total = responseData?.total;
      proposalHasMore.value = typeof total === 'number' && total >= proposalList.value.length
        ? proposalList.value.length < total
        : proposals.length === requestPageSize;
      proposalPage.value = forceRefresh
        ? Math.max(1, Math.ceil(requestPageSize / proposalPageSize))
        : page;
    }
  }).catch((err) => {
    console.error('[API] 获取提案历史失败:', err);
  }).finally(() => {
    proposalLoading.value = false;
    proposalsReady.value = true;
  });
}

function likeComment(target: string) {
  const comment = commentList.value.find(c => c.id === target);
  if (!comment) return;

  http.LikeController.likeCreate(target, {
    targetId: target,
    targetType: 'comment'
  }).then((res) => {
    if (res.data?.code === 0) {
      const isLiked = res.data?.like ?? res.data?.data?.like ?? !comment.like;
      const newCnt = res.data?.likeCnt ?? res.data?.data?.likeCnt ?? (isLiked ? comment.likeCnt! + 1 : comment.likeCnt! - 1);
      comment.like = isLiked;
      comment.likeCnt = newCnt;
    }
  }).catch((err) => {
    console.error('[API] 点赞评论失败:', err);
  });
}

function handleDeleteComment(commentId: string) {
  if (!commentId || commentDeleteLoading.value) return;
  pendingDeleteCommentId.value = commentId;
  commentDeleteDialogVisible.value = true;
}

async function confirmDeleteComment() {
  const commentId = pendingDeleteCommentId.value;
  if (!commentId) {
    commentDeleteDialogVisible.value = false;
    return;
  }

  commentDeleteLoading.value = true;
  try {
    const res = await http.CommentController.commentDeleteCreate(commentId);
    if (res.data?.code === 0) {
      commentList.value = commentList.value.filter(comment => comment.id !== commentId);
      commentDeleteDialogVisible.value = false;
      pendingDeleteCommentId.value = '';
      uni.showToast({ title: '吐槽已删除', icon: 'success' });

      const refreshSize = Math.min(commentPage.value * commentPageSize, 100);
      fetchComments(COMMENT_FIRST_PAGE, true, refreshSize);
    } else {
      uni.showToast({ title: '删除吐槽失败，请稍后重试', icon: 'none' });
    }
  } catch (err) {
    console.error('[API] 删除吐槽失败:', err);
    uni.showToast({ title: '网络异常，请稍后重试', icon: 'none' });
  } finally {
    commentDeleteLoading.value = false;
  }
}

function handleDeleteProposal(index: number) {
  const proposal = proposalList.value[index];
  if (!proposal?.id) return;

  pendingDeleteIndex.value = index;
  deleteDialogVisible.value = true;
}

async function confirmDeleteProposal() {
  const index = pendingDeleteIndex.value;
  const proposal = proposalList.value[index];
  if (!proposal?.id) {
    deleteDialogVisible.value = false;
    pendingDeleteIndex.value = -1;
    return;
  }

  deleteLoading.value = true;
  try {
    const res = await http.ProposalController.proposalDeleteCreate(proposal.id, {
      proposalId: proposal.id
    });
    if (res.data?.code === 0) {
      const deleteResult = res.data.data || res.data;
      proposalList.value[index] = {
        ...proposal,
        deleted: deleteResult?.deleted ?? true,
        deletedAt: deleteResult?.deletedAt || new Date().toISOString()
      } as DtoProposalVO;
      deleteDialogVisible.value = false;
      pendingDeleteIndex.value = -1;
      uni.showToast({ title: '已删除', icon: 'success' });
    } else {
      uni.showToast({ title: getProposalErrorMessage(res.data, 'delete'), icon: 'none' });
    }
  } catch (err) {
    console.error('[API] 删除提案失败:', err);
    uni.showToast({ title: getProposalErrorMessage(err, 'delete'), icon: 'none' });
  } finally {
    deleteLoading.value = false;
  }
}

function goToProposalDetail(item: DtoProposalVO) {
  navigateToPage({
    url: `/original/pages/proposal/detail?id=${item.id}&data=${encodeURIComponent(JSON.stringify(item))}`
  });
}

function handleBottom() {
  if (activeTab.value === 'comment') {
    if (commentHasMore.value && !commentLoading.value) {
      fetchComments(commentPage.value + 1);
    }
  } else {
    if (proposalHasMore.value && !proposalLoading.value) {
      fetchProposals(proposalPage.value + 1);
    }
  }
}

function handleListScroll(e: any) {
  uni.$emit('pageScroll', { scrollTop: e.detail?.scrollTop || 0 });
}

onPageScroll((e) => {
  uni.$emit('pageScroll', e);
});
</script>

<style scoped lang="scss">
:global(page) {
  // 覆盖全局 page 白底（main.scss 用 !important 锁浅色），保留旧版「我的」页的浅灰底。
  background-color: #f8f8f8 !important;
}

.content {
  position: fixed;
  top: calc(20vw + 44px);
  left: 0;
  right: 0;
  bottom: 0;
  padding: 0;
  width: 100%;
  box-sizing: border-box;
  overflow-y: auto;
  z-index: 1;
}

.content-top-spacer {
  height: 4vw;
}

.profile-section {
  padding: 0 5vw;
}

.history-list {
  margin-top: 4vw;
  padding: 0 5vw;
}

.content-bottom-spacer {
  height: calc(21vw + env(safe-area-inset-bottom));
}

.profile-card {
  width: 100%;
  box-sizing: border-box;
  padding: 4vw;
  background: #ffffff;
  border: 1px solid #eeeeee;
  border-radius: var(--app-component-radius, 5vw);
  box-shadow: 0 1.5vw 4vw rgba(0, 0, 0, 0.08);

  .profile-main {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .profile-info {
    display: flex;
    align-items: center;
    min-width: 0;

    .profile-avatar {
      width: 13vw;
      height: 13vw;
      border-radius: 50%;
      overflow: hidden;
      background: #b70030;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      .avatar-image {
        width: 100%;
        height: 100%;
      }

      .avatar-placeholder {
        color: #ffffff;
        font-size: 5.5vw;
        font-weight: 700;
      }
    }

    .profile-detail {
      min-width: 0;
      margin-left: 3vw;
      display: flex;
      flex-direction: column;

      .profile-name {
        display: block;
        max-width: 42vw;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        color: #222222;
        font-size: 4.4vw;
        font-weight: 700;
      }

    }
  }

  .edit-profile-btn {
    width: 22vw;
    height: 8.5vw;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: #333333;
    background: #ffffff;
    border: 1px solid #dddddd;
    border-radius: var(--app-component-radius, 5vw);
    font-size: 3.2vw;
    font-weight: 600;

    &.disabled {
      color: #aaaaaa;
      background: #f7f7f7;
    }
  }

  .profile-stats {
    display: flex;
    align-items: center;
    margin-top: 3.5vw;
    padding-top: 3vw;
    border-top: 1px solid #f0f0f0;

    .stat-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .stat-value {
      color: #222222;
      font-size: 4.2vw;
      font-weight: 700;
    }

    .stat-label {
      margin-top: 0.5vw;
      color: #999999;
      font-size: 2.8vw;
    }

    .stat-divider {
      width: 1px;
      height: 7vw;
      background: #eeeeee;
    }
  }
}

.content-tabs {
  position: fixed;
  left: 50%;
  bottom: calc(4vw + env(safe-area-inset-bottom));
  z-index: 100;
  display: flex;
  width: 64vw;
  height: 12vw;
  padding: 0 3vw;
  box-sizing: border-box;
  background: #ffffff;
  border-radius: var(--app-component-radius, 5vw);
  box-shadow: 0 1vw 3vw rgba(0, 0, 0, 0.07);
  transform: translateX(-50%);
}

.tab-item {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  color: #888888;

  .tab-label {
    font-size: 3.4vw;
    font-weight: 500;
  }

  &.active {
    color: #b70030;

    .tab-label {
      font-weight: 700;
    }

    &::after {
      content: "";
      position: absolute;
      bottom: 1vw;
      left: 50%;
      width: 8vw;
      height: 0.8vw;
      border-radius: var(--app-component-radius, 5vw);
      background: #b70030;
      transform: translateX(-50%);
    }
  }
}

.proposal-item {
  margin-bottom: 3vw;
}

.proposal-card {
  background-color: #ffffff;
  width: 87vw;
  border-radius: var(--app-component-radius, 5vw);
  box-shadow: 1px 1px 5px 0px #0000001f;
  padding: 4vw;
  margin-top: 3vw;

  .proposal-header {
    display: flex;
    flex-direction: row;
    align-items: center;

    .proposal-title {
      flex: 1;
      font-size: 4vw;
      font-weight: bold;
      color: #333;

      &.changed-field {
        color: #b70030;
      }
    }

    .status-tag {
      font-size: 2.8vw;
      padding: 0.5vw 2vw;
      border-radius: var(--app-component-radius, 5vw);
      margin-left: 2vw;

      &.pending {
        background-color: #fff7e6;
        color: #fa8c16;
      }

      &.approved {
        background-color: #f6ffed;
        color: #52c41a;
      }

      &.rejected {
        background-color: #fff1f0;
        color: #ff4d4f;
      }

      &.deleted {
        background-color: #f5f5f5;
        color: #8c8c8c;
      }
    }
  }

  .proposal-info {
    margin-top: 3vw;

    .info-section-title {
      font-size: 3vw;
      font-weight: 600;
      color: #b70030;
      margin-bottom: 2vw;
      padding-bottom: 1vw;
      border-bottom: 1px dashed #ffd6e7;
    }

    .course-detail {
      display: flex;
      flex-wrap: wrap;
      gap: 2vw;
      margin-bottom: 2vw;

      .detail-item {
        font-size: 3vw;
        color: #666666;
        background-color: #f5f5f5;
        padding: 0.5vw 2vw;
        border-radius: var(--app-component-radius, 5vw);
      }
    }

    .course-detail.changed-field .detail-item {
      background-color: #fff1f0;
      border: 1px solid #ffccc7;
      color: #b70030;
    }
  }

  .review-time {
    margin-top: 2vw;
    display: flex;
    align-items: center;

    .review-time-label {
      font-size: 3vw;
      color: #999;
    }

    .review-time-value {
      font-size: 3vw;
      color: #666;
      margin-left: 1vw;
    }
  }

  .reject-reason {
    margin-top: 2vw;
    background: #fff1f0;
    border-radius: var(--app-component-radius, 5vw);
    padding: 2vw 3vw;

    .reject-label {
      font-size: 3vw;
      color: #ff4d4f;
      font-weight: 600;
    }

    .reject-text {
      font-size: 3vw;
      color: #cf1322;
      margin-left: 1vw;
    }
  }

  .proposal-footer {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    margin-top: 3vw;
    padding-top: 3vw;
    border-top: 1px solid #f0f0f0;

    .delete-area {
      padding: 1.5vw 3vw;
      border-radius: var(--app-component-radius, 5vw);
      background-color: #fff1f0;

      .delete-text {
        font-size: 3.2vw;
        color: #ff4d4f;
      }
    }

    .edit-area {
      padding: 1.5vw 3vw;
      border-radius: var(--app-component-radius, 5vw);
      background-color: #f6ffed;

      .edit-area-text {
        font-size: 3.2vw;
        color: #52c41a;
      }
    }

    .footer-spacer {
      flex: 1;
    }
  }
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20vw 0;

  .empty-text {
    font-size: 4vw;
    color: #999;
  }
}

.loading-more {
  display: flex;
  justify-content: center;
  padding: 4vw 0;

  .loading-text {
    font-size: 3.5vw;
    color: #999;
  }
}

</style>
