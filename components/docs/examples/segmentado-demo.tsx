"use client"

import * as React from "react"
import { CalendarDaysIcon } from "lucide-react"
import { Section, SectionBody, SectionHeader } from "@/components/app/section"
import { Segmentado } from "@/components/app/segmentado"

const PERIODOS = [
  { id: "semana", label: "Semana" },
  { id: "mes", label: "Mes" },
  { id: "trimestre", label: "Trimestre" },
] as const

/** Un bloque con su segmentado en la cabecera: elige qué periodo enseña. */
export function SegmentadoDemo() {
  const [periodo, setPeriodo] = React.useState<(typeof PERIODOS)[number]["id"]>("mes")
  return (
    <Section className="w-full max-w-md flex-none">
      <SectionHeader icon={CalendarDaysIcon} title="Facturado" action={<Segmentado valor={periodo} onCambiar={setPeriodo} label="Periodo" opciones={[...PERIODOS]} />} />
      <SectionBody className="px-4 py-6 text-sm text-muted-foreground">Lo facturado en {PERIODOS.find((p) => p.id === periodo)?.label.toLowerCase()}.</SectionBody>
    </Section>
  )
}
