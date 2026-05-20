import { AppShell } from "@/components/layout/app-shell"
import { requireRole } from "@/lib/auth/session"

export default async function ManagerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const profile = await requireRole("manager")

  return <AppShell profile={profile}>{children}</AppShell>
}
