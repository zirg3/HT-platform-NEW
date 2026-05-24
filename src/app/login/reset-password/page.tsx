import type { Metadata } from "next"
import Link from "next/link"
import { ResetPasswordForm } from "@/components/auth/reset-password-form"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { SITE_NAME } from "@/lib/constants"
import { createClient } from "@/lib/supabase/server"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Новый пароль",
}

export default async function ResetPasswordPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="aurora-bg flex min-h-full flex-1 flex-col items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md border-border/50 shadow-lg">
          <CardHeader className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              {SITE_NAME}
            </p>
            <CardTitle className="text-2xl">Ссылка недействительна</CardTitle>
            <CardDescription>
              Откройте ссылку из письма или запросите восстановление пароля
              заново.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Link
              href="/login/forgot-password"
              className={cn(buttonVariants(), "w-full")}
            >
              Запросить ссылку
            </Link>
            <Link
              href="/login"
              className={cn(buttonVariants({ variant: "ghost" }), "w-full")}
            >
              Ко входу
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="aurora-bg flex min-h-full flex-1 flex-col items-center justify-center px-4 py-12">
      <ResetPasswordForm />
    </div>
  )
}
