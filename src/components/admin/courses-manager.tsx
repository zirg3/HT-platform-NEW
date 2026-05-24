"use client"

import { useQueryClient } from "@tanstack/react-query"
import { useState, useTransition } from "react"
import { AdminAlignedButtonCell } from "@/components/admin/admin-form-align"
import { deleteCourseAction, saveCourseAction } from "@/lib/actions/courses"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { CourseRow } from "@/lib/schedule/types"
import { scheduleKeys } from "@/lib/schedule/query-keys"

type CoursesManagerProps = {
  courses: CourseRow[]
}

export const CoursesManager = ({ courses }: CoursesManagerProps) => {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | undefined>()
  const [deleteCourseId, setDeleteCourseId] = useState<string | null>(null)

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["courses"] })
    void queryClient.invalidateQueries({ queryKey: scheduleKeys.all })
  }

  const runSave = (formData: FormData, reset?: () => void) => {
    setError(undefined)
    startTransition(async () => {
      const result = await saveCourseAction(formData)
      if (result.error) setError(result.error)
      else {
        reset?.()
        refresh()
      }
    })
  }

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    runSave(new FormData(form), () => form.reset())
  }

  const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    runSave(new FormData(e.currentTarget))
  }

  const confirmDeleteCourse = async () => {
    if (!deleteCourseId) return
    const fd = new FormData()
    fd.set("course_id", deleteCourseId)
    const result = await deleteCourseAction(fd)
    if (result.error) {
      setError(result.error)
      throw new Error(result.error)
    }
    refresh()
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Новый курс</CardTitle>
          <CardDescription>Название и цвет в календаре</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Название</Label>
              <Input id="title" name="title" required disabled={isPending} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="color">Цвет</Label>
              <Input
                id="color"
                name="color"
                type="color"
                defaultValue="#3b82f6"
                className="h-10 w-20 cursor-pointer p-1"
                disabled={isPending}
              />
            </div>
            <Button type="submit" disabled={isPending}>
              Добавить
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
          <CardTitle>Курсы ({courses.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {courses.length === 0 ? (
            <p className="text-sm text-muted-foreground">Пока нет курсов</p>
          ) : (
            courses.map((course) => (
              <div
                key={course.id}
                className="rounded-lg border border-border p-3"
              >
                <form
                  onSubmit={handleUpdate}
                  className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto_auto] sm:items-end"
                >
                <input type="hidden" name="course_id" value={course.id} />
                <div className="space-y-1">
                  <Label className="text-xs">Название</Label>
                  <Input name="title" defaultValue={course.title} required />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Цвет</Label>
                  <Input
                    name="color"
                    type="color"
                    defaultValue={course.color}
                    className="h-8 w-16 cursor-pointer p-1"
                  />
                </div>
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
                <AdminAlignedButtonCell>
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    className="h-8"
                    disabled={isPending}
                    onClick={() => setDeleteCourseId(course.id)}
                  >
                    Удалить
                  </Button>
                </AdminAlignedButtonCell>
                </form>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteCourseId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteCourseId(null)
        }}
        title="Удалить курс?"
        description="Курс будет удалён. Связанные уроки могут стать недоступны."
        confirmLabel="Удалить"
        onConfirm={confirmDeleteCourse}
      />
    </div>
  )
}
