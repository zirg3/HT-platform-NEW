# Платформа для преподавания (Vite + PocketBase)

Ветка **dev-react**: React SPA.

## Быстрый старт

```powershell
cd apps/web

# PocketBase: скачать pocketbase.exe → pocketbase/bin/
npm run pb:serve

# .env.local — см. .env.example
npm install
npm run dev
```

Открыть http://localhost:5173

## Документация

- [PocketBase — схема и rules](docs/POCKETBASE-DATABASE.md)
- [Деплой на VPS](docs/DEPLOY-VPS.md)
- [Журнал миграции](stages/dev-react-1-migration-complete.md)

## Сборка

```powershell
npm run build   # dist/ — статика для nginx
npm run preview
```

## Стек

Vite · React 19 · TypeScript · PocketBase · TanStack Router · TanStack Query · Tailwind · shadcn/ui
