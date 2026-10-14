"use client"

import * as React from "react"
import { XIcon } from "lucide-react"
import { cn } from "cn"
import type { Condicion, TipoCondicion } from "@/lib/influencer/modelo"
import { SelectorBuscable } from "@/components/app/formulario/selector-buscable"

/**
 * Las condiciones pactadas (exclusividad, derechos de uso, publicidad pagada…): una ficha por
 * condición con sus días si los lleva, y un desplegable para añadir otra de su lista o crearla
 * escribiéndola (`onNuevoTipo` la guarda en su lista y la devuelve). Vale para la collab entera y
 * para una pieza.
 */
export function CondicionesEditor({ value, onChange, tipos, onNuevoTipo, tamano = "md", className }: { value: Condicion[]; onChange: (condiciones: Condicion[]) => void; tipos: TipoCondicion[]; onNuevoTipo?: (nombre: string) => TipoCondicion; tamano?: "md" | "sm"; className?: string }) {
  const libres = tipos.filter((t) => !value.some((c) => c.id === t.id))
  const anadir = (t: TipoCondicion) => onChange([...value, { id: t.id, nombre: t.nombre }])
  const conDias = (c: Condicion) => tipos.find((t) => t.id === c.id)?.conDias ?? c.dias !== undefined

  return (
    <div data-slot="ws-condiciones" className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {value.map((c) => (
        <span key={c.id} className={cn("inline-flex items-center gap-1.5 rounded-lg border bg-brand-soft pr-1 pl-2.5 text-[13px] text-foreground", tamano === "md" ? "h-10" : "h-8")}>
          <span className="font-medium">{c.nombre}</span>
          {conDias(c) && (
            <label className="flex items-center gap-1 text-muted-foreground">
              <input
                type="number"
                min={1}
                inputMode="numeric"
                value={c.dias ?? ""}
                placeholder="—"
                aria-label={`Días de ${c.nombre}`}
                onChange={(e) => {
                  const dias = e.target.value ? Math.max(1, Math.round(Number(e.target.value))) : undefined
                  onChange(value.map((x) => (x.id === c.id ? { ...x, dias } : x)))
                }}
                className="h-6 w-12 rounded-md border border-input bg-card px-1.5 text-right text-foreground tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              />
              días
            </label>
          )}
          <button type="button" aria-label={`Quitar ${c.nombre}`} onClick={() => onChange(value.filter((x) => x.id !== c.id))} className="grid size-6 place-items-center rounded-md text-muted-foreground hover:bg-card hover:text-foreground">
            <XIcon className="size-3.5" />
          </button>
        </span>
      ))}
      <SelectorBuscable
        tamano={tamano}
        aria-label="Añadir una condición"
        opciones={libres.map((t) => ({ value: t.id, label: t.nombre, detalle: t.conDias ? "Con días" : undefined }))}
        valor={undefined}
        placeholder={value.length ? "Añadir otra" : "Añadir condición"}
        vacio="Ya están todas: escribe para crear otra"
        onChange={(id) => {
          const t = libres.find((x) => x.id === id)
          if (t) anadir(t)
        }}
        onCrear={onNuevoTipo ? (nombre) => anadir(onNuevoTipo(nombre)) : undefined}
        className={tamano === "md" ? "w-48" : "w-40"}
      />
    </div>
  )
}
