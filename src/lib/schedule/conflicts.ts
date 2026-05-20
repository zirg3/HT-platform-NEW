import { addMinutes, areIntervalsOverlapping, parseISO } from "date-fns"
import type { LessonRow } from "@/lib/schedule/types"

export const findLessonConflicts = (
  lessons: LessonRow[],
  startsAtIso: string,
  durationMinutes: number,
  teacherId: string,
  studentId: string,
  excludeLessonId?: string
): string[] => {
  const start = parseISO(startsAtIso)
  const end = addMinutes(start, durationMinutes)
  const warnings: string[] = []

  for (const lesson of lessons) {
    if (lesson.id === excludeLessonId) continue
    if (lesson.status === "cancelled") continue

    const otherStart = parseISO(lesson.starts_at)
    const otherEnd = addMinutes(otherStart, lesson.duration_minutes)
    const overlaps = areIntervalsOverlapping(
      { start, end },
      { start: otherStart, end: otherEnd }
    )

    if (!overlaps) continue

    const studentIds = lesson.lesson_participants.map((p) => p.profile_id)
    if (lesson.teacher_id === teacherId) {
      warnings.push(
        `Пересечение с уроком преподавателя в ${lesson.starts_at.slice(11, 16)}`
      )
    }
    if (studentIds.includes(studentId)) {
      warnings.push(
        `Пересечение с уроком ученика в ${lesson.starts_at.slice(11, 16)}`
      )
    }
  }

  return [...new Set(warnings)]
}
