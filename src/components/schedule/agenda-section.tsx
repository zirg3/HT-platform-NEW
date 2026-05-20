import { AgendaWithDialog } from "@/components/schedule/agenda-with-dialog"
import type { Profile } from "@/lib/auth/session"
import { fetchAgendaLessonsForLk } from "@/lib/schedule/queries"
import type {
  CourseRow,
  ProfileBrief,
  SchedulePermissions,
} from "@/lib/schedule/types"

type AgendaSectionProps = {
  profile: Profile
  week: string
  courses: CourseRow[]
  students: ProfileBrief[]
  teachers: ProfileBrief[]
  permissions: SchedulePermissions
}

export const AgendaSection = async ({
  profile,
  week,
  courses,
  students,
  teachers,
  permissions,
}: AgendaSectionProps) => {
  if (profile.role !== "student" && profile.role !== "teacher") {
    return null
  }

  const lessons = await fetchAgendaLessonsForLk(profile.id, profile.role)

  return (
    <AgendaWithDialog
      lessons={lessons}
      week={week}
      courses={courses}
      students={students}
      teachers={teachers}
      permissions={permissions}
      profileId={profile.id}
      context={profile.role}
    />
  )
}
