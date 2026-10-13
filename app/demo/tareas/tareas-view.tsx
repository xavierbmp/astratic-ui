"use client"

import * as React from "react"
import { toast } from "sonner"
import { AlarmClockIcon, CircleCheckIcon, ListTodoIcon, UserIcon } from "lucide-react"
import type { StatusTone } from "@/lib/status"
import { opcionesDeEstados, type DefCampo, type ValorCampo } from "@/lib/base/campos"
import { vistaNueva, type VistaBase } from "@/lib/base/vistas"
import { useBaseLocal, useEnNavegador } from "@/hooks/use-base-local"
import { Button } from "@/components/ui/button"
import { PageBody, PageHeader } from "@/components/app/page-header"
import { KpiCard, KpiRow } from "@/components/app/kpi"
import { WorkGrid } from "@/components/app/work-grid"
import { EmptyState } from "@/components/app/states"
import { InsightStat, InsightsPanel } from "@/components/app/insights-panel"
import { BaseDatos } from "@/components/app/base/base-datos"

export type TaskState = "pendiente" | "en-curso" | "hecha"
export type Task = { id: string; columnId: TaskState; title: string; record: string; owner: string; due: string; dueTone: StatusTone }

const ESTADOS: { id: TaskState; label: string; tone: StatusTone }[] = [
  { id: "pendiente", label: "Pendiente", tone: "neutral" },
  { id: "en-curso", label: "En curso", tone: "info" },
  { id: "hecha", label: "Hecha", tone: "success" },
]
const esEstado = (v: ValorCampo): v is TaskState => ESTADOS.some((e) => e.id === v)

function camposTareas(tasks: Task[]): DefCampo<Task>[] {
  const lista = (xs: string[]) => [...new Set(xs)].map((x) => ({ id: x, label: x }))
  return [
    { id: "title", nombre: "Tarea", tipo: "texto", principal: true, obligatorio: true, valor: (t) => t.title },
    { id: "hecha", nombre: "Hecha", tipo: "casilla", valor: (t) => t.columnId === "hecha" },
    { id: "estado", nombre: "Estado", tipo: "select", obligatorio: true, opciones: opcionesDeEstados(ESTADOS), valor: (t) => t.columnId },
    { id: "due", nombre: "Cuándo", tipo: "select", opciones: lista(tasks.map((t) => t.due)), valor: (t) => t.due },
    { id: "owner", nombre: "Responsable", tipo: "select", opciones: lista(tasks.map((t) => t.owner)), valor: (t) => t.owner },
    { id: "record", nombre: "Registro", tipo: "texto", valor: (t) => t.record },
  ]
}

const vistasTareas = (campos: DefCampo<Task>[]): VistaBase[] => [
  { ...vistaNueva("Por cuándo", campos, { id: "tareas-cuando" }), grupos: [{ campo: "due", ordenGrupos: "asc" }] },
  vistaNueva("Tablero", campos, { id: "tareas-tablero", tipo: "kanban", apilar: "estado" }),
]

/** Una tarea con un campo cambiado: «Hecha» y el estado mueven la misma columna. */
function escribir(t: Task, campo: DefCampo<Task>, valor: ValorCampo): Task {
  if (campo.id === "hecha") return { ...t, columnId: valor === true ? "hecha" : "pendiente" }
  if (campo.id === "estado") return esEstado(valor) ? { ...t, columnId: valor } : t
  if (typeof valor !== "string" || !valor.trim()) return t
  return campo.id === "title" ? { ...t, title: valor.trim() } : campo.id === "due" ? { ...t, due: valor } : campo.id === "owner" ? { ...t, owner: valor } : campo.id === "record" ? { ...t, record: valor.trim() } : t
}

