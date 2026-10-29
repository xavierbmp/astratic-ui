"use client"

import * as React from "react"
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core"
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { ArrowLeftRightIcon, CopyIcon, ListIcon, LockIcon, PencilIcon, PlusIcon, Trash2Icon, type LucideIcon } from "lucide-react"
import { cn } from "cn"
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from "@/components/ui/context-menu"
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { TipoVista } from "@/lib/base/vistas"
import { IconoPlegarLateral, type ControlLateral } from "@/components/app/controles-lateral"
import { RejillaIconosVista, iconoDeVista } from "@/components/app/base/iconos-vista"

/** Lo que una pestaña necesita de su vista: sea una vista de una base o una vista ligera de una página con filtros. */
export type PestanaVista = { id: string; nombre: string; icono?: string; tipo?: TipoVista }

/** Una pestaña fija de la página: arriba del todo, con su candado, sin menú ni arrastre. */
export type PestanaFija = { id: string; nombre: string; icono?: LucideIcon }

const mover = <X,>(lista: X[], de: number, a: number) => {
  const copia = [...lista]
  const [x] = copia.splice(de, 1)
  copia.splice(a, 0, x)
  return copia
}

/**
 * Las vistas como pestañas laterales (Xavier, 2026-10-29, reportes cmvsixcu y cmvtrp16 del workspace): una columna
 * estrecha a un lado de la base con una pestaña cuadrada por vista, su icono y su nombre debajo, como las pestañas de
 * arriba pero en el lateral. «+» crea una vista y abre enseguida su nombre y su icono; luego se le ponen los filtros,
 * los campos y el orden en la barra, como a cualquier vista. Se arrastran para ordenarlas; doble clic o el clic derecho
 * cambian el nombre y el icono, la duplican o la borran. Sirve igual para una `BaseDatos` (sus vistas) que para una
 * página con `BarraFiltros` (sus vistas ligeras, `useVistasLigeras`).
 */
export function PestanasVistas({
  vistas,
  activa,
  onActivar,
  onCrear,
  menuCrear,
  onEditar,
  onDuplicar,
  onBorrar,
  onReordenar,
  fijas,
  onLista,
  lado,
  onCambiarLado,
  onPlegar,
  nombre = "las vistas",
}: Partial<ControlLateral> & {
  vistas: PestanaVista[]
  activa: string | null
  onActivar: (id: string) => void
  /** Crea una vista y devuelve su id: se abre ya para ponerle nombre e icono. */
  onCrear?: () => string
  /** En lugar de crear sin más, un menú propio (el tipo de vista de una base) que recibe con qué abrir la nueva. */
  menuCrear?: (alCrear: (id: string) => void, boton: React.ReactNode) => React.ReactNode
  onEditar: (id: string, cambio: { nombre?: string; icono?: string }) => void
  onDuplicar?: (id: string) => void
  /** Sin él, o con una sola vista, no se borra. */
  onBorrar?: (id: string) => void
  onReordenar?: (ids: string[]) => void
  fijas?: { vistas: PestanaFija[]; activa: string | null; onActivar: (id: string) => void }
  /** Pasar a la lista ancha de vistas (la de Airtable). */
  onLista?: () => void
  nombre?: string
}) {
  const [editando, setEditando] = React.useState<string | null>(null)
  const sensores = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }))
  const idContexto = React.useId()
  const ids = vistas.map((v) => v.id)
  const alSoltar = (e: DragEndEvent) => {
    if (e.over && e.active.id !== e.over.id) onReordenar?.(mover(ids, ids.indexOf(String(e.active.id)), ids.indexOf(String(e.over.id))))
  }
  const botonCrear = (
    <button type="button" aria-label="Nueva vista" title="Nueva vista" className="flex h-12 w-full flex-none items-center justify-center rounded-lg border border-dashed text-muted-foreground hover:border-solid hover:bg-muted hover:text-foreground" onClick={menuCrear ? undefined : () => onCrear && setEditando(onCrear())}>
      <PlusIcon className="size-4" />
    </button>
  )
  return (
    <aside data-slot="pestanas-vistas" aria-label="Vistas" className={cn("flex w-[88px] flex-none flex-col gap-1 bg-card p-1.5", lado === "derecha" ? "border-l" : "border-r")}>
      <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
        {fijas?.vistas.map((f) => {
          const Icono = f.icono ?? LockIcon
          return <Pestana key={f.id} nombre={f.nombre} icono={Icono} activa={f.id === fijas.activa} onClick={() => fijas.onActivar(f.id)} fija />
        })}
        {fijas && fijas.vistas.length > 0 && <span className="mx-2 my-0.5 border-t" aria-hidden />}
        <DndContext id={idContexto} sensors={sensores} collisionDetection={closestCenter} onDragEnd={alSoltar}>
          <SortableContext items={ids} strategy={verticalListSortingStrategy}>
            {vistas.map((v) => (
              <PestanaOrdenable
                key={v.id}
                vista={v}
                activa={!fijas?.activa && v.id === activa}
                editando={editando === v.id}
                onEditando={(si) => setEditando(si ? v.id : null)}
                onActivar={() => onActivar(v.id)}
                onEditar={(cambio) => onEditar(v.id, cambio)}
                onDuplicar={onDuplicar && (() => onDuplicar(v.id))}
                onBorrar={onBorrar && vistas.length > 1 ? () => onBorrar(v.id) : undefined}
                arrastrable={!!onReordenar}
              />
            ))}
          </SortableContext>
        </DndContext>
        {/* Desde un menú, el nombre se abre cuando el menú ya se ha cerrado: si no, al devolver el foco lo cierra. */}
        {(onCrear || menuCrear) && (menuCrear ? menuCrear((id) => setTimeout(() => setEditando(id), 60), botonCrear) : botonCrear)}
      </div>
      <div className="flex flex-col items-center gap-0.5 border-t pt-1">
        {onLista && (
          <Button variant="ghost" size="icon-sm" aria-label="Ver las vistas en lista" title="Ver las vistas en lista" onClick={onLista}>
            <ListIcon />
          </Button>
        )}
        {onCambiarLado && (
          <Button variant="ghost" size="icon-sm" aria-label={`Pasar ${nombre} a la ${lado === "izquierda" ? "derecha" : "izquierda"}`} title={`Pasar a la ${lado === "izquierda" ? "derecha" : "izquierda"}`} onClick={onCambiarLado}>
            <ArrowLeftRightIcon />
          </Button>
        )}
        {onPlegar && lado && (
          <Button variant="ghost" size="icon-sm" aria-label={`Plegar ${nombre}`} title={`Plegar ${nombre}`} onClick={onPlegar}>
            <IconoPlegarLateral lado={lado} abierto />
          </Button>
        )}
      </div>
    </aside>
  )
}

