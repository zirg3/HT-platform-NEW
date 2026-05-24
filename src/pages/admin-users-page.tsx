import { useQuery } from "@tanstack/react-query"
import { useSearch } from "@/lib/navigation"
import { UsersManager } from "@/components/admin/users-manager"
import { fetchProfiles } from "@/lib/users/queries"
import { useAuth } from "@/providers/auth-provider"
import type { UserRole } from "@/types/roles"

const ROLES: UserRole[] = ["student", "teacher", "manager", "admin"]

export const AdminUsersPage = () => {
  const { profile } = useAuth()
  const { role: roleParam } = useSearch({ strict: false }) as { role?: string }

  const activeRole =
    roleParam && ROLES.includes(roleParam as UserRole)
      ? (roleParam as UserRole)
      : "all"

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin-users", activeRole],
    queryFn: () =>
      fetchProfiles(activeRole === "all" ? undefined : activeRole),
  })

  if (!profile) return null

  if (isLoading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

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
