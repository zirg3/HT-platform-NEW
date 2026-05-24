# PocketBase — пошаговая настройка (Windows)

Схема для платформы репетитора. Время: **~15–20 минут**.

---

## Шаг 0. Запустите PocketBase

```powershell
cd apps/web
npm run pb:serve
```

Оставьте окно открытым. Должно быть: `Server started at http://127.0.0.1:8090`

---

## Шаг 1. Superuser (первый раз)

1. Откройте в браузере: **http://127.0.0.1:8090/_/**
2. Если просит создать админа — задайте **email** и **пароль** (это админ *PocketBase*, не пользователь приложения).
3. Запомните email и пароль — они нужны для скрипта на шаге 3.

---

## Шаг 2. CORS — **пропустите для локальной разработки**

В PocketBase **нет** пункта «Allowed origins» в админке (Settings → Application).

Для локального dev CORS **уже работает**: по умолчанию PocketBase разрешает все origins (`*`), если при запуске не указан флаг `--origins`.

Проверьте только `.env.local`:

```env
VITE_POCKETBASE_URL=http://127.0.0.1:8090
```

> **На VPS** (когда будете деплоить): запускайте PocketBase с явным списком доменов, например  
> `pocketbase serve --http=127.0.0.1:8090 --origins=https://ваш-сайт.ru`

---

## Шаг 3. Авто-настройка коллекций (рекомендуется)

В **новом** терминале PowerShell:

```powershell
cd apps/web
.\scripts\setup-pocketbase-schema.ps1 -Email "ВАШ_SUPERUSER_EMAIL" -Password 'ВАШ_ПАРОЛЬ'
```

> Пароль с символом `@` — используйте **одинарные** кавычки `'...'`, иначе PowerShell может обрезать строку.

Скрипт создаст коллекции и поля в `users`. В конце — «Готово».

**Если ошибка «не удалось подключиться»** — PocketBase не запущен (шаг 0).

**Если «коллекция уже существует»** — скрипт **добавит только недостающие поля** и обновит API rules. Безопасно запускать повторно после изменений в `setup-pocketbase-schema.ps1`.

### Обновление схемы (новые поля / коллекции)

1. Допишите поле или коллекцию в `scripts/setup-pocketbase-schema.ps1`
2. Обновите `docs/POCKETBASE-DATABASE.md`
3. Запустите снова (PocketBase должен быть запущен):

```powershell
.\scripts\setup-pocketbase-schema.ps1 -Email "ВАШ_EMAIL" -Password 'ВАШ_ПАРОЛЬ'
```

В логе: `fields: courses (+1: new_field)` — поле добавлено; `fields: courses (up to date)` — всё актуально.

Скрипт **не удаляет** поля и **не меняет тип** существующих — только добавляет отсутствующие по имени.

---

## Шаг 4. Первый пользователь приложения (admin)

Superuser ≠ пользователь сайта. Нужен user в коллекции **users**:

### Вариант A — через админку

1. **Collections** → **users** → **New record**
2. Заполните:
   - **email**: `admin@test.ru`
   - **password**: пароль (мин. 8 символов)
   - **passwordConfirm**: тот же
   - **full_name**: `Администратор`
   - **role**: `admin`
   - **is_teacher**: выключено (или включите, если админ ведёт учеников)
3. **Create**

### Вариант B — через приложение (после первого admin)

Позже других пользователей создаёт admin в **Админ → Пользователи**.

---

## Шаг 5. Тестовый курс

1. **Collections** → **courses** → **New record**
2. **title**: `Математика`
3. **color**: `#3b82f6`
4. **Create**

---

## Шаг 6. `.env.local` и фронт

Файл `apps/web/.env.local`:

```env
VITE_POCKETBASE_URL=http://127.0.0.1:8090
VITE_SITE_URL=http://localhost:5173
```

Запуск:

```powershell
cd apps/web
npm run dev
```

Откройте **http://localhost:5173** → войдите как `admin@test.ru`.

---

## Шаг 7. Проверка

| Действие | Ожидание |
|----------|----------|
| Вход admin | Кабинет `/admin`, календарь |
| Админ → Курсы | Список с «Математика» |
| Админ → Пользователи | Создание ученика/преподавателя |
| Клик по ячейке календаря | Диалог нового урока |

---

## Ручная настройка (если скрипт не подошёл)

Подробные поля и API rules: [`docs/POCKETBASE-DATABASE.md`](../docs/POCKETBASE-DATABASE.md)

Порядок создания коллекций:

1. Дополнить **users** (поля `full_name`, `role`, `is_teacher` + rules)
2. **courses**
3. **lessons**
4. **lesson_participants**
5. **student_teacher**
6. **homework**
7. **lesson_audit**

---

## Частые проблемы

| Проблема | Решение |
|----------|---------|
| «Нет связи с PocketBase» | PB не запущен или неверный `VITE_POCKETBASE_URL` |
| CORS error в консоли браузера | Локально редко; проверьте `VITE_POCKETBASE_URL`. На VPS — флаг `--origins` |
| 403 при входе | Нет user в `users` или неверный пароль |
| «Профиль не найден» | У user нет поля `role` — проверьте запись в Collections → users |
| `pb_schema.json` | Не импортируйте вручную — используйте **скрипт шага 3** |

---

## Файлы

| Файл | Назначение |
|------|------------|
| `scripts/setup-pocketbase-schema.ps1` | Авто-создание коллекций |
| `docs/POCKETBASE-DATABASE.md` | API rules (справочник) |
| `pocketbase/pb_schema.json` | Справочный JSON (для скрипта, не для ручного импорта в UI) |
