import type { Profile } from "@/types/profile"
import {
  fetchAllStudents,
  fetchCourses,
  fetchLessonsForWeek,
  fetchTeacherStudents,
  fetchTeachers,
} from "@/lib/pocketbase/schedule-queries"
import type { CourseRow, LessonRow, ProfileBrief } from "@/lib/schedule/types"

export type ScheduleReferenceData = {
  courses: CourseRow[]
  students: ProfileBrief[]
  teachers: ProfileBrief[]
}

export const fetchScheduleWeekLessons = async (
  weekStart: Date
): Promise<LessonRow[]> => fetchLessonsForWeek(weekStart)

export const fetchScheduleReferenceData = async (
  profile: Profile
): Promise<ScheduleReferenceData> => {
  if (profile.role === "teacher") {
    const [courses, students] = await Promise.all([
      fetchCourses(),
      fetchTeacherStudents(profile.id),
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
      fetchCourses(),
      fetchTeachers(),
    ])
    return {
      courses,
      students: [],
      teachers,
    }
  }

  const [courses, students, teachers] = await Promise.all([
    fetchCourses(),
    fetchAllStudents(),
    fetchTeachers(),
  ])

  return { courses, students, teachers }
}
