import { demoInvoices } from "@/lib/demo-data"
import { FacturasView } from "./facturas-view"

export const metadata = { title: "Facturas · Facturación" }

export default async function FacturasPage({ searchParams }: { searchParams: Promise<{ factura?: string }> }) {
  const { factura } = await searchParams
  return <FacturasView initialInvoices={demoInvoices} initialOpenId={factura ?? null} />
}
