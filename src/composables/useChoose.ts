import type { HandlerResponseDtoListCoursesResp } from '@/api/data-contracts';
import type { MixedResult } from '@/utils/types/search';
import { ref, reactive } from 'vue';
import { http } from '@/config';
import { SEARCH_PAGE_SIZE } from '@/utils/constants';

// swagger v2.0 的 DtoListCoursesReq 只声明了 page/pageSize，
// keyword/type/sort 是后端实际支持但 swagger 未声明的参数，此处补充类型
type CourseSearchReq = {
  keyword: string;
  page: number;
  pageSize: number;
  type: 'course' | 'teacher';
  sort: string;
};

export function useChoose() {
  const keyword = ref('');
  const type = ref('course');

  const resultList = ref<MixedResult[]>([]);
  const page = ref(1);
  const loading = ref(false);
  // 是否已加载到最后一页（本次请求无新数据）
  const reachedEnd = ref(false);

  const filterForm = reactive({
    campus: [] as string[],
    department: [] as string[],
    category: [] as string[]
  });

  // 从搜索结果中动态补充校区选项，避免遗漏后端新增校区
  const filterOptions = reactive({
    campuses: [] as string[]
  });

  function normalizeCampus(name: string): string {
    return (name || '').replace(/校区$/, '').trim();
  }

  function collectFilterOptions(list: MixedResult[], reset: boolean) {
    if (reset) {
      filterOptions.campuses = [];
    }
    const campuses = new Set(filterOptions.campuses);
    for (const item of list) {
      if (item.resultType !== 'course') continue;
      (item.campuses || []).forEach((c) => {
        if (c && c !== '两校区通用') campuses.add(c);
      });
    }
    filterOptions.campuses = Array.from(campuses);
  }

  function jump(item: MixedResult) {
    if (item.resultType === 'teacher') {
      // 搜索该教师的课程
      keyword.value = item.name || '';
      doSearch(true, 'default');
    } else if (item.resultType === 'proposal') {
      const dataStr = encodeURIComponent(JSON.stringify(item));
      uni.navigateTo({
        url: `/pages/course/proposal-detail?data=${dataStr}`
      });
    } else {
      uni.navigateTo({
        url: `/pages/course/detail?id=${item.id}`
      });
    }
  }

  function doSearch(reload: boolean, sortType: string = 'default') {
    if (!keyword.value.trim()) {
      loading.value = false;
      return;
    }
    if (loading.value && !reload) return; // 防止重复加载
    if (reload) {
      page.value = 1;
      resultList.value = [];
      reachedEnd.value = false;
    }
    loading.value = true;

    const baseParam = {
      keyword: keyword.value,
      page: page.value,
      pageSize: SEARCH_PAGE_SIZE,
      sort: sortType
    };
    const courseParam: CourseSearchReq = { ...baseParam, type: 'course' };
    const teacherParam: CourseSearchReq = { ...baseParam, type: 'teacher' };

    // 只搜索课程和教师，不搜索提案（提案延迟到点击按钮后）
    Promise.all([
      http.CoursesController.searchCreate(courseParam),
      http.CoursesController.searchCreate(teacherParam)
    ])
      .then(([courseRes, teacherRes]) => {
        const courseData = courseRes.data as HandlerResponseDtoListCoursesResp;
        const teacherData =
          teacherRes.data as HandlerResponseDtoListCoursesResp;

        const courseContent = courseData?.data?.courses || [];
        const apiCourses: MixedResult[] = courseContent.map((c) => ({
          ...c,
          resultType: 'course' as const
        }));

        const teacherContent = teacherData?.data?.courses || [];
        const apiTeachers: MixedResult[] = teacherContent.map((t) => ({
          ...t,
          resultType: 'teacher' as const
        }));

        // 本页无任何原始数据 => 已到底，后续不再显示「查看更多」
        reachedEnd.value =
          courseContent.length === 0 && teacherContent.length === 0;

        let combined: MixedResult[] = [...apiCourses, ...apiTeachers];

        // 收集可筛选选项（在筛选前，基于完整结果集）
        collectFilterOptions(combined, page.value === 1);

        // 客户端筛选
        if (filterForm.campus.length > 0) {
          const wanted = filterForm.campus.map(normalizeCampus);
          combined = combined.filter((c) => {
            if (!c.campuses || c.campuses.length === 0) return true;
            if (c.campuses.includes('两校区通用')) return true;
            return c.campuses.some((camp) =>
              wanted.includes(normalizeCampus(camp))
            );
          });
        }
        if (filterForm.department.length > 0) {
          combined = combined.filter(
            (c) => c.department && filterForm.department.includes(c.department)
          );
        }
        if (filterForm.category.length > 0) {
          combined = combined.filter(
            (c) => c.category && filterForm.category.includes(c.category)
          );
        }

        if (page.value === 1) {
          resultList.value = combined;
        } else {
          resultList.value = resultList.value.concat(combined);
        }
      })
      .catch((err: unknown) => {
        console.error('[useChoose] Search error:', err);
      })
      .finally(() => {
        loading.value = false;
      });
  }

  return {
    keyword,
    rows: resultList,
    page,
    loading,
    reachedEnd,
    jump,
    doSearch,
    filterForm,
    filterOptions
  };
}
