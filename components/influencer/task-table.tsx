"use client"

import * as React from "react"
import Link from "next/link"
import { CheckIcon, ChevronDownIcon, CopyIcon, EllipsisIcon, PencilIcon, PlusIcon, StickyNoteIcon, Trash2Icon, CircleCheckIcon, CalendarIcon } from "lucide-react"
import { toast } from "sonner"
import { cn } from "cn"
import { fmt } from "@/lib/format"
import type { Tarea } from "@/lib/influencer/modelo"
import { GRUPOS_TAREA, grupoDeTarea, idNuevo, ordenarTareas, tonoDeFecha, type GrupoTarea } from "@/lib/influencer/tareas"
import { sumarDias } from "@/lib/influencer/fechas"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { InlineField } from "@/components/app/inline-field"
import { BulkBar } from "@/components/app/bulk-bar"
import { EmptyState } from "@/components/app/states"
import { TaskDialog, type RelacionOpcion } from "@/components/influencer/task-dialog"

const tonoFecha = { vencida: "text-danger", hoy: "text-warning", normal: "text-muted-foreground" }

/**
 * La lista de tareas de operar, al estilo de Notion: agrupada por fecha, cada tarea se marca con el
 * círculo, el título y la fecha se editan en el sitio, abajo se añade una escribiendo y Enter, y la
 * selección saca la barra de acciones. La misma lista sirve para una collab, una propuesta o todas.
 */
