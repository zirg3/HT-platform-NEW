import { createClient } from "@/lib/supabase/server"
import type { ProfileRow, StudentTeacherRow } from "@/lib/users/types"
import type { UserRole } from "@/types/roles"

export const fetchProfiles = async (role?: UserRole): Promise<ProfileRow[]> => {
  const supabase = await createClient()
  let query = supabase
    .from("profiles")
    .select("id, full_name, email, role, created_at")
    .order("full_name")

  if (role) query = query.eq("role", role)

  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as ProfileRow[]
}

export const fetchProfileById = async (id: string): Promise<ProfileRow | null> => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, created_at")
    .eq("id", id)
    .maybeSingle()

  if (error) throw error
  return data as ProfileRow | null
}

export const fetchStudentTeacherLinks = async (): Promise<StudentTeacherRow[]> => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("student_teacher")
    .select(
      `
      id,
      student_id,
      teacher_id,
      created_at,
      student:profiles!student_teacher_student_id_fkey ( id, full_name, email ),
      teacher:profiles!student_teacher_teacher_id_fkey ( id, full_name, email )
    `
    )
    .order("created_at", { ascending: false })

  if (error) throw error

  return (data ?? []).map((row) => {
    const item = row as Record<string, unknown>
    const student = item.student
    const teacher = item.teacher
    return {
      ...item,
      student: Array.isArray(student) ? student[0] ?? null : student,
      teacher: Array.isArray(teacher) ? teacher[0] ?? null : teacher,
    } as StudentTeacherRow
  })
}
