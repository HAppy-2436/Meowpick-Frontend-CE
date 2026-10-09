import { http } from '@/original/config';
import type { CommentVO } from "@/original/api/data-contracts";

type Props = {
  id: string;
};

export function useCourseComment(p: Props) {
  const FIRST_PAGE = 1;
  const page = shallowRef(FIRST_PAGE);
  const list = ref<{ [key: string]: CommentVO }>({});
  let query = true;

  function fetch(id: string, page: number) {
    if (page === FIRST_PAGE) {
      query = true;
    }
    if (query) {
      http.CommentController.commentQueryList({ courseId: id, page, pageSize: 10 }).then((res) => {
        const responseData: any = res.data.data || res.data;
        const comments: CommentVO[] = responseData?.comments || responseData?.rows || [];
        comments.forEach((comment) => {
          list.value[comment.id!] = comment;
        });
        query = Object.values(list.value).length < (responseData?.total ?? 0);
      });
    }
  }

  function like(target: string) {
    const item = list.value[target];
    item.like = !item.like;
    item.likeCnt = (item.likeCnt || 0) + (item.like ? 1 : -1);
    http.LikeController.likeCreate(target, { targetType: 'comment' });
  }

  function next() {
    page.value++;
  }

  watchEffect(() => {
    if (p.id != "") {
      fetch(p.id, page.value);
    }
  });

  return {
    list,
    page,
    like,
    next,
    fetch
  };
}
