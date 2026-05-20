import type { Metadata } from "next"
import Link from "next/link"
import { AssignmentsManager } from "@/components/admin/assignments-manager"
import { Button } from "@/components/ui/button"
import { fetchAllStudents, fetchTeachers } from "@/lib/schedule/queries"
import { fetchStudentTeacherLinks } from "@/lib/users/queries"
import { requireRole } from "@/lib/auth/session"

export const metadata: Metadata = {
  title: "Привязки",
}

export default async function ManagerAssignmentsPage() {
  await requireRole("manager")

  const [links, students, teachers] = await Promise.all([
    fetchStudentTeacherLinks(),
    fetchAllStudents(),
    fetchTeachers(),
  ])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Привязки ученик–преподаватель</h1>
        <Link href="/manager">
          <Button variant="outline" size="sm" type="button">
            К расписанию
          </Button>
        </Link>
      </div>
      <AssignmentsManager links={links} students={students} teachers={teachers} />
    </div>
  )
}
