import { Navigate } from "@tanstack/react-router"
import { useAuth } from "@/providers/auth-provider"
import { getRoleHomePath } from "@/lib/auth/paths"

export const HomePage = () => {
  const { profile, isLoading } = useAuth()

  if (isLoading) {
    return null
  }

  if (!profile) {
    return <Navigate to="/login" />
  }

  return <Navigate to={getRoleHomePath(profile.role)} />
}
