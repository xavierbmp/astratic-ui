"use client"

import * as React from "react"
import { toast } from "sonner"
import { CalendarClockIcon } from "lucide-react"
import { cn } from "cn"
import { fmt } from "@/lib/format"
import { statusTextClass, type StatusTone } from "@/lib/status"
import { Kanban, type KanbanColumn, type KanbanItem } from "@/components/app/kanban"
import { AvatarInitials } from "@/components/app/avatar-initials"

type Fase = "pendiente" | "curso" | "hecho" | "descartado"

type Tarjeta = KanbanItem & {
  name: string
  code: string
  tag: string
  owner: string
  value: number
  due: string
  status: { label: string; tone: StatusTone }
}

const fases: (KanbanColumn & { id: Fase })[] = [
  { id: "pendiente", title: "Pendiente", tone: "warning" },
  { id: "curso", title: "En curso", tone: "info" },
  { id: "hecho", title: "Hecho", tone: "success" },
  { id: "descartado", title: "Descartado", tone: "neutral" },
]

const inicial: Tarjeta[] = [
  { id: "reg-1", columnId: "pendiente", name: "Registro 1", code: "REG-0001", tag: "Etiqueta 1", owner: "Usuario 1", value: 18400, due: "2026-09-16", status: { label: "Seguimiento", tone: "warning" } },
  { id: "reg-2", columnId: "pendiente", name: "Registro 2", code: "REG-0002", tag: "Etiqueta 2", owner: "Usuario 2", value: 7250, due: "2026-09-22", status: { label: "Borrador", tone: "neutral" } },
  { id: "reg-3", columnId: "pendiente", name: "Registro 3", code: "REG-0003", tag: "Etiqueta 1", owner: "Usuario 3", value: 42000, due: "2026-09-09", status: { label: "Vencido", tone: "danger" } },
  { id: "reg-4", columnId: "curso", name: "Registro 4", code: "REG-0004", tag: "Etiqueta 3", owner: "Usuario 1", value: 12900, due: "2026-09-30", status: { label: "Activo", tone: "success" } },
  { id: "reg-5", columnId: "curso", name: "Registro 5", code: "REG-0005", tag: "Etiqueta 2", owner: "Usuario 2", value: 31500, due: "2026-10-02", status: { label: "Seguimiento", tone: "warning" } },
  { id: "reg-6", columnId: "hecho", name: "Registro 6", code: "REG-0006", tag: "Etiqueta 1", owner: "Usuario 3", value: 5600, due: "2026-09-01", status: { label: "Cerrado", tone: "success" } },
  { id: "reg-7", columnId: "descartado", name: "Registro 7", code: "REG-0007", tag: "Etiqueta 3", owner: "Usuario 1", value: 9800, due: "2026-08-20", status: { label: "Descartado", tone: "neutral" } },
]

export function KanbanDemo() {
  const [items, setItems] = React.useState<Tarjeta[]>(inicial)

  const columns: KanbanColumn[] = fases.map((f) => ({
    ...f,
    meta: fmt.eur(items.filter((i) => i.columnId === f.id).reduce((a, i) => a + i.value, 0)),
  }))

  const onChange = (next: Tarjeta[]) => {
    const moved = next.find((n) => items.find((i) => i.id === n.id)?.columnId !== n.columnId)
    setItems(next)
    if (moved) {
      const fase = fases.find((f) => f.id === moved.columnId)
      toast.success(`${moved.name} movido a ${fase?.title}`, { id: moved.id })
    }
  }

  return (
    <div className="h-[400px]">
      <Kanban
        columns={columns}
        items={items}
        onChange={onChange}
        defaultCollapsed={["descartado"]}
        onCardClick={(i) => toast(`Aquí se abriría el detalle de ${i.name}`)}
        className="p-3"
        renderCard={(i) => (
          <div className="flex flex-col">
            <div className="flex items-start gap-2.5">
              <AvatarInitials name={i.name} variant="entity" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13.5px] leading-[18px] font-semibold">{i.name}</div>
                <div className="mt-px truncate text-xs text-muted-foreground">{i.code}</div>
              </div>
            </div>
            <div className="mt-2.5 flex items-center gap-2">
              <span className="text-sm font-semibold tabular-nums">{fmt.eur(i.value)}</span>
              <span className="ml-auto truncate rounded-md border px-1.5 py-px text-[11px] font-medium text-muted-foreground">{i.tag}</span>
            </div>
            <div className="mt-2.5 flex items-center gap-2 border-t pt-2">
              <span className={cn("inline-flex min-w-0 items-center gap-1 text-xs font-medium", statusTextClass[i.status.tone])}>
                <CalendarClockIcon className="size-3 flex-none" />
                <span className="truncate">{i.status.label} · {fmt.date(i.due)}</span>
              </span>
              <AvatarInitials name={i.owner} size="xs" className="ml-auto" />
            </div>
          </div>
        )}
      />
    </div>
  )
}
