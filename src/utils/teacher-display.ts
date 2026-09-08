import type { DtoTeacherVO } from "@/api/data-contracts";

/**
 * 后端 2.0 起 DtoCourseVO.teachers 变更为对象数组（DtoTeacherVO[]）；
 * 旧后端返回字符串数组（如 "张三 教授"）。
 *
 * 本工具统一把两种形态归一化为显示字符串：
 *   - 字符串 → 原样
 *   - 对象   → "name[ title]"，缺失字段降级
 *
 * 全局单点兼容，避免在每个组件里写 if-else。
 */
export function teacherToString(t: string | DtoTeacherVO | undefined | null): string {
  if (t === undefined || t === null) return "";
  if (typeof t === "string") return t.trim();
  const name = (t.name || "").trim();
  const title = (t.title || "").trim();
  if (!name && !title) return "";
  return title ? `${name} ${title}` : name;
}

/**
 * 把可能为 string[] | DtoTeacherVO[] 的教师数组映射为字符串数组。
 */
export function teachersToStrings(list: Array<string | DtoTeacherVO> | undefined | null): string[] {
  if (!Array.isArray(list)) return [];
  return list.map(teacherToString).filter(Boolean);
}

/**
 * 单条教师紧凑格式（用于卡片 "姓名 / 姓名"）
 */
export function joinTeachers(
  list: Array<string | DtoTeacherVO> | undefined | null,
  sep = " / "
): string {
  return teachersToStrings(list).join(sep);
}
