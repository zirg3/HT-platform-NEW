import type { Metadata } from "next"
import { LoginForm } from "@/components/auth/login-form"

export const metadata: Metadata = {
  title: "Вход",
}

type LoginPageProps = {
  searchParams: Promise<{ next?: string }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams
  const nextPath = params.next?.startsWith("/") ? params.next : undefined

  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center bg-muted/30 px-4 py-12">
      <LoginForm nextPath={nextPath} />
    </div>
  )
}
