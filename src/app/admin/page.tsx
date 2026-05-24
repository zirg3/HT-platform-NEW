import type { Metadata } from "next"
import { SchedulePage } from "@/components/schedule/schedule-page"
import { requireRole } from "@/lib/auth/session"

export const metadata: Metadata = {
  title: "Администратор",
}

type AdminPageProps = {
  searchParams: Promise<{ week?: string }>
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const profile = await requireRole("admin")
  const params = await searchParams

  return <SchedulePage profile={profile} week={params.week} />
}
