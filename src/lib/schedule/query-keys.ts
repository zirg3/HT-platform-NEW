export const scheduleKeys = {
  all: ["schedule"] as const,
  week: (weekKey: string) => ["schedule", "week", weekKey] as const,
  reference: (role: string, userId: string) =>
    ["schedule", "reference", role, userId] as const,
  agenda: (userId: string) => ["schedule", "agenda", userId] as const,
  students: (teacherId: string) => ["students", teacherId] as const,
  studentProfile: (studentId: string) => ["student-profile", studentId] as const,
  cancelledHistory: (studentId: string) =>
    ["cancelled-history", studentId] as const,
}
