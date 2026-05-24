import { Suspense } from "react"
import { AgendaSection } from "@/components/schedule/agenda-section"
import { AgendaSectionSkeleton } from "@/components/schedule/agenda-section-skeleton"
import { SchedulePageHeader } from "@/components/schedule/schedule-page-header"
import { ScheduleWeekStats } from "@/components/schedule/schedule-week-stats"
import { WeekCalendar } from "@/components/schedule/week-calendar"
import type { Profile } from "@/lib/auth/session"
import { formatWeekParam, parseWeekParam } from "@/lib/schedule/dates"
import { getSchedulePermissions } from "@/lib/schedule/permissions"
import {
  fetchScheduleReferenceData,
  fetchScheduleWeekLessons,
} from "@/lib/schedule/schedule-data"

type SchedulePageProps = {
  profile: Profile
  week?: string
}

export const SchedulePage = async ({ profile, week }: SchedulePageProps) => {
  const weekStart = parseWeekParam(week)
  const weekParam = formatWeekParam(weekStart)
  const permissions = getSchedulePermissions(profile)

  const [lessons, reference] = await Promise.all([
    fetchScheduleWeekLessons(weekStart),
    fetchScheduleReferenceData(profile),
  ])

  const { courses, students, teachers } = reference

  const lessonContext =
    profile.role === "student" ? "student" : "teacher"

  const showAgenda =
    profile.role === "student" || profile.role === "teacher"

  return (
    <div className="space-y-6">
      <SchedulePageHeader profile={profile} />

      <section className="overflow-hidden rounded-2xl border border-border/70 bg-white/30 p-3 sm:p-4">
        <WeekCalendar
          weekStartIso={weekStart.toISOString()}
          lessons={lessons}
          courses={courses}
          students={students}
          teachers={teachers}
          permissions={permissions}
          profileId={profile.id}
          lessonContext={lessonContext}
        />
      </section>

      {showAgenda ? (
        <div className="grid gap-4 lg:grid-cols-3 lg:items-start">
          <Suspense fallback={<AgendaSectionSkeleton />}>
            <AgendaSection
              profile={profile}
              week={weekParam}
              courses={courses}
              students={students}
              teachers={teachers}
              permissions={permissions}
            />
          </Suspense>
          <ScheduleWeekStats lessons={lessons} />
        </div>
      ) : (
        <ScheduleWeekStats lessons={lessons} />
      )}

      <p className="text-xs text-muted-foreground">
        Неделя с {weekParam}. Часовой пояс: Europe/Moscow.
        {permissions.canCreate
          ? " Клик по ячейке — новый урок; по карточке — детали."
          : " Нажмите урок, чтобы открыть карточку."}
      </p>
    </div>
  )
}
