"use client"

import * as React from "react"
import { ArrowDownIcon, ArrowUpIcon, ChevronLeftIcon, ChevronRightIcon, ChevronsUpDownIcon } from "lucide-react"
import { cn } from "cn"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export type Column<T> = {
  id: string
  header: React.ReactNode
  cell: (row: T) => React.ReactNode
  align?: "left" | "right" | "center"
  width?: number | string
  minWidth?: number | string
  sortValue?: (row: T) => string | number | Date | null | undefined
  className?: string
  hideBelow?: "md" | "lg" | "xl" | "2xl"
}

export type Sort = { id: string; dir: "asc" | "desc" }

const hideClass = {
  md: "hidden md:table-cell",
  lg: "hidden lg:table-cell",
  xl: "hidden xl:table-cell",
  "2xl": "hidden 2xl:table-cell",
}

export function DataTable<T>({
  rows,
  columns,
  getRowId,
  selectable = false,
  selected,
  onSelectedChange,
  onRowClick,
  activeId,
  sort,
  onSortChange,
  emptyState,
  loading,
  className,
  rowClassName,
  dense = false,
}: {
  rows: T[]
  columns: Column<T>[]
  getRowId: (row: T) => string
  selectable?: boolean
  selected?: Set<string>
  onSelectedChange?: (next: Set<string>) => void
  onRowClick?: (row: T) => void
  /** Fila del registro abierto en la ficha: se marca como lo seleccionado. */
  activeId?: string | null
  sort?: Sort | null
  onSortChange?: (next: Sort | null) => void
  emptyState?: React.ReactNode
  loading?: boolean
  className?: string
  rowClassName?: (row: T) => string | undefined
  dense?: boolean
}) {
  const [localSort, setLocalSort] = React.useState<Sort | null>(null)
  const activeSort = sort === undefined ? localSort : sort
  const setSort = onSortChange ?? setLocalSort

  const sorted = React.useMemo(() => {
    if (!activeSort) return rows
    const col = columns.find((c) => c.id === activeSort.id)
    if (!col?.sortValue) return rows
    const dir = activeSort.dir === "asc" ? 1 : -1
    return [...rows].sort((a, b) => {
      const va = col.sortValue!(a)
      const vb = col.sortValue!(b)
      if (va == null && vb == null) return 0
      if (va == null) return 1
      if (vb == null) return -1
      if (va instanceof Date || vb instanceof Date) return (new Date(va).getTime() - new Date(vb).getTime()) * dir
      if (typeof va === "number" && typeof vb === "number") return (va - vb) * dir
      return String(va).localeCompare(String(vb), "es") * dir
    })
  }, [rows, columns, activeSort])

  const ids = sorted.map(getRowId)
  const allSelected = selectable && ids.length > 0 && ids.every((id) => selected?.has(id))
  const someSelected = selectable && !allSelected && ids.some((id) => selected?.has(id))

  const toggleAll = () => {
    if (!onSelectedChange) return
    onSelectedChange(allSelected ? new Set() : new Set(ids))
  }
  const toggleOne = (id: string) => {
    if (!onSelectedChange) return
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    onSelectedChange(next)
  }

  const cycleSort = (col: Column<T>) => {
    if (!col.sortValue) return
    if (activeSort?.id !== col.id) setSort({ id: col.id, dir: "asc" })
    else if (activeSort.dir === "asc") setSort({ id: col.id, dir: "desc" })
    else setSort(null)
  }

  const padY = dense ? "py-1.5" : "py-2.5"

  return (
    <div className={cn("relative w-full overflow-auto", loading && "pointer-events-none opacity-60", className)}>
      <Table className="text-[13.5px]">
        <TableHeader className="sticky top-0 z-10 bg-muted/40 backdrop-blur-sm [&_tr]:border-b">
          <TableRow className="hover:bg-transparent">
            {selectable && (
              <TableHead className="w-10 pl-4">
                <Checkbox
                  aria-label="Seleccionar todo"
                  checked={allSelected ? true : someSelected ? "indeterminate" : false}
                  onCheckedChange={toggleAll}
                />
              </TableHead>
            )}
            {columns.map((col) => {
              const isSorted = activeSort?.id === col.id
              return (
                <TableHead
                  key={col.id}
                  style={
                    {
                      width: col.width,
                      "--col-min": typeof col.minWidth === "number" ? `${col.minWidth}px` : col.minWidth,
                    } as React.CSSProperties
                  }
                  className={cn(
                    "h-9 text-xs font-medium text-muted-foreground",
                    col.minWidth !== undefined && "min-w-36 md:min-w-(--col-min)",
                    col.align === "right" && "text-right",
                    col.align === "center" && "text-center",
                    col.hideBelow && hideClass[col.hideBelow],
                    col.className
                  )}
                >
                  {col.sortValue ? (
                    <button
                      type="button"
                      onClick={() => cycleSort(col)}
                      className={cn(
                        "inline-flex items-center gap-1 rounded hover:text-foreground",
                        col.align === "right" && "flex-row-reverse",
                        isSorted && "text-foreground"
                      )}
                    >
                      {col.header}
                      {isSorted ? (
                        activeSort!.dir === "asc" ? <ArrowUpIcon className="size-3" /> : <ArrowDownIcon className="size-3" />
                      ) : (
                        <ChevronsUpDownIcon className="size-3 opacity-50" />
                      )}
                    </button>
                  ) : (
                    col.header
                  )}
                </TableHead>
              )
            })}
            {onRowClick && <TableHead className="hidden w-8 md:table-cell" />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.length === 0 && emptyState && (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={columns.length + (selectable ? 1 : 0) + (onRowClick ? 1 : 0)} className="p-0">
                {emptyState}
              </TableCell>
            </TableRow>
          )}
          {sorted.map((row) => {
            const id = getRowId(row)
            const isSelected = selected?.has(id) ?? false
            const isActive = activeId === id
            return (
              <TableRow
                key={id}
                data-state={isSelected ? "selected" : undefined}
                aria-current={isActive || undefined}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(
                  "group/row",
                  onRowClick && "cursor-pointer",
                  (isSelected || isActive) && "bg-brand-soft hover:bg-brand-soft [&>td:first-child]:shadow-[inset_2px_0_0_var(--brand)]",
                  rowClassName?.(row)
                )}
              >
                {selectable && (
                  <TableCell className={cn("w-10 pl-4", padY)} onClick={(e) => e.stopPropagation()}>
                    <Checkbox aria-label="Seleccionar fila" checked={isSelected} onCheckedChange={() => toggleOne(id)} />
                  </TableCell>
                )}
                {columns.map((col) => (
                  <TableCell
                    key={col.id}
                    className={cn(
                      padY,
                      col.align === "right" && "text-right tabular-nums",
                      col.align === "center" && "text-center",
                      col.hideBelow && hideClass[col.hideBelow],
                      col.className
                    )}
                  >
                    {col.cell(row)}
                  </TableCell>
                ))}
                {onRowClick && (
                  <TableCell className={cn("hidden w-8 pr-3 text-muted-foreground md:table-cell", padY)}>
                    <ChevronRightIcon className="size-4 opacity-0 transition-opacity group-hover/row:opacity-100" />
                  </TableCell>
                )}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

export function CellPrimary({
  title,
  subtitle,
  leading,
}: {
  title: React.ReactNode
  subtitle?: React.ReactNode
  leading?: React.ReactNode
}) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      {leading}
      <div className="grid min-w-0 leading-tight">
        <span className="truncate font-semibold">{title}</span>
        {subtitle && <span className="truncate text-xs text-muted-foreground">{subtitle}</span>}
      </div>
    </div>
  )
}

export function TablePagination({
  page,
  pageCount,
  onPageChange,
  total,
  pageSize,
}: {
  page: number
  pageCount: number
  onPageChange: (p: number) => void
  total?: number
  pageSize?: number
}) {
  const from = total !== undefined && pageSize ? Math.min((page - 1) * pageSize + 1, total) : undefined
  const to = total !== undefined && pageSize ? Math.min(page * pageSize, total) : undefined
  return (
    <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
      <span className="whitespace-nowrap tabular-nums">
        {from !== undefined ? `${from}–${to} de ${total}` : ""}
      </span>
      <div className="flex items-center gap-1 whitespace-nowrap">
        <Button variant="ghost" size="icon-sm" aria-label="Anterior" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          <ChevronLeftIcon />
        </Button>
        <span className="px-1 tabular-nums">
          Página {page} de {Math.max(pageCount, 1)}
        </span>
        <Button variant="ghost" size="icon-sm" aria-label="Siguiente" disabled={page >= pageCount} onClick={() => onPageChange(page + 1)}>
          <ChevronRightIcon />
        </Button>
      </div>
      <span className="hidden w-20 sm:block" aria-hidden />
    </div>
  )
}
