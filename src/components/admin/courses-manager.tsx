"use client"

import { useState, useTransition } from "react"
import { deleteCourseAction, saveCourseAction } from "@/app/actions/courses"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
import type { CourseRow } from "@/lib/schedule/types"

type CoursesManagerProps = {
  courses: CourseRow[]
}

export const CoursesManager = ({ courses }: CoursesManagerProps) => {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | undefined>()

  const runSave = (formData: FormData, reset?: () => void) => {
    setError(undefined)
    startTransition(async () => {
      const result = await saveCourseAction(formData)
      if (result.error) setError(result.error)
      else reset?.()
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

  const handleDelete = (courseId: string) => {
    if (!window.confirm("Удалить курс? Связанные уроки могут стать недоступны.")) {
      return
    }
    const fd = new FormData()
    fd.set("course_id", courseId)
    startTransition(async () => {
      const result = await deleteCourseAction(fd)
      if (result.error) setError(result.error)
    })
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
                className="flex flex-wrap items-end gap-3 rounded-lg border border-border p-3"
              >
                <form
                  onSubmit={handleUpdate}
                  className="flex flex-1 flex-wrap items-end gap-3"
                >
                  <input type="hidden" name="course_id" value={course.id} />
                  <div className="min-w-[160px] flex-1 space-y-1">
                    <Label className="text-xs">Название</Label>
                    <Input name="title" defaultValue={course.title} required />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Цвет</Label>
                    <Input
                      name="color"
                      type="color"
                      defaultValue={course.color}
                      className="h-9 w-16 cursor-pointer p-1"
                    />
                  </div>
                  <Button type="submit" size="sm" variant="outline" disabled={isPending}>
                    Сохранить
                  </Button>
                </form>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  disabled={isPending}
                  onClick={() => handleDelete(course.id)}
                >
                  Удалить
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
