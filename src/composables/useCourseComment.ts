import type { DtoCommentVO } from '@/api/data-contracts';
import { computed, ref, watch } from 'vue';
import { http, useTokenStore } from '@/config';
import { showError } from '@/composables/useStatus';
import { DEFAULT_PAGE_SIZE, TARGET_TYPE_COMMENT } from '@/utils/constants';
import { formatDate } from '@/utils/time';

type Props = {
  id: string;
};

interface ExtendedCommentVO extends DtoCommentVO {
  likeCnt?: number;
  like?: boolean;
  liking?: boolean;
  score?: number;
}

export type DeleteCommentResult = { ok: true } | { ok: false; msg: string };

export function useCourseComment(p: Props) {
  const tokenStore = useTokenStore();
  const page = ref(1);
  const list = ref<{ [key: string]: ExtendedCommentVO }>({});
  const query = ref(true);
  // 首屏加载 / 失败状态，用于区分「加载失败」与「暂无评价」两种空态
  const loading = ref(false);
  const error = ref(false);
  // 当前登录用户是否是管理员；管理员可删除任意评论（他人评论用「删除」，自己用「撤回吐槽」）
  const isAdmin = ref(false);
  const currentUserId = computed(() => tokenStore.userId);

  http.AuthController.authIsAdminList()
    .then((res) => {
      isAdmin.value = !!(res.data?.data?.isAdmin ?? false);
    })
    .catch((err: unknown) => {
      console.error('[useCourseComment] isAdmin error:', err);
    });

  function fetch(id: string, pageNum: number) {
    if (!id || id === '') return Promise.resolve();
    if (pageNum <= 1) {
      query.value = true;
    }
    if (!query.value) return Promise.resolve();

    loading.value = true;
    error.value = false;
    return http.CommentController.commentQueryList({
      courseId: id,
      page: pageNum,
      pageSize: DEFAULT_PAGE_SIZE
    })
      .then((res) => {
        const data = res.data;
        const comments = data?.data?.comments || [];
        const total = data?.data?.total || 0;
        comments.forEach((comment) => {
          if (!comment.id) return;
          list.value[comment.id] = {
            ...comment,
            // 后端未返回标签时不再伪造，避免展示虚构标签
            tags: comment.tags ?? [],
            like: comment.like ?? false,
            likeCnt: comment.likeCnt ?? 0
          };
        });
        query.value = Object.values(list.value).length < total;
      })
      .catch((err: unknown) => {
        console.error('[useCourseComment] fetch error:', err);
        // 仅首屏失败进入错误态，加载更多失败不影响已有列表
        if (pageNum <= 1) error.value = true;
      })
      .finally(() => {
        loading.value = false;
      });
  }

  function like(target: string) {
    const item = list.value[target];
    if (!item || item.liking) return;
    const prevLike = item.like ?? false;
    const prevCnt = item.likeCnt ?? 0;
    // 乐观更新，失败回滚
    item.liking = true;
    item.like = !prevLike;
    item.likeCnt = prevCnt + (item.like ? 1 : -1);
    http.ActionController.likeCreate(target, {
      targetType: TARGET_TYPE_COMMENT
    })
      .then((res) => {
        const result = res.data?.data;
        if (result?.like !== undefined) item.like = result.like;
        if (result?.likeCnt !== undefined) item.likeCnt = result.likeCnt;
      })
      .catch((err: unknown) => {
        console.error('[useCourseComment] like error:', err);
        item.like = prevLike;
        item.likeCnt = prevCnt;
        showError('操作失败，请稍后重试');
      })
      .finally(() => {
        item.liking = false;
      });
  }

  // 管理员可删除任意评论；普通用户仅能撤回自己的评论（撤回吐槽）
  function canDelete(comment: DtoCommentVO): boolean {
    if (isAdmin.value) return true;
    return !!comment.userId && comment.userId === currentUserId.value;
  }

  // 软删除评论：成功后从列表移除，失败返回提示文案
  async function remove(id: string): Promise<DeleteCommentResult> {
    if (!id) return { ok: false, msg: '评论不存在' };
    try {
      const res = await http.CommentController.commentDeleteCreate(id);
      const code = res.data?.code;
      if (code === 0 || code === 200 || code === 201) {
        const rest: { [key: string]: ExtendedCommentVO } = {};
        Object.keys(list.value).forEach((key) => {
          if (key !== id) rest[key] = list.value[key];
        });
        list.value = rest;
        return { ok: true };
      }
      return { ok: false, msg: res.data?.msg || '操作失败，请稍后重试' };
    } catch (err: unknown) {
      console.error('[useCourseComment] delete error:', err);
      const e = err as { response?: { data?: { msg?: string } } };
      return {
        ok: false,
        msg: e.response?.data?.msg || '操作失败，请稍后重试'
      };
    }
  }

  function next() {
    if (!p.id || p.id === '') return Promise.resolve();
    if (loading.value || !query.value) return Promise.resolve();
    page.value++;
    return fetch(p.id, page.value);
  }

  function refresh() {
    if (!p.id || p.id === '') return Promise.resolve();
    page.value = 1;
    list.value = {};
    query.value = true;
    return fetch(p.id, 1);
  }

  watch(
    () => p.id,
    (newId) => {
      if (newId && newId !== '') {
        page.value = 1;
        list.value = {};
        fetch(newId, 1);
      }
    },
    { immediate: true }
  );

  return {
    list,
    page,
    loading,
    error,
    like,
    next,
    fetch,
    refresh,
    remove,
    canDelete,
    isAdmin,
    currentUserId
  };
}

export function format(timeStamp: string): string {
  return formatDate(timeStamp);
}
