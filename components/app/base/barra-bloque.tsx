"use client"

import * as React from "react"
import { cn } from "cn"

/**
 * El encabezado de un bloque de trabajo, el mismo en toda la app: 48 px con una raya debajo. A la izquierda, lo que dice
 * qué se ve (la vista, el recorrido de una lista); en el centro, lo que cambia lo que se ve (filtro, ordenar, buscar); a la
 * derecha, los botones de la página. Lo usan la base (`BarraBase`), las páginas con vista propia (`BarraFiltros`) y la
 * página de un registro (`FichaBarra`). Los botones nunca se aplastan: lo que cede es la izquierda. Sin centro, ocupan lo que queda y bajan de línea si no caben.
 */
export function BarraBloque({ inicio, centro, className, children, ...props }: Omit<React.ComponentProps<"div">, "children"> & { inicio?: React.ReactNode; centro?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div data-slot="barra-bloque" className={cn("@container/barra flex-none border-b bg-card", className)} {...props}>
      {centro ? (
        <div className="flex h-12 items-center gap-2 px-3 @3xl/barra:grid @3xl/barra:grid-cols-[minmax(0,1fr)_auto_minmax(max-content,1fr)]">
          <div className="flex max-w-[45%] min-w-0 flex-none items-center gap-1 @3xl/barra:max-w-none">{inicio}</div>
          <div className="flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto [scrollbar-width:none] @3xl/barra:justify-center">{centro}</div>
          <div className="flex min-w-0 flex-none items-center justify-end gap-1.5">{children}</div>
        </div>
      ) : (
        <div className="flex min-h-12 flex-wrap items-center gap-x-2 gap-y-1.5 px-3 py-[9px]">
          <div className="flex min-w-0 flex-none items-center gap-1">{inicio}</div>
          <div className="ml-auto flex min-w-0 flex-wrap items-center justify-end gap-1.5">{children}</div>
        </div>
      )}
    </div>
  )
}
