import {
  getCachedAllStudents,
  getCachedCourses,
  getCachedLessonsForWeek,
  getCachedTeacherStudents,
  getCachedTeachers,
  getWeekKey,
} from "@/lib/schedule/cached-queries"
import type { Profile } from "@/lib/auth/session"
import type { CourseRow, LessonRow, ProfileBrief } from "@/lib/schedule/types"

export type ScheduleReferenceData = {
  courses: CourseRow[]
  students: ProfileBrief[]
  teachers: ProfileBrief[]
}

export const fetchScheduleWeekLessons = async (
  weekStart: Date
): Promise<LessonRow[]> => getCachedLessonsForWeek(getWeekKey(weekStart))

export const fetchScheduleReferenceData = async (
  profile: Profile
): Promise<ScheduleReferenceData> => {
  if (profile.role === "teacher") {
    const [courses, students] = await Promise.all([
      getCachedCourses(),
      getCachedTeacherStudents(profile.id),
    ])
    return {
      courses,
      students,
      teachers: [
        {
          id: profile.id,
          full_name: profile.full_name,
          email: profile.email,
        },
      ],
    }
  }

  if (profile.role === "student") {
    const [courses, teachers] = await Promise.all([
      getCachedCourses(),
      getCachedTeachers(),
    ])
    return {
      courses,
      students: [],
      teachers,
    }
  }

  const [courses, students, teachers] = await Promise.all([
    getCachedCourses(),
    getCachedAllStudents(),
    getCachedTeachers(),
  ])

  return { courses, students, teachers }
}
