"use client"

// Lo que comparten los menús de la barra de la base: la cabecera con su ayuda y la lista que se
// ordena arrastrando por el asa, como en los menús de Airtable.

import * as React from "react"
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core"
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { CircleHelpIcon, GripVerticalIcon } from "lucide-react"
import { cn } from "cn"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { mover } from "@/lib/base/vistas"

/** «Ordenar por (?)» a la izquierda y lo de la derecha («Copiar desde otra vista»). */
export function CabeceraMenu({ titulo, ayuda, children }: { titulo: string; ayuda?: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 px-4 pt-3 pb-2 text-[13px] text-muted-foreground">
      <span className="flex items-center gap-1">
        {titulo}
        {ayuda && (
          <Tooltip>
            <TooltipTrigger asChild>
              <CircleHelpIcon className="size-3.5" />
            </TooltipTrigger>
            <TooltipContent className="max-w-64">{ayuda}</TooltipContent>
          </Tooltip>
        )}
      </span>
      <span className="ml-auto flex items-center gap-3">{children}</span>
    </div>
  )
}

/** «Copiar desde otra vista»: elige una vista y se copia lo que toca (su filtro, su orden…). */
export function CopiarDeVista<V extends { id: string; nombre: string }>({ vistas, onCopiar }: { vistas: V[]; onCopiar: (v: V) => void }) {
  if (vistas.length === 0) return null
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className="hover:text-foreground">Copiar desde otra vista</button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {vistas.map((v) => (
          <DropdownMenuItem key={v.id} onSelect={() => onCopiar(v)}>{v.nombre}</DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/** Una lista que se reordena arrastrando el asa de cada fila. */
export function ListaOrdenable<X>({ items, clave, onReordenar, children, className }: { items: X[]; clave: (x: X) => string; onReordenar: (items: X[]) => void; children: (x: X, asa: React.ReactNode) => React.ReactNode; className?: string }) {
  const sensores = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }))
  // Un id estable: sin él, dnd-kit numera sus textos de ayuda distinto en el servidor y en el navegador.
  const idContexto = React.useId()
  const ids = items.map(clave)
  const alSoltar = (e: DragEndEvent) => {
    if (e.over) onReordenar(mover(items, ids.indexOf(String(e.active.id)), ids.indexOf(String(e.over.id))))
  }
  return (
    <DndContext id={idContexto} sensors={sensores} collisionDetection={closestCenter} onDragEnd={alSoltar}>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <div className={className}>
          {items.map((x) => (
            <FilaOrdenable key={clave(x)} id={clave(x)}>
              {(asa) => children(x, asa)}
            </FilaOrdenable>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}

function FilaOrdenable({ id, children }: { id: string; children: (asa: React.ReactNode) => React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const asa = (
    <button type="button" aria-label="Arrastrar para ordenar" className="flex size-7 flex-none cursor-grab items-center justify-center rounded-sm text-muted-foreground hover:bg-muted active:cursor-grabbing" {...attributes} {...listeners}>
      <GripVerticalIcon className="size-3.5" />
    </button>
  )
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Translate.toString(transform), transition }} className={cn(isDragging && "relative z-10 opacity-80")}>
      {children(asa)}
    </div>
  )
}
