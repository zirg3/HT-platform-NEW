import { AgendaLessonLists } from "@/components/schedule/agenda-lesson-lists"
import type { Profile } from "@/lib/auth/session"
import { splitLessonsByNow } from "@/lib/schedule/agenda"
import { fetchAgendaLessonsForLk } from "@/lib/schedule/queries"

type AgendaSectionProps = {
  profile: Profile
}

export const AgendaSection = async ({ profile }: AgendaSectionProps) => {
  if (profile.role !== "student" && profile.role !== "teacher") {
    return null
  }

  const lessons = await fetchAgendaLessonsForLk(profile.id, profile.role)
  const { upcoming, past } = splitLessonsByNow(lessons)

  return (
    <section className="space-y-3" aria-labelledby="agenda-heading">
      <h2 id="agenda-heading" className="text-lg font-semibold">
        Мои занятия
      </h2>
      <AgendaLessonLists
        upcoming={upcoming}
        past={past}
        context={profile.role}
        emptyHint="Окно списка: −90…+180 дней от сегодня (полный календарь — выше)."
      />
    </section>
  )
}
