import { AppShellLayout } from "@/components/layout/app-shell-layout"
import type { Profile } from "@/lib/auth/session"

type AppShellProps = {
  profile: Profile
  children: React.ReactNode
}

export const AppShell = ({ profile, children }: AppShellProps) => (
  <AppShellLayout profile={profile}>{children}</AppShellLayout>
)
