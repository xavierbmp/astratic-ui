"use client"

import * as React from "react"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { ChevronsLeftIcon, ChevronsRightIcon, EllipsisIcon, PlusIcon } from "lucide-react"
import { cn } from "cn"
import { statusDotClass, type StatusTone } from "@/lib/status"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type KanbanColumn = { id: string; title: string; tone?: StatusTone; meta?: React.ReactNode }
export type KanbanItem = { id: string; columnId: string }

export function Kanban<T extends KanbanItem>({
  columns,
  items,
  onChange,
  renderCard,
  onCardClick,
  openId,
  className,
  emptyColumn = "Sin registros",
  storageKey,
  defaultCollapsed = [],
  columnMenu,
  onColumnTitleClick,
  onAddColumn,
  addColumnLabel = "Añadir columna",
  density = "default",
}: {
  columns: KanbanColumn[]
  items: T[]
  onChange: (next: T[]) => void
  renderCard: (item: T, state: { dragging: boolean }) => React.ReactNode
  onCardClick?: (item: T) => void
  /** Tarjeta del registro abierto en la ficha: se marca como lo seleccionado. */
  openId?: string | null
  className?: string
  emptyColumn?: React.ReactNode
  storageKey?: string
  defaultCollapsed?: string[]
  /** Opciones propias de cada columna (editar, mover, borrar…), que se suman al menú «…». */
  columnMenu?: (column: KanbanColumn, index: number) => React.ReactNode
  /** Pulsar el título de una columna abre su configuración. */
  onColumnTitleClick?: (column: KanbanColumn) => void
  /** Si se pasa, al final hay una columna estrecha para crear otra. */
  onAddColumn?: () => void
  addColumnLabel?: string
  /**
   * `compact` para tableros con muchas tarjetas: columnas más estrechas y tarjetas de dos o tres
   * líneas, sin monograma. Caben el doble de registros a la vista.
   */
  density?: "default" | "compact"
}) {
  const compacto = density === "compact"
  const dndId = React.useId()
  const [activeId, setActiveId] = React.useState<string | null>(null)
  const [storedCollapsed, setStoredCollapsed] = useLocalStorage<string[]>(`kanban:${storageKey ?? "_"}`, defaultCollapsed)
  const [localCollapsed, setLocalCollapsed] = React.useState<string[]>(defaultCollapsed)
  const collapsed = storageKey ? storedCollapsed : localCollapsed
  const setCollapsed = storageKey ? setStoredCollapsed : setLocalCollapsed
  const toggleCollapsed = (id: string) =>
    setCollapsed(collapsed.includes(id) ? collapsed.filter((c) => c !== id) : [...collapsed, id])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const byColumn = React.useMemo(() => {
    const map = new Map<string, T[]>()
    columns.forEach((c) => map.set(c.id, []))
    items.forEach((it) => map.get(it.columnId)?.push(it))
    return map
  }, [columns, items])

  const findColumn = (id: string) =>
    columns.some((c) => c.id === id) ? id : items.find((i) => i.id === id)?.columnId

  const onDragStart = (e: DragStartEvent) => setActiveId(String(e.active.id))

  const onDragOver = (e: DragOverEvent) => {
    const { active, over } = e
    if (!over) return
    const from = findColumn(String(active.id))
    const to = findColumn(String(over.id))
    if (!from || !to || from === to) return
    onChange(items.map((it) => (it.id === active.id ? { ...it, columnId: to } : it)))
  }

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e
    setActiveId(null)
    if (!over) return
    const col = findColumn(String(over.id))
    if (!col) return
    const colItems = items.filter((i) => i.columnId === col)
    const oldIndex = colItems.findIndex((i) => i.id === active.id)
    const newIndex = colItems.findIndex((i) => i.id === over.id)
    if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return
    const reordered = arrayMove(colItems, oldIndex, newIndex)
    const others = items.filter((i) => i.columnId !== col)
    onChange([...others, ...reordered])
  }

  const activeItem = activeId ? items.find((i) => i.id === activeId) : null

  return (
    <DndContext
      id={dndId}
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <div className={cn("flex h-full min-h-0 gap-2.5 overflow-x-auto p-3", className)}>
        {columns.map((col, index) => {
          const colItems = byColumn.get(col.id) ?? []
          if (collapsed.includes(col.id)) {
            return <CollapsedColumn key={col.id} column={col} count={colItems.length} onExpand={() => toggleCollapsed(col.id)} />
          }
          return (
            <KanbanColumnView
              key={col.id}
              column={col}
              count={colItems.length}
              empty={colItems.length === 0 ? emptyColumn : null}
              onCollapse={() => toggleCollapsed(col.id)}
              menu={columnMenu?.(col, index)}
              compact={compacto}
              onTitleClick={onColumnTitleClick ? () => onColumnTitleClick(col) : undefined}
            >
              <SortableContext items={colItems.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                {colItems.map((item) => (
                  <SortableCard key={item.id} id={item.id} open={item.id === openId} compact={compacto} onClick={onCardClick ? () => onCardClick(item) : undefined}>
                    {renderCard(item, { dragging: item.id === activeId })}
                  </SortableCard>
                ))}
              </SortableContext>
            </KanbanColumnView>
          )
        })}
        {onAddColumn && (
          <button
            type="button"
            onClick={onAddColumn}
            title={addColumnLabel}
            className="flex w-10 flex-none flex-col items-center gap-2.5 rounded-xl border border-dashed pt-2.5 text-muted-foreground transition-colors outline-none hover:bg-muted/60 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <PlusIcon className="size-4" />
            <span className="text-[13px] font-medium [writing-mode:vertical-rl]">{addColumnLabel}</span>
          </button>
        )}
      </div>
      <DragOverlay dropAnimation={{ duration: 180, easing: "cubic-bezier(0.2, 0, 0, 1)" }}>
        {activeItem ? (
          <div className={cn("rotate-1 cursor-grabbing rounded-lg border bg-card shadow-pop", compacto ? "px-2.5 py-2" : "p-3")}>
            {renderCard(activeItem, { dragging: true })}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

function CountPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border bg-background px-1.5 text-xs font-medium tabular-nums">{children}</span>
  )
}

function KanbanColumnView({
  column,
  count,
  empty,
  onCollapse,
  menu,
  onTitleClick,
  compact,
  children,
}: {
  column: KanbanColumn
  count: number
  empty: React.ReactNode
  onCollapse: () => void
  menu?: React.ReactNode
  compact?: boolean
  onTitleClick?: () => void
  children: React.ReactNode
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id })
  return (
    <div
      ref={setNodeRef}
      data-slot="kanban-column"
      className={cn(
        "flex flex-1 flex-col rounded-xl bg-muted/60 p-1.5 transition-colors",
        compact ? "min-w-44 basis-44" : "min-w-52 basis-52",
        isOver && "bg-brand-soft ring-1 ring-brand/40"
      )}
    >
      <div className="px-1.5 pt-1 pb-2">
        <div className="flex items-center gap-1.5">
          <span className={cn("size-2 flex-none rounded-full", statusDotClass[column.tone ?? "neutral"])} />
          {onTitleClick ? (
            <button type="button" onClick={onTitleClick} title={`Configurar ${column.title}`} className="truncate rounded-sm text-left text-[13px] font-semibold outline-none hover:underline hover:underline-offset-2 focus-visible:ring-2 focus-visible:ring-ring/50">
              {column.title}
            </button>
          ) : (
            <span className="truncate text-[13px] font-semibold">{column.title}</span>
          )}
          <CountPill>{count}</CountPill>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-xs" aria-label={`Opciones de ${column.title}`} className="ml-auto text-muted-foreground">
                <EllipsisIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={onCollapse}>
                <ChevronsLeftIcon /> Plegar columna
              </DropdownMenuItem>
              {menu && (
                <>
                  <DropdownMenuSeparator />
                  {menu}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {column.meta && (
          <div className="mt-0.5 pl-3.5 text-xs font-medium tabular-nums text-muted-foreground">{column.meta}</div>
        )}
      </div>
      <div className={cn("flex min-h-16 flex-1 flex-col", compact ? "gap-1" : "gap-1.5")}>
        {children}
        {empty && (
          <div className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">{empty}</div>
        )}
      </div>
    </div>
  )
}

function CollapsedColumn({ column, count, onExpand }: { column: KanbanColumn; count: number; onExpand: () => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id })
  return (
    <div
      ref={setNodeRef}
      data-slot="kanban-column"
      data-collapsed
      className={cn(
        "flex w-10 flex-none flex-col items-center gap-2.5 rounded-xl bg-muted/60 pt-1.5 transition-colors",
        isOver && "bg-brand-soft ring-1 ring-brand/40"
      )}
    >
      <Button variant="ghost" size="icon-xs" aria-label={`Desplegar ${column.title}`} onClick={onExpand} className="text-muted-foreground">
        <ChevronsRightIcon />
      </Button>
      <span className={cn("size-2 rounded-full", statusDotClass[column.tone ?? "neutral"])} />
      <CountPill>{count}</CountPill>
      <span className="text-[13px] font-semibold [writing-mode:vertical-rl]">{column.title}</span>
    </div>
  )
}

function SortableCard({ id, open, compact, onClick, children }: { id: string; open?: boolean; compact?: boolean; onClick?: () => void; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={cn(
        "rounded-lg border bg-card shadow-xs outline-none hover:border-foreground/20 focus-visible:ring-2 focus-visible:ring-ring/50",
        compact ? "px-2.5 py-2" : "p-3",
        onClick ? "cursor-pointer" : "cursor-grab",
        open && "border-brand bg-brand-soft hover:border-brand",
        isDragging && "opacity-40"
      )}
    >
      {children}
    </div>
  )
}
