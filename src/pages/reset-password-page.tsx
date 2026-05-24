import { getRouteApi } from "@tanstack/react-router"
import { ResetPasswordForm } from "@/components/auth/reset-password-form"

const routeApi = getRouteApi("/login/reset-password")

export const ResetPasswordPage = () => {
  const { token } = routeApi.useSearch()

  return (
    <div className="aurora-bg flex min-h-full flex-1 flex-col items-center justify-center px-4 py-12">
      <ResetPasswordForm token={token} />
    </div>
  )
}
