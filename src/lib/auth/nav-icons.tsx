import {
  BookOpen,
  CalendarDays,
  Link2,
  UserCog,
  Users,
} from "lucide-react"
import { cn } from "@/lib/utils"

type NavIconProps = {
  href: string
  className?: string
}

export const NavIcon = ({ href, className }: NavIconProps) => {
  const merged = cn("size-[18px] shrink-0", className)

  if (href === "/teacher/students") {
    return <Users className={merged} aria-hidden />
  }
  if (href === "/admin/courses") {
    return <BookOpen className={merged} aria-hidden />
  }
  if (href === "/admin/users") {
    return <UserCog className={merged} aria-hidden />
  }
  if (href === "/admin/assignments" || href === "/manager/assignments") {
    return <Link2 className={merged} aria-hidden />
  }
  return <CalendarDays className={merged} aria-hidden />
}
