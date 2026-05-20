"use server"

import { createClient } from "@/lib/supabase/server"
import { getSiteOrigin } from "@/lib/site-url"

export type ForgotPasswordState = {
  error?: string
  success?: boolean
}

export const forgotPasswordAction = async (
  _prevState: ForgotPasswordState,
  formData: FormData
): Promise<ForgotPasswordState> => {
  const email = String(formData.get("email") ?? "").trim()

  if (!email) {
    return { error: "Введите email" }
  }

  const supabase = await createClient()
  const redirectTo = `${getSiteOrigin()}/auth/callback?next=/login/reset-password`

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  })

  if (error) {
    return { error: "Не удалось отправить письмо. Попробуйте позже." }
  }

  return { success: true }
}
