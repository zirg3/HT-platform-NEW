import { Check, RotateCcw, X } from "lucide-react"
import type { LessonVisualKind } from "@/lib/schedule/lesson-appearance"
import { cn } from "@/lib/utils"

type LessonStatusIconProps = {
  kind: LessonVisualKind
  className?: string
}

export const LessonStatusIcon = ({ kind, className }: LessonStatusIconProps) => {
  if (kind === "upcoming" || kind === "past") {
    return null
  }

  const shell = cn(
    "flex size-4 shrink-0 items-center justify-center rounded-full bg-white/90 shadow-sm ring-1 ring-black/5",
    className
  )

  if (kind === "completed") {
    return (
      <span className={shell} aria-hidden>
        <Check className="size-2.5 text-violet-700" strokeWidth={2.5} />
      </span>
    )
  }
  if (kind === "rescheduled") {
    return (
      <span className={shell} aria-hidden>
        <RotateCcw className="size-2.5 text-orange-600" strokeWidth={2.5} />
      </span>
    )
  }
  return (
    <span className={shell} aria-hidden>
      <X className="size-2.5 text-red-600" strokeWidth={2.5} />
    </span>
  )
}
