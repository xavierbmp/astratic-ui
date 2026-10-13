"use client"

import * as React from "react"
import { CheckIcon, ChevronDownIcon, PlusIcon } from "lucide-react"
import { cn } from "cn"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { CALCULOS, calculosDe, calcular, type Calculo } from "@/lib/vistas/core"
import { aFiltrable } from "@/lib/base/campos"
import { ALTO_PIE, ANCHO_ANADIR, ANCHO_IZQUIERDA, type Columna } from "@/components/app/base/rejilla/medidas"

/**
 * El pie de la rejilla, como en Airtable: el «+» para un registro nuevo, cuántos hay y el total de
 * cada columna, que se elige en su desplegable («Resumen» al pasar el ratón).
 */
export function Pie<T>({
  columnas,
  filas,
  calculos,
  objeto,
  onNuevo,
  onCalculo,
}: {
  columnas: Columna<T>[]
  filas: T[]
  calculos: Record<string, Calculo>
  objeto: { singular: string; plural: string }
  onNuevo?: () => void
  onCalculo: (id: string, calculo: Calculo | null) => void
}) {
  return (
    <div className="sticky bottom-0 z-20 flex border-t bg-card text-xs text-muted-foreground" style={{ height: ALTO_PIE }}>
      <div className="sticky left-0 z-10 flex flex-none items-center bg-card pl-1.5" style={{ width: ANCHO_IZQUIERDA }}>
        {onNuevo && (
          <button type="button" aria-label={`Nuevo ${objeto.singular}`} title={`Nuevo ${objeto.singular}`} className="flex size-7 items-center justify-center rounded-md text-foreground/80 hover:bg-muted" onClick={onNuevo}>
            <PlusIcon className="size-4" />
          </button>
        )}
      </div>
      {columnas.map((c) => (
        <div key={c.campo.id} className={cn("flex flex-none items-center justify-end bg-card", c.fija && "sticky z-10")} style={{ width: c.ancho, left: c.fija ? c.x : undefined }}>
          {c.campo.principal ? (
            <span className="mr-auto pl-2 tabular-nums">
              {filas.length.toLocaleString("es-ES")} {filas.length === 1 ? objeto.singular : objeto.plural}
            </span>
          ) : (
            <Resumen columna={c} filas={filas} calculo={calculos[c.campo.id]} onCalculo={(calc) => onCalculo(c.campo.id, calc)} />
          )}
        </div>
      ))}
      <div className="flex-none bg-card" style={{ width: ANCHO_ANADIR }} />
      <div className="flex-1 bg-card" />
    </div>
  )
}

function Resumen<T>({ columna, filas, calculo, onCalculo }: { columna: Columna<T>; filas: T[]; calculo: Calculo | undefined; onCalculo: (c: Calculo | null) => void }) {
  const filtrable = React.useMemo(() => aFiltrable(columna.campo), [columna.campo])
  const opciones = calculosDe(filtrable.tipo).filter((c) => c !== "contar")
  const resultado = calculo ? calcular(filas, filtrable, calculo) : null
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className="group/resumen flex h-full w-full items-center justify-end gap-1 px-2 hover:bg-muted/60">
          {resultado !== null ? (
            <>
              <span className="truncate">{CALCULOS[calculo ?? "contar"].label}</span>
              <span className="font-medium text-foreground tabular-nums">{resultado}</span>
            </>
          ) : (
            <span className="flex items-center gap-0.5 opacity-0 group-hover/resumen:opacity-100 aria-expanded:opacity-100">
              Resumen <ChevronDownIcon className="size-3" />
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onSelect={() => onCalculo(null)}>
          <span className="flex-1">Ninguno</span>
          {!calculo && <CheckIcon />}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {opciones.map((c) => (
          <DropdownMenuItem key={c} onSelect={() => onCalculo(c)}>
            <span className="flex-1">{CALCULOS[c].label}</span>
            {calculo === c && <CheckIcon />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
