"use client"

import { useRef } from "react"
import { useRouter } from "next/navigation"
import { CalendarDays } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  formatWeekParam,
  formatWeekRangeLabel,
  getWeekStartMonday,
} from "@/lib/schedule/dates"

type WeekDatePickerProps = {
  weekStart: Date
  pathname: string
}

export const WeekDatePicker = ({ weekStart, pathname }: WeekDatePickerProps) => {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  const handleOpenPicker = () => {
    inputRef.current?.showPicker?.()
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      handleOpenPicker()
    }
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (!value) return

    const [year, month, day] = value.split("-").map(Number)
    const picked = new Date(year, month - 1, day)
    const week = formatWeekParam(getWeekStartMonday(picked))
    router.push(`${pathname}?week=${week}`)
  }

  return (
    <div className="relative flex justify-center">
      <Button
        type="button"
        variant="outline"
        className="gap-2 font-medium"
        onClick={handleOpenPicker}
        onKeyDown={handleKeyDown}
        aria-label="Выбрать дату и перейти к неделе"
        tabIndex={0}
      >
        <CalendarDays className="size-4 shrink-0" aria-hidden />
        <span>{formatWeekRangeLabel(weekStart)}</span>
      </Button>
      <input
        ref={inputRef}
        type="date"
        className="pointer-events-none absolute h-0 w-0 opacity-0"
        aria-hidden
        tabIndex={-1}
        defaultValue={formatWeekParam(weekStart)}
        onChange={handleDateChange}
      />
    </div>
  )
}
