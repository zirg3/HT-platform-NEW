import { addDays, subDays } from "date-fns"
import { createClient } from "@/lib/supabase/server"
import type { CourseRow, LessonRow, ProfileBrief } from "@/lib/schedule/types"
import type { UserRole } from "@/types/roles"

const mapLessonRow = (row: Record<string, unknown>): LessonRow => {
  const courses = row.courses
  const teacher = row.teacher
  const homework = row.homework
  const cancelledByProfile = row.cancelled_by_profile
  return {
    ...row,
    courses: Array.isArray(courses) ? courses[0] ?? null : courses,
    teacher: Array.isArray(teacher) ? teacher[0] ?? null : teacher,
    homework: Array.isArray(homework) ? homework[0] ?? null : homework ?? null,
    cancelled_by_profile: Array.isArray(cancelledByProfile)
      ? cancelledByProfile[0] ?? null
      : (cancelledByProfile as ProfileBrief | null) ?? null,
  } as LessonRow
}

export const fetchCourses = async (): Promise<CourseRow[]> => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("courses")
    .select("id, title, color")
    .order("title")

  if (error) throw error
  return data ?? []
}

export const fetchLessonsForWeek = async (
  weekStart: Date
): Promise<LessonRow[]> => {
  const supabase = await createClient()
  const weekEnd = addDays(weekStart, 7)

  const { data, error } = await supabase
    .from("lessons")
    .select(
      `
      id,
      starts_at,
      duration_minutes,
      course_id,
      teacher_id,
      status,
      note,
      meeting_url,
      recurrence_group_id,
      cancelled_at,
      cancelled_by,
      cancelled_by_profile:profiles!lessons_cancelled_by_fkey ( id, full_name, email ),
      courses ( id, title, color ),
      teacher:profiles!lessons_teacher_id_fkey ( id, full_name, email ),
      lesson_participants (
        profile_id,
        profiles ( id, full_name, email )
      ),
      homework ( id, body, updated_at )
    `
    )
    .gte("starts_at", weekStart.toISOString())
    .lt("starts_at", weekEnd.toISOString())
    .order("starts_at")

  if (error) throw error

  return (data ?? []).map((row) => mapLessonRow(row as Record<string, unknown>))
}

export const fetchLessonsBetween = async (
  rangeStart: Date,
  rangeEndExclusive: Date
): Promise<LessonRow[]> => {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("lessons")
    .select(
      `
      id,
      starts_at,
      duration_minutes,
      course_id,
      teacher_id,
      status,
      note,
      meeting_url,
      recurrence_group_id,
      cancelled_at,
      cancelled_by,
      cancelled_by_profile:profiles!lessons_cancelled_by_fkey ( id, full_name, email ),
      courses ( id, title, color ),
      teacher:profiles!lessons_teacher_id_fkey ( id, full_name, email ),
      lesson_participants (
        profile_id,
        profiles ( id, full_name, email )
      ),
      homework ( id, body, updated_at )
    `
    )
    .gte("starts_at", rangeStart.toISOString())
    .lt("starts_at", rangeEndExclusive.toISOString())
    .order("starts_at")

  if (error) throw error

  return (data ?? []).map((row) => mapLessonRow(row as Record<string, unknown>))
}

export const fetchTeacherStudents = async (
  teacherId: string
): Promise<ProfileBrief[]> => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("student_teacher")
    .select("student:profiles!student_teacher_student_id_fkey ( id, full_name, email )")
    .eq("teacher_id", teacherId)

  if (error) throw error

  return (
    data?.map((row) => {
      const student = row.student as ProfileBrief | ProfileBrief[] | null
      return Array.isArray(student) ? student[0] : student
    }).filter((s): s is ProfileBrief => Boolean(s)) ?? []
  )
}

export const fetchAllStudents = async (): Promise<ProfileBrief[]> => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .eq("role", "student")
    .order("full_name")

  if (error) throw error
  return data ?? []
}

export const fetchTeachers = async (): Promise<ProfileBrief[]> => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .eq("role", "teacher")
    .order("full_name")

  if (error) throw error
  return data ?? []
}

