import { useQuery } from "@tanstack/react-query"
import { Link } from "@/lib/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { fetchTeacherStudents } from "@/lib/schedule/queries"
import { useAuth } from "@/providers/auth-provider"

export const TeacherStudentsPage = () => {
  const { profile } = useAuth()

  const { data: students = [], isLoading } = useQuery({
    queryKey: ["students", profile?.id],
    queryFn: () => fetchTeacherStudents(profile!.id),
    enabled: Boolean(profile?.id),
  })

  if (!profile) return null

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Мои ученики</h1>
      <Card>
        <CardHeader>
          <CardTitle>Ученики ({isLoading ? "…" : students.length})</CardTitle>
          <CardDescription>
            Только прикреплённые к вам — назначает менеджер или админ
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {students.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Пока нет прикреплённых учеников
            </p>
          ) : (
            students.map((s) => (
              <Link
                key={s.id}
                to="/teacher/students/$studentId"
                params={{ studentId: s.id }}
                className="block rounded-lg border border-border px-3 py-2 text-sm transition-colors hover:border-primary/25 hover:bg-primary/10"
              >
                <p className="font-medium">{s.full_name || "Без имени"}</p>
                <p className="text-muted-foreground">{s.email}</p>
                <p className="mt-1 text-xs text-primary">Открыть профиль →</p>
              </Link>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
