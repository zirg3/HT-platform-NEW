# dev-react-5 — mockup polish + user create fix

## UI (ближе к макету)

- Ярче aurora-градиенты + диагональный слой
- Прозрачнее sidebar / main / cards / glass-panel
- Пурпурный primary (`oklch(0.58 0.22 274)`)
- Активное меню: текст и иконка primary, фон `primary/12`
- Текущий день: `.calendar-today-badge` — пурпурный круг

## Bugfix: создание пользователя 400

- PocketBase: `is_teacher` **required=true** не принимает `false` (считает blank)
- Скрипт: `is_teacher` → required=false + патч существующего поля
- `createUserAction`: `emailVisibility: false`, fallback `full_name`

## Действие

Перезапустить `pb:setup` или в админке: users → is_teacher → Required **выкл**
