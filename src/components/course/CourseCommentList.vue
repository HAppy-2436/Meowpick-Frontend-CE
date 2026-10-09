<template>
  <view class="comment" :class="themeStore.themeClass">
    <SkeletonCard v-if="loading && isEmpty" :count="2" />

    <EmptyState
      v-else-if="error && isEmpty"
      tone="danger"
      title="加载失败"
      compact
    >
      <template #action>
        <MwpButton tone="brand" @click="refresh">重试</MwpButton>
      </template>
    </EmptyState>

    <EmptyState
      v-else-if="isEmpty"
      title="还没有评价"
      desc="学完这门课，来分享你的感受吧～"
      compact
    />

    <view
      v-for="(item, key, index) of list"
      :key="key"
      class="item mwp-fade-up"
      :style="{ animationDelay: Math.min(index * 60, 300) + 'ms' }"
    >
      <CourseCommentBox
        :data="item"
        :can-delete="canDelete(item)"
        @like="like"
        @delete="requestDelete"
      />
    </view>

    <!-- 撤回/删除吐槽：撤回自己的用「撤回吐槽」，管理员删除他人评论用「删除吐槽」 -->
    <MwpConfirmDialog
      v-model:visible="showDeleteConfirm"
      :title="deleteIsOwn ? '撤回吐槽' : '删除吐槽'"
      :description="
        deleteIsOwn
          ? '撤回后无法恢复，确定撤回这条吐槽吗？'
          : '删除后无法恢复，确定删除这条吐槽吗？'
      "
      :confirm-text="deleteIsOwn ? '撤回吐槽' : '删除吐槽'"
      tone="danger"
      @confirm="confirmDelete"
    />
  </view>
</template>

<script setup lang="ts">
import { computed, ref, onUnmounted } from 'vue';
import { useCourseComment } from '@/composables/useCourseComment';
import { showError, showSuccess } from '@/composables/useStatus';
import CourseCommentBox from '@/components/course/CourseCommentBox.vue';
import { useThemeStore } from '@/config';

const themeStore = useThemeStore();

const props = defineProps<{
  id: string;
}>();
const emit = defineEmits<{ (e: 'deleted', id: string): void }>();
const {
  list,
  loading,
  error,
  like,
  next,
  refresh,
  remove,
  canDelete,
  currentUserId
} = useCourseComment(props);

const showDeleteConfirm = ref(false);
const pendingDeleteId = ref('');

// 是否为当前用户自己发布的评论：自己「撤回吐槽」，管理员处理他人评论是「删除吐槽」
const deleteIsOwn = computed(() => {
  const comment = list.value[pendingDeleteId.value];
  return !!comment?.userId && comment.userId === currentUserId.value;
});

const requestDelete = (commentId: string) => {
  if (!commentId) return;
  pendingDeleteId.value = commentId;
  showDeleteConfirm.value = true;
};

const confirmDelete = async () => {
  const commentId = pendingDeleteId.value;
  if (!commentId) return;
  const isOwn = deleteIsOwn.value;
  const result = await remove(commentId);
  if (result.ok) {
    showSuccess(isOwn ? '已撤回吐槽' : '已删除吐槽');
    emit('deleted', commentId);
  } else {
    showError(result.msg);
  }
};

// 首屏无数据（区别于加载中也无数据的占位）
const isEmpty = computed(() => Object.keys(list.value).length === 0);
defineExpose({ refresh });
const subToken = PubSub.subscribe('comment-next', () => {
  next();
});
const refreshToken = PubSub.subscribe(
  'comment-refresh',
  (courseId?: string) => {
    if (courseId && courseId !== props.id) return;
    refresh();
  }
);
onUnmounted(() => {
  PubSub.unsubscribe(subToken);
  PubSub.unsubscribe(refreshToken);
});
</script>

<style scoped lang="scss">
.comment {
  display: flex;
  flex-direction: column;
}
</style>
