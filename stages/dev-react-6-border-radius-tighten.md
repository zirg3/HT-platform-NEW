# dev-react-6 — меньше скругление UI

## Изменения

- **`globals.css`**: `--radius` `1rem` → `0.375rem` (6px) — базовый токен shadcn.
- **Кнопки, инпуты, select, textarea, card, dialog** — `rounded-lg/xl` → `rounded-md/lg`.
- **Sidebar / shell** — `rounded-3xl` → `rounded-xl`; пункты меню `rounded-xl` → `rounded-md`.
- **Account menu dropdown** — `rounded-xl` → `rounded-md`.
- **Формы admin/lesson-dialog** — нативные select `rounded-md`.
- **Календарь, agenda, stats** — панели `rounded-2xl` → `rounded-lg`.

## Проверка

`npm run dev` → кнопки, поля, sidebar, dropdown — углы заметно менее круглые, ближе к макету.
