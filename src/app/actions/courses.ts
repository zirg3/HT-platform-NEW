"use server"

import { revalidatePath } from "next/cache"
import { requireRole } from "@/lib/auth/session"
import { createClient } from "@/lib/supabase/server"

export type CourseActionResult = {
  error?: string
}

export const saveCourseAction = async (
  formData: FormData
): Promise<CourseActionResult> => {
  await requireRole("admin")

  const courseId = String(formData.get("course_id") ?? "").trim() || undefined
  const title = String(formData.get("title") ?? "").trim()
  const color = String(formData.get("color") ?? "#3b82f6").trim()

  if (!title) return { error: "Укажите название курса" }

  const supabase = await createClient()

  if (courseId) {
    const { error } = await supabase
      .from("courses")
      .update({ title, color })
      .eq("id", courseId)
    if (error) return { error: error.message }
  } else {
    const { error } = await supabase.from("courses").insert({ title, color })
    if (error) return { error: error.message }
  }

  revalidatePath("/admin/courses")
  revalidatePath("/teacher")
  revalidatePath("/manager")
  return {}
}

export const deleteCourseAction = async (
  formData: FormData
): Promise<CourseActionResult> => {
  await requireRole("admin")

  const courseId = String(formData.get("course_id") ?? "").trim()
  if (!courseId) return { error: "Курс не указан" }

  const supabase = await createClient()
  const { error } = await supabase.from("courses").delete().eq("id", courseId)

  if (error) return { error: error.message }

  revalidatePath("/admin/courses")
  return {}
}
