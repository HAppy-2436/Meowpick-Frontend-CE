import type { DtoProposalCourseVO, DtoTeacherVO } from '@/api/data-contracts';

const teachersText = (course?: DtoProposalCourseVO | null): string => {
  const list = course?.teachers;
  if (!Array.isArray(list)) return '';
  return list
    .map((t: DtoTeacherVO | string) =>
      typeof t === 'string' ? t : t.name || ''
    )
    .filter(Boolean)
    .join('、');
};

const campusesText = (course?: DtoProposalCourseVO | null): string => {
  const campuses = course?.campuses;
  return Array.isArray(campuses) ? campuses.join('、') : '';
};

/**
 * 判断管理员审批时的 finalCourse 是否相对用户原始 course 做了修订。
 * 仅在原始字段原本有值且被改变时才算修订，避免把「原为空」误判为修改。
 */
export const hasCourseRevision = (
  original?: DtoProposalCourseVO | null,
  final?: DtoProposalCourseVO | null
): boolean => {
  if (!final) return false;
  const pairs: [string, string][] = [
    [final.name || '', original?.name || ''],
    [teachersText(final), teachersText(original)],
    [campusesText(final), campusesText(original)],
    [final.category || '', original?.category || ''],
    [final.department || '', original?.department || '']
  ];
  return pairs.some(([next, prev]) => !!prev && next !== prev);
};
