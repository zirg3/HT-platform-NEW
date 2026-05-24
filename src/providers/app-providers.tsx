import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { RouterProvider, type Router } from "@tanstack/react-router"
import { useMemo, type ReactNode } from "react"
import { AuthProvider, useAuth, type AuthRouterContext } from "@/providers/auth-provider"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

type AppProvidersProps = {
  router: Router<AuthRouterContext>
}

const InnerRouter = ({ router }: AppProvidersProps) => {
  const auth = useAuth()

  return (
    <RouterProvider
      router={router}
      context={{ auth }}
    />
  )
}

export const AppProviders = ({ router }: AppProvidersProps) => {
  const content = useMemo(
    () => (
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <InnerRouter router={router} />
        </AuthProvider>
      </QueryClientProvider>
    ),
    [router]
  )

  return content
}

export const AppShell = ({ children }: { children: ReactNode }) => (
  <div className="min-h-full flex flex-col flex-1">{children}</div>
)
