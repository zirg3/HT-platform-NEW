import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ROLE_LABELS } from "@/lib/auth/paths"
import type { UserRole } from "@/types/roles"

type RolePlaceholderProps = {
  role: UserRole
  features: string[]
}

export const RolePlaceholder = ({ role, features }: RolePlaceholderProps) => (
  <Card>
    <CardHeader>
      <CardTitle>Личный кабинет · {ROLE_LABELS[role]}</CardTitle>
      <CardDescription>
        Раздел в разработке.
      </CardDescription>
    </CardHeader>
    <CardContent>
      <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
        {features.map((feature) => (
          <li key={feature}>{feature}</li>
        ))}
      </ul>
    </CardContent>
  </Card>
)
