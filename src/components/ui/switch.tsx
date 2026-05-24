"use client"

import { Switch as SwitchPrimitive } from "@base-ui/react/switch"

import { cn } from "@/lib/utils"

function Switch({ className, ...props }: SwitchPrimitive.Root.Props) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border transition-colors outline-none",
        "border-primary/35 bg-[oklch(0.76_0.08_285/0.9)] shadow-[inset_0_1px_3px_oklch(0.45_0.1_280/0.18)]",
        "focus-visible:ring-3 focus-visible:ring-ring/50",
        "data-checked:border-primary/50 data-checked:bg-primary data-checked:shadow-none",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block size-4 rounded-full bg-white shadow-sm ring-1 ring-primary/25 transition-transform",
          "translate-x-0.5 data-checked:translate-x-4.5 data-checked:ring-primary/15"
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
