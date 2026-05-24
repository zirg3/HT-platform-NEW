import { useAuth } from "@/providers/auth-provider"
import { SchedulePageClient } from "@/components/schedule/schedule-page-client"

export const StudentPage = () => {
  const { profile } = useAuth()
  if (!profile) return null
  return <SchedulePageClient profile={profile} />
}

export const TeacherPage = StudentPage
export const ManagerPage = StudentPage
export const AdminPage = StudentPage
