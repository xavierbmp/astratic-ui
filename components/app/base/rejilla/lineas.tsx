"use client"

import * as React from "react"
import { ChevronRightIcon, PanelRightOpenIcon } from "lucide-react"
import { cn } from "cn"
import { Checkbox } from "@/components/ui/checkbox"
import { opcionDe, type ColorOpcion, type DefCampo } from "@/lib/base/campos"
import type { NodoGrupo } from "@/lib/base/vistas"
import { CLASE_FUERTE, FichaOpcion, FichaVinculo } from "@/components/app/base/apariencia"
import { ANCHO_IZQUIERDA, type Columna } from "@/components/app/base/rejilla/medidas"

/** El fondo de las celdas: opaco siempre, para que las columnas fijas tapen lo que pasa por debajo. */
export const FONDO = {
  normal: "bg-card group-hover/fila:bg-[color-mix(in_oklch,var(--card),var(--foreground)_3%)]",
  marcada: "bg-[color-mix(in_oklch,var(--card),var(--brand)_9%)]",
} as const

/**
 * La columna de la izquierda de un registro: el número de fila (y la marca de su color); al pasar
 * el ratón o marcada, la casilla y el botón que abre su ficha.
 */
export function CeldaIzquierda({ indice, numero, color, alta, marcada, abierta, onMarcar, onExpandir }: { indice: number; numero: number; color?: ColorOpcion; alta: boolean; marcada: boolean; abierta: boolean; onMarcar: (m: boolean) => void; onExpandir: () => void }) {
  return (
    <div data-fila={indice} className={cn("sticky left-0 z-[6] flex flex-none gap-1 border-r border-b pr-1 pl-2 text-xs text-muted-foreground", alta ? "items-start pt-1.5" : "items-center", marcada || abierta ? FONDO.marcada : FONDO.normal)} style={{ width: ANCHO_IZQUIERDA }}>
      {color && <span className={cn("absolute inset-y-1 left-0.5 w-1 rounded-full", CLASE_FUERTE[color])} aria-hidden />}
      <span className="flex w-7 flex-none items-center">
        <span className={cn("tabular-nums group-hover/fila:hidden", marcada && "hidden")}>{numero}</span>
        <Checkbox className={cn("hidden group-hover/fila:flex", marcada && "flex")} checked={marcada} onCheckedChange={(c) => onMarcar(c === true)} aria-label={`Marcar la fila ${numero}`} />
      </span>
      <button type="button" aria-label="Abrir la ficha" title="Abrir la ficha (Mayús + Espacio)" onClick={onExpandir} className={cn("ml-auto flex size-6 items-center justify-center rounded-md text-muted-foreground opacity-0 group-hover/fila:opacity-100 hover:bg-muted hover:text-foreground", abierta && "text-brand opacity-100")}>
        <PanelRightOpenIcon className="size-3.5" />
      </button>
    </div>
  )
}

/**
 * La cabecera de un grupo, como en Airtable: la flecha para plegarlo, el nombre del campo en
 * pequeño, su valor (con su color si es una opción) y cuántos registros tiene. Los subgrupos van
 * sangrados y en un gris más claro.
 */
export function LineaGrupo<T>({ nodo, campo, alto, anchoFijas, total, plegado, onPlegar }: { nodo: NodoGrupo<T>; campo: DefCampo<T> | undefined; alto: number; anchoFijas: number; total: number; plegado: boolean; onPlegar: () => void }) {
  const opcion = campo && (campo.tipo === "select" || campo.tipo === "multiselect" || campo.tipo === "vinculo") ? opcionDe(campo, nodo.id) : undefined
  const fondo = nodo.nivel === 0 ? "bg-muted" : "bg-[color-mix(in_oklch,var(--muted),var(--card)_45%)]"
  return (
    <div className={cn("flex border-b text-[13px]", fondo)} style={{ height: alto, width: total }}>
      <div className={cn("sticky left-0 z-[6] flex flex-none items-center gap-2 pr-2", fondo)} style={{ width: anchoFijas, paddingLeft: 8 + nodo.nivel * 20 }}>
        <button type="button" aria-expanded={!plegado} aria-label={plegado ? "Desplegar el grupo" : "Plegar el grupo"} onClick={onPlegar} className="flex size-6 flex-none items-center justify-center rounded-md text-muted-foreground hover:bg-background/70">
          <ChevronRightIcon className={cn("size-4 transition-transform", !plegado && "rotate-90")} />
        </button>
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-[10px] font-medium tracking-wide text-muted-foreground uppercase">{campo?.nombre}</span>
          {opcion && campo?.tipo === "vinculo" ? (
            <FichaVinculo label={opcion.label} className="self-start" />
          ) : opcion ? (
            <FichaOpcion label={opcion.label} color={opcion.color} className="self-start" />
          ) : (
            <span className="truncate font-semibold">{nodo.label || (campo?.vinculo ? `Sin ${campo.vinculo.objeto}` : "(Vacío)")}</span>
          )}
        </span>
        <span className="ml-auto flex-none text-xs text-muted-foreground tabular-nums">{nodo.filas.length.toLocaleString("es-ES")}</span>
      </div>
    </div>
  )
}

/** El ancho de la parte izquierda que se queda quieta: la columna de la izquierda y las fijas. */
export function anchoDeFijas<T>(columnas: Columna<T>[], congelar: number): number {
  const ultima = columnas[Math.min(congelar, columnas.length) - 1]
  return ultima ? ultima.x + ultima.ancho : ANCHO_IZQUIERDA
}

