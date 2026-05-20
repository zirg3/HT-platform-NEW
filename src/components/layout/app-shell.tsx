import { logoutAction } from "@/app/login/actions"
import { RoleNav } from "@/components/layout/role-nav"
import { Button } from "@/components/ui/button"
import { ROLE_LABELS } from "@/lib/auth/paths"
import type { Profile } from "@/lib/auth/session"
import { SITE_NAME } from "@/lib/constants"

type AppShellProps = {
  profile: Profile
  children: React.ReactNode
}

export const AppShell = ({ profile, children }: AppShellProps) => {
  const displayName = profile.full_name.trim() || profile.email

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:shadow-md"
      >
        Перейти к содержимому
      </a>
      <header className="border-b border-border bg-card px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-5xl flex-col gap-3">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {SITE_NAME}
              </p>
              <p className="text-sm text-foreground">
                {displayName}{" "}
                <span className="text-muted-foreground">
                  · {ROLE_LABELS[profile.role]}
                </span>
              </p>
            </div>
            <form action={logoutAction}>
              <Button type="submit" variant="outline" size="sm">
                Выйти
              </Button>
            </form>
          </div>
          <RoleNav role={profile.role} />
        </div>
      </header>
      <main
        id="main-content"
        className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-8 sm:px-6"
      >
        {children}
      </main>
    </div>
  )
}
