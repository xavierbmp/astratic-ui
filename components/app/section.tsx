import type { LucideIcon } from "lucide-react"
import { cn } from "cn"

export function Section({ className, ...props }: React.ComponentProps<"section">) {
  return (
    <section
      data-slot="section"
      className={cn("flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border bg-card shadow-xs", className)}
      {...props}
    />
  )
}

export function SectionHeader({
  icon: Icon,
  title,
  count,
  meta,
  action,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<"header">, "title"> & {
  icon?: LucideIcon
  title: React.ReactNode
  count?: number
  meta?: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <header
      data-slot="section-header"
      className={cn("flex min-h-10 flex-none items-center gap-2 border-b px-4 py-2", className)}
      {...props}
    >
      {Icon && <Icon className="size-4 text-muted-foreground" aria-hidden />}
      <h2 className="truncate text-sm font-semibold">{title}</h2>
      {count !== undefined && <SectionCount>{count}</SectionCount>}
      {meta && <span className="text-xs text-muted-foreground">{meta}</span>}
      {children}
      {action && <div className="ml-auto flex items-center gap-1.5">{action}</div>}
    </header>
  )
}

export function SectionCount({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-secondary px-1.5 text-xs font-medium tabular-nums text-secondary-foreground",
        className
      )}
      {...props}
    />
  )
}

export function SectionBody({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="section-body" className={cn("min-h-0 flex-1 overflow-auto", className)} {...props} />
}

export function SectionFooter({ className, ...props }: React.ComponentProps<"footer">) {
  return (
    <footer
      data-slot="section-footer"
      className={cn("flex flex-none items-center justify-between gap-3 border-t px-4 py-2 text-xs text-muted-foreground", className)}
      {...props}
    />
  )
}
