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


## Первый администратор

1. Создайте пользователя в Authentication → Users (email + пароль).
2. В **Raw App Meta Data** укажите: `{ "role": "admin" }`.
3. Если пользователь создан до миграции — вручную вставьте строку в `profiles` или пересоздайте пользователя после триггера.

## Переменные окружения

Скопируйте `apps/web/.env.example` в `.env.local` и заполните ключи проекта.

- `NEXT_PUBLIC_SITE_URL` — публичный URL приложения (для ссылки восстановления пароля).

## Восстановление пароля (Auth)

**Authentication → URL Configuration → Redirect URLs** 

```
http://localhost:3000/auth/callback?next=/login/reset-password
```

