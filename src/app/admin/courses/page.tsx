import type { Metadata } from "next"
import { AdminNav } from "@/components/admin/admin-nav"
import { CoursesManager } from "@/components/admin/courses-manager"
import { requireRole } from "@/lib/auth/session"
import { fetchCourses } from "@/lib/schedule/queries"

export const metadata: Metadata = {
  title: "Курсы",
}

export default async function AdminCoursesPage() {
  await requireRole("admin")
  const courses = await fetchCourses()

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <div className="space-y-3">
        <h1 className="text-xl font-semibold">Справочник курсов</h1>
        <AdminNav />
      </div>
      <CoursesManager courses={courses} />
    </div>
  )
}
