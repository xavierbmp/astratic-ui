"use client"

import * as React from "react"
import { SendIcon } from "lucide-react"
import { cn } from "cn"
import { BotonFicha } from "./marco"
import { AreaFicha, VacioFicha } from "./piezas"

export type MensajeFicha = {
  id: string
  /** Lo escrito desde aquí: a la derecha y en sólido. */
  nuestro: boolean
  texto: string
  /** Quién y cuándo, ya dicho para leer. */
  pie: React.ReactNode
}

/** Los mensajes de una conversación, de más antiguo a más nuevo. Se queda abajo del todo al llegar uno. */
export function BurbujasFicha({ mensajes, vacio, className }: { mensajes: MensajeFicha[]; vacio: React.ReactNode; className?: string }) {
  const caja = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    if (caja.current) caja.current.scrollTop = caja.current.scrollHeight
  }, [mensajes.length])
  if (!mensajes.length) return <VacioFicha className={className}>{vacio}</VacioFicha>
  return (
    <div ref={caja} className={cn("flex max-h-[55vh] flex-col gap-2.5 overflow-y-auto", className)}>
      {mensajes.map((m) => (
        <div key={m.id} className={cn("flex max-w-[85%] flex-col gap-1", m.nuestro ? "items-end self-end" : "items-start self-start")}>
          <p className={cn("m-0 rounded-[18px] px-3.5 py-2 text-sm leading-normal whitespace-pre-wrap", m.nuestro ? "rounded-br-[6px] bg-ficha-solido text-ficha-sobre-solido" : "rounded-bl-[6px] bg-ficha-relleno")}>{m.texto}</p>
          <span className="px-1 text-xs text-ficha-tinta-3">{m.pie}</span>
        </div>
      ))}
    </div>
  )
}

/** La caja para contestar: se envía con el botón o con ⌘+Intro. */
export function ResponderFicha({ texto, onTexto, enviando, onEnviar, placeholder, ayuda, boton = "Enviar", className }: { texto: string; onTexto: (t: string) => void; enviando: boolean; onEnviar: () => void; placeholder: string; ayuda?: React.ReactNode; boton?: string; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <AreaFicha
        value={texto}
        onChange={(e) => onTexto(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && texto.trim()) {
            e.preventDefault()
            onEnviar()
          }
        }}
        rows={3}
        placeholder={placeholder}
        aria-label={placeholder}
      />
      <div className="flex flex-wrap items-center gap-2">
        {ayuda && <span className="min-w-0 flex-1 text-[12.5px] text-ficha-tinta-3">{ayuda}</span>}
        <BotonFicha tamano="sm" className="ml-auto" disabled={!texto.trim() || enviando} onClick={onEnviar}>
          <SendIcon strokeWidth={1.8} aria-hidden /> {boton}
        </BotonFicha>
      </div>
    </div>
  )
}
