"use client"

import * as React from "react"
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

/**
 * Dónde se suelta una fila: en qué grupo y sobre cuál. En su mismo grupo ocupa el sitio de `sobre`
 * (como `arrayMove`); en otro, entra delante de `sobre`. Sin `sobre`, al final del grupo.
 */
export type Soltar = { id: string; desde: string; hacia: string; sobre?: string }

// Una fila puede salir en varios grupos (una tarea con dos etiquetas): su id de arrastre lleva el grupo.
const SEP = "::"
const claveDe = (grupoId: string, id: string) => `${grupoId}${SEP}${id}`
const partes = (clave: string) => {
  const i = clave.indexOf(SEP)
  return { grupoId: clave.slice(0, i), id: clave.slice(i + SEP.length) }
}
const FIN = "__fin"

/**
 * Filas que se arrastran, al estilo de Notion: para ordenar a mano dentro de un grupo o para
 * moverlas a otro (lo que cambia su valor). Envuelve la lista o la tabla; cada grupo va en
 * `GrupoArrastrable` y cada fila usa `useFilaArrastrable`.
 */
export function ArrastreFilas({ onSoltar, children }: { onSoltar: (s: Soltar) => void; children: React.ReactNode }) {
  const id = React.useId()
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )
  const alSoltar = (e: DragEndEvent) => {
    if (!e.over) return
    const origen = partes(String(e.active.id))
    const destino = String(e.over.id)
    if (destino.endsWith(`${SEP}${FIN}`)) {
      onSoltar({ id: origen.id, desde: origen.grupoId, hacia: partes(destino).grupoId })
      return
    }
    const sobre = partes(destino)
    if (sobre.id === origen.id && sobre.grupoId === origen.grupoId) return
    onSoltar({ id: origen.id, desde: origen.grupoId, hacia: sobre.grupoId, sobre: sobre.id })
  }
  return (
    <DndContext id={id} sensors={sensors} collisionDetection={closestCenter} onDragEnd={alSoltar}>
      {children}
    </DndContext>
  )
}

/** Un grupo donde se puede soltar, también vacío: su zona del final recibe lo que se suelta debajo de todo. */
export function GrupoArrastrable({ grupoId, ids, children }: { grupoId: string; ids: string[]; children: React.ReactNode }) {
  return <SortableContext items={ids.map((x) => claveDe(grupoId, x))} strategy={verticalListSortingStrategy}>{children}</SortableContext>
}

/** La franja del final de un grupo, para soltar al final o en un grupo vacío. */
export function FinDeGrupo({ grupoId, className, children }: { grupoId: string; className?: string; children?: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: claveDe(grupoId, FIN) })
  return (
    <div ref={setNodeRef} data-over={isOver || undefined} className={className}>
      {children}
    </div>
  )
}

/** Lo que necesita una fila para arrastrarse: su ref, su estilo mientras se mueve y el asa. */
export function useFilaArrastrable(id: string, grupoId: string, desactivada?: boolean) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: claveDe(grupoId, id), disabled: desactivada })
  return {
    ref: setNodeRef,
    style: { transform: CSS.Translate.toString(transform), transition, zIndex: isDragging ? 10 : undefined, position: isDragging ? ("relative" as const) : undefined },
    asa: { ...attributes, ...listeners },
    arrastrando: isDragging,
  }
}
