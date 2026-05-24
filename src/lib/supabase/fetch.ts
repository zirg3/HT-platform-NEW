const REQUEST_TIMEOUT_MS = 25_000

/** Fetch для Supabase: таймаут; keepalive только в браузере. */
export const supabaseFetch: typeof fetch = (input, init) => {
  const isBrowser = typeof window !== "undefined"
  const timeoutSignal = AbortSignal.timeout(REQUEST_TIMEOUT_MS)
  const signal =
    init?.signal && "any" in AbortSignal
      ? AbortSignal.any([init.signal, timeoutSignal])
      : timeoutSignal

  return fetch(input, {
    ...init,
    ...(isBrowser ? { keepalive: true } : {}),
    signal,
  })
}
