"use client"

import { BanknoteIcon, CalendarClockIcon, KanbanSquareIcon } from "lucide-react"
import { toast } from "sonner"
import { InsightList, InsightStat, InsightsPanel, type InsightBlock } from "@/components/app/insights-panel"
import { AvatarInitials } from "@/components/app/avatar-initials"
import { fmt } from "@/lib/format"

const fases = [
  { id: "nuevo", label: "Nuevo", n: 4 },
  { id: "en-curso", label: "En curso", n: 6 },
  { id: "revision", label: "En revisión", n: 3 },
  { id: "cerrado", label: "Cerrado", n: 5 },
]
const total = fases.reduce((a, f) => a + f.n, 0)

const vencimientos = [
  { id: "r7", name: "Registro 7", owner: "Usuario 2", dueAt: "2026-09-18" },
  { id: "r3", name: "Registro 3", owner: "Usuario 1", dueAt: "2026-09-22" },
  { id: "r11", name: "Registro 11", owner: "Usuario 3", dueAt: "2026-09-30" },
  { id: "r5", name: "Registro 5", owner: "Usuario 1", dueAt: "2026-10-06" },
]

const blocks: InsightBlock[] = [
  {
    id: "resumen",
    title: "Resumen",
    icon: BanknoteIcon,
    render: () => (
      <div className="divide-y">
        <InsightStat label="Registros" value={total} />
        <InsightStat label="Valor medio" value={fmt.eur(4820)} />
        <InsightStat label="Cerrados este mes" value={5} sub={fmt.eur(38400)} />
      </div>
    ),
  },
  {
    id: "fases",
    title: "Por fase",
    icon: KanbanSquareIcon,
    render: () => (
      <ul className="flex flex-col gap-2">
        {fases.map((f) => (
          <li key={f.id} className="text-xs">
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
  {
    id: "vencimientos",
    title: "Próximos vencimientos",
    icon: CalendarClockIcon,
    action: (
      <button type="button" className="hover:text-foreground" onClick={() => toast("Aquí se abriría la lista completa")}>
        Ver todas
      </button>
    ),
    render: () => (
      <InsightList
        items={vencimientos.map((v) => ({
          key: v.id,
          leading: <AvatarInitials name={v.owner} size="sm" />,
          title: v.name,
          subtitle: v.owner,
          trailing: <span className="text-muted-foreground">{fmt.date(v.dueAt)}</span>,
        }))}
      />
    ),
  },
]

export function PanelDemo() {
  return (
    <div className="h-[420px] w-80 max-w-full">
      <InsightsPanel storageKey="docs-paneles" blocks={blocks} />
    </div>
  )
}
