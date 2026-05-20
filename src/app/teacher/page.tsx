import type { Metadata } from "next"
import { SchedulePage } from "@/components/schedule/schedule-page"
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
      <h1 className="text-xl font-semibold">Расписание</h1>
      <SchedulePage profile={profile} week={params.week} />
    </div>
  )
}
