"use client"

import * as React from "react"
import { cn } from "cn"
import type { DefCampo } from "@/lib/base/campos"
import { ValorCelda } from "@/components/app/base/rejilla/valor-celda"

/** Cuántos campos, además del principal, enseña cada tarjeta. */
const CAMPOS_EN_TARJETA = 3

/**
 * La base en el móvil: una tarjeta por registro con el campo principal y los primeros campos de la
 * vista (con su nombre), en el mismo orden y con los mismos filtros. Al tocarla se abre la ficha.
 */
export function ListaMovil<T>({
  registros,
  columnas,
  getId,
  celdas,
  abiertoId,
  onAbrir,
  vacio,
}: {
  registros: T[]
  columnas: { campo: DefCampo<T> }[]
  getId: (fila: T) => string
  celdas?: Partial<Record<string, (fila: T) => React.ReactNode>>
  abiertoId?: string | null
  onAbrir: (id: string) => void
  vacio?: React.ReactNode
}) {
  const principal = columnas.find((c) => c.campo.principal)?.campo
  const resto = columnas.filter((c) => !c.campo.principal).slice(0, CAMPOS_EN_TARJETA)
  if (registros.length === 0) return <div className="flex flex-1 justify-center p-6">{vacio}</div>
  return (
    <ul className="min-h-0 flex-1 divide-y overflow-y-auto">
      {registros.map((fila) => {
        const id = getId(fila)
        return (
          <li key={id}>
            <button type="button" onClick={() => onAbrir(id)} className={cn("flex w-full flex-col gap-1 px-4 py-3 text-left hover:bg-muted/60", abiertoId === id && "bg-brand-soft")}>
              {principal && <span className="truncate text-sm font-medium">{celdas?.[principal.id]?.(fila) ?? String(principal.valor(fila) ?? "")}</span>}
              {resto.map(({ campo }) => (
                <span key={campo.id} className="flex min-w-0 items-center gap-2 text-xs">
                  <span className="w-24 flex-none truncate text-muted-foreground">{campo.nombre}</span>
                  <span className="flex min-w-0 flex-1">{celdas?.[campo.id]?.(fila) ?? <ValorCelda campo={campo} valor={campo.valor(fila)} altura="corta" editable={false} onCambiar={() => undefined} />}</span>
                </span>
              ))}
            </button>
          </li>
        )
      })}
    </ul>
  )
}
