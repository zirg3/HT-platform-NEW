# dev-react-3 — pb:setup merge missing fields

## Изменено

- `scripts/setup-pocketbase-schema.ps1` — `Sync-Fields` / `Get-MissingFields`: повторный запуск добавляет только недостающие поля во все коллекции (+ users), обновляет rules
- `pocketbase/SETUP.md` — раздел «Обновление схемы»
- `docs/POCKETBASE-DATABASE.md` — краткий workflow обновления

## Поведение

- `fields: name (+N: field1, field2)` — добавлены поля
- `fields: name (up to date)` — без изменений
- Не удаляет поля, не меняет типы
