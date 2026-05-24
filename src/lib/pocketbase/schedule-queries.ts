import { addDays, subDays } from "date-fns"
import { getPocketBase } from "@/lib/pocketbase/client"
import type { CourseRow, LessonRow, ProfileBrief } from "@/lib/schedule/types"
import type { UserRole } from "@/types/roles"

const AGENDA_PAST_DAYS = 14
const AGENDA_FUTURE_DAYS = 45
const AGENDA_ROW_LIMIT = 80

type PbUser = {
  id: string
  email: string
  full_name?: string
}

type PbCourse = {
  id: string
  title: string
  color: string
}

type PbHomework = {
  id: string
  body: string
  updated: string
  lesson: string
}

const fetchHomeworkForLessons = async (
  lessonIds: string[]
): Promise<Map<string, PbHomework>> => {
  const map = new Map<string, PbHomework>()
  if (lessonIds.length === 0) return map

  const pb = getPocketBase()
  const filter = lessonIds.map((id) => `lesson = "${id}"`).join(" || ")
  const { items } = await pb.collection("homework").getList<PbHomework>(1, 500, {
    filter,
  })

  for (const item of items) {
    map.set(item.lesson, item)
  }

  return map
}

type PbLessonParticipant = {
  id: string
  profile: string
  expand?: {
    profile?: PbUser
  }
}

type PbLesson = {
  id: string
  starts_at: string
  duration_minutes: number
  course?: string
  teacher: string
  status: LessonRow["status"]
  note?: string
  meeting_url?: string
  recurrence_group_id?: string
  cancelled_at?: string
  cancelled_by?: string
  cancellation_reason?: string
  rescheduled_at?: string
  rescheduled_by?: string
  original_starts_at?: string
  expand?: {
    course?: PbCourse
    teacher?: PbUser
    cancelled_by?: PbUser
  }
}

const toProfileBrief = (user?: PbUser | null): ProfileBrief | null =>
  user
    ? {
        id: user.id,
        full_name: user.full_name ?? "",
        email: user.email,
      }
    : null

const fetchParticipantsForLessons = async (
  lessonIds: string[]
): Promise<Map<string, PbLessonParticipant[]>> => {
  const map = new Map<string, PbLessonParticipant[]>()
  if (lessonIds.length === 0) return map

  const pb = getPocketBase()
  const filter = lessonIds.map((id) => `lesson = "${id}"`).join(" || ")

  const { items } = await pb.collection("lesson_participants").getList<PbLessonParticipant>(
    1,
    500,
    {
      filter,
      expand: "profile",
    }
  )

  for (const item of items) {
    const lessonId = (item as unknown as { lesson: string }).lesson
    const bucket = map.get(lessonId) ?? []
    bucket.push(item)
    map.set(lessonId, bucket)
  }

  return map
}

export const mapPbLessonToRow = (
  lesson: PbLesson,
  participants: PbLessonParticipant[] = [],
  homework?: PbHomework | null
): LessonRow => {
  return {
    id: lesson.id,
    starts_at: lesson.starts_at,
    duration_minutes: lesson.duration_minutes,
    course_id: lesson.course ?? null,
    teacher_id: lesson.teacher,
    status: lesson.status,
    note: lesson.note ?? null,
    meeting_url: lesson.meeting_url ?? null,
    recurrence_group_id: lesson.recurrence_group_id ?? null,
    cancelled_at: lesson.cancelled_at ?? null,
    cancelled_by: lesson.cancelled_by ?? null,
    cancellation_reason: lesson.cancellation_reason ?? null,
    rescheduled_at: lesson.rescheduled_at ?? null,
    rescheduled_by: lesson.rescheduled_by ?? null,
    original_starts_at: lesson.original_starts_at ?? null,
    cancelled_by_profile: toProfileBrief(lesson.expand?.cancelled_by),
    courses: lesson.expand?.course
      ? {
          id: lesson.expand.course.id,
          title: lesson.expand.course.title,
          color: lesson.expand.course.color,
        }
      : null,
    teacher: toProfileBrief(lesson.expand?.teacher),
    homework: homework
      ? {
          id: homework.id,
          body: homework.body,
          updated_at: homework.updated,
        }
      : null,
    lesson_participants: participants.map((p) => ({
      profile_id: p.profile,
      profiles: toProfileBrief(p.expand?.profile),
    })),
  }
}

const fetchLessonsInRange = async (
  rangeStart: Date,
  rangeEndExclusive: Date,
  withHomework = true
): Promise<LessonRow[]> => {
  const pb = getPocketBase()
  const expand = "course,teacher,cancelled_by"

  const { items } = await pb.collection("lessons").getList<PbLesson>(1, 500, {
    filter: `starts_at >= "${rangeStart.toISOString()}" && starts_at < "${rangeEndExclusive.toISOString()}"`,
    sort: "starts_at",
    expand,
  })

  const lessonIds = items.map((l) => l.id)
  const [participants, homeworkMap] = await Promise.all([
    fetchParticipantsForLessons(lessonIds),
    withHomework ? fetchHomeworkForLessons(lessonIds) : Promise.resolve(new Map()),
  ])

  return items.map((lesson) =>
    mapPbLessonToRow(
      lesson,
      participants.get(lesson.id) ?? [],
      homeworkMap.get(lesson.id)
    )
  )
}

export const fetchCourses = async (): Promise<CourseRow[]> => {
  const pb = getPocketBase()
  const { items } = await pb.collection("courses").getList<CourseRow>(1, 200, {
    sort: "title",
  })
  return items
}

export const fetchLessonsForWeek = async (weekStart: Date): Promise<LessonRow[]> => {
  const weekEnd = addDays(weekStart, 7)
  return fetchLessonsInRange(weekStart, weekEnd)
}

