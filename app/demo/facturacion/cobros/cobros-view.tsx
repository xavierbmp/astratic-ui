"use client"

import * as React from "react"
import Link from "next/link"
import { toast } from "sonner"
import { BanknoteIcon, CheckCheckIcon, CircleCheckIcon, CreditCardIcon, DownloadIcon, ReceiptTextIcon, TimerIcon, TriangleAlertIcon } from "lucide-react"
import { fmt } from "@/lib/format"
import { demoInvoices, paymentMethods, type DemoPayment, type PaymentMethod } from "@/lib/demo-data"
import { useBaseLocal, useEnNavegador } from "@/hooks/use-base-local"
import { camposDemoCobros, escribirEnCobro, vistasDemoCobros } from "@/lib/demo-base"
import { Button } from "@/components/ui/button"
import { PageBody, PageHeader } from "@/components/app/page-header"
import { PageTabs } from "@/components/app/page-tabs"
import { KpiCard, KpiRow } from "@/components/app/kpi"
import { WorkGrid } from "@/components/app/work-grid"
import { BaseDatos } from "@/components/app/base/base-datos"
import { StatusBadge } from "@/components/app/status-badge"
import { AvatarInitials } from "@/components/app/avatar-initials"
import { EmptyState } from "@/components/app/states"
import { InsightList, InsightStat, InsightsPanel } from "@/components/app/insights-panel"
import { DetailBody, DetailField, DetailFields, DetailFooter, DetailHeader, DetailSection, DetailSheet } from "@/components/app/detail-sheet"
import { facturacionTabs } from "../../nav"

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
  const enNavegador = useEnNavegador()
  const camposBase = React.useMemo(() => camposDemoCobros(), [])
  const base = useBaseLocal("demo-cobros", camposBase, vistasDemoCobros)
  const [openId, setOpenIdState] = React.useState<string | null>(initialOpenId)
  const setOpenId = (id: string | null) => {
    setOpenIdState(id)
    const url = new URL(window.location.href)
    if (id) url.searchParams.set("cobro", id)
    else url.searchParams.delete("cobro")
    window.history.replaceState(null, "", url)
  }

  const open = openId ? payments.find((p) => p.id === openId) ?? null : null

  const sum = (list: DemoPayment[]) => list.reduce((a, p) => a + p.amount, 0)
  const thisMonth = payments.filter((p) => p.paidAt.startsWith(MONTH))
  const unreconciled = payments.filter((p) => !p.reconciled)
  const days = payments.map((p) => {
    const f = demoInvoices.find((x) => x.id === p.invoiceId)!
    return (new Date(p.paidAt).getTime() - new Date(f.issuedAt).getTime()) / 86_400_000
  })
  const avgDays = Math.round(days.reduce((a, d) => a + d, 0) / Math.max(1, days.length))

  const reconcile = (id: string) => {
    setPayments((list) => list.map((p) => (p.id === id ? { ...p, reconciled: true } : p)))
    toast.success("Cobro conciliado")
  }

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
        <div className="h-[600px] xl:h-full">
          {enNavegador && (
            <BaseDatos
              clave="demo-cobros"
              lateralInicial={false}
              base={base}
              campos={camposBase}
              filas={payments}
              getId={(p) => p.id}
              hoy="2026-09-15"
              objeto={{ singular: "cobro", plural: "cobros", nuevo: "Registrar cobro" }}
              abiertoId={openId}
              onAbrir={setOpenId}
              onEscribir={(cambios) => setPayments((ps) => ps.map((p) => cambios.filter((c) => c.fila.id === p.id).reduce((x, c) => escribirEnCobro(x, c.campo, c.valor), p)))}
              onNuevo={() => toast("Aquí se abriría el formulario del cobro")}
              vacio={(hayFiltro, limpiar) => (
                <EmptyState
                  title={hayFiltro ? "Ningún cobro coincide" : "Aún no hay cobros"}
                  description={hayFiltro ? "Prueba con otra búsqueda o quita algún filtro." : "Los cobros salen de las facturas pagadas."}
                  action={hayFiltro ? <Button variant="outline" size="sm" onClick={limpiar}>Quitar filtros</Button> : undefined}
                />
              )}
            />
          )}
        </div>
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
