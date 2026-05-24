import type { Profile } from "@/lib/auth/session"
import { ROLE_LABELS } from "@/lib/auth/paths"
import type { UserRole } from "@/types/roles"

const TITLES: Partial<Record<UserRole, { title: string; subtitle: string }>> = {
  student: {
    title: "Моё расписание",
    subtitle: "Ваши занятия, отмены и домашние задания",
  },
  teacher: {
    title: "Моё расписание",
    subtitle: "Неделя, ученики и статусы уроков",
  },
  manager: {
    title: "Расписание",
    subtitle: "Все занятия организации",
  },
  admin: {
    title: "Расписание",
    subtitle: "Управление занятиями и курсами",
  },
}

type SchedulePageHeaderProps = {
  profile: Profile
}

export const SchedulePageHeader = ({ profile }: SchedulePageHeaderProps) => {
  const copy = TITLES[profile.role] ?? {
    title: "Расписание",
    subtitle: ROLE_LABELS[profile.role],
  }

  return (
    <header className="space-y-1">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        {copy.title}
      </h1>
      <p className="max-w-2xl text-sm text-muted-foreground">{copy.subtitle}</p>
    </header>
  )
}
