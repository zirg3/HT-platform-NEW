"use server"

import { revalidatePath } from "next/cache"
import { requireRole } from "@/lib/auth/session"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import type { UserRole } from "@/types/roles"

export type UserActionResult = { error?: string }

const ROLES: UserRole[] = ["student", "teacher", "manager", "admin"]

export const createUserAction = async (
  formData: FormData
): Promise<UserActionResult> => {
  await requireRole("admin")

  const email = String(formData.get("email") ?? "").trim().toLowerCase()
  const password = String(formData.get("password") ?? "")
  const fullName = String(formData.get("full_name") ?? "").trim()
  const role = String(formData.get("role") ?? "student") as UserRole

  if (!email || !password) {
    return { error: "Укажите email и пароль" }
  }

  if (password.length < 8) {
    return { error: "Пароль не короче 8 символов" }
  }

  if (!ROLES.includes(role)) {
    return { error: "Некорректная роль" }
  }

  try {
    const admin = createAdminClient()
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      app_metadata: { role },
      user_metadata: { full_name: fullName },
    })

    if (error) return { error: error.message }

    if (data.user && fullName) {
      await admin
        .from("profiles")
        .update({ full_name: fullName })
        .eq("id", data.user.id)
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : "Ошибка создания пользователя"
    return { error: message }
  }

  revalidatePath("/admin/users")
  return {}
}

export const updateProfileAction = async (
  formData: FormData
): Promise<UserActionResult> => {
  await requireRole("admin")

  const profileId = String(formData.get("profile_id") ?? "").trim()
  const fullName = String(formData.get("full_name") ?? "").trim()
  const role = String(formData.get("role") ?? "") as UserRole

  if (!profileId) return { error: "Пользователь не указан" }
  if (!fullName) return { error: "Укажите имя" }
  if (!ROLES.includes(role)) return { error: "Некорректная роль" }

  const supabase = await createClient()
  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName, role })
    .eq("id", profileId)

  if (error) return { error: error.message }

  try {
    const admin = createAdminClient()
    await admin.auth.admin.updateUserById(profileId, {
      app_metadata: { role },
      user_metadata: { full_name: fullName },
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Ошибка синхронизации Auth"
    return { error: message }
  }

  revalidatePath("/admin/users")
  revalidatePath(`/admin/users/${profileId}`)
  return {}
}

export const deleteUserAction = async (
  formData: FormData
): Promise<UserActionResult> => {
  const current = await requireRole("admin")

  const profileId = String(formData.get("profile_id") ?? "").trim()
  if (!profileId) return { error: "Пользователь не указан" }
  if (profileId === current.id) {
    return { error: "Нельзя удалить свою учётную запись" }
  }

  try {
    const admin = createAdminClient()
    const { error } = await admin.auth.admin.deleteUser(profileId)
    if (error) return { error: error.message }
  } catch (e) {
    const message = e instanceof Error ? e.message : "Ошибка удаления"
    return { error: message }
  }

  revalidatePath("/admin/users")
  return {}
}
