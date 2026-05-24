"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { NavIcon } from "@/lib/auth/nav-icons"
import { isNavItemActive } from "@/lib/auth/nav-links"
import { cn } from "@/lib/utils"

type SidebarNavLinkProps = {
  href: string
  label: string
  exact?: boolean
  onNavigate?: () => void
}

export const SidebarNavLink = ({
  href,
  label,
  exact,
  onNavigate,
}: SidebarNavLinkProps) => {
  const pathname = usePathname()
  const active = isNavItemActive(pathname, href, exact)

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        active
          ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
          : "text-sidebar-foreground/85 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
      )}
      aria-current={active ? "page" : undefined}
    >
      <NavIcon
        href={href}
        className={active ? "text-primary" : "text-muted-foreground"}
      />
      <span className="truncate">{label}</span>
    </Link>
  )
}
