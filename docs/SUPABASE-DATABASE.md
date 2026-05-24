# Supabase: pooler и индексы

## Два типа подключения

| Переменная | Назначение |
|------------|------------|
| `NEXT_PUBLIC_SUPABASE_URL` + `ANON_KEY` | Браузер и Server Actions (`@supabase/ssr`) — **HTTPS PostgREST** |
| `DATABASE_POOLER_URL` (порт **6543**) | CLI, `supabase db push`, psql — **Postgres через Supavisor** |
| `DATABASE_URL` (порт **5432**, `db.*.supabase.co`) | Прямое соединение; для dev/длинных сессий |

Server Actions **не** подключаются к `:6543` напрямую — они ходят в API. Pooler снижает нагрузку на Postgres при миграциях и любых прямых SQL-скриптах; на стороне Supabase PostgREST уже использует пул.

## Настройка `.env.local`

1. Dashboard → **Project Settings → Database**.
2. **Connection string → Transaction pooler** (порт **6543**).
3. Скопируйте URI в `.env.local`:

```env
# Transaction mode (рекомендуется для CLI / serverless)
DATABASE_POOLER_URL=postgresql://postgres.PROJECT_REF:[PASSWORD]@aws-0-REGION.pooler.supabase.com:6543/postgres

# Прямое (опционально, порт 5432)
# DATABASE_URL=postgresql://postgres:[PASSWORD]@db.PROJECT_REF.supabase.co:5432/postgres

# Для Supabase CLI (тот же pooler)
SUPABASE_DB_URL=${DATABASE_POOLER_URL}
```

`NEXT_PUBLIC_SUPABASE_URL` и ключи API **не меняйте** на pooler-хост.

## Применить индексы

Файл: `supabase/migrations/20260522140000_schedule_perf_indexes.sql`

**Вариант A — SQL Editor** в Dashboard: вставить содержимое файла → Run.

**Вариант B — CLI** (из `apps/web`, с заполненным `DATABASE_POOLER_URL`):

```powershell
cd apps\web
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

## Проверка индексов

```sql
select indexname, indexdef
from pg_indexes
where tablename in ('lessons', 'lesson_participants')
order by tablename, indexname;
```

Ожидаются в том числе: `lessons_teacher_id_starts_at_idx`, `lessons_starts_at_status_idx`.

## «Профиль не найден» при входе

Если вход по паролю проходит, но роль не читается — часто **нет строки в `profiles`**.

**SQL Editor → Run** (или миграция `20260522160000_backfill_profiles.sql`):

```sql
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
where not exists (select 1 from public.profiles p where p.id = u.id);
```

Проверка:

```sql
select u.id, u.email, p.role
from auth.users u
left join public.profiles p on p.id = u.id;
```

У каждого пользователя должна быть строка `profiles` с `role`.
