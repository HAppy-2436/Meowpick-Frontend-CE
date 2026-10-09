import { http } from '@/original/config';
import type { DtoCourseVO } from "@/original/api/data-contracts";
import { navigateToPage } from "@/original/utils/navigation";

export function useChoose() {
  const FIRST_PAGE = 1;
  const keyword = shallowRef("");
  const type = shallowRef<"course" | "teacher" | "department" | "category">(
    "course"
  );
  const rows = ref<DtoCourseVO[]>([]);
  const page = ref(FIRST_PAGE);

  function jump(id: string) {
    navigateToPage({
      url: `/original/pages/course/index/index?id=${id}`
    });
  }

  function search(p: number) {
    if (keyword.value.length > 0) {
      console.log('[useChoose] search called:', { keyword: keyword.value, type: type.value, page: p });
      http.CoursesController.searchCreate({
        keyword: keyword.value,
        type: type.value,
        page: p,
        pageSize: 10
      } as any).then((res) => {
        console.log('[useChoose] response:', JSON.stringify(res.data).substring(0, 500));

        const rawRes: any = res.data;
        const rawData = rawRes?.data?.courses || rawRes?.courses || rawRes?.data?.data?.courses || [];
        console.log('[useChoose] rawData:', rawData);
        const courses = rawData.map((course: any) => ({
          ...course,
          teacherList: course.teachers || [],
          tagCount: course.tagCount || {}
        }));

        if (p === FIRST_PAGE) {
          rows.value = courses;
        } else {
          rows.value = [...rows.value, ...courses];
        }
        console.log('[useChoose] rows updated:', rows.value);
      }).catch((err) => {
        console.error('[useChoose] search error:', err);
        rows.value = [];
      });
    }
  }

  function loadMore() {
    page.value++;
    search(page.value);
  }

  watch([keyword, type], () => {
    rows.value = [];
    page.value = FIRST_PAGE;
    search(FIRST_PAGE);
  });

  return {
    keyword,
    type,
    rows,
    page,
    jump,
    search,
    loadMore
  };
}
