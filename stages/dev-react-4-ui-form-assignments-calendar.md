# dev-react-4 — UI fixes: forms, assignments, calendar

## Исправлено

- **Бордеры форм** — `border-border`, класс `.form-field`, стили для input/textarea/select
- **Привязки 400** — `fetchStudentTeacherLinks` без `expand`; отдельная загрузка users по id
- **Календарь** — `keepPreviousData` + skeleton при смене недели (без скачка страницы)
- **Календарь** — явные вертикальные `border-r` между колонками дней

## Файлы

- `week-calendar-skeleton.tsx` (новый)
- `schedule-page-client.tsx`, `week-calendar.tsx`
- `users-queries.ts`, `assignments-pages.tsx`
- `input.tsx`, `textarea.tsx`, `select.tsx`, `globals.css`
- `users-manager.tsx`, `assignments-manager.tsx`, `lesson-dialog.tsx`
