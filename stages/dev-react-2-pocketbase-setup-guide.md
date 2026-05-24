# dev-react-2 — PocketBase setup guide + schema script

## Добавлено

- `pocketbase/SETUP.md` — пошаговая инструкция на русском (superuser → CORS → скрипт → admin user → dev)
- `scripts/setup-pocketbase-schema.ps1` — авто-создание коллекций через PocketBase API
- `npm run pb:setup` в `package.json`
- `docs/POCKETBASE-DATABASE.md` — ссылка на SETUP.md, предупреждение про ручной импорт `pb_schema.json`

## Изменено

- `pocketbase/README.md` — команда `pb:setup`, ссылка на SETUP.md

## Примечание

`pocketbase/pb_schema.json` — справочный JSON; импорт через UI не работает из-за динамических ID коллекций. Используйте скрипт.
