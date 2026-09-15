"use client"

import * as React from "react"
import { PlusIcon, UserIcon } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  ActiveFilters,
  FilterMenu,
  Toolbar,
  ToolbarActions,
  ToolbarSearch,
  ViewSwitcher,
  type ViewKind,
} from "@/components/app/toolbar"
import { Section, SectionBody, SectionHeader } from "@/components/app/section"
import { CellPrimary, DataTable, type Column } from "@/components/app/data-table"
import { StatusBadge } from "@/components/app/status-badge"
import { AvatarInitials } from "@/components/app/avatar-initials"
import { EmptyState } from "@/components/app/states"
import { useLocalStorage } from "@/hooks/use-local-storage"
import type { StatusTone } from "@/lib/status"

type Fase = "nuevo" | "en-curso" | "revision" | "cerrado"

const fases: { id: Fase; label: string; tone: StatusTone }[] = [
  { id: "nuevo", label: "Nuevo", tone: "neutral" },
  { id: "en-curso", label: "En curso", tone: "info" },
  { id: "revision", label: "En revisión", tone: "warning" },
  { id: "cerrado", label: "Cerrado", tone: "success" },
]

const responsables = [
  { id: "u1", label: "Usuario 1" },
  { id: "u2", label: "Usuario 2" },
  { id: "u3", label: "Usuario 3" },
]

type Registro = { id: string; n: number; name: string; code: string; category: string; fase: Fase; owner: string }

const registros: Registro[] = Array.from({ length: 12 }, (_, i) => ({
  id: `r${i + 1}`,
  n: i + 1,
  name: `Registro ${i + 1}`,
  code: `REG-${String(i + 1).padStart(4, "0")}`,
  category: `Categoría ${"ABC"[i % 3]}`,
  fase: fases[i % fases.length].id,
  owner: responsables[i % responsables.length].id,
}))

const faseOf = (id: Fase) => fases.find((f) => f.id === id)!
const ownerOf = (id: string) => responsables.find((r) => r.id === id)?.label ?? id

