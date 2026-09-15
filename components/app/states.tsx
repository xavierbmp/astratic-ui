import type { LucideIcon } from "lucide-react"
import { InboxIcon, RefreshCwIcon, TriangleAlertIcon } from "lucide-react"
import { cn } from "cn"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

export function EmptyState({
  icon: Icon = InboxIcon,
  title,
  description,
  action,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  icon?: LucideIcon
  title: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <div
      data-slot="empty-state"
      className={cn("flex flex-col items-center justify-center gap-2 px-6 py-12 text-center", className)}
      {...props}
    >
      <span className="grid size-10 place-items-center rounded-lg border bg-muted/40 text-muted-foreground">
        <Icon className="size-5" aria-hidden />
      </span>
      <p className="mt-1 text-sm font-medium">{title}</p>
      {description && <p className="max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}

export function ErrorState({
  title = "No se ha podido cargar",
  description,
  onRetry,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  title?: React.ReactNode
  description?: React.ReactNode
  onRetry?: () => void
}) {
  return (
    <div
      role="alert"
      data-slot="error-state"
      className={cn("flex flex-col items-center justify-center gap-2 px-6 py-12 text-center", className)}
      {...props}
    >
      <span className="grid size-10 place-items-center rounded-lg bg-danger-soft text-danger">
        <TriangleAlertIcon className="size-5" aria-hidden />
      </span>
      <p className="mt-1 text-sm font-medium">{title}</p>
      {description && <p className="max-w-sm text-sm text-muted-foreground">{description}</p>}
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-2" onClick={onRetry}>
          <RefreshCwIcon /> Reintentar
        </Button>
      )}
    </div>
  )
}

export function TableSkeleton({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div role="status" aria-label="Cargando" className="divide-y">
      <div className="flex gap-4 bg-muted/40 px-4 py-2.5">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-3 flex-1 rounded" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4 px-4 py-3">
          <Skeleton className="size-8 rounded-lg" />
          {Array.from({ length: cols - 1 }).map((_, c) => (
            <Skeleton key={c} className={cn("h-3.5 flex-1 rounded", c === 0 && "flex-[1.6]")} />
          ))}
        </div>
      ))}
    </div>
  )
}

export function KanbanSkeleton({ cols = 4 }: { cols?: number }) {
  return (
    <div role="status" aria-label="Cargando" className="flex gap-2.5 overflow-hidden p-3">
      {Array.from({ length: cols }).map((_, i) => (
        <div key={i} className="flex min-w-52 flex-1 basis-52 flex-col gap-1.5 rounded-xl bg-muted/60 p-1.5">
          <div className="flex flex-col gap-1.5 px-1.5 pt-1 pb-2">
            <Skeleton className="h-3.5 w-28 rounded bg-background" />
            <Skeleton className="h-3 w-16 rounded bg-background" />
          </div>
          {Array.from({ length: 3 - (i % 2) }).map((_, j) => (
            <Skeleton key={j} className="h-24 rounded-lg bg-background" />
          ))}
        </div>
      ))}
    </div>
  )
}

export function KpiSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:[grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl border bg-card px-4 py-3 shadow-xs">
          <Skeleton className="h-3 w-24 rounded" />
          <Skeleton className="mt-2 h-7 w-20 rounded" />
          <Skeleton className="mt-2 h-3 w-28 rounded" />
        </div>
      ))}
    </div>
  )
}
