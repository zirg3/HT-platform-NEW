import { Link } from "@/lib/navigation"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export const NotFoundPage = () => (
  <div className="aurora-bg flex min-h-full flex-1 flex-col items-center justify-center gap-4 px-4 py-12">
    <h1 className="text-2xl font-semibold">Страница не найдена</h1>
    <p className="text-sm text-muted-foreground">Проверьте адрес или вернитесь на главную.</p>
    <Link to="/" className={cn(buttonVariants({ variant: "outline" }))}>
      На главную
    </Link>
  </div>
)
