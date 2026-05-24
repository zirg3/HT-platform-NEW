"use client"

import { useQueryClient } from "@tanstack/react-query"
import { useState, useTransition } from "react"
import {
  assignStudentTeacherAction,
  removeAssignmentAction,
  updateAssignmentAction,
} from "@/lib/actions/assignments"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import type { ProfileBrief } from "@/lib/schedule/types"
import type { StudentTeacherRow } from "@/lib/users/types"

const selectClassName = cn(
  "form-field flex h-8 w-full rounded-md border border-border bg-white/85 px-2.5 text-sm",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none",
  "disabled:pointer-events-none disabled:opacity-50"
)

type AssignmentsManagerProps = {
  links: StudentTeacherRow[]
  students: ProfileBrief[]
  teachers: ProfileBrief[]
}

const displayName = (p: ProfileBrief | null) =>
  p?.full_name?.trim() || p?.email || "—"

export const AssignmentsManager = ({
  links,
  students,
  teachers,
}: AssignmentsManagerProps) => {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | undefined>()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [removeAssignmentId, setRemoveAssignmentId] = useState<string | null>(null)

  const refresh = () =>
    void queryClient.invalidateQueries({ queryKey: ["assignments-page"] })

  const handleAssign = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(undefined)
    const form = e.currentTarget
    startTransition(async () => {
      const result = await assignStudentTeacherAction(new FormData(form))
      if (result.error) setError(result.error)
      else {
        form.reset()
        refresh()
      }
    })
  }

  const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(undefined)
    startTransition(async () => {
      const result = await updateAssignmentAction(new FormData(e.currentTarget))
      if (result.error) setError(result.error)
      else {
        setEditingId(null)
        refresh()
      }
    })
  }

  const confirmRemoveAssignment = async () => {
    if (!removeAssignmentId) return
    const fd = new FormData()
    fd.set("assignment_id", removeAssignmentId)
    const result = await removeAssignmentAction(fd)
    if (result.error) {
      setError(result.error)
      throw new Error(result.error)
    }
    if (editingId === removeAssignmentId) setEditingId(null)
    refresh()
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Новая привязка</CardTitle>
          <CardDescription>
            Ученик будет виден в расписании преподавателя
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAssign} className="flex flex-wrap items-end gap-3">
            <div className="min-w-[180px] flex-1 space-y-1">
              <Label htmlFor="student_id">Ученик</Label>
              <select
                id="student_id"
                name="student_id"
                className={selectClassName}
                required
                disabled={isPending || students.length === 0}
              >
                <option value="">Выберите…</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {displayName(s)}
                  </option>
                ))}
              </select>
            </div>
            <div className="min-w-[180px] flex-1 space-y-1">
              <Label htmlFor="teacher_id">Преподаватель</Label>
              <select
                id="teacher_id"
                name="teacher_id"
                className={selectClassName}
                required
                disabled={isPending || teachers.length === 0}
              >
                <option value="">Выберите…</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {displayName(t)}
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit" disabled={isPending}>
              Привязать
            </Button>
          </form>
        </CardContent>
      </Card>

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Привязки ({links.length})</CardTitle>
          <CardDescription>
            Можно изменить ученика или преподавателя без удаления связи
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {links.length === 0 ? (
            <p className="text-sm text-muted-foreground">Пока нет привязок</p>
          ) : (
            links.map((link) => (
              <div
                key={link.id}
                className="rounded-lg border border-border p-3 text-sm"
              >
                {editingId === link.id ? (
                  <form
                    onSubmit={handleUpdate}
                    className="flex flex-wrap items-end gap-3"
                  >
                    <input
                      type="hidden"
                      name="assignment_id"
                      value={link.id}
                    />
                    <div className="min-w-[160px] flex-1 space-y-1">
                      <Label>Ученик</Label>
                      <select
                        name="student_id"
                        className={selectClassName}
                        defaultValue={link.student_id}
                        required
                        disabled={isPending}
                      >
                        {students.map((s) => (
                          <option key={s.id} value={s.id}>
                            {displayName(s)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="min-w-[160px] flex-1 space-y-1">
                      <Label>Преподаватель</Label>
                      <select
                        name="teacher_id"
                        className={selectClassName}
                        defaultValue={link.teacher_id}
                        required
                        disabled={isPending}
                      >
                        {teachers.map((t) => (
                          <option key={t.id} value={t.id}>
                            {displayName(t)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <Button type="submit" size="sm" disabled={isPending}>
                      Сохранить
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      disabled={isPending}
                      onClick={() => setEditingId(null)}
                    >
                      Отмена
                    </Button>
                  </form>
                ) : (
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span>
                      <span className="font-medium">
                        {displayName(link.student)}
                      </span>
                      <span className="text-muted-foreground"> → </span>
                      <span className="font-medium">
                        {displayName(link.teacher)}
                      </span>
                    </span>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={isPending}
                        onClick={() => setEditingId(link.id)}
                      >
                        Изменить
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        disabled={isPending}
                        onClick={() => setRemoveAssignmentId(link.id)}
                      >
                        Удалить
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={removeAssignmentId !== null}
        onOpenChange={(open) => {
          if (!open) setRemoveAssignmentId(null)
        }}
        title="Удалить привязку?"
        description="Связь между учеником и преподавателем будет удалена."
        confirmLabel="Удалить"
        onConfirm={confirmRemoveAssignment}
      />
    </div>
  )
}
