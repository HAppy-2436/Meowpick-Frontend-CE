import type {
  DtoCourseVO,
  DtoTeacherVO,
  HandlerResponseDtoGetProposalSuggestionsResp,
  HandlerResponseDtoListCoursesResp,
  DtoProposalSuggestionsVO
} from "@/api/data-contracts";
import { ref, reactive } from 'vue';
import { http } from "@/config";
import { SEARCH_PAGE_SIZE } from "@/utils/constants";

type MixedResult = DtoCourseVO & {
  resultType?: 'course' | 'teacher' | 'proposal';
  matchScore?: number;
  depart?: string;
  position?: string;
  avatar?: string;
  category?: string;
  department?: string;
  link?: string[][];
  point?: number;
  describe?: string;
  teachers?: DtoTeacherVO[];
  teacherList?: DtoTeacherVO[];
  campuses?: string[];
  tagCount?: object;
  reason?: string;
  agreeCount?: number;
  campus?: string;
  title?: string;
};

type ProposalResult = DtoProposalSuggestionsVO & {
  resultType?: 'proposal';
  name?: string;
};

export function useChoose() {
  const keyword = ref("");
  const type = ref("course");

  const resultList = ref<MixedResult[]>([]);
  const proposalList = ref<ProposalResult[]>([]);
  const page = ref(1);
  const proposalPage = ref(0);
  const loading = ref(false);
  const proposalLoading = ref(false);
  const proposalsLoaded = ref(false); // 标记是否已加载过提案

  const filterForm = reactive({
    campus: [] as string[],
    department: [] as string[],
    category: [] as string[],
  });

  // 从搜索结果中动态补充校区选项，避免遗漏后端新增校区
  const filterOptions = reactive({
    campuses: [] as string[],
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
        url: `/pages/course/proposal-detail/index?data=${dataStr}`
      });
    } else {
      uni.navigateTo({
        url: `/pages/course/index/index?id=${item.id}`
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
      // 重置提案相关状态
      proposalPage.value = 0;
      proposalList.value = [];
      proposalsLoaded.value = false;
    }
    loading.value = true;

    const param = {
      keyword: keyword.value,
      page: page.value,
      pageSize: SEARCH_PAGE_SIZE,
      type: "course" as "course" | "teacher",
      sort: sortType
    };

    // 只搜索课程和教师，不搜索提案（提案延迟到点击按钮后）
    // 注意：swagger v2.0 的 DtoListCoursesReq 只有 page/pageSize，
    // keyword/type/sort 是后端实际支持但 swagger 未声明的参数
    Promise.all([
      http.CoursesController.searchCreate({ ...param, type: "course" }),
      http.CoursesController.searchCreate({ ...param, type: "teacher" })
    ]).then(([courseRes, teacherRes]) => {
      const courseData = courseRes.data as HandlerResponseDtoListCoursesResp;
      const teacherData = teacherRes.data as HandlerResponseDtoListCoursesResp;

      const courseContent = courseData?.data?.courses || [];
      const apiCourses: MixedResult[] = courseContent.map((c) => ({ ...c, resultType: 'course' as const }));

      const teacherContent = teacherData?.data?.courses || [];
      const apiTeachers: MixedResult[] = teacherContent.map((t) => ({ ...t, resultType: 'teacher' as const }));

      let combined: MixedResult[] = [...apiCourses, ...apiTeachers];

      // 收集可筛选选项（在筛选前，基于完整结果集）
      collectFilterOptions(combined, page.value === 1);

      // 客户端筛选
      if (filterForm.campus.length > 0) {
        const wanted = filterForm.campus.map(normalizeCampus);
        combined = combined.filter((c) => {
          if (!c.campuses || c.campuses.length === 0) return true;
          if (c.campuses.includes('两校区通用')) return true;
          return c.campuses.some(camp => wanted.includes(normalizeCampus(camp)));
        });
      }
      if (filterForm.department.length > 0) {
        combined = combined.filter((c) => c.department && filterForm.department.includes(c.department));
      }
      if (filterForm.category.length > 0) {
        combined = combined.filter((c) => c.category && filterForm.category.includes(c.category));
      }

      if (page.value === 1) {
        resultList.value = combined;
      } else {
        resultList.value = resultList.value.concat(combined);
      }
    }).catch(err => {
      console.error('[useChoose] Search error:', err);
    }).finally(() => {
      loading.value = false;
    })
  }

  // 延迟加载提案（点击"查看其他同学提案"按钮后调用）
  function loadProposals(reload: boolean = false) {
    if (proposalsLoaded.value && !reload) {
      // 已经加载过，不需要重复加载
      return;
    }
    if (reload) {
      proposalPage.value = 0;
      proposalList.value = [];
    }
    proposalLoading.value = true;

    http.ProposalController.proposalSuggestCreate({
      keyword: keyword.value,
      page: proposalPage.value,
      pageSize: SEARCH_PAGE_SIZE
    }).then((proposalRes) => {
      const proposalData = proposalRes.data as HandlerResponseDtoGetProposalSuggestionsResp;
      const proposalContent = proposalData?.data?.suggestions || [];
      const newProposals: ProposalResult[] = proposalContent.map((p) => ({
        ...p,
        resultType: 'proposal' as const,
        name: p.title
      }));

      if (proposalPage.value === 0) {
        proposalList.value = newProposals;
      } else {
        proposalList.value = proposalList.value.concat(newProposals);
      }
      proposalsLoaded.value = true;
    }).catch(err => {
      console.error('[useChoose] Load proposals error:', err);
    }).finally(() => {
      proposalLoading.value = false;
    })
  }

  // 加载更多提案
  function loadMoreProposals() {
    if (proposalLoading.value) return;
    proposalPage.value++;
    loadProposals(false);
  }

  return {
    keyword,
    rows: resultList,
    proposalRows: proposalList,
    page,
    loading,
    proposalLoading,
    proposalsLoaded,
    jump,
    doSearch,
    loadProposals,
    loadMoreProposals,
    filterForm,
    filterOptions
  };
}
