import { getLessonVisualKind } from "@/lib/schedule/lesson-appearance"
import type { LessonRow } from "@/lib/schedule/types"

export type WeekStats = {
  total: number
  upcoming: number
  completed: number
  rescheduled: number
  cancelled: number
  workloadPercent: number
}

export const computeWeekStats = (lessons: LessonRow[]): WeekStats => {
  let upcoming = 0
  let completed = 0
  let rescheduled = 0
  let cancelled = 0

  for (const lesson of lessons) {
    const kind = getLessonVisualKind(lesson)
    if (kind === "cancelled") cancelled += 1
    else if (kind === "completed") completed += 1
    else if (kind === "rescheduled") rescheduled += 1
    else upcoming += 1
  }

  const total = lessons.length
  const workloadPercent =
    total === 0 ? 0 : Math.min(100, Math.round((completed / total) * 100))

  return {
    total,
    upcoming,
    completed,
    rescheduled,
    cancelled,
    workloadPercent,
  }
}
