"use client"

import * as React from "react"
import { cn } from "cn"
import type { Nota } from "@/lib/influencer/modelo"

/** Un bloque del guion: la primera línea en mayúsculas es el título («GANCHO (0–3 s)»). */
function partir(texto: string) {
  return texto
    .split(/\n\s*\n/)
    .map((bloque) => bloque.trim())
    .filter(Boolean)
    .map((bloque) => {
      const [primera, ...resto] = bloque.split("\n")
      const esTitulo = primera.length < 48 && primera === primera.toUpperCase() && /[A-ZÁÉÍÓÚÑ]/.test(primera)
      return esTitulo ? { titulo: primera, parrafos: resto } : { titulo: null, parrafos: [primera, ...resto] }
    })
}

/** Pinta un párrafo marcando las citas de las notas que caen en él, con su número al lado. */
function Parrafo({ texto, notas, seleccionada, onSeleccionar }: { texto: string; notas: { nota: Nota; numero: number; cita: string }[]; seleccionada?: string | null; onSeleccionar?: (id: string) => void }) {
  const partes: React.ReactNode[] = []
  let resto = texto
  let clave = 0
  // Las notas se buscan en orden de aparición; una cita que no esté en este párrafo no se pinta aquí.
  const presentes = notas.filter((n) => texto.includes(n.cita)).sort((a, b) => texto.indexOf(a.cita) - texto.indexOf(b.cita))
  for (const n of presentes) {
    const i = resto.indexOf(n.cita)
    if (i < 0) continue
    partes.push(<React.Fragment key={clave++}>{resto.slice(0, i)}</React.Fragment>)
    partes.push(
      <button
        key={clave++}
        type="button"
        onClick={() => onSeleccionar?.(n.nota.id)}
        className={cn("rounded-sm px-0.5 text-left transition-colors", n.nota.resuelta ? "bg-success-soft" : "bg-warning-soft", seleccionada === n.nota.id && "ring-2 ring-brand")}
      >
        {n.cita}
        <span className={cn("ml-1 inline-grid size-4 place-items-center rounded-full align-middle text-[10px] font-semibold text-white", n.nota.resuelta ? "bg-success" : "bg-brand")}>{n.numero}</span>
      </button>,
    )
    resto = resto.slice(i + n.cita.length)
  }
  partes.push(<React.Fragment key={clave++}>{resto}</React.Fragment>)
  return <p className="text-[13.5px] leading-relaxed">{partes}</p>
}

/**
 * El guion como un documento: apartados con título, párrafos y las notas de la marca marcadas
 * sobre el texto. Si se pasa `onCitar`, seleccionar texto con el ratón propone una nota ahí.
 */
export function GuionViewer({ texto, notas, seleccionada, onSeleccionar, onCitar, className }: { texto: string; notas: Nota[]; seleccionada?: string | null; onSeleccionar?: (id: string) => void; onCitar?: (cita: string) => void; className?: string }) {
  const anotadas = notas.flatMap((nota, i) => (nota.ancla?.tipo === "texto" ? [{ nota, numero: i + 1, cita: nota.ancla.cita }] : []))
  const bloques = partir(texto)

  const citar = () => {
    if (!onCitar) return
    const seleccion = window.getSelection()?.toString().trim()
    if (seleccion && seleccion.length >= 3 && seleccion.length <= 240) onCitar(seleccion)
  }

  return (
    <article data-slot="ws-guion" onMouseUp={citar} className={cn("rounded-xl bg-background/70 px-6 py-5 select-text", onCitar && "cursor-text", className)}>
      {bloques.map((b, i) => (
        <section key={i} className={cn(i > 0 && "mt-4")}>
          {b.titulo && <h4 className="mb-1 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">{b.titulo}</h4>}
          {b.parrafos.map((p, j) => (
            <Parrafo key={j} texto={p} notas={anotadas} seleccionada={seleccionada} onSeleccionar={onSeleccionar} />
          ))}
        </section>
      ))}
    </article>
  )
}
