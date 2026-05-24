import { Outlet } from "@tanstack/react-router"
import { AppShell } from "@/components/layout/app-shell"
import { useAuth } from "@/providers/auth-provider"

export const RoleLayout = () => {
  const { profile, isLoading } = useAuth()

  if (isLoading || !profile) {
    return (
      <div className="aurora-bg flex min-h-full flex-1 items-center justify-center">
        <div
          className="size-10 animate-spin rounded-full border-2 border-primary border-t-transparent"
          role="status"
          aria-label="Загрузка"
        />
      </div>
    )
  }

  return (
    <AppShell profile={profile}>
      <Outlet />
    </AppShell>
  )
}
