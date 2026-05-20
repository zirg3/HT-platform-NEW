# Supabase

## Миграции

Применить в Supabase Dashboard → SQL Editor **по порядку** или через CLI:

```bash
supabase db push
```

| # | Файл |
|---|------|
| 1 | `migrations/20260517120000_initial_schema.sql` — схема + RLS (без рекурсии lessons/participants) |
| 2 | `migrations/20260517130000_student_cancel_lesson.sql` |
| 3 | `migrations/20260517130100_staff_lesson_insert.sql` |
| 4 | `migrations/20260520120000_lesson_meeting_url.sql` — `meeting_url` для онлайн-подключения |

## Уже существующая БД

Если раньше накатывали старый `initial` **без** хелперов `can_view_lesson` и видите `42P17` на `/admin` — один раз выполните в SQL Editor содержимое из git-истории файла `20260517140000_fix_rls_lessons_recursion.sql` (удалён из репо после слияния в `initial`).

Либо **Reset database** и накатите три файла выше заново.

## Первый администратор

1. Создайте пользователя в Authentication → Users (email + пароль).
2. В **Raw App Meta Data** укажите: `{ "role": "admin" }`.
3. Если пользователь создан до миграции — вручную вставьте строку в `profiles` или пересоздайте пользователя после триггера.

## Переменные окружения

Скопируйте `apps/web/.env.example` в `.env.local` и заполните ключи проекта.
