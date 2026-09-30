"use client"

import * as React from "react"
import type { LucideIcon } from "lucide-react"
import { Trash2Icon } from "lucide-react"
import { cn } from "cn"
import { fmt } from "@/lib/format"
import { statusToneClass, type StatusTone } from "@/lib/status"
import { InlineAutoEdit, InlineField } from "@/components/app/inline-field"

export type LogEntry = {
  id: string
  /** Lo que fue: «Follow-up 3», «Status», «Llamada». */
  title: React.ReactNode
  date: Date | string
  /** Texto libre de la entrada. Vacío no ocupa sitio: se ofrece «Añadir nota». */
  note?: string | null
  /** Quién la apuntó. */
  author?: string | null
  icon: LucideIcon
  tone?: StatusTone
  /** Quien la mira no puede tocarla (no es suya): se lee, sin editor ni papelera. */
  locked?: boolean
}

/**
 * Registro de seguimiento de un registro: lo que se ha ido haciendo con él, lo último arriba. Cada
 * entrada nace de un botón (`actions`: «Follow-up», «Status») y **se crea al pulsarlo**, con la
 * fecha de hoy; la nota es opcional y se escribe después, en la propia tarjeta. No hay formulario
 * previo: apuntar un seguimiento cuesta un clic.
 */
export function InteractionLog({
  entries,
  actions,
  onSaveNote,
  onDelete,
  autoEditId,
  empty = "Todavía no hay nada apuntado.",
  notePlaceholder = "Añadir nota",
  className,
}: {
  entries: LogEntry[]
  /** Botones que crean una entrada, outline `sm`, con icono y verbo. */
  actions?: React.ReactNode
  /** Si se pasa, la nota de cada entrada se edita en el sitio. Devuelve el error o nada. */
  onSaveNote?: (entry: LogEntry, note: string | null) => Promise<string | void>
  /** Si se pasa, cada entrada enseña su papelera al pasar el ratón. La página confirma el borrado. */
  onDelete?: (entry: LogEntry) => void
  /** Entrada recién creada cuya nota arranca ya editándose (un «Status» se crea para escribirlo). */
  autoEditId?: string | null
  empty?: React.ReactNode
  notePlaceholder?: string
  className?: string
}) {
  return (
    <div data-slot="interaction-log" className={cn("flex flex-col gap-2.5", className)}>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      {entries.length === 0 ? (
        <p className="rounded-lg border border-dashed px-3 py-4 text-center text-xs text-muted-foreground">{empty}</p>
      ) : (
        <ol className="flex flex-col gap-1.5">
          {entries.map((e) => {
            const Icon = e.icon
            return (
              <li key={e.id} className="group/entrada rounded-lg border bg-card px-2.5 py-2">
                <div className="flex items-center gap-2">
                  <span className={cn("inline-flex size-5 flex-none items-center justify-center rounded-md", statusToneClass[e.tone ?? "neutral"])}>
                    <Icon className="size-3" aria-hidden />
                  </span>
                  <span className="min-w-0 truncate text-[13px] font-semibold">{e.title}</span>
                  <span className="ml-auto flex-none text-xs text-muted-foreground tabular-nums" title={fmt.dateLong(e.date)}>
                    {fmt.date(e.date)}
                  </span>
                  {onDelete && !e.locked && (
                    <button
                      type="button"
                      aria-label="Eliminar la entrada"
                      title="Eliminar"
                      onClick={() => onDelete(e)}
                      className="-mr-1 inline-flex size-5 flex-none items-center justify-center rounded-md text-muted-foreground opacity-0 outline-none transition-opacity hover:bg-muted hover:text-danger focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring/50 group-hover/entrada:opacity-100"
                    >
                      <Trash2Icon className="size-3" />
                    </button>
                  )}
                </div>
                {onSaveNote && !e.locked ? (
                  <div className="mt-0.5 pl-7 text-[13px]">
                    <InlineAutoEdit.Provider value={e.id === autoEditId}>
                      <InlineField value={e.note ?? null} tipo="textarea" placeholder={notePlaceholder} multiline={2} onSave={(v) => onSaveNote(e, v ? String(v) : null)} />
                    </InlineAutoEdit.Provider>
                  </div>
                ) : (
                  e.note && <p className="mt-1 pl-7 text-[13px] whitespace-pre-wrap text-muted-foreground">{e.note}</p>
                )}
                {e.author && <p className="mt-0.5 pl-7 text-[11px] text-muted-foreground/80">{e.author}</p>}
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}
