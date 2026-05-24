import { revalidatePath } from "next/cache"
import { getRoleHomePath } from "@/lib/auth/paths"
import type { UserRole } from "@/types/roles"

export const revalidateSchedule = (week?: string, role?: UserRole) => {
  void week
  if (role) {
    revalidatePath(getRoleHomePath(role))
    return
  }
  revalidatePath("/teacher")
  revalidatePath("/student")
  revalidatePath("/manager")
  revalidatePath("/admin")
}
