"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { AppTopbar } from "@/components/layout/app-topbar"
import type { Profile } from "@/lib/auth/session"

type AppShellLayoutProps = {
  profile: Profile
  children: React.ReactNode
}

export const AppShellLayout = ({ profile, children }: AppShellLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="aurora-bg min-h-full flex-1 p-3 sm:p-4">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[60] focus:rounded-lg focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:shadow-md"
      >
        Перейти к содержимому
      </a>
      <div className="mx-auto flex min-h-[calc(100dvh-1.5rem)] max-w-[1600px] gap-3 sm:gap-4 lg:min-h-[calc(100dvh-2rem)]">
        <AppSidebar
          profile={profile}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <div className="glass-main flex min-w-0 flex-1 flex-col overflow-hidden rounded-3xl">
          <AppTopbar
            profile={profile}
            onOpenMenu={() => setSidebarOpen(true)}
          />
          <main
            id="main-content"
            className="flex flex-1 flex-col overflow-y-auto px-4 py-5 sm:px-6 sm:py-6"
          >
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
