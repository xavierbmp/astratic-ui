"use client"

import * as React from "react"
import type { LucideIcon } from "lucide-react"
import { CalendarDaysIcon, ChartGanttIcon, ChevronDownIcon, Columns3Icon, CopyIcon, ListIcon, PencilIcon, PlusIcon, RotateCcwIcon, Table2Icon, Trash2Icon } from "lucide-react"
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core"
import { SortableContext, arrayMove, horizontalListSortingStrategy, useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { toast } from "sonner"
import { cn } from "cn"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DISENOS_VISTA, LISTA_DISENOS_VISTA, type DisenoVista, type Vista } from "@/lib/vistas/core"
import type { VistasApi } from "@/hooks/use-vistas"

export const ICONOS_DISENO: Record<DisenoVista, LucideIcon> = {
  lista: ListIcon,
  tabla: Table2Icon,
  tablero: Columns3Icon,
  calendario: CalendarDaysIcon,
  cronograma: ChartGanttIcon,
}

/**
 * Las vistas guardadas de una base, en pestañas, como en Notion: se pulsa una para verla, se
 * arrastran para ordenarlas y la activa tiene su menú (renombrar, duplicar, volver a como venía,
 * eliminar). «+» crea una vista nueva eligiendo su diseño.
 */
export function VistasTabs({
  api,
  disenos = LISTA_DISENOS_VISTA,
  crearBase,
  className,
}: {
  api: VistasApi
  /** Los diseños que tienen sentido en esta base. */
  disenos?: DisenoVista[]
  /** Con qué nace una vista nueva de un diseño: propiedades, agrupación… */
  crearBase: (diseno: DisenoVista) => Omit<Vista, "id">
  className?: string
}) {
  const [renombrando, setRenombrando] = React.useState<string | null>(null)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))
  const dndId = React.useId()

  const alSoltar = (e: DragEndEvent) => {
    if (!e.over || e.active.id === e.over.id) return
    const ids = api.vistas.map((v) => v.id)
    api.reordenar(arrayMove(ids, ids.indexOf(String(e.active.id)), ids.indexOf(String(e.over.id))))
  }

  const borrar = (v: Vista) => {
    if (api.vistas.length <= 1) {
      toast.error("Tiene que quedar al menos una vista")
      return
    }
    api.borrar(v.id)
    toast.success(`Vista «${v.nombre}» eliminada`, { action: { label: "Deshacer", onClick: () => api.restaurar(v) } })
  }

  return (
    <div className={cn("flex min-w-0 items-center gap-0.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden", className)} role="tablist" aria-label="Vistas">
      <DndContext id={dndId} sensors={sensors} collisionDetection={closestCenter} onDragEnd={alSoltar}>
        <SortableContext items={api.vistas.map((v) => v.id)} strategy={horizontalListSortingStrategy}>
          {api.vistas.map((v) => (
            <PestanaVista
              key={v.id}
              vista={v}
              activa={v.id === api.activaId}
              renombrando={renombrando === v.id}
              onActivar={() => api.activar(v.id)}
              onRenombrar={(nombre) => {
                setRenombrando(null)
                if (nombre.trim() && nombre.trim() !== v.nombre) api.actualizar({ nombre: nombre.trim() }, v.id)
              }}
              menu={
                <>
                  <DropdownMenuItem onSelect={() => setRenombrando(v.id)}>
                    <PencilIcon /> Renombrar
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => {
                      api.duplicar(v.id)
                      toast.success("Vista duplicada")
                    }}
                  >
                    <CopyIcon /> Duplicar
                  </DropdownMenuItem>
                  {api.estaEditada(v.id) && (
                    <DropdownMenuItem
                      onSelect={() => {
                        api.restablecer(v.id)
                        toast.success("La vista vuelve a como venía")
                      }}
                    >
                      <RotateCcwIcon /> Volver a como venía
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onSelect={() => borrar(v)}>
                    <Trash2Icon /> Eliminar vista
                  </DropdownMenuItem>
                </>
              }
            />
          ))}
        </SortableContext>
      </DndContext>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label="Nueva vista" className="flex-none text-muted-foreground">
            <PlusIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel>Nueva vista</DropdownMenuLabel>
          {disenos.map((d) => {
            const Icono = ICONOS_DISENO[d]
            return (
              <DropdownMenuItem
                key={d}
                onSelect={() => {
                  const id = api.crear(crearBase(d))
                  setRenombrando(id)
                }}
              >
                <Icono /> {DISENOS_VISTA[d]}
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

function PestanaVista({
  vista,
  activa,
  renombrando,
  onActivar,
  onRenombrar,
  menu,
}: {
  vista: Vista
  activa: boolean
  renombrando: boolean
  onActivar: () => void
  onRenombrar: (nombre: string) => void
  menu: React.ReactNode
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: vista.id, disabled: renombrando })
  const Icono = ICONOS_DISENO[vista.diseno]
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn(
        "group/vista relative flex h-8 flex-none items-center rounded-md text-sm transition-colors",
        activa ? "text-foreground after:absolute after:inset-x-2 after:-bottom-[5px] after:h-0.5 after:rounded-full after:bg-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
        isDragging && "z-10 opacity-80",
      )}
    >
      {renombrando ? (
        <form
          className="px-1"
          onSubmit={(e) => {
            e.preventDefault()
            onRenombrar(new FormData(e.currentTarget).get("nombre")?.toString() ?? "")
          }}
        >
          <Input
            name="nombre"
            defaultValue={vista.nombre}
            autoFocus
            aria-label="Nombre de la vista"
            className="h-7 w-36 text-sm"
            onBlur={(e) => onRenombrar(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && onRenombrar(vista.nombre)}
          />
        </form>
      ) : (
        <button {...attributes} {...listeners} type="button" role="tab" aria-selected={activa} onClick={onActivar} className="flex h-full items-center gap-1.5 px-2 font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring/50">
          <Icono className="size-4" aria-hidden />
          <span className="max-w-40 truncate">{vista.nombre}</span>
        </button>
      )}
      {activa && !renombrando && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label={`Opciones de la vista ${vista.nombre}`} className="-ml-1.5 size-6 text-muted-foreground">
              <ChevronDownIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">{menu}</DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}
