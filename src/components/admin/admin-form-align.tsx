import { Label } from "@/components/ui/label"

export const AdminFieldLabelSpacer = () => (
  <Label
    className="pointer-events-none block text-xs leading-none opacity-0 select-none"
    aria-hidden
  >
    —
  </Label>
)

type AdminAlignedCellProps = {
  children: React.ReactNode
  className?: string
}

export const AdminAlignedCell = ({
  children,
  className,
}: AdminAlignedCellProps) => (
  <div className={className ?? "space-y-1"}>
    <AdminFieldLabelSpacer />
    <div className="flex h-8 items-center">{children}</div>
  </div>
)

export const AdminAlignedButtonCell = ({
  children,
}: {
  children: React.ReactNode
}) => (
  <div className="space-y-1">
    <AdminFieldLabelSpacer />
    {children}
  </div>
)
