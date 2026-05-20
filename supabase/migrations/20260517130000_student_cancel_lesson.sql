-- Ученик может отменить свой урок (только статус cancelled)
create policy "lessons_update_student_cancel"
  on public.lessons
  for update
  using (public.is_lesson_participant(lessons.id, auth.uid()))
  with check (
    status = 'cancelled'
    and cancelled_by = auth.uid()
  )
