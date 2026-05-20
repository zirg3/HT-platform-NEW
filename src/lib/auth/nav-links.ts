import type { UserRole } from "@/types/roles"

export type NavItem = {
  href: string
  label: string
  exact?: boolean
}

export const ROLE_NAV: Record<UserRole, NavItem[]> = {
  student: [{ href: "/student", label: "Расписание", exact: true }],
  teacher: [
    { href: "/teacher", label: "Расписание", exact: true },
    { href: "/teacher/students", label: "Ученики" },
  ],
  manager: [
    { href: "/manager", label: "Расписание", exact: true },
    { href: "/manager/assignments", label: "Привязки" },
  ],
  admin: [
    { href: "/admin", label: "Расписание", exact: true },
    { href: "/admin/courses", label: "Курсы" },
    { href: "/admin/users", label: "Пользователи" },
    { href: "/admin/assignments", label: "Привязки" },
  ],
}

export const isNavItemActive = (
  pathname: string,
  href: string,
  exact?: boolean
) => {
  if (exact) return pathname === href
  return pathname === href || pathname.startsWith(`${href}/`)
}
