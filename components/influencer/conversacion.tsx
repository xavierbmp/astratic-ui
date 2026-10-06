"use client"

import * as React from "react"
import { CheckIcon, CornerDownRightIcon, MapPinIcon, QuoteIcon, SendHorizontalIcon, TimerIcon, XIcon } from "lucide-react"
import { cn } from "cn"
import { fmt, initials } from "@/lib/format"
import type { AnclaNota, Comentario, Nota } from "@/lib/influencer/modelo"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function segundos(s: number) {
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`
}

/** Dónde va una nota, en una etiqueta: la cita, el segundo o la foto. */
export function AnclaChip({ ancla, className }: { ancla: AnclaNota; className?: string }) {
  const icono = ancla.tipo === "texto" ? QuoteIcon : ancla.tipo === "segundo" ? TimerIcon : MapPinIcon
  const Icono = icono
  const texto = ancla.tipo === "texto" ? ancla.cita : ancla.tipo === "segundo" ? segundos(ancla.segundo) : `Foto ${ancla.imagen + 1}`
  return (
    <span className={cn("inline-flex max-w-full items-center gap-1 rounded-md bg-muted px-1.5 py-px text-[11px] text-muted-foreground", ancla.tipo === "segundo" && "font-mono", className)}>
      <Icono className="size-3 flex-none" aria-hidden />
      <span className="truncate">{texto}</span>
    </span>
  )
}

function Avatar({ nombre, lado }: { nombre: string; lado: Comentario["lado"] }) {
  return <span className={cn("grid size-6 flex-none place-items-center rounded-full text-[10px] font-semibold", lado === "influencer" ? "bg-brand text-brand-foreground" : "bg-muted text-muted-foreground")}>{initials(nombre)}</span>
}

function Burbuja({ m, propia }: { m: Comentario; propia: boolean }) {
  return (
    <li className={cn("flex items-end gap-2", propia && "flex-row-reverse")}>
      <Avatar nombre={m.autor} lado={m.lado} />
      <div className={cn("max-w-[85%]", propia && "text-right")}>
        <p className="mb-0.5 text-[11px] text-muted-foreground">
          {m.autor} · {fmt.date(m.el)}, {fmt.time(m.el)}
        </p>
        <p className={cn("inline-block rounded-2xl px-3 py-2 text-left text-sm", propia ? "rounded-br-md bg-brand-soft" : "rounded-bl-md bg-muted")}>{m.texto}</p>
      </div>
    </li>
  )
}

type Props = {
  notas: Nota[]
  mensajes: Comentario[]
  /** Quién mira: ella (resuelve y contesta) o la marca (deja notas). */
  lado: Comentario["lado"]
  seleccionada?: string | null
  onSeleccionar?: (id: string | null) => void
  onResolver?: (id: string) => void
  onResponder?: (notaId: string, texto: string) => void
  /** Ella: un mensaje a la marca. La marca: una nota, anclada si ha marcado un sitio. */
  onEnviar?: (texto: string, ancla?: AnclaNota) => void
  anclaPendiente?: AnclaNota | null
  onQuitarAncla?: () => void
  /** La versión ya está cerrada (aprobada o con cambios pedidos): se lee, no se escribe. */
  cerrada?: boolean
  placeholder?: string
  className?: string
}

/**
 * La conversación de una versión, como en Feedback: los mensajes y las notas de la marca en orden,
 * cada nota con su número, su sitio en la pieza, su hilo y su estado. «Solo notas» deja lo que hay
 * que resolver. Abajo, el progreso: cuántas notas están resueltas.
 */
export function Conversacion({ notas, mensajes, lado, seleccionada, onSeleccionar, onResolver, onResponder, onEnviar, anclaPendiente, onQuitarAncla, cerrada, placeholder, className }: Props) {
  const [vista, setVista] = React.useState<"todo" | "notas">("todo")
  const [texto, setTexto] = React.useState("")
  const [respondiendo, setRespondiendo] = React.useState<string | null>(null)
  const [respuesta, setRespuesta] = React.useState("")
  const final = React.useRef<HTMLDivElement>(null)
  const resueltas = notas.filter((n) => n.resuelta).length
  const numero = (id: string) => notas.findIndex((n) => n.id === id) + 1

  type Entrada = { tipo: "mensaje"; el: string; m: Comentario } | { tipo: "nota"; el: string; n: Nota }
  const entradas: Entrada[] =
    vista === "notas"
      ? [...notas].sort((a, b) => Number(a.resuelta) - Number(b.resuelta) || a.el.localeCompare(b.el)).map((n) => ({ tipo: "nota", el: n.el, n }))
      : [...mensajes.map((m): Entrada => ({ tipo: "mensaje", el: m.el, m })), ...notas.map((n): Entrada => ({ tipo: "nota", el: n.el, n }))].sort((a, b) => a.el.localeCompare(b.el))

  // Al abrir una nota desde la pieza, la conversación la enseña.
  React.useEffect(() => {
    if (!seleccionada) return
    document.getElementById(`nota-${seleccionada}`)?.scrollIntoView({ block: "nearest", behavior: "smooth" })
  }, [seleccionada])

  const enviar = () => {
    const t = texto.trim()
    if (!t || !onEnviar) return
    onEnviar(t, anclaPendiente ?? undefined)
    setTexto("")
    onQuitarAncla?.()
    requestAnimationFrame(() => final.current?.scrollIntoView({ block: "end" }))
  }

  return (
    <div data-slot="ws-conversacion" className={cn("flex min-h-0 flex-col", className)}>
      <div className="flex items-center gap-2 border-b px-4 py-2.5">
        <h3 className="text-sm font-semibold">Conversación</h3>
        <Tabs value={vista} onValueChange={(v) => setVista(v === "notas" ? "notas" : "todo")} className="ml-auto">
          <TabsList className="h-7">
            <TabsTrigger value="todo" className="text-xs">Todo</TabsTrigger>
            <TabsTrigger value="notas" className="text-xs">
              Solo notas {notas.length - resueltas > 0 && <span className="ml-1 rounded-full bg-warning-soft px-1.5 text-[10px] tabular-nums text-warning">{notas.length - resueltas}</span>}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
        {entradas.length === 0 ? (
          <p className="rounded-xl border border-dashed px-3 py-6 text-center text-xs text-muted-foreground">
            {lado === "marca" ? "Aún no hay notas. Pulsa en la pieza o selecciona texto para dejar una justo ahí." : vista === "notas" ? "La marca no ha dejado notas en esta versión." : "Cuando la marca revise, sus notas aparecen aquí, cada una en su sitio."}
          </p>
        ) : (
          <ol className="flex flex-col gap-3">
            {entradas.map((e) =>
              e.tipo === "mensaje" ? (
                <Burbuja key={e.m.id} m={e.m} propia={e.m.lado === lado} />
              ) : (
                <li
                  key={e.n.id}
                  id={`nota-${e.n.id}`}
                  onClick={() => onSeleccionar?.(seleccionada === e.n.id ? null : e.n.id)}
                  className={cn("cursor-pointer rounded-xl border bg-card transition-colors", seleccionada === e.n.id ? "border-brand ring-1 ring-brand" : "hover:border-input", e.n.resuelta && "opacity-80")}
                >
                  <div className="flex items-start gap-2.5 p-3">
                    <span className={cn("mt-0.5 grid size-5 flex-none place-items-center rounded-full text-[11px] font-semibold text-white", e.n.resuelta ? "bg-success" : "bg-brand")}>{e.n.resuelta ? <CheckIcon className="size-3" strokeWidth={3} /> : numero(e.n.id)}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                        <span className="font-semibold">{e.n.autor}</span>
                        <span className="text-muted-foreground">{fmt.time(e.n.el)}</span>
                        {e.n.ancla && <AnclaChip ancla={e.n.ancla} className="max-w-[60%]" />}
                      </div>
                      <p className={cn("mt-1 text-sm", e.n.resuelta && "text-muted-foreground line-through decoration-muted-foreground/40")}>{e.n.texto}</p>
                    </div>
                  </div>
                  {e.n.respuestas.length > 0 && (
                    <ul className="flex flex-col gap-1.5 border-t px-3 py-2">
                      {e.n.respuestas.map((r) => (
                        <li key={r.id} className="flex items-start gap-1.5 text-xs">
                          <CornerDownRightIcon className="mt-0.5 size-3 flex-none text-muted-foreground" />
                          <span>
                            <span className="font-medium">{r.autor}</span> <span className="text-muted-foreground">{r.texto}</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {!cerrada || lado === "influencer" ? (
                    <div className="flex flex-wrap items-center gap-1.5 border-t px-2 py-1.5" onClick={(ev) => ev.stopPropagation()}>
                      {lado === "influencer" && onResolver && (
                        <Button variant="ghost" size="sm" className={cn("h-7", e.n.resuelta ? "text-muted-foreground" : "text-success hover:text-success")} onClick={() => onResolver(e.n.id)}>
                          <CheckIcon /> {e.n.resuelta ? "Reabrir" : "Hecha"}
                        </Button>
                      )}
                      {onResponder && respondiendo !== e.n.id && (
                        <Button variant="ghost" size="sm" className="h-7 text-muted-foreground" onClick={() => setRespondiendo(e.n.id)}>
                          <CornerDownRightIcon /> Responder
                        </Button>
                      )}
                      {respondiendo === e.n.id && (
                        <form
                          className="flex w-full items-center gap-1.5"
                          onSubmit={(ev) => {
                            ev.preventDefault()
                            if (respuesta.trim()) onResponder?.(e.n.id, respuesta.trim())
                            setRespuesta("")
                            setRespondiendo(null)
                          }}
                        >
                          <input value={respuesta} onChange={(ev) => setRespuesta(ev.target.value)} placeholder="Tu respuesta" aria-label="Tu respuesta" autoFocus className="h-8 min-w-0 flex-1 rounded-md border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50" />
                          <Button type="submit" size="sm" className="h-8">Enviar</Button>
                        </form>
                      )}
                    </div>
                  ) : null}
                </li>
              ),
            )}
          </ol>
        )}
        <div ref={final} />
      </div>

      {onEnviar && !cerrada && (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            enviar()
          }}
          className="border-t p-3"
        >
          {anclaPendiente && (
            <span className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              Nota en <AnclaChip ancla={anclaPendiente} />
              <Button type="button" variant="ghost" size="icon-sm" aria-label="Quitar el sitio de la nota" className="size-6" onClick={onQuitarAncla}>
                <XIcon />
              </Button>
            </span>
          )}
          <div className="flex items-end gap-2 rounded-xl border border-input bg-background px-2.5 py-1.5 focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50">
            <Textarea
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  enviar()
                }
              }}
              rows={1}
              placeholder={placeholder ?? (lado === "marca" ? "Escribe o pulsa en la pieza para dejar una nota…" : "Escribe a la marca…")}
              aria-label={lado === "marca" ? "Nueva nota" : "Mensaje para la marca"}
              className="max-h-32 min-h-8 resize-none border-0 bg-transparent p-1 shadow-none focus-visible:ring-0 dark:bg-transparent"
            />
            <Button type="submit" size="icon-sm" aria-label="Enviar" disabled={!texto.trim()}>
              <SendHorizontalIcon />
            </Button>
          </div>
        </form>
      )}

      {notas.length > 0 && (
        <div className="border-t px-4 py-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold">{lado === "marca" ? "Tus notas" : "Progreso de las notas"}</span>
            <span className="text-muted-foreground tabular-nums">
              {resueltas} de {notas.length} resueltas
            </span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-success transition-all" style={{ width: `${(resueltas / notas.length) * 100}%` }} />
          </div>
        </div>
      )}
    </div>
  )
}
