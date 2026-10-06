"use client"

import type * as React from "react"
import { CalendarClockIcon, CalendarIcon, CircleDotIcon, FlagIcon, HourglassIcon, ListChecksIcon, MapPinIcon, RepeatIcon, SparklesIcon, TagIcon, TypeIcon, CircleCheckIcon, CalendarPlusIcon } from "lucide-react"
import { cn } from "cn"
import { fmt } from "@/lib/format"
import { ESTADOS_TAREA, ORIGENES_TAREA, PRIORIDADES_TAREA, type EstadoTarea, type EtiquetaTarea, type PrioridadTarea, type Tarea } from "@/lib/influencer/modelo"
import { conEstado, describirRepeticion, estaCerrada, type ContextoTareas } from "@/lib/influencer/tareas"
import { diasEntre, soloFecha } from "@/lib/influencer/fechas"
import type { ColumnaTabla } from "@/components/app/grouped-table"
import { InlineField } from "@/components/app/inline-field"
import { CasillaTarea, DondeChip, EstadoTareaBadge, EtiquetasTarea, FechaTarea, PrioridadBandera, ProgresoSubtareas } from "@/components/influencer/task-cells"

/** Las celdas editables no abren la ficha: el clic se queda en ellas. */
function Celda({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("min-w-0", className)} onClick={(e) => e.stopPropagation()}>
      {children}
    </div>
  )
}

/**
 * Las columnas de la tabla de tareas, todas editables en su celda como en Notion (el título abre
 * la ficha). `menuDe` pone en cada cabecera sus opciones: ordenar, agrupar por ella y ocultar.
 * Cada columna dice con qué campo se ordena, se agrupa y se calcula su pie (`campo`).
 */
