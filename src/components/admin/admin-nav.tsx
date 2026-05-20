import Link from "next/link"
import { Button } from "@/components/ui/button"

const links = [
  { href: "/admin", label: "Расписание" },
  { href: "/admin/courses", label: "Курсы" },
  { href: "/admin/users", label: "Пользователи" },
  { href: "/admin/assignments", label: "Привязки" },
] as const

export const AdminNav = () => (
  <nav className="flex flex-wrap gap-2" aria-label="Разделы администратора">
    {links.map((link) => (
      <Link key={link.href} href={link.href}>
        <Button variant="outline" size="sm" type="button">
          {link.label}
        </Button>
      </Link>
    ))}
  </nav>
)
