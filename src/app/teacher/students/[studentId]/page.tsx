import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { StudentProfileAgenda } from "@/components/schedule/student-profile-agenda"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { formatCancellationSummary } from "@/lib/schedule/cancel-info"
import { splitLessonsByNow } from "@/lib/schedule/agenda"
import { formatLessonDateTime, formatWeekParam, parseWeekParam } from "@/lib/schedule/dates"
import { getSchedulePermissions } from "@/lib/schedule/permissions"
import {
  fetchCancelledLessonsForStudent,
  fetchCourses,
  fetchLessonsForTeacherAndStudent,
  fetchTeacherStudents,
} from "@/lib/schedule/queries"
import { fetchProfileById } from "@/lib/users/queries"
import { requireRole } from "@/lib/auth/session"

type TeacherStudentProfilePageProps = {
  params: Promise<{ studentId: string }>
}

export async function generateMetadata({
  params,
}: TeacherStudentProfilePageProps): Promise<Metadata> {
  const { studentId } = await params
  const profile = await fetchProfileById(studentId)
  const name = profile?.full_name?.trim() || profile?.email || "Ученик"
  return { title: `${name} · профиль` }
}

export default async function TeacherStudentProfilePage({
  params,
}: TeacherStudentProfilePageProps) {
  const teacher = await requireRole("teacher")
  const { studentId } = await params

  const myStudents = await fetchTeacherStudents(teacher.id)
  if (!myStudents.some((s) => s.id === studentId)) {
    notFound()
  }

  const studentProfile = await fetchProfileById(studentId)
  if (!studentProfile || studentProfile.role !== "student") {
    notFound()
  }

  const lessons = await fetchLessonsForTeacherAndStudent(teacher.id, studentId)
  const [cancelledHistory, courses] = await Promise.all([
    fetchCancelledLessonsForStudent(studentId, teacher.id),
    fetchCourses(),
  ])
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

  const displayName =
    studentProfile.full_name.trim() || studentProfile.email

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
