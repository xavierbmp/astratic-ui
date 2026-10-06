import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { ArrowUpRightIcon } from "lucide-react"
import { cn } from "cn"
import { tintClass, type Tint } from "@/lib/influencer/tints"

export function StatRow({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="ws-stat-row" className={cn("grid grid-cols-2 gap-4 lg:grid-cols-4", className)} {...props} />
  )
}

/**
 * Cifra de una portada: icono en un círculo de color, número grande y etiqueta. Con `href` la
 * tarjeta entera lleva a su página; con `onClick` es un atajo que filtra la lista de debajo y
 * `active` la marca como puesta (como `KpiCard` del madre). Solo va en las portadas.
 */
export function StatTile({
  icon: Icon,
  label,
  value,
  hint,
  tint = "lavender",
  href,
  onClick,
  active = false,
  className,
}: {
  icon: LucideIcon
  label: string
  value: React.ReactNode
  hint?: React.ReactNode
  tint?: Tint
  href?: string
  onClick?: () => void
  active?: boolean
  className?: string
}) {
  const body = (
    <>
      <div className="flex items-start justify-between">
        <span className={cn("grid size-10 place-items-center rounded-full", tintClass[tint])}>
          <Icon className="size-[18px]" aria-hidden />
        </span>
        {href && (
          <ArrowUpRightIcon
            className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
            aria-hidden
          />
        )}
      </div>
      <div className="mt-4">
        <p className="text-2xl leading-none font-semibold tracking-tight tabular-nums">{value}</p>
        <p className="mt-1.5 text-sm text-muted-foreground">{label}</p>
        {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
      </div>
    </>
  )
  const classes = cn("group flex flex-col rounded-2xl bg-card p-5 shadow-card", active && "bg-brand-soft ring-2 ring-brand", className)
  if (href) {
    return (
      <Link
        data-slot="ws-stat-tile"
        href={href}
        className={cn(classes, "outline-none transition-transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-ring/50")}
      >
        {body}
      </Link>
    )
  }
  if (onClick) {
    return (
      <button
        type="button"
        data-slot="ws-stat-tile"
        aria-pressed={active}
        onClick={onClick}
        className={cn(classes, "text-left outline-none transition-transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-ring/50")}
      >
        {body}
      </button>
    )
  }
  return (
    <div data-slot="ws-stat-tile" className={classes}>
      {body}
    </div>
  )
}
