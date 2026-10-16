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
  ReceiptTextIcon,
  SendIcon,
} from "lucide-react"
import { fmt } from "@/lib/format"
import { demoPayments, invoiceStatus, invoiceTotal, type DemoInvoice, type InvoiceStatus } from "@/lib/demo-data"
import { useBaseLocal, useEnNavegador } from "@/hooks/use-base-local"
import { camposDemoFacturas, escribirEnFactura, vistasDemoFacturas } from "@/lib/demo-base"
import { Button } from "@/components/ui/button"
import { PageBody, PageHeader } from "@/components/app/page-header"
import { PageTabs } from "@/components/app/page-tabs"
import { KpiCard, KpiRow } from "@/components/app/kpi"
import { WorkGrid } from "@/components/app/work-grid"
import { BaseDatos } from "@/components/app/base/base-datos"
import { StatusBadge } from "@/components/app/status-badge"
import { AvatarInitials } from "@/components/app/avatar-initials"
import { EmptyState } from "@/components/app/states"
import { InsightList, InsightsPanel } from "@/components/app/insights-panel"
import { DetailBody, DetailField, DetailFields, DetailFooter, DetailHeader, DetailSection, DetailSheet } from "@/components/app/detail-sheet"
import { facturacionTabs } from "../nav"
import { copiarTexto } from "@/lib/portapapeles"

const MONTH = "2026-09"

export function FacturasView({
  initialInvoices,
  initialOpenId = null,
}: {
  initialInvoices: DemoInvoice[]
  initialOpenId?: string | null
}) {
  const [invoices, setInvoices] = React.useState<DemoInvoice[]>(initialInvoices)
  const enNavegador = useEnNavegador()
  const camposBase = React.useMemo(() => camposDemoFacturas(), [])
  const base = useBaseLocal("demo-facturas", camposBase, vistasDemoFacturas)
  const [openId, setOpenIdState] = React.useState<string | null>(initialOpenId)
  const setOpenId = (id: string | null) => {
    setOpenIdState(id)
    const url = new URL(window.location.href)
    if (id) url.searchParams.set("factura", id)
    else url.searchParams.delete("factura")
    window.history.replaceState(null, "", url)
  }

  const open = openId ? invoices.find((f) => f.id === openId) ?? null : null

  const sum = (list: DemoInvoice[]) => list.reduce((a, f) => a + invoiceTotal(f.base), 0)
  const issuedThisMonth = invoices.filter((f) => f.status !== "borrador" && f.issuedAt.startsWith(MONTH))
  const pending = invoices.filter((f) => f.status === "enviada" || f.status === "vencida")
  const overdue = invoices.filter((f) => f.status === "vencida")
  const collectedThisMonth = demoPayments.filter((p) => p.paidAt.startsWith(MONTH)).reduce((a, p) => a + p.amount, 0)

  const setStatus = (id: string, status: InvoiceStatus) =>
    setInvoices((list) => list.map((f) => (f.id === id ? { ...f, status, paidAt: status === "pagada" ? "2026-09-15" : f.paidAt } : f)))

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
        <div className="h-[600px] xl:h-full">
          {enNavegador && (
            <BaseDatos
              clave="demo-facturas"
              lateralInicial={false}
              base={base}
              campos={camposBase}
              filas={invoices}
              getId={(f) => f.id}
              hoy="2026-09-15"
              objeto={{ singular: "factura", plural: "facturas", nuevo: "Nueva factura" }}
              abiertoId={openId}
              onAbrir={setOpenId}
              onEscribir={(cambios) => setInvoices((fs) => fs.map((f) => cambios.filter((c) => c.fila.id === f.id).reduce((x, c) => escribirEnFactura(x, c.campo, c.valor), f)))}
              onNuevo={() => toast("Aquí se abriría el formulario de la factura")}
              kanban={{ resumen: (fs) => fmt.eur(sum(fs)) }}
              vacio={(hayFiltro, limpiar) => (
                <EmptyState
                  title={hayFiltro ? "Ninguna factura coincide" : "Aún no hay facturas"}
                  description={hayFiltro ? "Prueba con otra búsqueda o quita algún filtro." : "Crea la primera con «Nueva factura»."}
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
              subtitle={open.recordName}
              status={<StatusBadge tone={invoiceStatus[open.status].tone}>{invoiceStatus[open.status].label}</StatusBadge>}
              actions={
                <>
                  <Button variant="outline" size="sm" onClick={() => toast.success("PDF descargado")}><FileTextIcon /> Descargar PDF</Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      await copiarTexto(`${window.location.origin}/demo/facturacion?factura=${open.id}`, "Enlace copiado")
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
