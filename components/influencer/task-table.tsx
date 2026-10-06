"use client"

import * as React from "react"
import { CalendarIcon, CircleCheckIcon, PlusIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"
import { cn } from "cn"
import type { DondeTarea, EtiquetaTarea, Tarea } from "@/lib/influencer/modelo"
import { CUANDO_TAREA, cuandoDe, idNuevo, nuevaTarea, ordenarTareas, type ContextoTareas } from "@/lib/influencer/tareas"
import { sumarDias } from "@/lib/influencer/fechas"
import type { GrupoFilas } from "@/lib/vistas/core"
import { Button } from "@/components/ui/button"
import { BulkBar } from "@/components/app/bulk-bar"
import { EmptyState } from "@/components/app/states"
import { TaskDialog } from "@/components/influencer/task-dialog"
import { TareasLista, type AccionesTarea } from "@/components/influencer/task-list"

/** Lo que hace la lista con las tareas: lo pone quien la usa (en la app, el proveedor de tareas). */
export type AccionesLista = AccionesTarea & {
  onCrear: (t: Tarea, subtareas: string[]) => void
  onGuardarVarias: (ts: Tarea[]) => void
  onBorrarVarias: (ids: string[]) => void
  onCrearEtiqueta?: (nombre: string) => EtiquetaTarea
}

/**
 * Las tareas de un sitio (una campaña o una de sus pestañas, una pieza, una propuesta, una marca),
 * en la lista de operar: agrupadas por cuándo tocan, con alta rápida que ya nace en su sitio y la
 * barra de acciones al seleccionar. Es una vista de la misma base que la página de Tareas: lo que
 * se cambia aquí se ve allí.
 */
export function TaskTable({
  tareas,
  todas,
  hoy,
  ctx,
  etiquetas,
  donde,
  acciones,
  activaId,
  className,
}: {
  /** Las de este sitio, sin sus subtareas. */
  tareas: Tarea[]
  /** Todas, para encontrar las subtareas. */
  todas: Tarea[]
  hoy: string
  ctx: ContextoTareas
  etiquetas: EtiquetaTarea[]
  /** Dónde nacen las que se crean aquí. */
  donde: DondeTarea
  acciones: AccionesLista
  activaId?: string | null
  className?: string
}) {
  const [seleccion, setSeleccion] = React.useState<Set<string>>(new Set())
  const [plegados, setPlegados] = React.useState<Set<string>>(new Set(["hechas"]))
  const [dialogo, setDialogo] = React.useState(false)
  const principales = tareas.filter((t) => !t.padreId)
  const hijas = React.useMemo(() => {
    const m = new Map<string, Tarea[]>()
    for (const t of todas) if (t.padreId) m.set(t.padreId, [...(m.get(t.padreId) ?? []), t])
    return m
  }, [todas])

  const grupos: GrupoFilas<Tarea>[] = CUANDO_TAREA.map((c) => ({ id: c.id, label: c.label, filas: ordenarTareas(principales.filter((t) => cuandoDe(t, hoy) === c.id)) })).filter((g) => g.filas.length > 0)
  const seleccionadas = () => tareas.filter((t) => seleccion.has(t.id))
  const ahora = () => `${hoy.slice(0, 10)}T${new Date().toTimeString().slice(0, 8)}`

  const crearRapida = (titulo: string) => acciones.onCrear(nuevaTarea({ titulo, donde }, idNuevo("t"), ahora()), [])

  return (
    <div className={cn("flex flex-col", className)}>
      {grupos.length === 0 ? (
        <EmptyState icon={CircleCheckIcon} title="Nada pendiente aquí" description="Añade una tarea abajo: sale también en la página de Tareas." />
      ) : (
        <TareasLista
          grupos={grupos}
          hijas={hijas}
          hoy={hoy}
          ctx={ctx}
          etiquetas={etiquetas}
          propiedades={["fecha", "prioridad", "subtareas", "estado"]}
          plegados={plegados}
          onPlegar={(id) =>
            setPlegados((p) => {
              const n = new Set(p)
              if (n.has(id)) n.delete(id)
              else n.add(id)
              return n
            })
          }
          seleccion={seleccion}
          onSeleccion={setSeleccion}
          activaId={activaId}
          acciones={acciones}
        />
      )}
      <div className="mt-1 flex items-center gap-2 px-2">
        <form
          className="flex flex-1 items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            const input = e.currentTarget.elements.namedItem("titulo")
            if (!(input instanceof HTMLInputElement) || !input.value.trim()) return
            crearRapida(input.value.trim())
            input.value = ""
          }}
        >
          <PlusIcon className="size-4 flex-none text-muted-foreground" />
          <input name="titulo" aria-label="Nueva tarea" placeholder="Añadir tarea… (Enter)" className="h-8 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
        </form>
        <Button type="button" variant="ghost" size="sm" onClick={() => setDialogo(true)}>
          Con fecha y más datos
        </Button>
      </div>

      <BulkBar count={seleccion.size} onClear={() => setSeleccion(new Set())}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            seleccionadas().filter((t) => t.estado !== "hecha").forEach((t) => acciones.onToggle(t))
            setSeleccion(new Set())
          }}
        >
          <CircleCheckIcon /> Hechas
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            acciones.onGuardarVarias(seleccionadas().map((t) => ({ ...t, fecha: hoy.slice(0, 10) })))
            setSeleccion(new Set())
            toast.success("Pasadas a hoy")
          }}
        >
          <CalendarIcon /> Hoy
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            acciones.onGuardarVarias(seleccionadas().map((t) => ({ ...t, fecha: sumarDias(hoy, 1) })))
            setSeleccion(new Set())
            toast.success("Pasadas a mañana")
          }}
        >
          Mañana
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            acciones.onBorrarVarias([...seleccion])
            setSeleccion(new Set())
          }}
        >
          <Trash2Icon /> Eliminar
        </Button>
      </BulkBar>

      <TaskDialog open={dialogo} onOpenChange={setDialogo} hoy={hoy} ctx={ctx} etiquetas={etiquetas} dondeFijo={donde} plantilla={null} onCrearEtiqueta={acciones.onCrearEtiqueta} onCreate={acciones.onCrear} />
    </div>
  )
}
