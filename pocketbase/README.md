# PocketBase — локально и VPS

Подробные **API rules**: [`docs/POCKETBASE-DATABASE.md`](../docs/POCKETBASE-DATABASE.md)  
**Пошаговая настройка**: [`pocketbase/SETUP.md`](../pocketbase/SETUP.md)  
**Деплой VPS**: [`docs/DEPLOY-VPS.md`](../docs/DEPLOY-VPS.md)

## Быстрый старт (Windows)

```powershell
cd apps/web
npm run pb:serve
```

Админка: http://127.0.0.1:8090/_/ — при первом запуске создайте superuser.

**Схема коллекций** (после superuser):

```powershell
npm run pb:setup -- -Email "ваш@email" -Password "ваш_пароль"
```

Или см. [`SETUP.md`](./SETUP.md).

`.env.local`:

```env
VITE_POCKETBASE_URL=http://127.0.0.1:8090
VITE_SITE_URL=http://localhost:5173
```

Фронт:

```powershell
npm install
npm run dev
```

## Коллекции (создать в админке)

### `users` (Auth collection)

Расширить поля:

| Поле | Тип | Примечание |
|------|-----|------------|
| full_name | Text | |
| role | Select | student, teacher, manager, admin |
| is_teacher | Bool | default false |

**API Rules (пример):**

- List/View: `@request.auth.id != "" && (@request.auth.role ?= "admin|manager" || id = @request.auth.id)`
- Create: `@request.auth.role = "admin"`
- Update: `@request.auth.role = "admin" || id = @request.auth.id`
- Delete: `@request.auth.role = "admin"`

### `courses`

| Поле | Тип |
|------|-----|
| title | Text |
| color | Text |

Rules: authenticated read; write admin.

### `student_teacher`

| Поле | Тип |
|------|-----|
| student | Relation → users |
| teacher | Relation → users |

Rules: staff write; involved users read.

### `lessons`

| Поле | Тип |
|------|-----|
| starts_at | Date |
| duration_minutes | Number |
| course | Relation → courses |
| teacher | Relation → users |
| status | Select | scheduled, cancelled, completed |
| note | Text |
| meeting_url | URL |
| recurrence_group_id | Text |
| cancelled_at | Date |
| cancelled_by | Relation → users |
| cancellation_reason | Text |
| rescheduled_at | Date |
| rescheduled_by | Relation → users |
| original_starts_at | Date |

Rules: см. матрицу прав SPEC (staff / teacher / participant).

### `lesson_participants`

| Поле | Тип |
|------|-----|
| lesson | Relation → lessons |
| profile | Relation → users |

### `homework`

| Поле | Тип |
|------|-----|
| lesson | Relation → lessons (unique) |
| body | Text |

### `lesson_audit`

| Поле | Тип |
|------|-----|
| lesson | Relation → lessons |
| action | Select | created, updated, cancelled |
| actor | Relation → users |
| meta | JSON |

## Первый админ

1. Запустить PocketBase, открыть `/_/`, создать superuser.
2. В **Collections → users** создать запись с role=admin или изменить role у superuser-записи в users (если используете auth users).

## SMTP (позже)

Settings → Mail: для `/login/forgot-password`. До настройки UI работает, письмо не уйдёт.

## VPS

Скопировать бинарник + `pb_data`, systemd + nginx + HTTPS. CORS: флаг `--origins=https://ваш-домен.ru` при запуске (в админке нет).
