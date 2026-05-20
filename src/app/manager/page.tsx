import type { Metadata } from "next"
import Link from "next/link"
import { SchedulePage } from "@/components/schedule/schedule-page"
import { Button } from "@/components/ui/button"
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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Расписание</h1>
        <Link href="/manager/assignments">
          <Button variant="outline" size="sm" type="button">
            Привязки
          </Button>
        </Link>
      </div>
      <SchedulePage profile={profile} week={params.week} />
    </div>
  )
}
