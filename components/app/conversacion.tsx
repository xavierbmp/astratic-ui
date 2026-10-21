"use client"

import * as React from "react"
import { CheckIcon, CornerDownRightIcon, MapPinIcon, PencilLineIcon, QuoteIcon, SendHorizontalIcon, TimerIcon, Trash2Icon, XIcon } from "lucide-react"
import { cn } from "cn"
import { fmt, initials } from "@/lib/format"
import { segundos, type Ancla, type DecisionSugerencia, type Mensaje, type NotaRevision } from "@/lib/revision-notas"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Segmentado } from "@/components/app/segmentado"

/** Dónde va una nota, en una etiqueta: la cita, el segundo o la foto. */
export function AnclaChip({ ancla, className }: { ancla: Ancla; className?: string }) {
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

/** Lo que propone una sugerencia: lo que quita, tachado, y lo que pone, resaltado; y, si ya se decidió, qué se hizo. */
function CambioSugerido({ nota }: { nota: NotaRevision }) {
  const cita = nota.ancla?.tipo === "texto" ? nota.ancla.cita : ""
  const decision = nota.sugerencia?.decision
  return (
    <p className={cn("mt-1 text-sm whitespace-pre-wrap", decision === "rechazada" && "opacity-60")}>
      {cita && <del className="rounded-sm bg-danger-soft px-0.5 text-danger">{cita}</del>} {nota.sugerencia?.poner && <ins className="rounded-sm bg-success-soft px-0.5 text-success no-underline">{nota.sugerencia.poner}</ins>}
      {decision && <span className={cn("ml-1.5 text-xs font-medium", decision === "aceptada" ? "text-success" : "text-muted-foreground")}>{decision === "aceptada" ? "Aceptada" : "Rechazada"}</span>}
    </p>
  )
}

function Avatar({ nombre, autor }: { nombre: string; autor: boolean }) {
  return <span className={cn("grid size-6 flex-none place-items-center rounded-full text-[10px] font-semibold", autor ? "bg-brand text-brand-foreground" : "bg-muted text-muted-foreground")}>{initials(nombre)}</span>
}

function Burbuja({ m, propia, autor }: { m: Mensaje; propia: boolean; autor: boolean }) {
  return (
    <li className={cn("flex items-end gap-2", propia && "flex-row-reverse")}>
      <Avatar nombre={m.autor} autor={autor} />
      <div className={cn("max-w-[85%]", propia && "text-right")}>
        <p className="mb-0.5 text-[11px] text-muted-foreground">
          {m.autor} · {fmt.date(m.el)}, {fmt.time(m.el)}
        </p>
        <p className={cn("inline-block rounded-2xl px-3 py-2 text-left text-sm", propia ? "rounded-br-md bg-brand-soft" : "rounded-bl-md bg-muted")}>{m.texto}</p>
      </div>
    </li>
  )
}

/** Los textos que cambian según quién mira; los de serie sirven para cualquier portal. */
export type TextosConversacion = {
  /** Vacío para quien revisa. */
  vacioRevisor: string
  /** Vacío para quien hace la pieza, con «Solo notas». */
  vacioNotas: string
  /** Vacío para quien hace la pieza, con «Todo». */
  vacioAutor: string
  placeholderRevisor: string
  placeholderAutor: string
  /** Nombre del cuadro de escribir para quien hace la pieza. */
  mensajeAutor: string
}

const TEXTOS: TextosConversacion = {
  vacioRevisor: "Sin notas. Haz clic en el contenido o selecciona texto para añadir una.",
  vacioNotas: "Sin notas en esta versión.",
  vacioAutor: "Aquí aparecerán las notas de la revisión.",
  placeholderRevisor: "Escribe una nota o haz clic en el contenido…",
  placeholderAutor: "Escribe un mensaje…",
  mensajeAutor: "Mensaje",
}

export type PropsConversacion<L extends string> = {
  notas: NotaRevision<L>[]
  mensajes: Mensaje<L>[]
  /** Quién mira. */
  lado: L
  /** El lado de quien hace la pieza: resuelve las notas y contesta aunque la versión esté cerrada. El otro lado revisa y deja notas. */
  ladoAutor: L
  seleccionada?: string | null
  onSeleccionar?: (id: string | null) => void
  onResolver?: (id: string) => void
  /** Quien hace la pieza acepta o rechaza una sugerencia de cambio (una vez: decidida ya no se reabre). */
  onDecidir?: (notaId: string, decision: DecisionSugerencia) => void
  onResponder?: (notaId: string, texto: string) => void
  /** Quien revisa borra una nota suya mientras la versión está abierta y nadie la ha resuelto ni contestado (las sugerencias se retiran deshaciendo el cambio). */
  onBorrar?: (notaId: string) => void
  /** Quien hace la pieza: un mensaje. Quien revisa: una nota, anclada si ha marcado un sitio. */
  onEnviar?: (texto: string, ancla?: Ancla) => void
  anclaPendiente?: Ancla | null
  onQuitarAncla?: () => void
  /** La versión ya está cerrada (aprobada o con cambios pedidos): se lee, no se escribe. */
  cerrada?: boolean
  placeholder?: string
  textos?: Partial<TextosConversacion>
  className?: string
}

/**
 * La conversación de una versión, como en Feedback: los mensajes y las notas de quien revisa en
 * orden, cada nota con su número, su sitio en la pieza, su hilo y su estado. «Solo notas» deja lo
 * que hay que resolver. Abajo, el progreso: cuántas notas están resueltas.
 */
export function Conversacion<L extends string>({ notas, mensajes, lado, ladoAutor, seleccionada, onSeleccionar, onResolver, onDecidir, onResponder, onBorrar, onEnviar, anclaPendiente, onQuitarAncla, cerrada, placeholder, textos: propios, className }: PropsConversacion<L>) {
  const textos = { ...TEXTOS, ...propios }
  const esAutor = lado === ladoAutor
  const [vista, setVista] = React.useState<"todo" | "notas">("todo")
  const [texto, setTexto] = React.useState("")
  const [respondiendo, setRespondiendo] = React.useState<string | null>(null)
  const [respuesta, setRespuesta] = React.useState("")
  const final = React.useRef<HTMLDivElement>(null)
  const resueltas = notas.filter((n) => n.resuelta).length
  const numero = (id: string) => notas.findIndex((n) => n.id === id) + 1

  type Entrada = { tipo: "mensaje"; el: string; m: Mensaje<L> } | { tipo: "nota"; el: string; n: NotaRevision<L> }
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
    <div data-slot="conversacion" className={cn("flex min-h-0 flex-col", className)}>
      <div className="flex items-center gap-2 border-b px-4 py-2.5">
        <h3 className="text-sm font-semibold">Conversación</h3>
        <Segmentado
          valor={vista}
          onCambiar={setVista}
          label="Qué enseñar"
          className="ml-auto"
          opciones={[
            { id: "todo", label: "Todo" },
            {
              id: "notas",
              label: (
                <>
                  Solo notas {notas.length - resueltas > 0 && <span className="ml-1 rounded-full bg-warning-soft px-1.5 text-[10px] tabular-nums text-warning">{notas.length - resueltas}</span>}
                </>
              ),
            },
          ]}
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
        {entradas.length === 0 ? (
          <p className="rounded-xl border border-dashed px-3 py-6 text-center text-xs text-muted-foreground">
            {!esAutor ? textos.vacioRevisor : vista === "notas" ? textos.vacioNotas : textos.vacioAutor}
          </p>
        ) : (
          <ol className="flex flex-col gap-3">
            {entradas.map((e) =>
              e.tipo === "mensaje" ? (
                <Burbuja key={e.m.id} m={e.m} propia={e.m.lado === lado} autor={e.m.lado === ladoAutor} />
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
                        {e.n.sugerencia ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-brand-soft px-1.5 py-px text-[11px] text-brand">
                            <PencilLineIcon className="size-3" aria-hidden /> Sugerencia
                          </span>
                        ) : (
                          e.n.ancla && <AnclaChip ancla={e.n.ancla} className="max-w-[60%]" />
                        )}
                      </div>
                      {e.n.sugerencia && <CambioSugerido nota={e.n} />}
                      {(!e.n.sugerencia || e.n.texto) && <p className={cn("mt-1 text-sm", e.n.resuelta && !e.n.sugerencia && "text-muted-foreground line-through decoration-muted-foreground/40", e.n.sugerencia && "text-muted-foreground")}>{e.n.texto}</p>}
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
                  {!cerrada || esAutor ? (
                    <div className="flex flex-wrap items-center gap-1.5 border-t px-2 py-1.5" onClick={(ev) => ev.stopPropagation()}>
                      {esAutor && onDecidir && e.n.sugerencia && !e.n.sugerencia.decision && (
                        <>
                          <Button size="sm" className="h-7" onClick={() => onDecidir(e.n.id, "aceptada")}>
                            <CheckIcon /> Aceptar
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 text-muted-foreground" onClick={() => onDecidir(e.n.id, "rechazada")}>
                            <XIcon /> Rechazar
                          </Button>
                        </>
                      )}
                      {esAutor && onResolver && !e.n.sugerencia && (
                        <Button variant="ghost" size="sm" className={cn("h-7", e.n.resuelta ? "text-muted-foreground" : "text-success hover:text-success")} onClick={() => onResolver(e.n.id)}>
                          <CheckIcon /> {e.n.resuelta ? "Reabrir" : "Hecha"}
                        </Button>
                      )}
                      {!esAutor && onBorrar && !cerrada && !e.n.resuelta && !e.n.sugerencia && !e.n.respuestas.some((r) => r.lado === ladoAutor) && (
                        <Button variant="ghost" size="sm" className="h-7 text-muted-foreground hover:text-destructive" onClick={() => onBorrar(e.n.id)}>
                          <Trash2Icon /> Eliminar
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
              placeholder={placeholder ?? (esAutor ? textos.placeholderAutor : textos.placeholderRevisor)}
              aria-label={esAutor ? textos.mensajeAutor : "Nueva nota"}
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
            <span className="font-semibold">{esAutor ? "Progreso de las notas" : "Tus notas"}</span>
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
