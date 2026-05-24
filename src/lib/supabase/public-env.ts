export type SupabasePublicEnv =
  | { ok: true; url: string; anonKey: string }
  | { ok: false; message: string }

export const getSupabasePublicEnv = (): SupabasePublicEnv => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(/\/$/, "")
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()

  if (!url || !anonKey) {
    return {
      ok: false,
      message:
        "В .env.local задайте NEXT_PUBLIC_SUPABASE_URL и NEXT_PUBLIC_SUPABASE_ANON_KEY (без пробелов после =).",
    }
  }

  if (!url.startsWith("https://") || !url.includes(".supabase.co")) {
    return {
      ok: false,
      message:
        "NEXT_PUBLIC_SUPABASE_URL должен быть вида https://ваш-проект.supabase.co",
    }
  }

  return { ok: true, url, anonKey }
}
