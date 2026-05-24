-- v1.1: причина отмены, перенос, флаг is_teacher у профилей

alter table public.profiles
  add column if not exists is_teacher boolean not null default false;

update public.profiles
set is_teacher = true
where role = 'teacher';

alter table public.lessons
  add column if not exists cancellation_reason text,
  add column if not exists rescheduled_at timestamptz,
  add column if not exists rescheduled_by uuid references public.profiles (id),
  add column if not exists original_starts_at timestamptz;

create index if not exists lessons_rescheduled_at_idx on public.lessons (rescheduled_at)
  where rescheduled_at is not null;
