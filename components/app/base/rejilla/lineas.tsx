"use client"

import * as React from "react"
import { ChevronRightIcon } from "lucide-react"
import { cn } from "cn"
import { Checkbox } from "@/components/ui/checkbox"
import { opcionDe, type ColorOpcion, type DefCampo } from "@/lib/base/campos"
import type { NodoGrupo } from "@/lib/base/vistas"
import { CLASE_FONDO, CLASE_FUERTE, FichaOpcion, FichaVinculo } from "@/components/app/base/apariencia"
import { ANCHO_IZQUIERDA, type Columna } from "@/components/app/base/rejilla/medidas"

/** El fondo de las celdas: opaco siempre, para que las columnas fijas tapen lo que pasa por debajo. */
export const FONDO = {
  normal: "bg-card",
  marcada: "bg-[color-mix(in_oklch,var(--card),var(--brand)_7%)]",
} as const

/** La raya entre filas, sin rayas entre columnas. Al pasar el ratón la fila se levanta y su raya se quita. */
export const RAYA_FILA = "border-b border-border/70 group-hover/fila:border-transparent"

/** El velo de una regla de color: entero en la celda que pinta, más suave en la fila entera. */
export function VeloColor({ color, fila }: { color: ColorOpcion; fila?: boolean }) {
  return <span aria-hidden className={cn("pointer-events-none absolute inset-0", CLASE_FONDO[color], fila && "opacity-60")} />
}

/**
 * La columna de la izquierda de un registro: su casilla, siempre a la vista, y la marca de su color. Con `fondo`, la
 * fila va pintada. El registro se abre desde la celda de inicio.
 */
export function CeldaIzquierda({ indice, numero, color, fondo, alta, marcada, abierta, onMarcar }: { indice: number; numero: number; color?: ColorOpcion; fondo?: ColorOpcion; alta: boolean; marcada: boolean; abierta: boolean; onMarcar: (m: boolean) => void }) {
  return (
    <div data-fila={indice} className={cn("sticky left-0 z-[6] flex flex-none justify-center group-hover/fila:rounded-l-[10px]", RAYA_FILA, alta ? "items-start pt-3" : "items-center", marcada || abierta ? FONDO.marcada : FONDO.normal)} style={{ width: ANCHO_IZQUIERDA }}>
      {fondo && !marcada && !abierta && <VeloColor color={fondo} fila />}
      {(color || marcada || abierta) && <span className={cn("absolute inset-y-2 left-0.5 w-[3px] rounded-full", color ? CLASE_FUERTE[color] : "bg-brand")} aria-hidden />}
      <Checkbox className="relative" checked={marcada} onCheckedChange={(c) => onMarcar(c === true)} aria-label={`Marcar la fila ${numero}`} />
    </div>
  )
}

/**
 * La cabecera de un grupo, como en Airtable: la flecha para plegarlo, el nombre del campo en
 * pequeño, su valor (con su color si es una opción) y cuántos registros tiene, en una sola línea fina
 * (Xavier, 2026-10-16: «no tan gruesas»). Los subgrupos van sangrados y en un gris más claro.
 */
export function LineaGrupo<T>({ nodo, campo, alto, anchoFijas, total, plegado, onPlegar }: { nodo: NodoGrupo<T>; campo: DefCampo<T> | undefined; alto: number; anchoFijas: number; total: number; plegado: boolean; onPlegar: () => void }) {
  const opcion = campo && (campo.tipo === "select" || campo.tipo === "multiselect" || campo.tipo === "vinculo") ? opcionDe(campo, nodo.id) : undefined
  const fondo = nodo.nivel === 0 ? "bg-[color-mix(in_oklch,var(--muted),var(--card)_40%)]" : "bg-[color-mix(in_oklch,var(--muted),var(--card)_70%)]"
  return (
    <div className={cn("flex min-w-full border-b border-border/70 text-[13px]", fondo)} style={{ height: alto, width: total }}>
      <div className={cn("sticky left-0 z-[6] flex flex-none items-center gap-2 pr-2", fondo)} style={{ width: anchoFijas, paddingLeft: 8 + nodo.nivel * 20 }}>
        <button type="button" aria-expanded={!plegado} aria-label={plegado ? "Desplegar el grupo" : "Plegar el grupo"} onClick={onPlegar} className="flex size-6 flex-none items-center justify-center rounded-md text-muted-foreground hover:bg-background/70">
          <ChevronRightIcon className={cn("size-4 transition-transform", !plegado && "rotate-90")} />
        </button>
        <span className="flex min-w-0 items-center gap-2">
          <span className="flex-none text-[10px] font-medium tracking-wide text-muted-foreground uppercase">{campo?.nombre}</span>
          {opcion && campo?.tipo === "vinculo" ? (
            <FichaVinculo label={opcion.label} className="min-w-0" />
          ) : opcion ? (
            <FichaOpcion label={opcion.label} color={opcion.color} tono={opcion.tono} className="min-w-0" />
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

