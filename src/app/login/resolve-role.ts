"use server"

import { getRoleHomePath } from "@/lib/auth/paths"
import { createClient } from "@/lib/supabase/server"
import { withFetchRetry } from "@/lib/supabase/retry"
import type { UserRole } from "@/types/roles"

export type ResolveLoginRoleResult = {
  redirectTo?: string
  error?: string
}

const parseRole = (value: unknown): UserRole | null => {
  if (
    value === "student" ||
    value === "teacher" ||
    value === "manager" ||
    value === "admin"
  ) {
    return value
  }
  return null
}

export const resolveLoginRoleAction = async (
  nextPath?: string
): Promise<ResolveLoginRoleResult> => {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return { error: "Сессия не установлена. Попробуйте войти снова." }
    }

    const profile = await withFetchRetry(async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle()

      if (error) throw error
      return data
    })

    const role =
      parseRole(profile?.role) ?? parseRole(user.app_metadata?.role)

    if (!role) {
      return {
        error:
          "Профиль не найден в базе. Администратор должен создать запись в profiles или выполнить скрипт backfill (см. docs/SUPABASE-DATABASE.md).",
      }
    }

    const roleHome = getRoleHomePath(role)
    const redirectTo =
      nextPath && nextPath.startsWith("/") && !nextPath.startsWith("/login")
        ? nextPath
        : roleHome

    return { redirectTo }
  } catch {
    return {
      error:
        "Нет связи с Supabase. Проверьте интернет и что проект не приостановлен в Dashboard.",
    }
  }
}
