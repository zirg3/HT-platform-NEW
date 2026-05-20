"use server"

import { redirect } from "next/navigation"
import { getRoleHomePath } from "@/lib/auth/paths"
import { createClient } from "@/lib/supabase/server"
import type { UserRole } from "@/types/roles"

export type LoginState = {
  error?: string
}

export const loginAction = async (
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> => {
  const email = String(formData.get("email") ?? "").trim()
  const password = String(formData.get("password") ?? "")

  if (!email || !password) {
    return { error: "Введите email и пароль" }
  }

  const supabase = await createClient()
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (signInError) {
    return { error: "Неверный email или пароль" }
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .single()

  if (profileError || !profile?.role) {
    return { error: "Профиль не найден. Обратитесь к администратору." }
  }

  const nextPath = String(formData.get("next") ?? "").trim()
  const roleHome = getRoleHomePath(profile.role as UserRole)

  if (nextPath && nextPath.startsWith("/") && !nextPath.startsWith("/login")) {
    redirect(nextPath)
  }

  redirect(roleHome)
}

export const logoutAction = async () => {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/login")
}
