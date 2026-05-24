export type UserRole = "student" | "teacher" | "manager" | "admin"

export const USER_ROLES: UserRole[] = [
  "student",
  "teacher",
  "manager",
  "admin",
]

export const isUserRole = (value: string): value is UserRole =>
  USER_ROLES.includes(value as UserRole)
