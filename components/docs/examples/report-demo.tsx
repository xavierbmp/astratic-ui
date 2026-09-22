"use client"

import { BellIcon, SearchIcon } from "lucide-react"
import { ReportButton, type ReportDraft, type ReportItem } from "@/components/app/report-button"
import { Button } from "@/components/ui/button"
import { Kbd } from "@/components/ui/kbd"

// La demo no guarda nada: los reportes viven en memoria mientras la pestaña esté abierta.
const dia = 86_400_000
const reports: ReportItem[] = [
  {
    id: "demo-2",
    description: "Al filtrar por «Vencidas» la tabla se queda en blanco un segundo antes de pintarse.",
    status: "in_progress",
    url: "/demo/tareas",
    createdAt: new Date(Date.now() - 1 * dia),
    resolution: "Lo estamos mirando: la consulta tarda más de lo normal con ese filtro.",
  },
  {
    id: "demo-1",
    description: "El botón «Nueva factura» se sale de la toolbar en el móvil.",
    status: "resolved",
    url: "/demo/facturacion",
    createdAt: new Date(Date.now() - 4 * dia),
    resolution: "Las acciones bajan a su propia línea cuando no caben. Ya está publicado.",
  },
]

async function enviar(r: ReportDraft) {
  await new Promise((ok) => setTimeout(ok, 400))
  reports.unshift({ id: `demo-${Date.now()}`, description: r.description, status: "open", url: r.context.url, createdAt: new Date() })
}

async function cargar() {
  await new Promise((ok) => setTimeout(ok, 300))
  return [...reports]
}

export function DemoReportButton({ shortcut = true }: { shortcut?: boolean }) {
  return <ReportButton onSubmit={enviar} loadReports={cargar} shortcut={shortcut} />
}

/** La cabecera del shell en pequeño, con el botón en su sitio. */
export function ReportExample() {
  return (
    <div className="flex h-12 items-center gap-1.5 rounded-lg border bg-background px-4">
      <span className="text-sm text-muted-foreground">
        Operación <span className="mx-1">›</span> <span className="font-medium text-foreground">Registros</span>
      </span>
      <div className="ml-auto flex items-center gap-1.5">
        <span className="hidden h-8 w-56 items-center gap-2 rounded-lg border bg-background px-2.5 text-sm text-muted-foreground sm:flex">
          <SearchIcon className="size-3.5" />
          <span className="flex-1">Buscar en el portal…</span>
          <Kbd>⌘K</Kbd>
        </span>
        {/* Sin atajo: ⇧⌘X ya lo atiende el bicho de la cabecera de esta página. */}
        <DemoReportButton shortcut={false} />
        <Button variant="ghost" size="icon" aria-label="Notificaciones">
          <BellIcon />
        </Button>
      </div>
    </div>
  )
}
