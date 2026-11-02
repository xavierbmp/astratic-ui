"use client"

import { cn } from "cn"
import { useBloqueDeTrabajo, usePantallaCompleta } from "@/components/app/pantalla-completa"

/**
 * El bloque de trabajo de una página de operación: las cifras, si las hay, y debajo el bloque, que se lleva todo el sitio.
 * Una página trabaja con un solo bloque y a todo el ancho: no hay paneles de información al lado.
 *
 * Mientras está montado, la página tiene «Pantalla completa» en la cabecera del shell (`pantalla-completa.tsx`).
 */
export function WorkGrid({
  stats,
  toolbar,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  /** Fila de cifras (`KpiRow`), encima del bloque. */
  stats?: React.ReactNode
  /** Toolbar del bloque de operación y, debajo, los chips de filtros activos. */
  toolbar?: React.ReactNode
}) {
  // Con un bloque de trabajo, la página puede ponerse en pantalla completa (el botón sale en la cabecera del shell).
  useBloqueDeTrabajo()
  // En pantalla completa, sin cifras: el bloque se lleva el sitio (reporte cmvlkbo0).
  const completa = usePantallaCompleta()
  const cifras = completa ? undefined : stats
  return (
    <div data-slot="work-grid" className={cn("flex min-h-0 flex-1 flex-col gap-4", className)} {...props}>
      {cifras && (
        <div data-slot="work-grid-stats" className="min-w-0">
          {cifras}
        </div>
      )}
      {toolbar && (
        <div data-slot="work-grid-toolbar" className="flex min-w-0 flex-col gap-2">
          {toolbar}
        </div>
      )}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">{children}</div>
    </div>
  )
}
