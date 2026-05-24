import { Link, useNavigate } from "@/lib/navigation"
import { useState, useTransition } from "react"
import { confirmPasswordReset } from "@/lib/actions/auth"
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

type ResetPasswordFormProps = {
  token?: string
}

export const ResetPasswordForm = ({ token }: ResetPasswordFormProps) => {
  const navigate = useNavigate()
  const [error, setError] = useState<string | undefined>()
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const password = String(formData.get("password") ?? "")
    const passwordConfirm = String(formData.get("password_confirm") ?? "")

    startTransition(async () => {
      const result = await confirmPasswordReset(
        token ?? "",
        password,
        passwordConfirm
      )
      if (result.error) {
        setError(result.error)
        return
      }
      navigate({ to: "/login", search: { reset: "success" } })
    })
  }

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
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
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
            {isPending ? "Сохранение…" : "Сохранить пароль"}
          </Button>
          <Link
            to="/login"
            className={cn(buttonVariants({ variant: "ghost" }), "w-full")}
          >
            Вернуться ко входу
          </Link>
        </form>
      </CardContent>
    </Card>
  )
}
