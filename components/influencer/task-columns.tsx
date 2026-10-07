"use client"

import * as React from "react"
import { CalendarClockIcon, CalendarIcon, CircleDotIcon, FlagIcon, HourglassIcon, LayersIcon, ListChecksIcon, RepeatIcon, SparklesIcon, TagIcon, TypeIcon, CircleCheckIcon, CalendarPlusIcon, Columns3Icon } from "lucide-react"
import { cn } from "cn"
import { fmt } from "@/lib/format"
import { ESTADOS_TAREA, ORIGENES_TAREA, PRIORIDADES_TAREA, type CampoTarea, type EstadoTarea, type EtiquetaTarea, type PrioridadTarea, type Tarea } from "@/lib/influencer/modelo"
import { conEstado, describirRepeticion, estaCerrada, type ContextoTareas } from "@/lib/influencer/tareas"
import { diasEntre, soloFecha } from "@/lib/influencer/fechas"
import type { ColumnaTabla } from "@/components/app/grouped-table"
import { InlineField } from "@/components/app/inline-field"
import { CasillaTarea, DondeChip, EstadoTareaBadge, EtiquetasTarea, FechaTarea, PrioridadBandera, ProgresoSubtareas } from "@/components/influencer/task-cells"
import { BotonSubtareas, MiniSubtareas } from "@/components/influencer/task-subtareas"
import { CampoPropioInline } from "@/components/influencer/task-campos-propios"
import { idCampoPropio } from "@/lib/influencer/campos-tareas"

/** Las celdas editables no abren la ficha: el clic se queda en ellas. */
function Celda({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("min-w-0", className)} onClick={(e) => e.stopPropagation()}>
      {children}
    </div>
  )
}

/** El título en la tabla: la casilla, el nombre y, si tiene subtareas, la flechita que las enseña en pequeño debajo. */
function TituloTabla({ tarea, hijas, onToggle, onAbrir }: { tarea: Tarea; hijas: Tarea[]; onToggle: (t: Tarea) => void; onAbrir?: (t: Tarea) => void }) {
  const [abiertas, setAbiertas] = React.useState(false)
  return (
    <span className="grid min-w-0 gap-1" style={{ paddingLeft: tarea.padreId ? 20 : 0 }}>
      <span className="flex min-w-0 items-center gap-2">
        <CasillaTarea tarea={tarea} onToggle={() => onToggle(tarea)} />
        <span className={cn("min-w-0 truncate font-medium", estaCerrada(tarea) && "text-muted-foreground line-through")}>{tarea.titulo}</span>
        <BotonSubtareas hechas={hijas.filter(estaCerrada).length} total={hijas.length} abiertas={abiertas} onAlternar={() => setAbiertas((v) => !v)} />
      </span>
      {abiertas && <MiniSubtareas hijas={hijas} onToggle={onToggle} onAbrir={onAbrir} className="ml-5 whitespace-normal" />}
    </span>
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
  onAbrir,
  onCrearEtiqueta,
  campos = [],
  menuDe,
}: {
  hoy: string
  ctx: ContextoTareas
  etiquetas: EtiquetaTarea[]
  todas: Tarea[]
  onGuardar: (t: Tarea) => void
  onToggle: (t: Tarea) => void
  /** Abrir la ficha de una subtarea desde su línea pequeña. */
  onAbrir?: (t: Tarea) => void
  onCrearEtiqueta?: (nombre: string) => EtiquetaTarea
  /** Los campos que ha creado ella: una columna cada uno, al final. */
  campos?: CampoTarea[]
  menuDe?: (columnaId: string) => React.ReactNode
}): (ColumnaTabla<Tarea> & { campo?: string })[] {
  const ahora = () => `${hoy.slice(0, 10)}T${new Date().toTimeString().slice(0, 8)}`
  const hijas = (t: Tarea) => todas.filter((x) => x.padreId === t.id).sort((a, b) => a.orden - b.orden)
  const columnas: (ColumnaTabla<Tarea> & { campo?: string })[] = [
    {
      id: "titulo",
      header: "Título",
      icon: TypeIcon,
      campo: "titulo",
      width: 340,
      cell: (t) => <TituloTabla tarea={t} hijas={hijas(t)} onToggle={onToggle} onAbrir={onAbrir} />,
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
    {
      id: "donde",
      header: "Tipo",
      icon: LayersIcon,
      campo: "tipo",
      width: 220,
      cell: (t) => (t.donde.tipo === "sin-tipo" ? <span className="text-xs text-muted-foreground">Sin tipo</span> : <DondeChip donde={t.donde} ctx={ctx} enlace />),
    },
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
    ...campos.map((c) => ({
      id: idCampoPropio(c.id),
      header: c.nombre,
      icon: Columns3Icon,
      campo: idCampoPropio(c.id),
      width: 160,
      cell: (t: Tarea) => (
        <Celda>
          <CampoPropioInline campo={c} tarea={t} onGuardar={onGuardar} />
        </Celda>
      ),
    })),
  ]
  return menuDe ? columnas.map((c) => ({ ...c, menu: menuDe(c.id) })) : columnas
}
