import { addDays, addMinutes, parseISO } from "date-fns"
import { getPocketBase } from "@/lib/pocketbase/client"
import {
  fetchLessonsBetweenConflicts,
  fetchLessonsForWeekConflicts,
} from "@/lib/pocketbase/schedule-queries"
import { findLessonConflicts } from "@/lib/schedule/conflicts"
import { localInputToUtcIso, parseWeekParam } from "@/lib/schedule/dates"
import {
  canCompleteLessonNow,
  canRescheduleLesson,
  getSchedulePermissions,
} from "@/lib/schedule/permissions"
import { buildWeeklyStartsUtc } from "@/lib/schedule/recurrence"
import type { LessonRow } from "@/lib/schedule/types"
import { mapUserToProfile, type PocketBaseUserRecord, type Profile } from "@/types/profile"

export type ActionResult = {
  error?: string
  warning?: string
}

const getActorProfile = (): Profile => {
  const pb = getPocketBase()
  const model = pb.authStore.model
  if (!model) {
    throw new Error("Требуется вход")
  }
  return mapUserToProfile(model as unknown as PocketBaseUserRecord)
}

const writeAudit = async (
  lessonId: string,
  action: "created" | "updated" | "cancelled",
  actorId: string,
  meta: Record<string, unknown> = {}
) => {
  const pb = getPocketBase()
  await pb.collection("lesson_audit").create({
    lesson: lessonId,
    action,
    actor: actorId,
    meta,
  })
}

const replaceParticipant = async (lessonId: string, studentId: string) => {
  const pb = getPocketBase()
  const existing = await pb.collection("lesson_participants").getList(1, 50, {
    filter: `lesson = "${lessonId}"`,
  })

  for (const row of existing.items) {
    await pb.collection("lesson_participants").delete(row.id)
  }

  await pb.collection("lesson_participants").create({
    lesson: lessonId,
    profile: studentId,
  })
}

