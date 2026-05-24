# dev-react-10 — collapsible + формат дат календаря

## Изменения

- **`collapsible-panel.tsx`**: плавное раскрытие CSS grid `0fr → 1fr` + opacity (300ms), без новых зависимостей.
- **`lesson-dialog`**: анимация блока «Повторять до…», форм переноса и отмены урока.
- **`formatDayHeader`**: формат `ПН, 29 Мая` (abbrev + capitalized month).
- **`week-calendar`**: одна строка заголовка дня вместо день недели + число.

## Проверка

`npm run dev` → создать урок, toggle «Каждую неделю»; календарь — заголовки колонок.
