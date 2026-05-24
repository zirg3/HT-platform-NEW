export type LessonStatus = "scheduled" | "cancelled" | "completed"

export type CourseRow = {
  id: string
  title: string
  color: string
}

export type ProfileBrief = {
  id: string
  full_name: string
  email: string
}

export type HomeworkRow = {
  id: string
  body: string
  updated_at: string
}

export type LessonRow = {
  id: string
  starts_at: string
  duration_minutes: number
  course_id: string | null
  teacher_id: string
  status: LessonStatus
  note: string | null
  meeting_url: string | null
  recurrence_group_id: string | null
  cancelled_at: string | null
  cancelled_by: string | null
  cancellation_reason: string | null
  rescheduled_at: string | null
  rescheduled_by: string | null
  original_starts_at: string | null
  cancelled_by_profile: ProfileBrief | null
  courses: CourseRow | null
  teacher: ProfileBrief | null
  homework: HomeworkRow | null
  lesson_participants: {
    profile_id: string
    profiles: ProfileBrief | null
  }[]
}

export type LessonFormValues = {
  date: string
  time: string
  duration_minutes: number
  course_id: string
  student_id: string
  note: string
}

export type SchedulePermissions = {
  canCreate: boolean
  canEdit: boolean
  canCancel: boolean
  canComplete: boolean
  canReschedule: boolean
  teacherId?: string
}
