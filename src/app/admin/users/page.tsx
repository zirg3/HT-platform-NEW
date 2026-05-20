import type { Metadata } from "next"
import { UsersManager } from "@/components/admin/users-manager"
import { requireRole } from "@/lib/auth/session"
import { fetchProfiles } from "@/lib/users/queries"
import type { UserRole } from "@/types/roles"

export const metadata: Metadata = {
  title: "Пользователи",
}

const ROLES: UserRole[] = ["student", "teacher", "manager", "admin"]

type AdminUsersPageProps = {
  searchParams: Promise<{ role?: string }>
}

export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  const profile = await requireRole("admin")
  const params = await searchParams
  const roleParam = params.role

  const activeRole =
    roleParam && ROLES.includes(roleParam as UserRole)
      ? (roleParam as UserRole)
      : "all"

  const users = await fetchProfiles(activeRole === "all" ? undefined : activeRole)

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Пользователи</h1>
      <UsersManager
        users={users}
        activeRole={activeRole}
        currentUserId={profile.id}
      />
    </div>
  )
}
