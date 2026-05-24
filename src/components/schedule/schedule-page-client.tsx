import { useQuery, keepPreviousData } from "@tanstack/react-query"
import { useSearch } from "@tanstack/react-router"
import { SchedulePageHeader } from "@/components/schedule/schedule-page-header"
import { ScheduleWeekStats } from "@/components/schedule/schedule-week-stats"
import { WeekCalendar } from "@/components/schedule/week-calendar"
import { AgendaSectionClient } from "@/components/schedule/agenda-section-client"
import { getSchedulePermissions } from "@/lib/schedule/permissions"
import { formatWeekParam, parseWeekParam } from "@/lib/schedule/dates"
import {
  fetchScheduleReferenceData,
  fetchScheduleWeekLessons,
} from "@/lib/schedule/schedule-data-client"
import { scheduleKeys } from "@/lib/schedule/query-keys"
import type { Profile } from "@/types/profile"

type SchedulePageClientProps = {
  profile: Profile
}

export const SchedulePageClient = ({ profile }: SchedulePageClientProps) => {
  const search = useSearch({ strict: false }) as { week?: string }
  const weekStart = parseWeekParam(search.week)
  const weekParam = formatWeekParam(weekStart)
  const permissions = getSchedulePermissions(profile)

  const weekQuery = useQuery({
    queryKey: scheduleKeys.week(weekParam),
    queryFn: () => fetchScheduleWeekLessons(weekStart),
    placeholderData: keepPreviousData,
  })

  const referenceQuery = useQuery({
    queryKey: scheduleKeys.reference(profile.role, profile.id),
    queryFn: () => fetchScheduleReferenceData(profile),
  })

  const lessons = weekQuery.data ?? []
  const reference = referenceQuery.data
  const isInitialLoad =
    referenceQuery.isLoading || (weekQuery.isLoading && lessons.length === 0)
  const isWeekLoading = weekQuery.isFetching && !weekQuery.isLoading

  const lessonContext = profile.role === "student" ? "student" : "teacher"
  const showAgenda = profile.role === "student" || profile.role === "teacher"

  const calendarProps = {
    weekStartIso: weekStart.toISOString(),
    lessons: reference ? lessons : [],
    courses: reference?.courses ?? [],
    students: reference?.students ?? [],
    teachers: reference?.teachers ?? [],
    permissions,
    profileId: profile.id,
    lessonContext,
    isGridLoading: isInitialLoad || isWeekLoading,
  } as const

  if (isInitialLoad && !reference) {
    return (
      <div className="space-y-6">
        <SchedulePageHeader profile={profile} />
        <section className="overflow-hidden rounded-lg border border-border/70 bg-white/30 p-3 sm:p-4">
          <WeekCalendar {...calendarProps} />
        </section>
      </div>
    )
  }

  if (!reference) {
    return null
  }

  const { courses, students, teachers } = reference

  return (
    <div className="space-y-6">
      <SchedulePageHeader profile={profile} />

      <section className="overflow-hidden rounded-lg border border-border/70 bg-white/30 p-3 sm:p-4">
        <WeekCalendar
          weekStartIso={weekStart.toISOString()}
          lessons={lessons}
          courses={courses}
          students={students}
          teachers={teachers}
          permissions={permissions}
          profileId={profile.id}
          lessonContext={lessonContext}
          isGridLoading={isWeekLoading}
        />
      </section>

      {showAgenda ? (
        <div className="grid gap-4 lg:grid-cols-3 lg:items-start">
          <AgendaSectionClient
            profile={profile}
            week={weekParam}
            courses={courses}
            students={students}
            teachers={teachers}
            permissions={permissions}
          />
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
