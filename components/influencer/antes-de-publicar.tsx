"use client"

import { CircleCheckIcon, CircleIcon } from "lucide-react"
import { cn } from "cn"
import type { PasoPublicar, SeccionContenido } from "@/lib/influencer/planificacion"

/** El progreso en un anillo: el gris de fondo y lo hecho en verde. */
function Anillo({ hechos, total }: { hechos: number; total: number }) {
  const radio = 16
  const vuelta = 2 * Math.PI * radio
  const parte = total ? hechos / total : 0
  return (
    <svg viewBox="0 0 40 40" className="size-11 flex-none -rotate-90" aria-hidden>
      <circle cx="20" cy="20" r={radio} fill="none" strokeWidth="4" className="stroke-muted" />
      <circle cx="20" cy="20" r={radio} fill="none" strokeWidth="4" strokeLinecap="round" strokeDasharray={vuelta} strokeDashoffset={vuelta * (1 - parte)} className="stroke-success transition-[stroke-dashoffset]" />
    </svg>
  )
}

/**
 * Lo que conviene tener antes de publicar un contenido, con lo que falta a la vista. Cada paso
 * lleva a su sección para hacerlo.
 */
export function AntesDePublicar({ pasos, onIr, className }: { pasos: PasoPublicar[]; onIr?: (seccion: SeccionContenido) => void; className?: string }) {
  const hechos = pasos.filter((p) => p.hecho).length
  const faltan = pasos.length - hechos
  return (
    <div data-slot="ws-antes-de-publicar" className={cn("grid gap-3", className)}>
      <div className="flex items-center gap-3">
        <Anillo hechos={hechos} total={pasos.length} />
        <div className="grid gap-0.5">
          <span className="text-sm font-semibold">{faltan === 0 ? "Todo listo para publicar" : faltan === 1 ? "Te falta 1 cosa" : `Te faltan ${faltan} cosas`}</span>
          <span className="text-xs text-muted-foreground tabular-nums">
            {hechos} de {pasos.length} hechas
          </span>
        </div>
      </div>
      <ul className="grid gap-0.5">
        {pasos.map((p) => (
          <li key={p.id}>
            <button type="button" onClick={() => onIr?.(p.seccion)} className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors hover:bg-muted">
              {p.hecho ? <CircleCheckIcon className="size-4 flex-none text-success" /> : <CircleIcon className="size-4 flex-none text-muted-foreground" />}
              <span className={cn(p.hecho && "text-muted-foreground")}>{p.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
