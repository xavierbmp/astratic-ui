"use client"

import * as React from "react"
import Link from "next/link"
import { CheckIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { cn } from "cn"
import { fmt } from "@/lib/format"
import type { Evento } from "@/lib/influencer/agenda"
import { TIPOS_EVENTO } from "@/lib/influencer/agenda"
import { casillasDelMes, diaLargo, mismoMes, nombreMes, soloFecha, sumarMeses } from "@/lib/influencer/fechas"
import { tintClass } from "@/lib/influencer/tints"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { EmptyState } from "@/components/app/states"

const DIAS = ["L", "M", "X", "J", "V", "S", "D"]
const MAX_VISIBLES = 3

/**
 * Agenda mensual: los hitos de cada pieza, los cobros y las tareas con fecha, con el color de su
 * collab. En el ordenador, una cuadrícula; en el móvil, la lista del mes día a día.
 */
export function Agenda({ eventos, hoy, onSelect, className }: { eventos: Evento[]; hoy: string; onSelect?: (evento: Evento) => void; className?: string }) {
  const hoyFecha = soloFecha(hoy)
  const [mes, setMes] = React.useState(hoyFecha.slice(0, 7) + "-01")
  const casillas = casillasDelMes(mes)
  const porDia = React.useMemo(() => {
    const mapa = new Map<string, Evento[]>()
    for (const e of eventos) mapa.set(e.fecha, [...(mapa.get(e.fecha) ?? []), e])
    return mapa
  }, [eventos])
  const diasConEventos = casillas.filter((d) => mismoMes(d, mes) && (porDia.get(d)?.length ?? 0) > 0)

  const chip = (e: Evento, compacto = true) => {
    const clases = cn(
      "flex min-w-0 items-center gap-1 rounded-md px-1.5 py-0.5 text-left text-[11px] font-medium transition-opacity hover:opacity-80",
      e.tint ? tintClass[e.tint] : "bg-muted text-muted-foreground",
      e.hecho && "opacity-50 line-through",
      !compacto && "px-2 py-1 text-xs",
    )
    const contenido = (
      <>
        {e.hecho && <CheckIcon className="size-3 flex-none" />}
        <span className="truncate">{e.titulo}</span>
      </>
    )
    return (
      <Tooltip key={e.id}>
        {/* Con `onSelect` el evento abre su ficha en la misma página; si no, lleva a su sitio. */}
        <TooltipTrigger asChild>
          {onSelect ? (
            <button type="button" className={clases} onClick={() => onSelect(e)}>
              {contenido}
            </button>
          ) : (
            <Link href={e.href} className={clases}>
              {contenido}
            </Link>
          )}
        </TooltipTrigger>
        <TooltipContent>
          {TIPOS_EVENTO[e.tipo]}
          {e.contexto ? ` · ${e.contexto}` : ""}
          {e.hecho ? " · hecho" : ""}
        </TooltipContent>
      </Tooltip>
    )
  }

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="mb-3 flex items-center gap-2">
        <h3 className="text-base font-semibold first-letter:uppercase">{nombreMes(mes)}</h3>
        <div className="ml-auto flex items-center gap-1">
          <Button variant="outline" size="sm" onClick={() => setMes(hoyFecha.slice(0, 7) + "-01")}>
            Hoy
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label="Mes anterior" onClick={() => setMes((m) => sumarMeses(m, -1))}>
            <ChevronLeftIcon />
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label="Mes siguiente" onClick={() => setMes((m) => sumarMeses(m, 1))}>
            <ChevronRightIcon />
          </Button>
        </div>
      </div>

      <div className="hidden md:block">
        <div className="grid grid-cols-7 border-b pb-1.5 text-center text-[11px] font-medium text-muted-foreground">
          {DIAS.map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-px overflow-hidden rounded-xl bg-border/60">
          {casillas.map((d) => {
            const delMes = mismoMes(d, mes)
            const esHoy = d === hoyFecha
            const lista = porDia.get(d) ?? []
            return (
              <div key={d} className={cn("flex min-h-[104px] flex-col gap-1 bg-card p-1.5", !delMes && "bg-background/70")}>
                <span className={cn("grid size-6 place-items-center rounded-full text-xs tabular-nums", esHoy ? "bg-brand font-semibold text-brand-foreground" : delMes ? "text-foreground" : "text-muted-foreground/60")}>{Number(d.slice(8, 10))}</span>
                {lista.slice(0, MAX_VISIBLES).map((e) => chip(e))}
                {lista.length > MAX_VISIBLES && <span className="px-1.5 text-[11px] text-muted-foreground">+{lista.length - MAX_VISIBLES} más</span>}
              </div>
            )
          })}
        </div>
      </div>

      <div className="md:hidden">
        {diasConEventos.length === 0 ? (
          <EmptyState title="Nada este mes" description="Los hitos salen de las fechas de publicación de cada pieza." />
        ) : (
          <ul className="flex flex-col divide-y">
            {diasConEventos.map((d) => (
              <li key={d} className="flex gap-3 py-2.5">
                <span className={cn("w-20 flex-none text-xs capitalize", d === hoyFecha ? "font-semibold text-brand" : "text-muted-foreground")}>{d === hoyFecha ? "Hoy" : fmt.date(d)}</span>
                <div className="flex min-w-0 flex-1 flex-col gap-1">{(porDia.get(d) ?? []).map((e) => chip(e, false))}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <p className="mt-3 text-xs text-muted-foreground md:hidden">{diaLargo(hoyFecha)}</p>
    </div>
  )
}
