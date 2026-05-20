import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { formatCancellationSummary } from "@/lib/schedule/cancel-info"
import { formatLessonDateTime } from "@/lib/schedule/dates"
import { safeLessonMeetingHref } from "@/lib/schedule/meeting-link"
import type { LessonRow } from "@/lib/schedule/types"

type AgendaLessonListsProps = {
  upcoming: LessonRow[]
  past: LessonRow[]
  subtitle?: string
  emptyHint?: string
  /** "student" — в строке показывать преподавателя; "teacher" — ученика */
  context: "student" | "teacher"
}

const statusLabel = (lesson: LessonRow) => {
  if (lesson.status === "cancelled") return "Отменён"
  if (lesson.status === "completed") return "Проведён"
  return "Запланирован"
}

const statusVariant = (
  lesson: LessonRow
): "default" | "secondary" | "destructive" | "outline" => {
  if (lesson.status === "cancelled") return "secondary"
  if (lesson.status === "completed") return "outline"
  return "default"
}

const counterpartyLine = (lesson: LessonRow, context: "student" | "teacher") => {
  if (context === "student") {
    const t = lesson.teacher
    return t ? `Преподаватель: ${t.full_name?.trim() || t.email}` : null
  }
  const p = lesson.lesson_participants[0]?.profiles
  return p ? `Ученик: ${p.full_name?.trim() || p.email}` : null
}

const LessonStack = ({
  lessons,
  context,
}: {
  lessons: LessonRow[]
  context: "student" | "teacher"
}) => {
  if (lessons.length === 0) {
    return <p className="text-sm text-muted-foreground">Пока пусто</p>
  }

  return (
    <ul className="space-y-2" role="list">
      {lessons.map((lesson) => {
        const counterparty = counterpartyLine(lesson, context)
        const href = safeLessonMeetingHref(lesson.meeting_url)
        return (
          <li
            key={lesson.id}
            className="rounded-lg border border-border px-3 py-2 text-sm"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium">
                {formatLessonDateTime(lesson.starts_at)}
              </span>
              <Badge variant={statusVariant(lesson)} className="text-[10px]">
                {statusLabel(lesson)}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {lesson.courses?.title ?? "Без курса"}
            </p>
            {counterparty ? (
              <p className="text-xs text-muted-foreground">{counterparty}</p>
            ) : null}
            {lesson.status === "cancelled" ? (
              <p className="mt-1 text-xs text-muted-foreground">
                {formatCancellationSummary(lesson) ?? "Отменён"}
              </p>
            ) : null}
            {lesson.homework?.body && lesson.status === "completed" ? (
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                ДЗ: {lesson.homework.body}
              </p>
            ) : null}
            {lesson.meeting_url ? (
              <p className="mt-1 text-xs">
                {href ? (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline underline-offset-2"
                  >
                    Ссылка на урок
                  </a>
                ) : (
                  <span className="text-muted-foreground break-all">
                    {lesson.meeting_url}
                  </span>
                )}
              </p>
            ) : null}
          </li>
        )
      })}
    </ul>
  )
}

export const AgendaLessonLists = ({
  upcoming,
  past,
  subtitle,
  emptyHint,
  context,
}: AgendaLessonListsProps) => (
  <div className="space-y-6">
    {subtitle ? (
      <p className="text-sm text-muted-foreground">{subtitle}</p>
    ) : null}
    {emptyHint ? (
      <p className="text-xs text-muted-foreground">{emptyHint}</p>
    ) : null}
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Предстоящие</CardTitle>
          <CardDescription>Ближайшие занятия</CardDescription>
        </CardHeader>
        <CardContent>
          <LessonStack lessons={upcoming} context={context} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Прошедшие</CardTitle>
          <CardDescription>История занятий</CardDescription>
        </CardHeader>
        <CardContent>
          <LessonStack lessons={past} context={context} />
        </CardContent>
      </Card>
    </div>
  </div>
)
