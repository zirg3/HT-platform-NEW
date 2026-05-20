import type { Profile } from "@/lib/auth/session"
import type { SchedulePermissions } from "@/lib/schedule/types"
import type { UserRole } from "@/types/roles"

export const getSchedulePermissions = (profile: Profile): SchedulePermissions => {
  switch (profile.role as UserRole) {
    case "teacher":
      return {
        canCreate: true,
        canEdit: true,
        canCancel: true,
        canComplete: true,
        teacherId: profile.id,
      }
    case "student":
      return {
        canCreate: false,
        canEdit: false,
        canCancel: true,
        canComplete: false,
      }
    case "manager":
    case "admin":
      return {
        canCreate: true,
        canEdit: true,
        canCancel: true,
        canComplete: true,
      }
    default:
      return {
        canCreate: false,
        canEdit: false,
        canCancel: false,
        canComplete: false,
      }
  }
}
