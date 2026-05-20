import Link from "next/link"
import { redirect } from "next/navigation"
import { buttonVariants } from "@/components/ui/button"
import { getRoleHomePath } from "@/lib/auth/paths"
import { getSessionProfile } from "@/lib/auth/session"
import { SITE_NAME } from "@/lib/constants"
import type { UserRole } from "@/types/roles"

export default async function Home() {
  const profile = await getSessionProfile()

  if (profile) {
    redirect(getRoleHomePath(profile.role as UserRole))
  }

  return (
    <div className="flex flex-1 flex-col bg-muted/20">
      <header className="border-b border-border bg-card px-6 py-4">
        <p className="text-sm font-medium text-muted-foreground">{SITE_NAME}</p>
        <p className="text-xs text-muted-foreground">MVP · вход и роли</p>
      </header>
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-6 py-16">
        <h1 className="text-3xl font-semibold tracking-tight">Добро пожаловать</h1>
        <p className="mt-4 leading-relaxed text-muted-foreground">
          Платформа для расписания, личных кабинетов и администрирования. Войдите
          по учётной записи, выданной администратором.
        </p>
        <div className="mt-8">
          <Link href="/login" className={buttonVariants()}>
            Войти
          </Link>
        </div>
      </main>
    </div>
  )
}
