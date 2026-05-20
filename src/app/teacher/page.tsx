import type { Metadata } from "next"
import Link from "next/link"
import { SchedulePage } from "@/components/schedule/schedule-page"
import { Button } from "@/components/ui/button"
import { requireRole } from "@/lib/auth/session"

export const metadata: Metadata = {
  title: "Преподаватель",
}

type TeacherPageProps = {
  searchParams: Promise<{ week?: string }>
}

export default async function TeacherPage({ searchParams }: TeacherPageProps) {
  const profile = await requireRole("teacher")
  const params = await searchParams

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Расписание</h1>
        <Link href="/teacher/students">
          <Button variant="outline" size="sm" type="button">
            Мои ученики
          </Button>
        </Link>
      </div>
      <SchedulePage profile={profile} week={params.week} />
    </div>
  )
}
