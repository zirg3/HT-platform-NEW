import type { LessonRow } from "@/lib/schedule/types"

export const splitLessonsByNow = (lessons: LessonRow[]) => {
  const now = Date.now()
  const upcoming: LessonRow[] = []
  const past: LessonRow[] = []

  for (const lesson of lessons) {
    const t = new Date(lesson.starts_at).getTime()
    if (t >= now) upcoming.push(lesson)
    else past.push(lesson)
  }

  upcoming.sort(
    (a, b) =>
      new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()
  )
  past.sort(
    (a, b) =>
      new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime()
  )

  return { upcoming, past }
}
