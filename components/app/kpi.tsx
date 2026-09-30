import type { LucideIcon } from "lucide-react"
import { TrendingDownIcon, TrendingUpIcon } from "lucide-react"
import { cn } from "cn"

export function KpiRow({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="kpi-row"
      className={cn("grid grid-cols-2 gap-3 sm:[grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]", className)}
      {...props}
    />
  )
}

type Delta = { value: number; label?: string; invert?: boolean }

export function KpiCard({
  icon: Icon,
  label,
  value,
  hint,
  delta,
  alert,
  active,
  onClick,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  icon?: LucideIcon
  label: string
  value: React.ReactNode
  hint?: React.ReactNode
  delta?: Delta
  alert?: React.ReactNode
  /** Con `onClick` la cifra es un atajo (filtra la lista de debajo): `active` la marca como puesta. */
  active?: boolean
}) {
  const pulsable = Boolean(onClick)
  const positive = delta ? (delta.invert ? delta.value < 0 : delta.value > 0) : undefined
  return (
    <div
      data-slot="kpi-card"
      role={pulsable ? "button" : undefined}
      tabIndex={pulsable ? 0 : undefined}
      aria-pressed={pulsable ? Boolean(active) : undefined}
      onClick={onClick}
      onKeyDown={
        pulsable
          ? (e) => {
              if (e.key !== "Enter" && e.key !== " ") return
              e.preventDefault()
              e.currentTarget.click()
            }
          : undefined
      }
      className={cn(
        "rounded-xl border bg-card px-4 py-3 shadow-xs",
        pulsable && "cursor-pointer outline-none transition-colors hover:border-foreground/20 hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring/50",
        active && "border-brand bg-brand-soft hover:border-brand hover:bg-brand-soft",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-1.5 text-[12.5px] text-muted-foreground">
        {Icon && <Icon className="size-3.5" aria-hidden />}
        <span className="truncate">{label}</span>
      </div>
      <div className="mt-1 flex flex-wrap items-baseline gap-x-2">
        <span className="text-xl font-semibold tracking-tight tabular-nums sm:text-2xl">{value}</span>
        {hint && <span className="truncate text-xs text-muted-foreground">{hint}</span>}
      </div>
      {(delta || alert) && (
        <div className="mt-1 flex flex-wrap items-center gap-x-1.5 text-xs">
          {delta && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 font-medium tabular-nums",
                positive ? "text-success" : delta.value === 0 ? "text-muted-foreground" : "text-danger"
              )}
            >
              {delta.value !== 0 &&
                (positive ? <TrendingUpIcon className="size-3" /> : <TrendingDownIcon className="size-3" />)}
              {delta.value > 0 ? "+" : ""}
              {delta.value.toLocaleString("es-ES", { maximumFractionDigits: 1 })} %
            </span>
          )}
          {delta?.label && <span className="text-muted-foreground">{delta.label}</span>}
          {alert && <span className="font-medium text-danger">{alert}</span>}
        </div>
      )}
    </div>
  )
}
