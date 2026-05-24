import { createBrowserClient } from "@supabase/ssr"
import { getSupabasePublicEnv } from "@/lib/supabase/public-env"

export const createClient = () => {
  const env = getSupabasePublicEnv()
  if (!env.ok) {
    throw new Error(env.message)
  }

  return createBrowserClient(env.url, env.anonKey)
}