export function columnasTareas({
  hoy,
  ctx,
  etiquetas,
  todas,
  onGuardar,
  onToggle,
  onCrearEtiqueta,
  menuDe,
}: {
  hoy: string
  ctx: ContextoTareas
  etiquetas: EtiquetaTarea[]
  todas: Tarea[]
  onGuardar: (t: Tarea) => void
  onToggle: (t: Tarea) => void
  onCrearEtiqueta?: (nombre: string) => EtiquetaTarea
  menuDe?: (columnaId: string) => React.ReactNode
}): (ColumnaTabla<Tarea> & { campo?: string })[] {
  const ahora = () => `${hoy.slice(0, 10)}T${new Date().toTimeString().slice(0, 8)}`
  const hijas = (t: Tarea) => todas.filter((x) => x.padreId === t.id)
  const columnas: (ColumnaTabla<Tarea> & { campo?: string })[] = [
    {
      id: "titulo",
      header: "Título",
      icon: TypeIcon,
      campo: "titulo",
      width: 340,
      cell: (t) => (
        <span className="flex min-w-0 items-center gap-2" style={{ paddingLeft: t.padreId ? 20 : 0 }}>
          <CasillaTarea tarea={t} onToggle={() => onToggle(t)} />
          <span className={cn("min-w-0 truncate font-medium", estaCerrada(t) && "text-muted-foreground line-through")}>{t.titulo}</span>
          <ProgresoSubtareas hechas={hijas(t).filter(estaCerrada).length} total={hijas(t).length} />
        </span>
      ),
    },
    {
      id: "estado",
      header: "Estado",
      icon: CircleDotIcon,
      campo: "estado",
      width: 150,
      cell: (t) => (
        <Celda>
          <InlineField
            value={t.estado}
            tipo="select"
            required
            opciones={ESTADOS_TAREA.map((e) => ({ value: e.id, label: e.label, tone: e.tone }))}
            onSave={async (v) => onGuardar(conEstado(t, String(v) as EstadoTarea, ahora()))}
            render={() => <EstadoTareaBadge tarea={t} hoy={hoy} />}
          />
        </Celda>
      ),
    },
    { id: "donde", header: "Dónde vive", icon: MapPinIcon, campo: "proyecto", width: 220, cell: (t) => <DondeChip donde={t.donde} ctx={ctx} enlace /> },
    {
      id: "fecha",
      header: "Fecha",
      icon: CalendarIcon,
      campo: "fecha",
      width: 140,
      cell: (t) => (
        <Celda>
          <InlineField
            value={t.fecha ? soloFecha(t.fecha) : null}
            tipo="fecha"
            placeholder="Sin fecha"
            onSave={async (v) => onGuardar({ ...t, fecha: v ? `${String(v)}${t.fecha && t.fecha.length > 10 ? t.fecha.slice(10) : ""}` : undefined })}
            render={() => <FechaTarea tarea={t} hoy={hoy} campo="fecha" />}
          />
        </Celda>
      ),
    },
    {
      id: "fechaLimite",
      header: "Fecha límite",
      icon: CalendarClockIcon,
      campo: "fechaLimite",
      width: 140,
      cell: (t) => (
        <Celda>
          <InlineField value={t.fechaLimite ?? null} tipo="fecha" placeholder="—" onSave={async (v) => onGuardar({ ...t, fechaLimite: v ? String(v) : undefined })} render={() => <FechaTarea tarea={t} hoy={hoy} campo="fechaLimite" />} />
        </Celda>
      ),
    },
    {
      id: "prioridad",
      header: "Prioridad",
      icon: FlagIcon,
      campo: "prioridad",
      width: 130,
      cell: (t) => (
        <Celda>
          <InlineField
            value={t.prioridad}
            tipo="select"
            required
            opciones={PRIORIDADES_TAREA.map((p) => ({ value: p.id, label: p.label }))}
            onSave={async (v) => onGuardar({ ...t, prioridad: String(v) as PrioridadTarea })}
            render={() => <PrioridadBandera prioridad={t.prioridad} conTexto />}
          />
        </Celda>
      ),
    },
    {
      id: "etiquetas",
      header: "Etiquetas",
      icon: TagIcon,
      campo: "etiquetas",
      width: 190,
      cell: (t) => (
        <Celda>
          <InlineField
            value={t.etiquetas}
            tipo="multiselect"
            placeholder="—"
            opciones={etiquetas.map((e) => ({ value: e.id, label: e.nombre }))}
            onCreate={
              onCrearEtiqueta
                ? async (texto) => {
                    const e = onCrearEtiqueta(texto)
                    return { value: e.id, label: e.nombre }
                  }
                : undefined
            }
            onSave={async (v) => onGuardar({ ...t, etiquetas: Array.isArray(v) ? v : [] })}
            render={() => <EtiquetasTarea ids={t.etiquetas} etiquetas={etiquetas} max={2} />}
          />
        </Celda>
      ),
    },
    { id: "subtareas", header: "Subtareas", icon: ListChecksIcon, campo: "subtareas", width: 110, cell: (t) => <ProgresoSubtareas hechas={hijas(t).filter(estaCerrada).length} total={hijas(t).length} /> },
    { id: "repite", header: "Se repite", icon: RepeatIcon, campo: "repite", width: 160, cell: (t) => <span className="text-xs text-muted-foreground">{t.repetir ? describirRepeticion(t.repetir) : "—"}</span> },
    {
      id: "diasEsperando",
      header: "Días esperando",
      icon: HourglassIcon,
      campo: "diasEsperando",
      width: 130,
      align: "right",
      cell: (t) => <span className="text-xs tabular-nums text-muted-foreground">{t.estado === "esperando" && t.esperandoDesde ? diasEntre(t.esperandoDesde, hoy) : "—"}</span>,
    },
    { id: "origen", header: "Origen", icon: SparklesIcon, campo: "origen", width: 170, cell: (t) => <span className="text-xs text-muted-foreground">{ORIGENES_TAREA[t.origen]}</span> },
    { id: "creadaEl", header: "Creada", icon: CalendarPlusIcon, campo: "creadaEl", width: 110, cell: (t) => <span className="text-xs text-muted-foreground">{fmt.date(t.creadaEl)}</span> },
    { id: "hechaEl", header: "Hecha el", icon: CircleCheckIcon, campo: "hechaEl", width: 110, cell: (t) => <span className="text-xs text-muted-foreground">{t.hechaEl ? fmt.date(t.hechaEl) : "—"}</span> },
  ]
  return menuDe ? columnas.map((c) => ({ ...c, menu: menuDe(c.id) })) : columnas
}
