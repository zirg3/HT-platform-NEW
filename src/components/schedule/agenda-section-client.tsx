import { useQuery } from "@tanstack/react-query"
import { AgendaWithDialog } from "@/components/schedule/agenda-with-dialog"
import { fetchAgendaLessonsForLk } from "@/lib/pocketbase/schedule-queries"
import { scheduleKeys } from "@/lib/schedule/query-keys"
import type {
  CourseRow,
  ProfileBrief,
  SchedulePermissions,
} from "@/lib/schedule/types"
import type { Profile } from "@/types/profile"

type AgendaSectionClientProps = {
  profile: Profile
  week: string
  courses: CourseRow[]
  students: ProfileBrief[]
  teachers: ProfileBrief[]
  permissions: SchedulePermissions
}

export const AgendaSectionClient = ({
  profile,
  week,
  courses,
  students,
  teachers,
  permissions,
}: AgendaSectionClientProps) => {
  if (profile.role !== "student" && profile.role !== "teacher") {
    return null
  }

  const { data: lessons = [], isLoading } = useQuery({
    queryKey: scheduleKeys.agenda(profile.id),
    queryFn: () =>
      fetchAgendaLessonsForLk(
        profile.id,
        profile.role as "student" | "teacher"
      ),
  })

  if (isLoading) {
    return null
  }

  return (
    <AgendaWithDialog
      lessons={lessons}
      week={week}
      courses={courses}
      students={students}
      teachers={teachers}
      permissions={permissions}
      profileId={profile.id}
      context={profile.role as "student" | "teacher"}
    />
  )
}
