import { Link } from "@/lib/navigation"
import { useState, useTransition } from "react"
import { requestPasswordReset } from "@/lib/actions/auth"
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

export const ForgotPasswordForm = () => {
  const [error, setError] = useState<string | undefined>()
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const email = new FormData(e.currentTarget).get("email")
    startTransition(async () => {
      const result = await requestPasswordReset(String(email ?? ""))
      if (result.error) {
        setError(result.error)
        setSuccess(false)
        return
      }
      setError(undefined)
      setSuccess(true)
    })
  }

  return (
    <Card className="w-full max-w-md border-border/80 shadow-sm">
      <CardHeader className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">{SITE_NAME}</p>
        <CardTitle className="text-2xl">Восстановление пароля</CardTitle>
        <CardDescription>
          Укажите email — отправим ссылку для смены пароля (нужен SMTP на сервере).
        </CardDescription>
      </CardHeader>
      <CardContent>
        {success ? (
          <div className="space-y-4" role="status">
            <p className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm">
              Если аккаунт с таким email существует, мы отправили письмо со
              ссылкой. Проверьте почту и папку «Спам».
            </p>
            <Link
              to="/login"
              className={cn(buttonVariants({ variant: "outline" }), "w-full")}
            >
              Вернуться ко входу
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
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
              className="w-full"
              disabled={isPending}
              aria-busy={isPending}
            >
              {isPending ? "Отправка…" : "Отправить ссылку"}
            </Button>
            <Link
              to="/login"
              className={cn(buttonVariants({ variant: "ghost" }), "w-full")}
            >
              Назад ко входу
            </Link>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
