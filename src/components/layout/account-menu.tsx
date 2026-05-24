"use client"

import { useEffect, useId, useRef, useState } from "react"
import { ChevronDown, LogOut } from "lucide-react"
import { logoutAction } from "@/app/login/actions"
import { UserAvatarPlaceholder } from "@/components/layout/user-avatar-placeholder"
import { Button } from "@/components/ui/button"
import { ROLE_LABELS } from "@/lib/auth/paths"
import type { Profile } from "@/lib/auth/session"
import { cn } from "@/lib/utils"

type AccountMenuProps = {
  profile: Profile
}

export const AccountMenu = ({ profile }: AccountMenuProps) => {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const menuId = useId()
  const displayName = profile.full_name.trim() || profile.email

  useEffect(() => {
    if (!open) return

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }

    document.addEventListener("mousedown", handlePointerDown)
    document.addEventListener("keydown", handleEscape)
    return () => {
      document.removeEventListener("mousedown", handlePointerDown)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [open])

  const handleToggle = () => setOpen((value) => !value)

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      handleToggle()
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className="flex items-center gap-2.5 rounded-lg px-1 py-1 text-left transition-colors hover:bg-black/[0.03] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:gap-3 sm:px-2"
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
      >
        <UserAvatarPlaceholder displayName={displayName} size="md" variant="photo" />
        <span className="hidden min-w-0 sm:block">
          <span className="block truncate text-sm font-semibold leading-tight text-foreground">
            {displayName}
          </span>
          <span className="block truncate text-xs text-muted-foreground">
            {ROLE_LABELS[profile.role]}
          </span>
        </span>
        <ChevronDown
          className={cn(
            "hidden size-4 shrink-0 text-muted-foreground transition-transform sm:block",
            open && "rotate-180"
          )}
          aria-hidden
        />
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          className="glass-panel absolute top-full right-0 z-50 mt-2 min-w-[12rem] overflow-hidden rounded-xl border border-border py-1 shadow-lg"
        >
          <div className="border-b border-border/60 px-3 py-2 sm:hidden">
            <p className="truncate text-sm font-semibold">{displayName}</p>
            <p className="truncate text-xs text-muted-foreground">
              {ROLE_LABELS[profile.role]}
            </p>
          </div>
          <form action={logoutAction} className="p-1">
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
              role="menuitem"
              onClick={() => setOpen(false)}
            >
              <LogOut className="size-4" aria-hidden />
              Выйти
            </Button>
          </form>
        </div>
      ) : null}
    </div>
  )
}
