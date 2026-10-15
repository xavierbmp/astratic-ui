"use client"

import * as React from "react"
import { toast } from "sonner"
import { DndContext, DragOverlay, PointerSensor, pointerWithin, useDraggable, useDroppable, useSensor, useSensors, type DragEndEvent, type DragMoveEvent, type DragOverEvent } from "@dnd-kit/core"
import { ArrowUpToLineIcon, ChevronRightIcon, EllipsisIcon, FolderInputIcon, FolderPlusIcon, PencilIcon, Trash2Icon } from "lucide-react"
import { cn } from "cn"
import { carpetasEnArbol, conDescendientes, hijasDe, type CarpetaArbol, type DestinoCarpeta } from "@/lib/carpetas"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

/** Dónde cae lo que se arrastra respecto a la fila de debajo: encima, dentro o debajo. */
type Zona = "antes" | "dentro" | "despues"
/** Soltar en la línea de «Nueva carpeta» la saca arriba del todo. */
const RAIZ = "__raiz__"

/** La sangría de cada nivel del árbol, como variable para las clases. */
const sangria = (nivel: number) => ({ "--nivel": nivel }) as React.CSSProperties

export function NombreEditable({ inicial, onGuardar, onCancelar, className, style }: { inicial: string; onGuardar: (nombre: string) => void; onCancelar: () => void; className?: string; style?: React.CSSProperties }) {
  const [nombre, setNombre] = React.useState(inicial)
  const guardar = () => (nombre.trim() ? onGuardar(nombre.trim()) : onCancelar())
  return (
    <input
      autoFocus
      value={nombre}
      onChange={(e) => setNombre(e.target.value)}
      onBlur={guardar}
      onKeyDown={(e) => {
        if (e.key === "Enter") guardar()
        if (e.key === "Escape") onCancelar()
      }}
      placeholder="Nombre de la carpeta"
      aria-label="Nombre de la carpeta"
      style={style}
      className={cn("h-8 w-full rounded-md border border-input bg-background px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50", className)}
    />
  )
}

/** El color de cada carpeta: las clases de su punto (un tinte, un color de estado). Sin él, gris. */
export type ColorCarpeta<C> = (c: C) => string | undefined

function Punto({ clase, className }: { clase?: string; className?: string }) {
  return <span className={cn("flex-none rounded-full", clase ?? "bg-muted-foreground/40", className)} aria-hidden />
}

/** Las carpetas como opciones de un menú, en árbol: mover lo que hay dentro, elegir la carpeta de algo o adónde mover otra carpeta. */
export function OpcionesCarpeta<C extends CarpetaArbol>({ carpetas, onElegir, excluir, color }: { carpetas: C[]; onElegir: (id: string) => void; excluir?: Set<string>; color?: ColorCarpeta<C> }) {
  return (
    <>
      {carpetasEnArbol(carpetas)
        .filter((f) => !excluir?.has(f.carpeta.id))
        .map(({ carpeta, nivel }) => (
          <DropdownMenuItem key={carpeta.id} onSelect={() => onElegir(carpeta.id)} style={sangria(nivel)} className="pl-[calc(0.5rem+var(--nivel)*0.875rem)]">
            <Punto clase={color?.(carpeta)} className="size-2" />
            <span className="truncate">{carpeta.nombre}</span>
          </DropdownMenuItem>
        ))}
    </>
  )
}

type AccionesArbol<C> = {
  actual: string
  color?: ColorCarpeta<C>
  cuentas: Record<string, number>
  onElegir: (id: string) => void
  onPlegar: (id: string) => void
  onNuevaDentro: (padreId: string) => void
  onRenombrar: (id: string) => void
  onMover: (id: string, destino: DestinoCarpeta) => void
  onBorrar: (c: C) => void
}

