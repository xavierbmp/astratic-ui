"use client"

// Pestaña «Enviados» de `ReportButton`: los reportes que ha mandado quien la abre, con su estado y la respuesta. Los
// suyos que siguen pendientes se pueden cambiar o borrar (reporte cmvlmc1k); en curso ya no.

import * as React from "react"
import { toast } from "sonner"
import { LightbulbIcon, PencilIcon, Trash2Icon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { ConfirmDialog } from "@/components/app/confirm-dialog"
import { EmptyState, ErrorState } from "@/components/app/states"
import { StatusBadge } from "@/components/app/status-badge"
import { fmt } from "@/lib/format"
import type { StatusTone } from "@/lib/status"
import type { ReportAttachmentLink } from "@/components/app/report-attachments"

export type ReportStatus = "open" | "in_progress" | "considering" | "resolved" | "dismissed"

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
  /** Si quien mira puede cambiarlo o borrarlo: es suyo y sigue pendiente. Lo decide el servidor. */
  editable?: boolean
}

export const reportStatus: Record<ReportStatus, { label: string; tone: StatusTone }> = {
  open: { label: "Pendiente", tone: "warning" },
  in_progress: { label: "En curso", tone: "info" },
  considering: { label: "Lo consideraremos", tone: "neutral" },
  resolved: { label: "Resuelto", tone: "success" },
  dismissed: { label: "Descartado", tone: "neutral" },
}

type SentState = { status: "loading" } | { status: "error" } | { status: "ready"; items: ReportItem[] }

export function SentReports({
  load,
  onEdit,
  onDelete,
}: {
  load: () => Promise<ReportItem[]>
  /** Cambia el texto de uno pendiente. Devuelve el error, o nada si ha ido bien. */
  onEdit?: (id: string, description: string) => Promise<string | void>
  /** Borra uno pendiente. Devuelve el error, o nada si ha ido bien. */
  onDelete?: (id: string) => Promise<string | void>
}) {
  const [state, setState] = React.useState<SentState>({ status: "loading" })
  const [attempt, setAttempt] = React.useState(0)
  const [editing, setEditing] = React.useState<{
    id: string
    text: string
  } | null>(null)
  const [deleting, setDeleting] = React.useState<ReportItem | null>(null)
  const [busy, setBusy] = React.useState(false)
  const items = state.status === "ready" ? state.items : []
  const setItems = (f: (items: ReportItem[]) => ReportItem[]) => setState((s) => (s.status === "ready" ? { ...s, items: f(s.items) } : s))

  const save = async () => {
    if (!editing || !onEdit) return
    setBusy(true)
    const error = await onEdit(editing.id, editing.text)
    setBusy(false)
    if (error) return void toast.error(error)
    setItems((all) => all.map((r) => (r.id === editing.id ? { ...r, description: editing.text.trim() } : r)))
    setEditing(null)
    toast.success("Cambio guardado")
  }

  const remove = async () => {
    if (!deleting || !onDelete) return
    const id = deleting.id
    setDeleting(null)
    const error = await onDelete(id)
    if (error) return void toast.error(error)
    setItems((all) => all.filter((r) => r.id !== id))
    toast.success("Borrado")
  }

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
  if (!items.length)
    return (
      <EmptyState
        className="py-8"
        icon={LightbulbIcon}
        title="Aún no has enviado nada"
        description="Cuando envíes una sugerencia o un problema, aquí verás si está pendiente, en curso o resuelto."
      />
    )
  return (
    <>
      <ul className="max-h-[min(26rem,55vh)] divide-y overflow-y-auto rounded-lg border">
        {items.map((r) => (
          <li key={r.id} className="grid gap-1.5 px-3 py-2.5">
            <div className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
              <StatusBadge tone={reportStatus[r.status].tone}>{reportStatus[r.status].label}</StatusBadge>
              <span className="min-w-0 truncate font-mono">{r.url}</span>
              <span className="ml-auto shrink-0 tabular-nums">
                {r.author ? `${r.author} · ` : ""}
                {fmt.date(r.createdAt)}
              </span>
            </div>
            {editing?.id === r.id ? (
              <div className="grid gap-2">
                <Textarea
                  autoFocus
                  rows={3}
                  aria-label="Texto del envío"
                  value={editing.text}
                  onFocus={(e) => e.currentTarget.setSelectionRange(e.currentTarget.value.length, e.currentTarget.value.length)}
                  onChange={(e) => setEditing({ id: r.id, text: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) void save()
                    if (e.key === "Escape") {
                      e.stopPropagation()
                      setEditing(null)
                    }
                  }}
                  className="text-sm"
                />
                <div className="flex justify-end gap-2">
                  <Button type="button" size="sm" variant="ghost" onClick={() => setEditing(null)} disabled={busy}>
                    Cancelar
                  </Button>
                  <Button type="button" size="sm" onClick={() => void save()} disabled={busy || !editing.text.trim() || editing.text.trim() === r.description}>
                    Guardar
                  </Button>
                </div>
              </div>
            ) : (
              <p className="line-clamp-3 text-sm whitespace-pre-line">{r.description}</p>
            )}
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
            {r.editable && editing?.id !== r.id && (onEdit || onDelete) && (
              <div className="-ml-2 flex gap-1">
                {onEdit && (
                  <Button
                    type="button"
                    size="xs"
                    variant="ghost"
                    className="text-muted-foreground"
                    onClick={() => setEditing({ id: r.id, text: r.description })}
                  >
                    <PencilIcon /> Editar
                  </Button>
                )}
                {onDelete && (
                  <Button type="button" size="xs" variant="ghost" className="text-muted-foreground hover:text-danger" onClick={() => setDeleting(r)}>
                    <Trash2Icon /> Borrar
                  </Button>
                )}
              </div>
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
      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="¿Borrar este envío?"
        description={
          deleting
            ? `«${deleting.description.length > 80 ? `${deleting.description.slice(0, 80)}…` : deleting.description}» se borra con sus imágenes y no se puede recuperar.`
            : undefined
        }
        confirmLabel="Borrar"
        destructive
        onConfirm={() => void remove()}
      />
    </>
  )
}
