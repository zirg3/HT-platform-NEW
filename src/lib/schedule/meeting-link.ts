/** Безопасная ссылка для href (http(s), Zoom client и т.п.). */
export const safeLessonMeetingHref = (
  raw: string | null | undefined
): string | null => {
  const t = String(raw ?? "").trim()
  if (!t) return null
  if (/^https?:\/\//i.test(t)) return t
  if (/^zoommtg:/i.test(t)) return t
  if (/^mailto:/i.test(t)) return t
  if (/^tel:/i.test(t)) return t
  return null
}
