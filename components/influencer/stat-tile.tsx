import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { ArrowUpRightIcon } from "lucide-react"
import { cn } from "cn"
import { tintClass, tintTextClass, type Tint } from "@/lib/influencer/tints"

export function StatRow({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="ws-stat-row" className={cn("grid grid-cols-2 gap-4 lg:grid-cols-4", className)} {...props} />
  )
}

/**
 * Cifra de una portada: icono en un círculo de color, número grande y etiqueta. Con `href` la
 * tarjeta entera lleva a su página; con `onClick` es un atajo que filtra la lista de debajo y
 * `active` la marca como puesta (como `KpiCard` del madre). Solo va en las portadas.
 * `chart` pone a la derecha de la cifra un gráfico pequeño que la explica (`MiniBarras`, `MiniAnillo`, `MiniTramos`), en el
 * color de su tinte; solo cuando aporta un dato que la cifra no dice (Xavier, 2026-10-16: «sutiles»).
 */
export function StatTile({
  icon: Icon,
  label,
  value,
  hint,
  tint = "lavender",
  chart,
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
  chart?: React.ReactNode
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
      <div className="mt-4 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-2xl leading-none font-semibold tracking-tight tabular-nums">{value}</p>
          <p className="mt-1.5 text-sm text-muted-foreground">{label}</p>
          {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
        </div>
        {chart && <div className={cn("flex-none", tintTextClass[tint])}>{chart}</div>}
      </div>
    </>
  )
  const classes = cn("group @container flex flex-col rounded-2xl bg-card p-5 shadow-card", active && "bg-brand-soft ring-2 ring-brand", className)
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

/** Barras pequeñas (lo cobrado por mes): la última, la de ahora, llena; las demás, suaves. Sin ejes ni cifras. */
export function MiniBarras({ valores, etiquetas }: { valores: number[]; etiquetas?: string[] }) {
  const max = Math.max(...valores, 0) || 1
  return (
    <div className="flex h-10 items-end gap-1" role="img" aria-label={etiquetas?.map((e, i) => `${e}: ${valores[i]}`).join(", ")}>
      {valores.map((v, i) => (
        <span
          key={i}
          title={etiquetas?.[i]}
          className={cn("w-1.5 rounded-full bg-current", i === valores.length - 1 ? "opacity-100" : "opacity-30")}
          style={{ height: `${Math.max(8, (v / max) * 100)}%` }}
        />
      ))}
    </div>
  )
}

/** Un % en un anillo fino (lo que llega en 30 días de lo pendiente, lo entregado de lo pactado), con el % dentro. */
export function MiniAnillo({ pct, label }: { pct: number; label: string }) {
  const r = 16
  const largo = 2 * Math.PI * r
  const lleno = (Math.min(Math.max(pct, 0), 100) / 100) * largo
  return (
    <span className="relative grid size-11 place-items-center" role="img" aria-label={`${Math.round(pct)} % ${label}`} title={`${Math.round(pct)} % ${label}`}>
      <svg viewBox="0 0 40 40" className="absolute inset-0 -rotate-90" aria-hidden>
        <circle cx="20" cy="20" r={r} className="fill-none stroke-current opacity-15" strokeWidth={4} />
        <circle cx="20" cy="20" r={r} className="fill-none stroke-current" strokeWidth={4} strokeLinecap="round" strokeDasharray={`${lleno} ${largo}`} />
      </svg>
      <span className="text-[10px] font-semibold text-foreground tabular-nums">{Math.round(pct)}%</span>
    </span>
  )
}

/** Una barra partida en tramos (las propuestas abiertas por estado), del primero al último, cada uno más intenso. */
export function MiniTramos({ tramos }: { tramos: { label: string; valor: number }[] }) {
  const total = tramos.reduce((a, t) => a + t.valor, 0)
  const visibles = tramos.filter((t) => t.valor > 0)
  // El más avanzado que tiene algo: el que se nombra debajo.
  const ultimo = visibles.at(-1)
  if (!total || !ultimo) return null
  return (
    <div className="w-16 @[15rem]:w-24">
      <div className="flex h-2 gap-0.5 overflow-hidden rounded-full" role="img" aria-label={visibles.map((t) => `${t.valor} ${t.label}`).join(", ")}>
        {tramos.map((t, i) =>
          t.valor > 0 ? (
            <span key={t.label} title={`${t.valor} ${t.label}`} className="bg-current" style={{ width: `${(t.valor / total) * 100}%`, opacity: 0.35 + (0.65 * (i + 1)) / tramos.length }} />
          ) : null,
        )}
      </div>
      <p className="mt-1.5 hidden truncate text-right text-[11px] text-muted-foreground @[15rem]:block">
        {ultimo.valor} {ultimo.label}
      </p>
    </div>
  )
}
