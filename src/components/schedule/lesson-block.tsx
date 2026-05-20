"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  formatLessonTime,
  getLessonTopPercent,
} from "@/lib/schedule/dates"
import { formatCancellationSummary } from "@/lib/schedule/cancel-info"
import type { LessonRow } from "@/lib/schedule/types"

type LessonBlockProps = {
  lesson: LessonRow
  onSelect: (lesson: LessonRow) => void
}

export const LessonBlock = ({ lesson, onSelect }: LessonBlockProps) => {
  const { top, height } = getLessonTopPercent(
    lesson.starts_at,
    lesson.duration_minutes
  )
  const isCancelled = lesson.status === "cancelled"
  const isCompleted = lesson.status === "completed"
  const courseColor = lesson.courses?.color ?? "#64748b"
  const student = lesson.lesson_participants[0]?.profiles
  const title = lesson.courses?.title ?? "Без курса"
  const cancelHint = formatCancellationSummary(lesson)
  const nativeTitle = cancelHint ?? undefined
  const ariaLabel = cancelHint
    ? `Урок ${title}, ${formatLessonTime(lesson.starts_at)}, ${cancelHint}`
    : `Урок ${title}, ${formatLessonTime(lesson.starts_at)}`

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      onSelect(lesson)
    }
  }

  return (
    <button
      type="button"
      onClick={() => onSelect(lesson)}
      onKeyDown={handleKeyDown}
      className={cn(
        "absolute right-0.5 left-0.5 z-10 overflow-hidden rounded-md border px-1.5 py-1 text-left text-xs shadow-sm transition-opacity",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        isCancelled && "opacity-60"
      )}
      style={{
        top: `${top}%`,
        height: `${height}%`,
        borderColor: courseColor,
        backgroundColor: `${courseColor}22`,
      }}
      aria-label={ariaLabel}
      title={nativeTitle}
    >
      <p
        className={cn(
          "truncate font-medium",
          isCancelled && "line-through"
        )}
      >
        {title}
      </p>
      <p className="truncate text-muted-foreground">
        {formatLessonTime(lesson.starts_at)} · {student?.full_name || "—"}
      </p>
      {isCancelled ? (
        <Badge variant="secondary" className="mt-0.5 h-4 px-1 text-[10px]">
          Отменён
        </Badge>
      ) : null}
      {isCompleted ? (
        <Badge variant="outline" className="mt-0.5 h-4 px-1 text-[10px]">
          Проведён
        </Badge>
      ) : null}
    </button>
  )
}
