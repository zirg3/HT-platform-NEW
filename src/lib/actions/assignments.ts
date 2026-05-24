import { getPocketBase } from "@/lib/pocketbase/client"
import { getPocketBaseErrorMessage } from "@/lib/pocketbase/errors"
import { mapUserToProfile, type PocketBaseUserRecord } from "@/types/profile"

export type AssignmentActionResult = { error?: string }

const requireStaff = () => {
  const pb = getPocketBase()
  const model = pb.authStore.model as PocketBaseUserRecord | null
  if (!model || (model.role !== "manager" && model.role !== "admin")) {
    throw new Error("Недостаточно прав")
  }
  return mapUserToProfile(model)
}

export const assignStudentTeacherAction = async (
  formData: FormData
): Promise<AssignmentActionResult> => {
  requireStaff()

  const studentId = String(formData.get("student_id") ?? "").trim()
  const teacherId = String(formData.get("teacher_id") ?? "").trim()

  if (!studentId || !teacherId) {
    return { error: "Выберите ученика и преподавателя" }
  }

  if (studentId === teacherId) {
    return { error: "Ученик и преподаватель должны различаться" }
  }

  try {
    const pb = getPocketBase()
    await pb.collection("student_teacher").create({
      student: studentId,
      teacher: teacherId,
    })
  } catch (e) {
    const message = getPocketBaseErrorMessage(e, "Не удалось создать привязку")
    if (message.toLowerCase().includes("unique")) {
      return { error: "Такая привязка уже существует" }
    }
    return { error: message }
  }

  return {}
}

export const updateAssignmentAction = async (
  formData: FormData
): Promise<AssignmentActionResult> => {
  requireStaff()

  const assignmentId = String(formData.get("assignment_id") ?? "").trim()
  const studentId = String(formData.get("student_id") ?? "").trim()
  const teacherId = String(formData.get("teacher_id") ?? "").trim()

  if (!assignmentId) return { error: "Привязка не указана" }
  if (!studentId || !teacherId) {
    return { error: "Выберите ученика и преподавателя" }
  }
  if (studentId === teacherId) {
    return { error: "Ученик и преподаватель должны различаться" }
  }

  try {
    const pb = getPocketBase()
    await pb.collection("student_teacher").update(assignmentId, {
      student: studentId,
      teacher: teacherId,
    })
  } catch (e) {
    const message = getPocketBaseErrorMessage(e, "Не удалось обновить привязку")
    if (message.toLowerCase().includes("unique")) {
      return { error: "Такая привязка уже существует" }
    }
    return { error: message }
  }

  return {}
}

export const removeAssignmentAction = async (
  formData: FormData
): Promise<AssignmentActionResult> => {
  requireStaff()

  const assignmentId = String(formData.get("assignment_id") ?? "").trim()
  if (!assignmentId) return { error: "Привязка не указана" }

  try {
    const pb = getPocketBase()
    await pb.collection("student_teacher").delete(assignmentId)
  } catch (e) {
    return {
      error: getPocketBaseErrorMessage(e, "Не удалось удалить привязку"),
    }
  }

  return {}
}
