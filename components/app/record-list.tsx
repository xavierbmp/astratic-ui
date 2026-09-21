import { cn } from "cn"

export function RecordList({ className, ...props }: React.ComponentProps<"ul">) {
  return <ul data-slot="record-list" className={cn("divide-y", className)} {...props} />
}

export function RecordListItem({
  leading,
  title,
  subtitle,
  status,
  value,
  selected = false,
  onClick,
  className,
}: {
  leading?: React.ReactNode
  title: React.ReactNode
  subtitle?: React.ReactNode
  status?: React.ReactNode
  value?: React.ReactNode
  selected?: boolean
  onClick?: () => void
  className?: string
}) {
  const content = (
    <>
      {leading}
      <span className="grid min-w-0 flex-1 leading-tight">
        <span className="truncate text-[13.5px] font-semibold">{title}</span>
        {subtitle && <span className="truncate text-xs text-muted-foreground">{subtitle}</span>}
      </span>
      {(status || value !== undefined) && (
        <span className="flex flex-none flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-3">
          {status}
          {value !== undefined && (
            <span className="text-right text-[13.5px] font-semibold tabular-nums sm:min-w-24">{value}</span>
          )}
        </span>
      )}
    </>
  )
  const base = cn("flex w-full items-center gap-3 px-4 py-2.5 text-left", selected && "bg-brand-soft shadow-[inset_2px_0_0_var(--brand)]", className)
  return (
    <li data-slot="record-list-item" data-state={selected ? "selected" : undefined}>
      {onClick ? (
        <button type="button" onClick={onClick} className={cn(base, "transition-colors", selected ? "hover:bg-brand-soft" : "hover:bg-muted/70")}>
          {content}
        </button>
      ) : (
        <div className={base}>{content}</div>
      )}
    </li>
  )
}
