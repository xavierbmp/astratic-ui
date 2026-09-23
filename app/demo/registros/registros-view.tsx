"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  ActivityIcon,
  ArchiveIcon,
  ArrowRightIcon,
  BanknoteIcon,
  CalendarClockIcon,
  CopyIcon,
  DownloadIcon,
  EllipsisIcon,
  GaugeIcon,
  KanbanSquareIcon,
  LayersIcon,
  PaperclipIcon,
  PlusIcon,
  SendIcon,
  Trash2Icon,
  TrophyIcon,
  UserCogIcon,
  UserIcon,
  UsersIcon,
} from "lucide-react"
import { cn } from "cn"
import { fmt } from "@/lib/format"
import { statusTextClass } from "@/lib/status"
import { demoActivity, recordStatus, stages, type DemoRecord, type Stage } from "@/lib/demo-data"
import { usePageView } from "@/hooks/use-page-view"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PageBody, PageHeader } from "@/components/app/page-header"
import { KpiCard, KpiRow } from "@/components/app/kpi"
import { Section, SectionBody, SectionFooter, SectionHeader } from "@/components/app/section"
import { WorkGrid } from "@/components/app/work-grid"
import { ActiveFilters, FilterMenu, Toolbar, ToolbarActions, ToolbarSearch, ViewSwitcher } from "@/components/app/toolbar"
import { CellPrimary, DataTable, TablePagination, type Column } from "@/components/app/data-table"
import { RecordList, RecordListItem } from "@/components/app/record-list"
import { Kanban } from "@/components/app/kanban"
import { BulkBar } from "@/components/app/bulk-bar"
import { StatusBadge } from "@/components/app/status-badge"
import { AvatarInitials, AvatarStack } from "@/components/app/avatar-initials"
import { EmptyState } from "@/components/app/states"
import { InsightList, InsightStat, InsightsPanel } from "@/components/app/insights-panel"
import { DetailBody, DetailField, DetailFields, DetailFooter, DetailHeader, DetailMeta, DetailSection, DetailSectionAction, DetailSheet, RecordPager } from "@/components/app/detail-sheet"
import { usePanelFicha } from "@/components/app/detail-panel"
import { RecordActions, type BotonAccion, type OperacionBoton } from "@/components/app/record-actions"
import { InlineField, InlineTitle, type ValorInline } from "@/components/app/inline-field"
import { ConfirmDialog } from "@/components/app/confirm-dialog"

const PAGE_SIZE = 10

