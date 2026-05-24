# dev-react-11 — email admin + ConfirmDialog

## Email в списке пользователей

- **Причина**: PocketBase скрывает `email` при `emailVisibility: false`.
- **Fix**: при create/update — `emailVisibility: true` в `users.ts`.
- **UI**: placeholder «—» + подсказка, если email ещё скрыт (старые записи — «Сохранить»).

## Подтверждения вместо alert

- **`confirm-dialog.tsx`**: модалка на существующем `@base-ui/react/dialog` (без новых deps).
- Заменены `window.confirm` в users, courses, assignments, lesson-dialog.

## Проверка

Создать пользователя → email в списке. Удаление — стеклянная модалка.
