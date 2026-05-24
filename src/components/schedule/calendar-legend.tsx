const LEGEND_ITEMS = [
  { label: "Запланирован", dot: "bg-emerald-400 ring-emerald-300" },
  { label: "Проведён", dot: "bg-violet-400 ring-violet-300" },
  { label: "Перенесён", dot: "bg-orange-400 ring-orange-300" },
  { label: "Отменён", dot: "bg-red-400 ring-red-300" },
] as const

export const CalendarLegend = () => (
  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border/50 px-3 py-2.5 text-xs text-muted-foreground">
    {LEGEND_ITEMS.map((item) => (
      <span key={item.label} className="inline-flex items-center gap-1.5">
        <span
          className={`size-2.5 rounded-full ring-1 ${item.dot}`}
          aria-hidden
        />
        {item.label}
      </span>
    ))}
  </div>
)
