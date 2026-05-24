import {
  Link as TanStackLink,
  useNavigate,
  useRouter,
  useRouterState,
  useSearch,
} from "@tanstack/react-router"
import type { ComponentProps } from "react"

type AppLinkProps = ComponentProps<typeof TanStackLink> & {
  href?: string
}

/** Совместимость с next/link: href → to */
export const Link = ({ href, to, ...rest }: AppLinkProps) => (
  <TanStackLink to={to ?? href ?? "/"} {...rest} />
)

export { useNavigate, useRouter, useRouterState, useSearch }

export const usePathname = () => {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  return pathname
}

export const useSearchParams = () => {
  const search = useSearch({ strict: false }) as Record<string, string | undefined>
  return {
    get: (key: string) => search[key] ?? null,
    toString: () => new URLSearchParams(search as Record<string, string>).toString(),
  }
}
