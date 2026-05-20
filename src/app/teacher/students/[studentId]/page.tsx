import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { AgendaLessonLists } from "@/components/schedule/agenda-lesson-lists"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { splitLessonsByNow } from "@/lib/schedule/agenda"
import {
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
  const { upcoming, past } = splitLessonsByNow(lessons)
  const completedWithHw = past.filter(
    (l) => l.status === "completed" && l.homework?.body
  )

  const displayName =
    studentProfile.full_name.trim() || studentProfile.email

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">{displayName}</h1>
        <p className="text-sm text-muted-foreground">{studentProfile.email}</p>
      </div>

      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold">Расписание с вами</h2>
          <p className="text-sm text-muted-foreground">
            Общие уроки за ±1 год. Календарь недели — на главной преподавателя.
          </p>
        </div>
        <AgendaLessonLists upcoming={upcoming} past={past} context="teacher" />
      </section>

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
