"use client"

import { addWeeks, format, parseISO } from "date-fns"
import { useEffect, useMemo, useState, useTransition } from "react"
import {
  cancelLessonAction,
  completeLessonAction,
  deleteLessonAction,
  deleteLessonSeriesAction,
  saveLessonAction,
} from "@/app/actions/schedule"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import {
  DEFAULT_LESSON_DURATION,
  formatLessonTime,
  utcIsoToLocalInputs,
} from "@/lib/schedule/dates"
import { MAX_WEEKLY_OCCURRENCES } from "@/lib/schedule/recurrence"
import { formatCancellationSummary } from "@/lib/schedule/cancel-info"
import { safeLessonMeetingHref } from "@/lib/schedule/meeting-link"
import type {
  CourseRow,
  LessonRow,
  ProfileBrief,
  SchedulePermissions,
} from "@/lib/schedule/types"

const selectClassName = cn(
  "flex h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none",
  "disabled:pointer-events-none disabled:opacity-50"
)

type LessonDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  lesson: LessonRow | null
  draft?: { date: string; time: string } | null
  week: string
  courses: CourseRow[]
  students: ProfileBrief[]
  teachers: ProfileBrief[]
  permissions: SchedulePermissions
  profileId: string
}

export const LessonDialog = ({
  open,
  onOpenChange,
  lesson,
  draft,
  week,
  courses,
  students,
  teachers,
  permissions,
  profileId,
}: LessonDialogProps) => {
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ error?: string; warning?: string }>({})
  const [weeklyRepeat, setWeeklyRepeat] = useState(false)

  const isEdit = Boolean(lesson)
  const isCancelled = lesson?.status === "cancelled"
  const isCompleted = lesson?.status === "completed"
  const canSave =
    (isEdit ? permissions.canEdit : permissions.canCreate) &&
    !isCancelled &&
    !isCompleted
  const canComplete =
    isEdit &&
    permissions.canComplete &&
    !isCancelled &&
    !isCompleted

  const defaults = lesson
    ? utcIsoToLocalInputs(lesson.starts_at)
    : { date: draft?.date ?? week, time: draft?.time ?? "10:00" }

  const recurrenceDefaultUntil = useMemo(
    () =>
      format(
        addWeeks(parseISO(`${defaults.date}T12:00:00`), 12),
        "yyyy-MM-dd"
      ),
    [defaults.date]
  )

  const meetingHref = lesson ? safeLessonMeetingHref(lesson.meeting_url) : null
  const cancelSummary = lesson ? formatCancellationSummary(lesson) : null

  const canDeleteLesson =
    Boolean(lesson) &&
    permissions.canEdit &&
    (!permissions.teacherId || profileId === lesson?.teacher_id)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setMessage({})
    const formData = new FormData(e.currentTarget)
    formData.set("week", week)
    if (lesson) formData.set("lesson_id", lesson.id)

    startTransition(async () => {
      const result = await saveLessonAction(formData)
      setMessage(result)
      if (!result.error) onOpenChange(false)
    })
  }

  const handleCancelLesson = () => {
    if (!lesson) return
    const fd = new FormData()
    fd.set("lesson_id", lesson.id)
    fd.set("week", week)
    startTransition(async () => {
      const result = await cancelLessonAction(fd)
      setMessage(result)
      if (!result.error) onOpenChange(false)
    })
  }

  const handleDeleteSeries = () => {
    if (!lesson?.recurrence_group_id) return
    if (
      !window.confirm(
        "Удалить все занятия этой еженедельной серии? Действие нельзя отменить."
      )
    ) {
      return
    }
    const fd = new FormData()
    fd.set("lesson_id", lesson.id)
    fd.set("week", week)
    startTransition(async () => {
      const result = await deleteLessonSeriesAction(fd)
      setMessage(result)
      if (!result.error) onOpenChange(false)
    })
  }

  const handleDelete = () => {
    if (!lesson) return
    if (!window.confirm("Удалить этот урок?")) return
    const fd = new FormData()
    fd.set("lesson_id", lesson.id)
    fd.set("week", week)
    startTransition(async () => {
      const result = await deleteLessonAction(fd)
      setMessage(result)
      if (!result.error) onOpenChange(false)
    })
  }

  const handleComplete = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!lesson) return
    setMessage({})
    const formData = new FormData(e.currentTarget)
    formData.set("lesson_id", lesson.id)
    formData.set("week", week)
    startTransition(async () => {
      const result = await completeLessonAction(formData)
      setMessage(result)
      if (!result.error) onOpenChange(false)
    })
  }

  useEffect(() => {
    if (open) {
      setMessage({})
      setWeeklyRepeat(false)
    }
  }, [open, lesson?.id])

  const defaultTeacher =
    lesson?.teacher_id ?? permissions.teacherId ?? teachers[0]?.id ?? ""
  const defaultStudent =
    lesson?.lesson_participants[0]?.profile_id ?? students[0]?.id ?? ""
  const defaultCourse = lesson?.course_id ?? courses[0]?.id ?? ""

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto bg-background sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Урок" : "Новый урок"}</DialogTitle>
          <DialogDescription>
            {isEdit && lesson
              ? `${formatLessonTime(lesson.starts_at)} · ${lesson.courses?.title ?? ""}`
              : "Заполните поля и сохраните"}
          </DialogDescription>
        </DialogHeader>

        {isCancelled ? (
          <Badge variant="secondary">Урок отменён</Badge>
        ) : null}
        {isCompleted ? (
          <Badge variant="secondary">Проведён</Badge>
        ) : null}
        {lesson?.recurrence_group_id ? (
          <Badge variant="outline">Серия занятий</Badge>
        ) : null}

        {isCancelled && cancelSummary ? (
          <p
            className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground"
            role="status"
          >
            {cancelSummary}
          </p>
        ) : null}

        {lesson?.meeting_url ? (
          <div className="space-y-2 rounded-lg border border-border p-3 text-sm">
            <p className="font-medium">Ссылка для подключения</p>
            {meetingHref ? (
              <a
                href={meetingHref}
                target="_blank"
                rel="noopener noreferrer"
                className="break-all text-primary underline underline-offset-2"
              >
                {lesson.meeting_url}
              </a>
            ) : (
              <p className="break-all text-muted-foreground">{lesson.meeting_url}</p>
            )}
          </div>
        ) : null}

        {message.error ? (
          <Alert variant="destructive">
            <AlertDescription>{message.error}</AlertDescription>
          </Alert>
        ) : null}
        {message.warning ? (
          <Alert>
            <AlertDescription>{message.warning}</AlertDescription>
          </Alert>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="date">Дата</Label>
              <Input
                id="date"
                name="date"
                type="date"
                defaultValue={defaults.date}
                required
                disabled={!canSave || isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Время</Label>
              <Input
                id="time"
                name="time"
                type="time"
                defaultValue={defaults.time}
                required
                disabled={!canSave || isPending}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="duration_minutes">Длительность (мин)</Label>
            <Input
              id="duration_minutes"
              name="duration_minutes"
              type="number"
              min={15}
              max={240}
              step={15}
              defaultValue={lesson?.duration_minutes ?? DEFAULT_LESSON_DURATION}
              disabled={!canSave || isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="course_id">Курс</Label>
            <select
              id="course_id"
              name="course_id"
              className={selectClassName}
              defaultValue={defaultCourse}
              required
              disabled={!canSave || isPending || courses.length === 0}
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
          {teachers.length > 1 ? (
            <div className="space-y-2">
              <Label htmlFor="teacher_id">Преподаватель</Label>
              <select
                id="teacher_id"
                name="teacher_id"
                className={selectClassName}
                defaultValue={defaultTeacher}
                disabled={!canSave || isPending}
              >
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.full_name || t.email}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <input type="hidden" name="teacher_id" value={defaultTeacher} />
          )}
          <div className="space-y-2">
            <Label htmlFor="student_id">Ученик</Label>
            <select
              id="student_id"
              name="student_id"
              className={selectClassName}
              defaultValue={defaultStudent}
              required
              disabled={!canSave || isPending || students.length === 0}
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.full_name || s.email}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="meeting_url">Ссылка для подключения</Label>
            <Input
              id="meeting_url"
              name="meeting_url"
              type="text"
              inputMode="url"
              autoComplete="off"
              placeholder="https://… (Zoom, Телемост, Meet)"
              defaultValue={lesson?.meeting_url ?? ""}
              disabled={!canSave || isPending}
            />
            <p className="text-xs text-muted-foreground">
              Видна ученику и преподавателю в карточке урока
            </p>
          </div>
          {!isEdit && canSave ? (
            <div className="space-y-3 rounded-lg border border-border p-3">
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="recurring_weekly"
                  name="recurring_weekly"
                  value="on"
                  checked={weeklyRepeat}
                  onChange={(e) => setWeeklyRepeat(e.target.checked)}
                  disabled={isPending}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-input"
                  aria-describedby="recurring-hint"
                />
                <div className="space-y-0.5">
                  <Label htmlFor="recurring_weekly" className="cursor-pointer font-normal">
                    Каждую неделю в этот день и время
                  </Label>
                  <p id="recurring-hint" className="text-xs text-muted-foreground">
                    Иначе создаётся один разовый урок на выбранную дату
                  </p>
                </div>
              </div>
              {weeklyRepeat ? (
                <div className="space-y-2">
                  <Label htmlFor="recurrence_until">Повторять до даты включительно</Label>
                  <Input
                    id="recurrence_until"
                    name="recurrence_until"
                    type="date"
                    required
                    min={defaults.date}
                    defaultValue={recurrenceDefaultUntil}
                    disabled={isPending}
                  />
                  <p className="text-xs text-muted-foreground">
                    Не больше {MAX_WEEKLY_OCCURRENCES} занятий за одно создание
                  </p>
                </div>
              ) : null}
            </div>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="note">Заметка</Label>
            <Textarea
              id="note"
              name="note"
              rows={2}
              defaultValue={lesson?.note ?? ""}
              disabled={!canSave || isPending}
            />
          </div>
          {canSave ? (
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="submit" disabled={isPending}>
                {isPending ? "Сохранение…" : "Сохранить"}
              </Button>
            </DialogFooter>
          ) : null}
        </form>

        {isCompleted && lesson?.homework?.body ? (
          <div className="space-y-1 rounded-lg border border-border p-3 text-sm">
            <p className="font-medium">Домашнее задание</p>
            <p className="whitespace-pre-wrap text-muted-foreground">
              {lesson.homework.body}
            </p>
          </div>
        ) : null}

        {canComplete ? (
          <form onSubmit={handleComplete} className="space-y-3 rounded-lg border border-border p-3">
            <p className="text-sm font-medium">Провести урок</p>
            <div className="space-y-2">
              <Label htmlFor="homework_body">Домашнее задание</Label>
              <Textarea
                id="homework_body"
                name="homework_body"
                rows={3}
                placeholder="Текст задания для ученика"
                defaultValue={lesson?.homework?.body ?? ""}
                disabled={isPending}
              />
            </div>
            <Button type="submit" variant="secondary" disabled={isPending}>
              Отметить проведённым
            </Button>
          </form>
        ) : null}

        {isEdit && lesson && permissions.canCancel && !isCancelled && !isCompleted ? (
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={isPending}
            onClick={handleCancelLesson}
          >
            Отменить урок
          </Button>
        ) : null}

        {isEdit &&
        lesson &&
        canDeleteLesson &&
        lesson.recurrence_group_id ? (
          <Button
            type="button"
            variant="destructive"
            className="w-full border-destructive/50 bg-transparent text-destructive hover:bg-destructive/10"
            disabled={isPending}
            onClick={handleDeleteSeries}
          >
            Удалить всю серию
          </Button>
        ) : null}

        {isEdit && canDeleteLesson ? (
          <Button
            type="button"
            variant="destructive"
            className="w-full"
            disabled={isPending}
            onClick={handleDelete}
          >
            Удалить урок
          </Button>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

