# dev-react-9 — admin UI: выравнивание, switch, hover, cursor

## Изменения

- **`users-manager`**: строки пользователей — grid + `items-center`; переключатель «Также преподаватель» на одной линии с полями и «Сохранить».
- **`courses-manager`**: аналогичное выравнивание строк курсов.
- **`switch.tsx`**: выключенное состояние — лавандовый фон, border `primary/35`, inset-тень.
- **`admin-form-align.tsx`**: невидимый spacer под лейбл — кнопки и toggle на линии с инпутами (`items-end`).
- **Пользователи / Курсы**: переключатель, «Сохранить», «Удалить» выровнены по нижнему краю полей.

- **Hover**: `ghost`/`outline` кнопки, select, sidebar, account-menu, календарь, карточки — `primary/10–14` вместо почти прозрачного `muted`.
- **`globals.css`**: `cursor: pointer` на кнопки, ссылки, select, switch, label[for].

## Проверка

`npm run dev` → `/admin/users`, `/admin/courses`: элементы в строке по центру; toggle фиолетовый; hover заметнее; курсор pointer на интерактиве.
