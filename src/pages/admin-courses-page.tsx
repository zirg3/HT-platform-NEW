import { useQuery } from "@tanstack/react-query"
import { CoursesManager } from "@/components/admin/courses-manager"
import { fetchCourses } from "@/lib/schedule/queries"

export const AdminCoursesPage = () => {
  const { data: courses = [], isLoading } = useQuery({
    queryKey: ["courses"],
    queryFn: fetchCourses,
  })

  if (isLoading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Справочник курсов</h1>
      <CoursesManager courses={courses} />
    </div>
  )
}
