import type { UserRole } from "@/types/roles"
import type { ProfileBrief } from "@/lib/schedule/types"

export type ProfileRow = ProfileBrief & {
  role: UserRole
  is_teacher: boolean
  created_at: string
}

export type StudentTeacherRow = {
  id: string
  student_id: string
  teacher_id: string
  created_at: string
  student: ProfileBrief | null
  teacher: ProfileBrief | null
}
