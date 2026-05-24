"use client"

import Link from "next/link"
import { Headphones, Plus, Sparkles, X } from "lucide-react"
import { toZonedTime } from "date-fns-tz"
import { SidebarNavLink } from "@/components/layout/sidebar-nav-link"
import { buttonVariants } from "@/components/ui/button"
import { DEFAULT_TIME_ZONE, SITE_NAME } from "@/lib/constants"
import { ROLE_NAV } from "@/lib/auth/nav-links"
import { getRoleHomePath } from "@/lib/auth/paths"
import { formatWeekParam } from "@/lib/schedule/dates"
import { getSchedulePermissions } from "@/lib/schedule/permissions"
import type { Profile } from "@/lib/auth/session"
import { cn } from "@/lib/utils"

type AppSidebarProps = {
  profile: Profile
  open: boolean
  onClose: () => void
}

export const AppSidebar = ({ profile, open, onClose }: AppSidebarProps) => {
  const items = ROLE_NAV[profile.role]
  const homeHref = getRoleHomePath(profile.role)
  const permissions = getSchedulePermissions(profile)
  const weekToday = formatWeekParam(
    toZonedTime(new Date(), DEFAULT_TIME_ZONE)
  )

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        aria-hidden={!open}
        onClick={onClose}
      />
      <aside
        className={cn(
          "glass-sidebar fixed inset-y-3 left-3 z-50 flex w-[min(100%,17.5rem)] flex-col rounded-3xl border shadow-lg transition-transform duration-200 ease-out sm:inset-y-4 sm:left-4",
          "lg:static lg:z-auto lg:w-56 lg:shrink-0 lg:translate-x-0 xl:w-60",
          open ? "translate-x-0" : "-translate-x-[110%] lg:translate-x-0"
        )}
        aria-label="Основное меню"
      >
        <div className="flex items-center justify-between gap-2 border-b border-sidebar-border/80 px-4 py-4">
          <Link
            href={homeHref}
            className="flex min-w-0 items-center gap-2.5 rounded-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            onClick={onClose}
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Sparkles className="size-4" aria-hidden />
            </span>
            <span className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">
                {SITE_NAME}
              </p>
              <p className="text-[10px] text-muted-foreground">Glass Aurora</p>
            </span>
          </Link>
          <button
            type="button"
            className="inline-flex size-8 items-center justify-center rounded-lg hover:bg-muted lg:hidden"
            onClick={onClose}
            aria-label="Закрыть меню"
          >
            <X className="size-4" />
          </button>
        </div>
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
          {items.map((item) => (
            <SidebarNavLink
              key={item.href}
              href={item.href}
              label={item.label}
              exact={item.exact}
              onNavigate={onClose}
            />
          ))}
        </nav>
        {permissions.canCreate ? (
          <div className="border-t border-sidebar-border/80 p-3">
            <p className="mb-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Быстрые действия
            </p>
            <Link
              href={`${homeHref}?week=${weekToday}`}
              onClick={onClose}
              className={cn(
                buttonVariants({ size: "sm" }),
                "w-full justify-start gap-2 shadow-sm"
              )}
            >
              <Plus className="size-4" aria-hidden />
              Создать занятие
            </Link>
            <p className="mt-2 text-[10px] leading-snug text-muted-foreground">
              Откроется неделя — кликните по свободной ячейке времени
            </p>
          </div>
        ) : null}
        <div className="border-t border-sidebar-border/80 p-3">
          <div className="flex items-start gap-2 rounded-xl bg-sidebar-accent/40 px-2.5 py-2">
            <Headphones className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
            <div>
              <p className="text-xs font-medium text-foreground">Нужна помощь?</p>
              <p className="text-[10px] leading-snug text-muted-foreground">
                Поддержка платформы
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
