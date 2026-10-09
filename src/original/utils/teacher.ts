export type TeacherDisplayValue =
  | string
  | { name?: unknown; title?: unknown }
  | null
  | undefined;

const displayText = (value: unknown): string => String(value ?? "").trim();

export function formatTeacherName(teacher: TeacherDisplayValue): string {
  if (typeof teacher === "string") return teacher.trim();
  if (!teacher) return "";

  const name = displayText(teacher.name);
  const title = displayText(teacher.title);
  if (!title || name.endsWith(title)) return name;
  return `${name}${title}`;
}

export function formatTeacherNames(teachers: unknown): string {
  if (!Array.isArray(teachers)) {
    return formatTeacherName(teachers as TeacherDisplayValue);
  }

  return teachers
    .map(teacher => formatTeacherName(teacher as TeacherDisplayValue))
    .filter(Boolean)
    .join("、");
}