/** ЛК: предстоящие и прошедшие у юзера в окне дат (ученик — по участию, преподаватель — свои ведённые). */
export const fetchAgendaLessonsForLk = async (
  profileId: string,
  role: Extract<UserRole, "student" | "teacher">
): Promise<LessonRow[]> => {
  const supabase = await createClient()
  const rangeStart = subDays(new Date(), 90)
  const rangeEnd = addDays(new Date(), 180)

  const baseSelect = `
      id,
      starts_at,
      duration_minutes,
      course_id,
      teacher_id,
      status,
      note,
      meeting_url,
      recurrence_group_id,
      cancelled_at,
      cancelled_by,
      cancelled_by_profile:profiles!lessons_cancelled_by_fkey ( id, full_name, email ),
      courses ( id, title, color ),
      teacher:profiles!lessons_teacher_id_fkey ( id, full_name, email ),
      lesson_participants (
        profile_id,
        profiles ( id, full_name, email )
      ),
      homework ( id, body, updated_at )
    `

  if (role === "student") {
    const { data, error } = await supabase
      .from("lessons")
      .select(
        `
      id,
      starts_at,
      duration_minutes,
      course_id,
      teacher_id,
      status,
      note,
      meeting_url,
      recurrence_group_id,
      cancelled_at,
      cancelled_by,
      cancelled_by_profile:profiles!lessons_cancelled_by_fkey ( id, full_name, email ),
      courses ( id, title, color ),
      teacher:profiles!lessons_teacher_id_fkey ( id, full_name, email ),
      lesson_participants!inner (
        profile_id,
        profiles ( id, full_name, email )
      ),
      homework ( id, body, updated_at )
    `
      )
      .eq("lesson_participants.profile_id", profileId)
      .gte("starts_at", rangeStart.toISOString())
      .lt("starts_at", rangeEnd.toISOString())
      .order("starts_at", { ascending: true })

    if (error) throw error
    const rows = (data ?? []).map((row) =>
      mapLessonRow(row as Record<string, unknown>)
    )
    return dedupeAgendaLessons(rows)
  }

  const { data, error } = await supabase
    .from("lessons")
    .select(baseSelect)
    .eq("teacher_id", profileId)
    .gte("starts_at", rangeStart.toISOString())
    .lt("starts_at", rangeEnd.toISOString())
    .order("starts_at", { ascending: true })

  if (error) throw error
  return (data ?? []).map((row) => mapLessonRow(row as Record<string, unknown>))
}

/** Уроки конкретной пары преподаватель — ученик (RLS: только свои). */
export const fetchLessonsForTeacherAndStudent = async (
  teacherId: string,
  studentId: string
): Promise<LessonRow[]> => {
  const supabase = await createClient()
  const rangeStart = subDays(new Date(), 365)
  const rangeEnd = addDays(new Date(), 365)

  const { data, error } = await supabase
    .from("lessons")
    .select(
      `
      id,
      starts_at,
      duration_minutes,
      course_id,
      teacher_id,
      status,
      note,
      meeting_url,
      recurrence_group_id,
      cancelled_at,
      cancelled_by,
      cancelled_by_profile:profiles!lessons_cancelled_by_fkey ( id, full_name, email ),
      courses ( id, title, color ),
      teacher:profiles!lessons_teacher_id_fkey ( id, full_name, email ),
      lesson_participants!inner (
        profile_id,
        profiles ( id, full_name, email )
      ),
      homework ( id, body, updated_at )
    `
    )
    .eq("teacher_id", teacherId)
    .eq("lesson_participants.profile_id", studentId)
    .gte("starts_at", rangeStart.toISOString())
    .lt("starts_at", rangeEnd.toISOString())
    .order("starts_at", { ascending: true })

  if (error) throw error
  const rows = (data ?? []).map((row) =>
    mapLessonRow(row as Record<string, unknown>)
  )
  return dedupeAgendaLessons(rows)
}

const dedupeAgendaLessons = (lessons: LessonRow[]): LessonRow[] => {
  const seen = new Set<string>()
  const out: LessonRow[] = []
  for (const lesson of lessons) {
    if (seen.has(lesson.id)) continue
    seen.add(lesson.id)
    out.push(lesson)
  }
  return out
}