export function TareasView({ initialTasks }: { initialTasks: Task[] }) {
  const [tasks, setTasks] = React.useState<Task[]>(initialTasks)
  const owners = React.useMemo(() => Array.from(new Set(tasks.map((t) => t.owner))).sort(), [tasks])
  const enNavegador = useEnNavegador()
  const camposBase = React.useMemo(() => camposTareas(initialTasks), [initialTasks])
  const base = useBaseLocal("demo-tareas", camposBase, vistasTareas)
  const pending = tasks.filter((t) => t.columnId !== "hecha")
  const done = tasks.filter((t) => t.columnId === "hecha")

  const complete = (ids: string[]) => {
    setTasks((ts) => ts.map((t) => (ids.includes(t.id) ? { ...t, columnId: "hecha" } : t)))
    toast.success(ids.length === 1 ? "Tarea completada" : `${ids.length} tareas completadas`)
  }
  const archive = (ids: string[]) => {
    const previous = tasks
    setTasks(previous.filter((t) => !ids.includes(t.id)))
    toast.success(ids.length === 1 ? "Tarea archivada" : `${ids.length} tareas archivadas`, { action: { label: "Deshacer", onClick: () => setTasks(previous) } })
  }

  return (
    <PageBody>
      <PageHeader title="Tareas" description="Lo que hay que hacer, por fecha y por responsable." />

      <KpiRow>
        <KpiCard icon={ListTodoIcon} label="Pendientes" value={pending.length} hint={`${done.length} hechas`} />
        <KpiCard icon={AlarmClockIcon} label="Para hoy" value={pending.filter((t) => t.due === "Hoy").length} alert={pending.filter((t) => t.due === "Hoy").length > 0 ? "vencen hoy" : undefined} />
        <KpiCard icon={CircleCheckIcon} label="Completadas esta semana" value={done.length} delta={{ value: 25, label: "vs semana pasada" }} />
      </KpiRow>

      <WorkGrid
        aside={
          <InsightsPanel
            storageKey="demo-tareas"
            title="Carga de trabajo"
            blocks={[
              {
                id: "por-persona",
                title: "Por responsable",
                icon: UserIcon,
                render: () => (
                  <div className="divide-y">
                    {owners.map((o) => (
                      <InsightStat key={o} label={o} value={tasks.filter((t) => t.owner === o && t.columnId !== "hecha").length} sub="pendientes" />
                    ))}
                  </div>
                ),
              },
              {
                id: "ritmo",
                title: "Ritmo",
                icon: CircleCheckIcon,
                render: () => (
                  <div className="divide-y">
                    <InsightStat label="Completadas hoy" value={2} />
                    <InsightStat label="Media diaria" value="3,4" />
                    <InsightStat label="Más antigua" value="6 días" />
                  </div>
                ),
              },
            ]}
          />
        }
      >
        <div className="h-[600px] xl:h-full">
          {enNavegador && (
            <BaseDatos
              clave="demo-tareas"
              lateralInicial={false}
              base={base}
              campos={camposBase}
              filas={tasks}
              getId={(t) => t.id}
              hoy="2026-10-06"
              objeto={{ singular: "tarea", plural: "tareas", nuevo: "Nueva tarea" }}
              onAbrir={(id) => toast(`Aquí se abriría la ficha de «${tasks.find((t) => t.id === id)?.title ?? ""}»`)}
              onEscribir={(cambios) => setTasks((ts) => ts.map((t) => cambios.filter((c) => c.fila.id === t.id).reduce((x, c) => escribir(x, c.campo, c.valor), t)))}
              onNuevo={() => toast("Aquí se abriría el alta de la tarea")}
              onBorrar={archive}
              accionesSeleccion={(ids) => (
                <Button variant="ghost" size="sm" onClick={() => complete(ids)}>
                  <CircleCheckIcon /> Completar
                </Button>
              )}
              vacio={(hayFiltro, limpiar) => <EmptyState title={hayFiltro ? "Ninguna tarea coincide" : "Sin tareas"} description={hayFiltro ? "Prueba con otra búsqueda o quita algún filtro." : "Crea la primera con «Nueva tarea»."} action={hayFiltro ? <Button variant="outline" size="sm" onClick={limpiar}>Quitar filtros</Button> : undefined} />}
            />
          )}
        </div>
      </WorkGrid>
    </PageBody>
  )
}
