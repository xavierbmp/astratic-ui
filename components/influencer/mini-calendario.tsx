"use client"

import * as React from "react"
import Link from "next/link"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { cn } from "cn"
import { TIPOS_EVENTO, eventosDelDia, type Evento } from "@/lib/influencer/agenda"
import { casillasDelMes, mismoMes, nombreMes, soloFecha, sumarMeses } from "@/lib/influencer/fechas"
import { tintClass } from "@/lib/influencer/tints"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

const DIAS = ["L", "M", "X", "J", "V", "S", "D"]
/** Lo que se escribe en cada día; si hay más, «+N» lleva a ese día en el calendario completo. */
const POR_DIA = 2

/**
 * Calendario pequeño para un resumen, como el mes de Google Calendar: cada día es un bloque con lo que tiene
 * escrito en pequeño (hitos, cobros, tareas) en el tinte de su collab. Crece hasta llenar su bloque. Cada cosa
 * lleva a su sitio; `hrefDia` lleva a un día en el calendario completo («+N»).
 */
export function MiniCalendario({ eventos, hoy, hrefDia, className }: { eventos: Evento[]; hoy: string; hrefDia?: (dia: string) => string; className?: string }) {
  const hoyFecha = soloFecha(hoy)
  const mesDeHoy = `${hoyFecha.slice(0, 7)}-01`
  const [mes, setMes] = React.useState(mesDeHoy)
  // Cinco semanas o seis, las que pida el mes: sin una fila entera del mes siguiente.
  const casillas = casillasDelMes(mes)
  const dias = mismoMes(casillas[35], mes) ? casillas : casillas.slice(0, 35)

  return (
    <div data-slot="ws-mini-calendario" className={cn("flex min-h-0 flex-col", className)}>
      <div className="mb-2 flex items-center gap-1">
        <p className="text-sm font-semibold first-letter:uppercase">{nombreMes(mes)}</p>
        <div className="ml-auto flex items-center">
          {mes !== mesDeHoy && (
            <Button variant="ghost" size="sm" onClick={() => setMes(mesDeHoy)}>
              Hoy
            </Button>
          )}
          <Button variant="ghost" size="icon-sm" aria-label="Mes anterior" onClick={() => setMes((m) => sumarMeses(m, -1))}>
            <ChevronLeftIcon />
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label="Mes siguiente" onClick={() => setMes((m) => sumarMeses(m, 1))}>
            <ChevronRightIcon />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 pb-1 text-center text-[11px] font-medium text-muted-foreground" aria-hidden>
        {DIAS.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div className="grid flex-1 auto-rows-[minmax(4rem,1fr)] grid-cols-7 gap-px overflow-hidden rounded-xl bg-border/60">
        {dias.map((d) => {
          const lista = eventosDelDia(eventos, d)
          const delMes = mismoMes(d, mes)
          const ocultos = lista.length - POR_DIA
          return (
            <div key={d} className={cn("flex min-w-0 flex-col gap-0.5 overflow-hidden p-1", delMes ? "bg-card" : "bg-background/70")}>
              <span
                className={cn(
                  "grid size-5 flex-none place-items-center rounded-full text-[11px] tabular-nums",
                  d === hoyFecha ? "bg-brand font-semibold text-brand-foreground" : delMes ? "text-foreground" : "text-muted-foreground/60",
                )}
              >
                {Number(d.slice(8, 10))}
              </span>
              {lista.slice(0, POR_DIA).map((e) => (
                <Tooltip key={e.id}>
                  <TooltipTrigger asChild>
                    <Link
                      href={e.href}
                      className={cn(
                        "block truncate rounded-[5px] px-1 text-[10px] leading-4 font-medium transition-opacity hover:opacity-80",
                        e.tint ? tintClass[e.tint] : "bg-muted text-muted-foreground",
                        e.hecho && "line-through opacity-50",
                      )}
                    >
                      {e.titulo}
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    {e.titulo}
                    <span className="opacity-70">
                      {" "}
                      · {TIPOS_EVENTO[e.tipo]}
                      {e.contexto ? ` · ${e.contexto}` : ""}
                      {e.hecho ? " · hecho" : ""}
                    </span>
                  </TooltipContent>
                </Tooltip>
              ))}
              {ocultos > 0 &&
                (hrefDia ? (
                  <Link href={hrefDia(d)} aria-label={`${ocultos} más ese día`} className="px-1 text-[10px] leading-4 whitespace-nowrap text-muted-foreground hover:text-foreground">
                    +{ocultos}
                  </Link>
                ) : (
                  <span className="px-1 text-[10px] leading-4 whitespace-nowrap text-muted-foreground">+{ocultos}</span>
                ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}
