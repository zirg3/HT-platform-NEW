"use client"

import Link from "next/link"
import { useState, useTransition } from "react"
import {
  createUserAction,
  deleteUserAction,
  updateProfileAction,
} from "@/app/actions/users"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
import { ROLE_LABELS } from "@/lib/auth/paths"
import { cn } from "@/lib/utils"
import type { ProfileRow } from "@/lib/users/types"
import type { UserRole } from "@/types/roles"

const selectClassName = cn(
  "flex h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none",
  "disabled:pointer-events-none disabled:opacity-50"
)

const ROLE_TABS: { value: UserRole | "all"; label: string }[] = [
  { value: "all", label: "Все" },
  { value: "student", label: "Ученики" },
  { value: "teacher", label: "Преподаватели" },
  { value: "manager", label: "Менеджеры" },
  { value: "admin", label: "Админы" },
]

const ROLES: UserRole[] = ["student", "teacher", "manager", "admin"]

type UsersManagerProps = {
  users: ProfileRow[]
  activeRole: UserRole | "all"
  currentUserId: string
}

export const UsersManager = ({
  users,
  activeRole,
  currentUserId,
}: UsersManagerProps) => {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | undefined>()

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(undefined)
    const form = e.currentTarget
    startTransition(async () => {
      const result = await createUserAction(new FormData(form))
      if (result.error) setError(result.error)
      else form.reset()
    })
  }

  const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(undefined)
    startTransition(async () => {
      const result = await updateProfileAction(new FormData(e.currentTarget))
      if (result.error) setError(result.error)
    })
  }

  const handleDelete = (profileId: string) => {
    if (!window.confirm("Удалить пользователя? Действие нельзя отменить.")) {
      return
    }
    const fd = new FormData()
    fd.set("profile_id", profileId)
    startTransition(async () => {
      const result = await deleteUserAction(fd)
      if (result.error) setError(result.error)
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Новый пользователь</CardTitle>
          <CardDescription>
            Создать пользователя
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="create_email">Email</Label>
              <Input
                id="create_email"
                name="email"
                type="email"
                required
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create_password">Временный пароль</Label>
              <Input
                id="create_password"
                name="password"
                type="password"
                minLength={8}
                required
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create_full_name">Имя</Label>
              <Input
                id="create_full_name"
                name="full_name"
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create_role">Роль</Label>
              <select
                id="create_role"
                name="role"
                className={selectClassName}
                defaultValue="student"
                disabled={isPending}
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2 sm:col-span-2">
              <input
                type="checkbox"
                id="create_is_teacher"
                name="is_teacher"
                value="on"
                className="h-4 w-4 rounded border-input"
                disabled={isPending}
              />
              <Label htmlFor="create_is_teacher" className="font-normal">
                Также преподаватель (можно назначать учеников)
              </Label>
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" disabled={isPending}>
                Создать
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        {ROLE_TABS.map((tab) => {
          const href =
            tab.value === "all" ? "/admin/users" : `/admin/users?role=${tab.value}`
          const isActive = activeRole === tab.value
          return (
            <Link
              key={tab.value}
              href={href}
              className={buttonVariants({
                size: "sm",
                variant: isActive ? "default" : "outline",
              })}
              aria-current={isActive ? "page" : undefined}
            >
              {tab.label}
            </Link>
          )
        })}
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Пользователи ({users.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {users.length === 0 ? (
            <p className="text-sm text-muted-foreground">Нет пользователей</p>
          ) : (
            users.map((user) => (
              <div
                key={user.id}
                className="rounded-lg border border-border p-3"
              >
                <form
                  onSubmit={handleUpdate}
                  className="flex flex-wrap items-end gap-3"
                >
                  <input type="hidden" name="profile_id" value={user.id} />
                  <div className="min-w-[140px] flex-1 space-y-1">
                    <Label className="text-xs">Имя</Label>
                    <Input name="full_name" defaultValue={user.full_name} required />
                  </div>
                  <div className="min-w-[180px] flex-1 space-y-1">
                    <Label className="text-xs">Email</Label>
                    <Input value={user.email} disabled className="bg-muted" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Роль</Label>
                    <select
                      name="role"
                      className={selectClassName}
                      defaultValue={user.role}
                      disabled={user.id === currentUserId}
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {ROLE_LABELS[r]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`is_teacher_${user.id}`}
                      name="is_teacher"
                      value="on"
                      defaultChecked={user.is_teacher}
                      className="h-4 w-4 rounded border-input"
                      disabled={isPending}
                    />
                    <Label
                      htmlFor={`is_teacher_${user.id}`}
                      className="text-xs font-normal"
                    >
                      Также преподаватель
                    </Label>
                  </div>
                  <Button type="submit" size="sm" variant="outline" disabled={isPending}>
                    Сохранить
                  </Button>
                </form>
                {user.id !== currentUserId ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    className="mt-2"
                    disabled={isPending}
                    onClick={() => handleDelete(user.id)}
                  >
                    Удалить
                  </Button>
                ) : null}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
