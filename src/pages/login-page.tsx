import { getRouteApi } from "@tanstack/react-router"
import { LoginForm } from "@/components/auth/login-form"

const routeApi = getRouteApi("/login")

export const LoginPage = () => {
  const { next, reset } = routeApi.useSearch()

  return (
    <div className="aurora-bg flex min-h-full flex-1 flex-col items-center justify-center px-4 py-12">
      <LoginForm
        nextPath={next?.startsWith("/") ? next : undefined}
        passwordResetSuccess={reset === "success"}
      />
    </div>
  )
}
