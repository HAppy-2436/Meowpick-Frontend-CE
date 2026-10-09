import { http } from '@/original/config';
import type { CommentVO } from "@/original/api/data-contracts";

type Props = {
  id: string;
};

export function useCourseComment(p: Props) {
  const FIRST_PAGE = 1;
  const page = shallowRef(FIRST_PAGE);
  const list = ref<{ [key: string]: CommentVO }>({});
  const pageSize = 10;
  let query = true;
  let loading = false;

  function fetch(id: string, page: number) {
    if (page === FIRST_PAGE) {
      query = true;
    }
    if (query && !loading) {
      loading = true;
      http.CommentController.commentQueryList({ courseId: id, page, pageSize }).then((res) => {
        const responseData = res.data.data || res.data;
        const comments = responseData?.comments || [];
        const nextList: { [key: string]: CommentVO } = page === FIRST_PAGE
          ? {}
          : { ...list.value };
        comments.forEach((comment) => {
          nextList[comment.id!] = {
            ...comment,
            like: comment.like ?? false,
            likeCnt: comment.likeCnt ?? 0
          };
        });
        list.value = nextList;
        const total = responseData?.total;
        query = typeof total === "number" && total >= Object.values(list.value).length
          ? Object.values(list.value).length < total
          : comments.length === pageSize;
      }).finally(() => {
        loading = false;
      });
    }
  }

  async function like(target: string) {
    const comment = list.value[target];
    if (!comment) return;

    const previousLike = comment.like ?? false;
    const previousCount = comment.likeCnt ?? 0;
    comment.like = !previousLike;
    comment.likeCnt = previousCount + (comment.like ? 1 : -1);

    try {
      const res = await http.LikeController.likeCreate(target, { targetType: "comment" });
      if (res.data?.code !== 0) {
        throw new Error(res.data?.msg || "点赞失败");
      }
      const result = res.data.data || res.data;
      comment.like = result?.like ?? comment.like;
      comment.likeCnt = result?.likeCnt ?? comment.likeCnt;
    } catch (err) {
      comment.like = previousLike;
      comment.likeCnt = previousCount;
      console.error("[API] 点赞吐槽失败:", err);
      uni.showToast({ title: "点赞失败", icon: "none" });
    }
  }

  function next() {
    if (query && !loading) {
      page.value++;
    }
  }

  watch(
    [() => p.id, page],
    ([courseId, currentPage]) => {
      if (courseId) {
        fetch(courseId, currentPage);
      }
    },
    { immediate: true }
  );

  return {
    list,
    page,
    like,
    next,
    fetch
  };
}

export function format(timeStamp: string): string {
  const date = new Date(timeStamp);
  const year = String(date.getFullYear());
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");

  return `${year}-${month}-${day}`;
}
