"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { parseISO } from "date-fns"
import { toZonedTime } from "date-fns-tz"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { LessonBlock } from "@/components/schedule/lesson-block"
import { LessonDialog } from "@/components/schedule/lesson-dialog"
import { WeekDatePicker } from "@/components/schedule/week-date-picker"
import { Button } from "@/components/ui/button"
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
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2 sm:gap-3">
        <WeekDatePicker weekStart={weekStart} pathname={pathname} />

        <div className="flex items-center justify-end gap-2">
          <Link href={`${pathname}?week=${prevWeek}`}>
            <Button variant="outline" size="icon-sm" type="button" aria-label="Предыдущая неделя">
              <ChevronLeft className="size-4" />
            </Button>
          </Link>
          <Link href={`${pathname}?week=${weekParam}`}>
            <Button variant="outline" size="sm" type="button">
              Сегодня
            </Button>
          </Link>
          <Link href={`${pathname}?week=${nextWeek}`}>
            <Button variant="outline" size="icon-sm" type="button" aria-label="Следующая неделя">
              <ChevronRight className="size-4" />
            </Button>
          </Link>
        </div>
      </div>

      {courses.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Справочник курсов пуст. Администратор должен добавить курсы.
        </p>
      ) : null}

      <div className="overflow-x-auto rounded-lg border border-border">
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
                        aria-label={`Создать урок ${dayKey} ${hour}:00`}
                        tabIndex={permissions.canCreate ? 0 : -1}
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
