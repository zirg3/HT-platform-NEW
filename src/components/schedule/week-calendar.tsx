"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useMemo, useState } from "react"
import { parseISO } from "date-fns"
import { toZonedTime } from "date-fns-tz"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { LessonBlock } from "@/components/schedule/lesson-block"
import { LessonDialog } from "@/components/schedule/lesson-dialog"
import { WeekDatePicker } from "@/components/schedule/week-date-picker"
import { buttonVariants } from "@/components/ui/button"
import { DEFAULT_TIME_ZONE } from "@/lib/constants"
import {
  formatDayHeader,
  formatWeekParam,
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
import { cn } from "@/lib/utils"

type WeekCalendarProps = {
  weekStartIso: string
  lessons: LessonRow[]
  courses: CourseRow[]
  students: ProfileBrief[]
  teachers: ProfileBrief[]
  permissions: SchedulePermissions
  profileId: string
}

export const WeekCalendar = ({
  weekStartIso,
  lessons,
  courses,
  students,
  teachers,
  permissions,
  profileId,
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

  const gridHeight = (SCHEDULE_END_HOUR - SCHEDULE_START_HOUR) * 48

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:grid sm:grid-cols-[1fr_auto_1fr] sm:items-center">
        <div className="order-1 flex justify-center sm:order-2 sm:col-start-2">
          <WeekDatePicker weekStart={weekStart} pathname={pathname} />
        </div>

        <div className="order-2 flex items-center justify-between gap-2 sm:contents">
          

          <div className="flex items-center gap-2 sm:col-start-3 sm:justify-self-end">
            <Link
              href={`${pathname}?week=${prevWeek}`}
              className={cn(
                buttonVariants({ variant: "outline", size: "icon-sm" }),
                "sm:col-start-1 sm:justify-self-start"
              )}
              aria-label="Предыдущая неделя"
            >
              <ChevronLeft className="size-4" />
            </Link>
            <Link
              href={`${pathname}?week=${weekParam}`}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Сегодня
            </Link>
            <Link
              href={`${pathname}?week=${nextWeek}`}
              className={cn(
                buttonVariants({ variant: "outline", size: "icon-sm" })
              )}
              aria-label="Следующая неделя"
            >
              <ChevronRight className="size-4" />
            </Link>
          </div>
        </div>      </div>

      {courses.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Справочник курсов пуст. Администратор должен добавить курсы.
        </p>
      ) : null}

      <div className="overflow-x-auto rounded-lg border border-border" tabIndex={0} aria-label="Недельное расписание, прокрутите горизонтально на узком экране">
        <div className="min-w-[720px]">
          <div className="grid grid-cols-[56px_repeat(7,minmax(0,1fr))] border-b border-border bg-muted/40">
            <div className="p-2" />
            {days.map((day) => {
              const key = formatWeekParam(day)
              return (
                <div
                  key={key}
                  className="border-l border-border p-2 text-center text-xs font-medium"
                >
                  {formatDayHeader(day)}
                </div>
              )
            })}
          </div>
          <div className="grid grid-cols-[56px_repeat(7,minmax(0,1fr))]">
            <div
              className="relative border-r border-border"
              style={{ height: gridHeight }}
            >
              {hourLabels.map((label, i) => (
                <span
                  key={label}
                  className="absolute right-1 text-[10px] text-muted-foreground"
                  style={{ top: i * 48 }}
                >
                  {label}
                </span>
              ))}
            </div>
            {days.map((day) => {
              const dayKey = formatWeekParam(day)
              const dayLessons = lessonsByDay.get(dayKey) ?? []
              return (
                <div
                  key={dayKey}
                  className="relative border-l border-border"
                  style={{ height: gridHeight }}
                >
                  {hourLabels.map((_, i) => {
                    const hour = SCHEDULE_START_HOUR + i
                    return (
                      <button
                        key={hour}
                        type="button"
                        className={cn(
                          "absolute right-0 left-0 border-t border-border/60",
                          permissions.canCreate &&
                            "cursor-pointer hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none"
                        )}
                        style={{ top: i * 48, height: 48 }}
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
                      onSelect={handleSelectLesson}
                    />
                  ))}
                </div>
              )
            })}
          </div>
        </div>
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
