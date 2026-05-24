import { Link } from "@/lib/navigation"
import { useCallback, useRef, useState, useTransition } from "react"
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
import { getPocketBaseEnv } from "@/lib/pocketbase/env"
import { cn } from "@/lib/utils"
import { useAuth } from "@/providers/auth-provider"

type LoginFormProps = {
  nextPath?: string
  passwordResetSuccess?: boolean
}

export const LoginForm = ({ nextPath, passwordResetSuccess }: LoginFormProps) => {
  const { signIn, resolveRedirectPath } = useAuth()
  const envCheck = getPocketBaseEnv()
  const [error, setError] = useState<string | undefined>(
    envCheck.ok ? undefined : envCheck.message
  )
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [isPending, startTransition] = useTransition()
  const isSubmittingRef = useRef(false)

  const readCredentials = (form: HTMLFormElement) => {
    const emailEl = form.elements.namedItem("email")
    const passwordEl = form.elements.namedItem("password")
    const email =
      emailEl instanceof HTMLInputElement ? emailEl.value.trim() : ""
    const password =
      passwordEl instanceof HTMLInputElement ? passwordEl.value : ""
    return { email, password }
  }

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      if (!envCheck.ok || isSubmittingRef.current || isRedirecting) return

      const form = e.currentTarget
      const { email, password } = readCredentials(form)

      if (!email || !password) {
        setError("Введите email и пароль")
        return
      }

      isSubmittingRef.current = true
      setError(undefined)

      startTransition(async () => {
        const result = await signIn(email, password)

        if (result.error) {
          setError(result.error)
          isSubmittingRef.current = false
          return
        }

        setIsRedirecting(true)
        window.location.assign(resolveRedirectPath(nextPath))
      })
    },
    [envCheck.ok, isRedirecting, nextPath, resolveRedirectPath, signIn]
  )

  const busy = isPending || isRedirecting

  return (
    <>
      {isRedirecting ? (
        <div
          className="fixed inset-0 z-100 flex flex-col items-center justify-center gap-4 bg-background/80 backdrop-blur-md"
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
          <div
            className="size-10 animate-spin rounded-full border-2 border-primary border-t-transparent"
            aria-hidden
          />
          <p className="text-sm font-medium text-foreground">
            Вход выполнен. Открываем кабинет…
          </p>
        </div>
      ) : null}

      <Card className="w-full max-w-md border-white/50 shadow-xl">
        <CardHeader className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{SITE_NAME}</p>
          <CardTitle className="text-2xl">Вход</CardTitle>
          <CardDescription>
            Вход по email и паролю. Регистрация доступна только через
            администратора.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {passwordResetSuccess ? (
            <p
              className="mb-4 rounded-md border border-border bg-muted/40 px-3 py-2 text-sm"
              role="status"
            >
              Пароль обновлён. Войдите с новым паролем.
            </p>
          ) : null}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
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
                disabled={busy || !envCheck.ok}
                className="glass-input h-10 border border-input"
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
                disabled={busy || !envCheck.ok}
                className="glass-input h-10 border border-input"
              />
            </div>
            <div className="flex justify-end">
              <Link
                to="/login/forgot-password"
                className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                Забыли пароль?
              </Link>
            </div>
            {error ? (
              <p
                className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                role="alert"
              >
                {error}
              </p>
            ) : null}
            <Button
              type="submit"
              className={cn("w-full shadow-md", busy && "pointer-events-none")}
              disabled={busy || !envCheck.ok}
              aria-busy={busy}
            >
              {isRedirecting
                ? "Переход…"
                : isPending
                  ? "Проверка…"
                  : "Войти"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  )
}