export function RegistrosView({
  initialRecords,
  initialOpenId = null,
}: {
  initialRecords: DemoRecord[]
  initialOpenId?: string | null
}) {
  const [records, setRecords] = React.useState<DemoRecord[]>(initialRecords)
  const { view, setView, views } = usePageView("demo-registros", ["table", "list", "kanban"])
  const [query, setQuery] = React.useState("")
  const [stageFilter, setStageFilter] = React.useState<string[]>([])
  const [statusFilter, setStatusFilter] = React.useState<string[]>([])
  const [ownerFilter, setOwnerFilter] = React.useState<string[]>([])
  const [selected, setSelected] = React.useState<Set<string>>(new Set())
  const filterKey = JSON.stringify([query, stageFilter, statusFilter, ownerFilter, view])
  const [pageState, setPageState] = React.useState({ key: filterKey, page: 1 })
  const page = pageState.key === filterKey ? pageState.page : 1
  const setPage = (p: number) => setPageState({ key: filterKey, page: p })
  const [openId, setOpenIdState] = React.useState<string | null>(initialOpenId)
  const setOpenId = (id: string | null) => {
    setOpenIdState(id)
    const url = new URL(window.location.href)
    if (id) url.searchParams.set("registro", id)
    else url.searchParams.delete("registro")
    window.history.replaceState(null, "", url)
  }
  const [confirmDelete, setConfirmDelete] = React.useState(false)

  const owners = React.useMemo(() => Array.from(new Set(records.map((r) => r.owner))).sort(), [records])
  // Ficha en el panel (ajustes del panel) y botones de acción propios de la ficha.
  const panel = usePanelFicha("demo-registros")
  const operaciones = React.useMemo<OperacionBoton[]>(
    () => [
      { id: "stage", grupo: "Cambiar un campo", label: "Fase", opciones: stages.map((s) => ({ value: s.id, label: s.label })) },
      { id: "owner", grupo: "Cambiar un campo", label: "Responsable", opciones: owners.map((o) => ({ value: o, label: o })) },
    ],
    [owners],
  )

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return records.filter(
      (r) =>
        (!q || r.name.toLowerCase().includes(q) || r.code.toLowerCase().includes(q) || r.category.toLowerCase().includes(q)) &&
        (stageFilter.length === 0 || stageFilter.includes(r.stage)) &&
        (statusFilter.length === 0 || statusFilter.includes(r.status)) &&
        (ownerFilter.length === 0 || ownerFilter.includes(r.owner))
    )
  }, [records, query, stageFilter, statusFilter, ownerFilter])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const open = openId ? records.find((r) => r.id === openId) ?? null : null
  // Posición de la ficha en la lista filtrada, para las flechas.
  const posicion = openId ? filtered.findIndex((r) => r.id === openId) : -1
  /** Guarda un campo de la ficha (en la demo, en memoria). */
  const actualizar = (campo: keyof DemoRecord) => async (v: ValorInline) => {
    await new Promise((r) => setTimeout(r, 250))
    setRecords((rs) => rs.map((r) => (r.id === openId ? { ...r, [campo]: v ?? (campo === "tags" ? [] : r[campo]), ...(campo === "stage" ? { columnId: v as Stage } : {}) } : r)))
  }

  /** Aplica un botón de acción al registro abierto (en la demo, en memoria). */
  const ejecutarBoton = async (b: BotonAccion) => {
    await new Promise((r) => setTimeout(r, 250))
    setRecords((rs) =>
      rs.map((r) => {
        if (r.id !== openId) return r
        let n = r
        // Los valores salen de `operaciones`: fases de `stages` y responsables de la lista.
        for (const a of b.acciones) {
          if (a.operacion === "stage" && a.valor) n = { ...n, stage: a.valor as Stage, columnId: a.valor as Stage }
          if (a.operacion === "owner" && a.valor) n = { ...n, owner: a.valor }
        }
        return n
      }),
    )
    toast.success(`«${b.nombre}» aplicado`)
  }

  const totalValue = filtered.reduce((a, r) => a + r.value, 0)
  const won = filtered.filter((r) => r.stage === "ganado")

  const chips = [
    ...stageFilter.map((v) => ({ label: `Fase: ${stages.find((s) => s.id === v)?.label}`, onRemove: () => setStageFilter(stageFilter.filter((x) => x !== v)) })),
    ...statusFilter.map((v) => ({ label: `Estado: ${recordStatus[v as keyof typeof recordStatus].label}`, onRemove: () => setStatusFilter(statusFilter.filter((x) => x !== v)) })),
    ...ownerFilter.map((v) => ({ label: `Responsable: ${v}`, onRemove: () => setOwnerFilter(ownerFilter.filter((x) => x !== v)) })),
  ]
  const clearFilters = () => {
    setStageFilter([])
    setStatusFilter([])
    setOwnerFilter([])
  }

  const advance = (ids: string[]) => {
    setRecords((rs) =>
      rs.map((r) => {
        if (!ids.includes(r.id)) return r
        const i = stages.findIndex((s) => s.id === r.stage)
        const next = stages[Math.min(i + 1, stages.length - 1)].id
        return { ...r, stage: next, columnId: next }
      })
    )
    toast.success(ids.length === 1 ? "Registro avanzado de fase" : `${ids.length} registros avanzados de fase`)
    setSelected(new Set())
  }
  const archive = (ids: string[]) => {
    const previous = records
    setRecords(previous.filter((r) => !ids.includes(r.id)))
    setSelected(new Set())
    setOpenId(null)
    toast.success(ids.length === 1 ? "Registro archivado" : `${ids.length} registros archivados`, {
      action: { label: "Deshacer", onClick: () => setRecords(previous) },
    })
  }

  const columns: Column<DemoRecord>[] = [
    {
      id: "name",
      header: "Registro",
      minWidth: 220,
      sortValue: (r) => r.name,
      cell: (r) => <CellPrimary leading={<AvatarInitials name={r.name} size="md" variant="entity" />} title={r.name} subtitle={r.code} />,
    },
    { id: "category", header: "Categoría", hideBelow: "xl", sortValue: (r) => r.category, cell: (r) => <span className="text-muted-foreground">{r.category}</span> },
    {
      id: "owner",
      header: "Responsable",
      hideBelow: "md",
      sortValue: (r) => r.owner,
      cell: (r) => (
        <span className="inline-flex items-center gap-2">
          <AvatarInitials name={r.owner} size="sm" /> {r.owner}
        </span>
      ),
    },
    {
      id: "stage",
      header: "Fase",
      sortValue: (r) => stages.findIndex((s) => s.id === r.stage),
      cell: (r) => {
        const s = stages.find((x) => x.id === r.stage)!
        return <StatusBadge tone={s.tone}>{s.label}</StatusBadge>
      },
    },
    {
      id: "status",
      header: "Estado",
      hideBelow: "2xl",
      cell: (r) => <StatusBadge tone={recordStatus[r.status].tone} dot>{recordStatus[r.status].label}</StatusBadge>,
    },
    { id: "value", header: "Valor", align: "right", sortValue: (r) => r.value, cell: (r) => <span className="font-semibold">{fmt.eur(r.value)}</span> },
    {
      id: "progress",
      header: "Progreso",
      hideBelow: "2xl",
      width: 140,
      sortValue: (r) => r.progress,
      cell: (r) => (
        <span className="flex items-center gap-2">
          <Progress value={r.progress} className="h-1.5" />
          <span className="w-8 text-right text-xs tabular-nums text-muted-foreground">{r.progress} %</span>
        </span>
      ),
    },
    { id: "updated", header: "Actualizado", align: "right", hideBelow: "lg", sortValue: (r) => new Date(r.updatedAt), cell: (r) => <span className="text-xs text-muted-foreground">{fmt.date(r.updatedAt)}</span> },
  ]

  const emptyState = (
    <EmptyState
      title={query || chips.length ? "Ningún registro coincide" : "Aún no hay registros"}
      description={query || chips.length ? "Prueba con otra búsqueda o quita algún filtro." : "Crea el primero con el botón «Nuevo registro»."}
      action={
        query || chips.length ? (
          <Button variant="outline" size="sm" onClick={() => { setQuery(""); clearFilters() }}>Quitar filtros</Button>
        ) : (
          <Button size="sm" onClick={() => toast("Aquí se abriría el formulario de alta")}><PlusIcon /> Nuevo registro</Button>
        )
      }
    />
  )

  return (
    <PageBody>
      <PageHeader
        title="Registros"
        description="Base de datos de registros y su fase, con vistas de tabla, lista y kanban."
        actions={
          <>
            <Button variant="outline" onClick={() => toast.success("Exportación preparada")}>
              <DownloadIcon /> Exportar
            </Button>
            <Button variant="outline" onClick={() => toast("Aquí se editarían las fases")}>
              <LayersIcon /> Editar fases
            </Button>
          </>
        }
      />

      <KpiRow>
        <KpiCard icon={BanknoteIcon} label="Pipeline abierto" value={fmt.eur(totalValue)} hint={`${filtered.length} registros`} />
        <KpiCard icon={TrophyIcon} label="Ganados" value={won.length} hint={fmt.eur(won.reduce((a, r) => a + r.value, 0))} delta={{ value: 12, label: "vs mes anterior" }} />
        <KpiCard icon={CalendarClockIcon} label="Vencen en 30 días" value={filtered.filter((r) => r.dueAt < "2026-10-15").length} alert={`${filtered.filter((r) => r.status === "vencido").length} vencidos`} />
        <KpiCard icon={UsersIcon} label="Responsables" value={owners.length} hint="activos" />
      </KpiRow>

      <WorkGrid
        ficha={panel}
        toolbar={
          <>
            <Toolbar>
              <ToolbarSearch placeholder="Buscar registro…" value={query} onChange={(e) => setQuery(e.target.value)} />
              <FilterMenu label="Fase" options={stages.map((s) => ({ value: s.id, label: s.label, count: records.filter((r) => r.stage === s.id).length }))} value={stageFilter} onChange={setStageFilter} />
              <FilterMenu label="Estado" options={Object.entries(recordStatus).map(([v, s]) => ({ value: v, label: s.label }))} value={statusFilter} onChange={setStatusFilter} />
              <FilterMenu label="Responsable" icon={UserIcon} options={owners.map((o) => ({ value: o, label: o }))} value={ownerFilter} onChange={setOwnerFilter} />
              <ToolbarActions>
                <ViewSwitcher views={views} value={view} onChange={setView} />
                <Button onClick={() => toast("Aquí se abriría el formulario de alta")}>
                  <PlusIcon /> Nuevo registro
                </Button>
              </ToolbarActions>
            </Toolbar>
            <ActiveFilters chips={chips} onClear={clearFilters} />
          </>
        }
        aside={
          <InsightsPanel
            storageKey="demo-registros"
            ficha={panel}
            blocks={[
              {
                id: "resumen",
                title: "Resumen",
                icon: BanknoteIcon,
                render: () => (
                  <div className="divide-y">
                    <InsightStat label="Valor medio" value={fmt.eur(filtered.length ? totalValue / filtered.length : 0)} />
                    <InsightStat label="Ganados este mes" value={won.length} sub={fmt.eur(won.reduce((a, r) => a + r.value, 0))} />
                    <InsightStat label="Sin actividad 7 días" value={3} />
                  </div>
                ),
              },
              {
                id: "fases",
                title: "Por fase",
                icon: KanbanSquareIcon,
                render: () => (
                  <ul className="flex flex-col gap-2">
                    {stages.map((s) => {
                      const n = filtered.filter((r) => r.stage === s.id).length
                      return (
                        <li key={s.id} className="grid grid-cols-[1fr_auto] gap-x-3 text-xs">
                          <span className="flex items-center justify-between">
                            <span>{s.label}</span>
                            <span className="tabular-nums text-muted-foreground">{n}</span>
                          </span>
                          <span className="col-span-2 mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                            <span className="block h-full rounded-full bg-brand" style={{ width: `${filtered.length ? (n / filtered.length) * 100 : 0}%` }} />
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                ),
              },
              {
                id: "vencimientos",
                title: "Próximos vencimientos",
                icon: CalendarClockIcon,
                render: () => (
                  <InsightList
                    items={[...filtered].sort((a, b) => a.dueAt.localeCompare(b.dueAt)).slice(0, 4).map((r) => ({
                      key: r.id,
                      title: r.name,
                      subtitle: r.owner,
                      trailing: <span className="text-muted-foreground">{fmt.date(r.dueAt)}</span>,
                    }))}
                  />
                ),
              },
              {
                id: "actividad",
                title: "Actividad",
                icon: ActivityIcon,
                defaultVisible: false,
                render: () => (
                  <InsightList
                    items={demoActivity.slice(0, 4).map((a) => ({
                      key: a.id,
                      leading: <AvatarInitials name={a.who} size="sm" />,
                      title: (<><span className="font-semibold">{a.who}</span> {a.what}</>),
                      subtitle: a.target,
                      trailing: <span className="text-muted-foreground">{a.when}</span>,
                    }))}
                  />
                ),
              },
            ]}
          />
        }
      >
        <Section className="min-h-[520px]">
          <SectionHeader icon={KanbanSquareIcon} title="Registros" count={filtered.length} meta={view === "kanban" ? `${fmt.eur(totalValue)} en total` : undefined} />
          <SectionBody>
            {view === "table" && (
              <DataTable
                rows={paged}
                columns={columns}
                getRowId={(r) => r.id}
                selectable
                selected={selected}
                onSelectedChange={setSelected}
                onRowClick={(r) => setOpenId(r.id)}
                activeId={openId}
                emptyState={emptyState}
              />
            )}
            {view === "list" && (
              filtered.length === 0 ? emptyState : (
                <RecordList>
                  {paged.map((r) => {
                    const s = stages.find((x) => x.id === r.stage)!
                    return (
                      <RecordListItem
                        key={r.id}
                        leading={<AvatarInitials name={r.name} variant="entity" />}
                        title={r.name}
                        subtitle={`${r.code} · ${r.category} · ${r.owner}`}
                        status={<StatusBadge tone={s.tone}>{s.label}</StatusBadge>}
                        value={fmt.eur(r.value)}
                        selected={selected.has(r.id) || r.id === openId}
                        onClick={() => setOpenId(r.id)}
                      />
                    )
                  })}
                </RecordList>
              )
            )}
            {view === "kanban" && (
              <Kanban
                columns={stages.map((s) => ({
                  id: s.id,
                  title: s.label,
                  tone: s.tone,
                  meta: fmt.eur(filtered.filter((r) => r.stage === s.id).reduce((a, r) => a + r.value, 0)),
                }))}
                items={filtered}
                onChange={(next) => {
                  const map = new Map(next.map((n) => [n.id, n.columnId as Stage]))
                  setRecords((rs) => rs.map((r) => (map.has(r.id) ? { ...r, stage: map.get(r.id)!, columnId: map.get(r.id)! } : r)))
                }}
                onCardClick={(r) => setOpenId(r.id)}
                openId={openId}
                storageKey="demo-registros"
                defaultCollapsed={["nuevo", "ganado"]}
                renderCard={(r) => (
                  <div className="flex flex-col">
                    <div className="flex items-start gap-2.5">
                      <AvatarInitials name={r.name} variant="entity" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[13.5px] leading-[18px] font-semibold">{r.name}</div>
                        <div className="mt-px truncate text-xs text-muted-foreground">{r.code} · {r.category}</div>
                      </div>
                    </div>
                    <div className="mt-2.5 flex items-center gap-2">
                      <span className="text-sm font-semibold tabular-nums">{fmt.eur(r.value)}</span>
                      <span className="ml-auto truncate rounded-md border px-1.5 py-px text-[11px] font-medium text-muted-foreground">{r.tags[0]}</span>
                    </div>
                    <div className="mt-2.5 flex items-center gap-2 border-t pt-2">
                      <span className={cn("inline-flex min-w-0 items-center gap-1 text-xs font-medium", statusTextClass[recordStatus[r.status].tone])}>
                        <CalendarClockIcon className="size-3 flex-none" />
                        <span className="truncate">{recordStatus[r.status].label} · {fmt.date(r.dueAt)}</span>
                      </span>
                      <AvatarInitials name={r.owner} size="xs" className="ml-auto" />
                    </div>
                  </div>
                )}
              />
            )}
          </SectionBody>
          {view !== "kanban" && filtered.length > 0 && (
            <SectionFooter>
              <TablePagination page={page} pageCount={pageCount} onPageChange={setPage} total={filtered.length} pageSize={PAGE_SIZE} />
            </SectionFooter>
          )}
          <BulkBar count={selected.size} onClear={() => setSelected(new Set())}>
            <Button variant="ghost" size="sm" onClick={() => advance([...selected])}><ArrowRightIcon /> Avanzar fase</Button>
            <Button variant="ghost" size="sm" onClick={() => toast.success(`${selected.size} asignados a Usuario 2`)}><UserIcon /> Asignar</Button>
            <Button variant="ghost" size="sm" onClick={() => toast.success(`Secuencia enviada a ${selected.size} registros`)}><SendIcon /> Enviar</Button>
            <Button variant="ghost" size="sm" onClick={() => archive([...selected])}><ArchiveIcon /> Archivar</Button>
          </BulkBar>
        </Section>
      </WorkGrid>

      <DetailSheet open={open !== null} onOpenChange={(o) => !o && setOpenId(null)} ficha={panel}>
        {open && (
          <>
            <DetailHeader
              leading={<AvatarInitials name={open.name} size="lg" variant="entity" />}
              title={<InlineTitle parts={[{ key: "name", value: open.name, placeholder: "Nombre", required: true }]} onSave={async (v) => actualizar("name")(v.name)} />}
              subtitle={`${open.code} · ${open.category}`}
              status={<StatusBadge tone={stages.find((s) => s.id === open.stage)!.tone}>{stages.find((s) => s.id === open.stage)!.label}</StatusBadge>}
              nav={<RecordPager index={posicion} total={filtered.length} label="registro" onPrev={() => setOpenId(filtered[posicion - 1].id)} onNext={() => setOpenId(filtered[posicion + 1].id)} />}
              actions={
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      await navigator.clipboard.writeText(`${window.location.origin}/demo/registros?registro=${open.id}`)
                      toast.success("Enlace copiado")
                    }}
                  >
                    <CopyIcon /> Copiar enlace
                  </Button>
                  <RecordActions clave="demo-registro" operaciones={operaciones} onEjecutar={ejecutarBoton} />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-sm" aria-label="Más acciones" className="ml-auto"><EllipsisIcon /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => toast.success("Registro duplicado")}><CopyIcon /> Duplicar</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => archive([open.id])}><ArchiveIcon /> Archivar</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem variant="destructive" onClick={() => setConfirmDelete(true)}><Trash2Icon /> Eliminar</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              }
            />
            <Tabs key={open.id} defaultValue="resumen" className="flex min-h-0 flex-1 flex-col gap-0">
              <TabsList variant="line" className="w-full justify-start rounded-none border-b px-4">
                <TabsTrigger value="resumen" className="flex-none">Resumen</TabsTrigger>
                <TabsTrigger value="actividad" className="flex-none">Actividad</TabsTrigger>
                <TabsTrigger value="archivos" className="flex-none">Archivos</TabsTrigger>
              </TabsList>
              <DetailBody>
                <TabsContent value="resumen">
                  <DetailSection title="Gestión" icon={UserCogIcon} collapsible storageKey="registro.gestion" summary={[stages.find((s) => s.id === open.stage)!.label, open.owner].join(" · ")}>
                    <DetailFields>
                      <DetailField label="Fase">
                        <InlineField
                          value={open.stage}
                          tipo="select"
                          required
                          opciones={stages.map((s) => ({ value: s.id, label: s.label }))}
                          onSave={actualizar("stage")}
                          render={() => <StatusBadge tone={stages.find((s) => s.id === open.stage)!.tone}>{stages.find((s) => s.id === open.stage)!.label}</StatusBadge>}
                        />
                      </DetailField>
                      <DetailField label="Estado">
                        <InlineField
                          value={open.status}
                          tipo="select"
                          required
                          opciones={Object.entries(recordStatus).map(([k, m]) => ({ value: k, label: m.label }))}
                          onSave={actualizar("status")}
                          render={() => <StatusBadge tone={recordStatus[open.status].tone} dot>{recordStatus[open.status].label}</StatusBadge>}
                        />
                      </DetailField>
                      <DetailField label="Responsable">
                        <InlineField
                          value={open.owner}
                          tipo="select"
                          required
                          opciones={owners.map((o) => ({ value: o, label: o }))}
                          onSave={actualizar("owner")}
                          render={(v) => <span className="inline-flex items-center gap-2"><AvatarInitials name={String(v)} size="xs" /> {String(v)}</span>}
                        />
                      </DetailField>
                      <DetailField label="Etiquetas" empty={!open.tags.length}>
                        <InlineField
                          value={open.tags}
                          tipo="multiselect"
                          opciones={["Etiqueta 1", "Etiqueta 2", "Etiqueta 3"].map((t) => ({ value: t, label: t }))}
                          placeholder="Añadir etiquetas"
                          onSave={actualizar("tags")}
                        />
                      </DetailField>
                    </DetailFields>
                  </DetailSection>
                  <DetailSection title="Negocio" icon={BanknoteIcon} collapsible storageKey="registro.negocio" summary={`${fmt.eur(open.value)} · vence ${fmt.date(open.dueAt)}`}>
                    <DetailFields>
                      <DetailField label="Valor">
                        <InlineField value={open.value} tipo="numero" onSave={actualizar("value")} render={(v) => <span className="font-semibold tabular-nums">{fmt.eur(Number(v))}</span>} />
                      </DetailField>
                      <DetailField label="Vencimiento">
                        <InlineField value={open.dueAt} tipo="fecha" onSave={actualizar("dueAt")} render={(v) => fmt.dateLong(String(v))} />
                      </DetailField>
                      <DetailField label="Categoría">
                        <InlineField value={open.category} tipo="select" required opciones={["Categoría A", "Categoría B", "Categoría C", "Categoría D"].map((c) => ({ value: c, label: c }))} onSave={actualizar("category")} />
                      </DetailField>
                    </DetailFields>
                  </DetailSection>
                  <DetailSection
                    title="Contactos"
                    icon={UsersIcon}
                    count={open.contacts.length}
                    collapsible
                    defaultOpen={open.contacts.length > 0}
                    storageKey="registro.contactos"
                    summary={open.contacts.join(", ") || "Ninguno"}
                    action={<DetailSectionAction onClick={() => toast("Aquí se añadiría un contacto")}>Añadir</DetailSectionAction>}
                  >
                    <InsightList items={open.contacts.map((c, i) => ({ key: c, leading: <AvatarInitials name={c} size="sm" />, title: c, subtitle: i === 0 ? "Contacto principal" : "Contacto", trailing: <AvatarStack names={[open.owner]} /> }))} />
                  </DetailSection>
                  <DetailSection title="Progreso" icon={GaugeIcon} collapsible storageKey="registro.progreso" summary={`${open.progress} %`}>
                    <div className="flex items-center gap-3">
                      <Progress value={open.progress} className="h-1.5" />
                      <span className="text-xs whitespace-nowrap tabular-nums text-muted-foreground">{open.progress} %</span>
                    </div>
                  </DetailSection>
                  <DetailMeta>Actualizado el {fmt.dateLong(open.updatedAt)}</DetailMeta>
                </TabsContent>
                <TabsContent value="actividad">
                  <DetailSection title="Últimos cambios">
                    <ol className="relative flex flex-col gap-3 border-l pl-4 text-sm">
                      {demoActivity.slice(0, 5).map((a) => (
                        <li key={a.id} className="relative">
                          <span className="absolute top-1.5 -left-[21px] size-2 rounded-full bg-border ring-2 ring-card" />
                          <p><span className="font-semibold">{a.who}</span> {a.what}</p>
                          <p className="text-xs text-muted-foreground">{a.when}</p>
                        </li>
                      ))}
                    </ol>
                  </DetailSection>
                </TabsContent>
                <TabsContent value="archivos">
                  <EmptyState icon={PaperclipIcon} title="Sin archivos" description="Arrastra un archivo aquí o súbelo desde el botón." action={<Button variant="outline" size="sm"><PaperclipIcon /> Subir archivo</Button>} />
                </TabsContent>
              </DetailBody>
            </Tabs>
            <DetailFooter>
              <Button variant="ghost" onClick={() => setOpenId(null)}>Cerrar</Button>
              <Button onClick={() => advance([open.id])} disabled={open.stage === "ganado"}>
                <ArrowRightIcon /> Avanzar fase
              </Button>
            </DetailFooter>
          </>
        )}
      </DetailSheet>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="¿Eliminar este registro?"
        description="Se borrará de forma permanente junto con su actividad y archivos. Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        destructive
        onConfirm={() => {
          if (open) {
            setRecords((rs) => rs.filter((r) => r.id !== open.id))
            setOpenId(null)
            toast.success("Registro eliminado")
          }
        }}
      />
    </PageBody>
  )
}
