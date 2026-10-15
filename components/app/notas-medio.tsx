"use client"

import * as React from "react"
import { CheckIcon, XIcon } from "lucide-react"
import { cn } from "cn"
import { cajaJuntoA } from "@/lib/notas-medio"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

/** Lo que mide la caja de escribir o de leer una nota sobre el fotograma (el alto, aproximado). */
const CAJA = { ancho: 240, alto: 124 }

/** La chincheta de una nota sobre una foto o un fotograma, con su número; discontinua mientras se escribe. */
export function Chincheta({ numero, resuelta, activa, pendiente, onClick, style }: { numero?: number; resuelta?: boolean; activa?: boolean; pendiente?: boolean; onClick?: () => void; style: React.CSSProperties }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onClick?.()
      }}
      style={style}
      aria-label={pendiente ? "Nueva nota aquí" : `Nota ${numero}`}
      className={cn(
        "absolute z-10 grid size-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full rounded-bl-none text-xs font-semibold text-white shadow-pop ring-2 ring-white transition-transform hover:scale-110",
        pendiente ? "border-2 border-dashed border-white bg-brand/60" : resuelta ? "bg-success" : "bg-brand",
        activa && "scale-110 ring-4",
      )}
    >
      {numero}
    </button>
  )
}

type Sitio = { x: number; y: number }
type Fotograma = { ancho: number; alto: number }

/** El sitio de una caja junto a su chincheta, como estilo. */
function estiloJuntoA(punto: Sitio, fotograma: Fotograma) {
  const c = cajaJuntoA(punto, fotograma, CAJA)
  return { style: { left: c.left, top: c.top, width: c.ancho } satisfies React.CSSProperties, debajo: c.debajo }
}

/**
 * Escribir una nota en el sitio pulsado de una foto o un fotograma: la caja sale junto a la chincheta,
 * Intro (o el tick) la guarda y Escape (o la cruz) la descarta.
 */
export function EscribirNota({ punto, fotograma, contexto, onGuardar, onCancelar }: { punto: Sitio; fotograma: Fotograma; contexto?: string; onGuardar: (texto: string) => void; onCancelar: () => void }) {
  const [texto, setTexto] = React.useState("")
  const { style, debajo } = estiloJuntoA(punto, fotograma)
  const guardar = () => {
    if (texto.trim()) onGuardar(texto.trim())
  }
  return (
    <form
      role="dialog"
      aria-label="Nueva nota"
      onClick={(e) => e.stopPropagation()}
      onSubmit={(e) => {
        e.preventDefault()
        guardar()
      }}
      style={style}
      className={cn("absolute z-20 flex flex-col gap-1.5 rounded-xl bg-card p-2 text-foreground shadow-pop ring-1 ring-border", !debajo && "-translate-y-full")}
    >
      {contexto && <span className="px-1 font-mono text-[11px] text-muted-foreground">{contexto}</span>}
      <Textarea
        autoFocus
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            guardar()
          }
          if (e.key === "Escape") onCancelar()
        }}
        rows={2}
        placeholder="Qué cambiarías aquí…"
        aria-label="Tu nota"
        className="min-h-14 resize-none text-sm"
      />
      <div className="flex justify-end gap-1">
        <Button type="button" variant="ghost" size="icon-sm" aria-label="Descartar la nota" onClick={onCancelar}>
          <XIcon />
        </Button>
        <Button type="submit" size="icon-sm" aria-label="Guardar la nota" disabled={!texto.trim()}>
          <CheckIcon />
        </Button>
      </div>
    </form>
  )
}

/** Una nota ya puesta, abierta encima de su sitio: quién, cuándo y qué pide. */
export function NotaAbierta({ punto, fotograma, numero, autor, texto, contexto, resuelta }: { punto: Sitio; fotograma: Fotograma; numero: number; autor: string; texto: string; contexto?: string; resuelta?: boolean }) {
  const { style, debajo } = estiloJuntoA(punto, fotograma)
  return (
    <div role="note" style={style} className={cn("pointer-events-none absolute z-20 rounded-xl bg-card p-2.5 text-foreground shadow-pop ring-1 ring-border", !debajo && "-translate-y-full")}>
      <p className="flex items-center gap-1.5 text-xs">
        <span className={cn("grid size-4 place-items-center rounded-full text-[10px] font-semibold text-white", resuelta ? "bg-success" : "bg-brand")}>{numero}</span>
        <span className="font-semibold">{autor}</span>
        {contexto && <span className="ml-auto font-mono text-[11px] text-muted-foreground">{contexto}</span>}
      </p>
      <p className="mt-1 line-clamp-4 text-sm">{texto}</p>
    </div>
  )
}
