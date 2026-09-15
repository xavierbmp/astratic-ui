"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  AlarmClockIcon,
  BanknoteIcon,
  CalendarClockIcon,
  CircleCheckIcon,
  ClockIcon,
  CopyIcon,
  DownloadIcon,
  FileTextIcon,
  LayersIcon,
  PlusIcon,
  ReceiptTextIcon,
  SendIcon,
} from "lucide-react"
import { fmt } from "@/lib/format"
import { demoPayments, invoiceStatus, invoiceTotal, type DemoInvoice, type InvoiceStatus } from "@/lib/demo-data"
import { usePageView } from "@/hooks/use-page-view"
import { Button } from "@/components/ui/button"
import { PageBody, PageHeader } from "@/components/app/page-header"
import { PageTabs } from "@/components/app/page-tabs"
import { KpiCard, KpiRow } from "@/components/app/kpi"
import { Section, SectionBody, SectionFooter, SectionHeader } from "@/components/app/section"
import { WorkGrid } from "@/components/app/work-grid"
import { ActiveFilters, FilterMenu, Toolbar, ToolbarActions, ToolbarSearch, ViewSwitcher } from "@/components/app/toolbar"
import { CellPrimary, DataTable, TablePagination, type Column } from "@/components/app/data-table"
import { RecordList, RecordListItem } from "@/components/app/record-list"
import { StatusBadge } from "@/components/app/status-badge"
import { AvatarInitials } from "@/components/app/avatar-initials"
import { EmptyState } from "@/components/app/states"
import { InsightList, InsightsPanel } from "@/components/app/insights-panel"
import { DetailBody, DetailField, DetailFields, DetailFooter, DetailHeader, DetailSection, DetailSheet } from "@/components/app/detail-sheet"
import { facturacionTabs } from "../nav"

const PAGE_SIZE = 10
const MONTH = "2026-09"

