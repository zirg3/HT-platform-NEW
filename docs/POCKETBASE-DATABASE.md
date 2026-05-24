# PocketBase — схема и API rules

Полная замена Supabase Postgres + RLS. См. также `pocketbase/README.md`.

## Быстрая настройка (рекомендуется)

**Пошаговая инструкция:** [`pocketbase/SETUP.md`](../pocketbase/SETUP.md)

**Авто-скрипт** (PocketBase должен быть запущен):

```powershell
cd apps/web
.\scripts\setup-pocketbase-schema.ps1 -Email "ваш_superuser@email" -Password "ваш_пароль"
```

Файл `pocketbase/pb_schema.json` — справочный; **не импортируйте его вручную через UI** (ID коллекций генерируются при создании). Используйте скрипт выше.

## Обновление схемы

1. Добавьте поле/коллекцию в `scripts/setup-pocketbase-schema.ps1` + `docs/POCKETBASE-DATABASE.md`
2. Повторно: `npm run pb:setup -- -Email "..." -Password '...'`

Скрипт мержит **только недостающие поля** (по имени) и обновляет API rules. Не удаляет и не меняет тип существующих полей.

## Импорт вручную (альтернатива)

Если скрипт недоступен — создайте коллекции в админке PocketBase по таблицам **API Rules** ниже. Порядок: `users` (поля) → `courses` → `lessons` → `lesson_participants` → `student_teacher` → `homework` → `lesson_audit`.

### `users` (auth)

| Rule | Выражение |
|------|-----------|
| List/Search | `@request.auth.id != "" && (@request.auth.role = "admin" \|\| @request.auth.role = "manager" \|\| id = @request.auth.id)` |
| View | `@request.auth.id != "" && (@request.auth.role = "admin" \|\| @request.auth.role = "manager" \|\| id = @request.auth.id \|\| @collection.student_teacher.student ?= @request.auth.id \|\| @collection.student_teacher.teacher ?= @request.auth.id)` |
| Create | `@request.auth.role = "admin"` |
| Update | `@request.auth.role = "admin" \|\| id = @request.auth.id` |
| Delete | `@request.auth.role = "admin"` |

Поля: `full_name`, `role` (select), `is_teacher` (bool).

### `courses`

| Rule | Выражение |
|------|-----------|
| List/View | `@request.auth.id != ""` |
| Create/Update/Delete | `@request.auth.role = "admin"` |

### `student_teacher`

| Rule | Выражение |
|------|-----------|
| List/View | `@request.auth.id != "" && (student = @request.auth.id \|\| teacher = @request.auth.id \|\| @request.auth.role ?= "admin\|manager")` |
| Create/Update/Delete | `@request.auth.role ?= "admin\|manager"` |

Unique: `(student, teacher)`.

### `lessons`

| Rule | Выражение |
|------|-----------|
| List/View | `@request.auth.id != "" && (@request.auth.role ?= "admin\|manager" \|\| teacher = @request.auth.id \|\| @collection.lesson_participants.profile ?= @request.auth.id)` |
| Create | `@request.auth.id != "" && (@request.auth.role ?= "admin\|manager\|teacher")` |
| Update | `@request.auth.role ?= "admin\|manager" \|\| teacher = @request.auth.id` |
| Delete | `@request.auth.role ?= "admin\|manager" \|\| teacher = @request.auth.id` |

### `lesson_participants`

| Rule | Выражение |
|------|-----------|
| List/View | `@request.auth.id != "" && (profile = @request.auth.id \|\| @request.auth.role ?= "admin\|manager" \|\| @collection.lessons.teacher ?= @request.auth.id)` |
| Create/Update/Delete | `@request.auth.role ?= "admin\|manager" \|\| @collection.lessons.teacher ?= @request.auth.id` |

### `homework`

| Rule | Выражение |
|------|-----------|
| List/View | `@request.auth.id != "" && (@request.auth.role ?= "admin\|manager" \|\| @collection.lessons.teacher ?= @request.auth.id \|\| @collection.lesson_participants.profile ?= @request.auth.id)` |
| Create/Update/Delete | `@request.auth.id != "" && @collection.lessons.teacher = @request.auth.id` |

### `lesson_audit`

| Rule | Выражение |
|------|-----------|
| List/View | `@request.auth.id != ""` |
| Create | `@request.auth.id != ""` |

## CORS

В админке PocketBase **нет** настройки CORS. По умолчанию разрешены все origins (`*`).

- **Локально** (`npm run pb:serve`) — ничего настраивать не нужно.
- **VPS** — при запуске укажите домен фронта:
  ```bash
  ./pocketbase serve --http=127.0.0.1:8090 --origins=https://app.example.ru
  ```

## SMTP

Settings → Mail — для `/login/forgot-password`.

## Деплой VPS

См. `docs/DEPLOY-VPS.md`.
