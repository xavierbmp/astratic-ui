"use client"

import * as React from "react"
import { PlusIcon, TagIcon } from "lucide-react"
import { toast } from "sonner"
import type { StatusTone } from "@/lib/status"
import { Button } from "@/components/ui/button"
import {
  ActiveFilters,
  FilterMenu,
  Toolbar,
  ToolbarSearch,
  ToolbarSpacer,
  ViewSwitcher,
  type ViewKind,
} from "@/components/app/toolbar"
import { Section, SectionBody, SectionHeader } from "@/components/app/section"
import { StatusBadge } from "@/components/app/status-badge"
import { EmptyState } from "@/components/app/states"

type Estado = "activo" | "pendiente" | "vencido"

const estados: Record<Estado, { label: string; tone: StatusTone }> = {
  activo: { label: "Activo", tone: "success" },
  pendiente: { label: "Pendiente", tone: "warning" },
  vencido: { label: "Vencido", tone: "danger" },
}

const categorias = ["Categoría A", "Categoría B", "Categoría C"]
const estadoKeys = Object.keys(estados) as Estado[]

const registros = Array.from({ length: 8 }, (_, i) => ({
  id: `reg-${i + 1}`,
  name: `Registro ${i + 1}`,
  estado: estadoKeys[i % 3],
  categoria: categorias[Math.floor(i / 3)],
}))

const viewLabel: Record<ViewKind, string> = {
  table: "Tabla",
  list: "Lista",
  kanban: "Kanban",
  calendar: "Calendario",
  grid: "Tarjetas",
}

export function ToolbarDemo() {
  const [query, setQuery] = React.useState("")
  const [estado, setEstado] = React.useState<string[]>([])
  const [categoria, setCategoria] = React.useState<string[]>([])
  const [view, setView] = React.useState<ViewKind>("table")

  const q = query.trim().toLowerCase()
  const visibles = registros.filter(
    (r) =>
      (!q || r.name.toLowerCase().includes(q)) &&
      (estado.length === 0 || estado.includes(r.estado)) &&
      (categoria.length === 0 || categoria.includes(r.categoria))
  )

  const chips = [
    ...estado.map((v) => ({
      label: `Estado: ${estados[v as Estado].label}`,
      onRemove: () => setEstado(estado.filter((x) => x !== v)),
    })),
    ...categoria.map((v) => ({ label: `Categoría: ${v}`, onRemove: () => setCategoria([]) })),
  ]
  const clear = () => {
    setEstado([])
    setCategoria([])
  }

  return (
    <div className="flex flex-col gap-3">
      <Toolbar>
        <ToolbarSearch placeholder="Buscar registro…" value={query} onChange={(e) => setQuery(e.target.value)} />
        <FilterMenu
          label="Estado"
          options={estadoKeys.map((k) => ({
            value: k,
            label: estados[k].label,
            count: registros.filter((r) => r.estado === k).length,
          }))}
          value={estado}
          onChange={setEstado}
        />
        <FilterMenu
          label="Categoría"
          icon={TagIcon}
          multiple={false}
          options={categorias.map((c) => ({ value: c, label: c }))}
          value={categoria}
          onChange={setCategoria}
        />
        <ToolbarSpacer />
        <ViewSwitcher views={["table", "list", "kanban"]} value={view} onChange={setView} />
        <Button onClick={() => toast("Aquí se abriría el formulario de alta")}>
          <PlusIcon /> Nuevo registro
        </Button>
      </Toolbar>
      <ActiveFilters chips={chips} onClear={clear} />

      <Section>
        <SectionHeader title="Registros" count={visibles.length} meta={`vista ${viewLabel[view]} · ${visibles.length} de ${registros.length}`} />
        <SectionBody>
          {visibles.length === 0 ? (
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
          ) : (
            <ul className="divide-y">
              {visibles.map((r) => (
                <li key={r.id} className="flex items-center gap-3 px-4 py-2 text-[13.5px]">
                  <span className="flex-1 truncate font-medium">{r.name}</span>
                  <span className="hidden text-xs text-muted-foreground sm:inline">{r.categoria}</span>
                  <StatusBadge tone={estados[r.estado].tone}>{estados[r.estado].label}</StatusBadge>
                </li>
              ))}
            </ul>
          )}
        </SectionBody>
      </Section>
    </div>
  )
}
