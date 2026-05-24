import { formatLessonDateTime } from "@/lib/schedule/dates"
import type { LessonRow } from "@/lib/schedule/types"

export const formatCancellationSummary = (lesson: LessonRow): string | null => {
  if (lesson.status !== "cancelled") return null

  const parts: string[] = []
  if (lesson.cancelled_at) {
    const who =
      lesson.cancelled_by_profile?.full_name?.trim() ||
      lesson.cancelled_by_profile?.email ||
      "—"
    parts.push(`Отменено ${formatLessonDateTime(lesson.cancelled_at)} · ${who}`)
  } else {
    parts.push("Отменён")
  }

  if (lesson.cancellation_reason?.trim()) {
    parts.push(`Причина: ${lesson.cancellation_reason.trim()}`)
  }

  return parts.join(". ")
}

export const formatRescheduleSummary = (lesson: LessonRow): string | null => {
  if (!lesson.rescheduled_at) return null

  const parts = [`Перенесён ${formatLessonDateTime(lesson.rescheduled_at)}`]
  if (lesson.original_starts_at) {
    parts.push(`было ${formatLessonDateTime(lesson.original_starts_at)}`)
  }
  return parts.join(", ")
}
