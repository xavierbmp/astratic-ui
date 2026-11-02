import * as React from "react"
import { cn } from "cn"

/** Un bloque de la ficha: superficie clara, radio 28 y sombra suave, sin borde. */
export function FichaBloque({ className, ...props }: React.ComponentProps<"section">) {
  return <section data-slot="ficha-bloque" className={cn("min-w-0 overflow-hidden rounded-ficha bg-ficha-superficie shadow-ficha", className)} {...props} />
}

/** El título de un bloque, con lo suyo a la derecha (un contador, un enlace, un segmentado). */
export function FichaBloqueTitulo({ titulo, extra, descripcion, compacto, className }: { titulo: React.ReactNode; extra?: React.ReactNode; descripcion?: React.ReactNode; /** Los bloques en columna llevan menos aire. */ compacto?: boolean; className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-baseline justify-between gap-x-3 gap-y-2", compacto ? "px-[22px] pt-[18px] pb-3" : "px-7 pt-[22px] pb-5", className)}>
      <div className="min-w-0">
        <div className="text-[17px] font-medium tracking-[-0.01em]">{titulo}</div>
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
