import { useQuery } from "@tanstack/react-query"
import { AssignmentsManager } from "@/components/admin/assignments-manager"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getPocketBaseErrorMessage } from "@/lib/pocketbase/errors"
import { fetchAllStudents, fetchTeachers } from "@/lib/schedule/queries"
import { fetchStudentTeacherLinks } from "@/lib/users/queries"

export const ManagerAssignmentsPage = () => {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["assignments-page"],
    queryFn: async () => {
      const [links, students, teachers] = await Promise.all([
        fetchStudentTeacherLinks(),
        fetchAllStudents(),
        fetchTeachers(),
      ])
      return { links, students, teachers }
    },
  })

  if (isLoading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold">Привязки ученик ↔ преподаватель</h1>
        <Alert variant="destructive">
          <AlertDescription>
            {error instanceof Error ? error.message : getPocketBaseErrorMessage(error, "Не удалось загрузить привязки")}
          </AlertDescription>
        </Alert>
        <button
          type="button"
          className="text-sm text-primary underline"
          onClick={() => void refetch()}
        >
          Повторить
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Привязки ученик ↔ преподаватель</h1>
      <AssignmentsManager
        links={data.links}
        students={data.students}
        teachers={data.teachers}
      />
    </div>
  )
}

export const AdminAssignmentsPage = ManagerAssignmentsPage
