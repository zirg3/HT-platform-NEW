"use client"

import { useState } from "react"
import { AgendaList } from "@/components/schedule/agenda-lesson-lists"
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
      <section className="flex flex-col rounded-lg border border-border/70 bg-white/30 p-4 sm:p-5">
        <AgendaList
          title="Предстоящие занятия"
          description="Ближайшие уроки"
          lessons={upcoming}
          context={context}
          variant="upcoming"
          onSelectLesson={handleSelectLesson}
        />
      </section>
      <section className="flex flex-col rounded-lg border border-border/70 bg-white/30 p-4 sm:p-5">
        <AgendaList
          title="Прошедшие занятия"
          description="История"
          lessons={[...past].reverse()}
          context={context}
          variant="past"
          onSelectLesson={handleSelectLesson}
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
