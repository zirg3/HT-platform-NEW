"use client"

import { format, parseISO } from "date-fns"
import { ru } from "date-fns/locale"
import { Link } from "@/lib/navigation"
import { toZonedTime } from "date-fns-tz"
import { Badge } from "@/components/ui/badge"
import { DEFAULT_TIME_ZONE } from "@/lib/constants"
import { formatLessonTimeRange } from "@/lib/schedule/agenda-format"
import { formatLessonTime } from "@/lib/schedule/dates"
import {
  getLessonAppearance,
  getLessonVisualKind,
} from "@/lib/schedule/lesson-appearance"
import { LessonStatusIcon } from "@/components/schedule/lesson-status-icon"
import type { LessonRow } from "@/lib/schedule/types"
import { cn } from "@/lib/utils"

export const getLessonCounterpartyName = (
  lesson: LessonRow,
  context: "student" | "teacher"
) => {
  if (context === "student") {
    const t = lesson.teacher
    return t?.full_name?.trim() || t?.email || "—"
  }
  const p = lesson.lesson_participants[0]?.profiles
  return p?.full_name?.trim() || p?.email || "—"
}

const formatLessonShortDate = (iso: string) =>
  format(toZonedTime(parseISO(iso), DEFAULT_TIME_ZONE), "d MMM", {
    locale: ru,
  })

type CompactLessonCardProps = {
  lesson: LessonRow
  context: "student" | "teacher"
  showDate?: boolean
  variant?: "calendar" | "agenda"
  className?: string
}

const lessonCardShellClass = (
  appearance: ReturnType<typeof getLessonAppearance>,
  lesson: LessonRow,
  className?: string
) =>
  cn(
    "overflow-hidden rounded-md border-2 text-left",
    appearance.bg,
    appearance.border,
    appearance.text,
    lesson.status === "cancelled" && "opacity-80",
    className
  )

const lessonCardAccentStyle = (courseColor: string) => ({
  borderLeftColor: courseColor,
  borderLeftWidth: 4,
})

type CalendarLessonCardProps = {
  lesson: LessonRow
  context: "student" | "teacher"
  studentProfileHref?: string | null
  onOpenLesson: () => void
  className?: string
}

/** Карточка урока в сетке календаря: единый фон, ссылка «К ученику» внизу внутри рамки */
export const CalendarLessonCard = ({
  lesson,
  context,
  studentProfileHref,
  onOpenLesson,
  className,
}: CalendarLessonCardProps) => {
  const appearance = getLessonAppearance(lesson)
  const visualKind = getLessonVisualKind(lesson)
  const courseColor = lesson.courses?.color ?? "#64748b"
  const title = lesson.courses?.title ?? "Урок"
  const counterparty = getLessonCounterpartyName(lesson, context)
  const timePart = formatLessonTimeRange(lesson)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      onOpenLesson()
    }
  }

  return (
    <div
      className={cn(
        "flex h-full min-h-0 flex-col shadow-sm",
        lessonCardShellClass(appearance, lesson, className)
      )}
      style={lessonCardAccentStyle(courseColor)}
    >
      <button
        type="button"
        onClick={onOpenLesson}
        onKeyDown={handleKeyDown}
        className={cn(
          "relative min-h-0 flex-1 overflow-hidden px-1.5 py-1 text-left transition-opacity hover:opacity-90",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        )}
      >
        <LessonStatusIcon
          kind={visualKind}
          className="absolute top-0.5 right-0.5 z-10"
        />
        <p className="truncate pr-4 text-[9px] font-medium leading-tight opacity-90">
          {timePart}
        </p>
        <p
          className={cn(
            "truncate pr-4 text-[10px] font-semibold leading-tight",
            lesson.status === "cancelled" && "line-through"
          )}
        >
          {counterparty}
        </p>
        <p className="truncate text-[9px] leading-tight opacity-85">
          {title}
        </p>
      </button>
      {studentProfileHref ? (
        <Link
          to={studentProfileHref}
          className={cn(
            "flex shrink-0 items-center justify-center gap-0.5 border-t border-current/20 px-1 py-0.5",
            "text-[9px] font-medium leading-tight transition-colors",
            "hover:bg-primary/12 focus-visible:bg-primary/12 focus-visible:outline-none"
          )}
          aria-label={`Профиль ученика ${counterparty}`}
        >
          <span>К ученику</span>
          <span aria-hidden className="opacity-60">
            →
          </span>
        </Link>
      ) : null}
    </div>
  )
}

export const CompactLessonCardContent = ({
  lesson,
  context,
  showDate = false,
  variant = "agenda",
  className,
}: CompactLessonCardProps) => {
  const appearance = getLessonAppearance(lesson)
  const courseColor = lesson.courses?.color ?? "#64748b"
  const title = lesson.courses?.title ?? "Урок"
  const counterparty = getLessonCounterpartyName(lesson, context)
  const timePart = showDate
    ? `${formatLessonShortDate(lesson.starts_at)}, ${formatLessonTime(lesson.starts_at)}`
    : formatLessonTime(lesson.starts_at)

  if (variant === "calendar") {
    return (
      <div
        className={lessonCardShellClass(appearance, lesson, cn("flex flex-col px-1 py-0.5", className))}
        style={lessonCardAccentStyle(courseColor)}
      >
        <p
          className={cn(
            "truncate text-[10px] font-semibold leading-tight",
            lesson.status === "cancelled" && "line-through"
          )}
        >
          {title}
        </p>
        <p className="truncate text-[9px] leading-tight opacity-90">
          {timePart} · {counterparty} · {appearance.label}
        </p>
      </div>
    )
  }

  const timeLine = `${timePart} · ${counterparty}`

  return (
    <div
      className={lessonCardShellClass(appearance, lesson, cn("px-1.5 py-1", className))}
      style={lessonCardAccentStyle(courseColor)}
    >
      <p
        className={cn(
          "truncate text-[11px] font-semibold leading-tight",
          lesson.status === "cancelled" && "line-through"
        )}
      >
        {title}
      </p>
      <p className="truncate text-[10px] leading-tight opacity-80">{timeLine}</p>
      <Badge
        variant="outline"
        className={cn(
          "mt-0.5 h-4 max-w-full truncate border-current/30 px-1 text-[9px] leading-none",
          appearance.bg
        )}
      >
        {appearance.label}
      </Badge>
    </div>
  )
}

type CompactLessonCardButtonProps = CompactLessonCardProps & {
  onClick: () => void
  ariaLabel?: string
}

export const CompactLessonCardButton = ({
  onClick,
  ariaLabel,
  ...props
}: CompactLessonCardButtonProps) => {
  const title = props.lesson.courses?.title ?? "Урок"

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "min-w-0 w-full text-left transition-opacity hover:opacity-90",
        "rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      )}
      aria-label={ariaLabel ?? `Открыть урок ${title}`}
    >
      <CompactLessonCardContent {...props} />
    </button>
  )
}
