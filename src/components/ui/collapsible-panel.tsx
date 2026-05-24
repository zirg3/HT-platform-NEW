"use client"

import { cn } from "@/lib/utils"

type CollapsiblePanelProps = {
  open: boolean
  children: React.ReactNode
  className?: string
  innerClassName?: string
}

/** Плавное раскрытие/скрытие блока (CSS grid 0fr → 1fr, без новых зависимостей). */
export const CollapsiblePanel = ({
  open,
  children,
  className,
  innerClassName,
}: CollapsiblePanelProps) => (
  <div
    className={cn(
      "grid transition-[grid-template-rows,opacity] duration-300 ease-in-out motion-reduce:transition-none",
      open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
      className
    )}
    aria-hidden={!open}
  >
    <div className={cn("min-h-0 overflow-hidden", innerClassName)}>
      {children}
    </div>
  </div>
)
