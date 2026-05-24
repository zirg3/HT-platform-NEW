import { Check, CircleDot, Lightbulb, RotateCcw, X } from "lucide-react"
import { computeWeekStats } from "@/lib/schedule/week-stats"
import type { LessonRow } from "@/lib/schedule/types"

type ScheduleWeekStatsProps = {
  lessons: LessonRow[]
}

export const ScheduleWeekStats = ({ lessons }: ScheduleWeekStatsProps) => {
  const stats = computeWeekStats(lessons)

  const rows = [
    { label: "Всего занятий", value: stats.total, icon: CircleDot },
    { label: "Запланировано", value: stats.upcoming, icon: CircleDot },
    { label: "Завершено", value: stats.completed, icon: Check },
    { label: "Перенесено", value: stats.rescheduled, icon: RotateCcw },
    { label: "Отменено", value: stats.cancelled, icon: X },
  ] as const

  const conducted = stats.completed

  return (
    <aside className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-white/30 p-4 sm:p-5">
      <div>
        <h2 className="text-base font-semibold tracking-tight">
          Статистика на неделю
        </h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          По урокам в выбранной неделе
        </p>
      </div>
      <ul className="space-y-2.5 text-sm">
        {rows.map((row) => (
          <li
            key={row.label}
            className="flex items-center justify-between gap-2"
          >
            <span className="flex items-center gap-2 text-muted-foreground">
              <row.icon className="size-3.5 shrink-0 opacity-70" aria-hidden />
              {row.label}
            </span>
            <span className="font-semibold tabular-nums text-foreground">
              {row.value}
            </span>
          </li>
        ))}
      </ul>
      <div className="space-y-2 border-t border-white/40 pt-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-foreground">Загрузка</span>
          <span className="font-semibold text-primary">
            {stats.workloadPercent}%
          </span>
        </div>
        <div
          className="h-2.5 overflow-hidden rounded-full bg-white/50"
          role="progressbar"
          aria-valuenow={stats.workloadPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Загрузка недели"
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 via-primary to-cyan-400 transition-all"
            style={{ width: `${stats.workloadPercent}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          {conducted} из {stats.total} занятий
        </p>
      </div>
      <div className="flex gap-2.5 rounded-2xl border border-white/50 bg-primary/5 px-3 py-2.5">
        <Lightbulb
          className="mt-0.5 size-4 shrink-0 text-primary"
          aria-hidden
        />
        <p className="text-xs leading-relaxed text-muted-foreground">
          <span className="font-medium text-foreground">Совет на сегодня:</span>{" "}
          отмечайте уроки проведёнными сразу после занятия — статистика
          останется актуальной.
        </p>
      </div>
    </aside>
  )
}
