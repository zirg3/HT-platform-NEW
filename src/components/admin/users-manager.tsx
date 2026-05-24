"use client"

import { Link } from "@/lib/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { useState, useTransition } from "react"
import {
  createUserAction,
  deleteUserAction,
  updateProfileAction,
} from "@/lib/actions/users"
import { AdminAlignedButtonCell, AdminAlignedCell } from "@/components/admin/admin-form-align"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button, buttonVariants } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ROLE_LABELS } from "@/lib/auth/paths"
import { cn } from "@/lib/utils"
import type { ProfileRow } from "@/lib/users/types"
import type { UserRole } from "@/types/roles"

const selectClassName = cn(
  "form-field flex h-8 w-full cursor-pointer rounded-md border border-border bg-white/85 px-2.5 text-sm",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none",
  "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
)

const ROLE_TABS: { value: UserRole | "all"; label: string }[] = [
  { value: "all", label: "Все" },
  { value: "student", label: "Ученики" },
  { value: "teacher", label: "Преподаватели" },
  { value: "manager", label: "Менеджеры" },
  { value: "admin", label: "Админы" },
]

const ROLES: UserRole[] = ["student", "teacher", "manager", "admin"]

type EmailChangePending = {
  form: HTMLFormElement
  oldEmail: string
  newEmail: string
}

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
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | undefined>()
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null)
  const [emailChangePending, setEmailChangePending] =
    useState<EmailChangePending | null>(null)

  const refreshUsers = () =>
    void queryClient.invalidateQueries({ queryKey: ["admin-users"] })

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(undefined)
    const form = e.currentTarget
    startTransition(async () => {
      const result = await createUserAction(new FormData(form))
      if (result.error) setError(result.error)
      else {
        form.reset()
        refreshUsers()
      }
    })
  }

  const submitProfileUpdate = (form: HTMLFormElement) => {
    startTransition(async () => {
      const result = await updateProfileAction(new FormData(form))
      if (result.error) setError(result.error)
      else {
        setEmailChangePending(null)
        refreshUsers()
      }
    })
  }

  const handleUpdate = (
    e: React.FormEvent<HTMLFormElement>,
    user: ProfileRow
  ) => {
    e.preventDefault()
    setError(undefined)
    const form = e.currentTarget
    const newEmail = String(new FormData(form).get("email") ?? "")
      .trim()
      .toLowerCase()
    const oldEmail = user.email.trim().toLowerCase()

    if (newEmail !== oldEmail) {
      setEmailChangePending({ form, oldEmail, newEmail })
      return
    }

    submitProfileUpdate(form)
  }

  const confirmEmailChange = async () => {
    if (!emailChangePending) return
    const result = await updateProfileAction(
      new FormData(emailChangePending.form)
    )
    if (result.error) {
      setError(result.error)
      return { error: result.error }
    }
    refreshUsers()
  }

  const confirmDeleteUser = async () => {
    if (!deleteUserId) return
    const fd = new FormData()
    fd.set("profile_id", deleteUserId)
    const result = await deleteUserAction(fd)
    if (result.error) {
      setError(result.error)
      return { error: result.error }
    }
    refreshUsers()
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
            <div className="flex h-8 items-center gap-2.5 sm:col-span-2">
              <Switch
                id="create_is_teacher"
                name="is_teacher"
                value="on"
                disabled={isPending}
              />
              <Label
                htmlFor="create_is_teacher"
                className="cursor-pointer font-normal leading-snug"
              >
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
          const isActive = activeRole === tab.value
          return (
            <Link
              key={tab.value}
              to="/admin/users"
              search={
                tab.value === "all" ? {} : { role: tab.value }
              }
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
        <Alert variant="destructive" className="scroll-mt-4" id="admin-users-error">
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
                <div className="flex flex-wrap items-end gap-3">
                  <form
                    onSubmit={(e) => handleUpdate(e, user)}
                    className="grid flex-1 gap-3 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1.4fr)_minmax(9rem,auto)_auto_auto_auto] sm:items-end"
                  >
                    <input type="hidden" name="profile_id" value={user.id} />
                    <input type="hidden" name="previous_email" value={user.email} />
                    <div className="space-y-1">
                      <Label className="text-xs">Имя</Label>
                      <Input name="full_name" defaultValue={user.full_name} required />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Email</Label>
                      <Input
                        name="email"
                        type="email"
                        defaultValue={user.email}
                        required
                        autoComplete="off"
                        disabled={isPending}
                        placeholder="user@example.com"
                      />
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
                    <AdminAlignedCell>
                      <Switch
                        id={`is_teacher_${user.id}`}
                        name="is_teacher"
                        value="on"
                        defaultChecked={user.is_teacher}
                        disabled={isPending}
                      />
                      <Label
                        htmlFor={`is_teacher_${user.id}`}
                        className="cursor-pointer pl-2.5 text-xs font-normal whitespace-nowrap"
                      >
                        Также преподаватель
                      </Label>
                    </AdminAlignedCell>
                    <AdminAlignedButtonCell>
                      <Button
                        type="submit"
                        size="sm"
                        variant="outline"
                        className="h-8"
                        disabled={isPending}
                      >
                        Сохранить
                      </Button>
                    </AdminAlignedButtonCell>
                    {user.id !== currentUserId ? (
                      <AdminAlignedButtonCell>
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          className="h-8"
                          disabled={isPending}
                          onClick={() => setDeleteUserId(user.id)}
                        >
                          Удалить
                        </Button>
                      </AdminAlignedButtonCell>
                    ) : null}
                  </form>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={emailChangePending !== null}
        onOpenChange={(open) => {
          if (!open) setEmailChangePending(null)
        }}
        title="Изменить email?"
        description={
          emailChangePending
            ? `Логин пользователя изменится с «${emailChangePending.oldEmail || "—"}» на «${emailChangePending.newEmail}». Вход — только с новым email.`
            : ""
        }
        confirmLabel="Изменить"
        confirmVariant="default"
        onConfirm={confirmEmailChange}
      />

      <ConfirmDialog
        open={deleteUserId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteUserId(null)
        }}
        title="Удалить пользователя?"
        description="Учётная запись будет удалена без возможности восстановления."
        confirmLabel="Удалить"
        onConfirm={confirmDeleteUser}
      />
    </div>
  )
}
