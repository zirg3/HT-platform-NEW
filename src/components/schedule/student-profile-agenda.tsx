"use client"

import { AgendaWithDialog } from "@/components/schedule/agenda-with-dialog"
import type {
  CourseRow,
  LessonRow,
  ProfileBrief,
  SchedulePermissions,
} from "@/lib/schedule/types"

type StudentProfileAgendaProps = {
  lessons: LessonRow[]
  week: string
  courses: CourseRow[]
  students: ProfileBrief[]
  teachers: ProfileBrief[]
  permissions: SchedulePermissions
  profileId: string
  sectionTitle?: string
}

export const StudentProfileAgenda = ({
  sectionTitle = "Расписание с вами",
  ...props
}: StudentProfileAgendaProps) => (
  <AgendaWithDialog
    {...props}
    context="teacher"
    sectionTitle={sectionTitle}
  />
)
