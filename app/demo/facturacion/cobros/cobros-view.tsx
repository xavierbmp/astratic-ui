"use client"

import * as React from "react"
import Link from "next/link"
import { toast } from "sonner"
import { BanknoteIcon, CheckCheckIcon, CircleCheckIcon, CreditCardIcon, DownloadIcon, PlusIcon, ReceiptTextIcon, TimerIcon, TriangleAlertIcon } from "lucide-react"
import { fmt } from "@/lib/format"
import { demoInvoices, paymentMethods, type DemoPayment, type PaymentMethod } from "@/lib/demo-data"
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
import { InsightList, InsightStat, InsightsPanel } from "@/components/app/insights-panel"
import { DetailBody, DetailField, DetailFields, DetailFooter, DetailHeader, DetailSection, DetailSheet } from "@/components/app/detail-sheet"
import { facturacionTabs } from "../../nav"

const PAGE_SIZE = 10
const MONTH = "2026-09"

const reconciliation = {
  si: { label: "Conciliado", tone: "success" },
  no: { label: "Sin conciliar", tone: "warning" },
} as const

function ReconciledBadge({ reconciled }: { reconciled: boolean }) {
  const r = reconciliation[reconciled ? "si" : "no"]
  return <StatusBadge tone={r.tone} dot>{r.label}</StatusBadge>
}

