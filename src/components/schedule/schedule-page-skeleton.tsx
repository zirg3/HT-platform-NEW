import { AgendaSectionSkeleton } from "@/components/schedule/agenda-section-skeleton"

export const SchedulePageSkeleton = () => (
  <div className="space-y-6" aria-busy="true" aria-label="Загрузка расписания">
    <div className="space-y-2">
      <div className="h-8 w-56 animate-pulse rounded-lg bg-muted" />
      <div className="h-4 w-72 max-w-full animate-pulse rounded-md bg-muted/70" />
    </div>
    <div className="h-[420px] animate-pulse rounded-2xl border border-border/70 bg-white/30" />
    <div className="grid gap-4 lg:grid-cols-3">
      <AgendaSectionSkeleton />
      <div className="h-64 animate-pulse rounded-2xl border border-border/70 bg-white/30 lg:col-span-1" />
    </div>
  </div>
)
