"use client"

import * as React from "react"
import { toast } from "sonner"
import { fmt } from "@/lib/format"
import type { StatusTone } from "@/lib/status"
import { CellPrimary, DataTable, TablePagination, type Column, type Sort } from "@/components/app/data-table"
import { Section, SectionBody, SectionFooter, SectionHeader } from "@/components/app/section"
import { StatusBadge } from "@/components/app/status-badge"
import { AvatarInitials } from "@/components/app/avatar-initials"
import { EmptyState } from "@/components/app/states"

type Row = {
  id: string
  name: string
  code: string
  owner: string
  status: { label: string; tone: StatusTone }
  value: number
}

const statuses: Row["status"][] = [
  { label: "Activo", tone: "success" },
  { label: "Pendiente", tone: "warning" },
  { label: "Vencido", tone: "danger" },
  { label: "Borrador", tone: "neutral" },
]

const values = [18400, 7250, 42000, 12900, 31500, 5600, 27800, 9900]

const rows: Row[] = Array.from({ length: 8 }, (_, i) => ({
  id: `reg-${i + 1}`,
  name: `Registro ${i + 1}`,
  code: `REG-${String(i + 1).padStart(4, "0")}`,
  owner: `Usuario ${(i % 3) + 1}`,
  status: statuses[i % 4],
  value: values[i],
}))

const columns: Column<Row>[] = [
  {
    id: "name",
    header: "Registro",
    minWidth: 220,
    sortValue: (r) => r.name,
    cell: (r) => (
      <CellPrimary
        leading={<AvatarInitials name={r.name} size="md" variant="entity" />}
        title={r.name}
        subtitle={r.code}
      />
    ),
  },
  {
    id: "owner",
    header: "Responsable",
    hideBelow: "md",
    cell: (r) => (
      <span className="inline-flex items-center gap-2">
        <AvatarInitials name={r.owner} size="sm" /> {r.owner}
      </span>
    ),
  },
  {
    id: "status",
    header: "Estado",
    cell: (r) => (
      <StatusBadge tone={r.status.tone} dot>
        {r.status.label}
      </StatusBadge>
    ),
  },
  {
    id: "value",
    header: "Valor",
    align: "right",
    sortValue: (r) => r.value,
    cell: (r) => <span className="font-semibold">{fmt.eur(r.value)}</span>,
  },
]

const PAGE_SIZE = 5

export function DataTableDemo() {
  const [selected, setSelected] = React.useState<Set<string>>(new Set())
  const [sort, setSort] = React.useState<Sort | null>(null)
  const [page, setPage] = React.useState(1)

  const sorted = React.useMemo(() => {
    if (!sort) return rows
    const col = columns.find((c) => c.id === sort.id)
    if (!col?.sortValue) return rows
    const dir = sort.dir === "asc" ? 1 : -1
    return [...rows].sort((a, b) => {
      const va = col.sortValue!(a)
      const vb = col.sortValue!(b)
      if (typeof va === "number" && typeof vb === "number") return (va - vb) * dir
      return String(va).localeCompare(String(vb), "es") * dir
    })
  }, [sort])

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  const paged = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="flex flex-col gap-3">
      <Section>
        <SectionHeader title="Registros" count={rows.length} />
        <SectionBody>
          <DataTable
            rows={paged}
            columns={columns}
            getRowId={(r) => r.id}
            selectable
            selected={selected}
            onSelectedChange={setSelected}
            sort={sort}
            onSortChange={(next) => {
              setSort(next)
              setPage(1)
            }}
            onRowClick={(r) => toast(`Aquí se abriría el detalle de ${r.name}`)}
            emptyState={<EmptyState title="Aún no hay registros" description="Crea el primero con «Nuevo registro»." />}
          />
        </SectionBody>
        <SectionFooter>
          <TablePagination page={page} pageCount={pageCount} onPageChange={setPage} total={rows.length} pageSize={PAGE_SIZE} />
        </SectionFooter>
      </Section>
      <p className="text-xs text-muted-foreground">
        <span className="font-medium text-foreground">Seleccionados ({selected.size}):</span>{" "}
        {selected.size > 0 ? [...selected].join(", ") : "ninguno"}
      </p>
    </div>
  )
}
