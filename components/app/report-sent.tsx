"use client"

// Pestaña «Enviados» de `ReportButton`: los reportes que ha mandado quien la abre, con su estado y la respuesta.

import * as React from "react"
import { LightbulbIcon } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState, ErrorState } from "@/components/app/states"
import { StatusBadge } from "@/components/app/status-badge"
import { fmt } from "@/lib/format"
import type { StatusTone } from "@/lib/status"
import type { ReportAttachmentLink } from "@/components/app/report-attachments"

export type ReportStatus = "open" | "in_progress" | "resolved" | "dismissed"

export type ReportItem = {
  id: string
  description: string
  status: ReportStatus
  url: string
  createdAt: Date | string
  /** Qué se hizo o por qué se descarta. */
  resolution?: string | null
  /** Imágenes y lienzos que se adjuntaron. */
  attachments?: ReportAttachmentLink[]
  /** Quién lo envió; solo si la lista es de todo el equipo. */
  author?: string | null
}

export const reportStatus: Record<ReportStatus, { label: string; tone: StatusTone }> = {
  open: { label: "Pendiente", tone: "warning" },
  in_progress: { label: "En curso", tone: "info" },
  resolved: { label: "Resuelto", tone: "success" },
  dismissed: { label: "Descartado", tone: "neutral" },
}

type SentState = { status: "loading" } | { status: "error" } | { status: "ready"; items: ReportItem[] }

export function SentReports({ load }: { load: () => Promise<ReportItem[]> }) {
  const [state, setState] = React.useState<SentState>({ status: "loading" })
  const [attempt, setAttempt] = React.useState(0)

  React.useEffect(() => {
    let alive = true
    load()
      .then((items) => alive && setState({ status: "ready", items }))
      .catch(() => alive && setState({ status: "error" }))
    return () => {
      alive = false
    }
  }, [load, attempt])

  if (state.status === "loading")
    return (
      <div className="grid gap-2">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-[72px] w-full rounded-lg" />
        ))}
      </div>
    )
  if (state.status === "error")
    return (
      <ErrorState
        className="py-8"
        title="No se han podido cargar tus envíos"
        onRetry={() => {
          setState({ status: "loading" })
          setAttempt((a) => a + 1)
        }}
      />
    )
  if (!state.items.length)
    return (
      <EmptyState
        className="py-8"
        icon={LightbulbIcon}
        title="Aún no has enviado nada"
        description="Cuando envíes una sugerencia o un problema, aquí verás si está pendiente, en curso o resuelto."
      />
    )
  return (
    <ul className="max-h-[min(26rem,55vh)] divide-y overflow-y-auto rounded-lg border">
      {state.items.map((r) => (
        <li key={r.id} className="grid gap-1.5 px-3 py-2.5">
          <div className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
            <StatusBadge tone={reportStatus[r.status].tone}>{reportStatus[r.status].label}</StatusBadge>
            <span className="min-w-0 truncate font-mono">{r.url}</span>
            <span className="ml-auto shrink-0 tabular-nums">
              {r.author ? `${r.author} · ` : ""}
              {fmt.date(r.createdAt)}
            </span>
          </div>
          <p className="line-clamp-3 text-sm whitespace-pre-line">{r.description}</p>
          {!!r.attachments?.length && (
            <ul className="flex flex-wrap gap-1.5">
              {r.attachments.map((a) => (
                <li key={a.url}>
                  <a
                    href={a.url}
                    target="_blank"
                    rel="noreferrer"
                    title={a.kind === "canvas" ? `Lienzo · ${a.name}` : a.name}
                    className="block size-10 overflow-hidden rounded border bg-muted transition-opacity hover:opacity-80"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- miniatura de Blob, sin dominio fijo para next/image */}
                    <img src={a.url} alt={a.name} loading="lazy" className="size-full object-cover object-top" />
                  </a>
                </li>
              ))}
            </ul>
          )}
          {r.resolution && (
            <p className="rounded-md bg-muted/60 px-2.5 py-1.5 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Respuesta · </span>
              {r.resolution}
            </p>
          )}
        </li>
      ))}
    </ul>
  )
}
