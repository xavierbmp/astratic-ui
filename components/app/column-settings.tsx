"use client"

import * as React from "react"
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core"
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { ChevronDownIcon, Columns3Icon, GripVerticalIcon, PenLineIcon, PlusIcon, Settings2Icon, Trash2Icon } from "lucide-react"
import { cn } from "cn"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { Column } from "@/components/app/data-table"
import type { TablaConfigurada } from "@/hooks/use-table-config"

/**
 * Qué campos se ven en la tabla y en qué orden, al estilo de «Ocultar campos» de Airtable:
 * un interruptor por campo, arrastrar para ordenar y, si la página lo permite, crear, editar y
 * borrar los campos propios sin salir de la lista.
 *
 * Vive al final de la fila de cabeceras de la tabla (prop `headerAction` de `DataTable`), que es
 * donde se buscan las columnas. La configuración se recuerda por página (`useTableConfig`).
 */
export function ColumnSettings<T>({
  config,
  onCrearCampo,
  camposPropios,
  label = "Campos",
  variant = "header",
}: {
  config: TablaConfigurada<T>
  /** Si se pasa, el panel ofrece crear un campo propio. */
  onCrearCampo?: () => void
  /** Si se pasa, los campos propios llevan lápiz y papelera para editarlos o borrarlos aquí. */
  camposPropios?: { es: (columnaId: string) => boolean; onEditar: (columnaId: string) => void; onBorrar: (columnaId: string) => void }
  label?: string
  /** `header`: botoncito de icono en la cabecera de la tabla. `toolbar`: botón con texto. */
  variant?: "header" | "toolbar"
}) {
  const [open, setOpen] = React.useState(false)
  const [busqueda, setBusqueda] = React.useState("")
  const { todas, ocultas, bloqueadas, alternar, reordenar, mostrarTodas, ocultarTodas } = config

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )
  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const ids = todas.map((c) => c.id)
    reordenar(arrayMove(ids, ids.indexOf(String(active.id)), ids.indexOf(String(over.id))))
  }

  const filtradas = busqueda
    ? todas.filter((c) => textoDeCabecera(c).toLowerCase().includes(busqueda.toLowerCase()))
    : todas
  const nOcultas = ocultas.size

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {variant === "header" ? (
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label={`${label} visibles${nOcultas > 0 ? ` · ${todas.length - nOcultas} de ${todas.length}` : ""}`}
            title="Elegir los campos que se ven"
            className={cn("text-muted-foreground hover:text-foreground", nOcultas > 0 && "text-foreground")}
          >
            <Settings2Icon />
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            data-active={nOcultas > 0 || undefined}
            className={cn("h-8 gap-1.5 text-sm", nOcultas > 0 && "border-foreground/30 bg-muted/60")}
          >
            <Columns3Icon />
            <span>{label}</span>
            {nOcultas > 0 && (
              <span className="rounded-sm bg-foreground px-1.5 text-xs font-medium text-background tabular-nums">
                {todas.length - nOcultas}/{todas.length}
              </span>
            )}
            <ChevronDownIcon className="text-muted-foreground" />
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 p-0">
        <div className="border-b px-3 py-2">
          <p className="text-[13px] font-semibold">Campos de la tabla</p>
          <p className="text-xs text-muted-foreground">Apaga los que no uses y arrastra para ordenarlos.</p>
        </div>
        <div className="border-b p-2">
          <Input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar campo…"
            className="h-8 text-xs"
          />
        </div>
        <div className="max-h-80 overflow-y-auto p-1">
          {filtradas.length === 0 && <p className="px-2 py-4 text-center text-xs text-muted-foreground">Ningún campo coincide</p>}
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={todas.map((c) => c.id)} strategy={verticalListSortingStrategy}>
              {filtradas.map((c) => (
                <FilaCampo
                  key={c.id}
                  id={c.id}
                  label={textoDeCabecera(c)}
                  visible={!ocultas.has(c.id)}
                  fijo={bloqueadas.has(c.id)}
                  ordenable={!busqueda}
                  onToggle={(v) => alternar(c.id, v)}
                  acciones={
                    camposPropios?.es(c.id) ? (
                      <>
                        <Button variant="ghost" size="icon-xs" aria-label={`Editar ${textoDeCabecera(c)}`} title="Editar el campo" className="size-6 text-muted-foreground hover:text-foreground" onClick={() => { setOpen(false); camposPropios.onEditar(c.id) }}>
                          <PenLineIcon />
                        </Button>
                        <Button variant="ghost" size="icon-xs" aria-label={`Eliminar ${textoDeCabecera(c)}`} title="Eliminar el campo" className="size-6 text-muted-foreground hover:text-danger" onClick={() => { setOpen(false); camposPropios.onBorrar(c.id) }}>
                          <Trash2Icon />
                        </Button>
                      </>
                    ) : undefined
                  }
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
        <div className="flex items-center gap-1 border-t px-2 py-1.5 text-xs">
          <button type="button" className="text-muted-foreground underline-offset-2 hover:text-foreground hover:underline" onClick={mostrarTodas}>
            Mostrar todos
          </button>
          <span className="text-muted-foreground">·</span>
          <button type="button" className="text-muted-foreground underline-offset-2 hover:text-foreground hover:underline" onClick={ocultarTodas}>
            Ocultar todos
          </button>
          {onCrearCampo && (
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto h-7"
              onClick={() => {
                setOpen(false)
                onCrearCampo()
              }}
            >
              <PlusIcon /> Crear campo
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

function FilaCampo({
  id,
  label,
  visible,
  fijo,
  ordenable,
  onToggle,
  acciones,
}: {
  id: string
  label: string
  visible: boolean
  fijo: boolean
  ordenable: boolean
  onToggle: (v: boolean) => void
  acciones?: React.ReactNode
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, disabled: !ordenable })
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn("group/campo flex items-center gap-1.5 rounded-md px-1 py-1 hover:bg-muted/60", isDragging && "z-10 bg-background shadow-sm")}
    >
      <button
        type="button"
        aria-label={`Mover ${label}`}
        className={cn("cursor-grab text-muted-foreground/60 hover:text-foreground", !ordenable && "pointer-events-none opacity-30")}
        {...attributes}
        {...listeners}
      >
        <GripVerticalIcon className="size-3.5" />
      </button>
      <span className="min-w-0 flex-1 truncate text-xs">{label}</span>
      {acciones && (
        <span className="flex items-center opacity-0 transition-opacity group-hover/campo:opacity-100 focus-within:opacity-100">{acciones}</span>
      )}
      {fijo ? (
        <span className="pr-1 text-[10px] text-muted-foreground">fijo</span>
      ) : (
        <Switch checked={visible} onCheckedChange={onToggle} aria-label={`Mostrar ${label}`} className="scale-90" />
      )}
    </div>
  )
}

/** La cabecera puede ser JSX; para buscar y listar hace falta su texto. */
function textoDeCabecera<T>(c: Column<T>): string {
  const h = c.header
  if (typeof h === "string") return h
  if (typeof h === "number") return String(h)
  return c.id
}
