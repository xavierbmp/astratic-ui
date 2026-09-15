"use client"

import * as React from "react"
import { toast } from "sonner"
import { ArchiveIcon, ArrowRightIcon } from "lucide-react"
import { cn } from "cn"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { BulkBar } from "@/components/app/bulk-bar"
import { AvatarInitials } from "@/components/app/avatar-initials"
import { StatusBadge } from "@/components/app/status-badge"

const rows = Array.from({ length: 5 }, (_, i) => ({
  id: `r-${i + 1}`,
  name: `Registro ${i + 1}`,
  code: `REG-000${i + 1}`,
  owner: `Usuario ${(i % 3) + 1}`,
  active: i % 2 === 0,
}))

export function BulkBarDemo() {
  const [selected, setSelected] = React.useState<Set<string>>(new Set())

  const toggle = (id: string) =>
    setSelected((s) => {
      const next = new Set(s)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const clear = () => setSelected(new Set())
  const all = selected.size === rows.length

  return (
    <div className="relative h-70 overflow-hidden rounded-lg border bg-card">
      <div className="flex items-center gap-3 border-b bg-muted/40 px-4 py-2 text-xs font-medium text-muted-foreground">
        <Checkbox
          aria-label="Seleccionar todo"
          checked={all ? true : selected.size > 0 ? "indeterminate" : false}
          onCheckedChange={(c) => setSelected(c === true ? new Set(rows.map((r) => r.id)) : new Set())}
        />
        <span className="flex-1">Registro</span>
        <span>Estado</span>
      </div>
      <ul className="divide-y">
        {rows.map((r) => {
          const isSel = selected.has(r.id)
          return (
            <li
              key={r.id}
              data-state={isSel ? "selected" : undefined}
              className={cn("flex items-center gap-3 px-4 py-2 transition-colors", isSel && "bg-brand-soft/60")}
            >
              <Checkbox aria-label={`Seleccionar ${r.name}`} checked={isSel} onCheckedChange={() => toggle(r.id)} />
              <AvatarInitials name={r.name} size="sm" variant="entity" />
              <span className="grid min-w-0 flex-1 leading-tight">
                <span className="truncate text-sm font-medium">{r.name}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {r.code} · {r.owner}
                </span>
              </span>
              <StatusBadge tone={r.active ? "success" : "warning"} dot>
                {r.active ? "Activo" : "Pendiente"}
              </StatusBadge>
            </li>
          )
        })}
      </ul>

      <BulkBar count={selected.size} onClear={clear} className="absolute bottom-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            toast.success(`${selected.size} registros avanzados de fase`)
            clear()
          }}
        >
          <ArrowRightIcon /> Avanzar fase
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            toast.success(`${selected.size} registros archivados`, {
              action: { label: "Deshacer", onClick: () => toast("Registros restaurados") },
            })
            clear()
          }}
        >
          <ArchiveIcon /> Archivar
        </Button>
      </BulkBar>
    </div>
  )
}
