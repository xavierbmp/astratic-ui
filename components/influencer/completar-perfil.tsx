"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowRightIcon, CheckIcon } from "lucide-react"
import { cn } from "cn"
import { siguientePaso, type PasoAlta } from "@/lib/influencer/primeros-pasos"
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover"

/** El anillo del progreso, para la sidebar plegada. */
function Anillo({ hechos, total, className }: { hechos: number; total: number; className?: string }) {
  const radio = 9
  const vuelta = 2 * Math.PI * radio
  return (
    <svg viewBox="0 0 24 24" className={cn("-rotate-90", className)} aria-hidden>
      <circle cx="12" cy="12" r={radio} fill="none" strokeWidth="3" className="stroke-muted" />
      <circle cx="12" cy="12" r={radio} fill="none" strokeWidth="3" strokeLinecap="round" className="stroke-brand transition-[stroke-dashoffset] duration-500" strokeDasharray={vuelta} strokeDashoffset={vuelta * (1 - hechos / total)} />
    </svg>
  )
}

function Barra({ hechos, total }: { hechos: number; total: number }) {
  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={hechos} aria-label="Perfil completado">
      <div className="h-full rounded-full bg-brand transition-[width] duration-500" style={{ width: `${(hechos / total) * 100}%` }} />
    </div>
  )
}

/** Todos los pasos, con lo que es cada uno: en el desplegable. */
function ListaPasos({ pasos, onElegir }: { pasos: PasoAlta[]; onElegir: () => void }) {
  const hechos = pasos.filter((p) => p.hecho).length
  return (
    <div className="flex flex-col">
      <div className="border-b p-4">
        <p className="text-sm font-semibold">Completa tu perfil</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {hechos} de {pasos.length} hechos. Con todo completo te podemos proponer las collabs que mejor te encajan.
        </p>
        <div className="mt-3">
          <Barra hechos={hechos} total={pasos.length} />
        </div>
      </div>
      <ul className="flex max-h-[min(60vh,440px)] flex-col overflow-y-auto p-1.5">
        {pasos.map((p) => (
          <li key={p.id}>
            <Link href={p.href} onClick={onElegir} className="flex items-start gap-3 rounded-lg px-2.5 py-2 transition-colors hover:bg-muted">
              {p.hecho ? (
                <span className="mt-0.5 grid size-4 flex-none place-items-center rounded-full bg-success text-background">
                  <CheckIcon className="size-2.5" strokeWidth={3} aria-label="Hecho" />
                </span>
              ) : (
                <span className="mt-0.5 size-4 flex-none rounded-full border-2 border-control" aria-hidden />
              )}
              <span className="min-w-0 flex-1">
                <span className={cn("block text-sm", p.hecho ? "text-muted-foreground line-through decoration-1" : "font-medium")}>{p.label}</span>
                {!p.hecho && <span className="mt-0.5 block text-xs text-muted-foreground">{p.descripcion}</span>}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * Completar el perfil, fijo al pie de la sidebar (`AppShell sidebarExtra`) hasta que esté todo: el progreso, el
 * siguiente paso a un clic y, al pulsar el progreso, todos los pasos. No se puede quitar (Xavier, 2026-10-16): se va
 * solo al acabar. Con la sidebar plegada, un anillo con el mismo desplegable.
 */
export function CompletarPerfil({ pasos }: { pasos: PasoAlta[] }) {
  const [abierto, setAbierto] = React.useState(false)
  const anclaRef = React.useRef<HTMLDivElement>(null)
  const hechos = pasos.filter((p) => p.hecho).length
  const siguiente = siguientePaso(pasos)
  if (!siguiente) return null
  const alternar = () => setAbierto((a) => !a)

  return (
    <Popover open={abierto} onOpenChange={setAbierto}>
      <PopoverAnchor asChild>
        <div ref={anclaRef} data-slot="ws-completar-perfil" className="mb-1">
          <div className="rounded-xl bg-background/70 p-3 group-data-[collapsible=icon]:hidden">
            <button type="button" aria-expanded={abierto} onClick={alternar} className="block w-full rounded-md text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
              <span className="flex items-baseline justify-between gap-2">
                <span className="text-sm font-semibold">Completa tu perfil</span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {hechos}/{pasos.length}
                </span>
              </span>
              <span className="mt-2 block">
                <Barra hechos={hechos} total={pasos.length} />
              </span>
            </button>
            <Link href={siguiente.href} className="group/siguiente mt-2.5 flex items-center gap-2 rounded-lg bg-card px-2.5 py-2 text-sm shadow-xs transition-colors hover:bg-muted">
              <span className="size-3.5 flex-none rounded-full border-2 border-control" aria-hidden />
              <span className="min-w-0 flex-1 truncate">{siguiente.label}</span>
              <ArrowRightIcon className="size-3.5 flex-none text-muted-foreground transition-transform group-hover/siguiente:translate-x-0.5" aria-hidden />
            </Link>
          </div>
          <button
            type="button"
            aria-expanded={abierto}
            onClick={alternar}
            aria-label={`Completa tu perfil: ${hechos} de ${pasos.length}`}
            className="hidden size-8 place-items-center rounded-md outline-none hover:bg-sidebar-accent focus-visible:ring-3 focus-visible:ring-ring/50 group-data-[collapsible=icon]:grid"
          >
            <Anillo hechos={hechos} total={pasos.length} className="size-5" />
          </button>
        </div>
      </PopoverAnchor>
      <PopoverContent
        side="right"
        align="end"
        sideOffset={12}
        className="w-80 p-0"
        // Pulsar el propio bloque lo abre y lo cierra: no cuenta como pulsar fuera.
        onInteractOutside={(e) => {
          if (e.target instanceof Node && anclaRef.current?.contains(e.target)) e.preventDefault()
        }}
      >
        <ListaPasos pasos={pasos} onElegir={() => setAbierto(false)} />
      </PopoverContent>
    </Popover>
  )
}
