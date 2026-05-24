# dev-react-12 — редактирование email в админке

## Изменения

- **`users-manager`**: поле Email редактируемое; при смене — `ConfirmDialog` перед сохранением.
- **`updateProfileAction`**: email в payload; формат; проверка уникальности (filter PB); `verified: true` при смене email.

## Проверка

`/admin/users` → изменить email → модалка → сохранить. Дубликат email — ошибка в alert.
