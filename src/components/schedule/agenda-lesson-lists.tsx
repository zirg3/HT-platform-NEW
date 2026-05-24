"use client"

import { AgendaLessonRow } from "@/components/schedule/agenda-lesson-row"
import { AGENDA_LIMIT } from "@/lib/schedule/lesson-appearance"
import type { LessonRow } from "@/lib/schedule/types"

type AgendaListProps = {
  title: string
  description: string
  lessons: LessonRow[]
  context: "student" | "teacher"
  variant: "upcoming" | "past"
  onSelectLesson?: (lesson: LessonRow) => void
}

export const AgendaList = ({
  title,
  description,
  lessons,
  context,
  variant,
  onSelectLesson,
}: AgendaListProps) => {
  const limited = lessons.slice(0, AGENDA_LIMIT)
  const sectionId = `agenda-${variant}`

  return (
    <section className="flex h-full flex-col gap-3" aria-labelledby={sectionId}>
      <div>
        <h3 id={sectionId} className="text-base font-semibold tracking-tight">
          {title}
        </h3>
        <p className="text-xs text-muted-foreground">{description}</p>
        {lessons.length > AGENDA_LIMIT ? (
          <p className="mt-0.5 text-xs text-muted-foreground">
            Показаны {AGENDA_LIMIT} из {lessons.length}
          </p>
        ) : null}
      </div>
      {limited.length === 0 ? (
        <p className="rounded-md border border-dashed border-border/60 bg-muted/20 px-3 py-6 text-center text-sm text-muted-foreground">
          Пока пусто
        </p>
      ) : (
        <ul className="flex flex-1 flex-col gap-2.5" role="list">
          {limited.map((lesson) => (
            <li key={lesson.id} role="listitem">
              <AgendaLessonRow
                lesson={lesson}
                context={context}
                variant={variant}
                onClick={
                  onSelectLesson ? () => onSelectLesson(lesson) : undefined
                }
              />
            </li>
          ))}
        </ul>
      )}
      {lessons.length > 0 ? (
        <p className="text-center text-xs text-primary/80">
          {variant === "upcoming"
            ? "Показать все предстоящие"
            : "Показать все прошедшие"}
        </p>
      ) : null}
    </section>
  )
}
