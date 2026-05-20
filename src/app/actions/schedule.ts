"use server"

import { addDays, addMinutes, parseISO } from "date-fns"
import { revalidatePath } from "next/cache"
import { requireAuth } from "@/lib/auth/session"
import { findLessonConflicts } from "@/lib/schedule/conflicts"
import { localInputToUtcIso, parseWeekParam } from "@/lib/schedule/dates"
import { getSchedulePermissions } from "@/lib/schedule/permissions"
import {
  fetchLessonsBetween,
  fetchLessonsForWeek,
} from "@/lib/schedule/queries"
import { buildWeeklyStartsUtc } from "@/lib/schedule/recurrence"
import type { LessonRow } from "@/lib/schedule/types"
import { createClient } from "@/lib/supabase/server"

export type ActionResult = {
  error?: string
  warning?: string
}

const revalidateSchedule = (week?: string) => {
  revalidatePath("/teacher")
  revalidatePath("/student")
  revalidatePath("/manager")
  revalidatePath("/admin")
  if (week) revalidatePath(`/teacher?week=${week}`)
}

export const saveLessonAction = async (
  formData: FormData
): Promise<ActionResult> => {
  const profile = await requireAuth()
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
  const existingLessons = await fetchLessonsForWeek(weekStart)
  const warnings = findLessonConflicts(
    existingLessons,
    startsAt,
    durationMinutes,
    teacherId,
    studentId,
    lessonId
  )

  const supabase = await createClient()

  if (lessonId) {
    if (!perms.canEdit) return { error: "Нет прав на редактирование" }

    const { error } = await supabase
      .from("lessons")
      .update({
        starts_at: startsAt,
        duration_minutes: durationMinutes,
        course_id: courseId,
        teacher_id: teacherId,
        note: note || null,
        meeting_url,
      })
      .eq("id", lessonId)

    if (error) return { error: error.message }

    await supabase.from("lesson_participants").delete().eq("lesson_id", lessonId)
    const { error: partError } = await supabase
      .from("lesson_participants")
      .insert({ lesson_id: lessonId, profile_id: studentId })

    if (partError) return { error: partError.message }

    await supabase.from("lesson_audit").insert({
      lesson_id: lessonId,
      action: "updated",
      actor_id: profile.id,
    })
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

      const rangeStart = parseISO(instances[0])
      const rangeEndExclusive = addMinutes(
        parseISO(instances[instances.length - 1]!),
        durationMinutes + 1
      )
      const existingInRange = await fetchLessonsBetween(
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
          cancelled_by_profile: null,
          courses: null,
          teacher: null,
          homework: null,
          lesson_participants: [
            { profile_id: studentId, profiles: null },
          ],
        })
      }

      const groupId = crypto.randomUUID()
      const rows = instances.map((starts_at) => ({
        starts_at,
        duration_minutes: durationMinutes,
        course_id: courseId,
        teacher_id: teacherId,
        note: note || null,
        meeting_url,
        status: "scheduled" as const,
        recurrence_group_id: groupId,
      }))

      const { data: created, error } = await supabase
        .from("lessons")
        .insert(rows)
        .select("id")

      if (error || !created?.length) {
        return { error: error?.message ?? "Не удалось создать серию уроков" }
      }

      for (const row of created) {
        const { error: partError } = await supabase
          .from("lesson_participants")
          .insert({ lesson_id: row.id, profile_id: studentId })

        if (partError) return { error: partError.message }

        await supabase.from("lesson_audit").insert({
          lesson_id: row.id,
          action: "created",
          actor_id: profile.id,
          meta: { recurring_weekly: true, group_id: groupId },
        })
      }

      revalidateSchedule(week)
      const uniq = [...new Set(allWarnings)]
      return uniq.length ? { warning: uniq.join("; ") } : {}
    }

    const { data: lesson, error } = await supabase
      .from("lessons")
      .insert({
        starts_at: startsAt,
        duration_minutes: durationMinutes,
        course_id: courseId,
        teacher_id: teacherId,
        note: note || null,
        meeting_url,
        status: "scheduled",
      })
      .select("id")
      .single()

    if (error || !lesson) return { error: error?.message ?? "Не удалось создать урок" }

    const { error: partError } = await supabase
      .from("lesson_participants")
      .insert({ lesson_id: lesson.id, profile_id: studentId })

    if (partError) return { error: partError.message }

    await supabase.from("lesson_audit").insert({
      lesson_id: lesson.id,
      action: "created",
      actor_id: profile.id,
    })
  }

  revalidateSchedule(week)
  return warnings.length ? { warning: warnings.join("; ") } : {}
}

