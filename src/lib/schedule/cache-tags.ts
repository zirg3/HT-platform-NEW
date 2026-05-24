export const SCHEDULE_CACHE_TAG = "schedule-data"
export const COURSES_CACHE_TAG = "courses-list"

export const weekLessonsTag = (weekKey: string) => `lessons-week-${weekKey}`
export const teacherStudentsTag = (teacherId: string) =>
  `teacher-students-${teacherId}`
export const agendaTag = (profileId: string, role: string) =>
  `agenda-${role}-${profileId}`
