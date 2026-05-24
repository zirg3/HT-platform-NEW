"use client"

import { Link, usePathname } from "@/lib/navigation"
import { useMemo, useState } from "react"
import { isSameDay, parseISO } from "date-fns"
import { toZonedTime } from "date-fns-tz"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { LessonBlock } from "@/components/schedule/lesson-block"
import { LessonDialog } from "@/components/schedule/lesson-dialog"
import { CalendarLegend } from "@/components/schedule/calendar-legend"
import { WeekCalendarGridSkeleton } from "@/components/schedule/week-calendar-grid-skeleton"
import { WeekDatePicker } from "@/components/schedule/week-date-picker"
import { buttonVariants } from "@/components/ui/button"
import { DEFAULT_TIME_ZONE } from "@/lib/constants"
import {
  formatWeekParam,
  formatDayHeader,
  getHourLabels,
  getWeekDays,
  SCHEDULE_END_HOUR,
  SCHEDULE_START_HOUR,
  shiftWeek,
} from "@/lib/schedule/dates"
import type {
  CourseRow,
  LessonRow,
  ProfileBrief,
  SchedulePermissions,
} from "@/lib/schedule/types"
import { SCHEDULE_SLOT_PX } from "@/lib/schedule/lesson-appearance"
import { cn } from "@/lib/utils"

type WeekCalendarProps = {
  weekStartIso: string
  lessons: LessonRow[]
  courses: CourseRow[]
  students: ProfileBrief[]
  teachers: ProfileBrief[]
  permissions: SchedulePermissions
  profileId: string
  lessonContext?: "student" | "teacher"
  isGridLoading?: boolean
}

