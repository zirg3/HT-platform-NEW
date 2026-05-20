import type { Metadata } from "next"
import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { fetchTeacherStudents } from "@/lib/schedule/queries"
import { requireRole } from "@/lib/auth/session"

export const metadata: Metadata = {
  title: "Мои ученики",
}

export default async function TeacherStudentsPage() {
  const profile = await requireRole("teacher")
  const students = await fetchTeacherStudents(profile.id)

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Мои ученики</h1>
      <Card>
        <CardHeader>
          <CardTitle>Ученики ({students.length})</CardTitle>
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
                href={`/teacher/students/${s.id}`}
                className="block rounded-lg border border-border px-3 py-2 text-sm transition-colors hover:bg-muted/50"
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
