import { addWeeks, format } from "date-fns"
import { fromZonedTime, toZonedTime } from "date-fns-tz"
import { DEFAULT_TIME_ZONE } from "@/lib/constants"

/** Максимум экземпляров в одной серии (защита от случайно огромного диапазона). */
export const MAX_WEEKLY_OCCURRENCES = 52

export const buildWeeklyStartsUtc = (
  firstDate: string,
  time: string,
  untilDate: string
): string[] => {
  const out: string[] = []
  let cur = fromZonedTime(`${firstDate}T${time}:00`, DEFAULT_TIME_ZONE)

  while (out.length < MAX_WEEKLY_OCCURRENCES) {
    const curDateStr = format(
      toZonedTime(cur, DEFAULT_TIME_ZONE),
      "yyyy-MM-dd"
    )
    if (curDateStr > untilDate) break
    out.push(cur.toISOString())
    cur = addWeeks(cur, 1)
  }

  return out
}

export const lessonDateInOrgTz = (isoUtc: string) =>
  toZonedTime(new Date(isoUtc), DEFAULT_TIME_ZONE)