export function TaskTable({
  tareas,
  hoy,
  contexto,
  hrefDe,
  relacionFija,
  relaciones,
  onToggle,
  onUpdate,
  onCreate,
  onDelete,
  className,
}: {
  tareas: Tarea[]
  hoy: string
  /** «Lumea Skin · Rutina de noche»: se enseña cuando la lista mezcla collabs y propuestas. */
  contexto?: (t: Tarea) => string | undefined
  hrefDe?: (t: Tarea) => string | undefined
  /** Si la lista es de una collab o propuesta, las nuevas nacen atadas a ella. */
  relacionFija?: RelacionOpcion
  relaciones?: RelacionOpcion[]
  onToggle: (id: string) => void
  onUpdate: (tarea: Tarea) => void
  onCreate: (tarea: Tarea) => void
  onDelete: (ids: string[]) => void
  className?: string
}) {
  const [seleccion, setSeleccion] = React.useState<Set<string>>(new Set())
  const [editando, setEditando] = React.useState<Tarea | null>(null)
  const [dialogo, setDialogo] = React.useState(false)
  const [nueva, setNueva] = React.useState("")
  const [hechasAbiertas, setHechasAbiertas] = React.useState(false)

  const grupos = GRUPOS_TAREA.map((g) => ({ ...g, items: ordenarTareas(tareas.filter((t) => grupoDeTarea(t, hoy) === g.id)) })).filter((g) => g.items.length > 0)

  const alternarSeleccion = (id: string) =>
    setSeleccion((s) => {
      const n = new Set(s)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })

  const crearRapida = () => {
    const titulo = nueva.trim()
    if (!titulo) return
    onCreate({ id: idNuevo("t"), titulo, hecha: false, origen: "manual", relacion: relacionFija ? { tipo: relacionFija.tipo, id: relacionFija.id } : undefined })
    setNueva("")
  }

  const completar = (ids: string[]) => {
    ids.forEach((id) => {
      const t = tareas.find((x) => x.id === id)
      if (t && !t.hecha) onToggle(id)
    })
    setSeleccion(new Set())
    toast.success(ids.length === 1 ? "Tarea hecha" : `${ids.length} tareas hechas`)
  }

  const mover = (ids: string[], fecha: string) => {
    ids.forEach((id) => {
      const t = tareas.find((x) => x.id === id)
      if (t) onUpdate({ ...t, fechaLimite: fecha })
    })
    setSeleccion(new Set())
    toast.success(`Movidas al ${fmt.date(fecha)}`)
  }

  const borrar = (ids: string[]) => {
    const previas = tareas.filter((t) => ids.includes(t.id))
    onDelete(ids)
    setSeleccion(new Set())
    toast.success(ids.length === 1 ? "Tarea eliminada" : `${ids.length} tareas eliminadas`, {
      action: { label: "Deshacer", onClick: () => previas.forEach((t) => onCreate(t)) },
    })
  }

  const duplicar = (t: Tarea) => {
    onCreate({ ...t, id: idNuevo("t"), hecha: false, hechaEl: undefined, titulo: `${t.titulo} (copia)` })
    toast.success("Tarea duplicada")
  }

  const fila = (t: Tarea) => {
    const sel = seleccion.has(t.id)
    const tono = tonoDeFecha(t.fechaLimite, hoy)
    const ctx = contexto?.(t)
    const href = hrefDe?.(t)
    return (
      <li key={t.id} data-state={sel ? "selected" : undefined} className={cn("group/tarea flex items-center gap-3 px-3 py-2 transition-colors hover:bg-muted/60", sel && "bg-brand-soft hover:bg-brand-soft")}>
        <Checkbox
          aria-label={`Seleccionar ${t.titulo}`}
          checked={sel}
          onCheckedChange={() => alternarSeleccion(t.id)}
          className={cn(seleccion.size === 0 && "opacity-0 group-hover/tarea:opacity-100 focus-visible:opacity-100")}
        />
        <button
          type="button"
          aria-label={t.hecha ? `Reabrir ${t.titulo}` : `Marcar ${t.titulo} como hecha`}
          onClick={() => onToggle(t.id)}
          className={cn("grid size-[18px] flex-none place-items-center rounded-full border-[1.5px] transition-colors", t.hecha ? "border-success bg-success text-background" : "border-control hover:border-foreground")}
        >
          {t.hecha && <CheckIcon className="size-3" strokeWidth={3} />}
        </button>
        <div className="grid min-w-0 flex-1 gap-0.5">
          <InlineField
            value={t.titulo}
            tipo="texto"
            required
            onSave={async (v) => {
              onUpdate({ ...t, titulo: String(v ?? t.titulo) })
            }}
            render={(v) => (
              <span className={cn("truncate text-sm font-medium", t.hecha && "text-muted-foreground line-through")}>
                {String(v)}
                {t.notas && <StickyNoteIcon className="ml-1.5 inline size-3.5 text-muted-foreground" aria-label="Con notas" />}
              </span>
            )}
          />
          {ctx && (
            <span className="truncate text-xs text-muted-foreground">
              {href ? (
                <Link href={href} className="hover:underline">
                  {ctx}
                </Link>
              ) : (
                ctx
              )}
            </span>
          )}
        </div>
        {t.origen === "auto" && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="hidden rounded-md border px-1.5 py-px text-[11px] font-medium text-muted-foreground sm:inline">Auto</span>
            </TooltipTrigger>
            <TooltipContent>Sale de las fechas del brief</TooltipContent>
          </Tooltip>
        )}
        <div className="w-28 flex-none">
          <InlineField
            value={t.fechaLimite ?? null}
            tipo="fecha"
            placeholder="Fecha"
            onSave={async (v) => {
              onUpdate({ ...t, fechaLimite: v ? String(v) : undefined })
            }}
            render={(v) => (
              <span className={cn("inline-flex items-center gap-1 text-xs font-medium tabular-nums", t.hecha ? "text-muted-foreground" : tonoFecha[tono])}>
                <CalendarIcon className="size-3.5" />
                {v ? fmt.date(String(v)) : "Sin fecha"}
              </span>
            )}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label="Más acciones" className="opacity-0 group-hover/tarea:opacity-100 data-[state=open]:opacity-100 focus-visible:opacity-100">
              <EllipsisIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => { setEditando(t); setDialogo(true) }}>
              <PencilIcon /> Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => duplicar(t)}>
              <CopyIcon /> Duplicar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => mover([t.id], hoy)}>
              <CalendarIcon /> Mover a hoy
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={() => borrar([t.id])}>
              <Trash2Icon /> Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </li>
    )
  }

  const cabeceraGrupo = (g: { id: GrupoTarea; label: string; items: Tarea[] }) => {
    const plegable = g.id === "hechas"
    const abierto = !plegable || hechasAbiertas
    return (
      <div key={g.id}>
        <button
          type="button"
          onClick={() => plegable && setHechasAbiertas((a) => !a)}
          className={cn("flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-xs font-semibold text-muted-foreground", plegable && "hover:bg-muted/60")}
        >
          {plegable && <ChevronDownIcon className={cn("size-3.5 transition-transform", !abierto && "-rotate-90")} />}
          {g.label}
          <span className="font-normal tabular-nums">{g.items.length}</span>
        </button>
        {abierto && <ul className="divide-y divide-border/60">{g.items.map(fila)}</ul>}
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col", className)}>
      {grupos.length === 0 ? (
        <EmptyState icon={CircleCheckIcon} title="Nada pendiente" description="Añade una tarea abajo o deja que salgan solas de las fechas de cada collab." />
      ) : (
        <div className="flex flex-col gap-2">{grupos.map(cabeceraGrupo)}</div>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          crearRapida()
        }}
        className="mt-2 flex items-center gap-2 px-3"
      >
        <PlusIcon className="size-4 flex-none text-muted-foreground" />
        <Input value={nueva} onChange={(e) => setNueva(e.target.value)} placeholder={relacionFija ? `Añadir tarea a ${relacionFija.label}…` : "Añadir tarea… (Enter para crear)"} className="h-8 border-transparent bg-transparent shadow-none focus-visible:border-input" />
        <Button type="button" variant="ghost" size="sm" onClick={() => { setEditando(null); setDialogo(true) }}>
          Con fecha y notas
        </Button>
      </form>

      <BulkBar count={seleccion.size} onClear={() => setSeleccion(new Set())}>
        <Button variant="ghost" size="sm" onClick={() => completar([...seleccion])}>
          <CircleCheckIcon /> Hechas
        </Button>
        <Button variant="ghost" size="sm" onClick={() => mover([...seleccion], hoy)}>
          <CalendarIcon /> Hoy
        </Button>
        <Button variant="ghost" size="sm" onClick={() => mover([...seleccion], sumarDias(hoy, 1))}>
          Mañana
        </Button>
        <Button variant="ghost" size="sm" onClick={() => borrar([...seleccion])}>
          <Trash2Icon /> Eliminar
        </Button>
      </BulkBar>

      <TaskDialog
        open={dialogo}
        onOpenChange={setDialogo}
        hoy={hoy}
        tarea={editando}
        relacionFija={relacionFija}
        relaciones={relaciones}
        onCreate={(t) => {
          onCreate(t)
          toast.success("Tarea creada")
        }}
        onUpdate={(t) => {
          onUpdate(t)
          toast.success("Tarea guardada")
        }}
      />
    </div>
  )
}
