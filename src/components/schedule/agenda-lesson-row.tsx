"use client"

import { MoreHorizontal, Video } from "lucide-react"
import { UserAvatarPlaceholder } from "@/components/layout/user-avatar-placeholder"
import { getLessonCounterpartyName } from "@/components/schedule/compact-lesson-card"
import { LessonStatusIcon } from "@/components/schedule/lesson-status-icon"
import {
  formatAgendaSlotLabel,
  formatStartsInLabel,
} from "@/lib/schedule/agenda-format"
import {
  getLessonAppearance,
  getLessonVisualKind,
} from "@/lib/schedule/lesson-appearance"
import type { LessonRow } from "@/lib/schedule/types"
import { cn } from "@/lib/utils"

type AgendaLessonRowProps = {
  lesson: LessonRow
  context: "student" | "teacher"
  variant: "upcoming" | "past"
  onClick?: () => void
}

export const AgendaLessonRow = ({
  lesson,
  context,
  variant,
  onClick,
}: AgendaLessonRowProps) => {
  const appearance = getLessonAppearance(lesson)
  const visualKind = getLessonVisualKind(lesson)
  const counterparty = getLessonCounterpartyName(lesson, context)
  const courseTitle = lesson.courses?.title ?? "Урок"
  const slotLabel = formatAgendaSlotLabel(lesson)
  const startsIn =
    variant === "upcoming" ? formatStartsInLabel(lesson.starts_at) : null
  const topic = lesson.note?.trim()
  const isOnline = Boolean(lesson.meeting_url?.trim())

  const content = (
    <div className="flex w-full flex-col gap-2.5 text-left">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium text-muted-foreground">{slotLabel}</p>
        <div className="flex shrink-0 items-center gap-1.5">
          {startsIn ? (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
              {startsIn}
            </span>
          ) : null}
          <LessonStatusIcon kind={visualKind} />
        </div>
      </div>
      <div className="flex items-center gap-2.5">
        <UserAvatarPlaceholder displayName={counterparty} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{counterparty}</p>
          <p className="truncate text-xs text-muted-foreground">{courseTitle}</p>
        </div>
        {onClick ? (
          <span
            className="flex size-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground"
            aria-hidden
          >
            <MoreHorizontal className="size-4" />
          </span>
        ) : null}
      </div>
      {topic ? (
        <p className="text-xs leading-snug text-muted-foreground">
          <span className="font-medium text-foreground/80">Тема:</span> {topic}
        </p>
      ) : null}
      {isOnline ? (
        <p className="flex items-center gap-1 text-[11px] font-medium text-primary">
          <Video className="size-3.5" aria-hidden />
          Онлайн
        </p>
      ) : null}
    </div>
  )

  const shellClass = cn(
    "relative w-full rounded-2xl border-2 px-3.5 py-3 transition-all",
    appearance.bg,
    appearance.border,
    appearance.text,
    onClick &&
      "hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
  )

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={shellClass}>
        {content}
      </button>
    )
  }

  return <div className={shellClass}>{content}</div>
}
