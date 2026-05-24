import { cache } from "react"
import { formatWeekParam, parseWeekParam } from "@/lib/schedule/dates"
import {
  fetchAgendaLessonsForLk,
  fetchAllStudents,
  fetchCourses,
  fetchLessonsForWeek,
  fetchTeacherStudents,
  fetchTeachers,
} from "@/lib/schedule/queries"
import type { UserRole } from "@/types/roles"

/**
 * Дедупликация запросов в рамках одного рендера (React.cache).
 * Нельзя unstable_cache: Supabase использует cookies() / RLS по сессии.
 */

export const getCachedCourses = cache(async () => fetchCourses())

export const getCachedTeachers = cache(async () => fetchTeachers())

export const getCachedAllStudents = cache(async () => fetchAllStudents())

export const getCachedTeacherStudents = cache(async (teacherId: string) =>
  fetchTeacherStudents(teacherId)
)

export const getCachedLessonsForWeek = cache(async (weekKey: string) =>
  fetchLessonsForWeek(parseWeekParam(weekKey))
)

export const getCachedAgendaLessons = cache(
  async (profileId: string, role: Extract<UserRole, "student" | "teacher">) =>
    fetchAgendaLessonsForLk(profileId, role)
)

export const getWeekKey = (weekStart: Date) => formatWeekParam(weekStart)
