import { addDays, addWeeks, format, parseISO, startOfWeek } from "date-fns"
import { fromZonedTime, toZonedTime } from "date-fns-tz"
import { ru } from "date-fns/locale"
import { DEFAULT_TIME_ZONE } from "@/lib/constants"

export const SCHEDULE_START_HOUR = 8
export const SCHEDULE_END_HOUR = 22
export const DEFAULT_LESSON_DURATION = 60

export const getWeekStartMonday = (date: Date) =>
  startOfWeek(date, { weekStartsOn: 1 })

export const parseWeekParam = (week?: string): Date => {
  if (week && /^\d{4}-\d{2}-\d{2}$/.test(week)) {
    return fromZonedTime(`${week}T00:00:00`, DEFAULT_TIME_ZONE)
  }
  return getWeekStartMonday(toZonedTime(new Date(), DEFAULT_TIME_ZONE))
}

export const formatWeekParam = (weekStart: Date) =>
  format(toZonedTime(weekStart, DEFAULT_TIME_ZONE), "yyyy-MM-dd")

export const shiftWeek = (weekStart: Date, delta: number) =>
  addWeeks(weekStart, delta)

export const getWeekDays = (weekStart: Date) =>
  Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

export const formatWeekRangeLabel = (weekStart: Date) => {
  const end = addDays(weekStart, 6)
  const startLabel = format(toZonedTime(weekStart, DEFAULT_TIME_ZONE), "d MMM", {
    locale: ru,
  })
  const endLabel = format(toZonedTime(end, DEFAULT_TIME_ZONE), "d MMM yyyy", {
    locale: ru,
  })
  return `${startLabel} — ${endLabel}`
}

export const formatDayHeader = (day: Date) => {
  const zoned = toZonedTime(day, DEFAULT_TIME_ZONE)
  const weekday = format(zoned, "EEE", { locale: ru }).toLocaleUpperCase("ru-RU")
  const dateBody = format(zoned, "d MMMM", { locale: ru })
  const capitalizedDate = dateBody.replace(
    /(\d+\s+)([^\s])/u,
    (_, prefix: string, first: string) => prefix + first.toUpperCase()
  )
  return `${weekday}, ${capitalizedDate}`
}

export const formatLessonTime = (iso: string) =>
  format(toZonedTime(parseISO(iso), DEFAULT_TIME_ZONE), "HH:mm", {
    locale: ru,
  })

export const formatLessonDateTime = (iso: string) =>
  format(toZonedTime(parseISO(iso), DEFAULT_TIME_ZONE), "d MMM yyyy, HH:mm", {
    locale: ru,
  })

export const localInputToUtcIso = (date: string, time: string) =>
  fromZonedTime(`${date}T${time}:00`, DEFAULT_TIME_ZONE).toISOString()

export const utcIsoToLocalInputs = (iso: string) => {
  const zoned = toZonedTime(parseISO(iso), DEFAULT_TIME_ZONE)
  return {
    date: format(zoned, "yyyy-MM-dd"),
    time: format(zoned, "HH:mm"),
  }
}

export const getLessonTopPercent = (iso: string, durationMinutes: number) => {
  const zoned = toZonedTime(parseISO(iso), DEFAULT_TIME_ZONE)
  const minutesFromStart =
    zoned.getHours() * 60 + zoned.getMinutes() - SCHEDULE_START_HOUR * 60
  const totalMinutes = (SCHEDULE_END_HOUR - SCHEDULE_START_HOUR) * 60
  const top = (minutesFromStart / totalMinutes) * 100
  const height = (durationMinutes / totalMinutes) * 100
  return {
    top: Math.max(0, Math.min(top, 100)),
    height: Math.max(6, Math.min(height, 100 - top)),
  }
}

export const getHourLabels = () => {
  const labels: string[] = []
  for (let h = SCHEDULE_START_HOUR; h < SCHEDULE_END_HOUR; h++) {
    labels.push(`${String(h).padStart(2, "0")}:00`)
  }
  return labels
}
