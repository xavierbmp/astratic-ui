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
  SendIcon,
  Trash2Icon,
  TrophyIcon,
  UserCogIcon,
  UsersIcon,
} from "lucide-react"
import { fmt } from "@/lib/format"
import { demoActivity, recordStatus, stages, type DemoRecord, type Stage } from "@/lib/demo-data"
import { useBaseLocal, useEnNavegador } from "@/hooks/use-base-local"
import { camposDemoRegistros, escribirEnRegistro, vistasDemoRegistros } from "@/lib/demo-base"
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
import { WorkGrid } from "@/components/app/work-grid"
import { StatusBadge } from "@/components/app/status-badge"
import { AvatarInitials, AvatarStack } from "@/components/app/avatar-initials"
import { EmptyState } from "@/components/app/states"
import { InsightList, InsightStat, InsightsPanel } from "@/components/app/insights-panel"
import { DetailBody, DetailField, DetailFields, DetailFooter, DetailHeader, DetailMeta, DetailSection, DetailSectionAction, DetailSheet, RecordPager } from "@/components/app/detail-sheet"
import { usePanelFicha, type PanelFicha } from "@/components/app/detail-panel"
import { BaseDatos } from "@/components/app/base/base-datos"
import { RecordActions, type BotonAccion, type OperacionBoton } from "@/components/app/record-actions"
import { InlineField, InlineTitle, type ValorInline } from "@/components/app/inline-field"
import { ConfirmDialog } from "@/components/app/confirm-dialog"

export function RegistrosView({
  initialRecords,
  initialOpenId = null,
}: {
  initialRecords: DemoRecord[]
  initialOpenId?: string | null
}) {
  const [records, setRecords] = React.useState<DemoRecord[]>(initialRecords)
  const enNavegador = useEnNavegador()
  const camposBase = React.useMemo(() => camposDemoRegistros(initialRecords), [initialRecords])
  const base = useBaseLocal("demo-registros", camposBase, vistasDemoRegistros)
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

  const open = openId ? records.find((r) => r.id === openId) ?? null : null
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

  const totalValue = records.reduce((a, r) => a + r.value, 0)
  const won = records.filter((r) => r.stage === "ganado")

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
  }
  const archive = (ids: string[]) => {
    const previous = records
    setRecords(previous.filter((r) => !ids.includes(r.id)))
    setOpenId(null)
    toast.success(ids.length === 1 ? "Registro archivado" : `${ids.length} registros archivados`, {
      action: { label: "Deshacer", onClick: () => setRecords(previous) },
    })
  }

  // La ficha recorre los registros que deja ver la vista, en su orden (las flechas).
  const ficha = (lista: DemoRecord[], fichaPanel: PanelFicha) => {
    const posicion = openId ? lista.findIndex((r) => r.id === openId) : -1
    return (
      <DetailSheet open={open !== null} onOpenChange={(o) => !o && setOpenId(null)} ficha={fichaPanel}>
        {open && (
          <>
            <DetailHeader
              leading={<AvatarInitials name={open.name} size="lg" variant="entity" />}
              title={<InlineTitle parts={[{ key: "name", value: open.name, placeholder: "Nombre", required: true }]} onSave={async (v) => actualizar("name")(v.name)} />}
              subtitle={`${open.code} · ${open.category}`}
              status={<StatusBadge tone={stages.find((s) => s.id === open.stage)!.tone}>{stages.find((s) => s.id === open.stage)!.label}</StatusBadge>}
              nav={<RecordPager index={posicion} total={lista.length} label="registro" onPrev={() => setOpenId(lista[posicion - 1].id)} onNext={() => setOpenId(lista[posicion + 1].id)} />}
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
              <TabsList variant="line" className="px-4">
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
    )
  }

  return (
    <PageBody>
      <PageHeader
        title="Registros"
        description="Base de datos de registros al estilo Airtable: cuadrícula, kanban por fase y calendario de vencimientos, con sus filtros, grupos y vistas."
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
        <KpiCard icon={BanknoteIcon} label="Pipeline abierto" value={fmt.eur(totalValue)} hint={`${records.length} registros`} />
        <KpiCard icon={TrophyIcon} label="Ganados" value={won.length} hint={fmt.eur(won.reduce((a, r) => a + r.value, 0))} delta={{ value: 12, label: "vs mes anterior" }} />
        <KpiCard icon={CalendarClockIcon} label="Vencen en 30 días" value={records.filter((r) => r.dueAt < "2026-10-15").length} alert={`${records.filter((r) => r.status === "vencido").length} vencidos`} />
        <KpiCard icon={UsersIcon} label="Responsables" value={owners.length} hint="activos" />
      </KpiRow>

      <WorkGrid
        ficha={panel}
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
                    <InsightStat label="Valor medio" value={fmt.eur(records.length ? totalValue / records.length : 0)} />
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
                      const n = records.filter((r) => r.stage === s.id).length
                      return (
                        <li key={s.id} className="grid grid-cols-[1fr_auto] gap-x-3 text-xs">
                          <span className="flex items-center justify-between">
                            <span>{s.label}</span>
                            <span className="tabular-nums text-muted-foreground">{n}</span>
                          </span>
                          <span className="col-span-2 mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                            <span className="block h-full rounded-full bg-brand" style={{ width: `${records.length ? (n / records.length) * 100 : 0}%` }} />
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
                    items={[...records].sort((a, b) => a.dueAt.localeCompare(b.dueAt)).slice(0, 4).map((r) => ({
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
        <div className="h-[640px] xl:h-full">
          {enNavegador && (
            <BaseDatos
              clave="demo-registros"
              base={base}
              campos={camposBase}
              filas={records}
              getId={(r) => r.id}
              hoy="2026-10-06"
              objeto={{ singular: "registro", plural: "registros", nuevo: "Nuevo registro" }}
              abiertoId={openId}
              onAbrir={setOpenId}
              ficha={panel}
              onEscribir={(cambios) => setRecords((rs) => rs.map((r) => cambios.filter((c) => c.fila.id === r.id).reduce((x, c) => escribirEnRegistro(x, c.campo, c.valor), r)))}
              onNuevo={() => toast("Aquí se abriría el formulario de alta")}
              onBorrar={archive}
              kanban={{ resumen: (rs) => fmt.eur(rs.reduce((a, r) => a + r.value, 0)), plegadas: ["nuevo", "ganado"] }}
              accionesSeleccion={(ids) => (
                <>
                  <Button variant="ghost" size="sm" onClick={() => advance(ids)}><ArrowRightIcon /> Avanzar fase</Button>
                  <Button variant="ghost" size="sm" onClick={() => toast.success(`Secuencia enviada a ${ids.length} registros`)}><SendIcon /> Enviar</Button>
                </>
              )}
              vacio={(hayFiltro, limpiar) => (
                <EmptyState
                  title={hayFiltro ? "Ningún registro coincide" : "Aún no hay registros"}
                  description={hayFiltro ? "Prueba con otra búsqueda o quita algún filtro." : "Crea el primero con el botón «Nuevo registro»."}
                  action={hayFiltro ? <Button variant="outline" size="sm" onClick={limpiar}>Quitar filtros</Button> : undefined}
                />
              )}
            >
              {(visibles, fichaBase) => ficha(visibles, fichaBase)}
            </BaseDatos>
          )}
        </div>
      </WorkGrid>

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
