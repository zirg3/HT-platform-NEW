import { createClient } from "@supabase/supabase-js"
import { supabaseFetch } from "@/lib/supabase/fetch"

/** Service role — только Server Actions / Route Handlers (см. SPEC). */
export const createAdminClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error(
      "Задайте NEXT_PUBLIC_SUPABASE_URL и SUPABASE_SERVICE_ROLE_KEY в .env.local"
    )
  }

  return createClient(url, serviceKey, {
    global: {
      fetch: supabaseFetch,
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
