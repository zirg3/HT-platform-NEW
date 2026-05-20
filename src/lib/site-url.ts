/** Базовый URL приложения для redirectTo в Supabase Auth. */
export const getSiteOrigin = () => {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (fromEnv) return fromEnv.replace(/\/$/, "")

  const vercel = process.env.VERCEL_URL?.trim()
  if (vercel) return `https://${vercel}`

  return "http://localhost:3000"
}
