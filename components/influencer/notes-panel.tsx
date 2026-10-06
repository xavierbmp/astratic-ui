"use client"

import * as React from "react"
import { CheckIcon, CornerDownRightIcon, MessageSquareIcon, QuoteIcon, TimerIcon, XIcon } from "lucide-react"
import { cn } from "cn"
import { fmt } from "@/lib/format"
import type { AnclaNota, Nota } from "@/lib/influencer/modelo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { segundos } from "@/components/influencer/video-viewer"

function Ancla({ ancla }: { ancla: AnclaNota }) {
  return ancla.tipo === "segundo" ? (
    <span className="inline-flex items-center gap-1 rounded-md bg-muted px-1.5 py-px font-mono text-[11px]">
      <TimerIcon className="size-3" /> {segundos(ancla.segundo)}
    </span>
  ) : (
    <span className="inline-flex max-w-full items-center gap-1 rounded-md bg-muted px-1.5 py-px text-[11px]">
      <QuoteIcon className="size-3 flex-none" /> <span className="truncate">{ancla.cita}</span>
    </span>
  )
}

/**
 * Las notas de una versión, numeradas como sus marcas en el guion o el vídeo. Para ella: marcar
 * cada una como resuelta y contestar. Para la marca (`modo="marca"`): escribir notas nuevas,
 * ancladas al texto seleccionado o al segundo marcado.
 */
export function NotesPanel({
  notas,
  modo,
  seleccionada,
  onSeleccionar,
  onResolver,
  onResponder,
  onNueva,
  anclaPendiente,
  onQuitarAncla,
  autor,
  onAutor,
  className,
}: {
  notas: Nota[]
  modo: "influencer" | "marca"
  seleccionada?: string | null
  onSeleccionar?: (id: string | null) => void
  onResolver?: (id: string) => void
  onResponder?: (id: string, texto: string) => void
  onNueva?: (texto: string, ancla?: AnclaNota) => void
  anclaPendiente?: AnclaNota | null
  onQuitarAncla?: () => void
  autor?: string
  onAutor?: (nombre: string) => void
  className?: string
}) {
  const [texto, setTexto] = React.useState("")
  const [respondiendo, setRespondiendo] = React.useState<string | null>(null)
  const [respuesta, setRespuesta] = React.useState("")
  const resueltas = notas.filter((n) => n.resuelta).length

  const enviar = () => {
    const t = texto.trim()
    if (!t) return
    onNueva?.(t, anclaPendiente ?? undefined)
    setTexto("")
    onQuitarAncla?.()
  }

  return (
    <div data-slot="ws-notes" className={cn("flex flex-col gap-3", className)}>
      {notas.length > 0 && (
        <div>
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium">{modo === "marca" ? "Tus notas" : "Notas de la marca"}</span>
            <span className="text-muted-foreground tabular-nums">
              {resueltas} de {notas.length} resueltas
            </span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-success transition-all" style={{ width: `${(resueltas / notas.length) * 100}%` }} />
          </div>
        </div>
      )}

      {notas.length === 0 ? (
        <p className="rounded-xl border border-dashed px-3 py-5 text-center text-xs text-muted-foreground">
          {modo === "marca" ? "Todavía no has dejado notas. Selecciona texto o pulsa en la barra del vídeo para anclar una." : "La marca aún no ha dejado notas en esta versión."}
        </p>
      ) : (
        <ol className="flex flex-col gap-2">
          {notas.map((n, i) => (
            <li key={n.id} onClick={() => onSeleccionar?.(seleccionada === n.id ? null : n.id)} className={cn("cursor-pointer rounded-xl border p-3 transition-colors", seleccionada === n.id ? "border-brand bg-brand-soft/60" : "border-transparent bg-background/70 hover:bg-muted", n.resuelta && "opacity-75")}>
              <div className="flex items-start gap-2.5">
                <span className={cn("mt-0.5 grid size-5 flex-none place-items-center rounded-full text-[11px] font-semibold text-white", n.resuelta ? "bg-success" : "bg-brand")}>{n.resuelta ? <CheckIcon className="size-3" strokeWidth={3} /> : i + 1}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2 text-xs">
                    <span className="font-semibold">{n.autor}</span>
                    <span className="text-muted-foreground">{fmt.time(n.el)}</span>
                    {n.ancla && <Ancla ancla={n.ancla} />}
                  </div>
                  <p className={cn("mt-1 text-sm", n.resuelta && "line-through decoration-muted-foreground/50")}>{n.texto}</p>
                  {n.respuesta && (
                    <p className="mt-1.5 flex items-start gap-1.5 text-xs text-muted-foreground">
                      <CornerDownRightIcon className="mt-0.5 size-3 flex-none" />
                      <span>
                        <span className="font-medium text-foreground">Marta:</span> {n.respuesta}
                      </span>
                    </p>
                  )}
                  {modo === "influencer" && (
                    <div className="mt-2 flex flex-wrap items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <Button variant={n.resuelta ? "ghost" : "outline"} size="sm" onClick={() => onResolver?.(n.id)}>
                        <CheckIcon /> {n.resuelta ? "Reabrir" : "Resuelta"}
                      </Button>
                      {!n.respuesta && respondiendo !== n.id && (
                        <Button variant="ghost" size="sm" onClick={() => setRespondiendo(n.id)}>
                          <MessageSquareIcon /> Responder
                        </Button>
                      )}
                      {respondiendo === n.id && (
                        <form
                          className="flex w-full items-center gap-1.5"
                          onSubmit={(e) => {
                            e.preventDefault()
                            if (respuesta.trim()) onResponder?.(n.id, respuesta.trim())
                            setRespuesta("")
                            setRespondiendo(null)
                          }}
                        >
                          <Input value={respuesta} onChange={(e) => setRespuesta(e.target.value)} placeholder="Tu respuesta" autoFocus className="h-8" />
                          <Button type="submit" size="sm">Enviar</Button>
                        </form>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}

      {modo === "marca" && onNueva && (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            enviar()
          }}
          className="flex flex-col gap-2 rounded-xl bg-background/70 p-3"
        >
          {onAutor && <Input value={autor ?? ""} onChange={(e) => onAutor(e.target.value)} placeholder="Tu nombre" aria-label="Tu nombre" className="h-8" />}
          {anclaPendiente && (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              Nota en <Ancla ancla={anclaPendiente} />
              <Button type="button" variant="ghost" size="icon-sm" aria-label="Quitar el ancla" className="size-6" onClick={onQuitarAncla}>
                <XIcon />
              </Button>
            </span>
          )}
          <Textarea value={texto} onChange={(e) => setTexto(e.target.value)} rows={2} placeholder="Escribe una nota, o selecciona texto o un segundo del vídeo para anclarla" />
          <Button type="submit" size="sm" className="self-end" disabled={!texto.trim()}>
            Añadir nota
          </Button>
        </form>
      )}
    </div>
  )
}
