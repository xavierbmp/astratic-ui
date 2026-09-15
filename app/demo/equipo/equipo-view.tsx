"use client"

import * as React from "react"
import { toast } from "sonner"
import { BriefcaseIcon, MailIcon, PhoneIcon, PlaneIcon, PlusIcon, UsersIcon } from "lucide-react"
import { fmt } from "@/lib/format"
import { usePageView } from "@/hooks/use-page-view"
import { Button } from "@/components/ui/button"
import { PageBody, PageHeader } from "@/components/app/page-header"
import { KpiCard, KpiRow } from "@/components/app/kpi"
import { Section, SectionBody, SectionHeader } from "@/components/app/section"
import { FilterMenu, Toolbar, ToolbarSearch, ToolbarSpacer, ViewSwitcher } from "@/components/app/toolbar"
import { CellPrimary, DataTable, type Column } from "@/components/app/data-table"
import { StatusBadge } from "@/components/app/status-badge"
import { AvatarInitials } from "@/components/app/avatar-initials"
import { EmptyState } from "@/components/app/states"
import { DetailBody, DetailField, DetailFields, DetailFooter, DetailHeader, DetailSection, DetailSheet } from "@/components/app/detail-sheet"

export type Person = { id: string; name: string; role: string; area: string; email: string; status: "activo" | "ausente" | "onboarding"; since: string }

const statusMeta = {
  activo: { label: "Activo", tone: "success" as const },
  ausente: { label: "Ausente", tone: "warning" as const },
  onboarding: { label: "Onboarding", tone: "info" as const },
}

export function EquipoView({ people }: { people: Person[] }) {
  const areas = React.useMemo(() => Array.from(new Set(people.map((p) => p.area))), [people])
  const { view, setView, views } = usePageView("demo-equipo", ["table", "grid"])
  const [query, setQuery] = React.useState("")
  const [areaFilter, setAreaFilter] = React.useState<string[]>([])
  const [openId, setOpenId] = React.useState<string | null>(null)

  const filtered = people.filter((p) => (!query || p.name.toLowerCase().includes(query.toLowerCase()) || p.role.toLowerCase().includes(query.toLowerCase())) && (areaFilter.length === 0 || areaFilter.includes(p.area)))
  const open = people.find((p) => p.id === openId) ?? null

  const columns: Column<Person>[] = [
    { id: "name", header: "Persona", minWidth: 220, sortValue: (p) => p.name, cell: (p) => <CellPrimary leading={<AvatarInitials name={p.name} />} title={p.name} subtitle={p.role} /> },
    { id: "area", header: "Área", sortValue: (p) => p.area, cell: (p) => <span className="text-muted-foreground">{p.area}</span> },
    { id: "email", header: "Email", hideBelow: "lg", cell: (p) => <span className="text-muted-foreground">{p.email}</span> },
    { id: "status", header: "Estado", cell: (p) => <StatusBadge tone={statusMeta[p.status].tone} dot>{statusMeta[p.status].label}</StatusBadge> },
    { id: "since", header: "Alta", align: "right", hideBelow: "md", sortValue: (p) => new Date(p.since), cell: (p) => <span className="text-xs text-muted-foreground">{p.since.slice(0, 4)}</span> },
  ]

  return (
    <PageBody>
      <PageHeader title="Equipo" description="Directorio del equipo con su área, rol y estado." />
      <KpiRow>
        <KpiCard icon={UsersIcon} label="Personas" value={people.length} hint={`${areas.length} áreas`} />
        <KpiCard icon={PlaneIcon} label="Ausentes hoy" value={people.filter((p) => p.status === "ausente").length} />
        <KpiCard icon={BriefcaseIcon} label="En onboarding" value={people.filter((p) => p.status === "onboarding").length} />
      </KpiRow>
      <Toolbar>
        <ToolbarSearch placeholder="Buscar persona o rol…" value={query} onChange={(e) => setQuery(e.target.value)} />
        <FilterMenu label="Área" options={areas.map((a) => ({ value: a, label: a, count: people.filter((p) => p.area === a).length }))} value={areaFilter} onChange={setAreaFilter} />
        <ToolbarSpacer />
        <ViewSwitcher views={views} value={view} onChange={setView} />
        <Button onClick={() => toast("Aquí se daría de alta a una persona")}><PlusIcon /> Nueva persona</Button>
      </Toolbar>

      <Section className="min-h-[480px]">
        <SectionHeader icon={UsersIcon} title="Directorio" count={filtered.length} />
        <SectionBody>
          {filtered.length === 0 ? (
            <EmptyState title="Nadie coincide" description="Prueba con otro nombre o quita el filtro de área." />
          ) : view === "table" ? (
            <DataTable rows={filtered} columns={columns} getRowId={(p) => p.id} onRowClick={(p) => setOpenId(p.id)} />
          ) : (
            <ul className="grid gap-3 p-4 [grid-template-columns:repeat(auto-fill,minmax(220px,1fr))]">
              {filtered.map((p) => (
                <li key={p.id}>
                  <button type="button" onClick={() => setOpenId(p.id)} className="flex w-full flex-col gap-3 rounded-lg border bg-card p-4 text-left shadow-xs transition-shadow hover:shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                      <AvatarInitials name={p.name} size="lg" />
                      <StatusBadge tone={statusMeta[p.status].tone}>{statusMeta[p.status].label}</StatusBadge>
                    </div>
                    <span className="grid leading-tight">
                      <span className="text-[13.5px] font-semibold">{p.name}</span>
                      <span className="text-xs text-muted-foreground">{p.role} · {p.area}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </SectionBody>
      </Section>

      <DetailSheet open={open !== null} onOpenChange={(o) => !o && setOpenId(null)} width={400}>
        {open && (
          <>
            <DetailHeader leading={<AvatarInitials name={open.name} size="lg" />} title={open.name} subtitle={`${open.role} · ${open.area}`} status={<StatusBadge tone={statusMeta[open.status].tone}>{statusMeta[open.status].label}</StatusBadge>} />
            <DetailBody>
              <DetailSection title="Contacto">
                <DetailFields>
                  <DetailField label="Email"><a href={`mailto:${open.email}`} className="inline-flex items-center gap-1.5 text-brand hover:underline"><MailIcon className="size-3.5" /> {open.email}</a></DetailField>
                  <DetailField label="Teléfono"><span className="inline-flex items-center gap-1.5"><PhoneIcon className="size-3.5 text-muted-foreground" /> 600 000 000</span></DetailField>
                </DetailFields>
              </DetailSection>
              <DetailSection title="Puesto">
                <DetailFields>
                  <DetailField label="Área">{open.area}</DetailField>
                  <DetailField label="Rol">{open.role}</DetailField>
                  <DetailField label="Alta">{fmt.dateLong(open.since)}</DetailField>
                </DetailFields>
              </DetailSection>
            </DetailBody>
            <DetailFooter>
              <Button variant="ghost" onClick={() => setOpenId(null)}>Cerrar</Button>
              <Button variant="outline" onClick={() => toast("Aquí se editaría la ficha")}>Editar ficha</Button>
            </DetailFooter>
          </>
        )}
      </DetailSheet>
    </PageBody>
  )
}
