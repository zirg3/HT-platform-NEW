import type { Metadata } from "next"
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"

export const metadata: Metadata = {
  title: "Восстановление пароля",
}

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center bg-muted/30 px-4 py-12">
      <ForgotPasswordForm />
    </div>
  )
}
