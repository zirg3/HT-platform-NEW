export const AgendaSectionSkeleton = () => (
  <>
    <section
      className="flex flex-col rounded-2xl border border-border/70 bg-white/30 p-4 sm:p-5"
      aria-hidden
    >
      <div className="mb-3 h-5 w-40 animate-pulse rounded-md bg-muted" />
      <div className="space-y-2.5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-2xl bg-muted/60"
          />
        ))}
      </div>
    </section>
    <section
      className="flex flex-col rounded-2xl border border-border/70 bg-white/30 p-4 sm:p-5"
      aria-hidden
    >
      <div className="mb-3 h-5 w-36 animate-pulse rounded-md bg-muted" />
      <div className="space-y-2.5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-2xl bg-muted/60"
          />
        ))}
      </div>
    </section>
  </>
)
