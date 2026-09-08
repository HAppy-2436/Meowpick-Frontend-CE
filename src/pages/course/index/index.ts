import { ref } from 'vue';
import type { DtoCourseVO } from "@/api/data-contracts";
import { useCourseStore, http } from "@/config";
import { teachersToStrings } from "@/utils/teacher-display";

export function useCourse() {
  const id = ref("");
  const store = useCourseStore();

  const course = ref<{ data?: DtoCourseVO }>({});
  const teachers = ref<string[]>([]);
  const trends = ref<DtoCourseVO[]>([]);

  function fetch(courseId: string) {
    if (!courseId || courseId === "") return;
    id.value = courseId;

    http.CourseController.courseDetail(courseId).then((res) => {
      if (res.data && res.data.data) {
        const courseData = res.data.data as DtoCourseVO;
        course.value = { data: courseData };
        if (courseData.teachers) {
          teachers.value = teachersToStrings(courseData.teachers as Array<any>);
        }
      }
    }).catch((err) => {
      console.error('[useCourse] fetch error:', err);
    });
  }

  return { id, course, teachers, trends, fetch };
}
