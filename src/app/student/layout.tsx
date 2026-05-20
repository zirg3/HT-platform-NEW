import { AppShell } from "@/components/layout/app-shell"
import { requireRole } from "@/lib/auth/session"

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const profile = await requireRole("student")

  return <AppShell profile={profile}>{children}</AppShell>
}
