import { getPocketBase } from "@/lib/pocketbase/client"
import { getSiteUrl } from "@/lib/pocketbase/env"

export type ForgotPasswordState = {
  error?: string
  success?: boolean
}

export const requestPasswordReset = async (email: string): Promise<ForgotPasswordState> => {
  if (!email.trim()) {
    return { error: "Введите email" }
  }

  try {
    const pb = getPocketBase()
    await pb.collection("users").requestPasswordReset(email.trim(), {
      url: `${getSiteUrl()}/login/reset-password`,
    })
    return { success: true }
  } catch {
    return { error: "Не удалось отправить письмо. Попробуйте позже." }
  }
}

export type ResetPasswordState = {
  error?: string
  success?: boolean
}

export const confirmPasswordReset = async (
  token: string,
  password: string,
  passwordConfirm: string
): Promise<ResetPasswordState> => {
  if (password.length < 8) {
    return { error: "Пароль должен быть не короче 8 символов" }
  }

  if (password !== passwordConfirm) {
    return { error: "Пароли не совпадают" }
  }

  if (!token) {
    return {
      error: "Ссылка недействительна или устарела. Запросите восстановление снова.",
    }
  }

  try {
    const pb = getPocketBase()
    await pb.collection("users").confirmPasswordReset(token, password, passwordConfirm)
    pb.authStore.clear()
    return { success: true }
  } catch {
    return { error: "Не удалось сохранить пароль. Попробуйте ещё раз." }
  }
}
