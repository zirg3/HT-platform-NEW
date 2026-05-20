import type { Metadata } from "next"
import { AssignmentsManager } from "@/components/admin/assignments-manager"
import { fetchAllStudents, fetchTeachers } from "@/lib/schedule/queries"
import { fetchStudentTeacherLinks } from "@/lib/users/queries"
import { requireRole } from "@/lib/auth/session"

export const metadata: Metadata = {
  title: "Привязки ученик–преподаватель",
}

export default async function AdminAssignmentsPage() {
  await requireRole("admin")

  const [links, students, teachers] = await Promise.all([
    fetchStudentTeacherLinks(),
    fetchAllStudents(),
    fetchTeachers(),
  ])

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Привязки</h1>
      <AssignmentsManager links={links} students={students} teachers={teachers} />
    </div>
  )
}
