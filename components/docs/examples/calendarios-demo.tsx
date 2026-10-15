"use client"

import * as React from "react"
import { DndContext, PointerSensor, useDraggable, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { FlagIcon } from "lucide-react"
import { cn } from "cn"
import { sumarDias } from "@/lib/filtros/fechas"
import { Agenda, MiniCalendario, type EventoCalendario } from "@/components/app/agenda"
import { AvisoDia, CalendarioPeriodo, PREFIJO_DIA } from "@/components/app/calendario-periodo"
import { Gantt, type FilaGantt } from "@/components/app/gantt"
import { Segmentado } from "@/components/app/segmentado"

/** La documentación pinta siempre el mismo día, para que servidor y navegador coincidan. */
const HOY = "2026-10-14"

const EVENTOS: EventoCalendario[] = [
  { id: "e1", fecha: "2026-10-06", titulo: "Entrega del diseño", detalle: "Entrega · Cliente A", color: "bg-info-soft text-info", hecho: true },
  { id: "e2", fecha: "2026-10-14", titulo: "Reunión de arranque", detalle: "Reunión · Cliente B", color: "bg-success-soft text-success" },
  { id: "e3", fecha: "2026-10-14", titulo: "Enviar propuesta", detalle: "Tarea", color: "bg-warning-soft text-warning" },
  { id: "e4", fecha: "2026-10-14", titulo: "Llamada de seguimiento", detalle: "Tarea" },
  { id: "e5", fecha: "2026-10-20", titulo: "Cobro de la primera factura", detalle: "Cobro · Cliente A", color: "bg-info-soft text-info" },
  { id: "e6", fecha: "2026-10-27", titulo: "Publicar la web", detalle: "Hito · Cliente B", color: "bg-success-soft text-success" },
]

export function AgendaDemo() {
  return <Agenda eventos={EVENTOS} hoy={HOY} onSelect={() => {}} className="w-full" />
}

export function MiniCalendarioDemo() {
  return <MiniCalendario eventos={EVENTOS.map((e) => ({ ...e, href: "#" }))} hoy={HOY} className="h-[360px] w-full max-w-sm" />
}

type Plan = { id: string; dia: string; titulo: string }

function Tarjeta({ plan, grande }: { plan: Plan; grande: boolean }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: plan.id })
  return (
    <button ref={setNodeRef} type="button" style={{ transform: CSS.Translate.toString(transform) }} {...attributes} {...listeners} className={cn("w-full cursor-grab truncate rounded-md bg-muted px-1.5 py-1 text-left font-medium", grande ? "text-xs" : "text-[11px]", isDragging && "relative z-20 shadow-pop")}>
      {plan.titulo}
    </button>
  )
}

/** El calendario para planificar: lo de cada día se arrastra a otro; el `DndContext` lo pone quien lo usa. */
export function CalendarioPeriodoDemo() {
  const [modo, setModo] = React.useState<"mes" | "semana">("mes")
  const [planes, setPlanes] = React.useState<Plan[]>([
    { id: "p1", dia: "2026-10-13", titulo: "Boletín de octubre" },
    { id: "p2", dia: "2026-10-15", titulo: "Artículo del blog" },
    { id: "p3", dia: "2026-10-22", titulo: "Vídeo del producto" },
  ])
  const sensores = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))
  const alSoltar = (e: DragEndEvent) => {
    const destino = String(e.over?.id ?? "")
    if (!destino.startsWith(PREFIJO_DIA)) return
    setPlanes((ps) => ps.map((p) => (p.id === e.active.id ? { ...p, dia: destino.slice(PREFIJO_DIA.length) } : p)))
  }
  return (
    <div className="flex w-full flex-col gap-3">
      <Segmentado valor={modo} onCambiar={setModo} label="Periodo" opciones={[{ id: "mes", label: "Mes" }, { id: "semana", label: "Semana" }]} className="self-end" />
      <DndContext id="docs-calendario-periodo" sensors={sensores} onDragEnd={alSoltar}>
        <CalendarioPeriodo
          entradasDe={(dia) => planes.filter((p) => p.dia === dia)}
          avisosDe={(dia) => (dia === "2026-10-12" ? <AvisoDia icono={FlagIcon} titulo="Festivo" /> : null)}
          pintar={(p, { grande }) => <Tarjeta plan={p} grande={grande} />}
          hoy={HOY}
          ancla={HOY}
          modo={modo}
          onNuevo={(dia) => setPlanes((ps) => [...ps, { id: `p${ps.length + 1}`, dia, titulo: "Nuevo plan" }])}
        />
      </DndContext>
    </div>
  )
}

const FILAS: FilaGantt[] = [
  { id: "g1", titulo: "Web corporativa", subtitulo: "Cliente A", tramos: [{ id: "diseno", label: "Diseño", desde: "2026-10-05", hasta: "2026-10-12", hecho: true, color: "bg-info-soft text-info" }, { id: "desarrollo", label: "Desarrollo", desde: "2026-10-12", hasta: "2026-10-23", hecho: false, color: "bg-warning-soft text-warning" }], hito: { fecha: "2026-10-27" } },
  { id: "g2", titulo: "Campaña de otoño", subtitulo: "Cliente B", tramos: [{ id: "diseno", label: "Diseño", desde: "2026-10-08", hasta: "2026-10-13", hecho: false, color: "bg-info-soft text-info" }, { id: "desarrollo", label: "Desarrollo", desde: "2026-10-13", hasta: "2026-10-17", hecho: false, color: "bg-warning-soft text-warning" }], hito: { fecha: "2026-10-19" } },
]

export function GanttDemo() {
  const [filas, setFilas] = React.useState(FILAS)
  const mover = (id: string, dias: number) =>
    setFilas((fs) => fs.map((f) => (f.id !== id ? f : { ...f, tramos: f.tramos.map((t) => ({ ...t, desde: sumarDias(t.desde, dias), hasta: sumarDias(t.hasta, dias) })), hito: { ...f.hito, fecha: sumarDias(f.hito.fecha, dias) } })))
  return (
    <Gantt
      filas={filas}
      hoy={HOY}
      onMover={mover}
      columna="Proyecto"
      nombreHito={{ pendiente: "Entrega", hecho: "Entregado" }}
      leyenda={[
        { label: "Diseño", color: "bg-info-soft" },
        { label: "Desarrollo", color: "bg-warning-soft" },
      ]}
      className="w-full"
    />
  )
}
