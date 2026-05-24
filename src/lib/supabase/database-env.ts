/**
 * Прямое подключение Postgres (CLI, psql, drizzle).
 * REST/Server Actions по-прежнему используют NEXT_PUBLIC_SUPABASE_URL.
 */

export const getDatabasePoolerUrl = (): string | undefined =>
  process.env.DATABASE_POOLER_URL?.trim() ||
  process.env.SUPABASE_DB_URL?.trim() ||
  undefined

export const getDatabaseDirectUrl = (): string | undefined =>
  process.env.DATABASE_URL?.trim() || undefined

/** Для миграций: pooler (6543, transaction) предпочтительнее на serverless. */
export const getDatabaseUrlForMigrations = (): string | undefined =>
  getDatabasePoolerUrl() ?? getDatabaseDirectUrl()

export const assertDatabasePoolerConfigured = () => {
  const url = getDatabasePoolerUrl()
  if (!url) {
    throw new Error(
      "DATABASE_POOLER_URL не задан. См. apps/web/docs/SUPABASE-DATABASE.md"
    )
  }
  return url
}
