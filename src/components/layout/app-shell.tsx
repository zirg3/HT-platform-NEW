import { logoutAction } from "@/app/login/actions"
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
      <header className="border-b border-border bg-card px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{SITE_NAME}</p>
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
      </header>
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-8 sm:px-6">
        {children}
      </main>
    </div>
  )
}
