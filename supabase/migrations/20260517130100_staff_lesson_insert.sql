-- Менеджер/админ создаёт урок от имени выбранного преподавателя
create policy "lessons_insert_staff"
  on public.lessons
  for insert
  with check (public.is_staff())
