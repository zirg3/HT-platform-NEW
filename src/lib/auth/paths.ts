import type { UserRole } from "@/types/roles"

export const ROLE_HOME_PATH: Record<UserRole, string> = {
  student: "/student",
  teacher: "/teacher",
  manager: "/manager",
  admin: "/admin",
}

export const ROLE_LABELS: Record<UserRole, string> = {
  student: "Ученик",
  teacher: "Преподаватель",
  manager: "Менеджер",
  admin: "Администратор",
}

export const getRoleHomePath = (role: UserRole) => ROLE_HOME_PATH[role]