export const fetchLessonsForWeekConflicts = fetchLessonsForWeek

export const fetchLessonsBetween = async (
  rangeStart: Date,
  rangeEndExclusive: Date
): Promise<LessonRow[]> => fetchLessonsInRange(rangeStart, rangeEndExclusive)

export const fetchLessonsBetweenConflicts = fetchLessonsBetween

export const fetchLessonsForAgenda = async (): Promise<LessonRow[]> => {
  const now = new Date()
  const rangeStart = subDays(now, AGENDA_PAST_DAYS)
  const rangeEnd = addDays(now, AGENDA_FUTURE_DAYS)
  const lessons = await fetchLessonsInRange(rangeStart, rangeEnd, false)
  return lessons.slice(0, AGENDA_ROW_LIMIT)
}

export const fetchUsersByRole = async (role: UserRole): Promise<ProfileBrief[]> => {
  const pb = getPocketBase()
  const { items } = await pb.collection("users").getList<PbUser>(1, 500, {
    filter: `role = "${role}"`,
    sort: "full_name",
  })

  return items.map((u) => ({
    id: u.id,
    full_name: u.full_name ?? "",
    email: u.email,
  }))
}

export const fetchAllStudents = () => fetchUsersByRole("student")

export const fetchTeachers = async (): Promise<ProfileBrief[]> => {
  const pb = getPocketBase()
  const { items } = await pb.collection("users").getList<PbUser>(1, 500, {
    filter: `role = "teacher" || is_teacher = true`,
    sort: "full_name",
  })

  return items.map((u) => ({
    id: u.id,
    full_name: u.full_name ?? "",
    email: u.email,
  }))
}

export const fetchTeacherStudents = async (teacherId: string): Promise<ProfileBrief[]> => {
  const pb = getPocketBase()
  const { items } = await pb.collection("student_teacher").getList<{
    id: string
    expand?: { student?: PbUser }
  }>(1, 500, {
    filter: `teacher = "${teacherId}"`,
    expand: "student",
  })

  return items
    .map((row) => row.expand?.student)
    .filter(Boolean)
    .map((u) => ({
      id: u!.id,
      full_name: u!.full_name ?? "",
      email: u!.email,
    }))
}

export const fetchStudentProfile = async (studentId: string): Promise<ProfileBrief | null> => {
  const pb = getPocketBase()
  try {
    const user = await pb.collection("users").getOne<PbUser>(studentId)
    return {
      id: user.id,
      full_name: user.full_name ?? "",
      email: user.email,
    }
  } catch {
    return null
  }
}

export const fetchLessonById = async (lessonId: string): Promise<LessonRow | null> => {
  const pb = getPocketBase()
  try {
    const lesson = await pb.collection("lessons").getOne<PbLesson>(lessonId, {
      expand: "course,teacher,cancelled_by",
    })
    const [participants, homeworkMap] = await Promise.all([
      fetchParticipantsForLessons([lesson.id]),
      fetchHomeworkForLessons([lesson.id]),
    ])
    return mapPbLessonToRow(
      lesson,
      participants.get(lesson.id) ?? [],
      homeworkMap.get(lesson.id)
    )
  } catch {
    return null
  }
}

export const fetchAgendaLessonsForLk = async (
  profileId: string,
  role: Extract<UserRole, "student" | "teacher">
): Promise<LessonRow[]> => {
  const now = new Date()
  const rangeStart = subDays(now, AGENDA_PAST_DAYS)
  const rangeEnd = addDays(now, AGENDA_FUTURE_DAYS)
  const all = await fetchLessonsInRange(rangeStart, rangeEnd, false)

  if (role === "teacher") {
    return all.filter((lesson) => lesson.teacher_id === profileId)
  }

  return all.filter((lesson) =>
    lesson.lesson_participants.some((p) => p.profile_id === profileId)
  )
}

export const fetchCancelledLessonsForStudent = async (
  studentId: string,
  teacherId?: string
): Promise<LessonRow[]> => {
  const pb = getPocketBase()
  const rangeStart = subDays(new Date(), 365)

  let filter = `status = "cancelled" && cancelled_at >= "${rangeStart.toISOString()}"`
  if (teacherId) {
    filter += ` && teacher = "${teacherId}"`
  }

  const { items: links } = await pb.collection("lesson_participants").getList<{
    lesson: string
  }>(1, 500, {
    filter: `profile = "${studentId}"`,
  })

  const lessonIds = links.map((l) => l.lesson)
  if (lessonIds.length === 0) return []

  filter += ` && (${lessonIds.map((id) => `id = "${id}"`).join(" || ")})`

  const { items } = await pb.collection("lessons").getList<PbLesson>(1, 30, {
    filter,
    sort: "-cancelled_at",
    expand: "course,teacher,cancelled_by",
  })

  const participants = await fetchParticipantsForLessons(items.map((l) => l.id))
  const homeworkMap = await fetchHomeworkForLessons(items.map((l) => l.id))

  return items.map((lesson) =>
    mapPbLessonToRow(
      lesson,
      participants.get(lesson.id) ?? [],
      homeworkMap.get(lesson.id)
    )
  )
}

export const fetchLessonsForTeacherAndStudent = async (
  teacherId: string,
  studentId: string
): Promise<LessonRow[]> => {
  const rangeStart = subDays(new Date(), 365)
  const rangeEnd = addDays(new Date(), 365)
  const all = await fetchLessonsInRange(rangeStart, rangeEnd)

  return all.filter(
    (lesson) =>
      lesson.teacher_id === teacherId &&
      lesson.lesson_participants.some((p) => p.profile_id === studentId)
  )
}