export function FiltersDemo() {
  const [query, setQuery] = React.useState("")
  const [fase, setFase] = React.useState<string[]>([])
  const [owner, setOwner] = React.useState<string[]>([])
  const [view, setView] = useLocalStorage<ViewKind>("view:docs-filtros", "table")

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return registros.filter(
      (r) =>
        (!q || r.name.toLowerCase().includes(q) || r.code.toLowerCase().includes(q) || r.category.toLowerCase().includes(q)) &&
        (fase.length === 0 || fase.includes(r.fase)) &&
        (owner.length === 0 || owner.includes(r.owner))
    )
  }, [query, fase, owner])

  const chips = [
    ...fase.map((v) => ({ label: `Fase: ${faseOf(v as Fase).label}`, onRemove: () => setFase(fase.filter((x) => x !== v)) })),
    ...owner.map((v) => ({ label: `Responsable: ${ownerOf(v)}`, onRemove: () => setOwner(owner.filter((x) => x !== v)) })),
  ]
  const clear = () => {
    setFase([])
    setOwner([])
  }

  const url = [fase.length > 0 ? `fase=${fase.join(",")}` : null, owner.length > 0 ? `responsable=${owner.join(",")}` : null]
    .filter((p): p is string => p !== null)
    .join("&")

  const columns: Column<Registro>[] = [
    {
      id: "name",
      header: "Registro",
      minWidth: 200,
      sortValue: (r) => r.n,
      cell: (r) => (
        <CellPrimary leading={<AvatarInitials name={r.name} size="md" variant="entity" />} title={r.name} subtitle={r.code} />
      ),
    },
    { id: "category", header: "Categoría", sortValue: (r) => r.category, cell: (r) => <span className="text-muted-foreground">{r.category}</span> },
    {
      id: "owner",
      header: "Responsable",
      sortValue: (r) => ownerOf(r.owner),
      cell: (r) => (
        <span className="inline-flex items-center gap-2">
          <AvatarInitials name={ownerOf(r.owner)} size="sm" /> {ownerOf(r.owner)}
        </span>
      ),
    },
    {
      id: "fase",
      header: "Fase",
      sortValue: (r) => fases.findIndex((f) => f.id === r.fase),
      cell: (r) => <StatusBadge tone={faseOf(r.fase).tone}>{faseOf(r.fase).label}</StatusBadge>,
    },
  ]

  const empty = (
    <EmptyState
      title="Ningún registro coincide"
      description="Prueba con otra búsqueda o quita algún filtro."
      action={
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setQuery("")
            clear()
          }}
        >
          Quitar filtros
        </Button>
      }
    />
  )

  const visibleFases = fases.filter((f) => fase.length === 0 || fase.includes(f.id))

  return (
    <div className="flex flex-col gap-3">
      <Toolbar>
        <ToolbarSearch placeholder="Buscar registro o código…" value={query} onChange={(e) => setQuery(e.target.value)} />
        <FilterMenu
          label="Fase"
          options={fases.map((f) => ({ value: f.id, label: f.label, count: registros.filter((r) => r.fase === f.id).length }))}
          value={fase}
          onChange={setFase}
        />
        <FilterMenu
          label="Responsable"
          icon={UserIcon}
          multiple={false}
          options={responsables.map((o) => ({ value: o.id, label: o.label, count: registros.filter((r) => r.owner === o.id).length }))}
          value={owner}
          onChange={setOwner}
        />
        <ToolbarActions>
          <ViewSwitcher views={["table", "list", "kanban"]} value={view} onChange={setView} />
          <Button onClick={() => toast("Aquí se abriría el formulario de alta")}>
            <PlusIcon /> Nuevo registro
          </Button>
        </ToolbarActions>
      </Toolbar>
      <ActiveFilters chips={chips} onClear={clear} />

      <Section className="min-h-[300px]">
        <SectionHeader title="Registros" count={filtered.length} meta={`${filtered.length} de ${registros.length} registros`} />
        <SectionBody>
          {view === "table" && <DataTable rows={filtered} columns={columns} getRowId={(r) => r.id} emptyState={empty} />}
          {view === "list" &&
            (filtered.length === 0 ? (
              empty
            ) : (
              <ul className="divide-y">
                {filtered.map((r) => (
                  <li key={r.id} className="flex items-center gap-3 px-4 py-2.5">
                    <AvatarInitials name={r.name} size="md" variant="entity" />
                    <span className="grid min-w-0 flex-1 leading-tight">
                      <span className="truncate text-[13.5px] font-semibold">{r.name}</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {r.code} · {r.category} · {ownerOf(r.owner)}
                      </span>
                    </span>
                    <StatusBadge tone={faseOf(r.fase).tone}>{faseOf(r.fase).label}</StatusBadge>
                  </li>
                ))}
              </ul>
            ))}
          {view === "kanban" &&
            (filtered.length === 0 ? (
              empty
            ) : (
              <div className="grid gap-3 p-3 sm:grid-cols-2 lg:grid-cols-4">
                {visibleFases.map((f) => {
                  const items = filtered.filter((r) => r.fase === f.id)
                  return (
                    <div key={f.id} className="flex flex-col gap-2 rounded-lg bg-muted/40 p-2">
                      <div className="flex items-center justify-between px-1">
                        <StatusBadge tone={f.tone}>{f.label}</StatusBadge>
                        <span className="text-xs tabular-nums text-muted-foreground">{items.length}</span>
                      </div>
                      {items.map((r) => (
                        <div key={r.id} className="rounded-md border bg-card px-2.5 py-2 text-xs shadow-xs">
                          <p className="truncate font-semibold">{r.name}</p>
                          <p className="truncate text-muted-foreground">
                            {r.code} · {ownerOf(r.owner)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>
            ))}
        </SectionBody>
      </Section>

      <p className="font-mono text-[11px] text-muted-foreground">
        URL equivalente: /registros{url ? `?${url}` : ""}
      </p>
    </div>
  )
}
