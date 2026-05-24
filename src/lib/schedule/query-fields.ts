/** Минимальный select для проверки пересечений при сохранении. */
export const LESSON_CONFLICT_SELECT = `
  id,
  starts_at,
  duration_minutes,
  status,
  teacher_id,
  lesson_participants ( profile_id )
`

/** Календарь недели + карточка урока в диалоге. */
export const LESSON_CALENDAR_SELECT = `
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
  cancellation_reason,
  rescheduled_at,
  rescheduled_by,
  original_starts_at,
  cancelled_by_profile:profiles!lessons_cancelled_by_fkey ( id, full_name, email ),
  courses ( id, title, color ),
  teacher:profiles!lessons_teacher_id_fkey ( id, full_name, email ),
  lesson_participants (
    profile_id,
    profiles ( id, full_name, email )
  ),
  homework ( id, body, updated_at )
`

/** Списки предстоящих / прошедших (без ДЗ и профиля отменившего). */
export const LESSON_AGENDA_SELECT = `
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
  cancellation_reason,
  rescheduled_at,
  rescheduled_by,
  original_starts_at,
  cancelled_by_profile:profiles!lessons_cancelled_by_fkey ( id, full_name, email ),
  courses ( id, title, color ),
  teacher:profiles!lessons_teacher_id_fkey ( id, full_name, email ),
  lesson_participants (
    profile_id,
    profiles ( id, full_name, email )
  )
`

/** Полный select (профили ученика, история). */
export const LESSON_SELECT = `
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
  cancellation_reason,
  rescheduled_at,
  rescheduled_by,
  original_starts_at,
  cancelled_by_profile:profiles!lessons_cancelled_by_fkey ( id, full_name, email ),
  courses ( id, title, color ),
  teacher:profiles!lessons_teacher_id_fkey ( id, full_name, email ),
  lesson_participants (
    profile_id,
    profiles ( id, full_name, email )
  ),
  homework ( id, body, updated_at )
`
