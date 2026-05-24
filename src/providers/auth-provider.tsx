import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import type { RecordModel } from "pocketbase"
import { getRoleHomePath } from "@/lib/auth/paths"
import { getPocketBase } from "@/lib/pocketbase/client"
import {
  mapUserToProfile,
  type PocketBaseUserRecord,
  type Profile,
} from "@/types/profile"
import type { UserRole } from "@/types/roles"

export type AuthContextValue = {
  profile: Profile | null
  isLoading: boolean
  isAuthenticated: boolean
  refreshProfile: () => Promise<void>
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  resolveRedirectPath: (nextPath?: string) => string
  requireRole: (role: UserRole) => Profile
}

const AuthContext = createContext<AuthContextValue | null>(null)

const readProfileFromAuth = (): Profile | null => {
  const pb = getPocketBase()
  const model = pb.authStore.model as RecordModel | null
  if (!model) return null
  return mapUserToProfile(model as unknown as PocketBaseUserRecord)
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<Profile | null>(() => {
    try {
      return readProfileFromAuth()
    } catch {
      return null
    }
  })
  const [isLoading, setIsLoading] = useState(true)

  const refreshProfile = useCallback(async () => {
    const pb = getPocketBase()

    if (!pb.authStore.isValid) {
      setProfile(null)
      return
    }

    try {
      await pb.collection("users").authRefresh()
      setProfile(readProfileFromAuth())
    } catch {
      pb.authStore.clear()
      setProfile(null)
    }
  }, [])

  useEffect(() => {
    const pb = getPocketBase()

    const unsubscribe = pb.authStore.onChange(() => {
      setProfile(readProfileFromAuth())
    })

    void refreshProfile().finally(() => setIsLoading(false))

    return () => {
      unsubscribe()
    }
  }, [refreshProfile])

  const signIn = useCallback(async (email: string, password: string) => {
    const pb = getPocketBase()

    try {
      await pb.collection("users").authWithPassword(email, password)
      const nextProfile = readProfileFromAuth()
      if (!nextProfile?.role) {
        pb.authStore.clear()
        return {
          error: "Профиль не найден. Обратитесь к администратору.",
        }
      }
      setProfile(nextProfile)
      return {}
    } catch (err) {
      const message = err instanceof Error ? err.message : "Ошибка входа"
      const lower = message.toLowerCase()
      if (
        lower.includes("invalid") ||
        lower.includes("credentials") ||
        lower.includes("password")
      ) {
        return { error: "Неверный email или пароль" }
      }
      if (lower.includes("fetch") || lower.includes("network")) {
        return {
          error: "Нет связи с PocketBase. Проверьте интернет и .env.local.",
        }
      }
      return { error: message }
    }
  }, [])

  const signOut = useCallback(async () => {
    const pb = getPocketBase()
    pb.authStore.clear()
    setProfile(null)
  }, [])

  const resolveRedirectPath = useCallback(
    (nextPath?: string) => {
      if (!profile) return "/login"
      if (nextPath && nextPath.startsWith("/")) return nextPath
      return getRoleHomePath(profile.role)
    },
    [profile]
  )

  const requireRole = useCallback(
    (role: UserRole): Profile => {
      if (!profile) {
        throw new Error("AUTH_REQUIRED")
      }
      if (profile.role !== role) {
        throw new Error("ROLE_MISMATCH")
      }
      return profile
    },
    [profile]
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      profile,
      isLoading,
      isAuthenticated: Boolean(profile),
      refreshProfile,
      signIn,
      signOut,
      resolveRedirectPath,
      requireRole,
    }),
    [
      profile,
      isLoading,
      refreshProfile,
      signIn,
      signOut,
      resolveRedirectPath,
      requireRole,
    ]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return ctx
}

export type AuthRouterContext = {
  auth: AuthContextValue
}
