import { getPocketBase } from "@/lib/pocketbase/client"
import { getPocketBaseErrorMessage } from "@/lib/pocketbase/errors"
import { ClientResponseError } from "pocketbase"
import { mapUserToProfile, type PocketBaseUserRecord } from "@/types/profile"
import type { UserRole } from "@/types/roles"
import { isUserRole } from "@/types/roles"

export type UserActionResult = { error?: string }

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const normalizeEmail = (value: FormDataEntryValue | null) =>
  String(value ?? "").trim().toLowerCase()

const escapeFilterValue = (value: string) =>
  value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')

const isEmailTakenByOther = async (
  pb: ReturnType<typeof getPocketBase>,
  email: string,
  profileId: string
) => {
  try {
    const existing = await pb.collection("users").getFirstListItem<{ id: string }>(
      `email = "${escapeFilterValue(email)}"`
    )
    return existing.id !== profileId
  } catch (e) {
    if (e instanceof ClientResponseError && e.status === 404) {
      return false
    }
    throw e
  }
}

const requireAdmin = () => {
  const pb = getPocketBase()
  const model = pb.authStore.model as PocketBaseUserRecord | null
  if (!model || model.role !== "admin") {
    throw new Error("Недостаточно прав")
  }
  return mapUserToProfile(model)
}

export const createUserAction = async (
  formData: FormData
): Promise<UserActionResult> => {
  requireAdmin()

  const email = String(formData.get("email") ?? "").trim().toLowerCase()
  const password = String(formData.get("password") ?? "")
  const fullName = String(formData.get("full_name") ?? "").trim()
  const role = String(formData.get("role") ?? "student")
  const isTeacherFlag =
    role === "teacher" || formData.get("is_teacher") === "on"

  if (!email || !password) {
    return { error: "Укажите email и пароль" }
  }

  if (password.length < 8) {
    return { error: "Пароль не короче 8 символов" }
  }

  if (!isUserRole(role)) {
    return { error: "Некорректная роль" }
  }

  try {
    const pb = getPocketBase()
    await pb.collection("users").create({
      email,
      password,
      passwordConfirm: password,
      emailVisibility: true,
      full_name: fullName || email,
      role,
      is_teacher: isTeacherFlag,
    })
  } catch (e) {
    return { error: getPocketBaseErrorMessage(e, "Не удалось создать пользователя") }
  }

  return {}
}

export const updateProfileAction = async (
  formData: FormData
): Promise<UserActionResult> => {
  requireAdmin()

  const profileId = String(formData.get("profile_id") ?? "").trim()
  const fullName = String(formData.get("full_name") ?? "").trim()
  const email = normalizeEmail(formData.get("email"))
  const previousEmail = normalizeEmail(formData.get("previous_email"))
  const role = String(formData.get("role") ?? "")
  const isTeacherFlag =
    role === "teacher" || formData.get("is_teacher") === "on"

  if (!profileId) return { error: "Пользователь не указан" }
  if (!fullName) return { error: "Укажите имя" }
  if (!email) return { error: "Укажите email" }
  if (!EMAIL_PATTERN.test(email)) {
    return { error: "Некорректный формат email" }
  }
  if (!isUserRole(role)) return { error: "Некорректная роль" }

  try {
    const pb = getPocketBase()

    if (email !== previousEmail) {
      const taken = await isEmailTakenByOther(pb, email, profileId)
      if (taken) {
        return { error: "Пользователь с таким email уже существует" }
      }
    }

    const payload: Record<string, unknown> = {
      full_name: fullName,
      role,
      is_teacher: isTeacherFlag,
      emailVisibility: true,
    }

    if (email !== previousEmail) {
      payload.email = email
      payload.verified = true
    }

    await pb.collection("users").update(profileId, payload)
  } catch (e) {
    return {
      error: getPocketBaseErrorMessage(e, "Ошибка обновления пользователя"),
    }
  }

  return {}
}

export const deleteUserAction = async (
  formData: FormData
): Promise<UserActionResult> => {
  const current = requireAdmin()

  const profileId = String(formData.get("profile_id") ?? "").trim()
  if (!profileId) return { error: "Пользователь не указан" }
  if (profileId === current.id) {
    return { error: "Нельзя удалить свою учётную запись" }
  }

  try {
    const pb = getPocketBase()
    await pb.collection("users").delete(profileId)
  } catch (e) {
    const message = e instanceof Error ? e.message : "Ошибка удаления"
    return { error: message }
  }

  return {}
}

export type { UserRole }
