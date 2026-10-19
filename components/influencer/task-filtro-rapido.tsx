"use client"

import { LayoutGridIcon } from "lucide-react"
import { cn } from "cn"
import { LISTA_TIPOS_TAREA, TIPOS_TAREA, type Tarea, type TipoTarea } from "@/lib/influencer/modelo"
import { ICONO_DE_TIPO, estaCerrada, type FiltroRapidoTareas } from "@/lib/influencer/tareas"
import { ICONOS_TAREA_INFO } from "@/components/influencer/task-icono"

/** En el filtro, la de sin tipo se llama por lo que es: las generales. */
const NOMBRE_FILTRO: Record<TipoTarea, string> = { ...TIPOS_TAREA, "sin-tipo": "Generales" }

/** Icono y texto, sin cápsula: la elegida en negro con su raya debajo y las demás en gris. */
const claseOpcion = (activa: boolean) =>
  cn(
    "relative inline-flex h-8 flex-none items-center gap-1.5 rounded-md px-1 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50 [&_svg]:size-4",
    "after:absolute after:inset-x-1 after:-bottom-px after:h-0.5 after:rounded-full after:transition-colors",
    activa ? "font-medium text-foreground after:bg-foreground [&_svg]:text-brand" : "text-muted-foreground after:bg-transparent hover:text-foreground",
  )

/**
 * El filtro rápido de la página de Tareas: una fila con la página de la que son (Todas, Generales, CRM,
 * Collabs, Contenido, Cobros), cada una con su icono y cuántas abiertas tiene. Recorta Hoy y la base a la
 * vez. Sutil, solo iconos y letras (Xavier, 2026-10-19, reporte cmvcm86w; antes en cápsulas y con una
 * fila de etiquetas debajo, que se quitó).
 */
export function FiltrosRapidosTareas({
  tareas,
  value,
  onChange,
}: {
  /** Las principales (sin subtareas): de aquí salen los contadores. */
  tareas: Tarea[]
  value: FiltroRapidoTareas
  onChange: (f: FiltroRapidoTareas) => void
}) {
  const abiertas = tareas.filter((t) => !estaCerrada(t))
  const cuantas = (tipo: TipoTarea) => abiertas.filter((t) => t.donde.tipo === tipo).length
  const tipos = LISTA_TIPOS_TAREA.filter((tipo) => tipo === value.tipo || cuantas(tipo) > 0)

  return (
    <div role="toolbar" aria-label="Filtrar por página" className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-0.5">
      <button type="button" aria-pressed={value.tipo === "todas"} onClick={() => onChange({ tipo: "todas" })} className={claseOpcion(value.tipo === "todas")}>
        <LayoutGridIcon aria-hidden /> Todas <span className="text-xs tabular-nums text-muted-foreground">{abiertas.length}</span>
      </button>
      {tipos.map((tipo) => {
        const { icono: Icono } = ICONOS_TAREA_INFO[ICONO_DE_TIPO[tipo]]
        const activa = value.tipo === tipo
        return (
          <button key={tipo} type="button" aria-pressed={activa} onClick={() => onChange({ tipo: activa ? "todas" : tipo })} className={claseOpcion(activa)}>
            <Icono aria-hidden /> {NOMBRE_FILTRO[tipo]} <span className="text-xs tabular-nums text-muted-foreground">{cuantas(tipo)}</span>
          </button>
        )
      })}
    </div>
  )
}
