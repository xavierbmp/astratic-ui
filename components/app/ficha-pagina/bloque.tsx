import * as React from "react"
import Link from "next/link"
import { cn } from "cn"

/** Un bloque de la ficha: superficie clara, radio 28 y sombra suave, sin borde. */
export function FichaBloque({ className, ...props }: React.ComponentProps<"section">) {
  return <section data-slot="ficha-bloque" className={cn("min-w-0 overflow-hidden rounded-ficha bg-ficha-superficie shadow-ficha", className)} {...props} />
}

/** El título de un bloque, con su contador en gris y lo suyo a la derecha (un enlace, un botón, un segmentado). */
export function FichaBloqueTitulo({ titulo, contador, extra, descripcion, compacto, className }: { titulo: React.ReactNode; contador?: React.ReactNode; extra?: React.ReactNode; descripcion?: React.ReactNode; /** Los bloques en columna llevan menos aire. */ compacto?: boolean; className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-baseline justify-between gap-x-3 gap-y-2", compacto ? "px-[22px] pt-[18px] pb-3" : "px-7 pt-[22px] pb-5", className)}>
      <div className="min-w-0">
        <div className="text-[17px] font-medium tracking-[-0.01em]">
          {titulo}
          {contador !== undefined && <span className="ml-1.5 font-normal text-ficha-tinta-3 tabular-nums">{contador}</span>}
        </div>
        {descripcion && <div className="mt-[3px] text-[12.5px] text-ficha-tinta-2">{descripcion}</div>}
      </div>
      {extra}
    </div>
  )
}

/** Tres bloques en columnas que se apilan solos al estrecharse. */
export function FichaColumnasBloques({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex flex-wrap items-stretch gap-4", className)} {...props} />
}

/**
 * Una fila de celdas separadas por rayas finas. La raya izquierda de la primera se esconde con el margen negativo y el
 * `overflow-hidden` del bloque. Cada celda dice su ancho de partida con `base` y las filas se recolocan solas.
 */
export function FichaCeldas({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="ficha-celdas" className={cn("-ml-px flex flex-wrap", className)} {...props} />
}

export function FichaCelda({ base = 240, crece = 1, className, style, ...props }: React.ComponentProps<"div"> & { base?: number; crece?: number }) {
  return <div className={cn("box-border min-w-0 border-t border-l border-ficha-raya px-[26px] pt-5 pb-[22px]", className)} style={{ flex: `${crece} 1 ${base}px`, ...style }} {...props} />
}

/** La etiqueta gris de un dato. */
export function FichaEtiqueta({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("text-sm text-ficha-tinta-2", className)} {...props} />
}

/** Un dato de una celda: su etiqueta y su valor, editable en el sitio si es un `InlineField`. */
export function FichaDato({ etiqueta, extra, children, className }: { etiqueta: React.ReactNode; extra?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("min-w-0", className)}>
      <div className="flex items-center justify-between gap-2 text-[13px] text-ficha-tinta-2">
        <span className="min-w-0 truncate">{etiqueta}</span>
        {extra}
      </div>
      <div className="mt-[5px] text-[14.5px] leading-normal text-pretty">{children}</div>
    </div>
  )
}

/** Una fila «etiqueta · valor» de un bloque estrecho (el contacto): 92 px para la etiqueta y raya arriba. */
export function FichaFila({ etiqueta, className, children }: { etiqueta: React.ReactNode; className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("grid grid-cols-[92px_minmax(0,1fr)] items-center gap-3.5 border-t border-ficha-raya px-[22px] py-[9px]", className)}>
      <div className="text-[13px] text-ficha-tinta-2">{etiqueta}</div>
      <div className="min-w-0 text-sm">{children}</div>
    </div>
  )
}

/** Una línea de una lista dentro de una celda: raya suave arriba. */
export function FichaLinea({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("border-t border-ficha-raya-suave py-2.5 text-[14.5px]", className)} {...props} />
}

/** La cifra grande de una celda («12», «Moderada»). */
export function FichaCifra({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("mt-1.5 text-[28px] font-medium tracking-[-0.02em] tabular-nums", className)} {...props} />
}

/** La línea pequeña bajo una cifra. */
export function FichaNotaCifra({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("text-[13.5px] text-ficha-tinta-2", className)} {...props} />
}

/**
 * Una fila de una lista dentro de un bloque: su foto o su icono, su nombre con una línea debajo, sus pastillas y lo suyo a
 * la derecha. Con `href` abre esa dirección y con `onClick` hace eso: la fila entera se pulsa, así que no lleva botones
 * en `fin`. Sin ninguno de los dos, los botones de `fin` y un enlace en `titulo` se pulsan por separado.
 */
export function FichaRenglon({
  inicio,
  titulo,
  detalle,
  pastillas,
  fin,
  href,
  externo,
  onClick,
  activo,
  apagado,
  className,
}: {
  inicio?: React.ReactNode
  titulo: React.ReactNode
  /** Una línea, que se corta si no cabe. */
  detalle?: React.ReactNode
  pastillas?: React.ReactNode
  fin?: React.ReactNode
  href?: string
  /** El enlace abre en otra pestaña. */
  externo?: boolean
  onClick?: () => void
  /** El que está abierto. */
  activo?: boolean
  /** Lo que ya no cuenta: una descartada. */
  apagado?: boolean
  className?: string
}) {
  const pulsable = Boolean(href || onClick)
  const clase = cn(
    "box-border flex w-full flex-wrap items-center gap-x-3 gap-y-2 border-t border-ficha-raya px-[22px] py-2.5 text-left text-ficha-tinta",
    pulsable && "cursor-pointer outline-none hover:bg-ficha-campo focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset",
    activo && "bg-brand-soft hover:bg-brand-soft",
    apagado && "opacity-60",
    className,
  )
  const contenido = (
    <>
      {inicio && <span className="flex flex-none items-center gap-2.5 text-ficha-tinta-3">{inicio}</span>}
      <span className="min-w-[160px] flex-[1_1_0]">
        <span className="block truncate text-[14.5px] font-medium">{titulo}</span>
        {detalle && <span className="mt-px block truncate text-[13px] text-ficha-tinta-2">{detalle}</span>}
        {pastillas && <span className="mt-1.5 flex flex-wrap items-center gap-1.5">{pastillas}</span>}
      </span>
      {fin && <span className="flex flex-none flex-wrap items-center justify-end gap-1.5">{fin}</span>}
    </>
  )
  if (href && externo)
    return (
      <a href={href} target="_blank" rel="noreferrer" className={clase}>
        {contenido}
      </a>
    )
  if (href)
    return (
      <Link href={href} className={clase}>
        {contenido}
      </Link>
    )
  if (onClick)
    return (
      <button type="button" onClick={onClick} aria-current={activo || undefined} className={clase}>
        {contenido}
      </button>
    )
  return <div className={clase}>{contenido}</div>
}
