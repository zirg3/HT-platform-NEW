-- Профили для пользователей auth без строки в public.profiles (старые аккаунты).

insert into public.profiles (id, email, full_name, role)
select
  u.id,
  coalesce(u.email, ''),
  coalesce(u.raw_user_meta_data ->> 'full_name', ''),
  coalesce(
    (u.raw_app_meta_data ->> 'role')::public.user_role,
    'student'::public.user_role
  )
from auth.users u
where not exists (
  select 1 from public.profiles p where p.id = u.id
);
