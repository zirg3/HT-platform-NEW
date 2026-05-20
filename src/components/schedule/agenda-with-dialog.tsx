"use client"

import { useState } from "react"
import { AgendaLessonLists } from "@/components/schedule/agenda-lesson-lists"
import { LessonDialog } from "@/components/schedule/lesson-dialog"
import { splitLessonsByNow } from "@/lib/schedule/agenda"
import type {
  CourseRow,
  LessonRow,
  ProfileBrief,
  SchedulePermissions,
} from "@/lib/schedule/types"

type AgendaWithDialogProps = {
  lessons: LessonRow[]
  week: string
  courses: CourseRow[]
  students: ProfileBrief[]
  teachers: ProfileBrief[]
  permissions: SchedulePermissions
  profileId: string
  context: "student" | "teacher"
}

export const AgendaWithDialog = ({
  lessons,
  week,
  courses,
  students,
  teachers,
  permissions,
  profileId,
  context,
}: AgendaWithDialogProps) => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedLesson, setSelectedLesson] = useState<LessonRow | null>(null)
  const { upcoming, past } = splitLessonsByNow(lessons)

  const handleSelectLesson = (lesson: LessonRow) => {
    setSelectedLesson(lesson)
    setDialogOpen(true)
  }

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open)
    if (!open) setSelectedLesson(null)
  }

  return (
    <>
      <section className="space-y-3" aria-labelledby="agenda-heading">
        <h2 id="agenda-heading" className="text-lg font-semibold">
          Мои занятия
        </h2>
        <AgendaLessonLists
          upcoming={upcoming}
          past={past}
          context={context}
          onSelectLesson={handleSelectLesson}
          emptyHint="Окно списка: −90…+180 дней от сегодня (полный календарь — выше). Нажмите на занятие, чтобы открыть карточку."
        />
      </section>
      <LessonDialog
        open={dialogOpen}
        onOpenChange={handleDialogOpenChange}
        lesson={selectedLesson}
        week={week}
        courses={courses}
        students={students}
        teachers={teachers}
        permissions={permissions}
        profileId={profileId}
      />
    </>
  )
}