export const WeekCalendar = ({
  weekStartIso,
  lessons,
  courses,
  students,
  teachers,
  permissions,
  profileId,
  lessonContext = "teacher",
  isGridLoading = false,
}: WeekCalendarProps) => {
  const pathname = usePathname()
  const weekStart = useMemo(() => new Date(weekStartIso), [weekStartIso])
  const weekParam = formatWeekParam(weekStart)
  const days = useMemo(() => getWeekDays(weekStart), [weekStart])
  const hourLabels = getHourLabels()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedLesson, setSelectedLesson] = useState<LessonRow | null>(null)
  const [draftSlot, setDraftSlot] = useState<{ date: string; time: string } | null>(
    null
  )

  const lessonsByDay = useMemo(() => {
    const map = new Map<string, LessonRow[]>()
    for (const day of days) {
      map.set(formatWeekParam(day), [])
    }
    for (const lesson of lessons) {
      const dayKey = formatWeekParam(
        toZonedTime(parseISO(lesson.starts_at), DEFAULT_TIME_ZONE)
      )
      const list = map.get(dayKey) ?? []
      list.push(lesson)
      map.set(dayKey, list)
    }
    return map
  }, [days, lessons])

  const prevWeek = formatWeekParam(shiftWeek(weekStart, -1))
  const nextWeek = formatWeekParam(shiftWeek(weekStart, 1))

  const handleSelectLesson = (lesson: LessonRow) => {
    setSelectedLesson(lesson)
    setDraftSlot(null)
    setDialogOpen(true)
  }

  const handleSlotClick = (dayKey: string, hour: number) => {
    if (!permissions.canCreate) return
    setSelectedLesson(null)
    setDraftSlot({
      date: dayKey,
      time: `${String(hour).padStart(2, "0")}:00`,
    })
    setDialogOpen(true)
  }

  const gridHeight = (SCHEDULE_END_HOUR - SCHEDULE_START_HOUR) * SCHEDULE_SLOT_PX
  const todayZoned = toZonedTime(new Date(), DEFAULT_TIME_ZONE)

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="glass-panel rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground">
            Неделя
          </span>
          <div className="flex items-center gap-1">
            <Link
              to={pathname}
              search={{ week: prevWeek }}
              className={cn(
                buttonVariants({ variant: "outline", size: "icon-sm" }),
                "glass-panel border-border/60"
              )}
              aria-label="Предыдущая неделя"
            >
              <ChevronLeft className="size-4" />
            </Link>
            <Link
              to={pathname}
              search={{ week: weekParam }}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "glass-panel border-border/60"
              )}
            >
              Сегодня
            </Link>
            <Link
              to={pathname}
              search={{ week: nextWeek }}
              className={cn(
                buttonVariants({ variant: "outline", size: "icon-sm" }),
                "glass-panel border-border/60"
              )}
              aria-label="Следующая неделя"
            >
              <ChevronRight className="size-4" />
            </Link>
          </div>
        </div>
        <WeekDatePicker weekStart={weekStart} pathname={pathname} />
      </div>

      {courses.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Справочник курсов пуст. Администратор должен добавить курсы.
        </p>
      ) : null}

      <div
        className="overflow-x-auto rounded-lg border border-border/70 bg-white/30"
        tabIndex={0}
        aria-label="Недельное расписание, прокрутите горизонтально на узком экране"
      >
        <div className="min-w-[720px]">
          <div className="grid grid-cols-[56px_repeat(7,minmax(0,1fr))] divide-x divide-border/70 border-b border-border/80 bg-white/45">
            <div className="p-2" />
            {days.map((day) => {
              const key = formatWeekParam(day)
              const zonedDay = toZonedTime(day, DEFAULT_TIME_ZONE)
              const isToday = isSameDay(zonedDay, todayZoned)
              const dayLabel = formatDayHeader(day)

              return (
                <div
                  key={key}
                  className={cn("p-2 text-center", isToday && "calendar-cell-today")}
                >
                  <p
                    className={cn(
                      "mx-auto inline-block text-xs leading-snug font-semibold",
                      isToday
                        ? "calendar-today-badge rounded-full px-2.5 py-1"
                        : "text-foreground"
                    )}
                  >
                    {dayLabel}
                  </p>
                </div>
              )
            })}
          </div>
          <div className="relative">
            {isGridLoading ? (
              <div className="absolute inset-0 z-10 bg-white/45 backdrop-blur-[1px]">
                <WeekCalendarGridSkeleton className="h-full" />
              </div>
            ) : null}
            <div
              className={cn(
                "grid grid-cols-[56px_repeat(7,minmax(0,1fr))] divide-x divide-border/70 transition-opacity duration-200",
                isGridLoading && "pointer-events-none opacity-35"
              )}
              aria-busy={isGridLoading}
            >
            <div
              className="relative bg-white/25"
              style={{ height: gridHeight }}
            >
              {hourLabels.map((label, i) => (
                <span
                  key={label}
                  className="absolute right-1 text-[10px] text-muted-foreground"
                  style={{ top: i * SCHEDULE_SLOT_PX }}
                >
                  {label}
                </span>
              ))}
            </div>
            {days.map((day) => {
              const dayKey = formatWeekParam(day)
              const dayLessons = lessonsByDay.get(dayKey) ?? []
              const isToday = isSameDay(
                toZonedTime(day, DEFAULT_TIME_ZONE),
                todayZoned
              )
              return (
                <div
                  key={dayKey}
                  className={cn(
                    "relative overflow-hidden calendar-cell",
                    isToday && "calendar-cell-today"
                  )}
                  style={{ height: gridHeight }}
                >
                  {hourLabels.map((_, i) => {
                    const hour = SCHEDULE_START_HOUR + i
                    return (
                      <button
                        key={hour}
                        type="button"
                        className={cn(
                          "absolute right-0 left-0 border-t border-border/80",
                          permissions.canCreate &&
                            "cursor-pointer hover:bg-primary/10 focus-visible:bg-primary/10 focus-visible:outline-none"
                        )}
                        style={{ top: i * SCHEDULE_SLOT_PX, height: SCHEDULE_SLOT_PX }}
                        onClick={() => handleSlotClick(dayKey, hour)}
                        aria-hidden={!permissions.canCreate}
                        tabIndex={-1}
                      />
                    )
                  })}
                  {dayLessons.map((lesson) => (
                    <LessonBlock
                      key={lesson.id}
                      lesson={lesson}
                      context={lessonContext}
                      onSelect={handleSelectLesson}
                    />
                  ))}
                </div>
              )
            })}
            </div>
          </div>
        </div>
        <CalendarLegend />
      </div>

      <p className="text-xs text-muted-foreground sm:hidden">
        Листайте таблицу влево и вправо, чтобы увидеть все дни недели.
      </p>

      <LessonDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        lesson={selectedLesson}
        draft={draftSlot}
        week={weekParam}
        courses={courses}
        students={students}
        teachers={teachers}
        permissions={permissions}
        profileId={profileId}
      />
    </div>
  )
}
