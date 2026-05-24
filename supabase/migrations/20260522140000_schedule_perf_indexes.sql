-- Индексы под запросы расписания (неделя, agenda, отменённые).
-- Базовые lessons_starts_at_idx / lessons_teacher_id_idx / lesson_participants_profile_idx
-- уже есть в initial_schema — здесь составные и частичные.

create index if not exists lessons_teacher_id_starts_at_idx
  on public.lessons (teacher_id, starts_at);

create index if not exists lessons_starts_at_status_idx
  on public.lessons (starts_at, status);

create index if not exists lessons_cancelled_lookup_idx
  on public.lessons (status, cancelled_at desc)
  where status = 'cancelled';

create index if not exists lesson_participants_lesson_id_idx
  on public.lesson_participants (lesson_id);
