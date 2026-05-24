import { cache } from "react"
import { redirect } from "next/navigation"
import { getRoleHomePath } from "@/lib/auth/paths"
import { createClient } from "@/lib/supabase/server"
import type { UserRole } from "@/types/roles"

export type Profile = {
  id: string
  full_name: string
  email: string
  role: UserRole
  is_teacher: boolean
  created_at: string
}

export const getSessionProfile = cache(async (): Promise<Profile | null> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, is_teacher, created_at")
    .eq("id", user.id)
    .single()

  if (error || !profile) return null

  return profile as Profile
})

export const requireRole = async (role: UserRole): Promise<Profile> => {
  const profile = await getSessionProfile()

  if (!profile) {
    redirect("/login")
  }

  if (profile.role !== role) {
    redirect(getRoleHomePath(profile.role))
  }

  return profile
}

export const requireAuth = async (): Promise<Profile> => {
  const profile = await getSessionProfile()

  if (!profile) {
    redirect("/login")
  }

  return profile
}

export const requireStaff = async (): Promise<Profile> => {
  const profile = await requireAuth()

  if (profile.role !== "manager" && profile.role !== "admin") {
    redirect(getRoleHomePath(profile.role))
  }

  return profile
}
