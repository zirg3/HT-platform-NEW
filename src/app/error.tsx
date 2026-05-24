"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

type ErrorPageProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  const isNetwork =
    /ECONNRESET|terminated|fetch failed|network/i.test(error.message)

  return (
    <div className="aurora-bg flex min-h-full flex-1 items-center justify-center p-6">
      <div className="glass-panel w-full max-w-md space-y-4 rounded-2xl p-6 text-center">
        <h1 className="text-lg font-semibold">Не удалось загрузить страницу</h1>
        <p className="text-sm text-muted-foreground">
          {isNetwork
            ? "Сбой соединения с Supabase. Проверьте интернет и .env.local, затем повторите."
            : "Произошла ошибка при загрузке данных."}
        </p>
        <Button type="button" onClick={reset} className="w-full">
          Повторить
        </Button>
      </div>
    </div>
  )
}
