import { getPocketBase } from "@/lib/pocketbase/client"
import type { ProfileRow, StudentTeacherRow } from "@/lib/users/types"
import type { UserRole } from "@/types/roles"

const mapUserToProfile = (user: {
  id: string
  full_name?: string
  email: string
  role: UserRole
  is_teacher?: boolean
  created: string
}): ProfileRow => ({
  id: user.id,
  full_name: user.full_name ?? "",
  email: user.email ?? "",
  role: user.role,
  is_teacher: Boolean(user.is_teacher),
  created_at: user.created,
})

const fetchUsersByIds = async (ids: string[]) => {
  if (ids.length === 0) {
    return new Map<string, ProfileRow>()
  }

  const pb = getPocketBase()
  const uniqueIds = [...new Set(ids)]
  const filter = uniqueIds.map((id) => `id = "${id}"`).join(" || ")
  const { items } = await pb.collection("users").getList<ProfileRow>(1, 500, {
    filter,
  })

  return new Map(items.map((user) => [user.id, mapUserToProfile(user)]))
}

export const fetchProfiles = async (role?: UserRole): Promise<ProfileRow[]> => {
  const pb = getPocketBase()
  const filter = role ? `role = "${role}"` : ""

  const { items } = await pb.collection("users").getList<ProfileRow>(1, 500, {
    filter: filter || undefined,
    sort: "full_name",
  })

  return items.map(mapUserToProfile)
}

export const fetchProfileById = async (id: string): Promise<ProfileRow | null> => {
  const pb = getPocketBase()
  try {
    const user = await pb.collection("users").getOne<ProfileRow>(id)
    return mapUserToProfile(user)
  } catch {
    return null
  }
}

export const fetchStudentTeacherLinks = async (): Promise<StudentTeacherRow[]> => {
  const pb = getPocketBase()
  const { items } = await pb.collection("student_teacher").getList<{
    id: string
    student: string
    teacher: string
    created: string
  }>(1, 500)

  const profileMap = await fetchUsersByIds(
    items.flatMap((row) => [row.student, row.teacher].filter(Boolean))
  )

  return items
    .map((row) => ({
      id: row.id,
      student_id: row.student,
      teacher_id: row.teacher,
      created_at: row.created,
      student: profileMap.get(row.student) ?? null,
      teacher: profileMap.get(row.teacher) ?? null,
    }))
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
}