/** Una pestaña cuadrada: el icono y, debajo, el nombre en dos líneas como mucho. La activa, en el color de lo elegido. */
const Pestana = React.forwardRef<HTMLButtonElement, React.ComponentProps<"button"> & { nombre: string; icono: LucideIcon; activa: boolean; fija?: boolean }>(function Pestana({ nombre, icono: Icono, activa, fija, className, ...props }, ref) {
  return (
    <button
      ref={ref}
      type="button"
      title={fija ? `${nombre} · vista fija, la misma para todas` : nombre}
      aria-current={activa || undefined}
      className={cn(
        "relative flex w-full flex-none flex-col items-center gap-1 rounded-lg px-1 pt-2 pb-1.5 text-center text-[10.5px] leading-[1.15] text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50",
        activa && "bg-brand-soft font-medium text-foreground before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:rounded-full before:bg-brand hover:bg-brand-soft",
        className,
      )}
      {...props}
    >
      <Icono className={cn("size-[18px] flex-none", activa && "text-brand")} />
      <span className="line-clamp-2 w-full [overflow-wrap:anywhere] hyphens-auto" lang="es">{nombre}</span>
    </button>
  )
})

function PestanaOrdenable({
  vista,
  activa,
  editando,
  onEditando,
  onActivar,
  onEditar,
  onDuplicar,
  onBorrar,
  arrastrable,
}: {
  vista: PestanaVista
  activa: boolean
  editando: boolean
  onEditando: (si: boolean) => void
  onActivar: () => void
  onEditar: (cambio: { nombre?: string; icono?: string }) => void
  onDuplicar?: () => void
  onBorrar?: () => void
  arrastrable: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: vista.id, disabled: !arrastrable })
  // Lo escrito mientras se edita; sin escribir nada, el nombre que tiene.
  const [escrito, setEscrito] = React.useState<string | null>(null)
  const nombre = escrito ?? vista.nombre
  const guardar = () => {
    if (escrito !== null && escrito.trim() && escrito.trim() !== vista.nombre) onEditar({ nombre: escrito })
    setEscrito(null)
  }
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Translate.toString(transform), transition }} className={cn(isDragging && "relative z-10 opacity-80")}>
      <Popover
        open={editando}
        onOpenChange={(abierto) => {
          if (!abierto) guardar()
          onEditando(abierto)
        }}
      >
        <ContextMenu>
          <ContextMenuTrigger asChild>
            <PopoverAnchor asChild>
              <Pestana nombre={vista.nombre} icono={iconoDeVista(vista)} activa={activa} onClick={onActivar} onDoubleClick={() => onEditando(true)} {...attributes} {...listeners} />
            </PopoverAnchor>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem onSelect={() => onEditando(true)}>
              <PencilIcon /> Nombre e icono
            </ContextMenuItem>
            {onDuplicar && (
              <ContextMenuItem onSelect={onDuplicar}>
                <CopyIcon /> Duplicar la vista
              </ContextMenuItem>
            )}
            {onBorrar && (
              <>
                <ContextMenuSeparator />
                <ContextMenuItem variant="destructive" onSelect={onBorrar}>
                  <Trash2Icon /> Eliminar la vista
                </ContextMenuItem>
              </>
            )}
          </ContextMenuContent>
        </ContextMenu>
        <PopoverContent side="right" align="start" className="w-auto p-3" onFocusOutside={(e) => e.preventDefault()}>
          <form
            className="flex flex-col gap-3"
            onSubmit={(e) => {
              e.preventDefault()
              guardar()
              onEditando(false)
            }}
          >
            <label className="flex flex-col gap-1.5 text-xs font-medium">
              Nombre de la vista
              <Input autoFocus value={nombre} onFocus={(e) => e.target.select()} onChange={(e) => setEscrito(e.target.value)} className="h-8" />
            </label>
            <div className="flex flex-col gap-1.5 text-xs font-medium">
              Icono
              <RejillaIconosVista valor={vista.icono} onElegir={(icono) => onEditar({ icono })} />
            </div>
            <p className="max-w-[228px] text-[11px] leading-snug text-muted-foreground">Los filtros, los campos y el orden se ponen en la barra de la vista, como siempre.</p>
          </form>
        </PopoverContent>
      </Popover>
    </div>
  )
}
