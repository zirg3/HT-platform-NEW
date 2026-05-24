"use client"

import { Menu } from "lucide-react"
import { AccountMenu } from "@/components/layout/account-menu"
import { Button } from "@/components/ui/button"
import type { Profile } from "@/lib/auth/session"

type AppTopbarProps = {
  profile: Profile
  onOpenMenu: () => void
}

export const AppTopbar = ({ profile, onOpenMenu }: AppTopbarProps) => {
  return (
    <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/35 px-4 py-3 sm:px-6">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="shrink-0 lg:hidden"
        onClick={onOpenMenu}
        aria-label="Открыть меню"
      >
        <Menu className="size-5" />
      </Button>
      <div className="flex-1 lg:hidden" />
      <div className="ml-auto">
        <AccountMenu profile={profile} />
      </div>
    </div>
  )
}
