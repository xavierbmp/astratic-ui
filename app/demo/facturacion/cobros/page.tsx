import { demoPayments } from "@/lib/demo-data"
import { CobrosView } from "./cobros-view"

export const metadata = { title: "Cobros · Facturación" }

export default async function CobrosPage({ searchParams }: { searchParams: Promise<{ cobro?: string }> }) {
  const { cobro } = await searchParams
  return <CobrosView initialPayments={demoPayments} initialOpenId={cobro ?? null} />
}
