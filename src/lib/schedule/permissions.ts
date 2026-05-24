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
        canReschedule: true,
        teacherId: profile.id,
      }
    case "student":
      return {
        canCreate: false,
        canEdit: false,
        canCancel: true,
        canComplete: false,
        canReschedule: false,
      }
    case "manager":
    case "admin":
      return {
        canCreate: true,
        canEdit: true,
        canCancel: true,
        canComplete: true,
        canReschedule: true,
        teacherId: profile.is_teacher ? profile.id : undefined,
      }
    default:
      return {
        canCreate: false,
        canEdit: false,
        canCancel: false,
        canComplete: false,
        canReschedule: false,
      }
  }
}

export const canRescheduleLesson = (
  profile: Profile,
  lessonTeacherId: string
) => {
  if (profile.role === "admin" || profile.role === "manager") return true
  if (profile.role === "teacher") return profile.id === lessonTeacherId
  return false
}

export const canCompleteLessonNow = (startsAtIso: string) =>
  new Date() >= new Date(startsAtIso)
