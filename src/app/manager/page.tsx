import type { Metadata } from "next"
import { SchedulePage } from "@/components/schedule/schedule-page"
import { requireRole } from "@/lib/auth/session"

export const metadata: Metadata = {
  title: "Менеджер",
}

type ManagerPageProps = {
  searchParams: Promise<{ week?: string }>
}

export default async function ManagerPage({ searchParams }: ManagerPageProps) {
  const profile = await requireRole("manager")
  const params = await searchParams

  return <SchedulePage profile={profile} week={params.week} />
}
