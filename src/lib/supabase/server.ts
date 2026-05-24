import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { supabaseFetch } from "@/lib/supabase/fetch"
import { getSupabasePublicEnv } from "@/lib/supabase/public-env"

export const createClient = async () => {
  const env = getSupabasePublicEnv()
  if (!env.ok) {
    throw new Error(env.message)
  }

  const cookieStore = await cookies()

  return createServerClient(env.url, env.anonKey, {
    global: {
      fetch: supabaseFetch,
    },
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // setAll из Server Component — игнорируем; сессию обновляет middleware
        }
      },
    },
  })
}
