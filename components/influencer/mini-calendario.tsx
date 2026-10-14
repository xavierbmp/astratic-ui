"use client"

import * as React from "react"
import Link from "next/link"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { cn } from "cn"
import { TIPOS_EVENTO, eventosDelDia, type Evento } from "@/lib/influencer/agenda"
import { casillasDelMes, diaLargo, mismoMes, nombreMes, soloFecha, sumarMeses } from "@/lib/influencer/fechas"
import type { Tint } from "@/lib/influencer/tints"
import { Button } from "@/components/ui/button"

const DIAS = ["L", "M", "X", "J", "V", "S", "D"]
/** Los puntos que caben bajo el número de un día; el resto se ve al elegirlo. */
const PUNTOS_POR_DIA = 3
/** Lo del día elegido que se ve debajo; el resto, en el calendario completo. */
const EVENTOS_A_LA_VISTA = 3

/** El punto de cada cosa, en el tono fuerte de su tinte para que se vea sobre blanco. */
const PUNTO: Record<Tint, string> = {
  lime: "bg-tint-lime-foreground",
  mint: "bg-tint-mint-foreground",
  rose: "bg-tint-rose-foreground",
  lavender: "bg-tint-lavender-foreground",
  sky: "bg-tint-sky-foreground",
  peach: "bg-tint-peach-foreground",
}

const puntoDe = (e: Evento) => (e.tint ? PUNTO[e.tint] : "bg-muted-foreground")

/**
 * Calendario pequeño para un resumen: el mes con un punto del color de su collab por cada cosa del día
 * (hitos, cobros, tareas) y, debajo, lo del día elegido, que al abrir es hoy. Lo completo vive en `href`.
 */
export function MiniCalendario({ eventos, hoy, href, className }: { eventos: Evento[]; hoy: string; href?: string; className?: string }) {
  const hoyFecha = soloFecha(hoy)
  const mesDeHoy = `${hoyFecha.slice(0, 7)}-01`
  const [mes, setMes] = React.useState(mesDeHoy)
  const [elegido, setElegido] = React.useState(hoyFecha)
  const porDia = React.useMemo(() => {
    const mapa = new Map<string, Evento[]>()
    for (const e of eventos) mapa.set(e.fecha, [...(mapa.get(e.fecha) ?? []), e])
    return mapa
  }, [eventos])
  const delDia = eventosDelDia(eventos, elegido)
  const fueraDeHoy = mes !== mesDeHoy || elegido !== hoyFecha

  const elegir = (dia: string) => {
    setElegido(dia)
    if (!mismoMes(dia, mes)) setMes(`${dia.slice(0, 7)}-01`)
  }
  const volverAHoy = () => {
    setMes(mesDeHoy)
    setElegido(hoyFecha)
  }

  return (
    <div data-slot="ws-mini-calendario" className={cn("flex flex-col", className)}>
      <div className="mb-2 flex items-center gap-1">
        <p className="text-sm font-semibold first-letter:uppercase">{nombreMes(mes)}</p>
        <div className="ml-auto flex items-center">
          {fueraDeHoy && (
            <Button variant="ghost" size="sm" onClick={volverAHoy}>
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

      <div className="grid grid-cols-7 text-center text-[11px] font-medium text-muted-foreground" aria-hidden>
        {DIAS.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-y-0.5">
        {casillasDelMes(mes).map((d) => {
          const lista = porDia.get(d) ?? []
          const esHoy = d === hoyFecha
          return (
            <button
              key={d}
              type="button"
              onClick={() => elegir(d)}
              aria-pressed={d === elegido}
              aria-label={`${diaLargo(d)}${lista.length > 0 ? `, ${lista.length} ${lista.length === 1 ? "cosa" : "cosas"}` : ""}`}
              className={cn(
                "flex h-10 flex-col items-center justify-center gap-0.5 rounded-lg text-xs tabular-nums outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50",
                !mismoMes(d, mes) && "text-muted-foreground/50",
                d === elegido && "bg-brand-soft hover:bg-brand-soft",
              )}
            >
              <span className={cn("grid size-6 place-items-center rounded-full", esHoy && "bg-brand font-semibold text-brand-foreground")}>{Number(d.slice(8, 10))}</span>
              <span className="flex h-1.5 gap-0.5" aria-hidden>
                {lista.slice(0, PUNTOS_POR_DIA).map((e) => (
                  <span key={e.id} className={cn("size-1.5 rounded-full", puntoDe(e), e.hecho && "opacity-40")} />
                ))}
              </span>
            </button>
          )
        })}
      </div>

      <div className="mt-3 border-t pt-3">
        <p className="text-xs font-medium text-muted-foreground first-letter:uppercase">{elegido === hoyFecha ? "Hoy" : diaLargo(elegido)}</p>
        {delDia.length === 0 ? (
          <p className="mt-1.5 text-sm text-muted-foreground">Nada para este día.</p>
        ) : (
          <ul className="mt-1 flex flex-col">
            {delDia.slice(0, EVENTOS_A_LA_VISTA).map((e) => (
              <li key={e.id}>
                <Link href={e.href} className="-mx-2 flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-muted">
                  <span className={cn("size-2 flex-none rounded-full", puntoDe(e))} aria-hidden />
                  <span className={cn("min-w-0 flex-1 truncate", e.hecho && "text-muted-foreground line-through")}>{e.titulo}</span>
                  <span className="max-w-[40%] flex-none truncate text-xs text-muted-foreground">{e.contexto ?? TIPOS_EVENTO[e.tipo]}</span>
                </Link>
              </li>
            ))}
            {delDia.length > EVENTOS_A_LA_VISTA && href && (
              <li>
                <Link href={href} className="text-xs font-medium text-brand hover:underline">
                  {delDia.length - EVENTOS_A_LA_VISTA} más este día
                </Link>
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  )
}
