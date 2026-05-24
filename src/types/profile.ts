export type UserRole = "student" | "teacher" | "manager" | "admin"

export type Profile = {
  id: string
  full_name: string
  email: string
  role: UserRole
  is_teacher: boolean
  created_at: string
}

export type PocketBaseUserRecord = {
  id: string
  email: string
  full_name: string
  role: UserRole
  is_teacher: boolean
  created: string
}

export const mapUserToProfile = (user: PocketBaseUserRecord): Profile => ({
  id: user.id,
  full_name: user.full_name ?? "",
  email: user.email,
  role: user.role ?? "student",
  is_teacher: Boolean(user.is_teacher),
  created_at: user.created,
})
