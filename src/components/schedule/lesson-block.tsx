"use client"

import {
  formatCancellationSummary,
  formatRescheduleSummary,
} from "@/lib/schedule/cancel-info"
import { getLessonTopPercent } from "@/lib/schedule/dates"
import { getLessonAppearance } from "@/lib/schedule/lesson-appearance"
import type { LessonRow } from "@/lib/schedule/types"
import { CalendarLessonCard } from "@/components/schedule/compact-lesson-card"

type LessonBlockProps = {
  lesson: LessonRow
  context: "student" | "teacher"
  onSelect: (lesson: LessonRow) => void
}

export const LessonBlock = ({ lesson, context, onSelect }: LessonBlockProps) => {
  const { top, height } = getLessonTopPercent(
    lesson.starts_at,
    lesson.duration_minutes
  )
  const appearance = getLessonAppearance(lesson)
  const title = lesson.courses?.title ?? "Без курса"
  const cancelHint = formatCancellationSummary(lesson)
  const rescheduleHint = formatRescheduleSummary(lesson)
  const nativeTitle = [cancelHint, rescheduleHint].filter(Boolean).join(" · ")
  const ariaLabel = `${appearance.label}: ${title}`

  const studentId = lesson.lesson_participants[0]?.profile_id
  const studentProfileHref =
    context === "teacher" && studentId
      ? `/teacher/students/${studentId}`
      : null

  return (
    <div
      className="absolute inset-x-0.5 z-10 min-h-0 max-h-full overflow-hidden rounded-md"
      style={{
        top: `${top}%`,
        height: `${height}%`,
      }}
      title={nativeTitle || undefined}
      aria-label={ariaLabel}
    >
      <CalendarLessonCard
        lesson={lesson}
        context={context}
        studentProfileHref={studentProfileHref}
        onOpenLesson={() => onSelect(lesson)}
        className="h-full"
      />
    </div>
  )
}
