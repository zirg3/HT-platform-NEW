"use client"

import Link from "next/link"
import { useActionState } from "react"
import {
  resetPasswordAction,
  type ResetPasswordState,
} from "@/app/login/reset-password/actions"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SITE_NAME } from "@/lib/constants"
import { cn } from "@/lib/utils"

const initialState: ResetPasswordState = {}

export const ResetPasswordForm = () => {
  const [state, formAction, isPending] = useActionState(
    resetPasswordAction,
    initialState
  )

  return (
    <Card className="w-full max-w-md border-border/80 shadow-sm">
      <CardHeader className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">{SITE_NAME}</p>
        <CardTitle className="text-2xl">Новый пароль</CardTitle>
        <CardDescription>
          Придумайте новый пароль для входа в систему.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="password">Новый пароль</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
              aria-required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password_confirm">Повторите пароль</Label>
            <Input
              id="password_confirm"
              name="password_confirm"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
              aria-required
            />
          </div>
          {state.error ? (
            <p
              className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              role="alert"
            >
              {state.error}
            </p>
          ) : null}
          <Button
            type="submit"
            className="w-full"
            disabled={isPending}
            aria-busy={isPending}
          >
            {isPending ? "Сохранение…" : "Сохранить пароль"}
          </Button>
          <Link
            href="/login"
            className={cn(buttonVariants({ variant: "ghost" }), "w-full")}
          >
            Ко входу
          </Link>
        </form>
      </CardContent>
    </Card>
  )
}
