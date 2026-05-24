import { SCHEDULE_END_HOUR, SCHEDULE_START_HOUR } from "@/lib/schedule/dates"
import { SCHEDULE_SLOT_PX } from "@/lib/schedule/lesson-appearance"
import { cn } from "@/lib/utils"

type WeekCalendarGridSkeletonProps = {
  className?: string
}

/** Skeleton only for hour cells (not nav / day headers). */
export const WeekCalendarGridSkeleton = ({
  className,
}: WeekCalendarGridSkeletonProps) => {
  const gridHeight = (SCHEDULE_END_HOUR - SCHEDULE_START_HOUR) * SCHEDULE_SLOT_PX
  const hourCount = SCHEDULE_END_HOUR - SCHEDULE_START_HOUR

  return (
    <div
      className={cn("pointer-events-none min-w-[720px] animate-pulse", className)}
      aria-hidden
    >
      <div className="grid grid-cols-[56px_repeat(7,minmax(0,1fr))] divide-x divide-border/70">
        <div
          className="relative bg-white/25"
          style={{ height: gridHeight }}
        >
          {Array.from({ length: hourCount }).map((_, i) => (
            <div
              key={i}
              className="absolute right-1 h-2 w-6 rounded bg-muted/50"
              style={{ top: i * SCHEDULE_SLOT_PX + 24 }}
            />
          ))}
        </div>
        {Array.from({ length: 7 }).map((_, dayIndex) => (
          <div
            key={dayIndex}
            className="relative bg-white/25"
            style={{ height: gridHeight }}
          >
            {Array.from({ length: hourCount }).map((_, i) => (
              <div
                key={i}
                className="absolute right-0 left-0 border-t border-border/50"
                style={{ top: i * SCHEDULE_SLOT_PX, height: SCHEDULE_SLOT_PX }}
              />
            ))}
            <div className="absolute inset-x-2 top-1/4 h-8 rounded-md bg-muted/40" />
            <div className="absolute inset-x-3 top-[55%] h-6 rounded-md bg-muted/30" />
          </div>
        ))}
      </div>
    </div>
  )
}
