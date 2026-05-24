const RETRYABLE =
  /ECONNRESET|terminated|fetch failed|ETIMEDOUT|network/i

export const isRetryableFetchError = (error: unknown): boolean => {
  if (!error) return false
  const message =
    error instanceof Error
      ? `${error.message} ${error.cause instanceof Error ? error.cause.message : ""}`
      : String(error)
  return RETRYABLE.test(message)
}

export const withFetchRetry = async <T>(
  operation: () => Promise<T>,
  attempts = 4
): Promise<T> => {
  let lastError: unknown
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      if (!isRetryableFetchError(error) || attempt === attempts - 1) {
        throw error
      }
      await new Promise((resolve) =>
        setTimeout(resolve, 500 * (attempt + 1))
      )
    }
  }
  throw lastError
}
