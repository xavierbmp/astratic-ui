"use client"

import * as React from "react"
import { CheckIcon } from "lucide-react"
import { cn } from "cn"
import { fmt } from "@/lib/format"
import { FASES, rangoDeFechas, type Fase, type TipoFase } from "@/lib/influencer/cronograma"
import { diasEntre, nombreMes, soloFecha, sumarDias } from "@/lib/influencer/fechas"
import { tintClass, type Tint } from "@/lib/influencer/tints"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

/** Cada fase con su tinte: colorean por tipo de trabajo, nunca por estado. */
const TINTE_FASE: Record<TipoFase, Tint> = { guion: "lavender", grabacion: "peach", edicion: "sky", revision: "mint", resultados: "lime" }

const ANCHO_DIA = { dias: 34, semanas: 16 } as const
type Escala = keyof typeof ANCHO_DIA

export type FilaGantt = {
  id: string
  titulo: string
  subtitulo?: string
  inicio?: React.ReactNode
  fases: Fase[]
  publicacion: string
  publicada?: boolean
}

const DIA_SEMANA = ["D", "L", "M", "X", "J", "V", "S"]

/**
 * El cronograma en Gantt: una fila por pieza con sus fases (guion, grabación, edición, revisión,
 * resultados), el rombo de la publicación y la línea de hoy. Arrastrar una fila (o las flechas con
 * ella enfocada) mueve la publicación y todas sus fases; pulsarla la abre.
 */
