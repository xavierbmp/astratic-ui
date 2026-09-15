"use client"

import { ActivityIcon, BanknoteIcon, KanbanSquareIcon } from "lucide-react"
import { fmt } from "@/lib/format"
import { InsightList, InsightStat, InsightsPanel } from "@/components/app/insights-panel"
import { AvatarInitials } from "@/components/app/avatar-initials"

const fases = [
  { label: "Nuevo", n: 6 },
  { label: "En contacto", n: 5 },
  { label: "Propuesta enviada", n: 4 },
  { label: "Negociando", n: 3 },
  { label: "Ganado", n: 6 },
]
const total = fases.reduce((a, f) => a + f.n, 0)

const actividad = Array.from({ length: 4 }, (_, i) => ({
  id: `act-${i + 1}`,
  who: `Usuario ${i + 1}`,
  what: ["cambió el estado", "añadió una nota", "adjuntó un archivo", "creó el registro"][i],
  target: `Registro ${(i + 1) * 3}`,
  when: `hace ${i + 1} h`,
}))

export function InsightsDemo() {
  return (
    <div className="h-[440px] w-80 max-w-full">
      <InsightsPanel
        storageKey="docs-insights"
        blocks={[
          {
            id: "resumen",
            title: "Resumen",
            icon: BanknoteIcon,
            render: () => (
              <div className="divide-y">
                <InsightStat label="Valor medio" value={fmt.eur(33300)} />
                <InsightStat label="Ganados este mes" value={6} sub={fmt.eur(199800)} />
                <InsightStat label="Sin actividad 7 días" value={3} />
              </div>
            ),
          },
          {
            id: "actividad",
            title: "Actividad",
            icon: ActivityIcon,
            render: () => (
              <InsightList
                items={actividad.map((a) => ({
                  key: a.id,
                  leading: <AvatarInitials name={a.who} size="sm" />,
                  title: (
                    <>
                      <span className="font-semibold">{a.who}</span> {a.what}
                    </>
                  ),
                  subtitle: a.target,
                  trailing: <span className="text-muted-foreground">{a.when}</span>,
                }))}
              />
            ),
          },
          {
            id: "fases",
            title: "Por fase",
            icon: KanbanSquareIcon,
            defaultVisible: false,
            render: () => (
              <ul className="flex flex-col gap-2">
                {fases.map((f) => (
                  <li key={f.label} className="text-xs">
                    <span className="flex items-center justify-between">
                      <span>{f.label}</span>
                      <span className="tabular-nums text-muted-foreground">{f.n}</span>
                    </span>
                    <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-muted">
                      <span className="block h-full rounded-full bg-brand" style={{ width: `${(f.n / total) * 100}%` }} />
                    </span>
                  </li>
                ))}
              </ul>
            ),
          },
        ]}
      />
    </div>
  )
}
