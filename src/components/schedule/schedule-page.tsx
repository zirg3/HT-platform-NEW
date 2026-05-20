import { AgendaSection } from "@/components/schedule/agenda-section"
import { WeekCalendar } from "@/components/schedule/week-calendar"
import type { Profile } from "@/lib/auth/session"
import { formatWeekParam, parseWeekParam } from "@/lib/schedule/dates"
import { getSchedulePermissions } from "@/lib/schedule/permissions"
import {
  fetchAllStudents,
  fetchCourses,
  fetchLessonsForWeek,
  fetchTeacherStudents,
  fetchTeachers,
} from "@/lib/schedule/queries"
type SchedulePageProps = {
  profile: Profile
  week?: string
}

export const SchedulePage = async ({ profile, week }: SchedulePageProps) => {
  const weekStart = parseWeekParam(week)
  const weekParam = formatWeekParam(weekStart)
  const permissions = getSchedulePermissions(profile)

  const [lessons, courses] = await Promise.all([
    fetchLessonsForWeek(weekStart),
    fetchCourses(),
  ])

  let students = await fetchAllStudents()
  let teachers = await fetchTeachers()

  if (profile.role === "teacher") {
    students = await fetchTeacherStudents(profile.id)
    teachers = [
      {
        id: profile.id,
        full_name: profile.full_name,
        email: profile.email,
      },
    ]
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4">
      <WeekCalendar
        weekStartIso={weekStart.toISOString()}
        lessons={lessons}
        courses={courses}
        students={students}
        teachers={teachers}
        permissions={permissions}
        profileId={profile.id}
      />
      {profile.role === "student" || profile.role === "teacher" ? (
        <AgendaSection
          profile={profile}
          week={weekParam}
          courses={courses}
          students={students}
          teachers={teachers}
          permissions={permissions}
        />
      ) : null}
      <p className="text-xs text-muted-foreground">
        Неделя с {weekParam}. Часовой пояс: Europe/Moscow.
        {permissions.canCreate
          ? " Клик по ячейке календаря — новый урок; по блоку или строке списка — карточка урока."
          : " Нажмите урок в календаре или в списке ниже, чтобы открыть карточку и при необходимости отменить."}
      </p>
    </div>
  )
}
