import {
  addMinutes,
  differenceInHours,
  format,
  isToday,
  isTomorrow,
  parseISO,
} from "date-fns"
import { ru } from "date-fns/locale"
import { toZonedTime } from "date-fns-tz"
import { DEFAULT_TIME_ZONE } from "@/lib/constants"
import { formatLessonTime } from "@/lib/schedule/dates"
import type { LessonRow } from "@/lib/schedule/types"

const zoned = (iso: string) =>
  toZonedTime(parseISO(iso), DEFAULT_TIME_ZONE)

export const formatLessonTimeRange = (lesson: LessonRow) => {
  const start = zoned(lesson.starts_at)
  const end = addMinutes(start, lesson.duration_minutes ?? 60)
  return `${format(start, "HH:mm")} – ${format(end, "HH:mm")}`
}

export const formatAgendaDayLabel = (iso: string) => {
  const date = zoned(iso)
  if (isToday(date)) return "Сегодня"
  if (isTomorrow(date)) return "Завтра"
  return format(date, "d MMMM", { locale: ru })
}

export const formatAgendaSlotLabel = (lesson: LessonRow) => {
  const day = formatAgendaDayLabel(lesson.starts_at)
  return `${day}, ${formatLessonTimeRange(lesson)}`
}

export const formatStartsInLabel = (startsAtIso: string): string | null => {
  const start = parseISO(startsAtIso)
  const now = new Date()
  if (start <= now) return null

  const hours = differenceInHours(start, now)
  if (hours < 1) return "Скоро"
  if (hours < 24) return `Через ${hours} ч`
  const days = Math.round(hours / 24)
  return days === 1 ? "Через 1 день" : `Через ${days} дн.`
}
