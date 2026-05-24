import type { Metadata } from "next"
import { SchedulePage } from "@/components/schedule/schedule-page"
import { requireRole } from "@/lib/auth/session"

export const metadata: Metadata = {
  title: "Ученик",
}

type StudentPageProps = {
  searchParams: Promise<{ week?: string }>
}

export default async function StudentPage({ searchParams }: StudentPageProps) {
  const profile = await requireRole("student")
  const params = await searchParams

  return <SchedulePage profile={profile} week={params.week} />
}
