"use client"

import { LayoutGridIcon, XIcon } from "lucide-react"
import { cn } from "cn"
import { LISTA_TIPOS_TAREA, TIPOS_TAREA, type EtiquetaTarea, type Tarea, type TipoTarea } from "@/lib/influencer/modelo"
import { ICONO_DE_TIPO, estaCerrada, etiquetasEnUso, type FiltroRapidoTareas } from "@/lib/influencer/tareas"
import { tintClass } from "@/lib/influencer/tints"
import { ICONOS_TAREA_INFO } from "@/components/influencer/task-icono"

/** En el filtro, la de sin tipo se llama por lo que es: las generales. */
const NOMBRE_FILTRO: Record<TipoTarea, string> = { ...TIPOS_TAREA, "sin-tipo": "Generales" }

const claseOpcion = (activa: boolean) =>
  cn(
    "inline-flex h-8 flex-none items-center gap-1.5 rounded-full px-3 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50 [&_svg]:size-4",
    activa ? "bg-brand-soft text-brand" : "bg-card text-muted-foreground shadow-xs hover:bg-muted hover:text-foreground",
  )

/**
 * El filtro rápido de la página de Tareas (Xavier, 2026-10-16): una fila de iconos con la página de la
 * que son (Todas, Generales, CRM, Collabs, Contenido, Cobros), con cuántas abiertas tiene cada una, y
 * debajo sus etiquetas para recortar más. Recorta Hoy y la base a la vez.
 */
export function FiltrosRapidosTareas({
  tareas,
  etiquetas,
  value,
  onChange,
}: {
  /** Las principales (sin subtareas): de aquí salen los contadores y las etiquetas en uso. */
  tareas: Tarea[]
  etiquetas: EtiquetaTarea[]
  value: FiltroRapidoTareas
  onChange: (f: FiltroRapidoTareas) => void
}) {
  const abiertas = tareas.filter((t) => !estaCerrada(t))
  const cuantas = (tipo: TipoTarea) => abiertas.filter((t) => t.donde.tipo === tipo).length
  const tipos = LISTA_TIPOS_TAREA.filter((tipo) => tipo === value.tipo || cuantas(tipo) > 0)
  const enUso = etiquetasEnUso(tareas, value.tipo)
    .map((u) => ({ ...u, etiqueta: etiquetas.find((e) => e.id === u.id) }))
    .filter((u): u is typeof u & { etiqueta: EtiquetaTarea } => !!u.etiqueta)
  const alternarEtiqueta = (id: string) => onChange({ ...value, etiquetas: value.etiquetas.includes(id) ? value.etiquetas.filter((x) => x !== id) : [...value.etiquetas, id] })

  return (
    <div className="flex flex-col gap-2">
      <div role="toolbar" aria-label="Filtrar por página" className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-0.5">
        <button type="button" aria-pressed={value.tipo === "todas"} onClick={() => onChange({ tipo: "todas", etiquetas: [] })} className={claseOpcion(value.tipo === "todas")}>
          <LayoutGridIcon aria-hidden /> Todas <span className="tabular-nums opacity-70">{abiertas.length}</span>
        </button>
        {tipos.map((tipo) => {
          const { icono: Icono } = ICONOS_TAREA_INFO[ICONO_DE_TIPO[tipo]]
          const activa = value.tipo === tipo
          return (
            <button key={tipo} type="button" aria-pressed={activa} onClick={() => onChange({ tipo: activa ? "todas" : tipo, etiquetas: [] })} className={claseOpcion(activa)}>
              <Icono aria-hidden /> {NOMBRE_FILTRO[tipo]} <span className="tabular-nums opacity-70">{cuantas(tipo)}</span>
            </button>
          )
        })}
      </div>
      {enUso.length > 0 && (
        <div role="toolbar" aria-label="Filtrar por etiqueta" className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-xs text-muted-foreground">Etiquetas</span>
          {enUso.map(({ etiqueta, n }) => {
            const activa = value.etiquetas.includes(etiqueta.id)
            return (
              <button
                key={etiqueta.id}
                type="button"
                aria-pressed={activa}
                onClick={() => alternarEtiqueta(etiqueta.id)}
                className={cn(
                  "inline-flex h-6 items-center gap-1 rounded-full px-2 text-xs font-medium outline-none transition focus-visible:ring-2 focus-visible:ring-ring/50",
                  tintClass[etiqueta.tint],
                  activa ? "ring-2 ring-foreground/70" : "opacity-70 hover:opacity-100",
                )}
              >
                {etiqueta.nombre} <span className="tabular-nums opacity-70">{n}</span>
              </button>
            )
          })}
          {value.etiquetas.length > 0 && (
            <button type="button" onClick={() => onChange({ ...value, etiquetas: [] })} className="inline-flex h-6 items-center gap-1 rounded-full px-2 text-xs text-muted-foreground hover:text-foreground">
              <XIcon className="size-3" aria-hidden /> Quitar
            </button>
          )}
        </div>
      )}
    </div>
  )
}
