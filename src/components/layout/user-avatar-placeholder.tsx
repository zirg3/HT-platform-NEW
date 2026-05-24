import { GraduationCap } from "lucide-react"
import { cn } from "@/lib/utils"

const sizeClass = {
  sm: "size-9 text-xs",
  md: "size-10 text-sm",
  lg: "size-14 text-base",
} as const

type UserAvatarPlaceholderProps = {
  displayName: string
  size?: keyof typeof sizeClass
  className?: string
  /** photo — круг как в макете (без градиентной «овальной» обводки) */
  variant?: "default" | "photo"
}

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase()
}

export const UserAvatarPlaceholder = ({
  displayName,
  size = "md",
  className,
  variant = "default",
}: UserAvatarPlaceholderProps) => {
  const initials = getInitials(displayName)

  if (variant === "photo") {
    return (
      <div
        className={cn(
          "flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted",
          "font-semibold text-muted-foreground",
          sizeClass[size],
          className
        )}
        aria-hidden
      >
        <span>{initials}</span>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full",
        "bg-gradient-to-br from-violet-500 via-indigo-500 to-cyan-400",
        "font-semibold text-white shadow-md ring-2 ring-white/50",
        sizeClass[size],
        className
      )}
      aria-hidden
    >
      <span className="relative z-10">{initials}</span>
      <GraduationCap
        className="absolute -right-0.5 -bottom-0.5 size-[38%] text-white/35"
        strokeWidth={2}
        aria-hidden
      />
    </div>
  )
}
