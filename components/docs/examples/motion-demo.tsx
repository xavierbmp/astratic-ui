"use client"

import * as React from "react"
import { BellIcon, EyeIcon, EyeOffIcon } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/app/status-badge"

export function MotionDemo() {
  const [open, setOpen] = React.useState(false)
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" onClick={() => setOpen((o) => !o)}>
          {open ? <EyeOffIcon /> : <EyeIcon />}
          {open ? "Ocultar tarjeta" : "Mostrar tarjeta"}
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toast.success("Registro archivado", {
              description: "Acme Studio ya no aparece en la lista.",
              action: { label: "Deshacer", onClick: () => toast("Registro restaurado") },
            })
          }
        >
          <BellIcon /> Lanzar toast
        </Button>
        <span className="font-mono text-[11px] text-muted-foreground">animate-in fade-in-0 slide-in-from-bottom-2 duration-200 ease-out</span>
      </div>
      <div className="min-h-20">
        {open && (
          <div className="flex max-w-sm items-center justify-between gap-3 rounded-lg border bg-card p-4 shadow-xs animate-in fade-in-0 slide-in-from-bottom-2 duration-200 ease-out">
            <div className="grid min-w-0 leading-tight">
              <span className="truncate text-[13.5px] font-semibold">Acme Studio</span>
              <span className="truncate text-xs text-muted-foreground">REG-0042 · Cliente</span>
            </div>
            <StatusBadge tone="info" dot>
              En curso
            </StatusBadge>
          </div>
        )}
      </div>
    </div>
  )
}
