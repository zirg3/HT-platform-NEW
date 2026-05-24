import { ClientResponseError } from "pocketbase"

const mapPocketBaseMessage = (message: string) => {
  if (/values don't match/i.test(message)) {
    return "Пользователь с таким email уже существует"
  }
  return message
}

export const getPocketBaseErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof ClientResponseError) {
    const data = error.response?.data as Record<string, { message?: string }> | undefined
    if (data) {
      if (data.email?.message) {
        return mapPocketBaseMessage(data.email.message)
      }
      const first = Object.values(data).find((v) => v?.message)?.message
      if (first) return mapPocketBaseMessage(first)
    }
    if (error.message && error.message !== "Something went wrong while processing your request.") {
      return mapPocketBaseMessage(error.message)
    }
    if (error.status === 403) return "Недостаточно прав для этой операции"
    if (error.status === 400) return "Некорректный запрос к серверу. Обновите страницу и попробуйте снова."
  }
  if (error instanceof Error && error.message) {
    return mapPocketBaseMessage(error.message)
  }
  return fallback
}
