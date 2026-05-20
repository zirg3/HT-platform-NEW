"use client"

import { useActionState } from "react"
import { loginAction, type LoginState } from "@/app/login/actions"
import { Button } from "@/components/ui/button"
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

const initialState: LoginState = {}

type LoginFormProps = {
  nextPath?: string
}

export const LoginForm = ({ nextPath }: LoginFormProps) => {
  const [state, formAction, isPending] = useActionState(loginAction, initialState)

  return (
    <Card className="w-full max-w-md border-border/80 shadow-sm">
      <CardHeader className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">{SITE_NAME}</p>
        <CardTitle className="text-2xl">Вход</CardTitle>
        <CardDescription>
          Вход по email и паролю. Регистрация доступна только через
          администратора.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4" noValidate>
          {nextPath ? <input type="hidden" name="next" value={nextPath} /> : null}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              aria-required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Пароль</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
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
            {isPending ? "Вход…" : "Войти"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
