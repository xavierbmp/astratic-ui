import Link from "next/link"
import { cn } from "cn"

/**
 * Las cifras clave de una subpágina, en la cabecera: a la derecha del título y antes de sus botones
 * (`PageHeader stats`). Sin tarjetas ni iconos: el número, su nombre y una línea de detalle, separadas por
 * una raya fina. Las grandes (`StatRow` + `StatTile`) quedan para el Inicio (Xavier, 2026-10-14).
 */
export function CifrasCabecera({ className, ...props }: React.ComponentProps<"div">) {
  return <div role="group" aria-label="Cifras clave" data-slot="ws-cifras-cabecera" className={cn("flex flex-wrap items-stretch gap-y-2 divide-x divide-border", className)} {...props} />
}

/**
 * Una cifra de la cabecera. Con `href` lleva a su página; con `onClick` filtra la lista de debajo y
 * `active` la marca como puesta (como `KpiCard` del madre).
 */
export function CifraCabecera({
  label,
  value,
  hint,
  href,
  onClick,
  active = false,
  className,
}: {
  label: string
  value: React.ReactNode
  hint?: string
  href?: string
  onClick?: () => void
  active?: boolean
  className?: string
}) {
  const cuerpo = (
    <>
      <span className={cn("block truncate text-xs", active ? "text-brand" : "text-muted-foreground")}>{label}</span>
      <span className="mt-0.5 block text-lg leading-tight font-semibold tracking-tight tabular-nums">{value}</span>
      {hint && (
        <span className="block max-w-44 truncate text-[11px] text-muted-foreground" title={hint}>
          {hint}
        </span>
      )}
    </>
  )
  const caja = cn("flex min-w-0 flex-col px-4 first:pl-0 last:pr-0", className)
  const pulsable = cn(
    // Lo pulsable sale un poco de su hueco para que el fondo al pasar no pegue el texto al borde.
    "-mx-2 -my-1 rounded-lg px-2 py-1 text-left outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50",
    active && "bg-brand-soft hover:bg-brand-soft",
  )
  if (href)
    return (
      <div className={caja}>
        <Link data-slot="ws-cifra-cabecera" href={href} className={pulsable}>
          {cuerpo}
        </Link>
      </div>
    )
  if (onClick)
    return (
      <div className={caja}>
        <button type="button" data-slot="ws-cifra-cabecera" aria-pressed={active} onClick={onClick} className={pulsable}>
          {cuerpo}
        </button>
      </div>
    )
  return (
    <div data-slot="ws-cifra-cabecera" className={caja}>
      {cuerpo}
    </div>
  )
}