export const cancelLessonAction = async (
  formData: FormData
): Promise<ActionResult> => {
  const profile = await requireAuth()
  const perms = getSchedulePermissions(profile)

  if (!perms.canCancel) {
    return { error: "Нет прав на отмену урока" }
  }

  const lessonId = String(formData.get("lesson_id") ?? "").trim()
  const week = String(formData.get("week") ?? "").trim()

  if (!lessonId) return { error: "Урок не указан" }

  const supabase = await createClient()
  const { error } = await supabase
    .from("lessons")
    .update({
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
      cancelled_by: profile.id,
    })
    .eq("id", lessonId)

  if (error) return { error: error.message }

  await supabase.from("lesson_audit").insert({
    lesson_id: lessonId,
    action: "cancelled",
    actor_id: profile.id,
  })

  revalidateSchedule(week)
  return {}
}

export const deleteLessonAction = async (
  formData: FormData
): Promise<ActionResult> => {
  const profile = await requireAuth()
  const perms = getSchedulePermissions(profile)

  if (!perms.canEdit) {
    return { error: "Нет прав на удаление" }
  }

  const lessonId = String(formData.get("lesson_id") ?? "").trim()
  const week = String(formData.get("week") ?? "").trim()

  if (!lessonId) return { error: "Урок не указан" }

  const supabase = await createClient()
  const { error } = await supabase.from("lessons").delete().eq("id", lessonId)

  if (error) return { error: error.message }

  revalidateSchedule(week)
  return {}
}

export const deleteLessonSeriesAction = async (
  formData: FormData
): Promise<ActionResult> => {
  const profile = await requireAuth()
  const perms = getSchedulePermissions(profile)

  if (!perms.canEdit) {
    return { error: "Нет прав на удаление" }
  }

  const lessonId = String(formData.get("lesson_id") ?? "").trim()
  const week = String(formData.get("week") ?? "").trim()
  if (!lessonId) return { error: "Урок не указан" }

  const supabase = await createClient()
  const { data: anchor, error: fetchError } = await supabase
    .from("lessons")
    .select("id, recurrence_group_id, teacher_id")
    .eq("id", lessonId)
    .single()

  if (fetchError || !anchor) {
    return { error: fetchError?.message ?? "Урок не найден" }
  }

  if (!anchor.recurrence_group_id) {
    return { error: "У этого урока нет серии повторений" }
  }

  if (profile.role === "teacher" && anchor.teacher_id !== profile.id) {
    return { error: "Нет прав на удаление этой серии" }
  }

  const { data: series, error: seriesError } = await supabase
    .from("lessons")
    .select("id, teacher_id")
    .eq("recurrence_group_id", anchor.recurrence_group_id)

  if (seriesError) return { error: seriesError.message }
  if (!series?.length) return { error: "Серия не найдена" }

  if (profile.role === "teacher") {
    const foreign = series.some((l) => l.teacher_id !== profile.id)
    if (foreign) return { error: "Нельзя удалить серию" }
  }

  const { error } = await supabase
    .from("lessons")
    .delete()
    .eq("recurrence_group_id", anchor.recurrence_group_id)

  if (error) return { error: error.message }

  revalidateSchedule(week)
  return {}
}

export const completeLessonAction = async (
  formData: FormData
): Promise<ActionResult> => {
  const profile = await requireAuth()
  const perms = getSchedulePermissions(profile)

  if (!perms.canComplete) {
    return { error: "Нет прав на проведение урока" }
  }

  const lessonId = String(formData.get("lesson_id") ?? "").trim()
  const homeworkBody = String(formData.get("homework_body") ?? "").trim()
  const week = String(formData.get("week") ?? "").trim()

  if (!lessonId) return { error: "Урок не указан" }

  const supabase = await createClient()

  const { data: lesson, error: fetchError } = await supabase
    .from("lessons")
    .select("id, teacher_id, status")
    .eq("id", lessonId)
    .single()

  if (fetchError || !lesson) {
    return { error: fetchError?.message ?? "Урок не найден" }
  }

  if (lesson.status === "cancelled") {
    return { error: "Нельзя провести отменённый урок" }
  }

  if (profile.role === "teacher" && lesson.teacher_id !== profile.id) {
    return { error: "Нет прав на этот урок" }
  }

  const { error: statusError } = await supabase
    .from("lessons")
    .update({ status: "completed" })
    .eq("id", lessonId)

  if (statusError) return { error: statusError.message }

  const { error: hwError } = await supabase.from("homework").upsert(
    {
      lesson_id: lessonId,
      body: homeworkBody,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "lesson_id" }
  )

  if (hwError) return { error: hwError.message }

  await supabase.from("lesson_audit").insert({
    lesson_id: lessonId,
    action: "updated",
    actor_id: profile.id,
    meta: { completed: true },
  })

  revalidateSchedule(week)
  return {}
}
