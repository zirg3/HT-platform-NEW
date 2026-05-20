"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export type ResetPasswordState = {
  error?: string
}

export const resetPasswordAction = async (
  _prevState: ResetPasswordState,
  formData: FormData
): Promise<ResetPasswordState> => {
  const password = String(formData.get("password") ?? "")
  const passwordConfirm = String(formData.get("password_confirm") ?? "")

  if (password.length < 8) {
    return { error: "Пароль должен быть не короче 8 символов" }
  }

  if (password !== passwordConfirm) {
    return { error: "Пароли не совпадают" }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      error: "Ссылка недействительна или устарела. Запросите восстановление снова.",
    }
  }

  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    return { error: "Не удалось сохранить пароль. Попробуйте ещё раз." }
  }

  await supabase.auth.signOut()
  redirect("/login?reset=success")
}
