"use client"

import { Link, usePathname } from "@/lib/navigation"
import { buttonVariants } from "@/components/ui/button"
import { isNavItemActive } from "@/lib/auth/nav-links"
import { cn } from "@/lib/utils"

type NavLinkProps = {
  href: string
  label: string
  exact?: boolean
  size?: "sm" | "default"
  className?: string
}

export const NavLink = ({
  href,
  label,
  exact,
  size = "sm",
  className,
}: NavLinkProps) => {
  const pathname = usePathname()
  const active = isNavItemActive(pathname, href, exact)

  return (
    <Link
      to={href}
      className={cn(
        buttonVariants({
          variant: active ? "secondary" : "outline",
          size,
        }),
        className
      )}
      aria-current={active ? "page" : undefined}
    >
      {label}
    </Link>
  )
}
