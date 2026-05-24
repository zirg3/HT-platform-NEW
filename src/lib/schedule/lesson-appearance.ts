import type { LessonRow } from "@/lib/schedule/types"

export type LessonVisualKind =
  | "upcoming"
  | "cancelled"
  | "rescheduled"
  | "completed"
  | "past"

export type LessonAppearance = {
  kind: LessonVisualKind
  label: string
  bg: string
  border: string
  text: string
}

export const getLessonVisualKind = (lesson: LessonRow): LessonVisualKind => {
  if (lesson.status === "cancelled") return "cancelled"
  if (lesson.status === "completed") return "completed"
  if (lesson.rescheduled_at) return "rescheduled"
  if (new Date(lesson.starts_at) > new Date()) return "upcoming"
  return "past"
}

const APPEARANCE: Record<LessonVisualKind, Omit<LessonAppearance, "kind">> = {
  upcoming: {
    label: "Запланирован",
    bg: "bg-[oklch(0.96_0.04_155)]",
    border: "border-[oklch(0.88_0.08_155)]",
    text: "text-[oklch(0.28_0.06_155)]",
  },
  cancelled: {
    label: "Отменён",
    bg: "bg-[oklch(0.97_0.03_15)]",
    border: "border-[oklch(0.88_0.1_15)]",
    text: "text-[oklch(0.32_0.08_15)]",
  },
  rescheduled: {
    label: "Перенесён",
    bg: "bg-[oklch(0.97_0.04_55)]",
    border: "border-[oklch(0.88_0.1_55)]",
    text: "text-[oklch(0.32_0.08_55)]",
  },
  completed: {
    label: "Проведён",
    bg: "bg-[oklch(0.96_0.04_290)]",
    border: "border-[oklch(0.88_0.08_290)]",
    text: "text-[oklch(0.28_0.06_290)]",
  },
  past: {
    label: "Прошёл",
    bg: "bg-[oklch(0.96_0.02_280)]",
    border: "border-[oklch(0.88_0.03_280)]",
    text: "text-[oklch(0.28_0.04_280)]",
  },
}

export const getLessonAppearance = (lesson: LessonRow): LessonAppearance => {
  const kind = getLessonVisualKind(lesson)
  return { kind, ...APPEARANCE[kind] }
}

export const AGENDA_LIMIT = 12

export const SCHEDULE_SLOT_PX = 64