export function Gantt({ filas, hoy, onMover, onAbrir, className }: { filas: FilaGantt[]; hoy: string; onMover?: (id: string, dias: number) => void; onAbrir?: (id: string) => void; className?: string }) {
  const hoyFecha = soloFecha(hoy)
  const [escala, setEscala] = React.useState<Escala>("dias")
  const [arrastre, setArrastre] = React.useState<{ id: string; x0: number; dias: number } | null>(null)
  const lienzo = React.useRef<HTMLDivElement>(null)
  const ancho = ANCHO_DIA[escala]
  const rango = rangoDeFechas(filas.flatMap((f) => [...f.fases.flatMap((x) => [x.desde, x.hasta]), f.publicacion]), hoyFecha)
  const dias = Array.from({ length: rango.dias }, (_, i) => sumarDias(rango.desde, i))
  const x = (fecha: string) => diasEntre(rango.desde, fecha) * ancho
  const meses = dias.reduce<{ mes: string; desde: number; dias: number }[]>((acc, d, i) => {
    const ultimo = acc[acc.length - 1]
    if (ultimo?.mes === d.slice(0, 7)) ultimo.dias++
    else acc.push({ mes: d.slice(0, 7), desde: i, dias: 1 })
    return acc
  }, [])

  const irAHoy = () => {
    const el = lienzo.current
    if (el) el.scrollLeft = Math.max(0, diasEntre(rango.desde, hoyFecha) * ancho - el.clientWidth / 3)
  }

  // Al abrir y al cambiar de escala, el día de hoy queda a la vista.
  const centrar = React.useEffectEvent(irAHoy)
  React.useEffect(() => centrar(), [ancho])

  const soltar = (id: string) => {
    if (arrastre && arrastre.dias !== 0) onMover?.(id, arrastre.dias)
    else onAbrir?.(id)
    setArrastre(null)
  }

  return (
    <div data-slot="ws-gantt" className={cn("flex flex-col gap-3", className)}>
      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="flex">
          <div className="w-44 flex-none border-r sm:w-60">
            <div className="flex h-12 items-end border-b px-3 pb-1.5 text-xs font-medium text-muted-foreground">Pieza</div>
            {filas.map((f) => (
              <div key={f.id} className="flex h-14 items-center gap-2.5 border-b px-3 last:border-b-0">
                {f.inicio}
                <span className="grid min-w-0">
                  <span className="truncate text-sm font-medium">{f.titulo}</span>
                  {f.subtitulo && <span className="truncate text-xs text-muted-foreground">{f.subtitulo}</span>}
                </span>
              </div>
            ))}
          </div>

          <div ref={lienzo} className="min-w-0 flex-1 overflow-x-auto">
            <div className="relative" style={{ width: rango.dias * ancho }}>
              <div className="flex h-6 border-b">
                {meses.map((m) => (
                  <span key={m.mes} style={{ width: m.dias * ancho }} className="truncate border-r px-2 pt-1 text-[11px] font-medium text-muted-foreground first-letter:uppercase last:border-r-0">
                    {nombreMes(`${m.mes}-01`)}
                  </span>
                ))}
              </div>
              <div className="flex h-6 border-b">
                {dias.map((d) => {
                  const dia = new Date(`${d}T12:00:00`).getDay()
                  return (
                    <span key={d} style={{ width: ancho }} className={cn("grid flex-none place-items-center text-[10px] tabular-nums", d === hoyFecha ? "font-semibold text-brand" : "text-muted-foreground")}>
                      {escala === "dias" ? `${DIA_SEMANA[dia]} ${Number(d.slice(8))}` : dia === 1 ? Number(d.slice(8)) : ""}
                    </span>
                  )
                })}
              </div>

              {/* Fines de semana sombreados y la línea de hoy, detrás de las filas. */}
              <div className="pointer-events-none absolute inset-x-0 top-12 bottom-0">
                {dias.map((d, i) => ([0, 6].includes(new Date(`${d}T12:00:00`).getDay()) ? <span key={d} className="absolute inset-y-0 bg-muted/50" style={{ left: i * ancho, width: ancho }} /> : null))}
                <span className="absolute inset-y-0 w-0.5 bg-brand" style={{ left: x(hoyFecha) + ancho / 2 }}>
                  <span className="absolute -top-0.5 -left-[3px] size-2 rounded-full bg-brand" />
                </span>
              </div>

              {filas.map((f) => {
                const desplazamiento = arrastre?.id === f.id ? arrastre.dias : 0
                return (
                  <div key={f.id} className="relative h-14 border-b last:border-b-0">
                    <div
                      role="button"
                      tabIndex={0}
                      aria-label={`${f.titulo}: publicar el ${fmt.date(f.publicacion)}${onMover ? ". Arrastra o usa las flechas para mover las fechas" : ""}`}
                      onPointerDown={(e) => {
                        e.currentTarget.setPointerCapture(e.pointerId)
                        setArrastre({ id: f.id, x0: e.clientX, dias: 0 })
                      }}
                      onPointerMove={(e) => {
                        if (arrastre?.id === f.id && onMover) setArrastre({ ...arrastre, dias: Math.round((e.clientX - arrastre.x0) / ancho) })
                      }}
                      onPointerUp={() => soltar(f.id)}
                      onPointerCancel={() => setArrastre(null)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") onAbrir?.(f.id)
                        if (onMover && (e.key === "ArrowLeft" || e.key === "ArrowRight")) {
                          e.preventDefault()
                          onMover(f.id, e.key === "ArrowLeft" ? -1 : 1)
                        }
                      }}
                      className={cn("absolute inset-y-0 left-0 right-0 outline-none focus-visible:bg-brand-soft/40", onMover ? "cursor-grab active:cursor-grabbing" : "cursor-pointer")}
                      style={{ transform: `translateX(${desplazamiento * ancho}px)` }}
                    >
                      {f.fases.map((fase) => {
                        const tarde = !fase.hecha && fase.hasta < hoyFecha
                        const izquierda = x(fase.desde) + ancho / 2
                        const largo = Math.max(ancho / 2, diasEntre(fase.desde, fase.hasta) * ancho - 3)
                        return (
                          <Tooltip key={fase.tipo}>
                            <TooltipTrigger asChild>
                              <span style={{ left: izquierda, width: largo }} className={cn("absolute top-1/2 flex h-7 -translate-y-1/2 items-center gap-1 overflow-hidden rounded-md px-2 text-[11px] font-medium whitespace-nowrap", tintClass[TINTE_FASE[fase.tipo]], fase.hecha && "opacity-55", tarde && "ring-2 ring-danger ring-inset")}>
                                {fase.hecha && <CheckIcon className="size-3 flex-none" strokeWidth={3} />}
                                {largo > 52 && <span className="truncate">{fase.label}</span>}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              {fase.label}: {fmt.date(fase.desde)} – {fmt.date(fase.hasta)}
                              {fase.hecha ? " · hecho" : tarde ? ` · ${diasEntre(fase.hasta, hoyFecha)} días tarde` : ""}
                            </TooltipContent>
                          </Tooltip>
                        )
                      })}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span style={{ left: x(f.publicacion) + ancho / 2 }} className={cn("absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[3px] ring-2 ring-card", f.publicada ? "bg-success" : "bg-foreground")} />
                        </TooltipTrigger>
                        <TooltipContent>{f.publicada ? "Publicada" : "Publicación"}: {fmt.dateLong(f.publicacion)}</TooltipContent>
                      </Tooltip>
                    </div>
                    {desplazamiento !== 0 && (
                      <span className="pointer-events-none absolute -top-2 z-10 rounded-md bg-foreground px-1.5 py-0.5 text-[11px] font-medium text-background" style={{ left: x(f.publicacion) + desplazamiento * ancho }}>
                        {desplazamiento > 0 ? "+" : ""}
                        {desplazamiento} {Math.abs(desplazamiento) === 1 ? "día" : "días"} · {fmt.date(sumarDias(f.publicacion, desplazamiento))}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
        {(Object.keys(FASES) as TipoFase[]).map((t) => (
          <span key={t} className="inline-flex items-center gap-1.5">
            <span className={cn("size-2.5 rounded-sm", tintClass[TINTE_FASE[t]])} />
            {FASES[t]}
          </span>
        ))}
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rotate-45 rounded-[2px] bg-foreground" /> Publicación
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-0.5 bg-brand" /> Hoy
        </span>
        <span className="ml-auto flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-7" onClick={irAHoy}>
            Hoy
          </Button>
          <Button variant={escala === "dias" ? "secondary" : "ghost"} size="sm" className="h-7" onClick={() => setEscala("dias")}>
            Días
          </Button>
          <Button variant={escala === "semanas" ? "secondary" : "ghost"} size="sm" className="h-7" onClick={() => setEscala("semanas")}>
            Semanas
          </Button>
        </span>
      </div>
    </div>
  )
}
