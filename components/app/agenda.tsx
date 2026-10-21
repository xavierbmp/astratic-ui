"use client"

import * as React from "react"
import Link from "next/link"
import { CheckIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { cn } from "cn"
import { fmt } from "@/lib/format"
import { soloFecha } from "@/lib/filtros/fechas"
import { INICIALES_SEMANA, casillasDelMes, diaLargo, mesDe, mismoMes, nombreMes, sumarMeses } from "@/lib/base/calendario"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { EmptyState } from "@/components/app/states"

/** Algo con fecha en una agenda: un hito, un cobro, una tarea, una reunión. */
export type EventoCalendario = {
  id: string
  /** El día, AAAA-MM-DD. */
  fecha: string
  titulo: string
  /** Qué es y de quién («Entrega · Lumea»): sale al pasar por encima. */
  detalle?: string
  /** Clases del chip: el color de su cliente o de su tipo (un tinte, `bg-info-soft text-info`). Sin él, gris. */
  color?: string
  hecho?: boolean
  /** Adónde lleva al pulsarlo, si no se abre en la misma página. */
  href?: string
}

/** El número del día en un calendario, con hoy marcado y los días de otro mes en gris. Lo comparten todos los calendarios del kit. */
export function NumeroDia({ dia, hoy, fuera, pequeno, className }: { dia: string; hoy?: boolean; fuera?: boolean; pequeno?: boolean; className?: string }) {
  return (
    <span
      className={cn(
        "grid flex-none place-items-center rounded-full tabular-nums",
        pequeno ? "size-5 text-[11px]" : "size-6 text-xs",
        hoy ? "bg-brand font-semibold text-brand-foreground" : fuera ? "text-muted-foreground/60" : "text-foreground",
        className,
      )}
    >
      {Number(dia.slice(8, 10))}
    </span>
  )
}

/** Mes anterior, siguiente y «Hoy» (solo si no se está en el mes de hoy, con `soloFuera`). */
function PasarMes({ mes, mesDeHoy, onMes, soloFuera }: { mes: string; mesDeHoy: string; onMes: (mes: string) => void; soloFuera?: boolean }) {
  return (
    <div className="ml-auto flex items-center gap-1">
      {(!soloFuera || mes !== mesDeHoy) && (
        <Button variant={soloFuera ? "ghost" : "outline"} size="sm" onClick={() => onMes(mesDeHoy)}>
          Hoy
        </Button>
      )}
      <Button variant="ghost" size="icon-sm" aria-label="Mes anterior" onClick={() => onMes(sumarMeses(mes, -1))}>
        <ChevronLeftIcon />
      </Button>
      <Button variant="ghost" size="icon-sm" aria-label="Mes siguiente" onClick={() => onMes(sumarMeses(mes, 1))}>
        <ChevronRightIcon />
      </Button>
    </div>
  )
}

const porFecha = (eventos: EventoCalendario[]) => {
  const mapa = new Map<string, EventoCalendario[]>()
  for (const e of eventos) mapa.set(e.fecha, [...(mapa.get(e.fecha) ?? []), e])
  // Lo hecho, al final de su día.
  for (const [dia, lista] of mapa) mapa.set(dia, [...lista].sort((a, b) => Number(!!a.hecho) - Number(!!b.hecho)))
  return mapa
}

/** El chip de un evento: abre en la página (`onSelect`), lleva a su sitio (`href`) o solo se lee. */
function ChipEvento({ evento, onSelect, className, children }: { evento: EventoCalendario; onSelect?: (id: string) => void; className: string; children: React.ReactNode }) {
  if (onSelect)
    return (
      <button type="button" className={className} onClick={() => onSelect(evento.id)}>
        {children}
      </button>
    )
  if (evento.href)
    return (
      <Link href={evento.href} className={className}>
        {children}
      </Link>
    )
  return <span className={className}>{children}</span>
}

const MAX_EN_AGENDA = 3

/**
 * Agenda mensual: cada cosa con fecha en su día y con su color (el de su cliente o su tipo). En el
 * ordenador, una cuadrícula; en el móvil, la lista del mes día a día. Con `onSelect` cada evento abre
 * su ficha en la misma página; si no, lleva a su `href`.
 */
export function Agenda({
  eventos,
  hoy,
  onSelect,
  vacio = { title: "Nada este mes", description: "Los elementos con fecha aparecerán aquí." },
  className,
}: {
  eventos: EventoCalendario[]
  hoy: string
  onSelect?: (id: string) => void
  /** Lo que dice el móvil si el mes no tiene nada. */
  vacio?: { title: string; description: string }
  className?: string
}) {
  const hoyFecha = soloFecha(hoy)
  const [mes, setMes] = React.useState(mesDe(hoyFecha))
  const casillas = casillasDelMes(mes)
  const porDia = React.useMemo(() => porFecha(eventos), [eventos])
  const diasConEventos = casillas.filter((d) => mismoMes(d, mes) && (porDia.get(d)?.length ?? 0) > 0)

  const chip = (e: EventoCalendario, compacto = true) => (
    <Tooltip key={e.id}>
      <TooltipTrigger asChild>
        <ChipEvento
          evento={e}
          onSelect={onSelect}
          className={cn(
            "flex min-w-0 items-center gap-1 rounded-md px-1.5 py-0.5 text-left text-[11px] font-medium transition-opacity hover:opacity-80",
            e.color ?? "bg-muted text-muted-foreground",
            e.hecho && "opacity-50 line-through",
            !compacto && "px-2 py-1 text-xs",
          )}
        >
          {e.hecho && <CheckIcon className="size-3 flex-none" />}
          <span className="truncate">{e.titulo}</span>
        </ChipEvento>
      </TooltipTrigger>
      <TooltipContent>{[e.detalle, e.hecho && "hecho"].filter(Boolean).join(" · ") || e.titulo}</TooltipContent>
    </Tooltip>
  )

  return (
    <div data-slot="agenda" className={cn("flex flex-col", className)}>
      <div className="mb-3 flex items-center gap-2">
        <h3 className="text-base font-semibold first-letter:uppercase">{nombreMes(mes)}</h3>
        <PasarMes mes={mes} mesDeHoy={mesDe(hoyFecha)} onMes={setMes} />
      </div>

      <div className="hidden md:block">
        <div className="grid grid-cols-7 border-b pb-1.5 text-center text-[11px] font-medium text-muted-foreground">
          {INICIALES_SEMANA.map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-px overflow-hidden rounded-xl bg-border/60">
          {casillas.map((d) => {
            const delMes = mismoMes(d, mes)
            const lista = porDia.get(d) ?? []
            return (
              <div key={d} className={cn("flex min-h-[104px] flex-col gap-1 bg-card p-1.5", !delMes && "bg-background/70")}>
                <NumeroDia dia={d} hoy={d === hoyFecha} fuera={!delMes} />
                {lista.slice(0, MAX_EN_AGENDA).map((e) => chip(e))}
                {lista.length > MAX_EN_AGENDA && <span className="px-1.5 text-[11px] text-muted-foreground">+{lista.length - MAX_EN_AGENDA} más</span>}
              </div>
            )
          })}
        </div>
      </div>

      <div className="md:hidden">
        {diasConEventos.length === 0 ? (
          <EmptyState title={vacio.title} description={vacio.description} />
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

/** Lo que se escribe en cada día del mini calendario; si hay más, «+N» lleva a ese día en el calendario completo. */
const POR_DIA = 2

/**
 * Calendario pequeño para un resumen, como el mes de Google Calendar: cada día es un bloque con lo
 * que tiene escrito en pequeño, con su color. Crece hasta llenar su bloque. Cada cosa lleva a su
 * sitio; `hrefDia` lleva a un día en el calendario completo («+N»).
 */
export function MiniCalendario({ eventos, hoy, hrefDia, className }: { eventos: EventoCalendario[]; hoy: string; hrefDia?: (dia: string) => string; className?: string }) {
  const hoyFecha = soloFecha(hoy)
  const [mes, setMes] = React.useState(mesDe(hoyFecha))
  const porDia = React.useMemo(() => porFecha(eventos), [eventos])
  // Cinco semanas o seis, las que pida el mes: sin una fila entera del mes siguiente.
  const casillas = casillasDelMes(mes)
  const dias = mismoMes(casillas[35], mes) ? casillas : casillas.slice(0, 35)

  return (
    <div data-slot="mini-calendario" className={cn("flex min-h-0 flex-col", className)}>
      <div className="mb-2 flex items-center gap-1">
        <p className="text-sm font-semibold first-letter:uppercase">{nombreMes(mes)}</p>
        <PasarMes mes={mes} mesDeHoy={mesDe(hoyFecha)} onMes={setMes} soloFuera />
      </div>

      <div className="grid grid-cols-7 pb-1 text-center text-[11px] font-medium text-muted-foreground" aria-hidden>
        {INICIALES_SEMANA.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div className="grid flex-1 auto-rows-[minmax(4rem,1fr)] grid-cols-7 gap-px overflow-hidden rounded-xl bg-border/60">
        {dias.map((d) => {
          const lista = porDia.get(d) ?? []
          const delMes = mismoMes(d, mes)
          const ocultos = lista.length - POR_DIA
          return (
            <div key={d} className={cn("flex min-w-0 flex-col gap-0.5 overflow-hidden p-1", delMes ? "bg-card" : "bg-background/70")}>
              <NumeroDia dia={d} hoy={d === hoyFecha} fuera={!delMes} pequeno />
              {lista.slice(0, POR_DIA).map((e) => (
                <Tooltip key={e.id}>
                  <TooltipTrigger asChild>
                    <ChipEvento evento={e} className={cn("block truncate rounded-[5px] px-1 text-[10px] leading-4 font-medium transition-opacity hover:opacity-80", e.color ?? "bg-muted text-muted-foreground", e.hecho && "line-through opacity-50")}>
                      {e.titulo}
                    </ChipEvento>
                  </TooltipTrigger>
                  <TooltipContent>
                    {e.titulo}
                    <span className="opacity-70">{[e.detalle, e.hecho && "hecho"].filter(Boolean).map((t) => ` · ${t}`)}</span>
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