export function FacturasView({
  initialInvoices,
  initialOpenId = null,
}: {
  initialInvoices: DemoInvoice[]
  initialOpenId?: string | null
}) {
  const [invoices, setInvoices] = React.useState<DemoInvoice[]>(initialInvoices)
  const { view, setView, views } = usePageView("demo-facturas", ["table", "list"])
  const [query, setQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string[]>([])
  const filterKey = JSON.stringify([query, statusFilter, view])
  const [pageState, setPageState] = React.useState({ key: filterKey, page: 1 })
  const page = pageState.key === filterKey ? pageState.page : 1
  const setPage = (p: number) => setPageState({ key: filterKey, page: p })
  const [openId, setOpenIdState] = React.useState<string | null>(initialOpenId)
  const setOpenId = (id: string | null) => {
    setOpenIdState(id)
    const url = new URL(window.location.href)
    if (id) url.searchParams.set("factura", id)
    else url.searchParams.delete("factura")
    window.history.replaceState(null, "", url)
  }

  const filtered = invoices.filter((f) => {
    const q = query.trim().toLowerCase()
    return (
      (!q || f.code.toLowerCase().includes(q) || f.recordName.toLowerCase().includes(q)) &&
      (statusFilter.length === 0 || statusFilter.includes(f.status))
    )
  })
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const open = openId ? invoices.find((f) => f.id === openId) ?? null : null

  const sum = (list: DemoInvoice[]) => list.reduce((a, f) => a + invoiceTotal(f.base), 0)
  const issuedThisMonth = invoices.filter((f) => f.status !== "borrador" && f.issuedAt.startsWith(MONTH))
  const pending = invoices.filter((f) => f.status === "enviada" || f.status === "vencida")
  const overdue = invoices.filter((f) => f.status === "vencida")
  const collectedThisMonth = demoPayments.filter((p) => p.paidAt.startsWith(MONTH)).reduce((a, p) => a + p.amount, 0)

  const chips = statusFilter.map((v) => ({
    label: `Estado: ${invoiceStatus[v as InvoiceStatus].label}`,
    onRemove: () => setStatusFilter(statusFilter.filter((x) => x !== v)),
  }))

  const setStatus = (id: string, status: InvoiceStatus) =>
    setInvoices((list) => list.map((f) => (f.id === id ? { ...f, status, paidAt: status === "pagada" ? "2026-09-15" : f.paidAt } : f)))

  const columns: Column<DemoInvoice>[] = [
    {
      id: "code",
      header: "Factura",
      minWidth: 200,
      sortValue: (f) => f.code,
      cell: (f) => <CellPrimary leading={<AvatarInitials name={f.recordName} size="md" variant="entity" />} title={f.code} subtitle={f.recordName} />,
    },
    { id: "issued", header: "Emisión", hideBelow: "lg", sortValue: (f) => f.issuedAt, cell: (f) => <span className="text-muted-foreground">{fmt.date(f.issuedAt)}</span> },
    { id: "due", header: "Vencimiento", hideBelow: "md", sortValue: (f) => f.dueAt, cell: (f) => <span className="text-muted-foreground">{fmt.date(f.dueAt)}</span> },
    { id: "status", header: "Estado", cell: (f) => <StatusBadge tone={invoiceStatus[f.status].tone}>{invoiceStatus[f.status].label}</StatusBadge> },
    { id: "total", header: "Importe", align: "right", sortValue: (f) => f.base, cell: (f) => <span className="font-semibold">{fmt.eur(invoiceTotal(f.base))}</span> },
  ]

  const emptyState = (
    <EmptyState
      title="Ninguna factura coincide"
      description="Prueba con otra búsqueda o quita el filtro de estado."
      action={<Button variant="outline" size="sm" onClick={() => { setQuery(""); setStatusFilter([]) }}>Quitar filtros</Button>}
    />
  )

  return (
    <PageBody>
      <PageHeader
        title="Facturación"
        description="Facturas emitidas, su vencimiento y su cobro."
        tabs={<PageTabs items={facturacionTabs} />}
        actions={
          <Button variant="outline" onClick={() => toast.success("Exportación preparada")}>
            <DownloadIcon /> Exportar
          </Button>
        }
      />

      <KpiRow>
        <KpiCard icon={ReceiptTextIcon} label="Facturado este mes" value={fmt.eur(sum(issuedThisMonth))} hint={`${issuedThisMonth.length} facturas`} />
        <KpiCard icon={ClockIcon} label="Por cobrar" value={fmt.eur(sum(pending))} hint={`${pending.length} facturas`} />
        <KpiCard icon={AlarmClockIcon} label="Vencidas" value={overdue.length} alert={overdue.length > 0 ? `${fmt.eur(sum(overdue))} sin cobrar` : undefined} />
        <KpiCard icon={CircleCheckIcon} label="Cobrado este mes" value={fmt.eur(collectedThisMonth)} delta={{ value: 8.5, label: "vs agosto" }} />
      </KpiRow>

      <WorkGrid
        toolbar={
          <>
            <Toolbar>
              <ToolbarSearch placeholder="Buscar factura o registro…" value={query} onChange={(e) => setQuery(e.target.value)} />
              <FilterMenu
                label="Estado"
                options={(Object.keys(invoiceStatus) as InvoiceStatus[]).map((s) => ({ value: s, label: invoiceStatus[s].label, count: invoices.filter((f) => f.status === s).length }))}
                value={statusFilter}
                onChange={setStatusFilter}
              />
              <ToolbarActions>
                <ViewSwitcher views={views} value={view} onChange={setView} />
                <Button onClick={() => toast("Aquí se abriría el formulario de la factura")}>
                  <PlusIcon /> Nueva factura
                </Button>
              </ToolbarActions>
            </Toolbar>
            <ActiveFilters chips={chips} onClear={() => setStatusFilter([])} />
          </>
        }
        aside={
          <InsightsPanel
            storageKey="demo-facturas"
            blocks={[
              {
                id: "estados",
                title: "Por estado",
                icon: LayersIcon,
                render: () => (
                  <ul className="flex flex-col gap-2">
                    {(Object.keys(invoiceStatus) as InvoiceStatus[]).map((s) => {
                      const list = invoices.filter((f) => f.status === s)
                      return (
                        <li key={s} className="grid grid-cols-[1fr_auto] gap-x-3 text-xs">
                          <span>{invoiceStatus[s].label}</span>
                          <span className="tabular-nums text-muted-foreground">{fmt.eur(sum(list))}</span>
                          <span className="col-span-2 mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                            <span className="block h-full rounded-full bg-brand" style={{ width: `${(sum(list) / sum(invoices)) * 100}%` }} />
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
                    items={invoices
                      .filter((f) => f.status === "enviada")
                      .sort((a, b) => a.dueAt.localeCompare(b.dueAt))
                      .slice(0, 4)
                      .map((f) => ({
                        key: f.id,
                        title: f.code,
                        subtitle: f.recordName,
                        trailing: <span className="text-muted-foreground">{fmt.date(f.dueAt)}</span>,
                      }))}
                  />
                ),
              },
            ]}
          />
        }
      >
        <Section className="min-h-[480px]">
          <SectionHeader icon={ReceiptTextIcon} title="Facturas" count={filtered.length} />
          <SectionBody>
            {view === "table" && (
              <DataTable rows={paged} columns={columns} getRowId={(f) => f.id} onRowClick={(f) => setOpenId(f.id)} emptyState={emptyState} />
            )}
            {view === "list" &&
              (filtered.length === 0 ? (
                emptyState
              ) : (
                <RecordList>
                  {paged.map((f) => (
                    <RecordListItem
                      key={f.id}
                      leading={<AvatarInitials name={f.recordName} variant="entity" />}
                      title={f.code}
                      subtitle={`${f.recordName} · vence el ${fmt.date(f.dueAt)}`}
                      status={<StatusBadge tone={invoiceStatus[f.status].tone}>{invoiceStatus[f.status].label}</StatusBadge>}
                      value={fmt.eur(invoiceTotal(f.base))}
                      onClick={() => setOpenId(f.id)}
                    />
                  ))}
                </RecordList>
              ))}
          </SectionBody>
          {filtered.length > 0 && (
            <SectionFooter>
              <TablePagination page={page} pageCount={pageCount} onPageChange={setPage} total={filtered.length} pageSize={PAGE_SIZE} />
            </SectionFooter>
          )}
        </Section>
      </WorkGrid>

      <DetailSheet open={open !== null} onOpenChange={(o) => !o && setOpenId(null)} width={400}>
        {open && (
          <>
            <DetailHeader
              leading={<AvatarInitials name={open.recordName} size="lg" variant="entity" />}
              title={open.code}
              subtitle={open.recordName}
              status={<StatusBadge tone={invoiceStatus[open.status].tone}>{invoiceStatus[open.status].label}</StatusBadge>}
              actions={
                <>
                  <Button variant="outline" size="sm" onClick={() => toast.success("PDF descargado")}><FileTextIcon /> Descargar PDF</Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      await navigator.clipboard.writeText(`${window.location.origin}/demo/facturacion?factura=${open.id}`)
                      toast.success("Enlace copiado")
                    }}
                  >
                    <CopyIcon /> Copiar enlace
                  </Button>
                </>
              }
            />
            <DetailBody>
              <DetailSection title="Datos">
                <DetailFields>
                  <DetailField label="Registro">{open.recordName}</DetailField>
                  <DetailField label="Emisión">{fmt.dateLong(open.issuedAt)}</DetailField>
                  <DetailField label="Vencimiento">{fmt.dateLong(open.dueAt)}</DetailField>
                  {open.paidAt && <DetailField label="Cobrada">{fmt.dateLong(open.paidAt)}</DetailField>}
                </DetailFields>
              </DetailSection>
              <DetailSection title="Importe">
                <DetailFields>
                  <DetailField label="Base imponible"><span className="tabular-nums">{fmt.eurDecimals(open.base)}</span></DetailField>
                  <DetailField label="IVA (21 %)"><span className="tabular-nums">{fmt.eurDecimals(invoiceTotal(open.base) - open.base)}</span></DetailField>
                  <DetailField label="Total"><span className="font-semibold tabular-nums">{fmt.eurDecimals(invoiceTotal(open.base))}</span></DetailField>
                </DetailFields>
              </DetailSection>
            </DetailBody>
            <DetailFooter>
              <Button variant="ghost" onClick={() => setOpenId(null)}>Cerrar</Button>
              {open.status === "borrador" ? (
                <Button onClick={() => { setStatus(open.id, "enviada"); toast.success("Factura enviada") }}>
                  <SendIcon /> Enviar factura
                </Button>
              ) : (
                <Button disabled={open.status === "pagada"} onClick={() => { setStatus(open.id, "pagada"); toast.success("Cobro registrado") }}>
                  <BanknoteIcon /> Registrar cobro
                </Button>
              )}
            </DetailFooter>
          </>
        )}
      </DetailSheet>
    </PageBody>
  )
}
