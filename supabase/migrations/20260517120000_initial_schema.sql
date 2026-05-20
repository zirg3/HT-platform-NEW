-- MVP: схема public + RLS. Роль в profiles; при создании auth.users — из raw_app_meta_data.role.

create type public.user_role as enum (
  'student',
  'teacher',
  'manager',
  'admin'
);

create type public.lesson_status as enum (
  'scheduled',
  'cancelled',
  'completed'
);

create type public.lesson_audit_action as enum (
  'created',
  'updated',
  'cancelled'
);

-- profiles
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  email text not null,
  role public.user_role not null default 'student',
  created_at timestamptz not null default now()
);

create index profiles_role_idx on public.profiles (role);

-- courses
create table public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  color text not null default '#3b82f6',
  created_at timestamptz not null default now()
);

-- student ↔ teacher
create table public.student_teacher (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles (id) on delete cascade,
  teacher_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (student_id, teacher_id),
  check (student_id <> teacher_id)
);

create index student_teacher_teacher_idx on public.student_teacher (teacher_id);
create index student_teacher_student_idx on public.student_teacher (student_id);

-- lessons
create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  starts_at timestamptz not null,
  duration_minutes int not null default 60 check (duration_minutes > 0),
  course_id uuid references public.courses (id) on delete set null,
  teacher_id uuid not null references public.profiles (id) on delete cascade,
  status public.lesson_status not null default 'scheduled',
  note text,
  recurrence_group_id uuid,
  cancelled_at timestamptz,
  cancelled_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

create index lessons_starts_at_idx on public.lessons (starts_at);
create index lessons_teacher_id_idx on public.lessons (teacher_id);

-- lesson participants
create table public.lesson_participants (
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  primary key (lesson_id, profile_id)
);

create index lesson_participants_profile_idx on public.lesson_participants (profile_id);

-- homework
create table public.homework (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null unique references public.lessons (id) on delete cascade,
  body text not null default '',
  updated_at timestamptz not null default now()
);

-- lesson audit
create table public.lesson_audit (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  action public.lesson_audit_action not null,
  actor_id uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  meta jsonb not null default '{}'::jsonb
);

create index lesson_audit_lesson_idx on public.lesson_audit (lesson_id);

-- helpers
create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_user_role() in ('manager', 'admin');
$$;

create or replace function public.is_teacher_of_student(p_student_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.student_teacher st
    where st.teacher_id = auth.uid()
      and st.student_id = p_student_id
  );
$$;

-- Доступ к урокам без взаимных EXISTS в RLS (иначе 42P17 на lessons ↔ lesson_participants)
create or replace function public.is_lesson_participant(
  p_lesson_id uuid,
  p_profile_id uuid default auth.uid()
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.lesson_participants lp
    where lp.lesson_id = p_lesson_id
      and lp.profile_id = p_profile_id
  );
$$;

create or replace function public.is_lesson_teacher(
  p_lesson_id uuid,
  p_teacher_id uuid default auth.uid()
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.lessons l
    where l.id = p_lesson_id
      and l.teacher_id = p_teacher_id
  );
$$;

create or replace function public.can_view_lesson(p_lesson_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_staff()
    or public.is_lesson_teacher(p_lesson_id, auth.uid())
    or public.is_lesson_participant(p_lesson_id, auth.uid());
$$;

-- profile on signup (role from app_metadata, not user_metadata)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  assigned_role public.user_role;
begin
  begin
    assigned_role := coalesce(
      (new.raw_app_meta_data ->> 'role')::public.user_role,
      'student'::public.user_role
    );
  exception
    when others then
      assigned_role := 'student';
  end;

  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    assigned_role
  );

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.student_teacher enable row level security;
alter table public.lessons enable row level security;
alter table public.lesson_participants enable row level security;
alter table public.homework enable row level security;
alter table public.lesson_audit enable row level security;

-- profiles policies
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_select_staff"
  on public.profiles for select
  using (public.is_staff());

create policy "profiles_select_teacher_students"
  on public.profiles for select
  using (
    public.current_user_role() = 'teacher'
    and public.is_teacher_of_student(id)
  );

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id and role = (select p.role from public.profiles p where p.id = auth.uid()));

create policy "profiles_all_admin"
  on public.profiles for all
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

-- courses: read all authenticated; write admin
create policy "courses_select_authenticated"
  on public.courses for select
  using (auth.uid() is not null);

create policy "courses_write_admin"
  on public.courses for all
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

-- student_teacher
create policy "student_teacher_select_involved"
  on public.student_teacher for select
  using (
    auth.uid() = student_id
    or auth.uid() = teacher_id
    or public.is_staff()
  );

create policy "student_teacher_write_staff"
  on public.student_teacher for all
  using (public.is_staff())
  with check (public.is_staff());

-- lessons: участники, преподаватель урока, staff
create policy "lessons_select_access"
  on public.lessons
  for select
  using (public.can_view_lesson(id));

create policy "lessons_insert_teacher"
  on public.lessons for insert
  with check (
    auth.uid() = teacher_id
    and public.current_user_role() in ('teacher', 'admin', 'manager')
  );

create policy "lessons_update_teacher"
  on public.lessons for update
  using (auth.uid() = teacher_id or public.is_staff())
  with check (auth.uid() = teacher_id or public.is_staff());

create policy "lessons_delete_staff"
  on public.lessons for delete
  using (public.is_staff() or auth.uid() = teacher_id);

-- lesson_participants
create policy "lesson_participants_select"
  on public.lesson_participants
  for select
  using (
    profile_id = auth.uid()
    or public.is_staff()
    or public.is_lesson_teacher(lesson_id, auth.uid())
  );

create policy "lesson_participants_write"
  on public.lesson_participants
  for all
  using (
    public.is_staff()
    or public.is_lesson_teacher(lesson_id, auth.uid())
  )
  with check (
    public.is_staff()
    or public.is_lesson_teacher(lesson_id, auth.uid())
  );

-- homework
create policy "homework_select"
  on public.homework
  for select
  using (public.can_view_lesson(lesson_id));

create policy "homework_write_teacher"
  on public.homework for all
  using (
    exists (
      select 1 from public.lessons l
      where l.id = homework.lesson_id and l.teacher_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.lessons l
      where l.id = homework.lesson_id and l.teacher_id = auth.uid()
    )
  );

-- lesson_audit: read staff + lesson participants; insert via triggers later
create policy "lesson_audit_select"
  on public.lesson_audit
  for select
  using (public.can_view_lesson(lesson_id));

create policy "lesson_audit_insert_authenticated"
  on public.lesson_audit for insert
  with check (auth.uid() is not null);

-- grants для RLS-хелперов уроков
grant execute on function public.is_lesson_participant(uuid, uuid) to authenticated;
grant execute on function public.is_lesson_teacher(uuid, uuid) to authenticated;
grant execute on function public.can_view_lesson(uuid) to authenticated;
