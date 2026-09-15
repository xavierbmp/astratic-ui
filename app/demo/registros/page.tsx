import { demoRecords } from "@/lib/demo-data"
import { RegistrosView } from "./registros-view"

export const metadata = { title: "Registros" }

export default async function RegistrosPage({ searchParams }: { searchParams: Promise<{ registro?: string }> }) {
  const { registro } = await searchParams
  return <RegistrosView initialRecords={demoRecords} initialOpenId={registro ?? null} />
}
