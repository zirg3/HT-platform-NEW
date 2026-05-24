const trim = (value: string | undefined) => value?.trim() ?? ""

export type PocketBaseEnvResult =
  | { ok: true; url: string }
  | { ok: false; message: string }

export const getPocketBaseEnv = (): PocketBaseEnvResult => {
  const url = trim(import.meta.env.VITE_POCKETBASE_URL)

  if (!url) {
    return {
      ok: false,
      message:
        "Не задан VITE_POCKETBASE_URL. Скопируйте .env.example в .env.local и запустите PocketBase.",
    }
  }

  try {
    const parsed = new URL(url)
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return { ok: false, message: "VITE_POCKETBASE_URL должен быть http(s) URL." }
    }
  } catch {
    return { ok: false, message: "VITE_POCKETBASE_URL — некорректный URL." }
  }

  return { ok: true, url: url.replace(/\/$/, "") }
}

export const getSiteUrl = () =>
  trim(import.meta.env.VITE_SITE_URL) || "http://localhost:5173"
