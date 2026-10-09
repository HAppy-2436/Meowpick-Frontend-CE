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

  const resultList = ref<MixedResult[]>([]);
  const page = ref(1);
  const loading = ref(false);
  // 请求失败（用于区分「加载失败」与「没有结果」两种空状态）
  const error = ref(false);
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
    if (item.resultType === 'proposal') {
      const dataStr = encodeURIComponent(JSON.stringify(item));
      uni.navigateTo({
        url: `/pages/proposal/proposal-detail?data=${dataStr}`
      });
    } else {
      uni.navigateTo({
        url: `/pages/course/detail?id=${item.id}`
      });
    }
  }

  // 请求序号：慢响应返回时若已有更新的请求，则丢弃，避免旧结果覆盖新结果
  let requestVersion = 0;

  function doSearch(reload: boolean, sortType: string = 'default') {
    if (!keyword.value.trim()) {
      loading.value = false;
      return Promise.resolve();
    }
    if (loading.value && !reload) return Promise.resolve(); // 防止重复加载
    if (reload) {
      page.value = 1;
      resultList.value = [];
      reachedEnd.value = false;
      error.value = false;
    }
    loading.value = true;
    const version = ++requestVersion;

    const baseParam = {
      keyword: keyword.value,
      page: page.value,
      pageSize: SEARCH_PAGE_SIZE,
      sort: sortType
    };
    const courseParam: CourseSearchReq = { ...baseParam, type: 'course' };
    const teacherParam: CourseSearchReq = { ...baseParam, type: 'teacher' };

    // 只搜索课程和教师，不搜索提案（提案延迟到点击按钮后）
    return Promise.all([
      http.CoursesController.searchCreate(courseParam),
      http.CoursesController.searchCreate(teacherParam)
    ])
      .then(([courseRes, teacherRes]) => {
        if (version !== requestVersion) return; // 过期响应丢弃
        const courseData = courseRes.data as HandlerResponseDtoListCoursesResp;
        const teacherData =
          teacherRes.data as HandlerResponseDtoListCoursesResp;

        const courseContent = courseData?.data?.courses || [];
        const apiCourses: MixedResult[] = courseContent.map((c) => ({
          ...c,
          resultType: 'course' as const
        }));

        const teacherContent = teacherData?.data?.courses || [];
        // 注意：/api/search 的 type=teacher 返回的仍是课程列表（命中该教师的课程），
        // 不是教师实体，因此同样标记为 course，点击后进入课程详情。
        const apiTeachers: MixedResult[] = teacherContent.map((t) => ({
          ...t,
          resultType: 'course' as const
        }));

        // 本页无任何原始数据 => 已到底，后续不再显示「查看更多」
        reachedEnd.value =
          courseContent.length === 0 && teacherContent.length === 0;

        // 课程名命中与教师名命中可能返回同一门课，按 id 去重
        const seenIds = new Set<string>();
        let combined: MixedResult[] = [];
        for (const item of [...apiCourses, ...apiTeachers]) {
          const key = item.id || item.name || '';
          if (seenIds.has(key)) continue;
          seenIds.add(key);
          combined.push(item);
        }

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
        if (version !== requestVersion) return; // 过期响应丢弃
        console.error('[useChoose] Search error:', err);
        // 仅首屏失败进入错误态；加载更多失败不应清掉已有结果
        if (page.value === 1) error.value = true;
      })
      .finally(() => {
        if (version === requestVersion) loading.value = false;
      });
  }

  return {
    keyword,
    rows: resultList,
    page,
    loading,
    error,
    reachedEnd,
    jump,
    doSearch,
    filterForm,
    filterOptions
  };
}