export const saveLessonAction = async (
  formData: FormData
): Promise<ActionResult> => {
  const profile = getActorProfile()
  const perms = getSchedulePermissions(profile)

  if (!perms.canCreate && !perms.canEdit) {
    return { error: "Нет прав на изменение расписания" }
  }

  const lessonId = String(formData.get("lesson_id") ?? "").trim() || undefined
  const date = String(formData.get("date") ?? "").trim()
  const time = String(formData.get("time") ?? "").trim()
  const durationMinutes = Number(formData.get("duration_minutes") ?? 60)
  const courseId = String(formData.get("course_id") ?? "").trim()
  const studentId = String(formData.get("student_id") ?? "").trim()
  const teacherId =
    String(formData.get("teacher_id") ?? "").trim() || perms.teacherId || profile.id
  const note = String(formData.get("note") ?? "").trim()
  const meetingUrlRaw = String(formData.get("meeting_url") ?? "").trim()
  const meeting_url = meetingUrlRaw || null
  const week = String(formData.get("week") ?? "").trim()
  const recurringWeekly = formData.get("recurring_weekly") === "on"
  const recurrenceUntil = String(formData.get("recurrence_until") ?? "").trim()

  if (!date || !time || !courseId || !studentId) {
    return { error: "Заполните дату, время, курс и ученика" }
  }

  if (durationMinutes < 15 || durationMinutes > 240) {
    return { error: "Длительность от 15 до 240 минут" }
  }

  const startsAt = localInputToUtcIso(date, time)
  const weekStart = parseWeekParam(week || date)
  const existingLessons = await fetchLessonsForWeekConflicts(weekStart)
  const warnings = findLessonConflicts(
    existingLessons,
    startsAt,
    durationMinutes,
    teacherId,
    studentId,
    lessonId
  )

  const pb = getPocketBase()

  if (lessonId) {
    if (!perms.canEdit) return { error: "Нет прав на редактирование" }

    await pb.collection("lessons").update(lessonId, {
      starts_at: startsAt,
      duration_minutes: durationMinutes,
      course: courseId,
      teacher: teacherId,
      note: note || "",
      meeting_url: meeting_url ?? "",
    })

    await replaceParticipant(lessonId, studentId)
    await writeAudit(lessonId, "updated", profile.id)
  } else {
    if (!perms.canCreate) return { error: "Нет прав на создание" }

    if (recurringWeekly) {
      if (!recurrenceUntil || !/^\d{4}-\d{2}-\d{2}$/.test(recurrenceUntil)) {
        return { error: "Укажите дату окончания повторения" }
      }
      if (recurrenceUntil < date) {
        return { error: "Дата окончания не раньше первого урока" }
      }

      const instances = buildWeeklyStartsUtc(date, time, recurrenceUntil)
      if (instances.length === 0) {
        return { error: "Нет занятий в выбранном диапазоне дат" }
      }

      const rangeStart = parseISO(instances[0]!)
      const rangeEndExclusive = addMinutes(
        parseISO(instances[instances.length - 1]!),
        durationMinutes + 1
      )
      const existingInRange = await fetchLessonsBetweenConflicts(
        addDays(rangeStart, -1),
        addDays(rangeEndExclusive, 2)
      )

      const syntheticBatch: LessonRow[] = []
      const allWarnings: string[] = []

      for (let i = 0; i < instances.length; i++) {
        const inst = instances[i]!
        allWarnings.push(
          ...findLessonConflicts(
            [...existingInRange, ...syntheticBatch],
            inst,
            durationMinutes,
            teacherId,
            studentId
          )
        )
        syntheticBatch.push({
          id: `batch-${i}`,
          starts_at: inst,
          duration_minutes: durationMinutes,
          course_id: courseId,
          teacher_id: teacherId,
          status: "scheduled",
          note: null,
          meeting_url: null,
          recurrence_group_id: null,
          cancelled_at: null,
          cancelled_by: null,
          cancellation_reason: null,
          rescheduled_at: null,
          rescheduled_by: null,
          original_starts_at: null,
          cancelled_by_profile: null,
          courses: null,
          teacher: null,
          homework: null,
          lesson_participants: [{ profile_id: studentId, profiles: null }],
        })
      }

      const groupId = crypto.randomUUID()

      for (const starts_at of instances) {
        const created = await pb.collection("lessons").create({
          starts_at,
          duration_minutes: durationMinutes,
          course: courseId,
          teacher: teacherId,
          note: note || "",
          meeting_url: meeting_url ?? "",
          status: "scheduled",
          recurrence_group_id: groupId,
        })

        await pb.collection("lesson_participants").create({
          lesson: created.id,
          profile: studentId,
        })

        await writeAudit(created.id, "created", profile.id, {
          recurring_weekly: true,
          group_id: groupId,
        })
      }

      const uniq = [...new Set(allWarnings)]
      return uniq.length ? { warning: uniq.join("; ") } : {}
    }

    const created = await pb.collection("lessons").create({
      starts_at: startsAt,
      duration_minutes: durationMinutes,
      course: courseId,
      teacher: teacherId,
      note: note || "",
      meeting_url: meeting_url ?? "",
      status: "scheduled",
    })

    await pb.collection("lesson_participants").create({
      lesson: created.id,
      profile: studentId,
    })

    await writeAudit(created.id, "created", profile.id)
  }

  return warnings.length ? { warning: warnings.join("; ") } : {}
}

export const cancelLessonAction = async (
  formData: FormData
): Promise<ActionResult> => {
  const profile = getActorProfile()
  const perms = getSchedulePermissions(profile)

  if (!perms.canCancel) {
    return { error: "Нет прав на отмену урока" }
  }

  const lessonId = String(formData.get("lesson_id") ?? "").trim()
  const cancellationReason = String(
    formData.get("cancellation_reason") ?? ""
  ).trim()

  if (!lessonId) return { error: "Урок не указан" }

  const pb = getPocketBase()
  await pb.collection("lessons").update(lessonId, {
    status: "cancelled",
    cancelled_at: new Date().toISOString(),
    cancelled_by: profile.id,
    cancellation_reason: cancellationReason || "",
  })

  await writeAudit(lessonId, "cancelled", profile.id, cancellationReason
    ? { reason: cancellationReason }
    : {})

  return {}
}

