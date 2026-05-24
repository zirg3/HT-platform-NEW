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

  return <SchedulePage profile={profile} week={params.week} />
}
