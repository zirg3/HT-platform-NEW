import { getPocketBase } from "@/lib/pocketbase/client"
import { mapUserToProfile, type PocketBaseUserRecord } from "@/types/profile"

export type CourseActionResult = {
  error?: string
}

const requireAdmin = () => {
  const pb = getPocketBase()
  const model = pb.authStore.model as PocketBaseUserRecord | null
  if (!model || model.role !== "admin") {
    throw new Error("Недостаточно прав")
  }
  return mapUserToProfile(model)
}

export const saveCourseAction = async (
  formData: FormData
): Promise<CourseActionResult> => {
  requireAdmin()

  const courseId = String(formData.get("course_id") ?? "").trim() || undefined
  const title = String(formData.get("title") ?? "").trim()
  const color = String(formData.get("color") ?? "#3b82f6").trim()

  if (!title) return { error: "Укажите название курса" }

  const pb = getPocketBase()

  try {
    if (courseId) {
      await pb.collection("courses").update(courseId, { title, color })
    } else {
      await pb.collection("courses").create({ title, color })
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : "Ошибка"
    return { error: message }
  }

  return {}
}

export const deleteCourseAction = async (
  formData: FormData
): Promise<CourseActionResult> => {
  requireAdmin()

  const courseId = String(formData.get("course_id") ?? "").trim()
  if (!courseId) return { error: "Курс не указан" }

  try {
    const pb = getPocketBase()
    await pb.collection("courses").delete(courseId)
  } catch (e) {
    const message = e instanceof Error ? e.message : "Ошибка"
    return { error: message }
  }

  return {}
}
