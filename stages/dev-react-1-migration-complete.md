# dev-react — миграция завершена

## Стек

- **Vite 7** + React 19 + TypeScript
- **PocketBase** — auth + SQLite + API
- **TanStack Router** — маршруты 1:1
- **TanStack Query** — данные расписания и админки
- **Tailwind 4** + Glass Aurora (`src/styles/globals.css`)

## Функционал (паритет с Next + Supabase)

- Вход / выход / forgot-reset password (UI)
- Роли: student, teacher, manager, admin
- Недельный календарь, CRUD уроков, серии, отмена, перенос, проведение + ДЗ
- Списки предстоящих/прошедших (agenda)
- Админ: users, courses, assignments
- Преподаватель: ученики, профиль ученика, история отмен

## Удалено из `apps/web`

- `src/app/` (Next App Router)
- `src/middleware.ts`, `next.config.ts`, `next-env.d.ts`
- `src/lib/supabase/`, `supabase/migrations/`
- Server Actions (`src/app/actions/`)
- `docs/SUPABASE-DATABASE.md`
- Server-only schedule helpers (`cached-queries`, `schedule-data`, …)

## Новые пути

| Было | Стало |
|------|--------|
| `src/app/globals.css` | `src/styles/globals.css` |
| Server Actions | `src/lib/actions/*` |
| Supabase queries | `src/lib/pocketbase/*` |
| `SchedulePage` (RSC) | `SchedulePageClient` |

## Запуск

```powershell
# 1. pocketbase.exe → pocketbase/bin/
npm run pb:serve
# 2. коллекции — docs/POCKETBASE-DATABASE.md
# 3. .env.local
npm run dev
```

## Сборка

```powershell
npm run build   # → dist/
```

## Git

Изменения только в рабочей папке ветки `dev-react`. Коммит — по запросу.
