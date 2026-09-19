import { ref } from 'vue';
import type {
  DtoCourseVO,
  HandlerResponseDtoGetCourseResp
} from '@/api/data-contracts';
import { useCourseStore, http } from '@/config';
import { teachersToStrings } from '@/utils/teacher-display';

type CourseDetailVO = DtoCourseVO & { commentCount?: number };

export function useCourse() {
  const id = ref('');
  const store = useCourseStore();

  const course = ref<{ data?: CourseDetailVO }>({});
  const teachers = ref<string[]>([]);
  const trends = ref<DtoCourseVO[]>([]);

  function fetch(courseId: string) {
    if (!courseId || courseId === '') return;
    id.value = courseId;

    http.CourseController.courseDetail(courseId)
      .then((res) => {
        // 响应结构：res.data -> HandlerResponseDtoGetCourseResp -> .data -> DtoGetCourseResp -> .course -> DtoCourseVO
        const payload = res.data?.data;
        const courseData = payload?.course;
        if (!courseData) return;
        course.value = { data: courseData };
        teachers.value = teachersToStrings(courseData.teachers);
      })
      .catch((err: unknown) => {
        console.error('[useCourse] fetch error:', err);
      });
  }

  return { id, course, teachers, trends, fetch };
}