/** Una carpeta del árbol: se pulsa para verla, se arrastra para moverla y su «…» tiene lo demás. */
function FilaCarpeta<C extends CarpetaArbol>({ carpeta, carpetas, nivel, tieneHijas, plegada, soltar, acc }: { carpeta: C; carpetas: C[]; nivel: number; tieneHijas: boolean; plegada: boolean; soltar: Zona | null; acc: AccionesArbol<C> }) {
  const arrastre = useDraggable({ id: carpeta.id })
  const destino = useDroppable({ id: carpeta.id })
  const ref = (n: HTMLLIElement | null) => {
    arrastre.setNodeRef(n)
    destino.setNodeRef(n)
  }
  const elegida = acc.actual === carpeta.id
  // No puede ir dentro de sí misma, de las suyas ni (ya está) de su madre.
  const noValidas = new Set([...conDescendientes(carpetas, carpeta.id), ...(carpeta.padreId ? [carpeta.padreId] : [])])
  return (
    <li
      ref={ref}
      style={sangria(nivel)}
      className={cn(
        "group/carpeta relative rounded-lg",
        arrastre.isDragging && "opacity-40",
        soltar === "dentro" && "bg-brand-soft ring-1 ring-brand",
        soltar === "antes" && "before:absolute before:inset-x-2 before:-top-px before:h-0.5 before:rounded-full before:bg-brand",
        soltar === "despues" && "after:absolute after:inset-x-2 after:-bottom-px after:h-0.5 after:rounded-full after:bg-brand",
      )}
    >
      {tieneHijas && (
        <button
          type="button"
          onClick={() => acc.onPlegar(carpeta.id)}
          aria-label={plegada ? `Desplegar «${carpeta.nombre}»` : `Plegar «${carpeta.nombre}»`}
          aria-expanded={!plegada}
          className="absolute top-1/2 left-[calc(0.25rem+var(--nivel)*1rem)] z-10 grid size-5 -translate-y-1/2 place-items-center rounded text-muted-foreground hover:bg-background hover:text-foreground"
        >
          <ChevronRightIcon className={cn("size-3.5 transition-transform", !plegada && "rotate-90")} />
        </button>
      )}
      <button
        type="button"
        {...arrastre.listeners}
        {...arrastre.attributes}
        onClick={() => acc.onElegir(carpeta.id)}
        aria-current={elegida ? "true" : undefined}
        className={cn(
          "flex w-full min-w-0 items-center gap-2 rounded-lg border-l-2 py-1.5 pr-8 pl-[calc(1.75rem+var(--nivel)*1rem)] text-left text-sm transition-colors",
          elegida ? "border-brand bg-brand-soft font-medium" : "border-transparent hover:bg-muted",
        )}
      >
        <Punto clase={acc.color?.(carpeta)} className="size-2.5" />
        <span className="truncate">{carpeta.nombre}</span>
        <span className="ml-auto flex-none text-xs text-muted-foreground tabular-nums">{acc.cuentas[carpeta.id] ?? 0}</span>
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label={`Opciones de «${carpeta.nombre}»`} className="absolute top-1/2 right-1 size-6 -translate-y-1/2 opacity-0 group-hover/carpeta:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100 [@media(hover:none)]:opacity-100">
            <EllipsisIcon className="size-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onSelect={() => acc.onNuevaDentro(carpeta.id)}>
            <FolderPlusIcon /> Nueva subcarpeta
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => acc.onRenombrar(carpeta.id)}>
            <PencilIcon /> Renombrar
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <FolderInputIcon /> Mover a
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="max-h-80 w-56 overflow-y-auto">
              {carpeta.padreId && (
                <>
                  <DropdownMenuItem onSelect={() => acc.onMover(carpeta.id, {})}>
                    <ArrowUpToLineIcon /> Arriba del todo
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <OpcionesCarpeta carpetas={carpetas} excluir={noValidas} color={acc.color} onElegir={(padreId) => acc.onMover(carpeta.id, { padreId })} />
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onSelect={() => acc.onBorrar(carpeta)}>
            <Trash2Icon /> Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </li>
  )
}

/** La línea de «Nueva carpeta», que también recibe lo que se suelta para sacarlo arriba del todo. */
function FilaRaiz({ arrastrando, encima, children }: { arrastrando: boolean; encima: boolean; children: React.ReactNode }) {
  const { setNodeRef } = useDroppable({ id: RAIZ })
  return (
    <li ref={setNodeRef} className={cn("rounded-lg px-1 pt-0.5", encima && "bg-brand-soft ring-1 ring-brand")}>
      {arrastrando ? <p className="px-2 py-1.5 text-xs text-muted-foreground">Suelta aquí para sacarla arriba del todo</p> : children}
    </li>
  )
}

/**
 * Carpetas en árbol: cada una con sus subcarpetas (plegables), lo que lleva dentro y su menú (nueva
 * subcarpeta, renombrar, mover a, eliminar). Se arrastran para cambiar el orden (soltando encima o
 * debajo de otra) o para meterlas dentro de otra (soltando en el centro). La lógica, en `lib/carpetas.ts`.
 */
export function ArbolCarpetas<C extends CarpetaArbol>({
  carpetas,
  actual,
  cuentas,
  color,
  plegadas,
  onPlegadas,
  creando,
  onCreando,
  onElegir,
  onCrear,
  onRenombrar,
  onMover,
  onBorrar,
}: {
  carpetas: C[]
  actual: string
  /** Cuánto lleva dentro cada carpeta, por id. */
  cuentas: Record<string, number>
  color?: ColorCarpeta<C>
  plegadas: string[]
  onPlegadas: (ids: string[]) => void
  /** La carpeta que se está escribiendo: arriba del todo o dentro de otra. */
  creando: { padreId?: string } | null
  onCreando: (creando: { padreId?: string } | null) => void
  onElegir: (id: string) => void
  onCrear: (nombre: string, padreId?: string) => C
  onRenombrar: (id: string, nombre: string) => void
  onMover: (id: string, destino: DestinoCarpeta) => boolean
  onBorrar: (c: C) => void
}) {
  const [renombrando, setRenombrando] = React.useState<string | null>(null)
  const [arrastrada, setArrastrada] = React.useState<string | null>(null)
  const [soltar, setSoltar] = React.useState<{ id: string; zona: Zona } | null>(null)
  const sensores = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))
  // Un id estable: sin él, dnd-kit numera sus textos de ayuda distinto en el servidor y en el navegador.
  const dndId = React.useId()

  const abiertas = new Set(carpetas.map((c) => c.id).filter((id) => !plegadas.includes(id)))
  const filas = carpetasEnArbol(carpetas, abiertas)
  const desplegar = (id: string) => onPlegadas(plegadas.filter((p) => p !== id))

  const crear = (nombre: string) => {
    const c = onCrear(nombre, creando?.padreId)
    onCreando(null)
    onElegir(c.id)
    toast.success(`Carpeta «${c.nombre}» creada`)
  }
  const mover = (id: string, destino: DestinoCarpeta) => {
    if (!onMover(id, destino)) return toast.error("Una carpeta no puede ir dentro de sí misma")
    if (destino.padreId) desplegar(destino.padreId)
  }

  // ── Arrastrar: manda el puntero (`pointerWithin`): la fila de debajo y, dentro de ella, si cae encima, dentro o debajo ──
  const zonaDe = (e: DragMoveEvent | DragOverEvent | DragEndEvent): { id: string; zona: Zona } | null => {
    const { over, active, activatorEvent, delta } = e
    if (!over || !(activatorEvent instanceof MouseEvent)) return null
    const id = String(over.id)
    if (id === RAIZ) return { id, zona: "dentro" }
    if (conDescendientes(carpetas, String(active.id)).has(id)) return null
    const posicion = (activatorEvent.clientY + delta.y - over.rect.top) / over.rect.height
    return { id, zona: posicion < 0.3 ? "antes" : posicion > 0.7 ? "despues" : "dentro" }
  }
  const terminar = () => {
    setArrastrada(null)
    setSoltar(null)
  }
  const alSoltar = (e: DragEndEvent) => {
    const destino = zonaDe(e)
    const id = String(e.active.id)
    terminar()
    if (!destino) return
    if (destino.id === RAIZ) return mover(id, {})
    const sobre = carpetas.find((c) => c.id === destino.id)
    if (!sobre) return
    if (destino.zona === "dentro") return mover(id, { padreId: sobre.id })
    if (destino.zona === "antes") return mover(id, { padreId: sobre.padreId, antesDe: sobre.id })
    const hermanas = hijasDe(carpetas, sobre.padreId).filter((c) => c.id !== id)
    mover(id, { padreId: sobre.padreId, antesDe: hermanas[hermanas.findIndex((c) => c.id === sobre.id) + 1]?.id })
  }

  const acc: AccionesArbol<C> = {
    actual,
    color,
    cuentas,
    onElegir,
    onPlegar: (id) => onPlegadas(plegadas.includes(id) ? plegadas.filter((p) => p !== id) : [...plegadas, id]),
    onNuevaDentro: (padreId) => {
      desplegar(padreId)
      onCreando({ padreId })
    },
    onRenombrar: setRenombrando,
    onMover: mover,
    onBorrar,
  }

  // La subcarpeta nueva se escribe debajo de la última que se ve dentro de su madre.
  const dentroDeLaMadre = creando?.padreId ? conDescendientes(carpetas, creando.padreId) : null
  const ultimaDentro = dentroDeLaMadre ? filas.findLast((f) => dentroDeLaMadre.has(f.carpeta.id))?.carpeta.id : undefined
  const nivelNueva = (filas.find((f) => f.carpeta.id === creando?.padreId)?.nivel ?? -1) + 1
  const nombreArrastrada = carpetas.find((c) => c.id === arrastrada)?.nombre

  return (
    <DndContext id={dndId} sensors={sensores} collisionDetection={pointerWithin} onDragStart={(e) => setArrastrada(String(e.active.id))} onDragMove={(e) => setSoltar(zonaDe(e))} onDragOver={(e) => setSoltar(zonaDe(e))} onDragEnd={alSoltar} onDragCancel={terminar}>
      <ul className="grid grid-cols-1 gap-0.5">
        {filas.map(({ carpeta, nivel, tieneHijas }) => (
          <React.Fragment key={carpeta.id}>
            {renombrando === carpeta.id ? (
              <li className="px-1 py-0.5">
                <NombreEditable
                  inicial={carpeta.nombre}
                  onGuardar={(nombre) => {
                    onRenombrar(carpeta.id, nombre)
                    setRenombrando(null)
                  }}
                  onCancelar={() => setRenombrando(null)}
                />
              </li>
            ) : (
              <FilaCarpeta carpeta={carpeta} carpetas={carpetas} nivel={nivel} tieneHijas={tieneHijas} plegada={plegadas.includes(carpeta.id)} soltar={soltar?.id === carpeta.id ? soltar.zona : null} acc={acc} />
            )}
            {creando?.padreId && ultimaDentro === carpeta.id && (
              <li className="py-0.5 pr-1">
                <NombreEditable inicial="" onGuardar={crear} onCancelar={() => onCreando(null)} style={sangria(nivelNueva)} className="ml-[calc(1.5rem+var(--nivel)*1rem)] w-[calc(100%-1.5rem-var(--nivel)*1rem)]" />
              </li>
            )}
          </React.Fragment>
        ))}
        <FilaRaiz arrastrando={arrastrada !== null} encima={soltar?.id === RAIZ}>
          {creando && !creando.padreId ? (
            <NombreEditable inicial="" onGuardar={crear} onCancelar={() => onCreando(null)} />
          ) : (
            <button type="button" onClick={() => onCreando({})} className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
              <FolderPlusIcon className="size-4" /> Nueva carpeta
            </button>
          )}
        </FilaRaiz>
      </ul>
      <DragOverlay dropAnimation={null}>{nombreArrastrada && <span className="inline-flex items-center gap-2 rounded-lg border bg-card px-2.5 py-1.5 text-sm font-medium shadow-pop">{nombreArrastrada}</span>}</DragOverlay>
    </DndContext>
  )
}