export function CobrosView({
  initialPayments,
  initialOpenId = null,
}: {
  initialPayments: DemoPayment[]
  initialOpenId?: string | null
}) {
  const [payments, setPayments] = React.useState<DemoPayment[]>(initialPayments)
  const { view, setView, views } = usePageView("demo-cobros", ["table", "list"])
  const [query, setQuery] = React.useState("")
  const [methodFilter, setMethodFilter] = React.useState<string[]>([])
  const [stateFilter, setStateFilter] = React.useState<string[]>([])
  const filterKey = JSON.stringify([query, methodFilter, stateFilter, view])
  const [pageState, setPageState] = React.useState({ key: filterKey, page: 1 })
  const page = pageState.key === filterKey ? pageState.page : 1
  const setPage = (p: number) => setPageState({ key: filterKey, page: p })
  const [openId, setOpenIdState] = React.useState<string | null>(initialOpenId)
  const setOpenId = (id: string | null) => {
    setOpenIdState(id)
    const url = new URL(window.location.href)
    if (id) url.searchParams.set("cobro", id)
    else url.searchParams.delete("cobro")
    window.history.replaceState(null, "", url)
  }

  const filtered = payments.filter((p) => {
    const q = query.trim().toLowerCase()
    return (
      (!q || p.code.toLowerCase().includes(q) || p.invoiceCode.toLowerCase().includes(q) || p.recordName.toLowerCase().includes(q)) &&
      (methodFilter.length === 0 || methodFilter.includes(p.method)) &&
      (stateFilter.length === 0 || stateFilter.includes(p.reconciled ? "si" : "no"))
    )
  })
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const open = openId ? payments.find((p) => p.id === openId) ?? null : null

  const sum = (list: DemoPayment[]) => list.reduce((a, p) => a + p.amount, 0)
  const thisMonth = payments.filter((p) => p.paidAt.startsWith(MONTH))
  const unreconciled = payments.filter((p) => !p.reconciled)
  const days = payments.map((p) => {
    const f = demoInvoices.find((x) => x.id === p.invoiceId)!
    return (new Date(p.paidAt).getTime() - new Date(f.issuedAt).getTime()) / 86_400_000
  })
  const avgDays = Math.round(days.reduce((a, d) => a + d, 0) / Math.max(1, days.length))

  const chips = [
    ...methodFilter.map((v) => ({ label: `Método: ${paymentMethods[v as PaymentMethod].label}`, onRemove: () => setMethodFilter(methodFilter.filter((x) => x !== v)) })),
    ...stateFilter.map((v) => ({ label: `Conciliación: ${reconciliation[v as "si" | "no"].label}`, onRemove: () => setStateFilter(stateFilter.filter((x) => x !== v)) })),
  ]
  const clearFilters = () => {
    setMethodFilter([])
    setStateFilter([])
  }
  const reconcile = (id: string) => {
    setPayments((list) => list.map((p) => (p.id === id ? { ...p, reconciled: true } : p)))
    toast.success("Cobro conciliado")
  }

  const columns: Column<DemoPayment>[] = [
    {
      id: "code",
      header: "Cobro",
      minWidth: 200,
      sortValue: (p) => p.code,
      cell: (p) => <CellPrimary leading={<AvatarInitials name={p.recordName} size="md" variant="entity" />} title={p.code} subtitle={p.recordName} />,
    },
    { id: "invoice", header: "Factura", hideBelow: "lg", sortValue: (p) => p.invoiceCode, cell: (p) => <span className="text-muted-foreground">{p.invoiceCode}</span> },
    { id: "date", header: "Fecha", hideBelow: "md", sortValue: (p) => p.paidAt, cell: (p) => <span className="text-muted-foreground">{fmt.date(p.paidAt)}</span> },
    { id: "method", header: "Método", hideBelow: "2xl", sortValue: (p) => p.method, cell: (p) => <span className="text-muted-foreground">{paymentMethods[p.method].label}</span> },
    { id: "state", header: "Conciliación", cell: (p) => <ReconciledBadge reconciled={p.reconciled} /> },
    { id: "amount", header: "Importe", align: "right", sortValue: (p) => p.amount, cell: (p) => <span className="font-semibold">{fmt.eur(p.amount)}</span> },
  ]

  const emptyState = (
    <EmptyState
      title="Ningún cobro coincide"
      description="Prueba con otra búsqueda o quita algún filtro."
      action={<Button variant="outline" size="sm" onClick={() => { setQuery(""); clearFilters() }}>Quitar filtros</Button>}
    />
  )

  return (
    <PageBody>
      <PageHeader
        title="Facturación"
        description="Cobros recibidos y su conciliación con las facturas."
        tabs={<PageTabs items={facturacionTabs} />}
        actions={
          <Button variant="outline" onClick={() => toast.success("Exportación preparada")}>
            <DownloadIcon /> Exportar
          </Button>
        }
      />

      <KpiRow>
        <KpiCard icon={CircleCheckIcon} label="Cobrado este mes" value={fmt.eur(sum(thisMonth))} hint={`${thisMonth.length} cobros`} />
        <KpiCard icon={BanknoteIcon} label="Cobrado total" value={fmt.eur(sum(payments))} hint={`${payments.length} cobros en 90 días`} />
        <KpiCard icon={TriangleAlertIcon} label="Sin conciliar" value={unreconciled.length} alert={unreconciled.length > 0 ? `${fmt.eur(sum(unreconciled))} por revisar` : undefined} />
        <KpiCard icon={TimerIcon} label="Plazo de cobro" value={`${avgDays} días`} hint="de media desde la emisión" />
      </KpiRow>

      <WorkGrid
        toolbar={
          <>
            <Toolbar>
              <ToolbarSearch placeholder="Buscar cobro o factura…" value={query} onChange={(e) => setQuery(e.target.value)} />
              <FilterMenu
                label="Método"
                icon={CreditCardIcon}
                options={(Object.keys(paymentMethods) as PaymentMethod[]).map((m) => ({ value: m, label: paymentMethods[m].label, count: payments.filter((p) => p.method === m).length }))}
                value={methodFilter}
                onChange={setMethodFilter}
              />
              <FilterMenu
                label="Conciliación"
                options={[
                  { value: "si", label: "Conciliado", count: payments.length - unreconciled.length },
                  { value: "no", label: "Sin conciliar", count: unreconciled.length },
                ]}
                value={stateFilter}
                onChange={setStateFilter}
              />
              <ToolbarActions>
                <ViewSwitcher views={views} value={view} onChange={setView} />
                <Button onClick={() => toast("Aquí se abriría el formulario del cobro")}>
                  <PlusIcon /> Registrar cobro
                </Button>
              </ToolbarActions>
            </Toolbar>
            <ActiveFilters chips={chips} onClear={clearFilters} />
          </>
        }
        aside={
          <InsightsPanel
            storageKey="demo-cobros"
            blocks={[
              {
                id: "metodos",
                title: "Por método",
                icon: CreditCardIcon,
                render: () => (
                  <div className="divide-y">
                    {(Object.keys(paymentMethods) as PaymentMethod[]).map((m) => {
                      const list = payments.filter((p) => p.method === m)
                      return <InsightStat key={m} label={paymentMethods[m].label} value={fmt.eur(sum(list))} sub={`${list.length} cobros`} />
                    })}
                  </div>
                ),
              },
              {
                id: "sin-conciliar",
                title: "Sin conciliar",
                icon: TriangleAlertIcon,
                render: () =>
                  unreconciled.length === 0 ? (
                    <p className="text-xs text-muted-foreground">Todo conciliado.</p>
                  ) : (
                    <InsightList
                      items={unreconciled.map((p) => ({
                        key: p.id,
                        title: p.code,
                        subtitle: `${p.recordName} · ${p.invoiceCode}`,
                        trailing: <span className="font-medium">{fmt.eur(p.amount)}</span>,
                      }))}
                    />
                  ),
              },
            ]}
          />
        }
      >
        <Section className="min-h-[480px]">
          <SectionHeader icon={BanknoteIcon} title="Cobros" count={filtered.length} />
          <SectionBody>
            {view === "table" && (
              <DataTable rows={paged} columns={columns} getRowId={(p) => p.id} onRowClick={(p) => setOpenId(p.id)} emptyState={emptyState} />
            )}
            {view === "list" &&
              (filtered.length === 0 ? (
                emptyState
              ) : (
                <RecordList>
                  {paged.map((p) => (
                    <RecordListItem
                      key={p.id}
                      leading={<AvatarInitials name={p.recordName} variant="entity" />}
                      title={p.code}
                      subtitle={`${p.recordName} · ${p.invoiceCode} · ${fmt.date(p.paidAt)}`}
                      status={<ReconciledBadge reconciled={p.reconciled} />}
                      value={fmt.eur(p.amount)}
                      onClick={() => setOpenId(p.id)}
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
              subtitle={`${open.recordName} · ${open.invoiceCode}`}
              status={<ReconciledBadge reconciled={open.reconciled} />}
              actions={
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/demo/facturacion?factura=${open.invoiceId}`}>
                    <ReceiptTextIcon /> Ver factura
                  </Link>
                </Button>
              }
            />
            <DetailBody>
              <DetailSection title="Datos">
                <DetailFields>
                  <DetailField label="Factura">{open.invoiceCode}</DetailField>
                  <DetailField label="Registro">{open.recordName}</DetailField>
                  <DetailField label="Fecha">{fmt.dateLong(open.paidAt)}</DetailField>
                  <DetailField label="Método">{paymentMethods[open.method].label}</DetailField>
                  <DetailField label="Importe"><span className="font-semibold tabular-nums">{fmt.eurDecimals(open.amount)}</span></DetailField>
                </DetailFields>
              </DetailSection>
            </DetailBody>
            <DetailFooter>
              <Button variant="ghost" onClick={() => setOpenId(null)}>Cerrar</Button>
              <Button disabled={open.reconciled} onClick={() => reconcile(open.id)}>
                <CheckCheckIcon /> Conciliar
              </Button>
            </DetailFooter>
          </>
        )}
      </DetailSheet>
    </PageBody>
  )
}