export const rescheduleLessonAction = async (
  formData: FormData
): Promise<ActionResult> => {
  const profile = getActorProfile()
  const lessonId = String(formData.get("lesson_id") ?? "").trim()
  const date = String(formData.get("date") ?? "").trim()
  const time = String(formData.get("time") ?? "").trim()

  if (!lessonId) return { error: "Урок не указан" }
  if (!date || !time) return { error: "Укажите новую дату и время" }

  const pb = getPocketBase()
  const lesson = await pb.collection("lessons").getOne<{
    id: string
    teacher: string
    status: string
    starts_at: string
  }>(lessonId)

  if (lesson.status !== "scheduled") {
    return { error: "Перенести можно только запланированный урок" }
  }

  if (!canRescheduleLesson(profile, lesson.teacher)) {
    return { error: "Нет прав на перенос этого урока" }
  }

  const newStartsAt = localInputToUtcIso(date, time)
  const originalStartsAt = lesson.starts_at

  await pb.collection("lessons").update(lessonId, {
    starts_at: newStartsAt,
    rescheduled_at: new Date().toISOString(),
    rescheduled_by: profile.id,
    original_starts_at: originalStartsAt,
  })

  await writeAudit(lessonId, "updated", profile.id, {
    rescheduled: true,
    from: originalStartsAt,
    to: newStartsAt,
  })

  return {}
}

export const deleteLessonAction = async (
  formData: FormData
): Promise<ActionResult> => {
  const profile = getActorProfile()
  const perms = getSchedulePermissions(profile)

  if (!perms.canEdit) {
    return { error: "Нет прав на удаление" }
  }

  const lessonId = String(formData.get("lesson_id") ?? "").trim()
  if (!lessonId) return { error: "Урок не указан" }

  const pb = getPocketBase()
  await pb.collection("lessons").delete(lessonId)

  return {}
}

export const deleteLessonSeriesAction = async (
  formData: FormData
): Promise<ActionResult> => {
  const profile = getActorProfile()
  const perms = getSchedulePermissions(profile)

  if (!perms.canEdit) {
    return { error: "Нет прав на удаление" }
  }

  const lessonId = String(formData.get("lesson_id") ?? "").trim()
  if (!lessonId) return { error: "Урок не указан" }

  const pb = getPocketBase()
  const anchor = await pb.collection("lessons").getOne<{
    id: string
    recurrence_group_id?: string
    teacher: string
  }>(lessonId)

  if (!anchor.recurrence_group_id) {
    return { error: "У этого урока нет серии повторений" }
  }

  const { items: series } = await pb.collection("lessons").getList<{
    id: string
    teacher: string
  }>(1, 500, {
    filter: `recurrence_group_id = "${anchor.recurrence_group_id}"`,
  })

  if (!series.length) return { error: "Серия не найдена" }

  if (profile.role === "teacher") {
    if (anchor.teacher !== profile.id) {
      return { error: "Нет прав на удаление этой серии" }
    }
    const foreign = series.some((l) => l.teacher !== profile.id)
    if (foreign) return { error: "Нельзя удалить серию" }
  }

  for (const row of series) {
    await pb.collection("lessons").delete(row.id)
  }

  return {}
}

export const completeLessonAction = async (
  formData: FormData
): Promise<ActionResult> => {
  const profile = getActorProfile()
  const perms = getSchedulePermissions(profile)

  if (!perms.canComplete) {
    return { error: "Нет прав на проведение урока" }
  }

  const lessonId = String(formData.get("lesson_id") ?? "").trim()
  const homeworkBody = String(formData.get("homework_body") ?? "").trim()

  if (!lessonId) return { error: "Урок не указан" }

  const pb = getPocketBase()
  const lesson = await pb.collection("lessons").getOne<{
    id: string
    teacher: string
    status: string
    starts_at: string
  }>(lessonId)

  if (lesson.status === "cancelled") {
    return { error: "Нельзя провести отменённый урок" }
  }

  if (profile.role === "teacher" && lesson.teacher !== profile.id) {
    return { error: "Нет прав на этот урок" }
  }

  if (profile.role !== "student" && !canCompleteLessonNow(lesson.starts_at)) {
    return {
      error:
        "Урок можно отметить проведённым только после времени начала занятия",
    }
  }

  await pb.collection("lessons").update(lessonId, { status: "completed" })

  const existing = await pb.collection("homework").getList(1, 1, {
    filter: `lesson = "${lessonId}"`,
  })

  if (existing.items[0]) {
    await pb.collection("homework").update(existing.items[0].id, {
      body: homeworkBody,
    })
  } else {
    await pb.collection("homework").create({
      lesson: lessonId,
      body: homeworkBody,
    })
  }

  await writeAudit(lessonId, "updated", profile.id, { completed: true })

  return {}
}
