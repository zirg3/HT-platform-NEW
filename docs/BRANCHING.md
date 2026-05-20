# Ветки

| Ветка | Назначение |
|-------|------------|
| `dev` | Интеграция готовых этапов |
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
