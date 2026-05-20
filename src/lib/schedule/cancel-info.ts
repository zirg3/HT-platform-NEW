import { formatLessonDateTime } from "@/lib/schedule/dates"
import type { LessonRow } from "@/lib/schedule/types"

/** Текст для title/tooltip и блока «кто отменил». */
export const formatCancellationSummary = (lesson: LessonRow): string | null => {
  if (lesson.status !== "cancelled") return null
  if (!lesson.cancelled_at) return "Отменён"
  const who =
    lesson.cancelled_by_profile?.full_name?.trim() ||
    lesson.cancelled_by_profile?.email ||
    "Неизвестно"
  return `Отменено ${formatLessonDateTime(lesson.cancelled_at)} · ${who}`
}
