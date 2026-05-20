"use server"

import { revalidatePath } from "next/cache"
import { requireStaff } from "@/lib/auth/session"
import { createClient } from "@/lib/supabase/server"

export type AssignmentActionResult = { error?: string }

export const assignStudentTeacherAction = async (
  formData: FormData
): Promise<AssignmentActionResult> => {
  await requireStaff()

  const studentId = String(formData.get("student_id") ?? "").trim()
  const teacherId = String(formData.get("teacher_id") ?? "").trim()

  if (!studentId || !teacherId) {
    return { error: "Выберите ученика и преподавателя" }
  }

  if (studentId === teacherId) {
    return { error: "Ученик и преподаватель должны различаться" }
  }

  const supabase = await createClient()
  const { error } = await supabase.from("student_teacher").insert({
    student_id: studentId,
    teacher_id: teacherId,
  })

  if (error) {
    if (error.code === "23505") {
      return { error: "Такая привязка уже существует" }
    }
    return { error: error.message }
  }

  revalidatePath("/admin/assignments")
  revalidatePath("/manager/assignments")
  revalidatePath("/teacher/students")
  return {}
}

export const removeAssignmentAction = async (
  formData: FormData
): Promise<AssignmentActionResult> => {
  await requireStaff()

  const assignmentId = String(formData.get("assignment_id") ?? "").trim()
  if (!assignmentId) return { error: "Привязка не указана" }

  const supabase = await createClient()
  const { error } = await supabase
    .from("student_teacher")
    .delete()
    .eq("id", assignmentId)

  if (error) return { error: error.message }

  revalidatePath("/admin/assignments")
  revalidatePath("/manager/assignments")
  revalidatePath("/teacher/students")
  return {}
}
