import { useQuery } from "@tanstack/react-query"
import { getRouteApi, notFound } from "@tanstack/react-router"
import { StudentProfileAgenda } from "@/components/schedule/student-profile-agenda"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { splitLessonsByNow } from "@/lib/schedule/agenda"
import { formatCancellationSummary } from "@/lib/schedule/cancel-info"
import { formatLessonDateTime, formatWeekParam, parseWeekParam } from "@/lib/schedule/dates"
import { getSchedulePermissions } from "@/lib/schedule/permissions"
import {
  fetchCancelledLessonsForStudent,
  fetchCourses,
  fetchLessonsForTeacherAndStudent,
  fetchTeacherStudents,
} from "@/lib/schedule/queries"
import { fetchProfileById } from "@/lib/users/queries"
import { useAuth } from "@/providers/auth-provider"

const routeApi = getRouteApi("/teacher/students/$studentId")

export const TeacherStudentProfilePage = () => {
  const { studentId } = routeApi.useParams()
  const { profile: teacher } = useAuth()

  const { data, isLoading } = useQuery({
    queryKey: ["teacher-student-profile", teacher?.id, studentId],
    queryFn: async () => {
      if (!teacher) return null

      const myStudents = await fetchTeacherStudents(teacher.id)
      if (!myStudents.some((s) => s.id === studentId)) {
        return { notFound: true as const }
      }

      const studentProfile = await fetchProfileById(studentId)
      if (!studentProfile || studentProfile.role !== "student") {
        return { notFound: true as const }
      }

      const [lessons, cancelledHistory, courses] = await Promise.all([
        fetchLessonsForTeacherAndStudent(teacher.id, studentId),
        fetchCancelledLessonsForStudent(studentId, teacher.id),
        fetchCourses(),
      ])

      return { studentProfile, lessons, cancelledHistory, courses }
    },
    enabled: Boolean(teacher?.id),
  })

  if (!teacher) return null

  if (isLoading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!data || "notFound" in data) {
    throw notFound()
  }

  const { studentProfile, lessons, cancelledHistory, courses } = data
  const { past } = splitLessonsByNow(lessons)
  const completedWithHw = past.filter(
    (l) => l.status === "completed" && l.homework?.body
  )
  const weekParam = formatWeekParam(parseWeekParam())
  const permissions = getSchedulePermissions(teacher)
  const studentBrief = {
    id: studentProfile.id,
    full_name: studentProfile.full_name,
    email: studentProfile.email,
  }
  const teacherBrief = {
    id: teacher.id,
    full_name: teacher.full_name,
    email: teacher.email,
  }
  const displayName = studentProfile.full_name.trim() || studentProfile.email

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">{displayName}</h1>
        <p className="text-sm text-muted-foreground">{studentProfile.email}</p>
      </div>

      <StudentProfileAgenda
        lessons={lessons}
        week={weekParam}
        courses={courses}
        students={[studentBrief]}
        teachers={[teacherBrief]}
        permissions={permissions}
        profileId={teacher.id}
      />

      {cancelledHistory.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>История отмен</CardTitle>
            <CardDescription>
              Отменённые занятия с вами (последние {cancelledHistory.length})
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {cancelledHistory.map((lesson) => (
              <div
                key={lesson.id}
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-950"
              >
                <p className="font-medium">
                  {lesson.courses?.title ?? "Урок"} ·{" "}
                  {formatLessonDateTime(lesson.starts_at)}
                </p>
                <p className="mt-1 text-xs opacity-90">
                  {formatCancellationSummary(lesson)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {completedWithHw.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Домашние задания (проведённые уроки)</CardTitle>
            <CardDescription>
              Тексты заданий, которые вы отметили при проведении
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {completedWithHw.map((lesson) => (
              <div
                key={lesson.id}
                className="rounded-lg border border-border px-3 py-2 text-sm"
              >
                <p className="font-medium text-muted-foreground">
                  {lesson.courses?.title ?? "Урок"} · {lesson.starts_at.slice(0, 10)}
                </p>
                <p className="mt-1 whitespace-pre-wrap">{lesson.homework?.body}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
