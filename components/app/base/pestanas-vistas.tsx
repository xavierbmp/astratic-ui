"use client"

import * as React from "react"
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core"
import { SortableContext, horizontalListSortingStrategy, sortableKeyboardCoordinates, useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { CopyIcon, LockIcon, PencilIcon, PlusIcon, Trash2Icon, XIcon, type LucideIcon } from "lucide-react"
import { cn } from "cn"
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from "@/components/ui/context-menu"
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import type { TipoVista } from "@/lib/base/vistas"
import { RejillaIconosVista, iconoDeVista } from "@/components/app/base/iconos-vista"

/** Lo que una pestaña necesita de su vista: sea una vista de una base o una vista ligera de una página con filtros. */
export type PestanaVista = { id: string; nombre: string; icono?: string; tipo?: TipoVista }

/** Una pestaña fija de la página: la primera de todas, con su candado, sin menú ni arrastre. */
export type PestanaFija = { id: string; nombre: string; icono?: LucideIcon }

/** Hasta aquí se ven enteras; las de más se difuminan y se llega a ellas pulsando la última, que queda en medio. */
const PESTANAS_A_LA_VISTA = 10
/** Lo que asoma, difuminado, de la pestaña que viene después de la última a la vista. */
const ASOMA = 72

const mover = <X,>(lista: X[], de: number, a: number) => {
  const copia = [...lista]
  const [x] = copia.splice(de, 1)
  copia.splice(a, 0, x)
  return copia
}

/**
 * Las vistas de una base, como las pestañas de Chrome, encima de su bloque. La primera es la vista de base: no se borra
 * y es la plantilla de las demás. «+» abre una pestaña nueva con la base tal como está, y en la barra se le pone el nombre,
 * los filtros y los campos. Pasadas diez se difuminan; al pulsar la última se coloca en medio y deja ver las que siguen.
 * Se arrastran para ordenarlas; doble clic o el clic derecho cambian el nombre y el icono, la duplican o la borran.
 * A su derecha, en la misma fila, van los botones generales de la página (`ranura`).
 */
export function PestanasVistas({
  vistas,
  activa,
  onActivar,
  onCrear,
  onEditar,
  onDuplicar,
  onBorrar,
  onReordenar,
  fijas,
  ranura,
  className,
}: {
  vistas: PestanaVista[]
  activa: string | null
  onActivar: (id: string) => void
  /** Abre una pestaña nueva. */
  onCrear?: () => void
  onEditar: (id: string, cambio: { nombre?: string; icono?: string }) => void
  onDuplicar?: (id: string) => void
  /** Sin él no se borra. La primera, la de base, nunca. */
  onBorrar?: (id: string) => void
  onReordenar?: (ids: string[]) => void
  fijas?: { vistas: PestanaFija[]; activa: string | null; onActivar: (id: string) => void }
  /** El hueco de la derecha, donde la página pone sus botones generales. */
  ranura?: (nodo: HTMLDivElement | null) => void
  className?: string
}) {
  const [editando, setEditando] = React.useState<string | null>(null)
  const sensores = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }))
  const idContexto = React.useId()
  const tira = React.useRef<HTMLDivElement>(null)
  const [limite, setLimite] = React.useState<number | undefined>(undefined)
  const [bordes, setBordes] = React.useState({ izquierda: false, derecha: false })
  const ordenables = vistas.slice(1).map((v) => v.id)
  const abierta = fijas?.activa ?? activa

  const alSoltar = (e: DragEndEvent) => {
    if (e.over && e.active.id !== e.over.id) onReordenar?.(mover(ordenables, ordenables.indexOf(String(e.active.id)), ordenables.indexOf(String(e.over.id))))
  }

  const medirBordes = React.useCallback(() => {
    const el = tira.current
    if (el) setBordes({ izquierda: el.scrollLeft > 1, derecha: el.scrollLeft + el.clientWidth < el.scrollWidth - 1 })
  }, [])

  // Las diez primeras se ven enteras: el ancho de la tira acaba poco después de la décima, con la siguiente asomando.
  const nombres = vistas.map((v) => v.nombre).join("\n")
  const cuantasFijas = fijas?.vistas.length ?? 0
  React.useLayoutEffect(() => {
    const el = tira.current
    if (!el) return
    const medir = () => {
      const pestanas = el.querySelectorAll<HTMLElement>("[data-pestana]")
      const decima = pestanas[PESTANAS_A_LA_VISTA - 1]
      setLimite(pestanas.length > PESTANAS_A_LA_VISTA && decima ? decima.offsetLeft + decima.offsetWidth + ASOMA : undefined)
      medirBordes()
    }
    medir()
    const observador = new ResizeObserver(medir)
    observador.observe(el)
    return () => observador.disconnect()
  }, [medirBordes, nombres, cuantasFijas])

  // La pestaña abierta se queda en medio si hay más de las que caben: así se ven las que siguen.
  React.useEffect(() => {
    const el = tira.current
    const pestana = el?.querySelector<HTMLElement>('[data-pestana][aria-selected="true"]')
    if (!el || !pestana || el.scrollWidth <= el.clientWidth) return
    el.scrollTo({ left: pestana.offsetLeft - (el.clientWidth - pestana.offsetWidth) / 2, behavior: "smooth" })
  }, [abierta, limite])

  const mascara = `linear-gradient(to right, ${bordes.izquierda ? "transparent, black 56px" : "black, black"}, ${bordes.derecha ? `black calc(100% - ${ASOMA}px), transparent` : "black"})`

  return (
    <div data-slot="pestanas-vistas" className={cn("relative z-10 -mb-px flex h-9 min-w-0 flex-none items-end gap-1", className)}>
      <div ref={tira} role="tablist" aria-label="Vistas" onScroll={medirBordes} className="min-w-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" style={{ maxWidth: limite, maskImage: mascara, WebkitMaskImage: mascara }}>
        <div className="relative flex w-max items-end px-2.5">
          {fijas?.vistas.map((f) => (
            <Pestana key={f.id} nombre={f.nombre} icono={f.icono ?? LockIcon} activa={f.id === fijas.activa} onClick={() => fijas.onActivar(f.id)} titulo={`${f.nombre}: vista fija, la misma para todas las personas`} />
          ))}
          <DndContext id={idContexto} sensors={sensores} collisionDetection={closestCenter} onDragEnd={alSoltar}>
            <SortableContext items={ordenables} strategy={horizontalListSortingStrategy}>
              {vistas.map((v, i) => (
                <PestanaOrdenable
                  key={v.id}
                  vista={v}
                  esBase={i === 0}
                  activa={!fijas?.activa && v.id === activa}
                  editando={editando === v.id}
                  onEditando={(si) => setEditando(si ? v.id : null)}
                  onActivar={() => onActivar(v.id)}
                  onEditar={(cambio) => onEditar(v.id, cambio)}
                  onDuplicar={onDuplicar && (() => onDuplicar(v.id))}
                  onBorrar={onBorrar && i > 0 ? () => onBorrar(v.id) : undefined}
                  arrastrable={!!onReordenar && i > 0}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      </div>
      {onCrear && (
        <button type="button" aria-label="Nueva vista" title="Nueva vista" onClick={onCrear} className="mb-1 flex size-7 flex-none items-center justify-center rounded-lg text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground">
          <PlusIcon className="size-4" />
        </button>
      )}
      <div ref={ranura} data-slot="botones-pagina" className="mb-1 ml-auto flex flex-none items-center gap-2 pl-3 whitespace-nowrap empty:hidden" />
    </div>
  )
}

/** Una pestaña: su icono, su nombre y, si se puede borrar, la equis. La activa es del color del bloque y se une a él. */
const Pestana = React.forwardRef<HTMLDivElement, React.ComponentProps<"div"> & { nombre: string; icono: LucideIcon; activa: boolean; titulo?: string; onCerrar?: () => void }>(function Pestana({ nombre, icono: Icono, activa, titulo, onCerrar, className, onClick, onKeyDown, ...props }, ref) {
  return (
    <div
      ref={ref}
      data-pestana
      role="tab"
      tabIndex={0}
      aria-selected={activa}
      title={titulo ?? nombre}
      onClick={onClick}
      onKeyDown={(e) => {
        onKeyDown?.(e)
        if (e.defaultPrevented || (e.key !== "Enter" && e.key !== " ")) return
        e.preventDefault()
        e.currentTarget.click()
      }}
      className={cn(
        "group/pestana relative flex h-8 max-w-52 min-w-0 flex-none cursor-pointer items-center gap-1.5 rounded-t-[10px] pr-1.5 pl-3 text-[13px] whitespace-nowrap outline-none select-none focus-visible:ring-2 focus-visible:ring-ring/50",
        activa ? "pestana-activa z-10 bg-card font-medium text-foreground" : "text-muted-foreground hover:bg-foreground/[0.05] hover:text-foreground",
        !onCerrar && "pr-3",
        className,
      )}
      {...props}
    >
      <Icono className={cn("size-3.5 flex-none", activa && "text-brand")} />
      <span className="truncate">{nombre}</span>
      {onCerrar && (
        <button
          type="button"
          aria-label={`Eliminar la vista ${nombre}`}
          title="Eliminar la vista"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation()
            onCerrar()
          }}
          className={cn("flex size-4 flex-none items-center justify-center rounded-[5px] text-muted-foreground opacity-0 group-hover/pestana:opacity-100 hover:bg-foreground/10 hover:text-foreground focus-visible:opacity-100", activa && "opacity-100")}
        >
          <XIcon className="size-3" />
        </button>
      )}
      {!activa && <span aria-hidden className="absolute top-2 right-0 bottom-2 w-px bg-border group-hover/pestana:opacity-0" />}
    </div>
  )
})

function PestanaOrdenable({
  vista,
  esBase,
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
  esBase: boolean
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
    <div ref={arrastrable ? setNodeRef : undefined} style={{ transform: CSS.Translate.toString(transform), transition }} className={cn("flex-none", isDragging && "relative z-20 opacity-80")}>
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
              <Pestana
                nombre={vista.nombre}
                icono={iconoDeVista(vista)}
                activa={activa}
                titulo={esBase ? `${vista.nombre}: la vista de base, la plantilla de las demás` : vista.nombre}
                onClick={onActivar}
                onDoubleClick={() => onEditando(true)}
                onCerrar={onBorrar}
                {...(arrastrable ? { ...attributes, ...listeners } : {})}
              />
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
        <PopoverContent side="bottom" align="start" className="w-auto p-3" onFocusOutside={(e) => e.preventDefault()}>
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
          </form>
        </PopoverContent>
      </Popover>
    </div>
  )
}
