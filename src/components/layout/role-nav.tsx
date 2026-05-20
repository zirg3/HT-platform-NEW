"use client"

import { NavLink } from "@/components/layout/nav-link"
import { ROLE_NAV } from "@/lib/auth/nav-links"
import type { UserRole } from "@/types/roles"

type RoleNavProps = {
  role: UserRole
}

export const RoleNav = ({ role }: RoleNavProps) => {
  const items = ROLE_NAV[role]

  return (
    <nav
      className="-mx-1 flex gap-2 overflow-x-auto border-t border-border px-1 pt-3 pb-0.5"
      aria-label="Навигация по разделам"
    >
      {items.map((item) => (
        <NavLink
          key={item.href}
          href={item.href}
          label={item.label}
          exact={item.exact}
        />
      ))}
    </nav>
  )
}
