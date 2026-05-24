# Ветки

| Ветка | Назначение |
|-------|------------|
| `dev-react` | Vite + PocketBase (текущая миграция) |
| `dev` | Интеграция готовых этапов (Next + Supabase, legacy) |
| `dev-0.N` | Одна итерация (фича/этап Road-map) |
| `main` / `prod` | Релиз |

## Новая итерация

```powershell
cd apps/web
.\scripts\new-dev-branch.ps1
```

Или вручную:

```powershell
git checkout dev
git pull origin dev
git checkout -b dev-0.3
```

После работы — Pull Request `dev-0.3` → `dev`.
